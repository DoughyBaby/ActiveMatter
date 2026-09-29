import { useState, useMemo } from 'react';
import {
  Swords, ChevronDown, Check, Zap, Target, Shield, ShieldOff,
  Trophy, ArrowRight, Minus, Gauge, Shirt, type LucideIcon,
} from 'lucide-react';
import {
  WEAPONS, ARMOR_MATERIALS, calculateLimbTTK, calculateTTK, getArmorSpec,
  BODY_ZONE_DATA, TORSO_HP, BODY_SLEEVES, SLEEVE_CATEGORIES, formatSleeveLayout,
  type WeaponData, type ArmorMaterial, type BodyZone, type DuelTTKResult, type CombatLogEntry,
  type BodySleeve, type SleeveSlot,
} from '@/data/weaponData';

/* ─── Types ─────────────────────────────────────────── */

interface PlayerConfig {
  weaponId: number;
  sleeveId: string;
  torsoArmor: ArmorMaterial;
  handsArmor: ArmorMaterial;
  legsArmor: ArmorMaterial;
  targetZone: BodyZone;
}

/* ─── Constants ─────────────────────────────────────── */

const ORANGE = '#ff6b35';
const CYAN = '#3b9eff';

const RARITY_COLORS: Record<BodySleeve['rarity'], string> = {
  Uncommon: '#4ade80',
  Rare: '#60a5fa',
  Epic: '#c084fc',
};

const MATERIAL_OPTIONS: { id: ArmorMaterial; label: string }[] = [
  { id: 'none',     label: 'No Plates' },
  { id: 'rusty',    label: 'Rusty Steel' },
  { id: 'uhmwpe',   label: 'UHMWPE' },
  { id: 'steel',    label: 'Military Steel' },
  { id: 'titanium', label: 'Titanium' },
  { id: 'ceramic',  label: 'Ceramic' },
];

const MATERIAL_OPTIONS_NO_NONE = MATERIAL_OPTIONS.filter(m => m.id !== 'none');

const ZONE_OPTIONS: { id: BodyZone; label: string }[] = [
  { id: 'torso', label: 'Torso' },
  { id: 'legs',  label: 'Legs' },
  { id: 'arms',  label: 'Arms' },
];

const ARMOR_ICONS: Partial<Record<ArmorMaterial, LucideIcon>> = {
  none: ShieldOff, rusty: Shield, uhmwpe: Shield, steel: Shield, titanium: Shield, ceramic: Shield,
};

const ZONE_ICONS: Partial<Record<BodyZone, LucideIcon>> = {
  torso: Target, legs: Target, arms: Target,
};

/* ─── Sub-Components ────────────────────────────────── */

function WeaponSelector({
  value, onChange, label, accentColor,
}: {
  value: number;
  onChange: (id: number) => void;
  label: string;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = WEAPONS.find(w => w.id === value)!;

  return (
    <div className="flex-1 min-w-0">
      <label className="block text-[10px] uppercase tracking-wider text-[#5c6570] mb-1.5 font-mono-tactical">{label}</label>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 bg-[#0d0f12] border border-[#282f3a] hover:border-[#3a4350] rounded-md px-3 py-2.5 text-sm transition-colors text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Zap className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
            <div className="min-w-0">
              <div className="font-semibold text-[#e4e7eb] truncate">{selected.name}</div>
              <div className="text-[10px] text-[#5c6570] font-mono-tactical">{selected.caliber} · {selected.rpm} RPM · {selected.baseDamage} DMG</div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#5c6570] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto bg-[#161a20] border border-[#282f3a] rounded-md shadow-xl animate-fade-in">
              {WEAPONS.map(w => (
                <button
                  key={w.id}
                  onClick={() => { onChange(w.id); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-[#1c2128] transition-colors text-left ${w.id === value ? 'bg-[#1c2128]' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="min-w-0">
                      <div className="font-medium text-[#e4e7eb] truncate">{w.name}</div>
                      <div className="text-[10px] text-[#5c6570] font-mono-tactical">{w.caliber} · {w.rpm} RPM · {w.baseDamage} DMG</div>
                    </div>
                  </div>
                  {w.id === value && <Check className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SleeveSelector({
  value, onChange, accentColor,
}: {
  value: string;
  onChange: (id: string) => void;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [filterCat, setFilterCat] = useState<BodySleeve['category'] | 'all'>('all');
  const selected = BODY_SLEEVES.find(s => s.id === value)!;

  const filtered = filterCat === 'all' ? BODY_SLEEVES : BODY_SLEEVES.filter(s => s.category === filterCat);

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-[#5c6570] mb-1.5 font-mono-tactical">Body Sleeve</label>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 bg-[#0d0f12] border border-[#282f3a] hover:border-[#3a4350] rounded-md px-3 py-2.5 text-sm transition-colors text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Shirt className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
            <div className="min-w-0">
              <div className="font-semibold text-[#e4e7eb] truncate">
                {selected.name}
                <span className="ml-1.5 text-[10px] font-normal" style={{ color: RARITY_COLORS[selected.rarity] }}>
                  {selected.rarity}
                </span>
              </div>
              <div className="text-[10px] text-[#5c6570] font-mono-tactical">
                {formatSleeveLayout(selected)} · {selected.volume} vol
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#5c6570] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 mt-1 w-full max-h-80 overflow-y-auto bg-[#161a20] border border-[#282f3a] rounded-md shadow-xl animate-fade-in">
              {/* Category filter pills */}
              <div className="sticky top-0 bg-[#161a20] border-b border-[#282f3a] p-2 flex flex-wrap gap-1">
                <button
                  onClick={() => setFilterCat('all')}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all border ${
                    filterCat === 'all'
                      ? 'text-white border-[#3a4350] bg-[#282f3a]'
                      : 'text-[#5c6570] border-transparent hover:text-[#8b939e]'
                  }`}
                >
                  All
                </button>
                {SLEEVE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCat(cat.id)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-all border ${
                      filterCat === cat.id
                        ? 'text-white border-[#3a4350] bg-[#282f3a]'
                        : 'text-[#5c6570] border-transparent hover:text-[#8b939e]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {filtered.map(s => (
                <button
                  key={s.id}
                  onClick={() => { onChange(s.id); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-[#1c2128] transition-colors text-left ${s.id === value ? 'bg-[#1c2128]' : ''}`}
                >
                  <div className="min-w-0">
                    <div className="font-medium text-[#e4e7eb] truncate">
                      {s.name}
                      <span className="ml-1.5 text-[10px] font-normal" style={{ color: RARITY_COLORS[s.rarity] }}>
                        {s.rarity}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#5c6570] font-mono-tactical">
                      {formatSleeveLayout(s)} · {s.volume} vol · {s.operative}
                    </div>
                  </div>
                  {s.id === value && <Check className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-xs text-[#5c6570] text-center">No sleeves in this category</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PillGroup<T extends string>({
  options, value, onChange, label, accentColor, icons,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  accentColor: string;
  icons?: Partial<Record<T, LucideIcon>>;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-[#5c6570] mb-1.5 font-mono-tactical">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const Icon = icons?.[opt.id];
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all border ${
                active
                  ? 'text-white'
                  : 'text-[#8b939e] border-[#282f3a] bg-[#0d0f12] hover:border-[#3a4350] hover:text-[#e4e7eb]'
              }`}
              style={active ? { borderColor: accentColor, backgroundColor: `${accentColor}20` } : {}}
            >
              {Icon && (() => { const I = Icon as LucideIcon; return <I className="w-3.5 h-3.5" style={active ? { color: accentColor } : undefined} />; })()}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SlotBadge({ slot, label }: { slot: SleeveSlot; label: string }) {
  if (slot === 'none') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161a20] border border-[#282f3a]">
        <span className="text-[10px] font-mono-tactical text-[#5c6570]">{label}</span>
        <span className="text-[10px] font-bold text-[#5c6570]">---</span>
      </div>
    );
  }
  const sizeColor = slot === 'XL' ? '#c084fc' : slot === 'L' ? '#60a5fa' : '#4ade80';
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161a20] border border-[#282f3a]">
      <span className="text-[10px] font-mono-tactical text-[#5c6570]">{label}</span>
      <span className="text-[10px] font-bold" style={{ color: sizeColor }}>{slot}</span>
    </div>
  );
}

/* ─── Combat Log Table ──────────────────────────────── */

function CombatLogTable({
  log, zone, accentColor, label,
}: {
  log: CombatLogEntry[];
  zone: BodyZone;
  accentColor: string;
  label: string;
}) {
  if (!log.length || zone === 'torso') return null;

  const zoneName = zone === 'legs' ? 'Leg' : 'Arm';
  const firstKOIndex = log.findIndex(e => e.limbKnockedOut);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="text-[10px] uppercase tracking-wider text-[#5c6570] font-mono-tactical">{label}</span>
      </div>
      <div className="max-h-52 overflow-y-auto rounded border border-[#282f3a] bg-[#0d0f12]">
        <table className="w-full text-[11px] font-mono-tactical">
          <thead className="sticky top-0 bg-[#161a20]">
            <tr className="text-[#5c6570] uppercase text-[9px] tracking-wider">
              <th className="px-2 py-1.5 text-left">Shot#</th>
              <th className="px-2 py-1.5 text-right">{zoneName} HP</th>
              <th className="px-2 py-1.5 text-right">Torso HP</th>
              <th className="px-2 py-1.5 text-right">Armor HP</th>
              <th className="px-2 py-1.5 text-right">Damage</th>
              <th className="px-2 py-1.5 text-right">Overflow</th>
              <th className="px-2 py-1.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {log.map((entry, i) => {
              const isKOShot = i === firstKOIndex;
              const isPostKO = entry.limbKnockedOut && i > firstKOIndex;
              const isKill = entry.torsoHP <= 0;

              return (
                <tr
                  key={entry.shot}
                  className={`border-t border-[#282f3a]/50 transition-colors ${
                    isKill ? 'bg-red-900/10' : isKOShot ? 'bg-yellow-900/10' : isPostKO ? 'bg-[#161a20]/50' : 'hover:bg-[#161a20]/30'
                  }`}
                >
                  <td className="px-2 py-1 text-left text-[#e4e7eb]">{entry.shot}</td>
                  <td className="px-2 py-1 text-right" style={{ color: entry.limbHP > 0 ? '#e4e7eb' : '#ef4444' }}>
                    {Math.round(entry.limbHP)}
                  </td>
                  <td className="px-2 py-1 text-right" style={{ color: entry.torsoHP > 0 ? '#e4e7eb' : '#ef4444' }}>
                    {Math.round(entry.torsoHP)}
                  </td>
                  <td className="px-2 py-1 text-right text-[#8b939e]">
                    {Math.round(entry.armorHP)}
                  </td>
                  <td className="px-2 py-1 text-right" style={{ color: accentColor }}>
                    {entry.damageToLimb > 0 ? entry.damageToLimb.toFixed(1) : '—'}
                  </td>
                  <td className="px-2 py-1 text-right" style={{ color: entry.overflowToTorso > 0 ? '#ef4444' : '#5c6570' }}>
                    {entry.overflowToTorso > 0 ? entry.overflowToTorso.toFixed(1) : '—'}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {isKill ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-900/30 text-red-400 uppercase">
                        KIA
                      </span>
                    ) : isKOShot ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-900/30 text-yellow-400 uppercase">
                        LIMB KO
                      </span>
                    ) : isPostKO ? (
                      <span className="text-[9px] text-[#8b939e]">100% overflow to Torso</span>
                    ) : (
                      <span className="text-[9px] text-[#5c6570]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Compute helper ────────────────────────────────── */

function computeDuelResult(
  attackerWeapon: WeaponData,
  defenderSleeve: BodySleeve,
  defenderConfig: PlayerConfig,
  targetZone: BodyZone,
): DuelTTKResult {
  if (targetZone === 'torso') {
    if (defenderSleeve.torso === 'none') {
      const { ttk, btk } = calculateTTK(attackerWeapon, 'none', 'S');
      return { ttk, btk, log: [] };
    }
    const { ttk, btk } = calculateTTK(attackerWeapon, defenderConfig.torsoArmor, defenderSleeve.torso);
    return { ttk, btk, log: [] };
  }

  // Limb targeting: 'arms' uses hands slot, 'legs' uses legs slot
  const limbSlot = targetZone === 'arms' ? defenderSleeve.hands : defenderSleeve.legs;
  const limbArmorMaterial = limbSlot === 'none' ? 'none' as ArmorMaterial
    : (targetZone === 'arms' ? defenderConfig.handsArmor : defenderConfig.legsArmor);
  const limbArmorSize = limbSlot === 'none' ? 'S' as const : limbSlot;

  return calculateLimbTTK(attackerWeapon, targetZone, limbArmorMaterial, limbArmorSize);
}

/* ─── Player Config Panel ───────────────────────────── */

function PlayerPanel({
  config, onChange, label, tag, accentColor,
}: {
  config: PlayerConfig;
  onChange: (c: PlayerConfig) => void;
  label: string;
  tag: string;
  accentColor: string;
}) {
  const sleeve = BODY_SLEEVES.find(s => s.id === config.sleeveId)!;
  const torsoSpec = sleeve.torso !== 'none' && config.torsoArmor !== 'none'
    ? getArmorSpec(config.torsoArmor, sleeve.torso)
    : null;
  const handsSpec = sleeve.hands !== 'none' && config.handsArmor !== 'none'
    ? getArmorSpec(config.handsArmor, sleeve.hands)
    : null;
  const legsSpec = sleeve.legs !== 'none' && config.legsArmor !== 'none'
    ? getArmorSpec(config.legsArmor, sleeve.legs)
    : null;

  return (
    <div className="bg-[#0d0f12] border rounded-lg p-4" style={{ borderColor: `${accentColor}40` }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {tag}
        </div>
        <span className="text-sm font-semibold text-[#e4e7eb]">{label}</span>
        {torsoSpec && (
          <span className="ml-auto text-[10px] font-mono-tactical text-[#5c6570]">
            Torso: {torsoSpec.mitigation}% MIT / {torsoSpec.hp} HP
          </span>
        )}
      </div>

      <div className="space-y-3.5">
        {/* Weapon selector */}
        <WeaponSelector
          value={config.weaponId}
          onChange={(id) => onChange({ ...config, weaponId: id })}
          label="Weapon"
          accentColor={accentColor}
        />

        {/* Body Sleeve selector */}
        <SleeveSelector
          value={config.sleeveId}
          onChange={(id) => onChange({ ...config, sleeveId: id })}
          accentColor={accentColor}
        />

        {/* Plate layout summary */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#5c6570] mb-1.5 font-mono-tactical">
            Plate Layout ({sleeve.name})
          </label>
          <div className="flex flex-wrap gap-1.5">
            <SlotBadge slot={sleeve.torso} label="Torso" />
            <SlotBadge slot={sleeve.hands} label="Hands" />
            <SlotBadge slot={sleeve.legs} label="Legs" />
          </div>
        </div>

        {/* Torso Armor Material (only if sleeve has torso slot) */}
        {sleeve.torso !== 'none' && (
          <PillGroup
            label={`Torso Armor Material (${sleeve.torso} plate)`}
            options={MATERIAL_OPTIONS}
            value={config.torsoArmor}
            onChange={(v) => onChange({ ...config, torsoArmor: v })}
            accentColor={accentColor}
            icons={ARMOR_ICONS as Partial<Record<ArmorMaterial, LucideIcon>>}
          />
        )}

        {/* Hands Armor Material (only if sleeve has hands slot) */}
        {sleeve.hands !== 'none' && (
          <div>
            <PillGroup
              label={`Hands Armor Material (${sleeve.hands} plates)`}
              options={MATERIAL_OPTIONS_NO_NONE}
              value={config.handsArmor === 'none' ? 'rusty' : config.handsArmor}
              onChange={(v) => onChange({ ...config, handsArmor: v })}
              accentColor={accentColor}
              icons={ARMOR_ICONS as Partial<Record<ArmorMaterial, LucideIcon>>}
            />
            {handsSpec && (
              <div className="mt-1 text-[10px] font-mono-tactical text-[#5c6570]">
                Hand Plate: {handsSpec.mitigation}% MIT / {handsSpec.hp} HP (Size {sleeve.hands})
              </div>
            )}
          </div>
        )}

        {/* Legs Armor Material (only if sleeve has legs slot) */}
        {sleeve.legs !== 'none' && (
          <div>
            <PillGroup
              label={`Legs Armor Material (${sleeve.legs} plates)`}
              options={MATERIAL_OPTIONS_NO_NONE}
              value={config.legsArmor === 'none' ? 'rusty' : config.legsArmor}
              onChange={(v) => onChange({ ...config, legsArmor: v })}
              accentColor={accentColor}
              icons={ARMOR_ICONS as Partial<Record<ArmorMaterial, LucideIcon>>}
            />
            {legsSpec && (
              <div className="mt-1 text-[10px] font-mono-tactical text-[#5c6570]">
                Leg Plate: {legsSpec.mitigation}% MIT / {legsSpec.hp} HP (Size {sleeve.legs})
              </div>
            )}
          </div>
        )}

        {/* Zones with no slot get a note */}
        {(sleeve.hands === 'none' || sleeve.legs === 'none') && (
          <div className="px-2.5 py-1.5 rounded bg-[#161a20] border border-[#282f3a]">
            <p className="text-[10px] text-[#8b939e] leading-relaxed">
              <span className="font-semibold text-yellow-500/80">No plate slot:</span>{' '}
              {sleeve.hands === 'none' && sleeve.legs === 'none' ? 'Hands & Legs' :
               sleeve.hands === 'none' ? 'Hands' : 'Legs'} —
              these zones take full unmitigated damage on this sleeve.
            </p>
          </div>
        )}

        {/* Target Zone */}
        <div>
          <PillGroup
            label="Target Zone"
            options={ZONE_OPTIONS}
            value={config.targetZone}
            onChange={(v) => onChange({ ...config, targetZone: v })}
            accentColor={accentColor}
            icons={ZONE_ICONS as Partial<Record<BodyZone, LucideIcon>>}
          />
          {config.targetZone !== 'torso' && (
            <div className="mt-2 px-2.5 py-1.5 rounded bg-[#161a20] border border-[#282f3a]">
              <p className="text-[10px] text-[#8b939e] leading-relaxed">
                <span className="font-semibold text-yellow-500/80">Limb Targeting:</span>{' '}
                {BODY_ZONE_DATA[config.targetZone].label}.
                100% (1.0x) damage overflow routed directly to 220 HP Torso once limb is knocked out.
                Kill threshold: <span className="text-[#e4e7eb] font-mono-tactical">
                  {BODY_ZONE_DATA[config.targetZone].hp + TORSO_HP} DMG
                </span> ({BODY_ZONE_DATA[config.targetZone].hp} + {TORSO_HP}).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────── */

export default function DuelSimulator() {
  const [playerA, setPlayerA] = useState<PlayerConfig>({
    weaponId: 10,
    sleeveId: 'beast',
    torsoArmor: 'steel',
    handsArmor: 'rusty',
    legsArmor: 'rusty',
    targetZone: 'torso',
  });

  const [playerB, setPlayerB] = useState<PlayerConfig>({
    weaponId: 18,
    sleeveId: 'rhino',
    torsoArmor: 'titanium',
    handsArmor: 'steel',
    legsArmor: 'steel',
    targetZone: 'torso',
  });

  const sleeveA = useMemo(() => BODY_SLEEVES.find(s => s.id === playerA.sleeveId)!, [playerA.sleeveId]);
  const sleeveB = useMemo(() => BODY_SLEEVES.find(s => s.id === playerB.sleeveId)!, [playerB.sleeveId]);
  const weaponA = useMemo(() => WEAPONS.find(w => w.id === playerA.weaponId)!, [playerA.weaponId]);
  const weaponB = useMemo(() => WEAPONS.find(w => w.id === playerB.weaponId)!, [playerB.weaponId]);

  // A shoots B (using A's weapon against B's armor, targeting A's chosen zone on B)
  const resultAB = useMemo(
    () => computeDuelResult(weaponA, sleeveB, playerB, playerA.targetZone),
    [weaponA, sleeveB, playerB, playerA.targetZone],
  );

  // B shoots A (using B's weapon against A's armor, targeting B's chosen zone on A)
  const resultBA = useMemo(
    () => computeDuelResult(weaponB, sleeveA, playerA, playerB.targetZone),
    [weaponB, sleeveA, playerA, playerB.targetZone],
  );

  const aWins = resultAB.ttk < resultBA.ttk;
  const tie = resultAB.ttk === resultBA.ttk;
  const gap = Math.abs(resultAB.ttk - resultBA.ttk);

  const maxTTK = Math.max(resultAB.ttk, resultBA.ttk, 1);
  const aBarPct = (resultAB.ttk / maxTTK) * 100;
  const bBarPct = (resultBA.ttk / maxTTK) * 100;

  const showCombatLog = playerA.targetZone !== 'torso' || playerB.targetZone !== 'torso';

  return (
    <section className="tactical-card accent-glow p-5 md:p-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 mb-5">
        <Swords className="w-5 h-5 text-[#ff6b35]" />
        <h2 className="text-lg font-bold tracking-tight text-[#e4e7eb]">1v1 Duel Simulator</h2>
        <span className="text-[10px] text-[#5c6570] font-mono-tactical uppercase tracking-wider ml-1">
          Sleeve-Based Loadout
        </span>
      </div>

      {/* ── Player Config Panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PlayerPanel
          config={playerA}
          onChange={setPlayerA}
          label="Player Alpha"
          tag="A"
          accentColor={ORANGE}
        />
        <PlayerPanel
          config={playerB}
          onChange={setPlayerB}
          label="Player Bravo"
          tag="B"
          accentColor={CYAN}
        />
      </div>

      {/* ── Results Section ── */}
      <div className="mt-5 bg-[#0d0f12] border border-[#282f3a] rounded-lg p-5">
        {/* Winner callout */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {tie ? (
            <div className="flex items-center gap-2 text-[#8b939e]">
              <Minus className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Dead Heat — Equal TTK</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 animate-fade-in">
              <Trophy className="w-5 h-5" style={{ color: aWins ? ORANGE : CYAN }} />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: aWins ? ORANGE : CYAN }}>
                {aWins ? 'Player Alpha Wins' : 'Player Bravo Wins'}
              </span>
              <span className="text-xs text-[#5c6570] font-mono-tactical">
                by {gap}ms
              </span>
            </div>
          )}
        </div>

        {/* TTK / BTK comparison */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* A shoots B */}
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#5c6570] mb-1 font-mono-tactical">
              A → B's {playerA.targetZone === 'torso' ? 'Torso' : BODY_ZONE_DATA[playerA.targetZone].label}
            </div>
            <div className="flex items-center justify-end gap-3 mb-2">
              <div>
                <div className="text-2xl font-bold font-mono-tactical" style={{ color: ORANGE }}>{resultAB.ttk}ms</div>
                <div className="text-[10px] text-[#5c6570] font-mono-tactical">TTK</div>
              </div>
              <div className="w-px h-10 bg-[#282f3a]" />
              <div>
                <div className="text-2xl font-bold font-mono-tactical text-[#e4e7eb]">{resultAB.btk}</div>
                <div className="text-[10px] text-[#5c6570] font-mono-tactical">BTK</div>
              </div>
            </div>
            <div className="h-2 bg-[#161a20] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${aBarPct}%`, backgroundColor: ORANGE }}
              />
            </div>
          </div>

          {/* Center VS */}
          <div className="flex flex-col items-center gap-1 px-2">
            <div className="text-xs font-bold text-[#5c6570] font-mono-tactical">VS</div>
            <Gauge className="w-5 h-5 text-[#5c6570]" />
            <div className="text-[10px] text-[#5c6570] font-mono-tactical">{'\u0394'} {gap}ms</div>
          </div>

          {/* B shoots A */}
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider text-[#5c6570] mb-1 font-mono-tactical">
              B → A's {playerB.targetZone === 'torso' ? 'Torso' : BODY_ZONE_DATA[playerB.targetZone].label}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div>
                <div className="text-2xl font-bold font-mono-tactical text-[#e4e7eb]">{resultBA.btk}</div>
                <div className="text-[10px] text-[#5c6570] font-mono-tactical">BTK</div>
              </div>
              <div className="w-px h-10 bg-[#282f3a]" />
              <div>
                <div className="text-2xl font-bold font-mono-tactical" style={{ color: CYAN }}>{resultBA.ttk}ms</div>
                <div className="text-[10px] text-[#5c6570] font-mono-tactical">TTK</div>
              </div>
            </div>
            <div className="h-2 bg-[#161a20] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${bBarPct}%`, backgroundColor: CYAN }}
              />
            </div>
          </div>
        </div>

        {/* Speed gap bar */}
        <div className="mt-5 pt-4 border-t border-[#282f3a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#5c6570] font-mono-tactical">Speed Gap</span>
            <span className="text-xs font-mono-tactical text-[#e4e7eb]">{gap}ms difference</span>
          </div>
          <div className="relative h-3 bg-[#161a20] rounded-full overflow-hidden flex">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${aBarPct}%`, backgroundColor: ORANGE }}
            />
            <div
              className="h-full transition-all duration-500 flex-1"
              style={{ backgroundColor: CYAN }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] font-mono-tactical" style={{ color: ORANGE }}>
              <Target className="w-3 h-3 inline mr-1" />A: {resultAB.ttk}ms ({resultAB.btk} shots)
            </span>
            <ArrowRight className="w-3 h-3 text-[#5c6570]" />
            <span className="text-[10px] font-mono-tactical" style={{ color: CYAN }}>
              B: {resultBA.ttk}ms ({resultBA.btk} shots)<Target className="w-3 h-3 inline ml-1" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Combat Log Section ── */}
      {showCombatLog && (
        <div className="mt-5 bg-[#0d0f12] border border-[#282f3a] rounded-lg p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <Swords className="w-4 h-4 text-[#5c6570]" />
            <h3 className="text-sm font-bold tracking-tight text-[#e4e7eb]">Combat Log — Shot-by-Shot Breakdown</h3>
          </div>
          <p className="text-[10px] text-[#5c6570] font-mono-tactical mb-4 leading-relaxed">
            100% (1.0x) damage overflow routed directly to 220 HP Torso once limb is knocked out.
            Single Leg kill threshold: {BODY_ZONE_DATA.legs.hp + TORSO_HP} DMG ({BODY_ZONE_DATA.legs.hp} + {TORSO_HP}).
            Single Arm kill threshold: {BODY_ZONE_DATA.arms.hp + TORSO_HP} DMG ({BODY_ZONE_DATA.arms.hp} + {TORSO_HP}).
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {playerA.targetZone !== 'torso' && resultAB.log.length > 0 && (
              <CombatLogTable
                log={resultAB.log}
                zone={playerA.targetZone}
                accentColor={ORANGE}
                label={`Alpha → Bravo's ${BODY_ZONE_DATA[playerA.targetZone].label}`}
              />
            )}

            {playerB.targetZone !== 'torso' && resultBA.log.length > 0 && (
              <CombatLogTable
                log={resultBA.log}
                zone={playerB.targetZone}
                accentColor={CYAN}
                label={`Bravo → Alpha's ${BODY_ZONE_DATA[playerB.targetZone].label}`}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
