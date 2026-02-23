/**
 * CloudStorage — Hybrid localStorage + Neon PostgreSQL backend
 *
 * NeonDB = source of truth. localStorage = optional cache.
 * If localStorage is full (QuotaExceeded), data still reaches the cloud via _pendingData.
 *
 * Usage:
 *   import { cloudStorage } from '../utils/CloudStorage';
 *   cloudStorage.save('my_key', data);        // saves to localStorage + queues cloud sync
 *   const data = cloudStorage.loadLocal('my_key');  // instant from localStorage
 *   await cloudStorage.loadCloud('my_key');    // fetch from cloud
 *   await cloudStorage.syncAll();              // push all tracked keys to cloud
 */

const API_BASE = '/api/storage';
const CLIENT_VERSION = 2; // Bump when deploying network-critical changes (track old vs new clients)
const DEVICE_ID_KEY = 'builderberu_device_id';
const AUTH_TOKEN_KEY = 'builderberu_auth_token';
const TRACKED_KEYS_KEY = 'builderberu_cloud_keys';

// Get auth headers if user is logged in (reads directly from localStorage to avoid circular imports)
function _getAuthHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Keys that should be synced to the cloud
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
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// Debounce map: key -> timeout
const _syncTimers = {};
const SYNC_DELAY = 30000; // 30s debounce (was 3s — reduced to save network transfer)
const SYNC_THROTTLE = 120000; // 2 min minimum between syncs per key (auto-farming protection)
const SAVE_SYNC_THROTTLE = 15000; // 15s smart throttle for saveAndSync — if synced recently, schedule instead of force
const _lastSyncTime = {}; // key → timestamp of last successful sync

class CloudStorageManager {
  constructor() {
    this._initialized = false;
    this._online = true;
    this._syncQueue = new Set();
    this._cloudSizes = {}; // Track cloud data sizes to prevent corruption
    this._cloudTimestamps = {}; // Track cloud updated_at timestamps for concurrency
    this._readyPromise = null;
    this._readyResolve = null;
    this._pendingData = new Map(); // key → fresh data (backup when localStorage fails)
    this._lastSyncHash = {};       // key → hash of last synced data (dirty detection)
    this._syncStatus = {};         // key → 'synced' | 'syncing' | 'error' | 'pending'
    this._statusListeners = new Set();
    this._crossTabListeners = new Set();
  }

  /** Returns a promise that resolves when initialSync is complete */
  whenReady() {
    if (this._initialized) return Promise.resolve();
    if (!this._readyPromise) {
      this._readyPromise = new Promise(resolve => {
        this._readyResolve = resolve;
      });
    }
    return this._readyPromise;
  }

  /** Save data to localStorage (cache) + schedule cloud sync. Cloud sync works even if localStorage is full. */
  save(key, data) {
    const json = JSON.stringify(data);

    // Store in pendingData BEFORE localStorage attempt — ensures cloud sync has fresh data
    if (CLOUD_KEYS.includes(key)) {
      this._pendingData.set(key, data);
    }

    // Try localStorage (optional cache)
    try {
      localStorage.setItem(key, json);
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('[CloudStorage] Quota exceeded for', key, '— freeing space');
        this._freeSpace(key);
        try { localStorage.setItem(key, json); } catch {}
      }
    }

    // Schedule cloud sync — ALWAYS, even if localStorage failed
    if (CLOUD_KEYS.includes(key)) {
      this._scheduleSync(key);
    }
  }

  /** Save + sync to cloud. Uses smart throttle: if synced <15s ago, schedules instead of forcing.
   *  localStorage is ALWAYS saved instantly. Cloud sync is the only thing throttled.
   *  beforeunload catches any pending syncs on tab close — zero data loss. */
  async saveAndSync(key, data) {
    this.save(key, data);
    if (CLOUD_KEYS.includes(key)) {
      const lastSync = _lastSyncTime[key] || 0;
      if (Date.now() - lastSync < SAVE_SYNC_THROTTLE) {
        // Synced recently — schedule instead of forcing (localStorage has the data)
        this._scheduleSync(key);
        return;
      }
      return this.syncKey(key);
    }
  }

  /** Load from localStorage (synchronous, instant) */
  loadLocal(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Load freshest data: pendingData (in-memory) > localStorage > cloud. Always returns the most up-to-date version. */
  async loadFresh(key) {
    // 1. In-memory pending data (most recent, not yet synced)
    const pending = this._pendingData.get(key);
    if (pending) return pending;

    // 2. localStorage cache
    const local = this.loadLocal(key);
    if (local) return local;

    // 3. Cloud (last resort — async fetch)
    return this.loadCloud(key);
  }

  /** Load from cloud backend */
  async loadCloud(key) {
    try {
      const deviceId = getDeviceId();
      const resp = await fetch(`${API_BASE}/load?deviceId=${encodeURIComponent(deviceId)}&key=${encodeURIComponent(key)}`, {
        headers: { ..._getAuthHeaders() },
      });
      if (!resp.ok) return null;
      const json = await resp.json();
      if (json.success && json.data !== null) {
        return json.data;
      }
      return null;
    } catch (err) {
      console.warn('[CloudStorage] Cloud load failed for', key, err.message);
      this._online = false;
      return null;
    }
  }

  /** Load all keys from cloud for this device */
  async loadAllCloud() {
    try {
      const deviceId = getDeviceId();
      const resp = await fetch(`${API_BASE}/load?deviceId=${encodeURIComponent(deviceId)}`, {
        headers: { ..._getAuthHeaders() },
      });
      if (!resp.ok) return null;
      const json = await resp.json();
      if (json.success) {
        this._online = true;
        return json.entries || {};
      }
      return null;
    } catch (err) {
      console.warn('[CloudStorage] Cloud loadAll failed:', err.message);
      this._online = false;
      return null;
    }
  }

  /**
   * Full sync on app startup:
   * - Load all cloud data
   * - For each key: use whichever is newer (cloud vs local)
   * - Push any local-only data to cloud
   */
  async initialSync() {
    if (this._initialized) return;

    // Check if this reload comes from a login — cloud should ALWAYS win
    const loginPending = localStorage.getItem('builderberu_login_pending');
    if (loginPending) {
      localStorage.removeItem('builderberu_login_pending');
    }

    const cloudEntries = await this.loadAllCloud();
    if (!cloudEntries) {
      // Offline — just use localStorage
      this._initialized = true;
      if (this._readyResolve) this._readyResolve();
      return;
    }

    // Merge cloud data into localStorage
    for (const [key, entry] of Object.entries(cloudEntries)) {
      // Track cloud sizes + timestamps for anti-corruption checks
      const cloudJson = JSON.stringify(entry.data);
      this._cloudSizes[key] = cloudJson.length;
      if (entry.updatedAt) this._cloudTimestamps[key] = new Date(entry.updatedAt).getTime();

      const localRaw = localStorage.getItem(key);
      if (loginPending || !localRaw) {
        // Login pending: cloud ALWAYS wins (cross-device sync)
        // No local data: cloud fills the gap
        try {
          localStorage.setItem(key, cloudJson);
        } catch { /* ignore quota errors during sync */ }
      } else {
        // Normal reload: if local data is suspiciously smaller than cloud,
        // cloud wins (likely corruption from cache clear)
        const localSize = localRaw.length;
        const cloudSize = cloudJson.length;
        if (cloudSize > 200 && localSize < cloudSize * 0.3) {
          console.warn(`[CloudStorage] Local data for "${key}" is suspiciously small (${localSize}B vs cloud ${cloudSize}B) — restoring from cloud`);
          try {
            localStorage.setItem(key, cloudJson);
          } catch { /* ignore quota errors */ }
        } else if (key === 'shadow_colosseum_data') {
          // Always protect server-deposited fields (alkahest, rerollCounts)
          // These can be written by game-server while client has stale local data
          try {
            const localData = JSON.parse(localRaw);
            const cloudData = entry.data;
            let patched = false;
            if ((cloudData.alkahest || 0) > (localData.alkahest || 0)) {
              localData.alkahest = cloudData.alkahest;
              patched = true;
            }
            const cloudRC = cloudData.rerollCounts || {};
            const localRC = localData.rerollCounts || {};
            for (const [uid, count] of Object.entries(cloudRC)) {
              if ((count || 0) > (localRC[uid] || 0)) {
                localRC[uid] = count;
                patched = true;
              }
            }
            if (patched) {
              localData.rerollCounts = localRC;
              localStorage.setItem(key, JSON.stringify(localData));
              console.log(`[CloudStorage] Patched server fields for "${key}": alkahest=${localData.alkahest}`);
            }
          } catch { /* ignore parse errors */ }
        }
      }
    }

    // Push all tracked local keys to cloud (in case cloud is behind)
    // But NOT during a login — we just pulled cloud data, don't push back stale local
    if (!loginPending) {
      for (const key of CLOUD_KEYS) {
        const localRaw = localStorage.getItem(key);
        if (localRaw && !cloudEntries[key]) {
          this._syncQueue.add(key);
        }
      }

      // Flush queue
      if (this._syncQueue.size > 0) {
        this._flushQueue();
      }
    }

    this._initialized = true;
    if (this._readyResolve) this._readyResolve();
    console.log('[CloudStorage] Initial sync complete', loginPending ? '(login mode — cloud wins)' : '(normal)');
  }

  /**
   * Force re-sync after login (new deviceId).
   * Pulls all cloud data for the canonical deviceId into localStorage.
   */
  async resync() {
    this._initialized = false;
    await this.initialSync();
  }

  /** Initialize the database schema (call once on first deploy) */
  async initSchema() {
    try {
      const resp = await fetch(`${API_BASE}/init`, { method: 'POST' });
      const json = await resp.json();
      return json.success;
    } catch (err) {
      console.error('[CloudStorage] Schema init failed:', err);
      return false;
    }
  }

  /** Push a specific key to cloud NOW. Uses _pendingData (freshest) or falls back to localStorage. */
  async syncKey(key) {
    try {
      this._setSyncStatus(key, 'syncing');

      // Prefer pending data (freshest), fall back to localStorage
      const data = this._pendingData.get(key) ?? this.loadLocal(key);
      if (data === null) {
        this._setSyncStatus(key, 'synced');
        return false;
      }

      // Dirty check: skip sync if data hasn't changed since last successful sync
      const jsonStr = JSON.stringify(data);
      const dataHash = jsonStr.length + ':' + jsonStr.slice(0, 100) + jsonStr.slice(-100);
      if (this._lastSyncHash[key] === dataHash) {
        this._pendingData.delete(key);
        this._setSyncStatus(key, 'synced');
        return true; // Already synced, skip
      }

      // Anti-corruption: refuse to overwrite cloud with much smaller data
      const localSize = jsonStr.length;
      const cloudSize = this._cloudSizes[key] || 0;
      if (cloudSize > 200 && localSize < cloudSize * 0.3) {
        console.warn(`[CloudStorage] BLOCKED sync for "${key}": local (${localSize}B) is much smaller than cloud (${cloudSize}B) — possible data corruption`);
        this._setSyncStatus(key, 'error');
        return false;
      }

      const deviceId = getDeviceId();
      const clientTimestamp = this._cloudTimestamps[key] || null;
      const body = JSON.stringify({ deviceId, key, data, clientTimestamp, clientVersion: CLIENT_VERSION });
      const resp = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ..._getAuthHeaders() },
        body,
      });

      if (resp.status === 409) {
        // Server blocked: data corruption or stale timestamp
        const errJson = await resp.json().catch(() => ({}));
        console.warn(`[CloudStorage] Server BLOCKED sync for "${key}":`, errJson.reason || errJson.error);
        this._setSyncStatus(key, 'error');
        return false;
      }

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      this._online = true;
      // Update tracked cloud size + timestamp after successful sync
      this._cloudSizes[key] = json.size || localSize;
      if (json.serverTimestamp) this._cloudTimestamps[key] = json.serverTimestamp;
      // If server merged our data with another session's, log it
      if (json.merged) {
        console.log(`[CloudStorage] Server MERGED "${key}" — concurrent session detected`);
      }
      // Clear pending data + update dirty hash + throttle timestamp after successful sync
      this._pendingData.delete(key);
      this._lastSyncHash[key] = dataHash;
      _lastSyncTime[key] = Date.now();
      this._setSyncStatus(key, 'synced');
      return json.success;
    } catch (err) {
      console.warn('[CloudStorage] Sync failed for', key, err.message);
      this._online = false;
      this._syncQueue.add(key);
      this._setSyncStatus(key, 'error');
      return false;
    }
  }

  /** Push all tracked keys to cloud */
  async syncAll() {
    const promises = CLOUD_KEYS.map(key => {
      const hasPending = this._pendingData.has(key);
      const raw = localStorage.getItem(key);
      if (hasPending || raw) return this.syncKey(key);
      return Promise.resolve(false);
    });
    await Promise.allSettled(promises);
  }

  // ─── Sync Status ──────────────────────────────────────────

  _setSyncStatus(key, status) {
    if (this._syncStatus[key] === status) return;
    this._syncStatus[key] = status;
    for (const cb of this._statusListeners) {
      try { cb(key, status); } catch {}
    }
  }

  /** Subscribe to sync status changes. Returns unsubscribe function. */
  onSyncStatus(callback) {
    this._statusListeners.add(callback);
    return () => this._statusListeners.delete(callback);
  }

  /** Get current sync status for a key */
  getSyncStatus(key) {
    return this._syncStatus[key] || 'synced';
  }

  /** Subscribe to cross-tab data changes. Returns unsubscribe function. */
  onCrossTabUpdate(callback) {
    this._crossTabListeners.add(callback);
    return () => this._crossTabListeners.delete(callback);
  }

  // ─── Private ─────────────────────────────────────────────

  _scheduleSync(key) {
    this._syncQueue.add(key);
    if (_syncTimers[key]) clearTimeout(_syncTimers[key]);

    // Throttle: if we synced this key recently, delay until throttle period expires
    const lastSync = _lastSyncTime[key] || 0;
    const elapsed = Date.now() - lastSync;
    const delay = elapsed < SYNC_THROTTLE
      ? Math.max(SYNC_DELAY, SYNC_THROTTLE - elapsed) // Wait until throttle expires
      : SYNC_DELAY; // Normal debounce

    _syncTimers[key] = setTimeout(() => {
      delete _syncTimers[key];
      this.syncKey(key);
    }, delay);
  }

  async _flushQueue() {
    const keys = [...this._syncQueue];
    this._syncQueue.clear();
    await Promise.allSettled(keys.map(k => this.syncKey(k)));
  }

  _freeSpace(priorityKey) {
    // Remove non-critical keys to free space
    const expendable = [
      'hallofflame_cache',
      'beruvianbeta_users',
      'builderberu_easter_progress',
      'builderberu_easter_eggs',
    ];
    for (const key of expendable) {
      if (key !== priorityKey) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Intercept localStorage.setItem for tracked keys.
   * Any save to a CLOUD_KEYS key automatically schedules a cloud sync.
   * Stores data in _pendingData so cloud sync works even if localStorage is full.
   */
  installAutoSync() {
    if (this._autoSyncInstalled) return;
    this._autoSyncInstalled = true;

    const original = localStorage.setItem.bind(localStorage);
    const self = this;

    localStorage.setItem = function (key, value) {
      // Store in pendingData for reliable cloud sync (before localStorage attempt)
      if (CLOUD_KEYS.includes(key) && self._initialized) {
        try { self._pendingData.set(key, JSON.parse(value)); } catch {}
      }

      // Try localStorage (cache)
      try {
        original(key, value);
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn('[CloudStorage] QuotaExceeded on', key, '— freeing space');
          self._freeSpace(key);
          try { original(key, value); } catch {}
        }
      }

      // Schedule cloud sync for tracked keys — ONLY after initialSync is done
      if (CLOUD_KEYS.includes(key) && self._initialized) {
        self._scheduleSync(key);
      }
    };

    // ─── Safety nets: never lose progression ─────────────────

    // 1. beforeunload — flush pending syncs when closing browser/tab
    //    Uses sendBeacon or keepalive fetch for reliability
    window.addEventListener('beforeunload', () => {
      const keysToSync = new Set([...self._syncQueue, ...self._pendingData.keys()]);
      if (keysToSync.size === 0) return;
      const deviceId = getDeviceId();

      for (const key of keysToSync) {
        // Prefer pending data (freshest), fall back to localStorage
        const data = self._pendingData.get(key) ?? self.loadLocal(key);
        if (data === null) continue;

        // Anti-corruption: don't beacon corrupted data
        const localSize = JSON.stringify(data).length;
        const cloudSize = self._cloudSizes[key] || 0;
        if (cloudSize > 200 && localSize < cloudSize * 0.3) {
          console.warn(`[CloudStorage] BLOCKED beacon for "${key}": possible corruption`);
          continue;
        }

        const clientTimestamp = self._cloudTimestamps[key] || null;
        const blob = new Blob([JSON.stringify({ deviceId, key, data, clientTimestamp, clientVersion: CLIENT_VERSION })], { type: 'application/json' });
        if (blob.size > 60000) {
          // Too large for sendBeacon (~64KB limit) → use keepalive fetch
          fetch(`${API_BASE}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ..._getAuthHeaders() },
            body: blob,
            keepalive: true,
          }).catch(() => {});
        } else {
          navigator.sendBeacon(`${API_BASE}/save`, blob);
        }
      }
      self._syncQueue.clear();
      self._pendingData.clear();
    });

    // 2. visibilitychange — sync when user switches tab or minimizes mobile browser
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && self._initialized && (self._syncQueue.size > 0 || self._pendingData.size > 0)) {
        self._flushQueue();
      }
    });

    // 3. Periodic sync every 5 min — safety net (was 60s)
    setInterval(() => {
      if (self._initialized && (self._syncQueue.size > 0 || self._pendingData.size > 0)) {
        self._flushQueue();
      }
    }, 900000); // 15 min periodic safety net (was 5 min)

    // 4. Cross-tab sync — detect when another tab writes to localStorage
    //    (storage event only fires in OTHER tabs, not the one that wrote)
    window.addEventListener('storage', (e) => {
      if (!e.key || !CLOUD_KEYS.includes(e.key) || !self._initialized) return;
      // Another tab just wrote to a tracked key — update our in-memory state
      // Notify listeners so UI can react (e.g. show "data updated from another tab")
      self._setSyncStatus(e.key, 'synced');
      for (const cb of self._crossTabListeners) {
        try { cb(e.key, e.newValue); } catch {}
      }
    });
  }

  get isOnline() { return this._online; }
  get deviceId() { return getDeviceId(); }
}

export const cloudStorage = new CloudStorageManager();

// Install auto-sync interceptor immediately
cloudStorage.installAutoSync();
