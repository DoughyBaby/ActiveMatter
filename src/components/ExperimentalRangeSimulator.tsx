import { useState, useMemo } from 'react';
import {
  Radar, ChevronUp, ChevronDown, ArrowUpDown, Zap, AlertTriangle,
} from 'lucide-react';
import {
  WEAPONS, ARMOR_MATERIALS, getTTK, getArmorSpec, getDamageRetention, getAllDropOffCurves,
  type PlateSize, type ArmorMaterial, type WeaponData,
} from '@/data/weaponData';

/* ─── Types ────────────────────────────────────────────── */

interface Props {
  size: PlateSize;
  search: string;
  filter: 'all' | 'heavy' | 'intermediate' | 'smg';
}

type SortDir = 'asc' | 'desc';
type ArmorKey = 'none' | 'rusty' | 'uhmwpe' | 'steel' | 'titanium' | 'ceramic';
type TtkSortKey = 'name' | 'caliber' | 'rpm' | 'retention' | ArmorKey;
type BtkSortKey = `btk_${ArmorKey}`;
type SortKey = TtkSortKey | BtkSortKey;

interface ArmorColumnDef {
  key: ArmorKey;
  label: string;
  shortLabel: string;
  material: ArmorMaterial;
}

interface RowData {
  weapon: WeaponData;
  damageMult: number;
  effectiveDmg: number;
  retentionPct: number;
  ttkAdjusted: Record<ArmorMaterial, { ttk: number; btk: number }>;
  ttkBaseline: Record<ArmorMaterial, { ttk: number; btk: number }>;
}

/* ─── Constants ────────────────────────────────────────── */

const ARMOR_COLUMNS: ArmorColumnDef[] = [
  { key: 'none',     label: 'Unarmored',      shortLabel: 'Unarmored', material: 'none' },
  { key: 'rusty',    label: 'Rusty Steel',    shortLabel: 'Rusty',     material: 'rusty' },
  { key: 'uhmwpe',   label: 'UHMWPE',         shortLabel: 'UHMWPE',    material: 'uhmwpe' },
  { key: 'steel',    label: 'Military Steel', shortLabel: 'Steel',     material: 'steel' },
  { key: 'titanium', label: 'Titanium',       shortLabel: 'Titanium',  material: 'titanium' },
  { key: 'ceramic',  label: 'Ceramic',        shortLabel: 'Ceramic',   material: 'ceramic' },
];

const ALL_MATERIALS: ArmorMaterial[] = ['none', 'rusty', 'uhmwpe', 'steel', 'titanium', 'ceramic'];

const CALIBER_ALIASES: Record<string, string> = { '.308 Win': '7.62x51' };
const PLATE_SIZE_LABEL: Record<PlateSize, string> = { S: 'Small (S)', L: 'Large (L)', XL: 'Extra Large (XL)' };

/* ─── Helpers ──────────────────────────────────────────── */

function caliberDiameterMm(caliber: string): number {
  const c = caliber.toLowerCase().trim();
  if (c.startsWith('.')) {
    const match = c.match(/\.(\d+(?:\.\d+)?)/);
    if (match) return parseFloat(match[1]) * 25.4;
  }
  const match = c.match(/(\d+(?:\.\d+)?)\s*x\s*\d+/);
  if (match) return parseFloat(match[1]);
  const fallback = c.match(/\d+(?:\.\d+)?/);
  return fallback ? parseFloat(fallback[0]) : 0;
}

function ttkColor(ttk: number, maxTTK: number): string {
  if (ttk === 0) return '#4ade80';
  const ratio = ttk / maxTTK;
  if (ratio < 0.15) return '#4ade80';
  if (ratio < 0.30) return '#a3e635';
  if (ratio < 0.45) return '#facc15';
  if (ratio < 0.60) return '#fb923c';
  if (ratio < 0.80) return '#f87171';
  return '#ef4444';
}

function categoryColor(cat: string): string {
  switch (cat) {
    case 'heavy':        return 'bg-[#ff6b35]';
    case 'intermediate': return 'bg-[#3b9eff]';
    case 'smg':          return 'bg-[#a3e635]';
    default:             return 'bg-[#5c6570]';
  }
}

function retentionColor(pct: number): string {
  if (pct >= 95) return '#4ade80';
  if (pct >= 85) return '#a3e635';
  if (pct >= 70) return '#facc15';
  if (pct >= 55) return '#fb923c';
  return '#ef4444';
}

function getMaxTTK(size: PlateSize, distance: number): number {
  let max = 0;
  for (const w of WEAPONS) {
    const mult = getDamageRetention(w.caliber, distance);
    for (const m of ARMOR_MATERIALS) {
      const r = getTTK(w, m.id, size, mult);
      if (r.ttk > max) max = r.ttk;
    }
    const r = getTTK(w, 'none', size, mult);
    if (r.ttk > max) max = r.ttk;
  }
  return max || 1;
}

/* ─── Sub-components ───────────────────────────────────── */

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 text-[#3a4350] group-hover:text-[#5c6570]" />;
  return dir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-[#ff6b35]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#ff6b35]" />;
}

function WarningBanner() {
  return (
    <div className="border border-yellow-600/40 bg-yellow-900/10 rounded-lg px-4 py-3 mb-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-200/80 leading-relaxed">
          <span className="font-bold text-yellow-400 uppercase tracking-wider">
            Experimental / Community Telemetry:
          </span>{' '}
          In-game empirical testing confirms that high-velocity full-power rifles (.308 / 7.62x54R)
          maintain flat BTK profiles from 15m to 150m, while pistol calibers and subsonics experience
          steep kinetic drop-off. The range degradation curves below are interpolated community
          approximations and subject to patch revisions.
        </p>
      </div>
    </div>
  );
}

function DropOffCurveReference() {
  const curves = getAllDropOffCurves();

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Radar className="w-4 h-4 text-[#ff6b35]" />
        <h3 className="text-sm font-bold tracking-tight text-[#e4e7eb]">
          Caliber Drop-Off Curves
        </h3>
        <span className="text-[10px] text-[#5c6570] font-mono-tactical uppercase tracking-wider ml-1">
          Reference Data
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {curves.map(({ group, label, curve }) => (
          <div
            key={group}
            className="bg-[#0d0f12] border border-[#282f3a] rounded-md px-3 py-2.5 hover:border-[#3a4350] transition-colors"
          >
            <div className="text-[11px] font-semibold text-[#e4e7eb] mb-2 truncate" title={label}>
              {label}
            </div>
            <div className="flex items-center justify-between gap-1">
              {curve.map((point) => {
                const pct = Math.round(point.retention * 100);
                return (
                  <div key={point.distance} className="flex flex-col items-center gap-0.5 flex-1">
                    <span className="text-[9px] text-[#5c6570] font-mono-tactical">
                      {point.distance}m
                    </span>
                    <span
                      className="text-xs font-bold font-mono-tactical"
                      style={{ color: retentionColor(pct) }}
                    >
                      {pct}%
                    </span>
                    {/* Mini bar */}
                    <div className="w-full h-1 bg-[#161a20] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: retentionColor(pct),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistanceSlider({
  distance,
  onChange,
}: {
  distance: number;
  onChange: (d: number) => void;
}) {
  const pct = ((distance - 15) / (100 - 15)) * 100;

  return (
    <div className="mb-5 bg-[#0d0f12] border border-[#282f3a] rounded-lg px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-[#ff6b35]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8b939e]">
            Engagement Distance
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold font-mono-tactical text-[#ff6b35]">
            {distance}
          </span>
          <span className="text-sm font-mono-tactical text-[#5c6570]">meters</span>
        </div>
      </div>

      {/* Distance markers */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        {[15, 25, 35, 50, 60, 75, 100].map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`text-[9px] font-mono-tactical transition-colors ${
              d === distance
                ? 'text-[#ff6b35] font-bold'
                : 'text-[#5c6570] hover:text-[#8b939e]'
            }`}
          >
            {d}m
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="relative">
        <div className="w-full h-2 bg-[#161a20] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{ width: `${pct}%`, backgroundColor: '#ff6b35' }}
          />
        </div>
        <input
          type="range"
          min={15}
          max={100}
          step={5}
          value={distance}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#ff6b35] bg-[#0d0f12] shadow-lg shadow-[#ff6b35]/20 pointer-events-none transition-all duration-150"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>

      {/* Range zone indicators */}
      <div className="flex items-center justify-between mt-2 text-[9px] font-mono-tactical">
        <span className="text-[#4ade80]">CQB</span>
        <span className="text-[#facc15]">Mid-Range</span>
        <span className="text-[#ef4444]">Long-Range</span>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────── */

export default function ExperimentalRangeSimulator({ size, search, filter }: Props) {
  const [distance, setDistance] = useState(35);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const maxTTK = useMemo(() => getMaxTTK(size, distance), [size, distance]);

  const rows: RowData[] = useMemo(() => {
    const filtered = WEAPONS.filter((w) => {
      if (filter !== 'all' && w.category !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!w.name.toLowerCase().includes(q) && !w.caliber.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    const mapped: RowData[] = filtered.map((w) => {
      const damageMult = getDamageRetention(w.caliber, distance);
      const effectiveDmg = Math.round(w.baseDamage * damageMult * 10) / 10;
      const retentionPct = Math.round(damageMult * 1000) / 10;

      const ttkAdjusted = {} as Record<ArmorMaterial, { ttk: number; btk: number }>;
      const ttkBaseline = {} as Record<ArmorMaterial, { ttk: number; btk: number }>;

      for (const m of ALL_MATERIALS) {
        ttkAdjusted[m] = getTTK(w, m, size, damageMult);
        ttkBaseline[m] = getTTK(w, m, size);
      }

      return { weapon: w, damageMult, effectiveDmg, retentionPct, ttkAdjusted, ttkBaseline };
    });

    const getSortVal = (r: RowData): string | number => {
      switch (sortKey) {
        case 'name':      return r.weapon.name;
        case 'caliber':   return caliberDiameterMm(r.weapon.caliber);
        case 'rpm':       return r.weapon.rpmNum;
        case 'retention': return r.retentionPct;
        case 'none':      return r.ttkAdjusted.none.ttk;
        case 'rusty':     return r.ttkAdjusted.rusty.ttk;
        case 'uhmwpe':    return r.ttkAdjusted.uhmwpe.ttk;
        case 'steel':     return r.ttkAdjusted.steel.ttk;
        case 'titanium':  return r.ttkAdjusted.titanium.ttk;
        case 'ceramic':   return r.ttkAdjusted.ceramic.ttk;
        case 'btk_none':      return r.ttkAdjusted.none.btk;
        case 'btk_rusty':     return r.ttkAdjusted.rusty.btk;
        case 'btk_uhmwpe':    return r.ttkAdjusted.uhmwpe.btk;
        case 'btk_steel':     return r.ttkAdjusted.steel.btk;
        case 'btk_titanium':  return r.ttkAdjusted.titanium.btk;
        case 'btk_ceramic':   return r.ttkAdjusted.ceramic.btk;
        default:          return r.weapon.name;
      }
    };

    mapped.sort((a, b) => {
      const av = getSortVal(a);
      const bv = getSortVal(b);
      let cmp: number;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return mapped;
  }, [size, search, filter, sortKey, sortDir, distance]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const isSortActive = (key: SortKey) => sortKey === key;

  return (
    <section className="tactical-card p-4 md:p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-[#ff6b35]" />
          <h2 className="text-lg font-bold tracking-tight text-[#e4e7eb]">
            Range Simulator
          </h2>
          <span className="text-[10px] text-[#5c6570] font-mono-tactical uppercase tracking-wider ml-1 hidden sm:inline">
            Experimental Ballistics
          </span>
        </div>
        <div className="text-xs text-[#5c6570] font-mono-tactical">
          Plate: <span className="text-[#ff6b35] font-semibold">{PLATE_SIZE_LABEL[size]}</span>
        </div>
      </div>

      {/* Warning Banner */}
      <WarningBanner />

      {/* Drop-Off Curves Reference */}
      <DropOffCurveReference />

      {/* Distance Slider */}
      <DistanceSlider distance={distance} onChange={setDistance} />

      {/* Adjusted TTK Table */}
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-[#ff6b35]" />
        <h3 className="text-sm font-bold tracking-tight text-[#e4e7eb]">
          Range-Adjusted TTK Data
        </h3>
        <span className="ml-auto text-[10px] text-[#5c6570] font-mono-tactical">
          @ <span className="text-[#ff6b35] font-bold">{distance}m</span> engagement
        </span>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        <table className="w-full min-w-[1200px] border-collapse">
          <thead>
            <tr className="border-b border-[#282f3a]">
              {/* Static columns */}
              {([
                { key: 'name' as SortKey,      label: 'Weapon' },
                { key: 'caliber' as SortKey,   label: 'Caliber' },
              ]).map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-3 text-left cursor-pointer select-none transition-colors group ${
                    isSortActive(col.key)
                      ? 'text-[#ff6b35]'
                      : 'text-[#8b939e] hover:text-[#e4e7eb]'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                      {col.label}
                    </span>
                    <SortIcon active={isSortActive(col.key)} dir={sortDir} />
                  </div>
                </th>
              ))}

              {/* Base Dmg */}
              <th className="px-3 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b939e] whitespace-nowrap">
                  Base Dmg
                </span>
              </th>

              {/* Effective Dmg */}
              <th className="px-3 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b939e] whitespace-nowrap">
                  Eff. Dmg
                </span>
              </th>

              {/* Retention */}
              <th
                onClick={() => handleSort('retention')}
                className={`px-3 py-3 text-left cursor-pointer select-none transition-colors group ${
                  isSortActive('retention')
                    ? 'text-[#ff6b35]'
                    : 'text-[#8b939e] hover:text-[#e4e7eb]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                    Retention%
                  </span>
                  <SortIcon active={isSortActive('retention')} dir={sortDir} />
                </div>
              </th>

              {/* Armor columns with dual TTK/BTK sort buttons */}
              {ARMOR_COLUMNS.map((col) => {
                const ttkKey = col.key as SortKey;
                const btkKey = `btk_${col.key}` as SortKey;
                const ttkActive = isSortActive(ttkKey);
                const btkActive = isSortActive(btkKey);
                const spec =
                  col.material !== 'none' ? getArmorSpec(col.material, size) : null;

                return (
                  <th key={col.key} className="px-1 py-2 text-center min-w-[120px]">
                    <div
                      className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap mb-1 ${
                        ttkActive || btkActive
                          ? 'text-[#ff6b35]'
                          : 'text-[#8b939e]'
                      }`}
                    >
                      {col.shortLabel}
                    </div>
                    {spec ? (
                      <div className="text-[9px] text-[#5c6570] font-mono-tactical mb-1.5">
                        {spec.mitigation}% · {spec.hp}HP
                      </div>
                    ) : (
                      <div className="text-[9px] text-[#5c6570] font-mono-tactical mb-1.5">
                        0% mitigation
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleSort(ttkKey)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider transition-colors group ${
                          ttkActive
                            ? 'bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/40'
                            : 'text-[#5c6570] border border-[#282f3a] hover:text-[#8b939e] hover:border-[#3a4350]'
                        }`}
                      >
                        TTK
                        <SortIcon active={ttkActive} dir={sortDir} />
                      </button>
                      <button
                        onClick={() => handleSort(btkKey)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider transition-colors group ${
                          btkActive
                            ? 'bg-[#3b9eff]/20 text-[#3b9eff] border border-[#3b9eff]/40'
                            : 'text-[#5c6570] border border-[#282f3a] hover:text-[#8b939e] hover:border-[#3a4350]'
                        }`}
                      >
                        BTK
                        <SortIcon active={btkActive} dir={sortDir} />
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-12 text-[#5c6570] text-sm">
                  No weapons match your search.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const retColor = retentionColor(row.retentionPct);

                return (
                  <tr
                    key={row.weapon.id}
                    className={`border-b border-[#1c2128] hover:bg-[#1c2128]/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-[#0d0f12]/30' : ''
                    }`}
                  >
                    {/* Weapon name */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-8 rounded-full ${categoryColor(row.weapon.category)}`} />
                        <div>
                          <div className="text-sm font-semibold text-[#e4e7eb]">
                            {row.weapon.name}
                          </div>
                          <div className="text-[10px] text-[#5c6570] font-mono-tactical uppercase">
                            {row.weapon.category} · {row.weapon.rpm} RPM
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Caliber */}
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono-tactical text-[#8b939e]">
                        {row.weapon.caliber}
                        {CALIBER_ALIASES[row.weapon.caliber] && (
                          <span className="text-[#5c6570] ml-1">
                            ({CALIBER_ALIASES[row.weapon.caliber]})
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Base Dmg */}
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono-tactical text-[#8b939e]">
                        {row.weapon.baseDamage}
                      </span>
                    </td>

                    {/* Effective Dmg */}
                    <td className="px-3 py-3">
                      <span
                        className="text-xs font-bold font-mono-tactical"
                        style={{
                          color: row.effectiveDmg < row.weapon.baseDamage ? '#fb923c' : '#4ade80',
                        }}
                      >
                        {row.effectiveDmg.toFixed(1)}
                      </span>
                    </td>

                    {/* Retention % */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className="text-xs font-bold font-mono-tactical"
                          style={{ color: retColor }}
                        >
                          {row.retentionPct.toFixed(1)}%
                        </span>
                        <div className="w-16 h-1.5 bg-[#161a20] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${row.retentionPct}%`,
                              backgroundColor: retColor,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Armor columns */}
                    {ARMOR_COLUMNS.map((col) => {
                      const adjusted = row.ttkAdjusted[col.material];
                      const baseline = row.ttkBaseline[col.material];
                      const btkDelta = adjusted.btk - baseline.btk;
                      const barPct =
                        maxTTK > 0 ? (adjusted.ttk / maxTTK) * 100 : 0;
                      const color = ttkColor(adjusted.ttk, maxTTK);
                      const ttkActive = isSortActive(col.key as SortKey);
                      const btkActive = isSortActive(`btk_${col.key}` as SortKey);

                      return (
                        <td key={col.key} className="px-2 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {/* TTK */}
                            <span
                              className={`text-sm font-bold font-mono-tactical ${
                                ttkActive ? 'ring-1 ring-[#ff6b35]/30 rounded px-1' : ''
                              }`}
                              style={{ color }}
                            >
                              {adjusted.ttk}ms
                            </span>

                            {/* BTK with delta badge */}
                            <div
                              className={`flex items-center gap-1 text-[10px] font-mono-tactical ${
                                btkActive
                                  ? 'ring-1 ring-[#3b9eff]/40 rounded px-1'
                                  : ''
                              }`}
                            >
                              <span className="text-[#5c6570]">BTK</span>
                              <span className="font-bold text-[#8b939e]">
                                {adjusted.btk}
                              </span>
                              {btkDelta > 0 && (
                                <span className="inline-flex items-center px-1 py-px rounded text-[8px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                  +{btkDelta}
                                </span>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-[#161a20] rounded-full overflow-hidden mt-0.5">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${barPct}%`,
                                  backgroundColor: color,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-[#282f3a] flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono-tactical text-[#5c6570]">
        <span className="uppercase tracking-wider">TTK Scale:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-[#4ade80]" />
          <span>Instant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-[#facc15]" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-[#fb923c]" />
          <span>Slow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-[#ef4444]" />
          <span>Very Slow</span>
        </div>
        <span className="mx-2 text-[#282f3a]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center px-1 py-px rounded text-[8px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
            +N
          </span>
          <span>BTK increase vs baseline (15m)</span>
        </div>
        <div className="flex items-center gap-x-3 ml-auto gap-y-1 flex-wrap justify-end">
          <span>
            Click <span className="text-[#ff6b35]">TTK</span> or{' '}
            <span className="text-[#3b9eff]">BTK</span> in any column header to sort
          </span>
        </div>
      </div>
    </section>
  );
}
