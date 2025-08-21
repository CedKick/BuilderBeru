// routes/builds.js - 🎮 PARTAGE DE BUILDS par Kaisel & Claude
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const recentSaves = new Map();



// 📁 Configuration des fichiers
const BUILDS_FILE = path.join(__dirname, '..', 'data', 'builds.json');

// 🛠️ Assurer que le fichier builds existe
const ensureBuildsFile = async () => {
  try {
    await fs.access(BUILDS_FILE);
  } catch {
    // Créer le dossier data si nécessaire
    const dataDir = path.dirname(BUILDS_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    // Créer le fichier builds.json vide
    await fs.writeFile(BUILDS_FILE, '[]', 'utf8');
    console.log('📁 Fichier builds.json créé');
  }
};

// 📝 SAUVEGARDER UN BUILD
router.post('/save', async (req, res) => {
  try {
    // Rate limiting par IP
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Nettoyer les vieilles entrées (plus de 5 minutes)
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    for (const [ip, timestamps] of recentSaves.entries()) {
      const filtered = timestamps.filter(t => t > fiveMinutesAgo);
      if (filtered.length === 0) {
        recentSaves.delete(ip);
      } else {
        recentSaves.set(ip, filtered);
      }
    }
    
    // Vérifier le rate limit (max 5 sauvegardes par 5 minutes)
    const userSaves = recentSaves.get(clientIp) || [];
    if (userSaves.length >= 5) {
      return res.status(429).json({
        error: 'Trop de requêtes',
        kaisel: 'Limite atteinte: 5 partages par 5 minutes',
        retryAfter: 300 // secondes
      });
    }
    
    console.log('🎮 Sauvegarde d\'un build...');
    
    const { buildData } = req.body;
    
    if (!buildData) {
      return res.status(400).json({
        error: 'Données du build manquantes',
        kaisel: 'BuildData requis'
      });
    }
    
    // Vérifier la taille des données (max 1MB)
    const dataSize = JSON.stringify(buildData).length;
    if (dataSize > 1048576) { // 1MB en bytes
      return res.status(413).json({
        error: 'Données trop volumineuses',
        kaisel: 'Maximum 1MB par build'
      });
    }
    
    // Générer l'ID et sauvegarder
    const buildId = uuidv4().substring(0, 8);
    
    const newBuild = {
      id: buildId,
      data: buildData,
      createdAt: new Date().toISOString(),
      views: 0,
      version: '1.0',
      ip: clientIp // Pour tracking anti-spam
    };
    
    await ensureBuildsFile();
    const buildsData = await fs.readFile(BUILDS_FILE, 'utf8');
    const builds = JSON.parse(buildsData);
    
    builds.push(newBuild);
    
    await fs.writeFile(BUILDS_FILE, JSON.stringify(builds, null, 2), 'utf8');
    
    // Ajouter à l'historique des sauvegardes
    userSaves.push(now);
    recentSaves.set(clientIp, userSaves);
    
    console.log(`✅ Build ${buildId} sauvegardé (IP: ${clientIp}, ${userSaves.length}/5)`);
    
    const shareUrl = `https://builderberu.com/build#${buildId}`;
    
    res.json({
      success: true,
      id: buildId,
      url: shareUrl,
      kaisel: '🎮 Build sauvegardé avec succès!',
      shortUrl: buildId
    });
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde build:', error);
    res.status(500).json({
      error: 'Erreur lors de la sauvegarde',
      message: error.message,
      kaisel: 'Échec sauvegarde build'
    });
  }
});

// 🔍 RÉCUPÉRER UN BUILD
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Récupération du build ${id}`);
    
    // Lire les builds
    await ensureBuildsFile();
    const buildsData = await fs.readFile(BUILDS_FILE, 'utf8');
    const builds = JSON.parse(buildsData);
    
    // Trouver le build
    const build = builds.find(b => b.id === id);
    
    if (!build) {
      return res.status(404).json({
        error: 'Build non trouvé',
        kaisel: `Build ${id} introuvable`
      });
    }
    
    // Incrémenter les vues
    build.views = (build.views || 0) + 1;
    
    // Sauvegarder avec les vues mises à jour
    await fs.writeFile(BUILDS_FILE, JSON.stringify(builds, null, 2), 'utf8');
    
    console.log(`✅ Build ${id} récupéré (${build.views} vues)`);
    
    res.json({
      success: true,
      build: {
        id: build.id,
        data: build.data,
        createdAt: build.createdAt,
        views: build.views,
        version: build.version
      },
      kaisel: `🎮 Build chargé! (${build.views} vues)`
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération build:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération',
      message: error.message,
      kaisel: 'Échec chargement build'
    });
  }
});

// 📊 STATISTIQUES D'UN BUILD (optionnel)
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    await ensureBuildsFile();
    const buildsData = await fs.readFile(BUILDS_FILE, 'utf8');
    const builds = JSON.parse(buildsData);
    
    const build = builds.find(b => b.id === id);
    
    if (!build) {
      return res.status(404).json({
        error: 'Build non trouvé'
      });
    }
    
    res.json({
      success: true,
      stats: {
        id: build.id,
        createdAt: build.createdAt,
        views: build.views || 0,
        age: Math.floor((Date.now() - new Date(build.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + ' jours'
      },
      kaisel: '📊 Stats du build'
    });
    
  } catch (error) {
    console.error('❌ Erreur stats build:', error);
    res.status(500).json({
      error: 'Erreur stats',
      message: error.message
    });
  }
});

// 🧹 NETTOYAGE DES VIEUX BUILDS (optionnel - à appeler via cron)
router.post('/cleanup', async (req, res) => {
  try {
    const { daysToKeep = 30, adminToken } = req.body;
    
    // Vérifier le token admin (utilise ton système JWT existant)
    if (!adminToken || adminToken !== process.env.ADMIN_CLEANUP_TOKEN) {
      return res.status(403).json({
        error: 'Non autorisé',
        kaisel: 'Token admin requis'
      });
    }
    
    await ensureBuildsFile();
    const buildsData = await fs.readFile(BUILDS_FILE, 'utf8');
    const builds = JSON.parse(buildsData);
    
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = builds.length;
    
    // Filtrer les builds récents
    const recentBuilds = builds.filter(build => {
      const buildDate = new Date(build.createdAt).getTime();
      return buildDate > cutoffDate;
    });
    
    const deletedCount = initialCount - recentBuilds.length;
    
    // Sauvegarder
    await fs.writeFile(BUILDS_FILE, JSON.stringify(recentBuilds, null, 2), 'utf8');
    
    console.log(`🧹 Cleanup: ${deletedCount} builds supprimés`);
    
    res.json({
      success: true,
      stats: {
        initialCount,
        deletedCount,
        remainingCount: recentBuilds.length,
        daysToKeep
      },
      kaisel: `🧹 ${deletedCount} vieux builds nettoyés`
    });
    
  } catch (error) {
    console.error('❌ Erreur cleanup builds:', error);
    res.status(500).json({
      error: 'Erreur cleanup',
      message: error.message
    });
  }
});

module.exports = router;