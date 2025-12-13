# 🔧 Modifications server.js pour DrawBeru Multi

## Résumé des modifications appliquées au server.js

### 1. Imports ajoutés (en haut du fichier)

```javascript
const http = require('http');
const { initSocketIO, getRoomsStats } = require('./sockets');
```

### 2. Création du serveur HTTP (après `const app = express();`)

```javascript
const server = http.createServer(app);
```

### 3. Route DrawBeru ajoutée (AVANT le 404 handler)

```javascript
const drawberuRoutes = require('./routes/drawberu');
app.use('/api/drawberu', drawberuRoutes);
```

### 4. Démarrage modifié (server.listen au lieu de app.listen)

```javascript
server.listen(PORT, '0.0.0.0', async () => {
  await ensureUploadDirs();
  
  // 🔌 INITIALISER SOCKET.IO
  initSocketIO(server);
  
  console.log(`
🔥 ===============================================
   BUILDERBERU BACKEND v5.3 - DRAWBERU MULTI! 🎨
🔥 ===============================================
...
  `);
});
```

### 5. Endpoints ajoutés dans la route root

```javascript
drawberuStats: '/api/drawberu/stats',
drawberuHealth: '/api/drawberu/health',
drawberuWebSocket: 'ws://api.builderberu.com/drawberu'
```

## ⚠️ Points importants

1. **L'ordre est crucial** : La route `/api/drawberu` doit être déclarée AVANT le 404 handler
2. **Dépendances** : `npm install socket.io uuid`
3. **Redémarrage** : `pm2 restart builderberu-backend`

## ✅ Test

```bash
curl http://localhost:3001/api/drawberu/stats
# Doit retourner : {"success":true,"kaisel":"🎨 DrawBeru Multiplayer Stats","totalRooms":0,...}
```
