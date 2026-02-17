// src/utils/auth.js — Client-side auth utility
// Token storage, login, register, logout, authHeaders

import { cloudStorage } from './CloudStorage';

const AUTH_TOKEN_KEY = 'builderberu_auth_token';
const AUTH_USER_KEY = 'builderberu_auth_user';
const DEVICE_ID_KEY = 'builderberu_device_id';

// ─── Token & user state ──────────────────────────────────

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY));
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getAuthToken();
}

/**
 * Save auth data to localStorage.
 * Uses the Storage prototype directly to bypass any interceptors.
 */
export function setAuth(token, user) {
  const proto = Storage.prototype;
  proto.setItem.call(localStorage, AUTH_TOKEN_KEY, token);
  proto.setItem.call(localStorage, AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Returns auth headers for API calls.
 * Include this in fetch headers to authenticate requests.
 */
export function authHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ─── Auth actions ────────────────────────────────────────

function getOrCreateDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/**
 * Register a new account. Links the current deviceId to the account.
 * On success: saves token + reloads page.
 */
export async function register(username, password) {
  const deviceId = getOrCreateDeviceId();

  const resp = await fetch('/api/auth?action=register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, deviceId }),
  });

  const data = await resp.json();
  if (data.success) {
    setAuth(data.token, { userId: data.userId, username: data.username });
    // Hard reload — all components will read auth from localStorage on init
    window.location.reload();
  }
  return data;
}

/**
 * Login to existing account. Syncs deviceId for cross-device.
 * On success: saves token + adopts canonical deviceId + reloads page.
 */
export async function login(username, password) {
  const resp = await fetch('/api/auth?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await resp.json();
  if (data.success) {
    setAuth(data.token, { userId: data.userId, username: data.username });
    // Cross-device: adopt the account's canonical deviceId
    if (data.deviceId) {
      const proto = Storage.prototype;
      proto.setItem.call(localStorage, DEVICE_ID_KEY, data.deviceId);
    }
    // Hard reload — cloud sync will happen via initialSync() in main.jsx
    window.location.reload();
  }
  return data;
}

/**
 * Logout — clears token and user data, reloads page.
 */
export function logout() {
  clearAuth();
  window.location.reload();
}

/**
 * Verify current token with the server. Returns user data or null.
 */
export async function verifySession() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const resp = await fetch('/api/auth?action=me', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!resp.ok) {
      clearAuth();
      return null;
    }
    const data = await resp.json();
    if (data.success) {
      return data;
    }
    clearAuth();
    return null;
  } catch {
    return null;
  }
}
