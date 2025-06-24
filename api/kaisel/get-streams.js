// api/kaisel/get-streams.js - API pour récupérer les streams
import { query } from '../db/neon.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 🔍 Récupérer les streams récents (moins de 30 min)
    const result = await query(`
      SELECT 
        streamer_name,
        game_name,
        title,
        viewers,
        url,
        thumbnail_url,
        is_priority,
        last_updated
      FROM kaisel_streams 
      WHERE last_updated > NOW() - INTERVAL '30 minutes'
      ORDER BY 
        is_priority DESC,
        viewers DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "📺 Aucun stream actif détecté\n\n🎯 Scan terminé par Kaisel ⚡"
      });
    }

    // 🎯 Formater pour l'affichage
    let message = `📺 **STREAMS TWITCH LIVE - SOLO LEVELING ARISE**\n\n`;
    
    result.rows.forEach((stream, index) => {
      const priority = stream.is_priority ? '⭐' : '🔴';
      message += `${priority} **${stream.streamer_name}** - ${stream.title}\n`;
      message += `   👥 ${stream.viewers} viewers | 🎮 ${stream.game_name}\n`;
      message += `   🔗 ${stream.url}\n\n`;
    });
    
    message += `🎯 Scan terminé par Kaisel ⚡`;

    return res.json({
      success: true,
      data: result.rows,
      message: message,
      lastUpdate: result.rows[0]?.last_updated
    });

  } catch (error) {
    console.error('🚨 Kaisel API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database error',
      message: "🚨 Erreur de scan Kaisel. Retry dans quelques secondes..."
    });
  }
}