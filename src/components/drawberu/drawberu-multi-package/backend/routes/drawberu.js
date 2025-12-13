// 🎨 DrawBeru Multiplayer Routes
// Par Kaisel pour le Monarque 😈

const express = require('express');
const router = express.Router();
const { getRoomsStats } = require('../sockets');

// 📊 GET /api/drawberu/stats - Stats des rooms actives
router.get('/stats', (req, res) => {
  try {
    const stats = getRoomsStats();
    
    res.json({
      success: true,
      kaisel: '🎨 DrawBeru Multiplayer Stats',
      ...stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur stats DrawBeru:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 🏥 GET /api/drawberu/health - Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'DrawBeru Multiplayer',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
