/**
 * CloudStorage — Hybrid localStorage + Neon PostgreSQL backend
 *
 * Drop-in enhancement for localStorage. Saves locally (instant) + syncs to cloud (persistent).
 * Falls back to localStorage-only if backend is unavailable.
 *
 * Usage:
 *   import { cloudStorage } from '../utils/CloudStorage';
 *   cloudStorage.save('my_key', data);        // saves to localStorage + queues cloud sync
 *   const data = cloudStorage.loadLocal('my_key');  // instant from localStorage
 *   await cloudStorage.loadCloud('my_key');    // fetch from cloud
 *   await cloudStorage.syncAll();              // push all tracked keys to cloud
 */

const API_BASE = '/api/storage';
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
const SYNC_DELAY = 3000; // 3s debounce

class CloudStorageManager {
  constructor() {
    this._initialized = false;
    this._online = true;
    this._syncQueue = new Set();
  }

  /** Save data to localStorage + schedule cloud sync */
  save(key, data) {
    // Always save to localStorage first (instant)
    const json = JSON.stringify(data);
    try {
      localStorage.setItem(key, json);
    } catch (e) {
      // QuotaExceededError — try to free space
      if (e.name === 'QuotaExceededError') {
        console.warn('[CloudStorage] localStorage quota exceeded for', key, '— clearing old data');
        this._freeSpace(key);
        try {
          localStorage.setItem(key, json);
        } catch (e2) {
          console.error('[CloudStorage] Still cannot save to localStorage:', key);
        }
      }
    }

    // Schedule cloud sync (debounced)
    if (CLOUD_KEYS.includes(key)) {
      this._scheduleSync(key);
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
      return;
    }

    // Merge cloud data into localStorage
    for (const [key, entry] of Object.entries(cloudEntries)) {
      const localRaw = localStorage.getItem(key);
      if (loginPending || !localRaw) {
        // Login pending: cloud ALWAYS wins (cross-device sync)
        // No local data: cloud fills the gap
        try {
          localStorage.setItem(key, JSON.stringify(entry.data));
        } catch { /* ignore quota errors during sync */ }
      }
      // Normal reload with local data: keep local (most recent from this device)
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

  /** Push a specific key to cloud NOW */
  async syncKey(key) {
    try {
      const data = this.loadLocal(key);
      if (data === null) return false;

      const deviceId = getDeviceId();
      const resp = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ..._getAuthHeaders() },
        body: JSON.stringify({ deviceId, key, data }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      this._online = true;
      return json.success;
    } catch (err) {
      console.warn('[CloudStorage] Sync failed for', key, err.message);
      this._online = false;
      this._syncQueue.add(key);
      return false;
    }
  }

  /** Push all tracked keys to cloud */
  async syncAll() {
    const promises = CLOUD_KEYS.map(key => {
      const raw = localStorage.getItem(key);
      if (raw) return this.syncKey(key);
      return Promise.resolve(false);
    });
    await Promise.allSettled(promises);
  }

  // ─── Private ─────────────────────────────────────────────

  _scheduleSync(key) {
    this._syncQueue.add(key);
    if (_syncTimers[key]) clearTimeout(_syncTimers[key]);
    _syncTimers[key] = setTimeout(() => {
      delete _syncTimers[key];
      this.syncKey(key);
    }, SYNC_DELAY);
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
   */
  installAutoSync() {
    if (this._autoSyncInstalled) return;
    this._autoSyncInstalled = true;

    const original = localStorage.setItem.bind(localStorage);
    const self = this;

    localStorage.setItem = function (key, value) {
      // Call original
      try {
        original(key, value);
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn('[CloudStorage] QuotaExceeded on', key, '— freeing space');
          self._freeSpace(key);
          try { original(key, value); } catch {}
        }
      }
      // Auto cloud sync for tracked keys — but ONLY after initialSync is done
      // This prevents pushing empty/default data to cloud during app startup
      if (CLOUD_KEYS.includes(key) && self._initialized) {
        self._scheduleSync(key);
      }
    };

    // ─── Safety nets: never lose progression ─────────────────

    // 1. beforeunload — flush pending syncs when closing browser/tab
    //    Uses sendBeacon for reliability (fetch can be cancelled during unload)
    window.addEventListener('beforeunload', () => {
      if (self._syncQueue.size === 0) return;
      const deviceId = getDeviceId();
      for (const key of self._syncQueue) {
        const data = self.loadLocal(key);
        if (data !== null) {
          navigator.sendBeacon(
            `${API_BASE}/save`,
            new Blob([JSON.stringify({ deviceId, key, data })], { type: 'application/json' })
          );
        }
      }
      self._syncQueue.clear();
    });

    // 2. visibilitychange — sync when user switches tab or minimizes mobile browser
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && self._initialized && self._syncQueue.size > 0) {
        self._flushQueue();
      }
    });

    // 3. Periodic sync every 60s — safety net
    setInterval(() => {
      if (self._initialized && self._syncQueue.size > 0) {
        self._flushQueue();
      }
    }, 60000);
  }

  get isOnline() { return this._online; }
  get deviceId() { return getDeviceId(); }
}

export const cloudStorage = new CloudStorageManager();

// Install auto-sync interceptor immediately
cloudStorage.installAutoSync();
