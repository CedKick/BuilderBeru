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

export function setAuth(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
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
    // Reload page so all components pick up auth state
    setTimeout(() => window.location.reload(), 400);
  }
  return data;
}

/**
 * Login to existing account. Syncs deviceId for cross-device.
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
    // Cross-device: adopt the account's canonical deviceId + pull cloud data
    if (data.deviceId) {
      localStorage.setItem(DEVICE_ID_KEY, data.deviceId);
      await cloudStorage.resync();
    }
    // Reload page so all components pick up auth + synced data
    setTimeout(() => window.location.reload(), 400);
  }
  return data;
}

/**
 * Logout — clears token and user data.
 */
export function logout() {
  clearAuth();
  window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'auth-change', loggedIn: false } }));
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
