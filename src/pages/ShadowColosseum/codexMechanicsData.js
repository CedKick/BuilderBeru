// ═══════════════════════════════════════════════════════════════
// CODEX MECHANICS DATA — Guides detailles par mode de jeu
// Structure: sous-onglets avec sections, formules, tableaux
// ═══════════════════════════════════════════════════════════════

// ── GENERALES ────────────────────────────────────────────────

export const MECHANICS_GENERAL = {
  id: 'general', label: 'Generales', icon: '⚙️',
  sections: [
    {
      title: 'Stats de Base',
      items: [
        { stat: 'PV', color: 'text-red-400', desc: "Points de vie. A 0 PV, le combattant est elimine." },
        { stat: 'ATK', color: 'text-orange-400', desc: "Attaque. Determine les degats infliges par les competences." },
        { stat: 'DEF', color: 'text-blue-400', desc: "Defense. Reduit les degats recus.", formula: 'reduction = DEF / (DEF + 300)' },
        { stat: 'SPD', color: 'text-green-400', desc: "Vitesse. Determine l'ordre des tours (ARC) ou la frequence d'attaque (PvP/Raid)." },
        { stat: 'CRIT', color: 'text-yellow-400', desc: 'Taux critique (max 80%). Chance de coup critique.', formula: 'degats x1.5 + bonusCritDmg' },
        { stat: 'RES', color: 'text-purple-400', desc: 'Resistance (max 70%). Reduit les degats magiques et elementaires.', formula: 'mult = 1 - RES/100' },
        { stat: 'INTEL', color: 'text-cyan-400', desc: "Intelligence (ex-Mana). Reserve d'energie pour les competences.", formula: 'Intel = 50 + PV/4 + RES×2' },
      ],
    },
    {
      title: 'Regeneration de Mana',
      color: 'cyan',
      lines: [
        'Formule de base : manaRegen = 5 + floor(SPD / 15), cap SPD bonus a +10',
        'Exemples : SPD 30 → regen 7/tour | SPD 60 → regen 9 | SPD 150+ → regen 15 (cap)',
        'ARC I : regen appliquee 1× par tour (apres chaque action)',
        'ARC II / Raid SC : regen = base × (attackInterval / 3000) par attaque',
        'PVP : regen = base × (attackInterval / 3000) × 0.75 (25% plus lent qu\'en PvE)',
        'Expedition : Support 8 mana/sec | Autres classes 2 mana/sec (+ bonus equip %)',
        'Campfire (Expedition) : +80% du mana max en une fois',
        'Skill manaRestore : certains skills restaurent X% du mana max apres utilisation',
      ],
    },
    {
      title: 'Allocation de Points',
      desc: 'Chaque niveau donne 3 points a repartir librement.',
      points: [
        { stat: 'PV', value: '+20/pt', color: 'text-red-400' },
        { stat: 'ATK', value: '+2/pt', color: 'text-orange-400' },
        { stat: 'DEF', value: '+2/pt', color: 'text-blue-400' },
        { stat: 'SPD', value: '+1/pt', color: 'text-green-400' },
        { stat: 'CRIT', value: '+0.5%/pt', color: 'text-yellow-400' },
        { stat: 'RES', value: '+0.3%/pt', color: 'text-purple-400' },
        { stat: 'INTEL', value: '+4/pt', color: 'text-cyan-400' },
      ],
    },
    {
      title: 'Formule de Degats',
      formulas: [
        { label: 'DEGATS BRUTS', formula: 'DMG = ATK × (Puissance / 100) × MultElem × DefFactor × ResFactor × CritMult × Variance(0.9-1.1)' },
        { label: 'FACTEUR DEFENSE', formula: 'DefFactor = 300 / (300 + DEF_cible)' },
        { label: 'MULTIPLICATEUR ELEMENTAIRE', formula: 'Avantage: x1.3 | Desavantage: x0.75 | Neutre: x1.0' },
        { label: 'COUP CRITIQUE', formula: 'CritMult = 1.5 + critDamageBonus/100' },
      ],
    },
    {
      title: 'Systeme Intel — Mages & Supports',
      color: 'violet',
      lines: [
        'Les classes Mage et Support scalent leurs degats et soins sur l\'Intelligence au lieu de l\'ATK pure.',
        'ATK eff = Intel × 1.2 (Mage) | Intel × 0.8 (Support) | Intel × 1.0 (Tank)',
        'Bonus heal = 1 + Intel/1000 (200 Intel = +20%, 500 Intel = +50%)',
        'Les supports soignent sans cout de mana.',
      ],
    },
    {
      title: 'Diminishing Returns (Softcap)',
      color: 'amber',
      lines: [
        'Formule: softcap(val, k) = k × ln(1 + val/k)',
        'CRIT (k=80): 50→39%, 100→61%, 150→75%, 200→85%',
        'RES dmg (k=50): 50→35%, 100→55%, 150→69%, cap 70%',
        'RES anti-crit (k=60×0.5): 50→18%, 100→29%, 200→41%',
        'SPD: 0-100 plein effet, 100-200 ×0.5, 200+ ×0.25',
      ],
    },
    {
      title: 'Systeme d\'Enchantement',
      color: 'emerald',
      lines: [
        'Cout: 10 Alkahest par enchantement',
        'Stats % : +10% a +30% de la valeur de base',
        'Stats flat : +10% a +50% de la valeur de base',
        'Re-enchant : le bonus peut monter OU descendre (risque)',
        'Re-roll main stat : 10 Alkahest, reset le bonus d\'enchant',
        'Sources Alkahest : Raid Manaya, Raid Ant Queen (5% par roll)',
      ],
    },
    {
      title: 'Triangle Elementaire',
      lines: [
        'Feu > Vent > Eau > Feu (cycle principal)',
        'Terre > Lumiere <> Ombre (avantage mutuel)',
        'Avantage : ×1.3 | Desavantage : ×0.75 | Neutre : ×1.0',
      ],
    },
  ],
};

// ── ARC I & ARC II ────────────────────────────────────────────

export const MECHANICS_ARC = {
  id: 'arc', label: 'ARC I & II', icon: '⚔️',
  sections: [
    {
      title: 'ARC I — Combat au Tour par Tour',
      lines: [
        'Combat 1v1 contre des ennemis de difficulte croissante.',
        'L\'ordre des tours est determine par la SPD : le plus rapide agit en premier.',
        'Chaque combattant utilise une competence par tour (basic attack gratuit, skills coutent de la Mana).',
        'Apres chaque action : cooldowns tick, buffs/debuffs tick, poisons resolus.',
      ],
    },
    {
      title: 'Cout Mana & Regen (ARC I)',
      color: 'cyan',
      lines: [
        'Basic attack : 0 mana (toujours gratuit)',
        'Skill heal : 10% du mana max (min 30)',
        'Skill buff pur (pas de degats) : 5% du mana max (min 15)',
        'Skill offensif : 5 + puissance/15 + cooldown×3',
        'Regen : 5 + floor(SPD/15) par tour (cap bonus SPD a +10)',
        'Exemple : SPD 45 → regen 8/tour, SPD 120 → regen 13/tour',
      ],
    },
    {
      title: 'Tours Supplementaires (SPD)',
      color: 'green',
      lines: [
        'Si votre SPD >= 2× la SPD la plus rapide de l\'ennemi : +1 tour supplementaire',
        'Si votre SPD >= 3× : +2 tours supplementaires (maximum)',
        'Les tours bonus ont une priorite plus basse (apres les tours normaux).',
      ],
    },
    {
      title: 'ARC II — Combat 3v3+',
      color: 'blue',
      lines: [
        '3 combattants allies vs 1 boss + 1 a 4 sbires.',
        'Les sbires ont 55% des stats du boss de base.',
        'L\'ordre de tour inclut TOUS les combattants vivants, recalcule chaque round.',
        'L\'IA ennemie est role-based : Support (heal allies), Debuffer (affaiblit joueurs), Attacker (focus DPS).',
        'Mana regen temps reel : base × (attackInterval / 3000) par attaque.',
        'Un perso lent (interval 6s) regen 2× plus de mana par attaque qu\'un perso rapide (3s).',
      ],
    },
    {
      title: 'Multiplicateur de Puissance (ARC II)',
      color: 'red',
      formulas: [
        { label: 'FORMULE', formula: 'PuissanceMult = 3 + tier × 0.5' },
        { label: 'TIER 1', formula: '×3.5 puissance' },
        { label: 'TIER 2', formula: '×4.0 puissance' },
        { label: 'TIER 3', formula: '×4.5 puissance' },
        { label: 'TIER 4', formula: '×5.0 puissance' },
        { label: 'TIER 5', formula: '×5.5 puissance' },
        { label: 'TIER 6', formula: '×6.0 puissance' },
      ],
    },
    {
      title: 'Passifs de Chasseur',
      lines: [
        'Permanent : bonus stats toujours actifs (ex: Fern +15% ATK)',
        'Conditionnel lowHp : actif si PV < seuil% (ex: Kaneki +30% ATK a <50% PV)',
        'Conditionnel highHp : actif si PV > seuil% (ex: Silverbaek +20% ATK a >70%)',
        'Stacking : +X% par attaque, max N stacks (ex: Sian +3% ATK/hit, max 10)',
        'Team Aura : bonus a toute l\'equipe (ex: Megumin +10% ATK/DEF/SPD)',
        'vsBoss : bonus contre boss uniquement (ex: Song +10% ATK)',
        'healBonus : +% soins (ex: Gina +15%), critDmg : +% CRIT DMG (ex: Alicia +20%)',
      ],
    },
    {
      title: 'Mana Scaling (Competences speciales)',
      formulas: [
        { label: 'BONUS MANA', formula: 'manaBonus = floor(10 × sqrt(currentMana × scalingFactor))' },
        { label: 'PUISSANCE FINALE', formula: 'power = basePower + manaBonus' },
        { label: 'EXEMPLE', formula: 'Mana 500, scaling 7 → bonus ≈ 592 → power total ≈ 692%' },
      ],
    },
  ],
};

// ── RAID COLOSSEUM (Ant Queen / Manticore) ──────────────────

export const MECHANICS_RAID_SC = {
  id: 'raid_sc', label: 'Raid SC', icon: '👑',
  sections: [
    {
      title: 'Raid Ant Queen / Manticore',
      lines: [
        '6 tiers de difficulte : Normal → Heroique → Legendaire → Mythique → Divin → Ultime.',
        '3 chasseurs par equipe, 10 barres de PV par boss.',
        'Duree : 180 secondes (3 minutes). Tick rate : 10 ticks/sec.',
        'Boss attaque toutes les 4 secondes (modifie par SPD/phase).',
      ],
    },
    {
      title: 'Mana en Raid SC',
      color: 'cyan',
      lines: [
        'Regen par attaque : (5 + SPD/15) × (attackInterval / 3000)',
        'Un support rapide (SPD 60, interval ~2s) regen ~6 mana par attaque',
        'Un support lent (SPD 20, interval ~5s) regen ~10 mana par attaque',
        'Cout des skills : heal 10% mana max (min 30), buff 5% mana max (min 15)',
        'Attention : les supports avec peu de SPD castent moins souvent mais regen plus par cast',
        'Soins (healTeam) : cout 0 mana — les supports soignent gratuitement',
        'manaRestore support : les soins (healTeam) restaurent 5% du mana max apres utilisation',
        'Conseil : investir en SPD pour un support augmente sa cadence ET sa regen de base',
      ],
    },
    {
      title: 'Ant Queen — Stats',
      color: 'amber',
      lines: [
        'Element : Terre | PV : 50K par barre (barre N = 50K × (1 + 0.3×N))',
        'ATK : 500 | DEF : 45 | SPD : 25 | CRIT : 12% | RES : 15%',
        'Penetration DEF : 40% (ignore 40% de la DEF du chasseur)',
        'Skills : Mandibule (basic), Acide (AoE -20% DEF), Essaim (3 hits), Rage (+50% ATK)',
        'Phases : Normal (10 barres), Enrage (6+ barres : ATK ×1.3, SPD ×1.2), Berserk (≤3 : ATK ×1.6, SPD ×1.5)',
      ],
    },
    {
      title: 'Manticore — Stats',
      color: 'red',
      lines: [
        'Element : Feu | PV : 250K par barre (5× Ant Queen)',
        'ATK : 3000 | DEF : 200 | SPD : 35 | CRIT : 30% | RES : 20%',
        'Penetration DEF : 60% | Immune au Stun | Loot ×1.5',
        'Skills : Griffe Infernale (180 power), Souffle de Feu (AoE + DoT 2%/tick 6s), Queue Venimeuse (250 power + DoT 4%/tick 8s)',
        'Malediction Brulante (-50% soins recus 10s), Rugissement (+35% ATK self), Charge (350 power)',
        'Phases : Traque (10 barres), Furie (6+ : ATK ×1.4, SPD ×1.3), Carnage (≤3 : ATK ×1.8, SPD ×1.6)',
      ],
    },
    {
      title: 'Tiers de Difficulte',
      table: {
        headers: ['Tier', 'Nom', 'HP ×', 'ATK ×', 'DEF ×', 'SPD ×', 'Coins ×', 'XP ×'],
        rows: [
          ['1', 'Normal', '1.0', '1.0', '1.0', '1.0', '1.0', '1.0'],
          ['2', 'Heroique', '3.0', '1.5', '1.3', '1.1', '2.5', '2.0'],
          ['3', 'Legendaire', '10', '2.2', '1.8', '1.3', '5.0', '3.5'],
          ['4', 'Mythique', '35', '3.0', '2.5', '1.5', '10', '5.0'],
          ['5', 'Divin', '120', '4.0', '3.5', '1.8', '20', '8.0'],
          ['6', 'Ultime', '300', '5.5', '4.5', '2.0', '40', '12'],
        ],
      },
    },
    {
      title: 'Synergies d\'Equipe',
      color: 'cyan',
      lines: [
        'Trinity Element (3 meme element) : ATK +20%, DEF +10%',
        'Duo Element (2 meme element) : ATK +10%',
        'Diversite Classes (3+ classes differentes) : Toutes Stats +5%',
        'Support present : PV equipe +10%',
        'Tank present : DEF equipe +10%',
        'Resonance Cross-Team (meme element dominant sur 2 equipes) : CRIT +5%',
      ],
    },
    {
      title: 'Faiblesses Elementaires Hebdomadaires',
      lines: [
        'Chaque boss a 2 faiblesses elementaires qui changent chaque semaine.',
        'Reset : jeudi 00:00 UTC. Deterministe par boss + numero de semaine.',
        'Frapper une faiblesse : ×1.3 degats (au lieu du triangle classique).',
        '6 elements possibles : Ombre, Feu, Vent, Terre, Eau, Lumiere.',
      ],
    },
  ],
};

// ── RAID MANAYA ──────────────────────────────────────────────

export const MECHANICS_RAID_MANAYA = {
  id: 'raid_manaya', label: 'Raid Manaya', icon: '🐉',
  sections: [
    {
      title: 'Raid Manaya — Combat Temps Reel',
      lines: [
        'Combat temps reel inspire de TERA Online. 1-5 joueurs.',
        '60 TPS (ticks/sec), broadcast a 20 Hz. Arena : 1600×1200 pixels.',
        'Manaya : 15M HP (150 barres), ATK 450, DEF 50, SPD 140.',
        'Enrage a 5% HP ou apres 900s (15 min). 6 phases basees sur % HP.',
      ],
    },
    {
      title: 'Mana en Raid Manaya',
      color: 'cyan',
      lines: [
        'Tank : 400 Mana max — regen passive (block genere de l\'aggro, pas besoin de spam)',
        'Healer : 800 Mana max — regen rapide, Heal Circle 80 mana, Zone Heal 120, Rez 200, Purify 100',
        'Warrior (DPS CAC) : 100 RAGE — pas de mana, systeme RAGE independant (voir section dediee)',
        'Archer : 500 Mana — Tir Rapide 30, Charge Shot 80, Pluie Fleches 60, Barrage 120',
        'Berserker : 400 Mana — Charged Attack varie (40-120 selon charge), Whirlwind 150, Rage buff 60',
        'Regen passive : 2 mana/tick base (varie par classe). Healer regen 3×.',
      ],
    },
    {
      title: '5 Classes Jouables',
      color: 'blue',
      lines: [
        'Tank : 25K HP, 400 Mana, 350 ATK, 300 DEF. Aggro ×3. Block (75% reduc), Taunt, Sacred Shield (3000 HP), Invincibilite 4s.',
        'Healer : 18K HP, 800 Mana, 200 ATK, 120 DEF. Aggro ×0.7. Heal Circle, Zone Heal, Purification (dissipe rage boss), Resurrection (60% HP).',
        'Warrior (DPS CAC) : 22K HP, 100 RAGE, 5100 ATK, 150 DEF. Combo 3 hits. Blade Storm, Dash Offensif, Execution (1200 power, +50% vs low HP).',
        'Archer (DPS Range) : 14K HP, 500 Mana, 600 ATK, 80 DEF. Tir Rapide, Charge Shot, Pluie de Fleches, Barrage (12 hits).',
        'Berserker : 23K HP, 400 Mana, 2460 ATK, 140 DEF. Block (50% reduc), Rage (+80% ATK +20% SPD), Charged Attack (4 niveaux), Whirlwind (8×1500 power).',
      ],
    },
    {
      title: 'Systeme RAGE (Warrior)',
      color: 'red',
      lines: [
        'Max 100 Rage, demarre a 0. Pas de regen passive.',
        'Gain : +15 rage par attaque basique touchee.',
        'Cout : Heavy Strike 15, Dash 25, Blade Storm 40, Execution 80.',
        'Impossibilite d\'utiliser une skill sans rage suffisante.',
      ],
    },
    {
      title: 'Systeme Aggro',
      lines: [
        '1 degat = 1 aggro | 1 soin = 0.5 aggro | Block = 50 aggro/sec | Taunt = 5000 aggro',
        'Multiplicateurs : Tank ×3, Healer ×0.7, Warrior/Archer ×1, Berserker ×1.1',
        'Le boss cible le joueur avec le plus d\'aggro (sauf patterns AoE).',
        'Pas de decay d\'aggro (reste permanent comme dans TERA).',
      ],
    },
    {
      title: 'Esquive & I-Frames',
      color: 'green',
      lines: [
        'Vitesse d\'esquive : 420px/sec (vs 145px/sec mouvement normal).',
        'Duree : 0.6 sec | I-frames : 1.0 sec d\'invincibilite totale.',
        'Cooldown : 6 secondes entre esquives.',
        'Maintenir attaque annule l\'esquive.',
      ],
    },
    {
      title: 'Patterns du Boss (17 attaques)',
      color: 'purple',
      lines: [
        'Phase 1 (100-90%) : Souffle Frontal (cone 220px), Balayage Queue (arriere 108°), Griffe Rapide (melee), Souffle Corrompu (channel 2s)',
        'Phase 2 (90-75%) : Anneau Destructeur (donut AoE, instant kill interieur/exterieur), Cercle Empoisonne (suit le joueur, poison 3% HP/tick)',
        'Phase 3 (75-50%) : Sphere de Mort (250px, true damage), Vague Devastatrice (ring expanding 30→450px), Plongeon (charge sur cible)',
        'Phase 3+ : Vagues d\'Energie (5-7 projectiles), Trinite Ecarlate (3 lasers 120° rotatifs, 18× ATK/tick)',
        'Phase 4 (50-30%) : Laser Devastateur (800px rotatif), Double Impact (donut 2 phases, true damage)',
        'Mecaniques : Trinite des Marques (3 debuffs obligatoires, wipe si rate), Bouclier d\'Energie (12% HP, 15s pour casser)',
        'Special : Invocation de Puissance (3 stacks rage = ×3 degats 30s, dispellable par Healer)',
      ],
    },
    {
      title: 'Difficultes',
      table: {
        headers: ['Difficulte', 'HP ×', 'DMG ×', 'SPD ×'],
        rows: [
          ['Normal', '1.0', '1.0', '1.0'],
          ['Hard', '2.0', '1.5', '1.2'],
          ['Nightmare', '3.5', '2.5', '1.5'],
          ['Nightmare+', '5.0', '3.5', '1.7'],
          ['Nightmare++', '8.0', '5.0', '2.0'],
          ['Nightmare+++', '12.0', '7.0', '2.3'],
        ],
      },
    },
    {
      title: 'Adds & Minions',
      lines: [
        'Minion : 40K HP, 150 ATK, SPD 120. Elite : 120K HP, 300 ATK. Caster : 30K HP, 200 ATK.',
        'Max 8 adds en vie simultanement. Spawn par phase (Phase 4 : +2 minions +1 elite).',
        'Tous les stats sont multiplies par le facteur de difficulte.',
      ],
    },
    {
      title: 'Set Manaya (Tier 12)',
      color: 'emerald',
      lines: [
        '2pc : ATK +10% | 4pc : DEF +25% | 6pc : Tous Degats +15% | 8pc : 5% chance stun boss + burn',
        'Craft avec Plumes de Manaya : Arme 3 plumes, Armure 2, Boots/Accessoires 1 chaque.',
        'Total : 14 plumes pour le set complet. Arme Manaya : 300 ATK, +40 CRIT DMG.',
      ],
    },
  ],
};

// ── EXPEDITION ───────────────────────────────────────────────

export const MECHANICS_EXPEDITION = {
  id: 'expedition', label: 'Expedition', icon: '🗺️',
  sections: [
    {
      title: 'Expedition — Combat 2D en Temps Reel',
      lines: [
        'Jusqu\'a 30 joueurs, 6 chasseurs par joueur. 15 boss progressifs.',
        '4 TPS tick rate. Positionnement 1D (axe X) avec formation en arc autour du boss.',
        'Progression : inscription → [marche → combat → loot → campfire] × N → victoire/wipe.',
        'Crash recovery : snapshot JSONB sauvegarde toutes les 60 secondes.',
      ],
    },
    {
      title: 'Scaling des Stats',
      color: 'cyan',
      table: {
        headers: ['Stat', 'Multiplicateur', 'Exemple (base 100)'],
        rows: [
          ['HP', '×8', '→ 800'],
          ['ATK', '×1.5', '→ 150'],
          ['DEF', '×2.0', '→ 200'],
          ['SPD', '×1.0', '→ 100'],
          ['CRIT', '×1.0', '→ 100'],
          ['RES', '×1.0', '→ 100'],
        ],
      },
    },
    {
      title: 'Roles & Positionnement',
      color: 'blue',
      lines: [
        'Tank : frontline (100px du boss). Mana 400, aggro eleve.',
        'Fighter/Assassin : frontline DPS (180px). Degats physiques.',
        'Mage : backline DPS (260px). Utilise INT au lieu de ATK.',
        'Support : backline heal (340px). Soins + buffs equipe.',
        'Melee attack interval : 1.0s | Ranged : 1.5s',
      ],
    },
    {
      title: 'Formule de Degats (Expedition)',
      formulas: [
        { label: 'DEGATS', formula: 'DMG = ATK × (Power / 100) × defMult × variance(0.95-1.05)' },
        { label: 'REDUCTION DEF', formula: 'defMult = 100 / (100 + DEF_effective)' },
        { label: 'DEF EFFECTIVE', formula: 'DEF × (1 - armorPen%)' },
        { label: 'CRITIQUE', formula: '×1.5 base damage' },
      ],
    },
    {
      title: 'Mana en Expedition',
      color: 'cyan',
      lines: [
        'Support : 8 mana/sec (regen passive, sans besoin d\'attaquer)',
        'Autres classes : 2 mana/sec (regen passive)',
        'Bonus equipement % : augmente la regen de base',
        'Campfire : +80% du mana max en une fois (voir section Campfire)',
        'Les supports beneficient de 4× plus de regen — ils peuvent soigner en continu.',
      ],
    },
    {
      title: 'Campfire (Entre les Boss)',
      color: 'amber',
      lines: [
        'Duree : 45 secondes de repos.',
        'Regen HP : +30% | Regen Mana : +80%',
        'Healer peut ressusciter 1 allie par combat (a 30% HP).',
        'Si wipe : les chasseurs au repos peuvent sauver le raid (healer rez a 40%).',
      ],
    },
    {
      title: 'Armes SC en Expedition',
      color: 'purple',
      lines: [
        'Sulfuras : +33% ATK/stack (max 3 = +100% ATK)',
        'Katana Z : +5% ATK/hit (permanent), 50% contre-attaque (200% ATK)',
        'Katana V : 1.5% maxMana DoT/stack (max 7), 18% buff chance, ×3 prochain coup',
        'Arc des Murmures : 10% silence → +100% ATK/stack',
        'Gul\'dan : heal aura (+2%/stack), stun 5%, +DEF/ATK progressif',
        'Lance Brise-Tyran : -30% ATK boss (8s, CD 20s), +10% DEF allies proches',
      ],
    },
    {
      title: 'Patterns des Boss',
      lines: [
        'frontal : frappe le frontline (dans le range)',
        'aoe_melee : touche tous dans le rayon',
        'aoe_ranged : cible le backline (30% des chasseurs)',
        'aoe_all : touche toute l\'equipe',
        'multi_hit : N frappes sur cibles aleatoires',
        'execute : degats massifs sur le chasseur avec le moins de HP%',
        'anti_heal : applique anti-soin + degats optionnels',
        'summon : invoque des mobs (avec multiplicateur de difficulte)',
      ],
    },
  ],
};

// ── PVP ASYNC ────────────────────────────────────────────────

export const MECHANICS_PVP = {
  id: 'pvp', label: 'PVP', icon: '🏟️',
  sections: [
    {
      title: 'PVP Asynchrone — Combat Auto',
      lines: [
        'Matchmaking par Power Score. 25 matchs/jour maximum.',
        'Duree max : 120 secondes. Rating Elo (depart 1000).',
        'IA configurable : Agressive, Equilibree, Defensive.',
        'Les equipes sont pre-buildees et combattent automatiquement.',
      ],
    },
    {
      title: 'Multiplicateurs PVP',
      color: 'red',
      table: {
        headers: ['Parametre', 'Valeur', 'Effet'],
        rows: [
          ['PVP_DAMAGE_MULT', '×0.15', 'Degats reduits a 15% (anti-oneshot)'],
          ['PVP_HP_MULT', '×5', 'HP ×5 (combats longs)'],
          ['PVP_DEF_MULT', '×1.6', 'DEF +60% plus efficace'],
          ['PVP_RES_MULT', '×1.4', 'RES +40% plus efficace'],
          ['PVP_DMG_CAP', '8%', 'Aucun coup ne peut depasser 8% HP max'],
          ['Duree', '120s', '2 minutes maximum'],
        ],
      },
    },
    {
      title: 'Power Score (Matchmaking)',
      formulas: [
        { label: 'CALCUL', formula: 'Score = HP×0.5 + ATK×8 + DEF×3 + SPD×2 + CRIT×5 + RES×4' },
      ],
    },
    {
      title: 'IA de Combat',
      color: 'amber',
      lines: [
        'Agressive : heal seulement si PV < 15%, buff 20% du temps, nuke 90%.',
        'Defensive : heal si PV < 60%, buff 80% du temps, nuke modere.',
        'Equilibree : comportement par defaut, balance entre heal/buff/attaque.',
        'Focus cible : achever PV < 20%, puis support en priorite, puis weighted random.',
      ],
    },
    {
      title: 'Passifs Actifs en PVP',
      lines: [
        'Tous les passifs de sets et d\'armes sont actifs (Sulfuras, Katana V, etc.).',
        'Passifs d\'equipe : Martyr (-30% ATK self, +15% allies), Shadow Pact (-50% self, +150% allies).',
        'Commander DEF (+10% allies), Commander CRIT (+20 allies 8s).',
        'Siphon Vital (PV > 80% → +30% DMG), Arcane Tempest (+2% DMG/10% mana restant).',
        'Esquive : 12% chance de dodge. Contre-attaque : 80% des degats renvoyes.',
      ],
    },
    {
      title: 'Mana en PVP',
      color: 'cyan',
      lines: [
        'Regen par attaque : (5 + SPD/15) × (attackInterval / 3000) × 0.75',
        'Le facteur ×0.75 rend la regen 25% plus lente qu\'en PvE (empeche le spam de buffs).',
        'Basic attack : 0 mana | Heal : 10% mana max (min 30) | Buff pur : 5% mana max (min 15)',
        'Skill offensif : 5 + puissance/15 + cooldown×3',
        'Les supports doivent gerer leur mana prudemment — moins de regen, memes couts.',
      ],
    },
    {
      title: 'Soins en PVP',
      formulas: [
        { label: 'SOIN', formula: 'healAmount = maxHP × 0.15 × (1 + healBonus%) × intelHealMult' },
        { label: 'INTEL MULT', formula: 'intelHealMult = 1 + maxMana/1000' },
      ],
    },
  ],
};

// ── EXPORT ALL ───────────────────────────────────────────────

export const ALL_MECHANICS_TABS = [
  MECHANICS_GENERAL,
  MECHANICS_ARC,
  MECHANICS_RAID_SC,
  MECHANICS_RAID_MANAYA,
  MECHANICS_EXPEDITION,
  MECHANICS_PVP,
];
