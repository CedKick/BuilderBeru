# BuilderBeru - Documentation Projet

## Vue d'ensemble

**BuilderBeru** est une application web React complète dédiée aux joueurs de "Solo Leveling: Arise". Elle sert de calculateur de build, optimiseur, et suite d'outils créatifs pour le jeu.

- **Site web**: https://builderberu.com
- **Type**: Application React fullstack avec intégration backend prévue
- **Focus**: Mécaniques de jeu Solo Leveling: Arise (chasseurs, builds, artefacts, calculs de dégâts)

---

## Structure du Projet

```
builder-beru/
├── src/                          # Code source React principal
│   ├── main.jsx                  # Point d'entrée avec routing
│   ├── AppLayout.jsx             # Layout principal avec sidebar
│   ├── BuilderBeru.jsx           # Composant core MASSIF (9,036 lignes)
│   ├── HomePage.jsx              # Page d'accueil avec SEO
│   │
│   ├── pages/                    # Composants spécifiques aux pages
│   │   ├── DrawBeru/             # Système de dessin/coloriage (2,090 lignes)
│   │   ├── Hunters/              # Éditeurs de chasseurs
│   │   ├── Sung/                 # Spécialisation Sung
│   │   ├── Shadows/              # Gestion des ombres
│   │   ├── Pod/                  # Système POD
│   │   ├── Recap/                # Fonctionnalité d'export
│   │   ├── beruvianWorld/        # Carte interactive
│   │   └── GuideEditor.jsx       # Outil de création de guides
│   │
│   ├── components/               # Composants UI réutilisables
│   │   ├── BDGScore.jsx          # Système de score BDG (Guild War)
│   │   ├── PODScore.jsx          # Score/ranking POD
│   │   ├── ArtifactCard.jsx      # Affichage d'artefacts
│   │   ├── ArtifactLibrary.jsx   # Gestion de collection
│   │   ├── HallOfFlamePage.jsx   # Classements joueurs
│   │   ├── DamageCalculator.jsx  # Simulateur de dégâts
│   │   ├── ChibiSystem/          # Système de pets chibi
│   │   ├── Training/             # Centre de simulation
│   │   ├── CraftSimulator/       # Simulateur de craft RNG
│   │   └── [30+ composants additionnels]
│   │
│   ├── data/                     # Données de jeu & configuration
│   │   ├── builder_data.js       # Base de données builder (93KB)
│   │   ├── characters.js         # Stats des personnages (54KB)
│   │   ├── itemData.js           # Données items/artefacts (248KB)
│   │   ├── podData.js            # Données mécaniques POD (90KB)
│   │   └── [Fichiers JSON pour factions, guides, cartes]
│   │
│   ├── utils/                    # Fonctions utilitaires
│   │   ├── statPriority.js       # Algorithme de priorisation des stats
│   │   ├── BeruIntelligentAnalysis.js # IA d'analyse de builds
│   │   ├── artifactUtils.js      # Calculs d'artefacts
│   │   ├── ocr/                  # Reconnaissance optique de caractères
│   │   └── [Utilitaires divers]
│   │
│   ├── i18n/                     # Internationalisation
│   │   ├── i18n.js               # Configuration i18next
│   │   ├── fr.json               # Traductions françaises (285KB)
│   │   ├── en.json               # Traductions anglaises (77KB)
│   │   ├── ko.json               # Traductions coréennes (76KB)
│   │   ├── ja.json               # Traductions japonaises (81KB)
│   │   └── zh.json               # Traductions chinoises (65KB)
│   │
│   ├── assets/images/            # Images statiques
│   ├── json/                     # Fichiers de configuration JSON
│   └── [Fichiers CSS et JS additionnels]
│
├── api/db/neon.js               # Connexion PostgreSQL (Neon)
├── public/                      # Assets publics statiques
├── index.html                   # Point d'entrée HTML (SEO optimisé)
├── package.json                 # Dépendances & scripts
├── vite.config.js              # Configuration Vite
├── vercel.json                 # Configuration déploiement Vercel
├── tailwind.config.js          # Configuration Tailwind CSS
└── eslint.config.js            # Règles ESLint
```

**Total**: 139 fichiers JavaScript/JSX + fichiers de configuration

---

## Stack Technique

### Frontend
- **React 19.1.0** - Bibliothèque UI
- **React Router 7.6.1** - Routing & navigation
- **Vite 6.3.5** - Build tool & serveur dev
- **Tailwind CSS 4.1.6** - Framework CSS utility-first
- **Framer Motion 12.18.1** - Bibliothèque d'animations
- **Recharts 2.15.3** - Visualisation de graphiques

### Internationalisation
- **i18next 25.2.1** - Framework de traduction
- **i18next-browser-languagedetector 8.1.0** - Détection auto de langue
- **react-i18next 15.5.2** - Intégration React i18n

### Bibliothèques Additionnelles
- **Lucide React 0.544.0** - Bibliothèque d'icônes
- **date-fns 4.1.0** - Manipulation de dates
- **Tesseract.js 6.0.1** - OCR (parsing de screenshots)
- **pg 8.16.2** - Client PostgreSQL (backend)

### Déploiement
- **Vercel** - Plateforme d'hébergement
- **Neon PostgreSQL** - Base de données (non utilisée actuellement)

---

## Fonctionnalités Principales

### A. Système de Build (Fonctionnalité Core)
- **Sélection de Chasseur**: Choix parmi 20+ chasseurs
- **Optimisation d'Artefacts**: Gestion casque, torse, gants, bottes, collier, bracelet, anneau, boucles d'oreilles
- **Gestion des Stats Principales**: Sélection des stats primaires optimales par slot
- **Optimisation des Sub-stats**: Algorithme de priorisation des stats assisté par IA
- **Bonus de Sets**: Suivi des bonus de sets 2-pièces et 4-pièces
- **Calcul de Score Théorique**: Évaluation des métriques de qualité du build

### B. Fonctionnalité de Dessin (DrawBeru)
- **Système de Canvas Multi-couches**: 3 couches (Base, Ombres, Détails)
- **Outils de Dessin**: Pinceau, Gomme, Pipette (sélecteur de couleur)
- **Référence de Modèle**: Chargement d'images de référence pour guider le dessin
- **Historique Annuler/Refaire**: Buffer d'historique de 50 étapes
- **Zoom & Pan**: Pincement pour zoomer sur mobile, molette sur desktop
- **Stockage Local**: Sauvegarde des coloriages localement avec préservation des couches
- **Options d'Export**: Export PNG transparent/coloré, export de projet JSON
- **Support Mobile**: Support tactile complet avec contrôle d'opacité de l'overlay

### C. Calcul de Dégâts
- **Calculateur DPS**: Calcul des dégâts joueur basé sur les stats
- **Buffs de Personnage**: Application des capacités individuelles
- **Buffs d'Équipe**: Calcul des synergies d'équipe
- **Simulations de Combat**: Estimation de la sortie de dégâts vs ennemis

### D. Systèmes de Score
- **BDG (Guild War)**: Builds méta et classements pour les guerres de guildes
- **Système POD**: Évaluation de la mécanique Power of Darkness
- **Hall of Flame**: Tableau des leaders/classements joueurs

### E. Systèmes Avancés
- **Simulateur de Craft**: Test du RNG de craft d'artefacts avant d'engager des ressources
- **Centre d'Entraînement**: Pratique des builds en simulation
- **Monde Beruvien**: Carte interactive avec mécaniques de résonance
- **Monde Chibi**: Système de collection de pets miniatures avec gacha, évolution, streaks quotidiens
- **Scanner OCR**: Parsing de screenshots pour extraire automatiquement les stats d'artefacts
- **Éditeur de Guide**: Outil de création de contenu communautaire
- **Validation Admin**: Interface de modération

### F. Internationalisation
- **5 Langues**: Français, Anglais, Coréen, Japonais, Chinois
- **Détection Automatique**: Détection de la préférence de langue du navigateur
- **Persistance LocalStorage**: Préférence de langue sauvegardée
- **Optimisation SEO**: Meta tags dynamiques par langue

---

## Routes Principales

```javascript
// Configurées dans src/main.jsx
<Route path="/" element={<HomePage />} />
<Route path="/build" element={<BuilderBeru />} />
<Route path="/drawberu" element={<DrawBeru />} />
<Route path="/craft-simulator" element={<CraftSimulator />} />
<Route path="/trainingCenter" element={<TrainingCenter />} />
<Route path="/guide-editor" element={<GuideEditor />} />
<Route path="/pod" element={<PODScore />} />
<Route path="/bdg" element={<BDGScore />} />
<Route path="/hall-of-flame" element={<HallOfFlamePage />} />
<Route path="/damage-calculator" element={<DamageCalculator />} />
<Route path="/beruvian-world" element={<BeruvianWorld />} />
<Route path="/chibi-world" element={<ChibiWorld />} />
```

---

## Fichiers de Configuration Clés

### `vite.config.js`
Configuration du build Vite avec:
- Plugin React activé
- Proxy API vers `https://api.builderberu.com`
- Serveur de développement avec HMR
- Fallback History API pour SPA

### `index.html`
Point d'entrée HTML avec:
- Meta tags SEO en 5 langues
- Support Open Graph & Twitter card
- Analytics: Umami + Google Tag Manager
- Données structurées (JSON-LD) pour SEO

### `tailwind.config.js`
Personnalisation Tailwind CSS:
- Thème sombre avec accents violet/indigo
- Classes utilitaires personnalisées

### `vercel.json`
Configuration de déploiement:
- Toutes les routes redirigent vers `/` (mode SPA)

---

## Architecture & Patterns

### Structure des Composants
- **Composant Monolithique Large**: BuilderBeru.jsx (9,036 lignes) gère la majorité de la logique core
- **Organisation Basée sur les Fonctionnalités**: Pages groupées par fonctionnalité de gameplay
- **Composants de Présentation Réutilisables**: ArtifactCard, ScoreCard, etc.
- **Hooks Personnalisés**: useDytext pour animations narratives

### Gestion de l'État
- **React Hooks (useState)**: État local des composants
- **LocalStorage**: Persistance des données utilisateur (coloriages, préférences, langue)
- **Pas de Redux/Context API**: Passage direct de props entre composants

### Flux de Données
- Données de jeu centralisées dans `/src/data/`
- Stats des personnages chargées depuis des constantes JSON
- Données utilisateur stockées dans localStorage sous la clé `builderberu_users`
- Intégration API préparée mais non active (utilise proxy vers builderberu.com)

### Approche de Style
- **Tailwind CSS** pour classes utilitaires responsive
- **Styles inline** pour valeurs dynamiques/calculées
- **CSS-in-JS** pour animations
- **Thème sombre**: Fond #0f0f1a (bleu-noir très sombre)

---

## Points d'Attention pour le Développement

### Composant BuilderBeru.jsx
- **9,036 lignes**: Envisager de décomposer en composants plus petits
- Contient la majorité de la logique métier du builder
- Gère l'état global de l'application builder

### Données de Jeu
- **itemData.js (248KB)**: Plus gros fichier de données
- Les données sont codées en dur, pas de fetch depuis une API
- Mise à jour manuelle nécessaire lors de nouveaux contenus du jeu

### Performance
- Gros fichiers de traduction (285KB pour le français)
- Canvas DrawBeru peut être intensif sur mobile
- Considérer le lazy loading pour les routes

### Backend
- Configuration PostgreSQL présente mais non utilisée
- API proxy configurée vers builderberu.com
- Potentiel pour ajouter fonctionnalités backend (authentification, sauvegarde cloud, etc.)

---

## Statistiques du Projet

- **Total Fichiers Source**: 139 fichiers JSX/JS
- **Plus Gros Composant**: BuilderBeru.jsx (9,036 lignes)
- **Taille Code Total**: ~500KB+ JavaScript
- **Taille Fichiers de Données**: ~500KB+ constantes JSON
- **Langues Supportées**: 5 (FR, EN, KO, JA, ZH)
- **Dépendances**: 16 production + 8 développement
- **Historique Git**: Commits récents pour versions DrawBeru (V2, V2.1, V2.2, V2.3, V2.4)

---

## Scripts NPM Disponibles

```json
{
  "dev": "vite",                    // Démarrer serveur de développement
  "build": "vite build",            // Build de production
  "lint": "eslint .",               // Linter le code
  "preview": "vite preview"         // Prévisualiser le build
}
```

---

## Environnement de Développement

### Prérequis
- Node.js (version compatible avec React 19)
- npm ou yarn

### Installation
```bash
npm install
```

### Lancement
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Déploiement
Le projet est configuré pour Vercel avec déploiement automatique depuis Git.

---

## Améliorations Futures Potentielles

1. **Refactoring de BuilderBeru.jsx**: Décomposer en composants plus petits et manageable
2. **Activation Backend**: Utiliser la base de données Neon pour sauvegardes cloud
3. **Authentification Utilisateur**: Système de comptes utilisateurs
4. **API REST**: Créer endpoints pour données dynamiques
5. **Tests**: Ajouter Jest/React Testing Library pour tests unitaires
6. **Performance**: Lazy loading, code splitting, optimisation images
7. **PWA**: Progressive Web App avec fonctionnalités offline
8. **WebSocket**: Temps réel pour classements et événements
9. **Mobile App**: Version React Native

---

## Contacts & Ressources

- **Site**: https://builderberu.com
- **API (prévue)**: https://api.builderberu.com
- **Repository Git**: (branche actuelle: main)

---

## Notes Additionnelles

### Dernières Mises à Jour
Les commits récents se concentrent sur les versions DrawBeru:
- V2.4 (dernier)
- V2.3
- V2.2
- V2.1
- V2

### État du Repository
- Branche courante: `main`
- Statut: Clean (pas de modifications non commitées)

---

*Document généré automatiquement pour Claude Code - Dernière mise à jour: 2025-10-17*
