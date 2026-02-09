# SIAN HALAT - Structure de données complète

## Informations générales
- **ID**: `sian`
- **Nom**: Sian Halat
- **Classe**: Elemental Stacker (Infuseur Élémentaire)
- **Élément**: Dark
- **Rareté**: SSR
- **Scale Stat**: ATK
- **Rôle**: DPS / Debuffer / Team Buffer

---

## ADVANCEMENT 0 (A0) - Base Passive

### Passive : Flawless Swordsmanship Gauge System
- Les skills chargent la gauge [Flawless Swordsmanship]
- À 50%+ gauge → Active [Crimson Sword Dance]
- Quand certains skills hit → Active [Crimson Fury]

### [Crimson Sword Dance] (A0)
- **Type**: Buff personnel (self)
- **Trigger**: Gauge ≥ 50%
- **Effets**:
  - +10% Dark Elemental Accumulation
  - +5% Dark Damage
  - +5% Attack
- **Durée**: 15 secondes

### [Crimson Fury] (A0)
- **Type**: Buff personnel (self) + Heal
- **Trigger**: Skills hit
- **Effets**:
  - Heal instantané : 5% ATK
  - +5% HP Recovery Rate
- **Durée**: 5 secondes

---

## ADVANCEMENT 1 (A1)

### Nouvelles mécaniques
- Skills transformés (Full Moon / Bloodstorm) quand gauge ≥ 50%
  - +100% damage
  - Consomme 50% gauge
- Immortalité à 1 HP (once per battle, 2s)
  - Heal 50% ATK quand immunité expire

### [Scarlet Domination] (A1) - DEBUFF
- **Type**: Debuff sur ennemi
- **Trigger**: Skills hit enemy
- **Effets**:
  - +5% Dark Damage Taken (ennemi)
  - +5% Dark Overload Damage Taken (ennemi)
- **Durée**: 10 secondes
- **Stacks**: Max 2

### [Undying Fury] (A1) - Upgrade de Crimson Fury
- **Type**: Buff personnel (self) + Heal
- **Trigger**: Skills hit
- **Effets**:
  - Heal instantané : 10% ATK (était 5%)
  - +10% HP Recovery Rate (était 5%)
- **Durée**: 5 secondes

---

## ADVANCEMENT 2 (A2)

### [Oath of Victory] (A2) - TEAM BUFF
- **Type**: Buff TEAM (3 hunters)
- **Trigger**: Début du stage (permanent)
- **Effets**:
  - +20% Damage vs Dark Overloaded targets
- **Durée**: Infinie
- **Scope**: Entire team (3 hunters de la team de Sian)

### Bonus A2
- +20% Dark Elemental Accumulation (personnel)

---

## ADVANCEMENT 3 (A3)

### [Crimson Sword Dance] (A3) - ENHANCED
- **Type**: Buff personnel (self)
- **Trigger**: Gauge ≥ 50%
- **Effets**:
  - +20% Dark Elemental Accumulation (était 10%)
  - +10% Dark Damage (était 5%)
  - +10% Attack (était 5%)
- **Durée**: 30 secondes (était 15s)

### [Guardian's Resolve] (A3) - STACKING BUFF
- **Type**: Buff personnel (self) - STACKING INFINI
- **Trigger**: Skills hit
- **Effets** (PAR STACK):
  - +1% Dark Elemental Accumulation
  - +1.6% Dark Damage
  - +1% Attack
- **Durée**: Infinie
- **Stacks**: Max 20
- **Max total** (20 stacks):
  - +20% Dark Elemental Accumulation
  - +32% Dark Damage
  - +20% Attack

---

## ADVANCEMENT 4 (A4) - TEAM DEF PEN BUFF

### Def Pen per Dark Ally (A4)
- **Type**: Buff RAID (tous les Dark hunters du raid)
- **Trigger**: Passif permanent
- **Effets**:
  - +3% Defense Penetration par Dark ally dans le raid
  - Exemple : 6 Dark hunters = 6 × 3% = 18% Def Pen
- **Scope**: "Dark team members" = Tous les Dark du RAID (exclu Sung)
- **Note**: Buff multiplicatif basé sur composition raid

---

## ADVANCEMENT 5 (A5) - ULTIMATE FORM

### [Scarlet Domination] (A5) - ENHANCED DEBUFF
- **Type**: Debuff sur ennemi
- **Trigger**: Skills hit enemy
- **Effets**:
  - +10% Dark Damage Taken (était 5%)
  - +10% Dark Overload Damage Taken (était 5%)
- **Durée**: 20 secondes (était 10s)
- **Stacks**: Max 4 (était 2)

### [Undying Fury] (A5) - ENHANCED
- **Type**: Buff personnel (self) + Heal
- **Trigger**: Skills hit
- **Effets**:
  - Heal instantané : 20% ATK (était 10%)
  - +20% HP Recovery Rate (était 10%)
- **Durée**: 5 secondes

### [Zenith Sword] (A5) - ULTIMATE BUFF
- **Type**: Buff RAID Dark
- **Trigger**: Knight's Pride (Ultimate) hit
- **Effets**:
  - +30% Dark Overload Damage
  - +10% Defense Penetration
  - +15% Attack
- **Durée**: 30 secondes
- **Scope**: Tous les Dark hunters du RAID (exclu Sung)

### Bonus A5
- [Flawless Swordsmanship] Gauge charge rate +100%
- Skills restaurent +20% Power Gauge
- Skills réduisent CD de Knight's Pride de 3s (CD: 0.5s)

---

## ARME : CRIMSON SHADOW

### Passive Arme - Defense Penetration (PERSONNEL)
- **Type**: Buff personnel (self)
- **Effets**: +2% à +15% Def Pen selon advancement
- **Progression**:
  - A0: +2% Def Pen
  - A1: +4% Def Pen
  - A2: +6% Def Pen
  - A3: +9% Def Pen
  - A4: +12% Def Pen
  - A5: +15% Def Pen

### Passive Arme - Dark Damage Buff (TEAM)
- **Type**: Buff TEAM (3 hunters) - CONDITIONNEL
- **Trigger**: Quand un ennemi a Dark [Overload]
- **Effets**: +2% à +12% Dark Damage selon advancement
- **Progression** (linéaire):
  - A0: +2% Dark Damage per stack
  - A1: +4% Dark Damage per stack
  - A2: +6% Dark Damage per stack
  - A3: +8% Dark Damage per stack
  - A4: +10% Dark Damage per stack
  - A5: +12% Dark Damage per stack
- **Stacks**: Max 4 stacks
- **Max total** (A5, 4 stacks): +48% Dark Damage
- **Durée**: Infinie
- **Scope**: "Entire team" = TEAM (3 hunters) ← À CONFIRMER si RAID

---

## SKILLS - Multiplicateurs

### Basic Attack : Royal Swordsmanship (Chain)
- **Stage 1**: 196-294% ATK
- **Stage 2**: 214-321% ATK
- **Stage 3**: 177-265.5% ATK
- **Element**: Dark
- **Effect**: Weak Elemental Accumulation

### Core Attack : Royal Swordsmanship - Judgment
- **Damage**: 1020-1530% ATK
- **Element**: Dark
- **Effect**: Weak Elemental Accumulation
- **CC**: Knock Down (final hit)
- **Protection**: Super Armor

### Basic Skill 1 : Black Flash
- **Damage**: 2290-3435% ATK
- **Cooldown**: 10s
- **MP**: 75-99
- **Element**: Dark
- **Effect**: Medium Elemental Accumulation
- **CC**: Airborne (final hit)
- **Protection**: Super Armor

### Basic Skill 2 : Rush
- **Damage**: 3132-4698% ATK
- **Cooldown**: 12s
- **MP**: 100-132
- **Element**: Dark
- **Effect**: Medium Elemental Accumulation
- **CC**: Airborne (final hit)
- **Protection**: Super Armor

### Ultimate : Knight's Pride
- **Damage**: 5190-7785% ATK
- **Cooldown**: 45s
- **Power Gauge**: 100%
- **Element**: Dark
- **Effect**: Heavy Elemental Accumulation
- **CC**: Airborne (final hit)
- **Buff déclenché**: [Zenith Sword] (A5)

---

## OPTIMISATION (Sweet Spots)

### Stats Prioritaires
1. **Crit Rate**: 95-100% (cap obligatoire)
2. **Defense Penetration**: 95-100% (avec buffs, viser 100%)
3. **Crit Damage**: 170-220% (optimal ~200%)
4. **Attack**: 38,000-50,000+ (whale)

### Substats Priority
1. Def Pen
2. ATK%
3. Crit Rate%
4. Crit DMG%

### Sets Recommandés
- Armed 4pc + Expert 4pc
- Armed 4pc + Obsidian 4pc

### Benchmarks (DPS estimé 3min boss)
- **Casual**: 5-12B
- **Intermediate**: 15-25B
- **Advanced**: 30-45B
- **Whale**: 50-62B

### Tier List
- **Boss Raid**: S
- **PvP**: A
- **PvE General**: A

---

## BUFFS SUMMARY PAR ADVANCEMENT

| Advancement | Buffs Personnels | Buffs Team/Raid | Debuffs Ennemis |
|-------------|------------------|-----------------|-----------------|
| **A0** | Crimson Sword Dance, Crimson Fury | - | - |
| **A1** | Undying Fury, Immortality | - | Scarlet Domination (2 stacks) |
| **A2** | +20% Dark Elem Acc | Oath of Victory (TEAM) | - |
| **A3** | Enhanced Crimson Sword Dance, Guardian's Resolve (20 stacks) | - | - |
| **A4** | - | +3% Def Pen per Dark ally (RAID Dark) | - |
| **A5** | Enhanced Undying Fury, +100% Gauge charge | Zenith Sword (RAID Dark) | Enhanced Scarlet Domination (4 stacks) |

---

## NOTES IMPORTANTES

- **Sung**: N'est PAS affecté par les buffs Dark (pas d'élément)
- **"Entire team"**: TEAM (3 hunters)
- **"Dark team members" / "Dark ally" SANS "team"**: RAID Dark (tous les Dark du raid, exclu Sung)
- **Arme buff** ("entire team"): TEAM (3) ← À CONFIRMER si RAID
- **Progression arme**: LINÉAIRE (2%, 4%, 6%, 8%, 10%, 12%)

---

*Document de référence pour implémentation dans Theorycraft*
*Date: 2026-02-09*
