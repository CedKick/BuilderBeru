import { gzipSync } from 'node:zlib';

/**
 * Send JSON response with gzip compression if client supports it.
 * Reduces Fast Origin Transfer bandwidth on Vercel (~70-80% savings).
 */
export function sendCompressed(req, res, statusCode, data) {
  const json = JSON.stringify(data);
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (acceptEncoding.includes('gzip') && json.length > 1024) {
    const compressed = gzipSync(json);
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'application/json');
    return res.status(statusCode).send(compressed);
  }
  return res.status(statusCode).json(data);
}
