# Plan de Mise à Jour - Ajout de Frieren

## Informations du Personnage

**Nom**: Frieren
**Élément**: Water
**Classe**: Support
**Grade**: SSR
**ScaleStat**: Defense
**Sets Recommandés**:
- Gauche (4 pièces): Guardian
- Droite (4 pièces): Sylph

### Stats de Base
```javascript
attack: 5833
defense: 9076
hp: 11759
```

### Image
```
https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820684/frieren_portrait_jtvtcd.png
```

---

## Fichiers à Modifier

Basé sur l'analyse de Kanae, voici TOUS les fichiers qui nécessitent une mise à jour pour ajouter Frieren:

### 1. 📊 **src/data/characters.js** (CRITIQUE)
**Ligne approximative**: Après ligne 468 (après 'kanae')

**Action**: Ajouter l'entrée complète du personnage avec:
- Informations de base (name, img, icon, class, grade, element, scaleStat)
- `bdgLimits` (maxDamageOnElement, maxDamageOffElement)
- `importantStats` array
- `skillMultipliers` (core1, core2, skill1, skill2, ultimate)
- `buffs` array (même si vide au début)

**Template à utiliser**:
```javascript
'frieren': {
  name: 'Frieren',
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820684/frieren_portrait_jtvtcd.png',
  icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820684/frieren_portrait_jtvtcd.png',
  class: 'Support',
  grade: 'SSR',
  element: 'Water',
  scaleStat: 'Defense',
  bdgLimits: {
    maxDamageOnElement: 15000000000,  // 15B max si bon élément (à ajuster selon tests)
    maxDamageOffElement: 4000000000   // 4B max si mauvais élément (à ajuster)
  },
  importantStats: ['def', 'tc', 'dcc', 'defPen', 'di'],
  skillMultipliers: {
    core1: 3.5,
    core2: 4.8,
    skill1: 12.0,
    skill2: 16.5,
    ultimate: 35.0
  },
  buffs: [
    {
      name: 'Support Buff',
      values: [5, 10, 15],
      cooldown: 12,
      duration: 8,
      target: 'shared',
      type: 'damageBuffs',
      element: 'Water'
    }
  ]
}
```

---

### 2. 📈 **src/data/characterStats.js** (CRITIQUE)
**Ligne approximative**: Après ligne 44 (après 'kanae')

**Action**: Ajouter les stats de base du personnage

```javascript
'frieren': { attack: 5833, defense: 9076, hp: 11759, critRate: 0, mp: 1000 },
```

---

### 3. 🎮 **src/data/data_char.js** (CRITIQUE)
**Ligne approximative**: Après ligne 91 (après 'kanae')

**Action**: Ajouter les informations simplifiées du personnage

```javascript
'frieren': {
  name: 'Frieren',
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820684/frieren_portrait_jtvtcd.png',
  icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820684/frieren_portrait_jtvtcd.png',
  class: 'Support',
  grade: 'SSR',
  element: 'Water',
  scaleStat: 'Defense'
},
```

---

### 4. 🧠 **src/utils/statPriority.js** (IMPORTANT)
**Ligne approximative**: Chercher la section avec les personnages SSR

**Action**: Ajouter la configuration complète de priorisation des stats pour Frieren

**Template basé sur un Support/Defense character**:
```javascript
"frieren": {
  "name": "Frieren",
  "element": "Water",
  "class": "Support",
  "grade": "SSR",

  // 🎯 STATS PRIORITAIRES
  "statPriority": [
    {
      stat: "Defense",
      priority: 1,
      target: "maximum_possible",
      reason: "Prioriser Defense au maximum (scaleStat)",
      description: "Frieren scale sur Defense - maximise cette stat avant tout"
    },
    {
      stat: "Defense %",
      priority: 2,
      target: "maximum_possible",
      reason: "Prioriser Defense au maximum (scaleStat)",
      description: "Frieren scale sur Defense - maximise cette stat avant tout"
    },
    {
      stat: "Damage Increase",
      priority: 3,
      target: 5000,
      reason: "Augmente les dégâts globaux"
    },
    {
      stat: "Critical Hit Damage",
      priority: 4,
      target: 20000,
      reason: "Optimise les critiques"
    },
    {
      stat: "Critical Hit Rate",
      priority: 5,
      target: 10000,
      reason: "Taux de critique optimal"
    },
    {
      stat: "Defense Penetration",
      priority: 6,
      target: 2000,
      reason: "Pénétration défense utile"
    }
  ],

  // 📊 STATS RECOMMANDÉES
  "recommendedStats": {
    "criticalHitRate": "80-100%",
    "criticalHitDamage": "180% - 200%",
    "DamageIncrease": "30% +",
    "defensePenetration": "15% - 25%",
    "defense": "Maximum possible"
  },

  // 🎯 ARTEFACTS RECOMMANDÉS
  "recommendedArtifacts": {
    "left": {
      "helmet": "Guardian",
      "armor": "Guardian",
      "gloves": "Guardian",
      "boots": "Guardian"
    },
    "right": {
      "necklace": "Sylph",
      "bracelet": "Sylph",
      "ring": "Sylph",
      "earrings": "Sylph"
    },
    "setBonus": {
      "primary": "Guardian 4-Piece",
      "secondary": "Sylph 4-Piece"
    }
  },

  // 🎁 MAIN STATS PAR SLOT
  "mainStatRecommendations": {
    "helmet": ["Defense %", "HP %"],
    "armor": ["Defense %", "HP %"],
    "gloves": ["Defense %", "Critical Hit Rate"],
    "boots": ["Defense %", "HP %"],
    "necklace": ["Critical Hit Damage", "Defense %"],
    "bracelet": ["Defense %", "Critical Hit Rate"],
    "ring": ["Defense %", "Critical Hit Damage"],
    "earrings": ["Defense %", "Critical Hit Rate"]
  },

  // 💡 CONSEILS BÉRU
  "beruAdvice": {
    "newbie": "Frieren est un Support défensif Water ! Focus total sur Defense !",
    "intermediate": "Scale sur Defense + bon taux de crit ! Guardian + Sylph sets !",
    "advanced": "Build : 4x Guardian (gauche) + 4x Sylph (droite). Maximise Defense !",
    "expert": "Optimise les substats Defense % et maintiens 80-100% crit rate !"
  }
}
```

---

### 5. 🎨 **src/pages/DrawBeru/config/models.js** (OPTIONNEL)
**Action**: Ajouter Frieren au système de coloriage DrawBeru

```javascript
Frieren: {
  name: "Frieren",
  description: "Mage elfe de Frieren: Beyond Journey's End",
  models: {
    default: {
      id: "default",
      name: "Frieren Default",
      reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820684/frieren_portrait_jtvtcd.png",
      template: "URL_TEMPLATE_NON_COLORE", // À ajouter si disponible
      canvasSize: { width: 1024, height: 1536 },
      palette: {
        primary: ["#FFFFFF", "#E8E8E8", "#D0D0D0"], // Cheveux blancs
        secondary: ["#4A5568", "#2D3748", "#1A202C"], // Vêtements
        accent: ["#48BB78", "#38A169", "#2F855A"] // Accents verts
      }
    }
  }
}
```

---

### 6. 🌍 **src/i18n/fr.json** (OPTIONNEL)
**Action**: Ajouter une phrase Gagold mentionnant Frieren (optionnel, pour l'easter egg)

Chercher la section avec les phrases Gagold et ajouter quelque chose comme:
```json
"Frieren sait que la défense est la meilleure attaque. Surtout contre le temps."
```

---

### 7. 📦 **src/data/builder_data.js** (CRITIQUE)
**Ligne**: Chercher la section mapping des noms

**Action**: Ajouter le mapping du nom dans l'objet qui convertit les noms affichés en IDs internes

```javascript
'Frieren': 'frieren',
```

---

### 8. 🎯 **src/data/itemData.js** (Vérification recommandée)
**Action**: Vérifier si les sets "Guardian" et "Sylph" sont correctement définis. Pas de modification nécessaire normalement.

---

### 9. 📊 **Fichiers de Presets BDG/POD** (Optionnel)
- `src/components/ScoreCard/bdgPresets.json`
- `src/components/ScoreCard/podPresets.json`

**Action**: Ajouter des presets de build pour Frieren si nécessaire (peut être fait plus tard après tests)

---

### 10. 🧪 **src/utils/BeruIntelligentAnalysis.js** (Vérification)
**Action**: Vérifier que l'IA d'analyse gère correctement les personnages Defense-scaling Water Support. Normalement pas de modification nécessaire.

---

## Ordre de Modification Recommandé

### Phase 1: Données de Base (CRITIQUE)
1. ✅ **characterStats.js** - Ajouter stats de base
2. ✅ **data_char.js** - Ajouter infos simplifiées
3. ✅ **characters.js** - Ajouter entrée complète
4. ✅ **builder_data.js** - Ajouter mapping du nom

### Phase 2: Configuration Avancée (IMPORTANT)
5. ✅ **statPriority.js** - Ajouter priorisation des stats complète

### Phase 3: Features Optionnelles
6. ⚠️ **models.js** (DrawBeru) - Si template de coloriage disponible
7. ⚠️ **fr.json** (i18n) - Easter egg Gagold
8. ⚠️ **Presets BDG/POD** - Après tests en jeu

---

## Checklist de Vérification Post-Ajout

- [ ] Le personnage apparaît dans le sélecteur de personnages
- [ ] Les stats s'affichent correctement dans le builder
- [ ] Les recommandations de sets apparaissent (Guardian + Sylph)
- [ ] Le scaleStat "Defense" est bien pris en compte dans les calculs
- [ ] L'élément "Water" s'affiche correctement
- [ ] La classe "Support" est reconnue
- [ ] Les limites BDG sont cohérentes avec d'autres supports
- [ ] Pas d'erreurs console au chargement
- [ ] L'image du portrait s'affiche correctement
- [ ] Le système de priorisation des stats fonctionne

---

## Notes Importantes

### Pour Stark et Fern après Frieren:
Une fois que Frieren fonctionne parfaitement, on utilisera le même process pour:
- **Stark** (probablement Fighter, Fire ou Wind, Attack scaling)
- **Fern** (probablement Mage, Dark ou Water, Attack scaling)

### Stats BDG à Ajuster
Les `bdgLimits` fournis sont des estimations basées sur d'autres supports similaires. Ils devront être ajustés après tests en jeu:
- Support Water similaire à Jinah: 15B on-element, 4B off-element
- À confirmer selon le gameplay réel de Frieren

### Skill Multipliers
Les multiplicateurs de compétences utilisent des valeurs par défaut. Si tu as les vrais multiplicateurs de Frieren dans le jeu, remplace-les !

---

## Status

- ✅ Analyse complète effectuée
- ✅ Plan documenté
- ✅ **Frieren IMPLÉMENTÉ**
- ✅ **Stark IMPLÉMENTÉ**
- ✅ **Fern IMPLÉMENTÉ**

---

## Résumé de l'implémentation

### ✅ Frieren (Support Water Defense-scaling)
- **characterStats.js**: Stats de base ajoutées (attack: 5833, defense: 9076, hp: 11759)
- **data_char.js**: Infos simplifiées ajoutées
- **characters.js**: Entrée complète avec buffs, multipliers, bdgLimits
- **builder_data.js**: Configuration complète avec optimizationPriority, gameModes (Guardian/Sylph), artifactSets
- **Sets recommandés**: 4x Guardian (gauche) + 4x Sylph (droite)
- **BDG Limits**: 15B on-element, 4B off-element

### ✅ Stark (Break Fire HP-scaling)
- **characterStats.js**: Stats de base ajoutées (attack: 5757, defense: 5604, hp: 18874)
- **data_char.js**: Infos simplifiées ajoutées avec classe "Break"
- **characters.js**: Entrée complète avec buffs Fire Break, multipliers, bdgLimits
- **builder_data.js**: Configuration complète avec optimizationPriority HP-focused
- **Sets recommandés**:
  - BDG: 8x Desire
  - Portail/Général: 4x Armed + 4x Obsidian
- **BDG Limits**: 14B on-element, 4B off-element

### ✅ Fern (DPS Fire Attack-scaling)
- **characterStats.js**: Stats de base ajoutées (attack: 9057, defense: 5519, hp: 12468)
- **data_char.js**: Infos simplifiées ajoutées avec classe "DPS"
- **characters.js**: Entrée complète avec buffs Fire Attack/Damage, multipliers, bdgLimits
- **builder_data.js**: Configuration complète avec optimizationPriority Attack-focused
- **Sets recommandés**:
  - BDG: 4x Armed + 4x Expert
  - Général/POD: 8x Chaotic Infamy
- **BDG Limits**: 13B on-element, 4B off-element

---

## Notes Techniques

### Nouvelle classe "Break"
Stark introduit la classe "Break" qui n'existait peut-être pas avant. Vérifier que le système gère correctement cette classe dans:
- Les filtres de personnages
- Les recommandations de build
- L'UI du builder

### Structure de Buffs
Les 3 personnages utilisent la nouvelle structure de buffs avec `effects: []` (identique à Jinah, Lennart, Goto).

### Scaling Stats
- **Frieren**: Defense scaling (rare mais supporté)
- **Stark**: HP scaling (premier personnage HP-scaling !)
- **Fern**: Attack scaling (standard DPS)

---

**Tous les personnages Frieren: Beyond Journey's End sont implémentés ! 🔥**
**Prêt pour les tests, Kaisel ! 🥺**
