# CreateYourOwnBoss — Boss Editor for Expedition

## Vision

Un éditeur visuel permettant de **créer, configurer et tester** des boss d'expédition personnalisés directement depuis le navigateur. L'objectif final : remplacer progressivement les boss hardcodés par des boss créés et validés via cet éditeur.

**Route**: `/forge/boss-editor` (sous-page de la Forge du Monarque)
**Accès**: Admin uniquement (phase 1), puis ouvert à la communauté (phase 2)

---

## Architecture Globale

```
┌──────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                         │
│  /forge/boss-editor                                       │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Boss Config  │  │ Pattern      │  │ Test Arena       │ │
│  │ Panel        │  │ Sequencer    │  │ (Spectator UX)   │ │
│  │              │  │              │  │                   │ │
│  │ • Sprite     │  │ • Drag/drop  │  │ • Live 2D canvas │ │
│  │ • Stats      │  │ • Timeline   │  │ • 30 bot hunters │ │
│  │ • Phases     │  │ • Parameters │  │ • Real-time sim  │ │
│  │ • Map/BG     │  │ • Preview    │  │ • Full spectator │ │
│  │ • Hitbox     │  │              │  │   UI (buffs,etc) │ │
│  └─────────────┘  └──────────────┘  └──────────────────┘ │
│                          │                                 │
│                     Save/Load                              │
│                          │                                 │
│              ┌───────────▼───────────┐                     │
│              │  API: POST/GET        │                     │
│              │  /api/boss-editor/*   │                     │
│              └───────────┬───────────┘                     │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ DO Server   │
                    │ (Express)   │
                    │             │
                    │ • CRUD boss │
                    │ • Sprites   │
                    │ • Maps      │
                    │ • Test sim  │
                    │ • Export →  │
                    │   expedition│
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │             │
                    │ boss_drafts │
                    │ boss_sprites│
                    │ boss_maps   │
                    └─────────────┘
```

---

## Système de Patterns Existant (Référence)

### 15 Types de Patterns Implémentés

| # | Type | Forme | Paramètres Clés | Visuel |
|---|------|-------|-----------------|--------|
| 1 | `cone_telegraph` | Cône frontal | `coneAngle` (60-140°), `range` (180-350px) | Arc coloré |
| 2 | `aoe_ring` | Anneau circulaire | `innerRadius`, `outerRadius` (0-600px) | Cercle expansif |
| 3 | `donut` | Donut (safe inside) | `innerSafe` (150-250px), `outerRadius` (600px) | Anneau + zone safe |
| 4 | `double_donut` | 2 phases (Manaya) | Phase1: 120-360px lethal, Phase2: inverse | Double telegraph |
| 5 | `line_telegraph` | Ligne droite | `range` (800-1000px), `lineWidth` (50-120px) | Rectangle allongé |
| 6 | `targeted_aoe_multi` | Cercles ciblés | `targetCount` (3-6), `aoeRadius` (100-130px) | N cercles sur hunters |
| 7 | `fire_wave` | Onde expansive | `maxRadius` (450-550px), `duration` (2-2.5s) | Cercle grandissant |
| 8 | `laser` | Rayon fixe | `range` (800-900px), `lineWidth` (50-70px), `laserColor` | Trait lumineux |
| 9 | `rotating_laser` | Rayon rotatif | `rotationSpeed` (1.2-2.0 rad/s), `duration` (5-8s) | Trait qui tourne |
| 10 | `persistent_aoe` | Zone au sol DoT | `aoeRadius` (120-180px), `duration` (8-12s), `tickInterval` | Zone persistante |
| 11 | `aoe_full` | Dégâts raid + spawn | `spawnsAdds` { type, count }, `power` | Flash plein écran |
| 12 | `dps_check` | Test DPS | `dpsThreshold` (4-5.5M), `healPercent`, `staggerDuration` | Barre de cast |
| 13 | `percent_hp_attack` | %HP true damage | `targetHpPercent` (5-10%), `outerRadius`, `innerSafe` | Zone rouge |
| 14 | `soul_drain` | Drain + heal boss | `drainPercent` (3-4%), `healMultiplier` (2-3x) | Canal violet |
| 15 | `shadow_mark` | Marques spread | `targetCount` (3-5), `explodeRadius` (120-150px), `markDuration` | Icônes sur hunters |

### Propriétés Communes à Tous les Patterns

```javascript
{
  id: string,               // Identifiant unique
  name: string,             // Nom affiché
  type: string,             // Un des 15 types ci-dessus

  // Timing (3-state machine: telegraph → cast → recovery)
  telegraphTime: 0.8-3.0,   // Durée du telegraph (warning visuel)
  castTime: 0.2-1.0,        // Durée du cast (dégâts appliqués)
  recoveryTime: 0.5-2.0,    // Temps de repos après
  cooldown: 5-90,           // Cooldown avant réutilisation

  // Dégâts
  power: 1.0-5.0,           // Multiplicateur (ATK × power)
  isTrueDamage: bool,       // Ignore la DEF

  // Disponibilité
  phases: [0, 1, 2, ...],   // Phases où le pattern est dispo
  weight: 1-4,              // Fréquence de sélection (weighted random)

  // Effets
  appliesDebuff: { type, value, duration },
  spawnsAdds: { type, count },

  // Visuel
  visualColor: string,
  laserColor: string,
  waveColor: string,
}
```

### Lifecycle d'un Pattern (Engine)

```
IDLE → [weighted random selection] → TELEGRAPH (timer) → CAST (execute) → RECOVERY → IDLE
         ↑ cooldown check                ↑ visual shown      ↑ damage dealt
         ↑ phase check                   ↑ bot AI reacts     ↑ debuffs applied
```

---

## Boss Editor — Panels de Configuration

### Panel 1: Identité du Boss

```
┌────────────────────────────────────────────┐
│  IDENTITÉ DU BOSS                          │
│                                            │
│  Nom: [________________]                   │
│  Description: [________________________]   │
│                                            │
│  Sprite: [Upload] [Preview]    ← PNG/WebP  │
│    Taille affichée: [====●====] 50-200px   │
│    Hitbox radius:   [====●====] 40-150px   │
│    Couleur fallback: [■ #ff6b35]           │
│                                            │
│  Map / Background:                         │
│    [Upload] [Preview]          ← 1600×1200 │
│    Thème: [Forêt ▼] [Abîme] [Néant] [Custom] │
│                                            │
│  Son ambiance: [Upload .mp3] (optionnel)   │
└────────────────────────────────────────────┘
```

**Contraintes sprite/hitbox:**
- Sprite min: 50×50px, max: 400×400px
- Hitbox radius: min 40px (petit boss), max 150px (gros boss comme Ragnaros)
- Le hitbox doit être ≤ taille sprite (pas de hitbox invisible)
- Upload: max 500KB PNG/WebP, stocké sur DO `/opt/manaya-raid/public/cdn/bosses/`

### Panel 2: Stats du Boss

```
┌────────────────────────────────────────────┐
│  STATS GLOBALES                            │
│                                            │
│  HP:  [==========●=] 500M - 15B           │
│        Scaling joueurs: [x] auto           │
│        (HP × nbJoueurs/5)                  │
│                                            │
│  ATK: [====●========] 8K - 50K            │
│  DEF: [====●========] 100 - 800           │
│  SPD: [====●========] 20 - 80             │
│                                            │
│  Enrage Timer:  [===●=====] 120s - 900s   │
│  Enrage DMG×:   [====●====] 1.5x - 3.0x  │
│  Enrage SPD×:   [====●====] 1.5x - 3.0x  │
│  Enrage %HP:    [====●====] 3% - 10%      │
│                                            │
│  Auto-Attack:                              │
│    Power:    [====●====] 0.5 - 3.0        │
│    Range:    [====●====] 80 - 200px       │
│    Interval: [====●====] 1.0 - 4.0s       │
│    Cone:     [====●====] 40° - 120°       │
│                                            │
│  Ancrage centre: [x] (revient au centre)  │
└────────────────────────────────────────────┘
```

### Panel 3: Phases

```
┌────────────────────────────────────────────┐
│  PHASES (min 1, max 8)                     │
│                                            │
│  [+ Ajouter Phase]                         │
│                                            │
│  Phase 1: "Éveil"     HP: 100% ────────── │
│    ├─ Invincibilité transition: 3s         │
│    ├─ Speed stack: +0                      │
│    └─ Patterns dispo: [root_slam] [vine..] │
│                                            │
│  Phase 2: "Fureur"    HP: 60% ─────────── │
│    ├─ Invincibilité transition: 3s         │
│    ├─ Speed stack: +1                      │
│    ├─ ATK boost: +20%                      │
│    └─ Patterns dispo: [+ nature_laser] ... │
│                                            │
│  Phase 3: "Rage"      HP: 25% ─────────── │
│    ├─ Boss buff: [ATK +30%] [SPD +20%]    │
│    └─ Patterns: [ancient_slam] [triple_..] │
│                                            │
│  [Glisser pour réordonner]                 │
└────────────────────────────────────────────┘
```

### Panel 4: Pattern Sequencer (Le Coeur de l'Éditeur)

```
┌────────────────────────────────────────────────────────────┐
│  PATTERN SEQUENCER                                          │
│                                                             │
│  Bibliothèque de Patterns:                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 🔺 Cône  │ │ ⭕ Ring  │ │ 🍩 Donut │ │ ━━ Ligne │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 🎯 Ciblé │ │ 🌊 Onde  │ │ ⚡ Laser │ │ 🔄 Rotatif│     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 🔥 DoT   │ │ 👹 Adds  │ │ 📊 DPS   │ │ 💀 %HP   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐                                  │
│  │ 🩸 Drain │ │ ⚠️ Mark  │                                  │
│  └──────────┘ └──────────┘                                  │
│                                                             │
│  ─── Patterns du Boss (drag & drop) ───────────────────    │
│                                                             │
│  [Phase 1]  [Phase 2]  [Phase 3]  [All Phases]             │
│                                                             │
│  ┌──────────────────────────────────────────────┐           │
│  │ #1 Frappe de Racine (cone_telegraph)    [⚙️]│ W:3       │
│  │ #2 Fouet de Lianes (aoe_ring)           [⚙️]│ W:2       │
│  │ #3 Pluie d'Épines (targeted_aoe_multi)  [⚙️]│ W:2       │
│  │ #4 Laser Nature (laser)                 [⚙️]│ W:1       │
│  │ [+ Ajouter Pattern]                          │           │
│  └──────────────────────────────────────────────┘           │
│                                                             │
│  ─── Configuration Pattern Sélectionné ────────────────    │
│                                                             │
│  Pattern: "Frappe de Racine"                                │
│  Type: cone_telegraph                                       │
│                                                             │
│  ┌─ Géométrie ──────────────────────────┐                   │
│  │  Angle:  [====●=====] 70°            │  ┌─────────────┐ │
│  │  Range:  [====●=====] 220px          │  │  PREVIEW     │ │
│  │                                      │  │   ╱  ╲       │ │
│  │  (paramètres varient selon le type)  │  │  ╱ 70°╲      │ │
│  │                                      │  │ ╱──────╲     │ │
│  └──────────────────────────────────────┘  │  220px       │ │
│                                             └─────────────┘ │
│  ┌─ Timing ─────────────────────────────┐                   │
│  │  Telegraph: [====●=====] 1.5s        │                   │
│  │  Cast:      [====●=====] 0.3s        │                   │
│  │  Recovery:  [====●=====] 1.0s        │                   │
│  │  Cooldown:  [====●=====] 8s          │                   │
│  └──────────────────────────────────────┘                   │
│                                                             │
│  ┌─ Dégâts ─────────────────────────────┐                   │
│  │  Power:      [====●=====] 1.8        │                   │
│  │  True Dmg:   [ ] Non                 │                   │
│  └──────────────────────────────────────┘                   │
│                                                             │
│  ┌─ Ciblage ────────────────────────────┐                   │
│  │  Cible: [Plus gros aggro ▼]          │                   │
│  │    Options:                           │                   │
│  │    • Plus gros aggro (défaut)         │                   │
│  │    • Aléatoire                        │                   │
│  │    • Plus gros DPS                    │                   │
│  │    • Plus gros heal                   │                   │
│  │    • Plus faible HP%                  │                   │
│  │    • Champ de vision (cône devant)    │                   │
│  │    • Tous (raid-wide)                 │                   │
│  │  Nb cibles: [====●=====] 1-10        │                   │
│  └──────────────────────────────────────┘                   │
│                                                             │
│  ┌─ Effets ─────────────────────────────┐                   │
│  │  [+ Debuff]  [+ Spawn Adds]          │                   │
│  │                                      │                   │
│  │  Debuff: poison                      │                   │
│  │    Value: 15 dmg/tick                │                   │
│  │    Durée: 8s                         │                   │
│  │    Tick: 2s                          │                   │
│  │                                      │                   │
│  │  Boss Buff pendant cast:             │                   │
│  │    [+ Shield]  [+ ATK Up]            │                   │
│  │    [+ Invincible]  [+ Speed Up]      │                   │
│  └──────────────────────────────────────┘                   │
│                                                             │
│  ┌─ Disponibilité ──────────────────────┐                   │
│  │  Phases: [x]1 [x]2 [ ]3             │                   │
│  │  Weight: [====●=====] 3              │                   │
│  └──────────────────────────────────────┘                   │
└────────────────────────────────────────────────────────────┘
```

### Panel 5: Test Arena

```
┌────────────────────────────────────────────────────────────┐
│  TEST ARENA                                                 │
│                                                             │
│  [▶ Lancer Test]  [⏸ Pause]  [⏹ Stop]  [⚡ Speed ×2]     │
│                                                             │
│  Hunters de test:                                           │
│    Nb joueurs: [1] [2] [3] [4] [5]                         │
│    Niveau moyen: [====●=====] 50-100                       │
│    Stars moyen:  [====●=====] 0-5                          │
│    Équipement:   [Basique ▼] [Moyen] [Endgame]            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │              *** SPECTATOR VIEW ***                   │  │
│  │                                                      │  │
│  │    (Même UX que expedition spectator.html)           │  │
│  │    Canvas 2D, boss au centre, 30 hunters,            │  │
│  │    telegraph visuels, HP bars, buffs, DPS meter      │  │
│  │                                                      │  │
│  │    + Overlay: pattern en cours, timing, phase        │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Stats Live ─────────────────────────┐                   │
│  │  Boss HP: ████████░░ 67%  Phase 2    │                   │
│  │  Timer: 4:32 / 10:00                 │                   │
│  │  Hunters alive: 24/30                │                   │
│  │  Team DPS: 3.2M/s                    │                   │
│  │  Deaths: 6                           │                   │
│  │  Pattern en cours: Laser Nature      │                   │
│  │  Prochain pattern dans: 2.3s         │                   │
│  └──────────────────────────────────────┘                   │
│                                                             │
│  ┌─ Résultat Test ──────────────────────┐                   │
│  │  Durée combat: 5:23                  │                   │
│  │  Résultat: ✅ Boss tué / ❌ Wipe      │                   │
│  │  Deaths total: 12                    │                   │
│  │  Pattern le + mortel: Donut (8 kills)│                   │
│  │  Phase la + longue: Phase 2 (2:10)  │                   │
│  │  DPS moyen: 2.8M/s                  │                   │
│  │  Suggestion: "Boss trop facile,      │                   │
│  │   augmenter HP ou ATK"              │                   │
│  └──────────────────────────────────────┘                   │
└────────────────────────────────────────────────────────────┘
```

---

## Système de Ciblage (Nouveau)

Le système actuel cible toujours le plus gros aggro. L'éditeur permettra de configurer le ciblage par pattern :

| Ciblage | Description | Usage |
|---------|-------------|-------|
| `highest_aggro` | Tank/aggro classique (défaut) | Auto-attacks, la plupart des patterns |
| `random` | Cible(s) aléatoire(s) | Zones AoE, marks |
| `highest_dps` | Celui qui fait le + de dégâts | Punir les DPS, forcer spread |
| `highest_heal` | Le meilleur healer | Anti-heal mechanic |
| `lowest_hp_percent` | Le + faible en %HP | Exécution, finisher |
| `farthest` | Le plus éloigné | Forcer les ranged à bouger |
| `nearest` | Le plus proche | Cleave melee |
| `in_cone` | Dans le champ de vision | Attaques frontales réalistes |
| `all` | Tous les hunters | Raid-wide damage |
| `non_tank` | Tous sauf tanks | Bypass aggro |

---

## Système de Buffs/Debuffs Boss

### Buffs que le Boss peut se donner

| Buff | Effet | Paramètres |
|------|-------|------------|
| `boss_atk_up` | +X% ATK | `value` (0.1-1.0), `duration` (5-30s), `stacks` |
| `boss_spd_up` | +X% SPD | `value` (0.1-0.5), `duration` |
| `boss_shield` | Bouclier HP | `shieldHp` (flat), `duration` |
| `boss_invincible` | Invincible | `duration` (1-5s) |
| `boss_reflect` | Réfléchit X% dégâts | `value` (0.1-0.5), `duration` |
| `boss_regen` | Régén HP/s | `value` (% maxHP/s), `duration` |
| `boss_enrage_stack` | Stack permanent | ATK +X% per stack, no expiry |

### Debuffs sur les Hunters

| Debuff | Effet | Paramètres |
|--------|-------|------------|
| `poison` | DoT (X dmg / tick) | `damage`, `tickInterval`, `duration` |
| `speed_down` | Slow X% | `value` (0.1-0.7), `duration` |
| `atk_down` | -X% ATK | `value`, `duration` |
| `def_down` | -X% DEF | `value`, `duration` |
| `silence` | Pas de skills | `duration` |
| `bleed` | DoT % maxHP | `value` (% maxHP/tick), `tickInterval`, `duration` |
| `fear` | Mouvement aléatoire | `duration` |
| `stun` | Immobilisé | `duration` |
| `mark_explode` | Explose après X sec | `delay`, `radius`, `power` |
| `heal_reduction` | Réduit soins reçus | `value`, `duration` |

---

## Stockage & Persistence

### Base de Données

```sql
-- Brouillons de boss (sauvegarde auto)
CREATE TABLE boss_drafts (
  id SERIAL PRIMARY KEY,
  author_username TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL,        -- Toute la config du boss (stats, phases, patterns)
  sprite_url TEXT,               -- URL du sprite sur CDN
  map_url TEXT,                  -- URL de la map custom
  status TEXT DEFAULT 'draft',   -- draft | testing | validated | deployed
  version INT DEFAULT 1,
  test_results JSONB,            -- Résultats des derniers tests
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets uploadés
CREATE TABLE boss_assets (
  id SERIAL PRIMARY KEY,
  boss_draft_id INT REFERENCES boss_drafts(id),
  type TEXT NOT NULL,             -- 'sprite' | 'map' | 'sound'
  filename TEXT NOT NULL,
  url TEXT NOT NULL,              -- CDN path
  size_bytes INT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Format JSONB `config`

```javascript
{
  // Identité
  name: "Gardien de la Forêt",
  spriteId: "gardien_foret",
  color: "#22c55e",
  radius: 75,

  // Stats
  maxHp: 1_300_000_000,
  hpScaling: true,          // Scale avec nb joueurs
  atk: 12000,
  def: 200,
  spd: 45,

  // Enrage
  enrageTimer: 600,
  enrageDmgMult: 2.0,
  enrageSpdMult: 2.0,
  enrageHpPercent: 5,

  // Auto-attack
  autoAttack: {
    power: 1.0,
    range: 120,
    interval: 2.0,
    coneAngle: 60,
  },

  // Comportement
  anchorCenter: true,

  // Phases (array ordonné par %HP décroissant)
  phases: [
    { hpPercent: 100, label: "Phase 1 - Éveil", buffs: [] },
    { hpPercent: 60,  label: "Phase 2 - Fureur", buffs: [{ type: 'boss_atk_up', value: 0.2 }] },
    { hpPercent: 25,  label: "Phase 3 - Rage",   buffs: [{ type: 'boss_spd_up', value: 0.3 }] },
  ],

  // Patterns (array complet)
  patterns: [
    {
      id: "root_slam",
      name: "Frappe de Racine",
      type: "cone_telegraph",
      coneAngle: 70,
      range: 220,
      power: 1.8,
      telegraphTime: 1.5,
      castTime: 0.3,
      recoveryTime: 1.0,
      cooldown: 8,
      phases: [0, 1, 2],
      weight: 3,
      targeting: "highest_aggro",
      visualColor: "green",
    },
    // ... autres patterns
  ],
}
```

### Fichiers sur le Serveur

```
/opt/manaya-raid/public/cdn/bosses/
  ├── sprites/
  │   ├── gardien_foret.webp
  │   ├── custom_boss_42.webp
  │   └── ...
  ├── maps/
  │   ├── forest_bg.webp
  │   ├── custom_map_42.webp
  │   └── ...
  └── sounds/
      └── (optionnel)
```

---

## API Endpoints

### Boss Editor API (`/api/boss-editor/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/boss-editor/drafts` | GET | Liste tous les brouillons de l'auteur |
| `/api/boss-editor/draft` | POST | Créer un nouveau brouillon |
| `/api/boss-editor/draft/:id` | GET | Charger un brouillon |
| `/api/boss-editor/draft/:id` | PUT | Sauvegarder un brouillon |
| `/api/boss-editor/draft/:id` | DELETE | Supprimer un brouillon |
| `/api/boss-editor/upload-sprite` | POST | Upload sprite (multipart) |
| `/api/boss-editor/upload-map` | POST | Upload map background |
| `/api/boss-editor/test/:id` | POST | Lancer un test (crée simulation serveur) |
| `/api/boss-editor/test/:id/state` | GET | État live du test en cours |
| `/api/boss-editor/validate/:id` | POST | Admin: valider un boss |
| `/api/boss-editor/deploy/:id` | POST | Admin: déployer en expédition |
| `/api/boss-editor/templates` | GET | Liste des templates de patterns |

---

## Refonte du Moteur (Compatibilité)

### Problème Actuel

Les boss sont hardcodés dans `bossDefinitions.js`. Le moteur (`ExpeditionBoss.js`, `CombatEngine.js`) lit directement ces définitions. Pour supporter les boss custom, il faut :

### Solution: Boss Definition Loader

```javascript
// Nouveau: BossLoader.js
export class BossLoader {

  // Charger depuis les définitions hardcodées (existant)
  static fromHardcoded(bossIndex) {
    return BOSS_DEFINITIONS[bossIndex];
  }

  // Charger depuis un brouillon JSON (nouveau)
  static fromDraft(draftConfig) {
    // Valider le schéma
    validateBossConfig(draftConfig);
    // Normaliser les patterns (ajouter defaults)
    const patterns = draftConfig.patterns.map(p => ({
      ...getPatternDefaults(p.type),
      ...p,
      _cooldownTimer: 0,
    }));
    // Retourner format compatible ExpeditionBoss
    return {
      ...draftConfig,
      patterns,
    };
  }

  // Charger depuis la DB (boss validé/déployé)
  static async fromDatabase(bossId) {
    const draft = await db.getBossDraft(bossId);
    return BossLoader.fromDraft(draft.config);
  }
}
```

### Changements dans ExpeditionBoss.js

```javascript
// Avant:
constructor(definition) {
  this.name = definition.name;
  this.maxHp = definition.maxHp;
  // ... hardcoded structure
}

// Après:
constructor(definition) {
  // Même interface, mais definition vient de BossLoader
  // Supporte hardcoded ET custom
  this.name = definition.name;
  this.maxHp = definition.maxHp;
  this.patterns = definition.patterns;
  this.phases = definition.phases;
  // Le targeting est maintenant par pattern, pas global
}
```

### Changements dans ExpeditionEngine.js

```javascript
// Avant:
_startCombat(bossIndex) {
  const bossDef = BOSS_DEFINITIONS[bossIndex];
  this.boss = new ExpeditionBoss(bossDef);
}

// Après:
_startCombat(bossIndex) {
  // Support hybride: hardcoded OU custom
  const bossDef = this.customBosses?.[bossIndex]
    ? BossLoader.fromDraft(this.customBosses[bossIndex])
    : BossLoader.fromHardcoded(bossIndex);
  this.boss = new ExpeditionBoss(bossDef);
}
```

### Migration Progressive

1. **Phase 1**: Éditeur crée des JSON, test dans une arène isolée (nouveau PM2 process "boss-test")
2. **Phase 2**: Boss validés peuvent remplacer les boss hardcodés via config DB
3. **Phase 3**: Expédition lit la séquence de boss depuis la DB, plus depuis le code

---

## Test Arena — Architecture Technique

Le test utilise le **même moteur** que l'expédition, mais en mode sandbox :

```
React Boss Editor
     │
     │ POST /api/boss-editor/test/:id
     │ { bossConfig, testParams: { nbPlayers, level, gear } }
     │
     ▼
DO Server (Express)
     │
     │ Crée une instance CombatEngine temporaire
     │ Génère 30 hunters bot avec stats configurées
     │ Lance le combat dans un Worker/setTimeout loop
     │
     │ WebSocket /ws/boss-test/:testId
     │ Broadcast état à 10Hz (même format que spectator)
     │
     ▼
React Test Arena Panel
     │
     │ Même composant canvas que spectator.html
     │ (porté en React ou iframe du spectator)
     │
     ▼
Résultat envoyé à la fin
     │ { duration, result, deaths, patternStats, dpsAvg }
```

### Option d'implémentation: iframe spectator

Pour réutiliser l'UX spectator existante sans la réécrire en React :

```html
<!-- Dans le composant React BossEditor -->
<iframe
  src={`https://manaya.builderberu.com/expedition/spectator?mode=test&testId=${testId}`}
  width="100%"
  height="600px"
/>
```

Le spectator.html détecte `mode=test` et se connecte au WS du test au lieu de l'expédition live.

---

## Phases de Développement

### Phase 1: Éditeur de Configuration (Frontend)
- [ ] Page React `/forge/boss-editor`
- [ ] Panel identité (nom, sprite upload, hitbox slider)
- [ ] Panel stats (sliders HP/ATK/DEF/SPD/enrage)
- [ ] Panel phases (CRUD phases avec seuils HP)
- [ ] Panel pattern sequencer (bibliothèque + config par pattern)
- [ ] Sauvegarde/chargement local (localStorage draft)
- [ ] Preview géométrique des patterns (mini-canvas 2D)

### Phase 2: Backend & Persistence
- [ ] Tables PostgreSQL (boss_drafts, boss_assets)
- [ ] API CRUD brouillons
- [ ] Upload sprites/maps vers CDN DO
- [ ] BossLoader.js (abstraction chargement boss)
- [ ] Validation schéma JSON (empêcher configs invalides)

### Phase 3: Test Arena
- [ ] Endpoint test simulation
- [ ] Instance CombatEngine sandbox (isolée de l'expédition)
- [ ] WS broadcast du test
- [ ] Intégration spectator (iframe ou port React)
- [ ] Stats post-test (durée, deaths, pattern lethality)

### Phase 4: Déploiement en Expédition
- [ ] ExpeditionEngine: support boss custom depuis DB
- [ ] Interface admin validation
- [ ] Remplacement progressif des boss hardcodés
- [ ] Versioning des boss (rollback possible)

---

## Compatibilité avec l'Existant

| Composant | Impact | Changement |
|-----------|--------|------------|
| `ExpeditionBoss.js` | Moyen | Accepter definition de BossLoader au lieu de hardcoded |
| `CombatEngine.js` | Faible | Aucun changement si BossLoader retourne le même format |
| `BotAI.js` | Faible | Dodge logic déjà générique par pattern type |
| `GameState.js` | Aucun | Snapshot format inchangé |
| `spectator.html` | Faible | Supporter sprite custom (URL au lieu de spriteId) |
| `PassiveEngine.js` | Aucun | Hunters unchanged |
| `bossDefinitions.js` | Préservé | Reste comme fallback, progressivement remplacé |
| `WaveGenerator.js` | Aucun (phase 1) | Mob waves inchangées pour l'instant |

---

## Estimation de Complexité

| Phase | Effort | Fichiers | Priorité |
|-------|--------|----------|----------|
| Phase 1: UI Éditeur | **Gros** (800-1200 lignes React) | 3-5 nouveaux composants | **Haute** |
| Phase 2: Backend | **Moyen** (300-500 lignes) | 2 API handlers + 1 DB migration | **Haute** |
| Phase 3: Test Arena | **Gros** (500-800 lignes) | 1 sandbox engine + WS | **Moyenne** |
| Phase 4: Déploiement | **Faible** (100-200 lignes) | BossLoader + minor edits | **Basse** |

---

## ÉTUDE D'IMPACT DÉTAILLÉE — Changements pour l'Expédition Actuelle

> **Objectif** : l'expédition actuelle DOIT continuer de tourner exactement comme aujourd'hui.
> Les boss custom sont un **ajout**, pas un remplacement. Aucun fichier existant ne doit casser.

---

### Fichier 1: `CombatInstance.js` (POINT D'ENTRÉE CRITIQUE)

**Localisation**: `expedition-server/src/engine/CombatInstance.js`
**Rôle**: Crée une instance de combat pour UN boss. C'est lui qui appelle `getBossDefinition()`.

**Code actuel (ligne 18)**:
```javascript
const bossDef = getBossDefinition(bossIndex);
const boss = new ExpeditionBoss(bossDef, hunterCount);
```

**Changement nécessaire**:
```javascript
// Accepter soit un bossIndex (int → hardcoded), soit un bossConfig (object → custom)
constructor(hunters, bossIndexOrConfig, hunterCount, onEnd) {
    let bossDef;
    if (typeof bossIndexOrConfig === 'object') {
      // Custom boss from editor
      bossDef = bossIndexOrConfig;
    } else {
      // Hardcoded boss (expedition classique)
      bossDef = getBossDefinition(bossIndexOrConfig);
    }
    const boss = new ExpeditionBoss(bossDef, hunterCount);
    // ... reste inchangé
}
```

**Impact**: AUCUN sur l'expédition actuelle — l'appel avec un `int` fonctionne toujours.

---

### Fichier 2: `ExpeditionBoss.js` (LE BOSS ENTITY)

**Localisation**: `expedition-server/src/entities/ExpeditionBoss.js`
**Rôle**: Entité boss avec patterns, phases, auto-attack, targeting.

**Ce qui NE CHANGE PAS** (compatible tel quel):
- `constructor(definition, hunterCount)` — accepte déjà un objet générique
- `this.allPatterns = definition.patterns.map(...)` — déjà dynamique
- `this.phaseDefinitions = definition.phases` — déjà dynamique
- `_tryStartPattern()` — sélection weighted random, déjà générique
- `_updatePattern()` — lifecycle telegraph→cast→recovery, déjà générique
- `_executePattern()` — switch sur `pattern.type`, TOUTES les branches existent déjà

**Ce qui DOIT CHANGER** (ajouts):

1. **Targeting par pattern** (actuellement global highest_aggro):
```javascript
// AVANT (ligne ~120 dans _executePattern):
const target = gameState.getHighestAggroTarget();

// APRÈS:
_getTarget(pattern, gameState) {
    const targeting = pattern.targeting || 'highest_aggro';
    switch (targeting) {
      case 'highest_aggro': return gameState.getHighestAggroTarget();
      case 'random': return this._randomAliveHunter(gameState);
      case 'highest_dps': return this._highestStatHunter(gameState, 'damageDealt');
      case 'highest_heal': return this._highestStatHunter(gameState, 'healingDone');
      case 'lowest_hp_percent': return this._lowestHpPercentHunter(gameState);
      case 'farthest': return this._farthestHunter(gameState);
      case 'nearest': return this._nearestHunter(gameState);
      case 'all': return null; // raid-wide, no specific target
      default: return gameState.getHighestAggroTarget();
    }
}
```

**Impact**: Les boss hardcodés n'ont pas de `pattern.targeting` → fallback `'highest_aggro'` → AUCUN changement de comportement.

2. **Sprite custom** (URL au lieu de spriteId string):
```javascript
// AVANT:
this.spriteId = definition.sprite || null;

// APRÈS (rétrocompatible):
this.spriteId = definition.sprite || null;
this.spriteUrl = definition.spriteUrl || null;  // Nouveau: URL directe pour custom
```

**Impact**: Les boss hardcodés n'ont pas `spriteUrl` → null → spectator utilise spriteId comme avant.

3. **Map custom**:
```javascript
// Nouveau champ:
this.mapBg = definition.mapBg || null;  // URL background custom
```

**Impact**: null par défaut → spectator utilise le fond par défaut.

---

### Fichier 3: `bossDefinitions.js` (INCHANGÉ)

**Localisation**: `expedition-server/src/data/bossDefinitions.js`
**Rôle**: Définitions hardcodées des 5 boss actuels.

**Changement**: **AUCUN**. Ce fichier reste tel quel. Il sert de fallback quand on utilise `getBossDefinition(index)`. Les boss custom passent par un chemin différent (JSONB depuis la DB ou direct object).

---

### Fichier 4: `ExpeditionEngine.js` (PETIT CHANGEMENT)

**Localisation**: `expedition-server/src/engine/ExpeditionEngine.js`
**Rôle**: Orchestrateur principal du cycle de vie.

**Code actuel (dans _startCombat, appelé indirectement)**:
```javascript
// L'appel passe par CombatInstance qui fait getBossDefinition(bossIndex)
this.currentCombat = new CombatInstance(
    aliveHunters, this.currentBossIndex, totalHunters, (result) => { ... }
);
```

**Changement nécessaire pour supporter boss custom**:
```javascript
_startCombat() {
    const bossIndex = this.currentBossIndex;
    // Si l'expédition a des boss custom (configuré au lancement), utiliser le config
    const bossConfig = this.customBossSequence?.[bossIndex] || bossIndex;

    this.currentCombat = new CombatInstance(
        aliveHunters, bossConfig, totalHunters, (result) => { ... }
    );
}
```

**Impact sur l'expé actuelle**: `this.customBossSequence` est `undefined` → `undefined?.[bossIndex]` = `undefined` → `bossConfig = bossIndex` (int) → CombatInstance reçoit un int → `getBossDefinition(int)` → AUCUN changement.

**Pour le Test Arena**: Un endpoint séparé crée un CombatInstance directement avec un objet config, sans passer par ExpeditionEngine du tout. L'expédition live n'est même pas touchée.

---

### Fichier 5: `CombatEngine.js` (AUCUN CHANGEMENT)

**Localisation**: `expedition-server/src/engine/CombatEngine.js`
**Rôle**: Gère les attaques, dégâts, combos, skills des hunters.

**Changement**: **AUCUN**. Le CombatEngine ne connaît pas le boss — il gère les hunters. Le boss est géré par `ExpeditionBoss.js` directement. Le CombatEngine interagit avec le boss via `GameState` (aggro, damage).

---

### Fichier 6: `BotAI.js` (AUCUN CHANGEMENT NÉCESSAIRE)

**Localisation**: `expedition-server/src/engine/BotAI.js`
**Rôle**: IA des 30 hunters (dodge, skill usage, positioning).

**Pourquoi aucun changement**: Le BotAI dodge déjà en se basant sur `pattern.type`:
```javascript
// Déjà dans le code actuel:
switch (pattern.type) {
    case 'cone_telegraph': // dodge sideways
    case 'aoe_ring':       // dodge away
    case 'donut':          // dodge toward boss
    case 'laser':          // dodge perpendicular
    case 'fire_wave':      // outrun
    // etc.
}
```

Les boss custom utilisent les **mêmes 15 types de patterns** → le BotAI sait déjà réagir à tous. Si on ajoute un NOUVEAU type de pattern dans le futur, il faudra ajouter un `case` dans BotAI.

---

### Fichier 7: `GameState.js` (AUCUN CHANGEMENT)

**Localisation**: `expedition-server/src/engine/GameState.js`
**Rôle**: State container + snapshot pour broadcast.

Le snapshot inclut déjà tous les champs nécessaires (boss.telegraph, boss.casting, etc.). Un boss custom produit les mêmes données qu'un boss hardcoded.

---

### Fichier 8: `spectator.html` (PETIT CHANGEMENT)

**Localisation**: `expedition-server/public/spectator.html`
**Rôle**: Client de visualisation canvas 2D.

**Changement nécessaire**:
```javascript
// AVANT (rendering boss sprite):
if (boss.spriteId && sprites[boss.spriteId]) {
    ctx.drawImage(sprites[boss.spriteId], ...);
}

// APRÈS (supporter URL custom):
if (boss.spriteUrl && !sprites[boss.spriteUrl]) {
    // Lazy-load sprite custom
    const img = new Image();
    img.src = boss.spriteUrl;
    img.onload = () => sprites[boss.spriteUrl] = img;
} else if (boss.spriteId && sprites[boss.spriteId]) {
    ctx.drawImage(sprites[boss.spriteId], ...);
}
if (sprites[boss.spriteUrl || boss.spriteId]) {
    ctx.drawImage(sprites[boss.spriteUrl || boss.spriteId], ...);
}
```

**Pour le mode test**: Détecter `?mode=test` dans l'URL et se connecter à un WS différent:
```javascript
const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.get('mode') === 'test';
const testId = urlParams.get('testId');
const wsUrl = isTestMode
    ? `ws://${location.host}/ws/boss-test/${testId}`
    : `ws://${location.host}/ws`;
```

**Impact**: Sans `?mode=test`, le spectator fonctionne exactement comme avant.

---

### Fichier 9: `PhysicsEngine.js` (AUCUN CHANGEMENT)

Gère les collisions, mouvements, positions. Ne connaît pas les boss definitions. Aucun impact.

---

### Fichier 10: `PassiveEngine.js` (AUCUN CHANGEMENT)

Gère les set bonuses, weapon passives des hunters. Ne dépend pas du boss. Aucun impact.

---

### Fichier 11: `config.js` (PETIT AJOUT)

```javascript
// Ajouter pour le test arena:
export const BOSS_TEST = {
    MAX_CONCURRENT_TESTS: 3,        // Max 3 tests simultanés
    TEST_TIMEOUT_MS: 600_000,       // Timeout test: 10 min
    WS_PATH: '/ws/boss-test',       // WebSocket path pour tests
};
```

---

### Fichier 12: `index.js` (AJOUT ENDPOINT TEST)

```javascript
// Ajouter route pour le test arena (séparé de l'expédition):
app.post('/api/boss-editor/test', async (req, res) => {
    const { bossConfig, testParams } = req.body;
    // Crée un CombatInstance isolé avec des bots générés
    // Retourne testId pour WS connection
});
```

**Impact**: Routes additives. Les routes existantes (`/api/expedition/*`) sont intactes.

---

### Fichier 13: `queries.js` (AJOUT QUERIES)

```javascript
// Nouvelles queries pour boss_drafts (table séparée)
export async function saveBossDraft(username, name, config) { ... }
export async function getBossDraft(draftId) { ... }
export async function listBossDrafts(username) { ... }
export async function deleteBossDraft(draftId) { ... }
export async function getDeployedBosses() { ... }  // Pour Phase 4
```

**Impact**: Ajouts purs. Aucune query existante modifiée.

---

### Nouveaux Fichiers à Créer (côté serveur)

| Fichier | Rôle | Lignes estimées |
|---------|------|----------------|
| `src/engine/BossTestArena.js` | Sandbox CombatInstance pour tests | ~150 |
| `src/engine/BossLoader.js` | Chargement boss (hardcoded / custom / DB) | ~80 |
| `src/network/BossTestWS.js` | WebSocket pour broadcast test | ~60 |
| `src/data/patternDefaults.js` | Valeurs par défaut par type de pattern | ~100 |
| `api/boss-editor.js` | Handler API CRUD + upload + test | ~300 |

### Nouveaux Fichiers à Créer (côté React)

| Fichier | Rôle | Lignes estimées |
|---------|------|----------------|
| `src/pages/Forge/BossEditor.jsx` | Page principale éditeur | ~800 |
| `src/pages/Forge/BossEditorPanels/` | Sous-composants | ~600 total |
| `src/pages/Forge/BossTestArena.jsx` | Iframe spectator + contrôles | ~200 |
| `src/data/patternLibrary.js` | Catalogue des 15 types de patterns + UI | ~200 |

---

### Résumé: Matrice de Risque

| Fichier | Modifié? | Risque pour l'expé | Stratégie |
|---------|----------|-------------------|-----------|
| `bossDefinitions.js` | NON | Aucun | Inchangé, fallback permanent |
| `CombatInstance.js` | OUI (3 lignes) | **Très faible** | typeof check, fallback int |
| `ExpeditionBoss.js` | OUI (15 lignes) | **Faible** | Ajouts avec defaults null/fallback |
| `ExpeditionEngine.js` | OUI (2 lignes) | **Très faible** | Optional chaining, undefined = noop |
| `CombatEngine.js` | NON | Aucun | Inchangé |
| `BotAI.js` | NON | Aucun | Déjà générique par pattern type |
| `GameState.js` | NON | Aucun | Inchangé |
| `PhysicsEngine.js` | NON | Aucun | Inchangé |
| `PassiveEngine.js` | NON | Aucun | Inchangé |
| `spectator.html` | OUI (20 lignes) | **Faible** | Ajout spriteUrl lazy-load + test mode |
| `config.js` | OUI (5 lignes) | **Aucun** | Ajout constantes, rien de modifié |
| `index.js` | OUI (30 lignes) | **Faible** | Routes additives |
| `queries.js` | OUI (40 lignes) | **Aucun** | Nouvelles fonctions, rien modifié |

**Total lignes modifiées dans fichiers existants: ~115 lignes**
**Total nouveaux fichiers: ~2500 lignes**

### Procédure de Déploiement Safe

1. **Développer** les nouveaux fichiers (BossLoader, BossTestArena, API, React)
2. **Tester localement** : vérifier que `npm run dev` fonctionne
3. **Modifier les 4 fichiers existants** (CombatInstance, ExpeditionBoss, spectator, index)
4. **Tester l'expédition en local** : lancer un `startBotExpedition()` → vérifier que les 5 boss hardcodés se comportent identiquement
5. **SCP** uniquement les fichiers modifiés + nouveaux
6. **PM2 restart expedition** HORS des heures d'expédition (pas entre 12h-21h Paris)
7. **Vérifier** : inscription fonctionne, spectator affiche, expédition lance à 19h

---

*Document créé le 2026-03-09 — CreateYourOwnBoss v1*
