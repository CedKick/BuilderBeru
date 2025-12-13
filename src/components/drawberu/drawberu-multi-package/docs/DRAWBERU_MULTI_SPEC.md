# 🎨 DrawBeru Mode Multijoueur - Spécification Complète

> **Document créé par Kaisel pour le Monarque des Ombres**  
> **Date** : 12 Décembre 2025  
> **Version** : 1.0.0

---

## 📋 Table des Matières

1. [Vision du Projet](#vision-du-projet)
2. [Nouvelle Interface - Flow Utilisateur](#nouvelle-interface---flow-utilisateur)
3. [Architecture Backend (DÉJÀ EN PLACE)](#architecture-backend-déjà-en-place)
4. [Spécifications Frontend à Créer](#spécifications-frontend-à-créer)
5. [Events WebSocket Complets](#events-websocket-complets)
6. [Composants UI à Créer](#composants-ui-à-créer)
7. [Intégration avec DrawBeru Existant](#intégration-avec-drawberu-existant)
8. [Contraintes et Style](#contraintes-et-style)

---

## 🎯 Vision du Projet

DrawBeru passe d'une application de coloriage **solo** à une expérience **collaborative temps réel** où plusieurs joueurs peuvent colorier ensemble le même Hunter.

### Objectifs
- Colorier à plusieurs (2-8 joueurs) en temps réel
- Voir les curseurs et strokes des autres instantanément
- Le **Host** contrôle les règles (pipette, gomme, etc.)
- Garder le mode solo fonctionnel
- Expérience mobile-first

---

## 🖥️ Nouvelle Interface - Flow Utilisateur

### IMPORTANT : Changement d'Interface

L'interface actuelle lance directement le coloriage. La **nouvelle interface** doit proposer un choix **AVANT** de commencer :

```
┌─────────────────────────────────────────────────────────────┐
│                      🎨 DrawBeru                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Sélectionne ton Hunter                      │   │
│  │  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐        │   │
│  │  │Ilhwan │  │ Cha   │  │ Woo   │  │ ...   │        │   │
│  │  └───────┘  └───────┘  └───────┘  └───────┘        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Sélectionne le modèle                       │   │
│  │  ┌───────┐  ┌───────┐  ┌───────┐                   │   │
│  │  │Model 1│  │Model 2│  │Model 3│                   │   │
│  │  └───────┘  └───────┘  └───────┘                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│          Comment veux-tu jouer ?                           │
│                                                             │
│    ┌──────────────────┐    ┌──────────────────┐           │
│    │   🎮 SOLO        │    │   👥 MULTI       │           │
│    │                  │    │                  │           │
│    │  Colorier seul   │    │ Colorier à       │           │
│    │  (sauvegarde     │    │ plusieurs !      │           │
│    │   locale)        │    │                  │           │
│    └──────────────────┘    └──────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Flow SOLO (existant)
```
Sélection Hunter → Sélection Modèle → Clic "SOLO" → DrawBeru classique (localStorage)
```

### Flow MULTI (nouveau)
```
Sélection Hunter → Sélection Modèle → Clic "MULTI" → Lobby Multi
                                                          │
                                    ┌─────────────────────┴─────────────────────┐
                                    │                                           │
                              "Créer une Room"                          "Rejoindre"
                                    │                                           │
                                    ▼                                           ▼
                           ┌─────────────────┐                        ┌─────────────────┐
                           │ Room créée !    │                        │ Entrer le code  │
                           │ Code: ILHW-X7K4 │                        │ [________]      │
                           │                 │                        │ [Rejoindre]     │
                           │ [Copier]        │                        └─────────────────┘
                           │ [Partager]      │                                  │
                           │                 │                                  │
                           │ Settings:       │                                  │
                           │ ☑ Auto-pipette │                                  │
                           │ ☑ Gomme        │                                  │
                           │ Max: [4] 👥    │                                  │
                           │                 │                                  │
                           │ Joueurs:        │◄─────────────────────────────────┘
                           │ • Monarque 👑   │
                           │ • Neveu         │
                           │                 │
                           │ [Commencer]     │
                           └─────────────────┘
                                    │
                                    ▼
                           DrawBeru Multi Mode
                           (sync temps réel)
```

---

## 🔧 Architecture Backend (DÉJÀ EN PLACE)

Le backend est **opérationnel** sur le VPS DigitalOcean.

### Endpoints

| Type | URL |
|------|-----|
| **WebSocket** | `wss://api.builderberu.com/drawberu` |
| **Stats API** | `https://api.builderberu.com/api/drawberu/stats` |
| **Health** | `https://api.builderberu.com/api/drawberu/health` |

### Structure d'une Room

```javascript
{
  id: "ILHW-X7K4",           // Code unique à partager (4 lettres - 4 chars)
  host: "socket_id",          // Socket ID du créateur
  hostName: "Monarque",       // Nom affiché du host
  hunter: "ilhwan",           // Hunter sélectionné
  model: "model1",            // Modèle sélectionné
  createdAt: 1702425600000,   // Timestamp création
  lastActivity: 1702425600000,// Timestamp dernière activité
  
  settings: {
    maxPlayers: 4,            // 2-8 joueurs max
    autoPipette: true,        // Host peut désactiver la pipette auto
    eraserAllowed: true,      // Host peut désactiver la gomme
    layerAssignment: "free",  // "free" = tout le monde partout, "assigned" = 1 layer par joueur
    spectatorAllowed: true,   // Autoriser les spectateurs si room pleine
    brushSizeRange: [0.05, 50] // Tailles de brush autorisées
  },
  
  players: [
    {
      id: "socket_id",
      name: "Monarque",
      color: "#8B5CF6",       // Couleur assignée (violet pour host)
      layer: null,            // Layer assigné (si mode assigned)
      isHost: true,
      joinedAt: 1702425600000,
      isDrawing: false,       // En train de dessiner ?
      cursor: { x: 0, y: 0 }  // Position du curseur
    }
  ],
  
  strokes: [
    {
      id: "uuid",
      playerId: "socket_id",
      playerName: "Monarque",
      playerColor: "#8B5CF6",
      layer: "base",
      points: [[x1,y1], [x2,y2], ...],
      color: "#FF5733",
      brushSize: 2.5,
      tool: "brush",          // "brush" | "eraser"
      timestamp: 1702425600000
    }
  ],
  
  spectators: [
    { id: "socket_id", name: "Viewer1", joinedAt: 1702425600000 }
  ]
}
```

### Couleurs des Joueurs

Les joueurs reçoivent automatiquement une couleur pour leur curseur :

```javascript
const PLAYER_COLORS = [
  '#8B5CF6', // Violet (host toujours)
  '#10B981', // Vert
  '#F59E0B', // Orange
  '#EF4444', // Rouge
  '#3B82F6', // Bleu
  '#EC4899', // Rose
  '#14B8A6', // Teal
  '#F97316', // Orange vif
];
```

---

## 📡 Events WebSocket Complets

### CLIENT → SERVEUR

#### room:create
Créer une nouvelle room.

```javascript
socket.emit('room:create', {
  playerName: "Monarque",      // Nom du joueur
  hunter: "ilhwan",            // Hunter choisi
  model: "model1",             // Modèle choisi
  settings: {                  // Optionnel - settings custom
    maxPlayers: 4,
    autoPipette: true,
    eraserAllowed: true,
    layerAssignment: "free",
    spectatorAllowed: true
  }
}, (response) => {
  // response = { success: true, room: {...}, you: {...} }
  // ou { success: false, error: "message" }
});
```

#### room:join
Rejoindre une room existante.

```javascript
socket.emit('room:join', {
  roomId: "ILHW-X7K4",         // Code de la room
  playerName: "Neveu"          // Nom du joueur
}, (response) => {
  // response = { 
  //   success: true, 
  //   isSpectator: false,     // true si room pleine
  //   room: {...}, 
  //   you: {...},
  //   strokes: [...]          // Historique des strokes pour sync
  // }
});
```

#### room:settings
Modifier les settings (Host uniquement).

```javascript
socket.emit('room:settings', {
  settings: {
    autoPipette: false,        // Désactiver la pipette
    eraserAllowed: false       // Désactiver la gomme
  }
}, (response) => {
  // response = { success: true, settings: {...} }
});
```

#### room:leave
Quitter la room.

```javascript
socket.emit('room:leave', (response) => {
  // response = { success: true }
});
```

#### room:info
Obtenir les infos d'une room (sans la rejoindre).

```javascript
socket.emit('room:info', {
  roomId: "ILHW-X7K4"
}, (response) => {
  // response = { 
  //   success: true, 
  //   room: { id, hunter, model, playerCount, maxPlayers, hostName } 
  // }
});
```

#### draw:stroke
Envoyer un stroke complet (quand le joueur relâche le clic/touch).

```javascript
socket.emit('draw:stroke', {
  layer: "base",               // "base" | "shadows" | "details"
  points: [[142.5, 301.2], [143.1, 302.8], [144.0, 303.5], ...],
  color: "#8B5CF6",
  brushSize: 2.5,
  tool: "brush"                // "brush" | "eraser"
});
// Pas de callback - fire and forget
```

#### draw:stroking
Envoyer la position en cours de dessin (pour le temps réel).

```javascript
socket.emit('draw:stroking', {
  point: [x, y],               // Position actuelle
  color: "#8B5CF6",
  brushSize: 2.5,
  layer: "base"
});
// Appelé fréquemment pendant le dessin (throttle recommandé ~30ms)
```

#### draw:undo
Annuler le dernier stroke du joueur.

```javascript
socket.emit('draw:undo', {}, (response) => {
  // response = { success: true } ou { success: false, error: "Rien à annuler" }
});
```

#### cursor:move
Envoyer la position du curseur.

```javascript
socket.emit('cursor:move', {
  x: 150.5,
  y: 300.2,
  isDrawing: true              // true si en train de dessiner
});
// Appelé fréquemment (throttle recommandé ~50ms)
```

---

### SERVEUR → CLIENT

#### room:playerJoined
Un nouveau joueur a rejoint.

```javascript
socket.on('room:playerJoined', ({ player }) => {
  // player = { id, name, color, layer, isHost, joinedAt, isDrawing, cursor }
  // Ajouter le joueur à la liste locale
});
```

#### room:playerLeft
Un joueur a quitté.

```javascript
socket.on('room:playerLeft', ({ playerId, playerName }) => {
  // Retirer le joueur de la liste locale
  // Retirer son curseur
});
```

#### room:newHost
Le host a changé (ancien host parti).

```javascript
socket.on('room:newHost', ({ newHostId, newHostName }) => {
  // Mettre à jour qui est le host
  // Si c'est nous, activer les contrôles host
});
```

#### room:settingsUpdated
Les settings ont été modifiés par le host.

```javascript
socket.on('room:settingsUpdated', ({ settings }) => {
  // Mettre à jour les settings locaux
  // Désactiver/activer les outils selon les settings
});
```

#### room:spectatorJoined
Un spectateur a rejoint.

```javascript
socket.on('room:spectatorJoined', ({ spectator }) => {
  // spectator = { id, name, joinedAt }
});
```

#### room:expired
La room a expiré (30 min d'inactivité).

```javascript
socket.on('room:expired', ({ reason }) => {
  // Afficher un message et retourner au lobby
});
```

#### draw:stroke
Recevoir un stroke d'un autre joueur.

```javascript
socket.on('draw:stroke', (stroke) => {
  // stroke = {
  //   id: "uuid",
  //   playerId: "socket_id",
  //   playerName: "Neveu",
  //   playerColor: "#10B981",
  //   layer: "base",
  //   points: [[x1,y1], [x2,y2], ...],
  //   color: "#FF5733",
  //   brushSize: 2.5,
  //   tool: "brush",
  //   timestamp: 1702425600000
  // }
  
  // DESSINER CE STROKE SUR LE CANVAS
});
```

#### draw:stroking
Recevoir la position en cours de dessin d'un autre joueur.

```javascript
socket.on('draw:stroking', ({ playerId, point, color, brushSize, layer }) => {
  // Optionnel : afficher un point temporaire ou animer le curseur
});
```

#### draw:undo
Un joueur a annulé son dernier stroke.

```javascript
socket.on('draw:undo', ({ playerId, strokeId }) => {
  // Retirer le stroke de l'historique local
  // Re-render le canvas sans ce stroke
});
```

#### draw:clearLayer
Le host a clear un layer.

```javascript
socket.on('draw:clearLayer', ({ layer, by }) => {
  // Clear le layer localement
  // Afficher notification "Layer X cleared by Y"
});
```

#### cursor:update
Position du curseur d'un autre joueur.

```javascript
socket.on('cursor:update', ({ playerId, playerName, playerColor, x, y, isDrawing }) => {
  // Mettre à jour la position du curseur de ce joueur
  // Afficher/animer le curseur coloré
});
```

---

## 🧩 Composants UI à Créer

### Structure des Fichiers

```
src/
├── config/
│   └── multiplayer.js                    # Configuration WebSocket
│
├── pages/DrawBeru/
│   ├── DrawBeru.jsx                      # MODIFIER - Ajouter mode multi
│   ├── DrawBeruLauncher.jsx              # 🆕 NOUVEAU - Écran de sélection
│   └── hooks/
│       └── useMultiplayer.js             # 🆕 NOUVEAU - Hook WebSocket
│
└── components/DrawBeru/
    └── MultiplayerUI/
        ├── ModeSelector.jsx              # 🆕 Choix Solo/Multi
        ├── HunterModelSelector.jsx       # 🆕 Sélection Hunter + Modèle
        ├── RoomLobby.jsx                 # 🆕 Lobby création/join
        ├── RoomSettings.jsx              # 🆕 Settings (host only)
        ├── RoomCodeShare.jsx             # 🆕 Affichage/partage du code
        ├── PlayersList.jsx               # 🆕 Liste des joueurs
        └── PlayerCursors.jsx             # 🆕 Curseurs des autres
```

### 1. multiplayer.js (Config)

```javascript
export const MULTIPLAYER_CONFIG = {
  SOCKET_URL: 'https://api.builderberu.com',
  NAMESPACE: '/drawberu',
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  CURSOR_THROTTLE_MS: 50,
  STROKING_THROTTLE_MS: 30,
};
```

### 2. useMultiplayer.js (Hook)

Le hook doit exposer :

```javascript
const {
  // État
  isConnected,
  room,
  players,
  isHost,
  myPlayer,
  settings,
  isSpectator,
  
  // Actions
  connect,
  disconnect,
  createRoom,
  joinRoom,
  leaveRoom,
  updateSettings,
  
  // Drawing
  sendStroke,
  sendStroking,
  sendUndo,
  sendCursorMove,
  
  // Events reçus (callbacks à définir)
  onStrokeReceived,
  onPlayerJoined,
  onPlayerLeft,
  onSettingsUpdated,
  onCursorUpdate,
  
  // Strokes reçus à dessiner
  receivedStrokes,
  
  // Curseurs des autres
  otherCursors,
  
} = useMultiplayer();
```

### 3. DrawBeruLauncher.jsx

Nouvel écran d'entrée qui remplace l'accès direct à DrawBeru :

- Sélection du Hunter (grille avec images)
- Sélection du Modèle (grille avec previews)
- Deux gros boutons : SOLO / MULTI
- Si SOLO → Lance DrawBeru classique
- Si MULTI → Lance RoomLobby

### 4. RoomLobby.jsx

Écran du lobby multijoueur :

- **Si pas dans une room :**
  - Bouton "Créer une Room"
  - Input code + Bouton "Rejoindre"
  
- **Si dans une room (host) :**
  - Affichage du code (gros, copiable)
  - Settings modifiables
  - Liste des joueurs
  - Bouton "Commencer"
  
- **Si dans une room (invité) :**
  - Affichage du code
  - Liste des joueurs
  - Message "En attente du host..."

### 5. PlayerCursors.jsx

Overlay qui affiche les curseurs des autres joueurs :

```jsx
// Pour chaque autre joueur, afficher :
<div style={{
  position: 'absolute',
  left: cursor.x,
  top: cursor.y,
  pointerEvents: 'none',
}}>
  {/* Point coloré */}
  <div style={{
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: player.color,
    border: '2px solid white',
  }} />
  
  {/* Nom du joueur */}
  <span style={{
    marginLeft: 8,
    color: player.color,
    fontSize: 12,
    fontWeight: 'bold',
  }}>
    {player.name}
  </span>
</div>
```

---

## 🔗 Intégration avec DrawBeru Existant

### Modifications à DrawBeru.jsx

1. **Recevoir un prop `multiplayerMode`** :
   ```jsx
   function DrawBeru({ multiplayerMode = false, roomData = null }) {
   ```

2. **Si multiplayerMode, utiliser le hook** :
   ```jsx
   const multiplayer = multiplayerMode ? useMultiplayer() : null;
   ```

3. **Lors du dessin, envoyer les strokes** :
   ```jsx
   const handleMouseUp = () => {
     // ... code existant ...
     
     // Si mode multi, envoyer le stroke
     if (multiplayer) {
       multiplayer.sendStroke({
         layer: activeLayer,
         points: currentStrokePoints,
         color: selectedColor,
         brushSize: brushSize,
         tool: currentTool,
       });
     }
   };
   ```

4. **Écouter les strokes reçus** :
   ```jsx
   useEffect(() => {
     if (multiplayer?.receivedStrokes) {
       multiplayer.receivedStrokes.forEach(stroke => {
         drawStrokeOnCanvas(stroke);
       });
     }
   }, [multiplayer?.receivedStrokes]);
   ```

5. **Afficher les curseurs** :
   ```jsx
   {multiplayerMode && (
     <PlayerCursors cursors={multiplayer.otherCursors} />
   )}
   ```

6. **Respecter les settings** :
   ```jsx
   const canUsePipette = !multiplayerMode || multiplayer.settings.autoPipette;
   const canUseEraser = !multiplayerMode || multiplayer.settings.eraserAllowed;
   ```

---

## 🎨 Contraintes et Style

### Style BuilderBeru

```css
/* Couleurs principales */
--bg-primary: #0a0118;
--bg-secondary: #1a0a2e;
--accent-violet: #8B5CF6;
--accent-violet-hover: #7C3AED;
--text-primary: #FFFFFF;
--text-secondary: #A78BFA;

/* Boutons */
.btn-primary {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: bold;
}

.btn-secondary {
  background: transparent;
  color: #8B5CF6;
  border: 2px solid #8B5CF6;
  border-radius: 8px;
  padding: 12px 24px;
}

/* Cards */
.card {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 16px;
}
```

### Contraintes Techniques

| Contrainte | Détail |
|------------|--------|
| **Mode solo intact** | Le localStorage doit continuer à fonctionner |
| **Mobile-first** | Beaucoup d'utilisateurs sur mobile |
| **Pas de régression** | Ne rien casser de l'existant |
| **Performance** | Throttle les events curseur (50ms) et stroking (30ms) |
| **Reconnexion** | Gérer les déconnexions/reconnexions |

### Dépendance à Installer

```bash
npm install socket.io-client
```

---

## 📝 Ordre de Développement Suggéré

1. ✅ `src/config/multiplayer.js`
2. ✅ `src/pages/DrawBeru/hooks/useMultiplayer.js`
3. ✅ `src/components/DrawBeru/MultiplayerUI/PlayersList.jsx`
4. ✅ `src/components/DrawBeru/MultiplayerUI/PlayerCursors.jsx`
5. ✅ `src/components/DrawBeru/MultiplayerUI/RoomCodeShare.jsx`
6. ✅ `src/components/DrawBeru/MultiplayerUI/RoomSettings.jsx`
7. ✅ `src/components/DrawBeru/MultiplayerUI/RoomLobby.jsx`
8. ✅ `src/components/DrawBeru/MultiplayerUI/HunterModelSelector.jsx`
9. ✅ `src/components/DrawBeru/MultiplayerUI/ModeSelector.jsx`
10. ✅ `src/pages/DrawBeru/DrawBeruLauncher.jsx`
11. ✅ Modification de `src/pages/DrawBeru/DrawBeru.jsx`
12. ✅ Mise à jour du routing

---

## 🔥 C'est parti !

Le backend est **prêt et opérationnel**. Il ne reste plus qu'à créer le frontend.

**Pour le Monarque des Ombres, par Kaisel** 😈⚔️
