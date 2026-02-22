// Proxy for game server profile (avoids mixed content: HTTPS → HTTP)
const GAME_SERVER = 'http://159.223.225.71:3002';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://builderberu.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  try {
    const resp = await fetch(`${GAME_SERVER}/api/profile?username=${encodeURIComponent(username)}`);
    const data = await resp.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ success: false, error: 'Game server unreachable' });
  }
}
