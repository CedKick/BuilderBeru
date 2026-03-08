# Expedition I — Feature Design Document (v2)

## Concept

**Mode PvE multijoueur en vue top-down** (meme moteur que Manaya Raid).
Chaque joueur controle **6 hunters** et peut switcher entre eux a tout moment.
Les combats sont **en temps reel** — le joueur joue activement, ses 5 autres hunters sont en AI.
L'expedition se lance **tous les jours a 19h** et peut durer **jusqu'a 24h max**.

**Objectif long terme** : ~2 mois de progression collective avant de terminer l'Expedition I en entier.

**Changement majeur vs v1** : On passe de "2D side-scrolling auto-combat passif" a "top-down action RPG controlable" en reutilisant le moteur Manaya (CombatEngine, PhysicsEngine, BotAI, projectiles, AoE, buffs).

---

## Regles de base

| Parametre | Valeur |
|---|---|
| Joueurs max par expedition | 5 |
| Hunters par joueur | 6 (1 controle + 5 AI) |
| Entites max en combat | 30 hunters + boss + adds |
| Nombre de boss | 5 (Phase 1) |
| Duree max par session | 24h |
| Heure de lancement | 19h (quotidien) |
| Nom | Expedition I |

---

## Gameplay

### Deroulement
1. **Avant 19h** — Les joueurs inscrivent 6 hunters chacun, choisissent leurs classes, configurent leur SR
2. **19h** — L'expedition demarre automatiquement
3. **En cours** — Les joueurs jouent activement (controle direct d'un hunter, switch possible)
4. **Fin** — Soit tous les boss sont vaincus, soit 24h ecoulees, soit wipe total

### Vue Top-Down (Canvas)
- Meme rendu que Manaya Raid (canvas 2D, vue de dessus)
- Arena par combat (boss room ou zone de mobs)
- On voit clairement :
  - Les soins (heal VFX, burst circles)
  - Les buffs actifs (icones au-dessus des persos)
  - Les attaques (projectiles, AoE zones, lasers)
  - Les degats infliges (floating numbers)
  - Les morts / resurrections (cast bar)
  - Les mecaniques de boss (telegraphs, safe zones)

### Systeme de Switch de Hunter (Mecanique Core)
- Le joueur controle **1 hunter a la fois** (clavier + souris, memes controles que Manaya)
- Les **5 autres hunters** sont pilotes par **BotAI** (meme AI que les bots Manaya)
- **Touches 1-6** : switch instantane vers un autre hunter
  - La camera suit immediatement le nouveau perso controle
  - L'ancien perso controle repasse en AI
  - Pas de cooldown sur le switch
- **Interet strategique** :
  - Switch healer pour rezz un allie mort (channel 4s = le bot ne sait pas toujours gerer)
  - Switch tank pour taunt le boss au bon moment
  - Switch DPS pour burst une phase critique
  - Switch mage pour teleport et esquiver une mecanique OS

### Classes disponibles (6 classes)
Reprend exactement les classes de Manaya avec leurs skills :

| Classe | Role | Resource | Skills |
|---|---|---|---|
| **Tank** | Frontline, aggro | Mana 400 | Block, Taunt, Party Shield, Fortress |
| **Healer** | Soin, rez, cleanse | Mana 800 | Cercle de Soin (10s CD), Soin de Zone (+25% ATK buff), Purification (+crit/speed), Resurrection (4s channel) |
| **Warrior (dps_cac)** | Melee DPS | Rage 100 | Heavy Strike, Blade Storm, Dash Attack, Execute |
| **Archer (dps_range)** | Ranged DPS | Mana 500 | Charged Shot, Rain of Arrows, Explosive Trap, Barrage |
| **Berserker** | Melee burst | Mana 400 | Charged Attack (hold/release), Buff Self (+80% ATK), Block, Whirlwind |
| **Mage (Frieren)** | Ranged burst/AoE | Mana 600 | Orbe de feu (piercing), Zollstraak (laser), Teleportation, Onde Arcanique (AoE self spam) |

### Composition recommandee (par joueur, 6 hunters)
- 1 Tank + 1 Healer + 4 DPS (mix melee/range)
- Ou 1 Tank + 2 Healers + 3 DPS (pour les boss difficiles)
- Le joueur choisit librement ses 6 classes

### Personnages bloques
- Les hunters envoyes en expedition **ne peuvent plus etre joues** ailleurs tant que l'expedition est en cours
- En cas de **wipe** : hunters bloques jusqu'a la fin des 24h
- Choix strategique : envoyer ses meilleurs = plus puissant mais bloques

---

## Progression — Vagues et Boss

### Structure d'une expedition

```
VAGUE 1 (mobs)  ->  LOOT ROLL  ->  CAMP DE FEU
      |
VAGUE 2 (mobs)  ->  LOOT ROLL  ->  CAMP DE FEU
      |
BOSS 1           ->  LOOT ROLL  ->  CAMP DE FEU
      |
VAGUE 3 (mobs)  ->  LOOT ROLL  ->  CAMP DE FEU
      |
VAGUE 4 (elites) ->  LOOT ROLL  ->  CAMP DE FEU
      |
BOSS 2           ->  LOOT ROLL  ->  CAMP DE FEU
      |
...
      |
BOSS 5 (Ragnaros) -> LOOT ROLL -> FIN
```

### Camp de feu (entre chaque combat)
- Zone safe, pas de combat
- Regen lente des HP/Mana (30-60s)
- Les healers AI soignent automatiquement l'equipe
- Visuellement : les hunters s'assoient autour d'un feu (animation idle)
- Le joueur peut reorganiser sa composition, switch de hunter, preparer la strat

### Vagues de mobs
- Packs de 5-10 mobs basiques dans une arene
- Les mobs spawn par vagues dans l'arene
- AI des mobs simple : charge le joueur le plus proche, attaque en melee/range
- Types de mobs : slimes, squelettes, gobelins, elementaires (varies par zone)
- Mobs elites (entre boss) : plus de HP, 1-2 mecaniques simples (AoE, charge)
- Loot mineur : materiaux, consommables, pieces communes

---

## Les 5 Boss (Phase 1)

### Boss 1 — Gardien de la Foret
- **HP** : 50M | **Enrage** : 5 min | **Zone** : Foret
- **Mecaniques** :
  - DPS check basique (enrage timer)
  - AoE circulaire centree sur le boss (telegraph 2s -> explosion)
  - Charge lineaire vers le tank (esquivable)
  - A 30% HP : enrage (+50% ATK, +30% speed)
- **Difficulte** : Intro — farmable semaine 1

### Boss 2 — Sentinelle de Pierre
- **HP** : 120M | **Enrage** : 4.5 min | **Zone** : Cavernes
- **Mecaniques** :
  - Shield phase : invulnerable pendant 10s, spawn 4 cristaux a detruire
  - AoE au sol (zones de pierre qui emergent, telegraph)
  - Slam frontal (cone devant le boss, haute damage)
  - Adds : 2 golems spawn a 50% HP (doivent mourir pour continuer)
- **Difficulte** : Facile — necessite coordination minimale

### Boss 3 — Seigneur des Ombres
- **HP** : 200M | **Enrage** : 4 min | **Zone** : Donjon
- **Mecaniques** :
  - Debuffs : poison + slow sur les joueurs proches (cleanse du healer important)
  - Zones de poison au sol (persistent 15s)
  - Invocation d'ombres (adds qui copient un hunter aleatoire)
  - Phase dark : ecran s'assombrit, seul le boss est visible (5s)
  - Check healer : degats raid-wide continus pendant phase dark
- **Difficulte** : Moyen — le healer est critique

### Boss 4 — Manaya
- **HP** : 500M | **Enrage** : 3.5 min | **Zone** : Temple
- **Mecaniques** : Reprend TOUTES les mecaniques existantes de Manaya Raid :
  - Anneau Destructeur (donut phase 1 + phase 2)
  - Trinite des Marques (3 zones concentriques, positionnement)
  - Sphere de Mort (run away >310px)
  - Double Impact (inner then outer)
  - Vague Devastatrice (menacing wave)
  - Lasers rotatifs
  - Plongeon/Saut Devastateur
  - Souffle Corrompu (frontal cone)
  - Rage buff stacking (healer doit dispel)
  - Adds spawn
- **Difficulte** : Dur — necessite sets + bonne compo + connaissance des mecaniques

### Boss 5 — Ragnaros
- **HP** : 1B | **Enrage** : 3 min | **Zone** : Volcan
- **Mecaniques** : Boss final, combine tout :
  - Mecaniques de Ragnaros de expedition2-server
  - Pluie de meteores (AoE multiples aleatoires)
  - Vague de lave (expanding ring, comme fire_wave)
  - Phase submersion : boss disparait, lave monte, safe zones reduites
  - Adds de flamme (elementaires de feu, explosent a la mort)
  - Souffle de feu devastateur (180 degres, OS si pas block/dodge)
  - A 10% HP : mode desespere — toutes les mecaniques en meme temps
- **Difficulte** : Boss final — necessite gear quasi-complet + execution parfaite

---

## Systeme de Loot

### Sources de loot
- **Boss** (5 boss) -> loot table principale, items rares/epiques/legendaires
- **Vagues de mobs** -> loot mineur (materiaux, consommables, pieces communes)
- **Salle au tresor** (event random, 15% entre deux combats) -> loot bonus

### Transparence des taux (affichage joueur)
Les joueurs voient la **rarete** de chaque item, pas le % exact :

| Couleur | Label affiche | % reel (cache) |
|---|---|---|
| Gris | Commun | 40-60% |
| Vert | Peu commun | 20-35% |
| Bleu | Rare | 8-15% |
| Violet | Epique | 2-5% |
| Or | Legendaire | 0.3-1% |

### Soft Reservation (SR)
- Chaque joueur peut **reserver 1 item** (global, sur toute l'expedition)
- Si l'item drop ET que le joueur a SR dessus -> priorite au roll
- Si plusieurs joueurs SR le meme item -> roll /100 entre eux uniquement
- Si personne n'a SR l'item -> roll /100 ouvert a tous les participants
- SR un item Legendaire (0.3-1%) = pari risque mais potentiellement enorme

### Systeme de Roll /100
Apres chaque combat (boss OU vague de mobs), pour chaque item qui drop :

```
1. L'item drop (selon son % cache)
2. Verification des SR :
   - SR presents -> roll /100 entre joueurs qui ont SR cet item
   - Pas de SR   -> roll /100 entre TOUS les participants vivants
3. Affichage du roll (animation, suspense) :
   "[Lame d'Ombre Ancienne] -- Epique"
   "   Cedric    -> 87"
   "   Alex      -> 43"
   "   Marie     -> 91 * WINNER (SR)"
4. Si wipe -> 10-40% chance que le monstre "vole" l'item
   "Les monstres ont vole [Lame d'Ombre Ancienne] !"
```

### Rythme apres chaque combat

```
COMBAT (mobs ou boss)
    |
PAUSE LOOT -- rolls un par un, animation, suspense (~15-30s)
    |
CAMP DE FEU -- repos, regen HP/Mana, healers soignent (~30-60s)
    |
TRANSITION -- l'equipe avance vers le prochain combat
    |
PROCHAIN COMBAT
```

### Penalite de Wipe
- En cas de wipe (equipe entiere morte) :
- **10% a 40% de chance** par loot que les monstres le "volent"
- Loot vole = non obtenu, perdu pour cette session

### Nouveaux items
- **Sets d'armure expedition** (specifiques, bonus 2pc/4pc)
- **Armes expedition** (drops de boss — 10 armes mythiques deja creees)
- **Artefacts uniques hors set** (items rares standalone)
- **Consommables** (potions, buffs temporaires — drops de mobs)
- **Materiaux de craft** (drops de mobs, utilisables hors expedition)
- **Expedition stat bonus** : artifacts avec `source: 'expedition'` ont +30% sur tous les rolls de stats

### Armes Expedition existantes (10 armes mythiques, LqR)
- Excalibur (light/sword, ATK 280, boss 15)
- Mjolnir (water/hammer, ATK 270, boss 12)
- Muramasa (shadow/katana, ATK 300, boss 14)
- Yggdrasil (light/staff, ATK 220, healer, boss 11)
- Gungnir (fire/lance, ATK 265, boss 13)
- Nidhogg (shadow/scythe, ATK 255, boss 10)
- Aegis (light/shield, ATK 150, tank, boss 8)
- Caladbolg (fire/sword, ATK 275, boss 9)
- Thyrsus (water/staff, ATK 240, mage, boss 7)
- Gram (fire/greatsword, ATK 290, boss 15)

### Skins exclusifs (drops ultra-rares, 0.5-1%)
- Boss 3 : "Ombre Ancestrale" (aura sombre)
- Boss 4 : "Manaya - Forme Purifiee" (skin blanc lumineux)
- Boss 5 : "Ragnaros - Flamme Eternelle" (aura de feu)

### Skills uniques (drops de boss, 1-3%)
- "Frappe Dimensionnelle" — ignore 50% de la DEF pendant 1 attaque
- "Barriere de l'Ancien" — bouclier qui absorbe 1 coup fatal (CD 5 min)
- "Resonance d'Ombre" — +30% ATK a toute l'equipe pendant 10s

---

## Architecture Technique

### Moteur de combat — Fork de Manaya
Le serveur d'expedition reutilise le moteur Manaya existant :

| Module Manaya | Utilisation Expedition |
|---|---|
| `CombatEngine.js` | Calcul de degats, skills, buffs, debuffs, resurrect — **tel quel** |
| `PhysicsEngine.js` | Collisions, projectiles, AoE zones — **tel quel** |
| `BotAI.js` | AI des 5 hunters non-controles par joueur — **tel quel** |
| `GameLoop.js` | Tick loop, input queue, state broadcast — **adapte** (multi-combat, vagues) |
| `GameState.js` | Etat du jeu — **adapte** (30 players, mobs, boss variable) |
| `Boss.js` | Entite boss — **etendu** (5 boss differents avec mecaniques propres) |
| `Player.js` | Entite joueur/hunter — **tel quel** |
| `classStats.js` | 6 classes et leurs skills — **tel quel** |
| `WebSocketServer.js` | WS broadcast — **adapte** (multi-room expedition) |

### Nouvelles couches a creer

```
expedition2-server/          (ou renommer expedition-server)
  src/
    config.js               # Config expedition (tick rate, timers, boss list)
    index.js                # Entry point, HTTP + WS

    data/
      bossData.js           # 5 boss: stats, phases, mecaniques, loot tables
      mobData.js             # Types de mobs: stats, AI patterns
      lootTables.js          # Drop rates par boss/mob
      expeditionItems.js     # Items expedition (deja existe)
      expeditionWeapons.js   # Armes expedition (deja existe)

    entities/
      Player.js             # Fork de Manaya Player (+ ownerId pour switch)
      Boss.js               # Fork de Manaya Boss (+ boss-specific mechanics)
      Mob.js                # Entite mob simple (HP, ATK, AI basique)

    game/
      CombatEngine.js       # Import direct de Manaya (ou symlink)
      PhysicsEngine.js      # Import direct de Manaya
      BotAI.js              # Import direct de Manaya
      MobAI.js              # AI simplifiee pour les mobs
      ExpeditionLoop.js     # Boucle principale: gere les phases (wave/boss/camp/loot)
      ExpeditionState.js    # Etat global: progression, vague actuelle, boss actuel

    systems/
      LootSystem.js         # Roll, SR, distribution, binding
      CampfireSystem.js     # Regen, heal, timer entre combats
      ProgressionSystem.js  # Sauvegarde progression, checkpoints
      HunterSwitch.js       # Gestion du switch de hunter (input routing)

    network/
      ExpeditionRoom.js     # Room expedition (5 joueurs, 30 hunters)
      WebSocketServer.js    # WS + HTTP endpoints

    db/
      expeditionDB.js       # PostgreSQL (local DO) — sauvegarde etat, loot, progression
```

### Systeme de Switch (HunterSwitch)
```
Joueur A connecte en WS
  -> Controle hunter A1 (les inputs WS vont a A1)
  -> A2, A3, A4, A5, A6 en BotAI

Joueur A envoie { type: 'switch', hunterIndex: 3 }
  -> A1 repasse en BotAI
  -> A3 recoit les inputs du joueur
  -> Camera client recentree sur A3
```

- Chaque joueur a un `controlledHunterId` qui change au switch
- L'input queue route les inputs vers le bon hunter
- Les BotAI sont actives/desactivees dynamiquement

### Backend
- **Serveur** : DigitalOcean (meme droplet que Manaya)
- **Port** : 3004 (expedition)
- **Base de donnees** : PostgreSQL local (meme instance que le reste)
- **PM2** : process `expedition`
- **Tick rate** : 4 TPS (comme Manaya) pour les combats, 1 TPS pendant les camps

### Frontend (client)
- **Canvas 2D** top-down (meme style que test.html de Manaya)
- **Page React** : `/expedition` dans le site BuilderBeru
- **Controles** : ZQSD + souris + skills (identique a Manaya)
- **Ajout** : touches 1-6 pour switch de hunter, minimap, liste des hunters avec HP
- **UI supplementaire** :
  - Barre de progression expedition (boss 1/5, vague X)
  - Panel de loot roll (animation)
  - Camp de feu UI (timer, HP bars de toute l'equipe)
  - Liste des 6 hunters du joueur avec etat (HP, mana, alive, classe)

### Base de donnees

```sql
-- Expeditions
expeditions (
  id, name, started_at, ended_at, status,
  max_boss_reached, difficulty, player_count
)

-- Inscription des joueurs
expedition_entries (
  id, expedition_id, user_id,
  hunter_classes[], hunter_names[], hunter_levels[],
  sr_item_id, joined_at
)

-- Progression par combat
expedition_combats (
  id, expedition_id, combat_type, combat_index,
  boss_name, started_at, ended_at, victory,
  boss_hp_remaining
)

-- Loot
expedition_loot_tables (boss_index, item_id, drop_rate, rarity)
expedition_loot_drops (
  id, expedition_id, combat_id, item_id,
  winner_user_id, roll_value, sr_priority,
  stolen, rolled_at
)

-- Items
expedition_items (id, name, type, slot, rarity, stats_json, set_id, sprite_url)
expedition_sets (id, name, bonus_2pc, bonus_4pc)

-- Etat des hunters pendant l'expedition
expedition_hunter_state (
  expedition_id, user_id, hunter_index,
  class, hp, max_hp, mana, alive,
  damage_dealt, healing_done, deaths
)

-- Sauvegarde/restore en cas de crash
expedition_snapshot (
  expedition_id, snapshot_at, state_json
)
```

### Crash Recovery
- Snapshot JSONB toutes les 60s (comme Manaya)
- En cas de restart PM2 : restaure l'expedition en cours
- Les joueurs se reconnectent automatiquement (WS reconnect)

---

## Systeme de Binding (liaison des items)

| Type de liaison | Signification | Exemples |
|---|---|---|
| **LqR (Lie quand Ramasse)** | Lie au joueur des le loot. JAMAIS echangeable. | Skins, Skills uniques, Armes legendaires |
| **LqE (Lie quand Equipe)** | Echangeable tant que non equipe. | Sets rares (bleu), Armes epiques (violet) |
| **Echangeable** | Toujours echangeable. | Materiaux, Consommables, Sets communs |

---

## Hotel des Ventes (HdV) — Phase future

### Devise : Marteaux Rouges / Points de Contribution

| Monnaie | Comment l'obtenir | Utilisation |
|---|---|---|
| **Marteaux Rouges** | Drops mobs/boss, ventes HdV | Monnaie principale HdV |
| **Points de Contribution** | Participer (DPS, heal, tank, survie) | Monnaie "merite" |

### Regles
- Duree max annonce : 48h
- Taxe 10% (15% sur epiques)
- Limite 10 annonces actives/joueur
- LqR = JAMAIS sur le marche
- LqE deja equipe = JAMAIS sur le marche

---

## Equilibrage

### Stats joueurs connues
- **DPS top** : ~7M/s (joueurs avances)
- **DPS moyen** : ~500K-2M/s
- **HP joueurs** : 4K-12K

### HP des boss (Phase 1 — 5 boss)

| Boss | HP | Enrage | Difficulte |
|---|---|---|---|
| Boss 1 — Gardien Foret | 50M | 5 min | Intro |
| Boss 2 — Sentinelle Pierre | 120M | 4.5 min | Facile |
| Boss 3 — Seigneur Ombres | 200M | 4 min | Moyen |
| Boss 4 — Manaya | 500M | 3.5 min | Dur |
| Boss 5 — Ragnaros | 1B | 3 min | Boss Final |

### Degats des boss
- Boss 1 : 500-1500 dmg/hit -> survivable sans healer
- Boss 2 : 2000-4000 dmg/hit -> healer utile
- Boss 3 : 4000-6000 dmg/hit -> healer obligatoire
- Boss 4 : 6000-10000 dmg/hit -> tank + healer + mecaniques
- Boss 5 : 10000-20000 dmg/hit -> full gear + execution parfaite

---

## Philosophie de retention : le LOOT drive tout

### Boucle d'addiction
```
Jour 1-3   : "Boss 1-2 down, on loot quelques sets communs"
Jour 3-7   : "Boss 3 down ! Premiere piece Rare !"
Jour 7-14  : "On bute sur Manaya... il faut les sets + mecaniques"
Jour 14-21 : "MANAYA DOWN ! Mais Ragnaros nous OS..."
Jour 21-30 : "On farm Manaya pour le gear, on progresse sur Ragnaros"
Jour 30-45 : "RAGNAROS DOWN ! Mais personne n'a eu le skin..."
Jour 45-60 : "On refait tout, je VEUX ce skin / cette arme legendaire"
```

### Ce qui fait revenir les joueurs
1. **Sets incomplets** — "il me manque 1 piece pour le bonus 4pc"
2. **Skins rares** — "personne n'a le skin Ragnaros"
3. **Skills uniques** — "si j'obtiens Resonance d'Ombre on clear Ragnaros easy"
4. **Roll /100** — "j'ai roll 98 mais il a roll 99 avec son SR..."
5. **Switch de hunter** — gameplay actif, chaque run est different selon qui tu controles
6. **Titres serveur-first** — "premier a clear Boss 5"

---

## Ce qu'on reutilise directement de Manaya

- `CombatEngine.js` — tout le systeme de combat, skills, buffs, degats
- `PhysicsEngine.js` — collisions, projectiles, AoE zones
- `BotAI.js` — AI des hunters non-controles (tank, healer, warrior, archer, berserker, mage)
- `Player.js` — entite joueur avec stats, mana, cooldowns, casting
- `Boss.js` — base pour Boss 4 (Manaya) et adaptable pour les autres
- `classStats.js` — 6 classes completes avec tous leurs skills
- `GameLoop.js` — boucle de jeu tick-based
- `WebSocketServer.js` — broadcast WS
- `test.html` — base pour le client canvas (sprites, rendering, UI)

---

## Priorites de developpement

### Phase 1 — Fondations (moteur)
- [ ] Fork du moteur Manaya dans expedition2-server
- [ ] ExpeditionLoop : gestion des phases (wave -> boss -> camp -> loot)
- [ ] ExpeditionState : 30 hunters, mobs, boss variable
- [ ] HunterSwitch : routing des inputs, switch touches 1-6
- [ ] MobAI : AI simple pour les mobs basiques
- [ ] Boss 1 (Gardien Foret) : mecaniques simples

### Phase 2 — Combat complet
- [ ] Boss 2-3 avec mecaniques propres
- [ ] Boss 4 = import direct de Manaya
- [ ] Boss 5 = Ragnaros (import/adapt de expedition2-server)
- [ ] Vagues de mobs entre les boss
- [ ] Camp de feu (regen, timer, animations)

### Phase 3 — Loot et Progression
- [ ] LootSystem : roll, SR, distribution, binding
- [ ] Loot tables par boss
- [ ] Sauvegarde progression DB
- [ ] Crash recovery (snapshots)
- [ ] Client canvas : loot roll UI, camp UI

### Phase 4 — Frontend React
- [ ] Page /expedition dans BuilderBeru
- [ ] UI inscription (choix 6 hunters, classes, SR)
- [ ] Canvas de jeu (fork de test.html en React component)
- [ ] HUD : switch panel (1-6), minimap, progression bar
- [ ] Beru Commentateur (live comments)

### Phase 5 — Polish
- [ ] Equilibrage des 5 boss
- [ ] Sprites de mobs
- [ ] Environnements visuels par zone (foret, cavernes, donjon, temple, volcan)
- [ ] Animations VFX
- [ ] Classements (DPS chart, MVP, serveur-first)

---

## Idees supplementaires

### Beru Commentateur
- Beru commente les combats en live comme un caster esport
- "OH ! Okami vient de se prendre un coup critique a 12K !"
- "WIPE IMMINENT ! Il reste que le healer !"
- "GG ! Boss 4 TOMBE ! Premier kill du serveur !"

### Salle au tresor (event aleatoire)
- 15% de chance entre deux combats
- Pas de combat, juste du loot bonus
- Les hunters courent dans la salle et ramassent des coffres

### Boss secret (Boss 6)
- Si Boss 5 vaincu avec **0 morts** -> portail vers Boss 6
- Boss ultra-difficile, loot exclusif (arme legendaire, titre)

### Systeme de moral
- Kills sans wipe -> boost moral (+5% ATK/DEF cumulatif)
- Wipe -> moral reset

### Replay
- Chaque expedition enregistree
- Les joueurs peuvent revoir les combats

---

## Roadmap — Expeditions futures

### Expedition I (actuelle — Phase 1)
- 5 boss, difficulte progressive
- ~1-2 mois pour clear
- Sets Tier 1, armes mythiques
- Map : foret -> cavernes -> donjon -> temple -> volcan

### Expedition I Complete (Phase 2)
- Extension a 15 boss
- Mecaniques plus complexes
- Nouveaux sets, armes, skins
- ~2 mois supplementaires

### Expedition II
- 20 boss, difficulte x2-3
- Sets Tier 2
- Nouvelle map : abysses -> ocean -> cite engloutie
- ~3 mois pour clear

### Expedition III
- 25 boss, difficulte x5
- Sets Tier 3, armes mythiques
- Mecaniques "raid" (coordination requise)
- ~4-6 mois pour clear

---

*Document cree le 2 mars 2026 — Expedition I Feature Design*
*Mis a jour le 8 mars 2026 — v2: Pivot top-down controlable, switch de hunter, 5 boss Phase 1, moteur Manaya*
