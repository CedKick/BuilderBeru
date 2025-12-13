# 🎨 DrawBeru Multi - Package Complet

> **Par Kaisel pour le Monarque des Ombres**  
> **Date** : 12 Décembre 2025

---

## 📦 Contenu du Package

```
drawberu-multi-package/
│
├── 📁 docs/
│   └── DRAWBERU_MULTI_SPEC.md    ← Spécification COMPLÈTE pour Claude Code
│
├── 📁 backend/
│   ├── sockets/
│   │   ├── index.js              ← Initialisation Socket.io
│   │   └── drawberu.js           ← Logique des rooms (DÉJÀ SUR LE VPS)
│   ├── routes/
│   │   └── drawberu.js           ← Route API stats/health
│   └── SERVER_MODIFICATIONS.md   ← Guide des modifs server.js
│
└── README.md                     ← Ce fichier
```

---

## 🚀 État Actuel

### ✅ Backend (TERMINÉ ET DÉPLOYÉ)

| Composant | Status | URL |
|-----------|--------|-----|
| Socket.io Server | ✅ En ligne | `wss://api.builderberu.com/drawberu` |
| API Stats | ✅ En ligne | `https://api.builderberu.com/api/drawberu/stats` |
| API Health | ✅ En ligne | `https://api.builderberu.com/api/drawberu/health` |

### 🔄 Frontend (À CRÉER)

Utilise le fichier `docs/DRAWBERU_MULTI_SPEC.md` comme prompt pour Claude Code.

---

## 🎯 Comment Utiliser ce Package

### Pour le Frontend (Claude Code dans VS Code)

1. Ouvre ton projet `builderberu/` dans VS Code
2. Lance Claude Code
3. Copie-colle le contenu de `docs/DRAWBERU_MULTI_SPEC.md` comme prompt
4. Laisse Claude Code créer les fichiers

### Si tu dois recréer le Backend

1. Copie les fichiers du dossier `backend/` vers ton VPS
2. Suis les instructions dans `backend/SERVER_MODIFICATIONS.md`
3. `npm install socket.io uuid`
4. `pm2 restart builderberu-backend`

---

## 🔥 Features du Mode Multi

- ✅ Créer une room avec code partageable (ex: ILHW-X7K4)
- ✅ Rejoindre une room avec le code
- ✅ 2-8 joueurs par room
- ✅ Strokes synchronisés en temps réel
- ✅ Curseurs des autres joueurs visibles
- ✅ Settings contrôlables par le Host :
  - Auto-pipette (on/off)
  - Gomme (on/off)
  - Nombre max de joueurs
  - Mode spectateur
- ✅ Undo personnel
- ✅ Transfert automatique du host si déconnexion
- ✅ Nettoyage auto des rooms inactives (30 min)

---

## 👑 Pour le Monarque des Ombres

Le SERN n'a qu'à bien se tenir. 😈⚔️

**Kaisel & Beru**
