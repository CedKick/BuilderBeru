
// api/db/neon.js - Neon PostgreSQL Connection
// Includes retry logic for Neon free-tier cold starts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, // 10s connect timeout (cold start can take 5-8s)
  idleTimeoutMillis: 30000,
  max: 5,
});

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

export async function query(text, params) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      return result;
    } catch (err) {
      lastError = err;
      const isConnectionError =
        err.code === 'ECONNREFUSED' ||
        err.code === 'ENOTFOUND' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'CONNECTION_TIMEOUT' ||
        err.message?.includes('timeout') ||
        err.message?.includes('Connection terminated') ||
        err.message?.includes('connect ETIMEDOUT');
      if (isConnectionError && attempt < MAX_RETRIES) {
        console.warn(`[neon] Connection failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      throw err;
    } finally {
      if (client) client.release();
    }
  }
  throw lastError;
}

export default pool;