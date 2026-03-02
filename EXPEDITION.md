# Expedition I — Feature Design Document

## Concept

**Mode PvE multijoueur automatisé** en vue 2D side-scrolling (style Mario).
Les combats sont **100% controles par le serveur** — les joueurs envoient leurs personnages et regardent.
L'expedition se lance **tous les jours a 19h** et peut durer **jusqu'a 24h max**.

**Objectif long terme** : ~2 mois de progression collective avant de terminer l'Expedition I en entier.

---

## Regles de base

| Parametre | Valeur |
|---|---|
| Joueurs max par expedition | 30 |
| Personnages max par joueur | 3 |
| Nombre de boss | 15 |
| Duree max par session | 24h |
| Heure de lancement | 19h (quotidien) |
| Nom | Expedition I |

---

## Gameplay

### Deroulement
1. **Avant 19h** — Les joueurs inscrivent jusqu'a 3 personnages + configurent leur SR (Soft Reservation)
2. **19h** — L'expedition demarre automatiquement (backend)
3. **En cours** — Les joueurs peuvent se connecter pour regarder les combats en direct
4. **Fin** — Soit tous les boss sont vaincus, soit 24h ecoulees, soit wipe total

### Vue 2D Side-Scrolling
- Map construite en 2D avec sol, decors, obstacles
- L'equipe de hunters avance ensemble de gauche a droite
- Les personnages peuvent **sauter** (meme si inutile — fun factor)
- On voit clairement :
  - Les soins (heal VFX)
  - Les buffs actifs
  - Les attaques donnees et recues
  - Les degats infliges (floating numbers)
  - Les morts / resurrections

### Combat automatise (backend)
- Le serveur gere **toute la logique de combat**
- IA des personnages : attaquent, utilisent skills, esquivent selon leur classe/stats
- Vagues de mobs entre chaque boss
- 15 boss avec mecaniques croissantes en difficulte
- Les joueurs ne controlent RIEN pendant le combat

### Personnages bloques
- Les personnages envoyes en expedition **ne peuvent plus etre joues** tant que l'expedition est en cours
- En cas de **wipe** (tous morts) : personnages bloques jusqu'a la fin des 24h
- Choix strategique : envoyer ses meilleurs = plus puissant mais bloques pour le reste

---

## Systeme de Loot

### Sources de loot
- **Boss** (15 boss) → loot table principale, items rares/epiques/legendaires
- **Vagues de mobs** → loot mineur (materiaux, consommables, pieces communes)
- **Salle au tresor** (event random) → loot bonus

### Transparence des taux (affichage joueur)
Les joueurs voient la **rarete** de chaque item, pas le % exact :

| Couleur | Label affiche | % reel (cache) |
|---|---|---|
| Gris | Commun | 40-60% |
| Vert | Peu commun | 20-35% |
| Bleu | Rare | 8-15% |
| Violet | Epique | 2-5% |
| Or | Legendaire | 0.3-1% |

Les joueurs consultent la loot table de chaque boss AVANT l'expedition.
Ils voient les items + leur rarete, mais pas le taux exact → garde le mystere.

### Soft Reservation (SR)
- Chaque joueur peut **reserver 1 item** (global, sur toute l'expedition)
- Si l'item drop ET que le joueur a SR dessus → priorite au roll
- Si plusieurs joueurs SR le meme item → roll /100 entre eux uniquement
- Si personne n'a SR l'item → roll /100 ouvert a tous les participants
- SR un item Legendaire (0.3-1%) = pari risque mais potentiellement enorme

### Systeme de Roll /100
Apres chaque combat (boss OU vague de mobs), pour chaque item qui drop :

```
1. L'item drop (selon son % cache)
2. Verification des SR :
   - SR presents → roll /100 entre joueurs qui ont SR cet item
   - Pas de SR   → roll /100 entre TOUS les participants vivants
3. Affichage du roll (animation, suspense) :
   "🎲 [Lame d'Ombre Ancienne] — Épique"
   "   Cedric    → 87"
   "   Alex      → 43"
   "   Marie     → 91 ★ WINNER (SR)"
4. Si wipe → 10-40% chance que le monstre "vole" l'item
   "💀 Les monstres ont volé [Lame d'Ombre Ancienne] !"
```

### Rythme apres chaque combat (l'aventure)
Chaque combat suit un cycle immuable qui donne un rythme d'aventure :

```
⚔️  COMBAT (mobs ou boss)
      ↓
🎲  PAUSE LOOT — rolls un par un, animation, suspense (~15-30s)
      ↓
🔥  CAMP DE FEU — repos, regen HP/Mana, healers soignent (~30-60s)
    (les persos s'assoient autour du feu, animations idle)
      ↓
🚶  MARCHE — l'equipe avance vers le prochain combat (scrolling 2D)
      ↓
⚔️  PROCHAIN COMBAT
```

Ce rythme est crucial — il donne l'impression d'une VRAIE aventure.
Les spectateurs vivent les hauts (loot epique) et les bas (wipe, vol de loot).

### Penalite de Wipe
- En cas de wipe (equipe entiere morte) :
- **10% a 40% de chance** par loot que les monstres le "volent"
- Loot vole = non obtenu, perdu pour cette session
- Incite a bien preparer / bien equiper son equipe

### Nouveaux items (a creer)
- **Nouveaux sets d'armure** (specifiques a l'Expedition)
- **Nouvelles armes** (drops de boss)
- **Pieces d'artefacts uniques hors set** (items rares standalone)
- **Consommables** (potions, buffs temporaires — drops de mobs)
- **Materiaux de craft** (drops de mobs, utilisables hors expedition)
- La progression via ces items aide a avancer plus loin dans l'expedition

### Skins exclusifs (drops ultra-rares)
Certains boss droppent des **skins visuels** pour les personnages :
- Skin = purement cosmetique OU avec leger bonus visuel (aura, trail)
- Drop rate : **0.5-1%** → les gens refont l'expedition des semaines pour les avoir
- Exemples :
  - Boss 5 : "Okami - Forme Celeste" (skin bleu lumineux)
  - Boss 10 : "Alecto - Phoenix Noir" (aura de flammes sombres)
  - Boss 15 : "Skin Legendaire du Boss Final" (le plus rare du jeu)
  - Boss 16 (secret) : "Skin ???" (personne ne sait ce que c'est avant de l'obtenir)
- Un skin rare = **flexing ultime** — tout le monde le voit dans le jeu principal

### Skills uniques (drops de boss)
Certains boss droppent des **parchemins de skill** :
- 1 skill unique par boss (pas tous les boss, peut-etre 5-6 boss sur 15)
- Le skill s'apprend definitivement sur 1 personnage au choix
- Drop rate : **1-3%** (Epique)
- Le skill est PUISSANT et change le gameplay du personnage
- Exemples :
  - "Frappe Dimensionnelle" — ignore 50% de la DEF pendant 1 attaque
  - "Barriere de l'Ancien" — bouclier qui absorbe 1 coup fatal (CD 5 min)
  - "Resonance d'Ombre" — +30% ATK a toute l'equipe pendant 10s
  - "Soin Ancestral" — full heal un allie (CD 3 min)
- Ces skills sont les vrais game changers pour la progression

---

## Philosophie de retention : le LOOT drive tout

### Principe fondamental
**Meme si l'expedition est "facile" a clear, les gens reviennent pour le loot.**
La difficulte n'est pas que dans les boss — elle est dans la RARETE des drops.

### Boucle d'addiction
```
Jour 1-7   : "On clear Boss 1-5, on loot quelques sets communs"
Jour 7-14  : "Boss 7 enfin down ! J'ai eu une piece Epique !"
Jour 14-30 : "On farm Boss 10+ mais le skin Okami Celeste refuse de drop..."
Jour 30-45 : "BOSS 15 DOWN ! Mais personne n'a eu le skill legendaire"
Jour 45-60 : "On refait tout, je VEUX ce skin / ce skill"
Jour 60+   : "Boss 16 secret... 0 morts... on y est presque"
```

### Ce qui fait revenir les joueurs
1. **Sets incomplets** — "il me manque 1 piece pour le bonus 4pc"
2. **Skins rares** — "personne sur le serveur n'a encore le skin du Boss 15"
3. **Skills uniques** — "si j'obtiens Resonance d'Ombre on clear Boss 12 easy"
4. **Roll /100** — "j'ai roll 98 mais Marie a roll 99 avec son SR... la prochaine fois"
5. **Titres serveur-first** — "on est la premiere equipe a avoir clear Boss 16"

---

## Progression sur ~2 mois

### Philosophie
- Les premiers jours : les equipes atteignent boss 3-5 max
- Avec les loots accumules, les sets completes, les synergies → progression naturelle
- **Cohesion d'equipe** importante : bonne composition de classes/elements
- Boss 10+ = mur de difficulte → necessite sets quasi-complets + skills uniques
- Boss 15 (final) = accomplissement collectif apres ~2 mois
- **Apres le clear** : les gens continuent pour farmer skins + skills rares

### Facteurs de progression
1. **Gear** — sets et armes d'expedition qui rendent plus fort
2. **Skills uniques** — game changers qui debloquent de nouvelles strategies
3. **Composition** — bonnes synergies de classes et elements
4. **Nombre de joueurs** — plus de participants = plus de force
5. **Niveau des personnages** — XP gagnee via le jeu principal
6. **Strategie SR** — bien choisir quels items reserver (skin rare vs set utile ?)

---

## Architecture Technique

### Backend
- **Serveur** : DigitalOcean (meme droplet que Manaya)
- **Base de donnees** : Neon PostgreSQL
- **Process** : PM2 (nouvelle app ou integre a manaya)
- **Logique de combat** : 100% server-side, tick-based
- **Broadcast** : WebSocket vers les spectateurs connectes

### Frontend (spectateur)
- **Bouton** "Se connecter a l'expedition" dans le jeu
- **Vue 2D canvas** side-scrolling
- **Stats en direct** : PV, mana, buffs, DPS de chaque personnage
- **Feed de loot** : qui a loot quoi
- **Tableau de bord** : progression globale, boss atteint, temps restant

### Base de donnees (Neon)

```sql
-- Expeditions
expeditions (id, name, started_at, ended_at, status, max_boss_reached)

-- Inscription des joueurs
expedition_entries (id, expedition_id, user_id, character_ids[], sr_item_id, joined_at)

-- Boss & Mobs
expedition_bosses (id, expedition_id, boss_index, name, hp, status, killed_at)
expedition_mobs (id, expedition_id, wave_index, mob_type, hp, status)

-- Loot
expedition_loot_tables (boss_index, item_id, drop_rate)
expedition_loot_drops (id, expedition_id, boss_index, item_id, winner_user_id, stolen, rolled_at)

-- Items (nouveaux)
expedition_items (id, name, type, slot, rarity, stats_json, set_id, sprite_url)
expedition_sets (id, name, bonus_2pc, bonus_4pc)

-- Progression
expedition_character_state (expedition_id, character_id, hp, mana, alive, damage_dealt, healing_done)
```

### Combat Engine (server-side)
- Tick rate : ~2-4 ticks/seconde (pas besoin de 60fps, c'est auto)
- Chaque tick : calcul des actions de chaque personnage (IA basique)
- Classes avec comportements differents :
  - Tank → aggro les mobs, taunt
  - DPS → focus la cible avec le moins de PV
  - Healer → heal l'allie le plus bas en PV
  - Support → buff l'equipe, debuff les ennemis
- Boss mecaniques : AoE, enrage timer, phases, invulnerabilite temporaire

---

## Assets a creer

### Monstres / Mobs
- Mobs basiques (slimes, squelettes, etc.) — 5-8 types
- Mobs elites (entre les boss) — 3-4 types
- **15 Boss** avec sprites uniques et mecaniques propres

### Map 2D
- Tileset de sol / plateforme
- Decors de fond (parallax scrolling)
- Zones thematiques (foret, donjon, volcan, abysses...)
- Transitions entre zones

### Items
- Sprites pour les nouvelles armes
- Sprites pour les pieces de sets
- Icones d'artefacts uniques

---

## Priorites de developpement (suggestion)

### Phase 1 — Fondations
- [ ] Schema BDD Neon
- [ ] Systeme d'inscription a l'expedition (UI + API)
- [ ] Combat engine server-side (tick-based, IA basique)
- [ ] 3 premiers boss + mobs basiques

### Phase 2 — Spectateur
- [ ] Vue 2D canvas side-scrolling
- [ ] WebSocket broadcast des combats
- [ ] Affichage stats en direct
- [ ] Feed de loot

### Phase 3 — Loot & Progression
- [ ] Loot tables par boss
- [ ] Systeme SR
- [ ] Roll + distribution
- [ ] Penalite de wipe (vol de loot 10-40%)
- [ ] Nouveaux sets et armes

### Phase 4 — Polish
- [ ] 15 boss complets avec mecaniques
- [ ] Sprites monstres
- [ ] Map 2D complete avec zones thematiques
- [ ] Equilibrage de la difficulte (~2 mois de progression)
- [ ] Animations et VFX (soins, buffs, attaques)

---

## Equilibrage — Donnees actuelles

### Stats joueurs connues
- **DPS top** : ~7M/s (joueurs les plus avances)
- **DPS moyen** : ~500K-2M/s
- **HP joueurs** : entre 4K et 12K

### Estimation des HP boss (a ajuster)

| Boss | HP estime | Enrage timer | Difficulte |
|---|---|---|---|
| Boss 1-3 | 50M - 200M | 5 min | Intro — farmable semaine 1 |
| Boss 4-6 | 300M - 800M | 4 min | Mid — necessite premiers sets |
| Boss 7-9 | 1B - 3B | 4 min | Mur — sets 2pc minimum |
| Boss 10-12 | 5B - 15B | 3 min | Hard — sets 4pc + armes |
| Boss 13-14 | 20B - 50B | 3 min | Extreme — full gear + compo parfaite |
| Boss 15 (Final) | 100B+ | 2 min | Legendaire — ~2 mois de farm |

### Degats des boss (estimation)
- Boss 1-3 : 500-1500 dmg/hit → survivable sans healer
- Boss 4-6 : 2000-4000 dmg/hit → healer obligatoire
- Boss 7-9 : 5000-8000 dmg/hit → one-shot les mal equipes
- Boss 10-12 : 8000-15000 dmg/hit → tank + healer + set DEF
- Boss 13-15 : 15000-30000 dmg/hit → wipe quasi-garanti sans compo ideale

### Resurrection
- **En fin de combat** (boss vaincu) : les healers encore en vie peuvent rez les morts
- Rez = personnage revient avec 30% HP
- Un healer peut rez **1 perso par combat** max
- Si tous les healers sont morts → pas de rez → les morts restent morts pour la suite

---

## Idees supplementaires

### 1. Beru Commentateur
- Beru commente les combats en live comme un caster esport
- "OH ! Okami vient de se prendre un coup critique a 12K !"
- "WIPE IMMINENT ! Il reste que le healer !"
- "GG ! Boss 7 TOMBE ! Premier kill du serveur !"
- Ajoute du fun et de la tension — les gens regardent POUR les commentaires

### 2. Salle au tresor (event aleatoire)
- Entre certains boss, 15% de chance qu'une **salle au tresor** apparaisse
- Pas de combat, juste du loot bonus
- Les personnages courent dans la salle et ramassent des coffres (animation)
- Loot : gold, materiaux de craft, pieces d'artefact mineures

### 3. Boss secret (Boss 16)
- Si le Boss 15 est vaincu avec **0 morts dans l'equipe** → portail vers Boss 16
- Boss ultra-difficile, loot exclusif (arme legendaire, titre)
- Probablement 4-5 mois avant que quelqu'un y arrive

### 4. Classement Expedition
- **DPS Chart** en temps reel pendant l'expedition (qui fait le plus de degats)
- **MVP du jour** : joueur avec le plus gros impact
- **Classement global** : serveur-first pour chaque boss kill
- **Titres** : "Premier a vaincre Boss 5", "Survivant de l'Expedition I"

### 5. Environnement interactif
- Pieges sur la map 2D (pics, boules de feu, zones de poison)
- Les personnages doivent les eviter (IA) — certains se font toucher → degats
- Ajoute du chaos visuel et du fun

### 6. Systeme de moral
- Si l'equipe enchaine des kills sans wipe → **boost de moral** (+5% ATK/DEF cumulatif)
- Si wipe → moral tombe a 0, reset du bonus
- Incite a bien preparer plutot que rush

### 7. Replay
- Chaque expedition est enregistree
- Les joueurs peuvent **revoir les combats** le lendemain
- Partager les moments epiques (clip d'un boss kill)

### 8. Camp de base (entre les boss)
- Zone safe entre chaque boss ou les persos se reposent
- Regen lente des HP/Mana
- Les healers soignent l'equipe
- Animation : personnages assis autour d'un feu de camp
- Duree : 30s-1min avant le prochain combat

### 9. Hotel des Ventes (HdV) — Echange entre joueurs
Marche player-to-player. Les joueurs vendent et achetent entre eux.

#### Devise : Marteaux Rouges / Points de Contribution

Deux monnaies possibles pour l'HdV (a choisir ou combiner) :

| Monnaie | Comment l'obtenir | Utilisation |
|---|---|---|
| **Marteaux Rouges** 🔨 | Drops de mobs/boss, recompenses quotidiennes, ventes HdV | Monnaie principale de l'HdV |
| **Points de Contribution** | Participer a l'expedition (DPS, heal, tank, survie) | Monnaie "merite" — recompense l'effort |

**Pourquoi pas les Shadow Coins** :
- L'expedition a sa propre economie fermee
- Les joueurs ne peuvent pas "acheter" leur puissance avec des ressources du jeu principal
- Force tout le monde a JOUER l'expedition pour obtenir la monnaie
- Les Marteaux Rouges sont thematiques (craft, forge, aventure)

**Systeme a deux monnaies (option)** :
- Marteaux Rouges → items communs/rares sur l'HdV
- Points de Contribution → items epiques+ sur l'HdV (reserve aux joueurs qui participent activement)
- Un joueur qui farm beaucoup mais roll mal peut quand meme acheter ce qu'il veut → anti-frustration

#### Systeme de Binding (liaison des items)

Chaque item a un **type de liaison** qui determine s'il peut etre echange :

| Type de liaison | Signification | Exemples |
|---|---|---|
| **LqR (Lie quand Ramasse)** | L'item est lie au joueur des qu'il le loot. JAMAIS echangeable. | Skins, Skills uniques, Titres, Armes legendaires de boss |
| **LqE (Lie quand Equipe)** | Echangeable tant que non equipe. Une fois equipe → lie definitivement. | Sets rares (bleu), Armes epiques (violet), Artefacts uniques |
| **Echangeable** | Toujours echangeable, meme apres utilisation. | Materiaux de craft, Consommables, Pieces de set communes |

**Tableau complet des items** :

| Type d'item | Liaison | Echangeable sur HdV | Raison |
|---|---|---|---|
| Sets communs (gris/vert) | Echangeable | OUI librement | aide les nouveaux joueurs |
| Sets rares (bleu) | LqE | OUI (si non equipe) | circule dans l'economie mais pas indefiniment |
| Armes epiques (violet) | LqE | OUI, taxe 15% | items de valeur, engagement a l'equip |
| Armes legendaires (or) | **LqR** | **NON** | doit etre merite |
| Consommables / materiaux | Echangeable | OUI librement | consommable, pas de risque |
| **Skins** | **LqR** | **NON — JAMAIS** | doit etre merite, pas achete |
| **Skills uniques** | **LqR** | **NON — JAMAIS** | game changer = pas echangeable |
| **Titres** | **LqR** | **NON** | personnel |

**Pourquoi ce systeme** :
- **LqR sur les skins/skills/legendaires** : Si quelqu'un a le skin Boss 15, TOUT LE MONDE sait qu'il l'a farm lui-meme. Prestige intact.
- **LqE sur le gear rare** : Tu peux revendre un item que tu n'utilises pas → economie vivante. Mais une fois equipe, c'est fini → pas de revente infinie.
- **Echangeable sur les mats** : Les materiaux doivent circuler librement, ca fait tourner l'economie.

Le jour ou tu vois un joueur avec le skin du Boss 16 secret → respect immediat, impossible de l'avoir achete.

#### Comment ca marche

```
1. Joueur met un item en vente → fixe son prix en Marteaux Rouges
2. Verification : l'item est-il echangeable ? (pas LqR, pas LqE deja equipe)
3. L'item apparait sur le marche (visible par tous)
4. Un autre joueur achete → monnaie transferee, item transfere
5. Taxe de 10% prelevee sur la vente (gold sink, evite l'inflation)
   - Taxe 15% sur les items epiques (violet)
```

**Interface HdV** :
- Onglet accessible depuis le menu principal du jeu
- Recherche par type (set, arme, consommable), rarete, slot
- **Badge de liaison visible** : icone LqR (cadenas rouge), LqE (cadenas orange), Echangeable (fleches vertes)
- Historique des ventes (prix moyen par item en Marteaux Rouges)
- Mes ventes en cours / mes achats
- Notification quand un item est vendu
- Solde de Marteaux Rouges + Points de Contribution affiche

**BDD** :
```sql
auction_house (
  id, seller_user_id, item_id, item_data_json,
  price, currency (marteaux_rouges/points_contribution),
  binding_type (lqr/lqe/tradeable),
  status (active/sold/cancelled/expired),
  listed_at, sold_at, buyer_user_id,
  tax_amount
)

-- Portefeuille joueur
player_wallet (
  user_id, marteaux_rouges, points_contribution
)
```

**Anti-abus** :
- Duree max d'une annonce : 48h (puis expire, item retourne au vendeur)
- Prix minimum et maximum par rarete (evite les echanges a 1 Marteau)
- Limite de 10 annonces actives par joueur
- Historique des prix pour detecter les manipulations
- Les items LqR ne peuvent JAMAIS apparaitre sur le marche (bloque cote serveur)

---

## Questions ouvertes

- [ ] Les personnages gagnent-ils de l'XP en expedition ?
- [ ] Peut-on changer ses personnages entre deux sessions (jour suivant) ?
- [ ] Les loots sont-ils equippables immediatement ou a la fin de l'expedition ?
- [ ] Faut-il un nombre minimum de joueurs pour lancer ?
- [ ] Les mobs respawn-ils entre deux tentatives de boss ?
- [x] ~~Les morts sont-ils definitifs ?~~ → Rez possible par healers en fin de combat (1 rez/healer)

---

## Roadmap — Expeditions futures

### Expedition I (actuelle)
- 15 boss, difficulte "normale"
- ~2 mois pour clear
- Introduit les sets, armes, skins, skills uniques
- Map : foret → donjon → volcan

### Expedition II
- Requiert : avoir clear Expedition I au moins 1 fois
- 20 boss, difficulte x2-3 par rapport a Exp I
- Nouveaux sets Tier 2 (plus puissants, remplacent les Tier 1)
- Nouvelles mecaniques de boss (phases multiples, immunites elementaires)
- Nouvelle map : abysses → ocean → cite engloutie
- Nouveaux skins + skills uniques T2
- ~3 mois pour clear

### Expedition III
- Requiert : avoir clear Expedition II
- 25 boss, difficulte x5 par rapport a Exp I
- Sets Tier 3, armes mythiques
- Boss avec mecaniques "raid" (coordination requise entre classes)
- Nouvelle map : dimension parallele → void → throne final
- Skins mythiques (les plus rares du jeu)
- Skills ultimes (1 par classe, transforme le gameplay)
- ~4-6 mois pour clear

### Principe d'escalade
```
Exp I   → Tier 1 gear → clear en ~2 mois  → debloque Exp II
Exp II  → Tier 2 gear → clear en ~3 mois  → debloque Exp III
Exp III → Tier 3 gear → clear en ~4-6 mois → ???
```

Chaque expedition rend la precedente plus facile a farmer (overgear).
Les joueurs continuent de farmer Exp I meme apres avoir debloque Exp II
(pour les skins rares qu'ils n'ont pas encore eu).

**C'est du contenu pour 1 an+** avec seulement 3 expeditions.

---

*Document cree le 2 mars 2026 — Expedition I Feature Design*
*Mis a jour le 2 mars 2026 — Equilibrage, loot, skins, skills, roadmap*
*Mis a jour le 2 mars 2026 — Binding items (LqR/LqE), Marteaux Rouges, Points de Contribution, HdV v2*
