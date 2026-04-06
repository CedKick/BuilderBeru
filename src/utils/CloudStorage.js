/**
 * CloudStorage v4 — Cloud-ONLY storage. localStorage is DEAD for game data.
 *
 * NeonDB = the ONLY source of truth. Game data never touches localStorage.
 * All reads/writes for CLOUD_KEYS go through an in-memory cache + cloud sync.
 * localStorage.getItem/setItem are intercepted so existing components work unchanged.
 *
 * Usage:
 *   import { cloudStorage } from '../utils/CloudStorage';
 *   cloudStorage.save('my_key', data);
 *   const data = cloudStorage.loadLocal('my_key');
 *   await cloudStorage.loadCloud('my_key');
 *   await cloudStorage.syncAll();
 */

import { API_URL } from './api.js';

const API_BASE = `${API_URL}/storage`;
const CLIENT_VERSION = 4;
const DEVICE_ID_KEY = 'builderberu_device_id';
const AUTH_TOKEN_KEY = 'builderberu_auth_token';
const HASH_PREFIX = '_cs_h_';
const ETAG_PREFIX = '_cs_etag_';

// ─── In-memory cache — replaces localStorage for all game data ───
const _memoryCache = new Map();

function _computeHash(str) {
  let h = str.length;
  const step = Math.max(1, (str.length / 500) | 0);
  for (let i = 0; i < str.length; i += step) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return str.length + '_' + (h >>> 0).toString(36);
}

async function _gzipBase64(str) {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const blob = new Blob([new TextEncoder().encode(str)]);
    const stream = blob.stream().pipeThrough(new CompressionStream('gzip'));
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    let binary = '';
    for (let i = 0; i < compressed.length; i += 8192) {
      binary += String.fromCharCode.apply(null, compressed.subarray(i, i + 8192));
    }
    return btoa(binary);
  } catch { return null; }
}

const MAX_DROP_LOG = 100;
function _trimData(key, data) {
  if (key !== 'shadow_colosseum_data' || !data || typeof data !== 'object') return data;
  const d = { ...data };
  for (const logKey of ['ragnarokDropLog', 'zephyrDropLog', 'monarchDropLog', 'archDemonDropLog']) {
    if (Array.isArray(d[logKey]) && d[logKey].length > MAX_DROP_LOG) {
      d[logKey] = d[logKey].slice(-MAX_DROP_LOG);
    }
  }
  if (d.rerollCounts && typeof d.rerollCounts === 'object') {
    const liveUids = new Set();
    if (Array.isArray(d.artifactInventory)) {
      for (const a of d.artifactInventory) { if (a && a.uid) liveUids.add(a.uid); }
    }
    if (d.artifacts && typeof d.artifacts === 'object') {
      for (const slots of Object.values(d.artifacts)) {
        if (slots && typeof slots === 'object') {
          for (const a of Object.values(slots)) { if (a && a.uid) liveUids.add(a.uid); }
        }
      }
    }
    const trimmed = {};
    for (const [uid, count] of Object.entries(d.rerollCounts)) {
      if (liveUids.has(uid)) trimmed[uid] = count;
    }
    d.rerollCounts = trimmed;
  }
  return d;
}

function _getAuthHeaders() {
  const proto = Storage.prototype;
  const token = proto.getItem.call(localStorage, AUTH_TOKEN_KEY);
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

// Keys that live ONLY in cloud + RAM. Never in localStorage.
export const CLOUD_KEYS = [
  'builderberu_users',
  'shadow_colosseum_data',
  'shadow_colosseum_raid',
  'beru_chibi_collection',
  'beru_companions',
  'beru_mascot_visible',
  'beruvianbeta_users',
  'builderberu_shadow_coins',
  'shadow_achievements',
  'builderberu_easter_eggs',
  'builderberu_easter_progress',
  'lorestory_completed',
  'hallofflame_cache',
  'pvp_data',
];

function getDeviceId() {
  const proto = Storage.prototype;
  let id = proto.getItem.call(localStorage, DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + crypto.randomUUID();
    proto.setItem.call(localStorage, DEVICE_ID_KEY, id);
  }
  return id;
}

const _syncTimers = {};
const SYNC_DELAY = 30000;
const SYNC_THROTTLE = 120000;
const SYNC_DEADLINE = 60000;
const SAVE_SYNC_THROTTLE = 15000;
const _lastSyncTime = {};

class CloudStorageManager {
  constructor() {
    this._initialized = false;
    this._online = true;
    this._syncQueue = new Set();
    this._cloudSizes = {};
    this._cloudTimestamps = {};
    this._readyPromise = null;
    this._readyResolve = null;
    this._pendingData = new Map();
    this._restoring = false;
    this._forceKeys = new Set();
    this._lastSyncHash = {};
    const proto = Storage.prototype;
    for (const key of CLOUD_KEYS) {
      try { const h = proto.getItem.call(localStorage, HASH_PREFIX + key); if (h) this._lastSyncHash[key] = h; } catch {}
    }
    this._syncStatus = {};
    this._statusListeners = new Set();
    this._crossTabListeners = new Set();
  }

  whenReady() {
    if (this._initialized) return Promise.resolve();
    if (!this._readyPromise) {
      this._readyPromise = new Promise(resolve => {
        this._readyResolve = resolve;
      });
    }
    return this._readyPromise;
  }

  /** Save data to RAM cache + schedule cloud sync. Zero localStorage. */
  save(key, data) {
    if (CLOUD_KEYS.includes(key)) {
      if (!this._initialized) return;
      _memoryCache.set(key, data);
      this._pendingData.set(key, data);
      this._scheduleSync(key);
      return;
    }
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  }

  forceSave(key, data) {
    const json = JSON.stringify(data);
    this._cloudSizes[key] = json.length;
    _memoryCache.set(key, data);
    this._pendingData.set(key, data);
    this._forceKeys.add(key);
    delete this._lastSyncHash[key];
    const proto = Storage.prototype;
    try { proto.removeItem.call(localStorage, HASH_PREFIX + key); } catch {}
    try { proto.removeItem.call(localStorage, ETAG_PREFIX + key); proto.removeItem.call(localStorage, ETAG_PREFIX + '_all'); } catch {}
  }

  async forceSaveAndSync(key, data) {
    this.forceSave(key, data);
    try {
      this._setSyncStatus(key, 'syncing');
      const trimmed = _trimData(key, data);
      const jsonStr = JSON.stringify(trimmed);
      const deviceId = getDeviceId();

      let body;
      if (jsonStr.length > 5000) {
        const compressed = await _gzipBase64(jsonStr);
        if (compressed && compressed.length < jsonStr.length * 0.9) {
          body = JSON.stringify({ deviceId: deviceId, key: key, compressed: 'gzip', payload: compressed, forceOverwrite: true, clientVersion: CLIENT_VERSION });
        }
      }
      if (!body) {
        body = JSON.stringify({ deviceId: deviceId, key: key, data: trimmed, forceOverwrite: true, clientVersion: CLIENT_VERSION });
      }

      const resp = await fetch(API_BASE + '/save', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, _getAuthHeaders()),
        body: body,
      });

      if (!resp.ok) {
        this._setSyncStatus(key, 'error');
        return false;
      }

      const json = await resp.json();
      this._cloudSizes[key] = json.size || jsonStr.length;
      if (json.serverTimestamp) this._cloudTimestamps[key] = json.serverTimestamp;
      this._pendingData.delete(key);
      const dataHash = _computeHash(jsonStr);
      this._lastSyncHash[key] = dataHash;
      const proto = Storage.prototype;
      try { proto.setItem.call(localStorage, HASH_PREFIX + key, dataHash); } catch {}
      try { proto.removeItem.call(localStorage, ETAG_PREFIX + key); proto.removeItem.call(localStorage, ETAG_PREFIX + '_all'); } catch {}
      _lastSyncTime[key] = Date.now();
      this._setSyncStatus(key, 'synced');
      console.log('[CloudStorage v4] Force sync OK for "' + key + '" (' + jsonStr.length + 'B)');
      return true;
    } catch (err) {
      this._setSyncStatus(key, 'error');
      return false;
    }
  }

  async saveAndSync(key, data) {
    this.save(key, data);
    if (CLOUD_KEYS.includes(key)) {
      const lastSync = _lastSyncTime[key] || 0;
      if (Date.now() - lastSync < SAVE_SYNC_THROTTLE) {
        this._scheduleSync(key);
        return;
      }
      return this.syncKey(key);
    }
  }

  /** Load from RAM cache (synchronous). */
  loadLocal(key) {
    if (CLOUD_KEYS.includes(key)) {
      const pending = this._pendingData.get(key);
      if (pending !== undefined) return pending;
      const cached = _memoryCache.get(key);
      if (cached !== undefined) return cached;
      return null;
    }
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async loadFresh(key) {
    const pending = this._pendingData.get(key);
    if (pending) return pending;
    const cached = _memoryCache.get(key);
    if (cached !== undefined) return cached;
    return this.loadCloud(key);
  }

  async loadCloud(key) {
    try {
      const deviceId = getDeviceId();
      const headers = Object.assign({}, _getAuthHeaders());
      const proto = Storage.prototype;
      const cachedEtag = proto.getItem.call(localStorage, ETAG_PREFIX + key);
      if (cachedEtag) headers['If-None-Match'] = cachedEtag;

      const resp = await fetch(API_BASE + '/load?deviceId=' + encodeURIComponent(deviceId) + '&key=' + encodeURIComponent(key), { headers: headers });

      if (resp.status === 304) {
        this._online = true;
        return _memoryCache.get(key) || null;
      }
      if (!resp.ok) return null;

      const etag = resp.headers.get('ETag');
      if (etag) { try { proto.setItem.call(localStorage, ETAG_PREFIX + key, etag); } catch {} }

      const json = await resp.json();
      if (json.suspended) {
        try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'suspended', message: json.beruMessage || json.suspendedReason, reason: json.suspendedReason } })); } catch {}
      }
      if (json.success && json.data !== null) {
        _memoryCache.set(key, json.data);
        return json.data;
      }
      return null;
    } catch (err) {
      console.warn('[CloudStorage v4] Cloud load failed for', key, err.message);
      this._online = false;
      return null;
    }
  }

  async loadAllCloud() {
    try {
      const deviceId = getDeviceId();
      const headers = Object.assign({}, _getAuthHeaders());
      const proto = Storage.prototype;
      const cachedEtag = proto.getItem.call(localStorage, ETAG_PREFIX + '_all');
      if (cachedEtag) headers['If-None-Match'] = cachedEtag;

      const resp = await fetch(API_BASE + '/load?deviceId=' + encodeURIComponent(deviceId), { headers: headers });

      if (resp.status === 304) {
        this._online = true;
        return '_not_modified_';
      }
      if (!resp.ok) return null;

      const etag = resp.headers.get('ETag');
      if (etag) { try { proto.setItem.call(localStorage, ETAG_PREFIX + '_all', etag); } catch {} }

      const json = await resp.json();
      if (json.success) {
        this._online = true;
        if (json.suspended) {
          try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'suspended', message: json.beruMessage || json.suspendedReason, reason: json.suspendedReason } })); } catch {}
        }
        return json.entries || {};
      }
      return null;
    } catch (err) {
      console.warn('[CloudStorage v4] Cloud loadAll failed:', err.message);
      this._online = false;
      return null;
    }
  }

  /**
   * Initial sync: Load cloud data into RAM cache.
   * Purges any leftover game data from localStorage (migration).
   */
  async initialSync() {
    if (this._initialized) return;

    const proto = Storage.prototype;
    const loginPending = proto.getItem.call(localStorage, 'builderberu_login_pending');
    if (loginPending) {
      proto.removeItem.call(localStorage, 'builderberu_login_pending');
    }

    // Purge leftover game data from localStorage (migration from v3)
    for (const key of CLOUD_KEYS) {
      try { proto.removeItem.call(localStorage, key); } catch {}
    }

    const cloudEntries = await this.loadAllCloud();
    if (!cloudEntries) {
      console.warn('[CloudStorage v4] Offline — no cloud data available');
      this._initialized = true;
      if (this._readyResolve) this._readyResolve();
      return;
    }
    if (cloudEntries === '_not_modified_') {
      this._initialized = true;
      if (this._readyResolve) this._readyResolve();
      console.log('[CloudStorage v4] Initial sync: 304 Not Modified');
      try { window.dispatchEvent(new CustomEvent('cloud-sync-ready')); } catch {}
      return;
    }

    // Cloud data → RAM cache ONLY
    this._restoring = true;
    for (const [key, entry] of Object.entries(cloudEntries)) {
      const cloudJson = JSON.stringify(entry.data);
      this._cloudSizes[key] = cloudJson.length;
      if (entry.updatedAt) this._cloudTimestamps[key] = new Date(entry.updatedAt).getTime();

      const cloudHash = _computeHash(cloudJson);
      this._lastSyncHash[key] = cloudHash;
      try { proto.setItem.call(localStorage, HASH_PREFIX + key, cloudHash); } catch {}

      if (this._forceKeys.has(key)) {
        console.log('[CloudStorage v4] Skipping cloud restore for "' + key + '" — recently force-saved');
      } else {
        _memoryCache.set(key, entry.data);
      }
    }
    this._restoring = false;

    this._initialized = true;
    if (this._readyResolve) this._readyResolve();
    console.log('[CloudStorage v4] Initial sync complete — cloud data in RAM only, localStorage purged');
    try { window.dispatchEvent(new CustomEvent('cloud-sync-ready')); } catch {}
  }

  async resync() {
    this._initialized = false;
    _memoryCache.clear();
    await this.initialSync();
  }

  async initSchema() {
    try {
      const resp = await fetch(API_BASE + '/init', { method: 'POST' });
      const json = await resp.json();
      return json.success;
    } catch { return false; }
  }

  /** Push key to cloud. Reads from RAM only. */
  async syncKey(key) {
    try {
      this._setSyncStatus(key, 'syncing');
      const rawData = this._pendingData.get(key) || _memoryCache.get(key) || null;
      if (rawData === null) {
        this._setSyncStatus(key, 'synced');
        return false;
      }

      const data = _trimData(key, rawData);
      const jsonStr = JSON.stringify(data);
      const dataHash = _computeHash(jsonStr);
      if (this._lastSyncHash[key] === dataHash) {
        this._pendingData.delete(key);
        this._setSyncStatus(key, 'synced');
        return true;
      }

      const deviceId = getDeviceId();
      const clientTimestamp = this._cloudTimestamps[key] || null;

      let body;
      if (jsonStr.length > 5000) {
        const compressed = await _gzipBase64(jsonStr);
        if (compressed && compressed.length < jsonStr.length * 0.9) {
          body = JSON.stringify({ deviceId: deviceId, key: key, compressed: 'gzip', payload: compressed, clientTimestamp: clientTimestamp, clientVersion: CLIENT_VERSION });
        }
      }
      if (!body) {
        body = JSON.stringify({ deviceId: deviceId, key: key, data: data, clientTimestamp: clientTimestamp, clientVersion: CLIENT_VERSION });
      }

      const resp = await fetch(API_BASE + '/save', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, _getAuthHeaders()),
        body: body,
      });

      if (resp.status === 403) {
        const errJson = await resp.json().catch(function() { return {}; });
        if (errJson.suspended) {
          try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'suspended', message: errJson.beruMessage || errJson.reason, reason: errJson.reason } })); } catch {}
          this._setSyncStatus(key, 'error');
          return false;
        }
      }
      if (resp.status === 409) {
        const errJson = await resp.json().catch(function() { return {}; });
        console.warn('[CloudStorage v4] Server rejected sync for "' + key + '":', errJson.reason || errJson.error);
        this._setSyncStatus(key, 'error');
        return false;
      }
      if (!resp.ok) throw new Error('HTTP ' + resp.status);

      const json = await resp.json();
      this._online = true;
      this._cloudSizes[key] = json.size || jsonStr.length;
      if (json.serverTimestamp) this._cloudTimestamps[key] = json.serverTimestamp;
      if (json.merged) console.log('[CloudStorage v4] Server MERGED "' + key + '"');
      if (json.cheatWarning) {
        try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'cheat-warning', message: json.cheatWarning.beruMessage, score: json.cheatWarning.score } })); } catch {}
      }

      this._pendingData.delete(key);
      this._lastSyncHash[key] = dataHash;
      const proto = Storage.prototype;
      try { proto.setItem.call(localStorage, HASH_PREFIX + key, dataHash); } catch {}
      try { proto.removeItem.call(localStorage, ETAG_PREFIX + key); proto.removeItem.call(localStorage, ETAG_PREFIX + '_all'); } catch {}
      _lastSyncTime[key] = Date.now();
      this._setSyncStatus(key, 'synced');
      return json.success;
    } catch (err) {
      console.warn('[CloudStorage v4] Sync failed for', key, err.message);
      this._online = false;
      this._syncQueue.add(key);
      this._setSyncStatus(key, 'error');
      return false;
    }
  }

  async syncAll() {
    const promises = CLOUD_KEYS.map(function(key) {
      if (this._pendingData.has(key) || _memoryCache.has(key)) return this.syncKey(key);
      return Promise.resolve(false);
    }.bind(this));
    await Promise.allSettled(promises);
  }

  _setSyncStatus(key, status) {
    if (this._syncStatus[key] === status) return;
    this._syncStatus[key] = status;
    for (const cb of this._statusListeners) { try { cb(key, status); } catch {} }
  }

  onSyncStatus(callback) {
    this._statusListeners.add(callback);
    return function() { this._statusListeners.delete(callback); }.bind(this);
  }

  getSyncStatus(key) { return this._syncStatus[key] || 'synced'; }

  onCrossTabUpdate(callback) {
    this._crossTabListeners.add(callback);
    return function() { this._crossTabListeners.delete(callback); }.bind(this);
  }

  _scheduleSync(key) {
    this._syncQueue.add(key);
    if (!this._firstDirtyTime) this._firstDirtyTime = {};
    if (!this._firstDirtyTime[key]) this._firstDirtyTime[key] = Date.now();

    if (_syncTimers[key]) clearTimeout(_syncTimers[key]);

    const lastSync = _lastSyncTime[key] || 0;
    const elapsed = Date.now() - lastSync;
    let delay = elapsed < SYNC_THROTTLE
      ? Math.max(SYNC_DELAY, SYNC_THROTTLE - elapsed)
      : SYNC_DELAY;

    const dirtyDuration = Date.now() - this._firstDirtyTime[key];
    if (dirtyDuration >= SYNC_DEADLINE) {
      delay = 0;
    } else {
      delay = Math.min(delay, SYNC_DEADLINE - dirtyDuration);
    }

    const self = this;
    _syncTimers[key] = setTimeout(function() {
      delete _syncTimers[key];
      delete self._firstDirtyTime[key];
      self.syncKey(key);
    }, delay);
  }

  async _flushQueue() {
    const keys = [...this._syncQueue];
    this._syncQueue.clear();
    const self = this;
    await Promise.allSettled(keys.map(function(k) { return self.syncKey(k); }));
  }

  /**
   * Intercept localStorage for CLOUD_KEYS → RAM cache.
   * All existing components that do localStorage.getItem('shadow_colosseum_data')
   * transparently get data from RAM. All writes go to RAM + cloud. Zero disk.
   */
  installAutoSync() {
    if (this._autoSyncInstalled) return;
    this._autoSyncInstalled = true;

    const originalSet = Storage.prototype.setItem;
    const originalGet = Storage.prototype.getItem;
    const originalRemove = Storage.prototype.removeItem;
    const self = this;

    // ─── Intercept setItem ────────────────────────────────
    Storage.prototype.setItem = function(key, value) {
      if (CLOUD_KEYS.includes(key)) {
        // Block writes before cloud data loaded
        if (!self._initialized && !self._restoring) return;
        if (self._initialized) {
          try {
            var parsed = JSON.parse(value);
            _memoryCache.set(key, parsed);
            self._pendingData.set(key, parsed);
            self._scheduleSync(key);
          } catch {}
        }
        return; // NEVER falls through to real localStorage
      }
      return originalSet.call(this, key, value);
    };

    // ─── Intercept getItem ────────────────────────────────
    Storage.prototype.getItem = function(key) {
      if (CLOUD_KEYS.includes(key)) {
        var pending = self._pendingData.get(key);
        if (pending !== undefined) return JSON.stringify(pending);
        var cached = _memoryCache.get(key);
        if (cached !== undefined) return JSON.stringify(cached);
        return null;
      }
      return originalGet.call(this, key);
    };

    // ─── Intercept removeItem ─────────────────────────────
    Storage.prototype.removeItem = function(key) {
      if (CLOUD_KEYS.includes(key)) {
        _memoryCache.delete(key);
        self._pendingData.delete(key);
        return;
      }
      return originalRemove.call(this, key);
    };

    // ─── Safety nets ─────────────────────────────────────

    // beforeunload — flush pending syncs
    window.addEventListener('beforeunload', function() {
      var keysToSync = new Set([...self._syncQueue, ...self._pendingData.keys()]);
      if (keysToSync.size === 0) return;
      var deviceId = getDeviceId();

      for (var key of keysToSync) {
        var rawData = self._pendingData.get(key) || _memoryCache.get(key);
        if (rawData === null || rawData === undefined) continue;
        var data = _trimData(key, rawData);
        var clientTimestamp = self._cloudTimestamps[key] || null;
        var payload = JSON.stringify({ deviceId: deviceId, key: key, data: data, clientTimestamp: clientTimestamp, clientVersion: CLIENT_VERSION });
        var blob = new Blob([payload], { type: 'application/json' });
        if (blob.size > 60000) {
          fetch(API_BASE + '/save', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, _getAuthHeaders()),
            body: blob,
            keepalive: true,
          }).catch(function() {});
        } else {
          navigator.sendBeacon(API_BASE + '/save', blob);
        }
      }
      self._syncQueue.clear();
      self._pendingData.clear();
    });

    // visibilitychange — sync when switching tab
    document.addEventListener('visibilitychange', function() {
      if (document.hidden && self._initialized && (self._syncQueue.size > 0 || self._pendingData.size > 0)) {
        self._flushQueue();
      }
    });

    // Periodic sync every 5 min
    setInterval(function() {
      if (self._initialized && (self._syncQueue.size > 0 || self._pendingData.size > 0)) {
        self._flushQueue();
      }
    }, 300000);
  }

  get isOnline() { return this._online; }
  get deviceId() { return getDeviceId(); }
}

export const cloudStorage = new CloudStorageManager();

// Install interceptors immediately — before any component mounts
cloudStorage.installAutoSync();

// Debug console access
window.cloudStorage = cloudStorage;
