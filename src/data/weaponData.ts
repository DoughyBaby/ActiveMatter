export type PlateSize = 'S' | 'L' | 'XL';
export type ArmorMaterial = 'none' | 'rusty' | 'uhmwpe' | 'steel' | 'titanium' | 'ceramic';
export type WeaponCategory = 'heavy' | 'intermediate' | 'smg' | 'lmg' | 'dmr' | 'bolt' | 'shotgun';
export type BodyZone = 'torso' | 'legs' | 'arms';

export interface ArmorSpec {
  mitigation: number;
  hp: number;
}

export interface ArmorMaterialDef {
  id: ArmorMaterial;
  name: string;
  shortName: string;
  sizes: Record<PlateSize, ArmorSpec>;
}

export interface WeaponData {
  id: number;
  name: string;
  caliber: string;
  category: WeaponCategory;
  rpm: string;
  rpmNum: number;
  baseDamage: number;
}

export interface TTKResult {
  ttk: number;
  btk: number;
}

export interface CombatLogEntry {
  shot: number;
  limbHP: number;
  torsoHP: number;
  armorHP: number;
  damageToLimb: number;
  overflowToTorso: number;
  limbKnockedOut: boolean;
}

export interface DuelTTKResult extends TTKResult {
  log: CombatLogEntry[];
}

export const BODY_ZONE_DATA: Record<BodyZone, { label: string; hp: number }> = {
  torso: { label: 'Torso (220 HP vital pool)', hp: 220 },
  legs:  { label: 'Legs (165 HP)',             hp: 165 },
  arms:  { label: 'Arms (130 HP)',             hp: 130 },
};

export const TORSO_HP = 220;

export const ARMOR_MATERIALS: ArmorMaterialDef[] = [
  {
    id: 'rusty', name: 'Rusty Steel', shortName: 'Rusty',
    sizes: { S: { mitigation: 30, hp: 190 }, L: { mitigation: 35, hp: 310 }, XL: { mitigation: 40, hp: 415 } },
  },
  {
    id: 'uhmwpe', name: 'UHMWPE', shortName: 'UHMWPE',
    sizes: { S: { mitigation: 25, hp: 200 }, L: { mitigation: 30, hp: 300 }, XL: { mitigation: 40, hp: 350 } },
  },
  {
    id: 'steel', name: 'Military Steel', shortName: 'Steel',
    sizes: { S: { mitigation: 35, hp: 220 }, L: { mitigation: 40, hp: 340 }, XL: { mitigation: 50, hp: 460 } },
  },
  {
    id: 'titanium', name: 'Titanium', shortName: 'Titanium',
    sizes: { S: { mitigation: 45, hp: 230 }, L: { mitigation: 50, hp: 360 }, XL: { mitigation: 60, hp: 480 } },
  },
  {
    id: 'ceramic', name: 'Ceramic', shortName: 'Ceramic',
    sizes: { S: { mitigation: 50, hp: 175 }, L: { mitigation: 60, hp: 260 }, XL: { mitigation: 70, hp: 300 } },
  },
];

export const PLATE_SIZES: { id: PlateSize; label: string; fullLabel: string }[] = [
  { id: 'S',  label: 'S',  fullLabel: 'Small' },
  { id: 'L',  label: 'L',  fullLabel: 'Large' },
  { id: 'XL', label: 'XL', fullLabel: 'Extra Large' },
];

// --- Body Sleeve definitions ---
// Each sleeve locks a specific plate layout: torso, hands (left+right), and legs (left+right).
// 'none' means no plate slot on that body part. Sizes are S, L, or XL.
// Data sourced from getrankd.gg body sleeves guide (build 0.4.0.93, 15 Sep 2026).

export type SleeveSlot = PlateSize | 'none';

export interface BodySleeve {
  id: string;
  name: string;
  operative: string;
  rarity: 'Uncommon' | 'Rare' | 'Epic';
  volume: number;
  torso: SleeveSlot;
  hands: SleeveSlot;  // both hands same size
  legs: SleeveSlot;   // both legs same size
  category: 'armor' | 'xl-torso' | 'speed' | 'stealth' | 'healing' | 'melee' | 'civilian';
}

export const BODY_SLEEVES: BodySleeve[] = [
  // --- Armour ---
  { id: 'knight',   name: 'Knight',   operative: 'Joris van Dijk', rarity: 'Epic',     volume: 525, torso: 'L',  hands: 'L', legs: 'L', category: 'armor' },
  { id: 'beast',    name: 'Beast',    operative: 'Karl Müller',    rarity: 'Uncommon', volume: 300, torso: 'L',  hands: 'none', legs: 'S', category: 'armor' },
  { id: 'rock',     name: 'Rock',     operative: 'Kwame Mensah',   rarity: 'Uncommon', volume: 300, torso: 'L',  hands: 'none', legs: 'S', category: 'armor' },
  { id: 'mermaid',  name: 'Mermaid',  operative: 'Naomi Carter',   rarity: 'Rare',     volume: 400, torso: 'L',  hands: 'S', legs: 'S', category: 'armor' },
  { id: 'rebel',    name: 'Rebel',    operative: 'Sergei Volkov',  rarity: 'Rare',     volume: 400, torso: 'L',  hands: 'S', legs: 'L', category: 'armor' },
  { id: 'alfa',     name: 'Alfa',     operative: 'Alexander Arkhangelsky', rarity: 'Rare', volume: 400, torso: 'L', hands: 'S', legs: 'S', category: 'armor' },

  // --- Extra-large torso ---
  { id: 'rhino',    name: 'Rhino',    operative: 'Karl Müller',    rarity: 'Rare',     volume: 450, torso: 'XL', hands: 'L', legs: 'S', category: 'xl-torso' },
  { id: 'bulwark',  name: 'Bulwark',  operative: 'Joris van Dijk', rarity: 'Rare',     volume: 400, torso: 'XL', hands: 'S', legs: 'L', category: 'xl-torso' },
  { id: 'fuse',     name: 'Fuse',     operative: 'Sergei Volkov',  rarity: 'Rare',     volume: 425, torso: 'XL', hands: 'S', legs: 'L', category: 'xl-torso' },
  { id: 'vanguard', name: 'Vanguard', operative: 'Genevieve Brennan', rarity: 'Rare',  volume: 400, torso: 'XL', hands: 'L', legs: 'S', category: 'xl-torso' },
  { id: 'guts',     name: 'Guts',     operative: 'Mariko Sato',    rarity: 'Rare',     volume: 400, torso: 'XL', hands: 'S', legs: 'L', category: 'xl-torso' },
  { id: 'hunter',   name: 'Hunter',   operative: 'Si Chen',        rarity: 'Rare',     volume: 425, torso: 'XL', hands: 'L', legs: 'S', category: 'xl-torso' },

  // --- Speed and mobility ---
  { id: 'viper',       name: 'Viper',       operative: 'Naomi Carter',   rarity: 'Epic',     volume: 550, torso: 'L', hands: 'L', legs: 'S', category: 'speed' },
  { id: 'psychologist', name: 'Psychologist', operative: 'Genevieve Brennan', rarity: 'Rare', volume: 400, torso: 'L', hands: 'S', legs: 'S', category: 'speed' },
  { id: 'jay',         name: 'Jay',         operative: 'Si Chen',        rarity: 'Rare',     volume: 425, torso: 'L', hands: 'S', legs: 'S', category: 'speed' },
  { id: 'warlord',     name: 'Warlord',     operative: 'Kwame Mensah',   rarity: 'Rare',     volume: 400, torso: 'L', hands: 'S', legs: 'S', category: 'speed' },
  { id: 'fugitive',    name: 'Fugitive',    operative: 'Karl Müller',    rarity: 'Uncommon', volume: 300, torso: 'L', hands: 'S', legs: 'none', category: 'speed' },
  { id: 'liquidator',  name: 'Liquidator',  operative: 'Mariko Sato',    rarity: 'Uncommon', volume: 325, torso: 'S', hands: 'S', legs: 'S', category: 'speed' },

  // --- Stealth and handling ---
  { id: 'ghost',    name: 'Ghost',    operative: 'Alexander Arkhangelsky', rarity: 'Rare', volume: 425, torso: 'L', hands: 'L', legs: 'S', category: 'stealth' },
  { id: 'shadow',   name: 'Shadow',   operative: 'Mariko Sato',    rarity: 'Rare',     volume: 425, torso: 'L', hands: 'S', legs: 'S', category: 'stealth' },
  { id: 'phantom',  name: 'Phantom',  operative: 'Naomi Carter',   rarity: 'Rare',     volume: 400, torso: 'L', hands: 'S', legs: 'S', category: 'stealth' },
  { id: 'guardian',  name: 'Guardian', operative: 'Kwame Mensah',   rarity: 'Uncommon', volume: 300, torso: 'L', hands: 'none', legs: 'S', category: 'stealth' },
  { id: 'old-man',   name: 'Old Man',  operative: 'Si Chen',        rarity: 'Rare',     volume: 400, torso: 'L', hands: 'none', legs: 'S', category: 'stealth' },
  { id: 'breach',    name: 'Breach',   operative: 'Sergei Volkov',  rarity: 'Uncommon', volume: 300, torso: 'S', hands: 'S', legs: 'S', category: 'stealth' },

  // --- Healing and support ---
  { id: 'paladin',  name: 'Paladin',  operative: 'Joris van Dijk', rarity: 'Epic',     volume: 525, torso: 'L', hands: 'S', legs: 'L', category: 'healing' },
  { id: 'reaper',   name: 'Reaper',   operative: 'Alexander Arkhangelsky', rarity: 'Epic', volume: 500, torso: 'L', hands: 'S', legs: 'S', category: 'healing' },
  { id: 'angel',    name: 'Angel',    operative: 'Genevieve Brennan', rarity: 'Uncommon', volume: 300, torso: 'S', hands: 'S', legs: 'S', category: 'healing' },
  { id: 'pulse',    name: 'Pulse',    operative: 'Naomi Carter',   rarity: 'Uncommon', volume: 325, torso: 'L', hands: 'S', legs: 'none', category: 'healing' },

  // --- Melee ---
  { id: 'wizard',   name: 'Wizard',   operative: 'Kwame Mensah',   rarity: 'Uncommon', volume: 325, torso: 'S', hands: 'S', legs: 'S', category: 'melee' },
  { id: 'mirage',   name: 'Mirage',   operative: 'Karl Müller',    rarity: 'Uncommon', volume: 300, torso: 'S', hands: 'S', legs: 'S', category: 'melee' },
];

export const SLEEVE_CATEGORIES: { id: BodySleeve['category']; label: string }[] = [
  { id: 'armor',    label: 'Armour' },
  { id: 'xl-torso', label: 'XL Torso' },
  { id: 'speed',    label: 'Speed' },
  { id: 'stealth',  label: 'Stealth' },
  { id: 'healing',  label: 'Healing' },
  { id: 'melee',    label: 'Melee' },
];

export function getSleeveById(id: string): BodySleeve | undefined {
  return BODY_SLEEVES.find(s => s.id === id);
}

export function formatSleeveLayout(sleeve: BodySleeve): string {
  const t = sleeve.torso === 'none' ? '—' : sleeve.torso;
  const h = sleeve.hands === 'none' ? '—' : sleeve.hands;
  const l = sleeve.legs === 'none' ? '—' : sleeve.legs;
  return `${t} / ${h} ${h} / ${l} ${l}`;
}

export const WEAPONS: WeaponData[] = [
  // ── Battle Rifles (.308 Win / 12.7x55) ──
  { id: 1,  name: 'M14',              caliber: '.308 Win',    category: 'heavy',        rpm: '700',      rpmNum: 700,  baseDamage: 250 },
  { id: 2,  name: 'ASh-12',           caliber: '12.7x55',    category: 'heavy',        rpm: '650',      rpmNum: 650,  baseDamage: 290 },
  { id: 3,  name: 'SCAR-H',           caliber: '.308 Win',    category: 'heavy',        rpm: '600',      rpmNum: 600,  baseDamage: 250 },
  { id: 4,  name: 'G3A4',             caliber: '.308 Win',    category: 'heavy',        rpm: '550',      rpmNum: 550,  baseDamage: 250 },

  // ── Assault Rifles (5.56 / 5.45 / 7.62x39 / 9x39) ──
  { id: 27, name: 'AEK-971',          caliber: '5.45x39',    category: 'intermediate', rpm: '900',      rpmNum: 900,  baseDamage: 130 },
  { id: 10, name: 'AR416A5',          caliber: '5.56x45',    category: 'intermediate', rpm: '850',      rpmNum: 850,  baseDamage: 130 },
  { id: 30, name: 'M16A4',            caliber: '5.56x45',    category: 'intermediate', rpm: '800',      rpmNum: 800,  baseDamage: 130 },
  { id: 13, name: 'M4A1',             caliber: '5.56x45',    category: 'intermediate', rpm: '750',      rpmNum: 750,  baseDamage: 130 },
  { id: 14, name: 'AK-12',            caliber: '5.45x39',    category: 'intermediate', rpm: '700',      rpmNum: 700,  baseDamage: 130 },
  { id: 28, name: 'AKS-74U',          caliber: '5.45x39',    category: 'intermediate', rpm: '700',      rpmNum: 700,  baseDamage: 130 },
  { id: 31, name: 'TKB-0146',         caliber: '5.45x39',    category: 'intermediate', rpm: '700',      rpmNum: 700,  baseDamage: 130 },
  { id: 15, name: 'STG77 A1',         caliber: '5.56x45',    category: 'intermediate', rpm: '650',      rpmNum: 650,  baseDamage: 130 },
  { id: 29, name: 'AK-15SK',          caliber: '7.62x39',    category: 'intermediate', rpm: '650',      rpmNum: 650,  baseDamage: 155 },
  { id: 17, name: 'SCAR-L',           caliber: '5.56x45',    category: 'intermediate', rpm: '620',      rpmNum: 620,  baseDamage: 130 },
  { id: 6,  name: 'AKM',              caliber: '7.62x39',    category: 'intermediate', rpm: '600',      rpmNum: 600,  baseDamage: 155 },
  { id: 7,  name: 'AK-103',           caliber: '7.62x39',    category: 'intermediate', rpm: '600',      rpmNum: 600,  baseDamage: 155 },
  { id: 18, name: 'AK-74M',           caliber: '5.45x39',    category: 'intermediate', rpm: '600',      rpmNum: 600,  baseDamage: 130 },
  { id: 5,  name: 'AN-94 Abakan',     caliber: '5.45x39',    category: 'intermediate', rpm: '1800/600', rpmNum: 600,  baseDamage: 130 },
  { id: 21, name: 'TKB-022P',         caliber: '5.45x39',    category: 'intermediate', rpm: '560',      rpmNum: 560,  baseDamage: 130 },
  { id: 11, name: 'AS Val',           caliber: '9x39',       category: 'intermediate', rpm: '840',      rpmNum: 840,  baseDamage: 140 },
  { id: 32, name: 'VSS Vintorez',     caliber: '9x39',       category: 'intermediate', rpm: '900',      rpmNum: 900,  baseDamage: 140 },

  // ── SMGs & Machine Pistols ──
  { id: 8,  name: 'MAC-11',           caliber: '9x19',       category: 'smg',          rpm: '1200',     rpmNum: 1200, baseDamage: 85 },
  { id: 9,  name: 'XV ACP',           caliber: '.45 ACP',    category: 'smg',          rpm: '1200',     rpmNum: 1200, baseDamage: 95 },
  { id: 12, name: 'Scorpion EVO 3',   caliber: '9x19',       category: 'smg',          rpm: '1080',     rpmNum: 1080, baseDamage: 85 },
  { id: 20, name: 'PP-91 Kedr',       caliber: '9x18',       category: 'smg',          rpm: '960',      rpmNum: 960,  baseDamage: 80 },
  { id: 35, name: 'PPSh-41',          caliber: '7.62x25',    category: 'smg',          rpm: '900',      rpmNum: 900,  baseDamage: 75 },
  { id: 19, name: 'MP5',              caliber: '9x19',       category: 'smg',          rpm: '800',      rpmNum: 800,  baseDamage: 85 },
  { id: 25, name: 'Stechkin APS',     caliber: '9x18',       category: 'smg',          rpm: '720',      rpmNum: 720,  baseDamage: 80 },
  { id: 34, name: 'M1928A1',          caliber: '.45 ACP',    category: 'smg',          rpm: '700',      rpmNum: 700,  baseDamage: 95 },
  { id: 22, name: 'PP-19-01',         caliber: '9x19',       category: 'smg',          rpm: '700',      rpmNum: 700,  baseDamage: 85 },
  { id: 36, name: 'PPK-20',           caliber: '9x19',       category: 'smg',          rpm: '700',      rpmNum: 700,  baseDamage: 85 },
  { id: 37, name: 'Gepard',           caliber: '9x18',       category: 'smg',          rpm: '700',      rpmNum: 700,  baseDamage: 80 },
  { id: 23, name: 'PP-2000',          caliber: '9x19',       category: 'smg',          rpm: '680',      rpmNum: 680,  baseDamage: 85 },
  { id: 26, name: 'PM-63',            caliber: '9x18',       category: 'smg',          rpm: '650',      rpmNum: 650,  baseDamage: 80 },
  { id: 24, name: 'UMP45',            caliber: '.45 ACP',    category: 'smg',          rpm: '600',      rpmNum: 600,  baseDamage: 95 },
  { id: 33, name: 'MP-40',            caliber: '9x19',       category: 'smg',          rpm: '500',      rpmNum: 500,  baseDamage: 85 },

  // ── Machine Guns (LMGs) ──
  { id: 43, name: 'EV-MG',            caliber: '5.56x45',    category: 'lmg',          rpm: '850',      rpmNum: 850,  baseDamage: 130 },
  { id: 42, name: 'M249 Para',        caliber: '5.56x45',    category: 'lmg',          rpm: '800',      rpmNum: 800,  baseDamage: 130 },
  { id: 39, name: 'RPL-20',           caliber: '5.45x39',    category: 'lmg',          rpm: '700',      rpmNum: 700,  baseDamage: 130 },
  { id: 38, name: 'RPD',              caliber: '7.62x39',    category: 'lmg',          rpm: '650',      rpmNum: 650,  baseDamage: 155 },
  { id: 40, name: 'PKM',              caliber: '7.62x54R',   category: 'lmg',          rpm: '650',      rpmNum: 650,  baseDamage: 260 },
  { id: 16, name: 'RPK-74',           caliber: '5.45x39',    category: 'lmg',          rpm: '630',      rpmNum: 630,  baseDamage: 130 },
  { id: 41, name: 'AEK-999',          caliber: '7.62x54R',   category: 'lmg',          rpm: '600',      rpmNum: 600,  baseDamage: 260 },

  // ── Semi-Auto Rifles (DMRs) ──
  { id: 51, name: 'SOK-94 Vepr',      caliber: '7.62x39',    category: 'dmr',          rpm: '150',      rpmNum: 150,  baseDamage: 155 },
  { id: 50, name: 'SKS Hunting',      caliber: '7.62x39',    category: 'dmr',          rpm: '140',      rpmNum: 140,  baseDamage: 155 },
  { id: 55, name: 'M39 EMR',          caliber: '.308 Win',   category: 'dmr',          rpm: '130',      rpmNum: 130,  baseDamage: 250 },
  { id: 49, name: 'SKS Carbine',      caliber: '7.62x39',    category: 'dmr',          rpm: '120',      rpmNum: 120,  baseDamage: 155 },
  { id: 52, name: 'SVD',              caliber: '7.62x54R',   category: 'dmr',          rpm: '120',      rpmNum: 120,  baseDamage: 260 },
  { id: 53, name: 'SVDM',             caliber: '7.62x54R',   category: 'dmr',          rpm: '120',      rpmNum: 120,  baseDamage: 260 },
  { id: 54, name: 'M110A1',           caliber: '.308 Win',   category: 'dmr',          rpm: '120',      rpmNum: 120,  baseDamage: 250 },
  { id: 56, name: 'M82A1',            caliber: '12.7x108',   category: 'dmr',          rpm: '40',       rpmNum: 40,   baseDamage: 450 },

  // ── Bolt-Action Rifles ──
  { id: 46, name: 'M24',              caliber: '.308 Win',   category: 'bolt',         rpm: '45',       rpmNum: 45,   baseDamage: 250 },
  { id: 47, name: 'SV-98',            caliber: '7.62x54R',   category: 'bolt',         rpm: '45',       rpmNum: 45,   baseDamage: 260 },
  { id: 44, name: 'Mosin Carbine',    caliber: '7.62x54R',   category: 'bolt',         rpm: '45',       rpmNum: 45,   baseDamage: 260 },
  { id: 45, name: 'Mosin Sniper',     caliber: '7.62x54R',   category: 'bolt',         rpm: '40',       rpmNum: 40,   baseDamage: 260 },
  { id: 48, name: 'VSSK Vykhlop',     caliber: '12.7x55',    category: 'bolt',         rpm: '35',       rpmNum: 35,   baseDamage: 290 },

  // ── Shotguns (damage = total per shell at CQB range) ──
  { id: 65, name: 'AA-12',            caliber: '12 Gauge',   category: 'shotgun',      rpm: '300',      rpmNum: 300,  baseDamage: 350 },
  { id: 64, name: 'Origin-12',        caliber: '12 Gauge',   category: 'shotgun',      rpm: '200',      rpmNum: 200,  baseDamage: 350 },
  { id: 63, name: 'DP-12',            caliber: '12 Gauge',   category: 'shotgun',      rpm: '120',      rpmNum: 120,  baseDamage: 350 },
  { id: 61, name: 'SPAS-12',          caliber: '12 Gauge',   category: 'shotgun',      rpm: '100',      rpmNum: 100,  baseDamage: 350 },
  { id: 58, name: 'M12 Trench',       caliber: '12 Gauge',   category: 'shotgun',      rpm: '70',       rpmNum: 70,   baseDamage: 350 },
  { id: 59, name: 'MB590',            caliber: '12 Gauge',   category: 'shotgun',      rpm: '70',       rpmNum: 70,   baseDamage: 350 },
  { id: 62, name: 'KS-23',            caliber: '23x75mm',    category: 'shotgun',      rpm: '50',       rpmNum: 50,   baseDamage: 500 },
  { id: 60, name: 'MTs 21-12',        caliber: '12 Gauge',   category: 'shotgun',      rpm: '40',       rpmNum: 40,   baseDamage: 350 },
  { id: 57, name: 'TOZ-B',            caliber: '12 Gauge',   category: 'shotgun',      rpm: '25',       rpmNum: 25,   baseDamage: 350 },
];

// --- Drop-off curves (experimental range simulator) ---
interface DropOffPoint { distance: number; retention: number }
type CaliberGroup = string;

const DROP_OFF_CURVES: Record<CaliberGroup, DropOffPoint[]> = {
  '12.7x108':    [{ distance: 15, retention: 1.0 }, { distance: 35, retention: 1.0 }, { distance: 60, retention: 0.98 }, { distance: 100, retention: 0.95 }],
  '.308_762x54':  [{ distance: 15, retention: 1.0 }, { distance: 35, retention: 0.99 }, { distance: 60, retention: 0.96 }, { distance: 100, retention: 0.93 }],
  '12.7x55':     [{ distance: 15, retention: 1.0 }, { distance: 35, retention: 0.92 }, { distance: 60, retention: 0.82 }, { distance: 100, retention: 0.70 }],
  '7.62x39':     [{ distance: 15, retention: 1.0 }, { distance: 35, retention: 0.95 }, { distance: 60, retention: 0.88 }, { distance: 100, retention: 0.80 }],
  '5.56_5.45':   [{ distance: 15, retention: 1.0 }, { distance: 35, retention: 0.94 }, { distance: 60, retention: 0.86 }, { distance: 100, retention: 0.78 }],
  '9x39':        [{ distance: 15, retention: 1.0 }, { distance: 35, retention: 0.90 }, { distance: 60, retention: 0.78 }, { distance: 100, retention: 0.65 }],
  'pistol':      [{ distance: 15, retention: 1.0 }, { distance: 35, retention: 0.80 }, { distance: 60, retention: 0.66 }, { distance: 100, retention: 0.48 }],
  '12_gauge':    [{ distance: 15, retention: 1.0 }, { distance: 35, retention: 0.55 }, { distance: 60, retention: 0.30 }, { distance: 100, retention: 0.12 }],
  '23x75mm':     [{ distance: 15, retention: 1.0 }, { distance: 35, retention: 0.50 }, { distance: 60, retention: 0.25 }, { distance: 100, retention: 0.10 }],
};

function caliberToDropOffGroup(caliber: string): CaliberGroup {
  const c = caliber.toLowerCase();
  if (c === '12.7x108') return '12.7x108';
  if (c === '.308 win' || c === '7.62x54r') return '.308_762x54';
  if (c === '12.7x55') return '12.7x55';
  if (c === '7.62x39') return '7.62x39';
  if (c === '5.56x45' || c === '5.45x39') return '5.56_5.45';
  if (c === '9x39') return '9x39';
  if (c === '12 gauge') return '12_gauge';
  if (c === '23x75mm') return '23x75mm';
  return 'pistol';
}

function interpolateRetention(curve: DropOffPoint[], distance: number): number {
  if (distance <= curve[0].distance) return curve[0].retention;
  if (distance >= curve[curve.length - 1].distance) return curve[curve.length - 1].retention;
  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i], b = curve[i + 1];
    if (distance >= a.distance && distance <= b.distance) {
      const t = (distance - a.distance) / (b.distance - a.distance);
      return a.retention + t * (b.retention - a.retention);
    }
  }
  return curve[curve.length - 1].retention;
}

export function getDamageRetention(caliber: string, distanceM: number): number {
  const group = caliberToDropOffGroup(caliber);
  return interpolateRetention(DROP_OFF_CURVES[group], distanceM);
}

export const DROP_OFF_GROUP_LABELS: Record<CaliberGroup, string> = {
  '12.7x108':   '12.7x108 (Anti-Materiel)',
  '.308_762x54': '.308 Win / 7.62x51 & 7.62x54R',
  '12.7x55':    '12.7x55',
  '7.62x39':    '7.62x39',
  '5.56_5.45':  '5.56x45 & 5.45x39',
  '9x39':       '9x39',
  'pistol':     '9x19 / .45 ACP / 9x18 / 7.62x25',
  '12_gauge':   '12 Gauge (Buckshot)',
  '23x75mm':    '23x75mm (KS-23)',
};

export function getDropOffCurveForCaliber(caliber: string): { group: CaliberGroup; curve: DropOffPoint[] } {
  const group = caliberToDropOffGroup(caliber);
  return { group, curve: DROP_OFF_CURVES[group] };
}

export function getAllDropOffCurves(): { group: CaliberGroup; label: string; curve: DropOffPoint[] }[] {
  return Object.entries(DROP_OFF_CURVES).map(([group, curve]) => ({
    group,
    label: DROP_OFF_GROUP_LABELS[group] ?? group,
    curve,
  }));
}

// --- Core TTK calculations ---

// Torso TTK: weapon vs torso armor plate protecting 220 HP vital pool
export function calculateTTK(
  weapon: WeaponData,
  material: ArmorMaterial,
  size: PlateSize,
  damageMult: number = 1.0,
): TTKResult {
  const effectiveDamage = weapon.baseDamage * damageMult;

  if (material === 'none') {
    const btk = Math.ceil(TORSO_HP / effectiveDamage);
    const ttk = btk <= 1 ? 0 : Math.round(((btk - 1) / weapon.rpmNum) * 60000);
    return { ttk, btk };
  }

  const armorDef = ARMOR_MATERIALS.find(a => a.id === material)!;
  const spec = armorDef.sizes[size];
  const maxMitigation = spec.mitigation / 100;
  const armorHP = spec.hp;

  let health = TORSO_HP;
  let currentArmorHP = armorHP;
  let shots = 0;

  while (health > 0 && shots < 999) {
    shots++;
    const wearRatio = currentArmorHP > 0 ? currentArmorHP / armorHP : 0;
    const currentMitigation = maxMitigation * wearRatio;
    const mitigatedDamage = effectiveDamage * (1 - currentMitigation);
    health -= mitigatedDamage;
    if (currentArmorHP > 0) {
      currentArmorHP = Math.max(0, currentArmorHP - effectiveDamage);
    }
  }

  const ttk = shots <= 1 ? 0 : Math.round(((shots - 1) / weapon.rpmNum) * 60000);
  return { ttk, btk: shots };
}

export function getTTK(
  weapon: WeaponData,
  material: ArmorMaterial,
  size: PlateSize,
  damageMult: number = 1.0,
): TTKResult {
  return calculateTTK(weapon, material, size, damageMult);
}

// --- Limb TTK with 1.0x overflow to torso ---
// When targeting a limb (arm/leg), damage first goes through optional limb armor,
// then into limb HP. Once limb reaches 0, 100% of all subsequent damage overflows
// directly into the 220 HP torso vital pool.
export function calculateLimbTTK(
  weapon: WeaponData,
  zone: BodyZone,
  limbArmor: ArmorMaterial,
  limbArmorSize: PlateSize,
  damageMult: number = 1.0,
): DuelTTKResult {
  const effectiveDamage = weapon.baseDamage * damageMult;

  if (zone === 'torso') {
    const result = calculateTTK(weapon, limbArmor, limbArmorSize, damageMult);
    return { ...result, log: [] };
  }

  const limbMaxHP = BODY_ZONE_DATA[zone].hp;
  let limbHP = limbMaxHP;
  let torsoHP = TORSO_HP;
  let currentArmorHP = 0;
  let armorMaxHP = 0;
  let maxMitigation = 0;

  if (limbArmor !== 'none') {
    const armorDef = ARMOR_MATERIALS.find(a => a.id === limbArmor)!;
    const spec = armorDef.sizes[limbArmorSize];
    maxMitigation = spec.mitigation / 100;
    armorMaxHP = spec.hp;
    currentArmorHP = armorMaxHP;
  }

  let shots = 0;
  const log: CombatLogEntry[] = [];
  const limbKnockedOutAlready = false;

  while (torsoHP > 0 && shots < 999) {
    shots++;
    let damageThisShot = effectiveDamage;
    const prevLimbHP = limbHP;
    const limbWasKnockedOut = limbHP <= 0;

    // Apply limb armor mitigation (if armor remains and limb still alive)
    if (currentArmorHP > 0 && limbHP > 0) {
      const wearRatio = currentArmorHP / armorMaxHP;
      const currentMitigation = maxMitigation * wearRatio;
      damageThisShot = effectiveDamage * (1 - currentMitigation);
      currentArmorHP = Math.max(0, currentArmorHP - effectiveDamage);
    }

    let damageToLimb = 0;
    let overflowToTorso = 0;
    let limbKnockedOutThisShot = false;

    if (limbHP > 0) {
      if (damageThisShot >= limbHP) {
        damageToLimb = limbHP;
        overflowToTorso = damageThisShot - limbHP;
        limbHP = 0;
        torsoHP -= overflowToTorso;
        limbKnockedOutThisShot = true;
      } else {
        damageToLimb = damageThisShot;
        limbHP -= damageThisShot;
      }
    } else {
      overflowToTorso = damageThisShot;
      torsoHP -= damageThisShot;
    }

    log.push({
      shot: shots,
      limbHP: Math.max(0, limbHP),
      torsoHP: Math.max(0, torsoHP),
      armorHP: Math.max(0, currentArmorHP),
      damageToLimb: Math.round(damageToLimb * 10) / 10,
      overflowToTorso: Math.round(overflowToTorso * 10) / 10,
      limbKnockedOut: limbKnockedOutThisShot || limbWasKnockedOut,
    });
  }

  const ttk = shots <= 1 ? 0 : Math.round(((shots - 1) / weapon.rpmNum) * 60000);
  return { ttk, btk: shots, log };
}

// --- Helmet definitions ---
// Helmets protect the head (HEAD_HP pool). They work like plates: a max mitigation %
// that degrades as the helmet durability drops, using the same wearRatio model.
// TFMK-I stats confirmed from wiki.gg; remaining values extrapolated from rarity tiers.

export const HEAD_HP = 110;

export type HelmetRarity = 'Common' | 'Uncommon' | 'Rare';

export interface HelmetData {
  id: string;
  name: string;
  rarity: HelmetRarity;
  durability: number;
  projectile: number;
}

export const HELMETS: HelmetData[] = [
  { id: 'none',             name: 'No Helmet',                rarity: 'Common',   durability: 0,   projectile: 0 },
  { id: 'winter-hat',       name: 'Winter Hat',               rarity: 'Common',   durability: 5,   projectile: 0 },
  { id: 'tactical-headset', name: 'Tactical Headset',         rarity: 'Common',   durability: 5,   projectile: 0 },
  { id: 'rusty-ssh40',      name: 'Rusty SSh-40',             rarity: 'Common',   durability: 30,  projectile: 10 },
  { id: 'tank-crew',        name: 'Tank Crew Helmet',         rarity: 'Common',   durability: 35,  projectile: 12 },
  { id: 'stahlhelm',        name: 'Stahlhelm',                rarity: 'Common',   durability: 40,  projectile: 15 },
  { id: 'm1',               name: 'M1 Helmet',                rarity: 'Common',   durability: 50,  projectile: 18 },
  { id: 'kvr',              name: 'KVR Helmet',               rarity: 'Common',   durability: 60,  projectile: 22 },
  { id: 'pasgt',            name: 'PASGT Helmet',             rarity: 'Common',   durability: 70,  projectile: 25 },
  { id: 'tactical-pasgt',   name: 'Tactical PASGT Helmet',    rarity: 'Uncommon', durability: 90,  projectile: 30 },
  { id: 'a3',               name: 'A3 Helmet',                rarity: 'Common',   durability: 105, projectile: 35 },
  { id: 'trm73',            name: 'Tactical Helmet TRM-73',   rarity: 'Uncommon', durability: 125, projectile: 40 },
  { id: 'sf',               name: 'SF Helmet',                rarity: 'Uncommon', durability: 145, projectile: 45 },
  { id: 'k6',               name: 'K6 Helmet',                rarity: 'Rare',     durability: 175, projectile: 50 },
  { id: 'edh-gen-v',        name: 'Enhanced Helmet EDH-Gen V',rarity: 'Rare',     durability: 205, projectile: 60 },
  { id: 'k6-3',             name: 'K6-3 Helmet',              rarity: 'Rare',     durability: 240, projectile: 65 },
  { id: 'ihps',             name: 'IHPS Helmet',              rarity: 'Rare',     durability: 265, projectile: 70 },
  { id: 'tfmk-i',           name: 'Ballistic Helmet TFMK-I',  rarity: 'Rare',     durability: 295, projectile: 80 },
];

export function calculateHeadshotTTK(
  weapon: WeaponData,
  helmet: HelmetData,
  damageMult: number = 1.0,
): TTKResult {
  const effectiveDamage = weapon.baseDamage * damageMult;

  if (helmet.durability <= 0 || helmet.projectile <= 0) {
    const btk = Math.ceil(HEAD_HP / effectiveDamage);
    const ttk = btk <= 1 ? 0 : Math.round(((btk - 1) / weapon.rpmNum) * 60000);
    return { ttk, btk };
  }

  const maxMitigation = helmet.projectile / 100;
  const helmetHP = helmet.durability;

  let headHP = HEAD_HP;
  let currentHelmetHP = helmetHP;
  let shots = 0;

  while (headHP > 0 && shots < 999) {
    shots++;
    const wearRatio = currentHelmetHP > 0 ? currentHelmetHP / helmetHP : 0;
    const currentMitigation = maxMitigation * wearRatio;
    const mitigatedDamage = effectiveDamage * (1 - currentMitigation);
    headHP -= mitigatedDamage;
    if (currentHelmetHP > 0) {
      currentHelmetHP = Math.max(0, currentHelmetHP - effectiveDamage);
    }
  }

  const ttk = shots <= 1 ? 0 : Math.round(((shots - 1) / weapon.rpmNum) * 60000);
  return { ttk, btk: shots };
}

export function getArmorSpec(material: ArmorMaterial, size: PlateSize): ArmorSpec | null {
  if (material === 'none') return null;
  const def = ARMOR_MATERIALS.find(a => a.id === material)!;
  return def.sizes[size];
}
