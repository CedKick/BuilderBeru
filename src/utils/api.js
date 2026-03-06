/**
 * API base URL — routes to DigitalOcean Express server in production,
 * uses Vite proxy in development.
 */
export const API_URL = import.meta.env.DEV
  ? '/api'
  : 'https://api.builderberu.com/api';

export const DRAWBERU_PROCESS_URL = import.meta.env.DEV
  ? '/drawberu-process'
  : 'https://api.builderberu.com/drawberu-process';
