import { useState, useMemo } from 'react';
import {
  ArrowUpDown, Zap, ChevronUp, ChevronDown
} from 'lucide-react';
import {
  WEAPONS, ARMOR_MATERIALS, getTTK, getArmorSpec,
  type PlateSize, type ArmorMaterial, type WeaponData,
} from '@/data/weaponData';

type SortDir = 'asc' | 'desc';
type ArmorKey = 'none' | 'rusty' | 'uhmwpe' | 'steel' | 'titanium' | 'ceramic';
type TtkSortKey = 'name' | 'caliber' | 'rpm' | ArmorKey;
type BtkSortKey = `btk_${ArmorKey}`;
type SortKey = TtkSortKey | BtkSortKey;

interface ArmorColumnDef {
  key: ArmorKey;
  label: string;
  shortLabel: string;
  material: ArmorMaterial;
}

const ARMOR_COLUMNS: ArmorColumnDef[] = [
  { key: 'none',     label: 'Unarmored',     shortLabel: 'Unarmored', material: 'none' },
  { key: 'rusty',    label: 'Rusty Steel',   shortLabel: 'Rusty',     material: 'rusty' },
  { key: 'uhmwpe',   label: 'UHMWPE',        shortLabel: 'UHMWPE',    material: 'uhmwpe' },
  { key: 'steel',    label: 'Military Steel',shortLabel: 'Steel',     material: 'steel' },
  { key: 'titanium', label: 'Titanium',      shortLabel: 'Titanium',  material: 'titanium' },
  { key: 'ceramic',  label: 'Ceramic',       shortLabel: 'Ceramic',   material: 'ceramic' },
];

function getMaxTTK(size: PlateSize, damageMult: number = 1.0): number {
  let max = 0;
  for (const w of WEAPONS) {
    for (const m of ARMOR_MATERIALS) {
      const r = getTTK(w, m.id, size, damageMult);
      if (r.ttk > max) max = r.ttk;
    }
    const r = getTTK(w, 'none', size, damageMult);
    if (r.ttk > max) max = r.ttk;
  }
  return max || 1;
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

interface RowData {
  weapon: WeaponData;
  ttkResults: Record<ArmorMaterial, { ttk: number; btk: number }>;
}

export default function MasterTable({
  size, search, filter, damageMult = 1.0,
}: {
  size: PlateSize;
  search: string;
  filter: 'all' | 'heavy' | 'intermediate' | 'smg';
  damageMult?: number;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const maxTTK = useMemo(() => getMaxTTK(size, damageMult), [size, damageMult]);

  const rows: RowData[] = useMemo(() => {
    const filtered = WEAPONS.filter(w => {
      if (filter !== 'all' && w.category !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!w.name.toLowerCase().includes(q) && !w.caliber.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    const getSortVal = (r: RowData): string | number => {
      switch (sortKey) {
        case 'name':    return r.weapon.name;
        case 'caliber': return caliberDiameterMm(r.weapon.caliber);
        case 'rpm':     return r.weapon.rpmNum;
        // TTK sorts
        case 'none':    return r.ttkResults.none.ttk;
        case 'rusty':   return r.ttkResults.rusty.ttk;
        case 'uhmwpe':  return r.ttkResults.uhmwpe.ttk;
        case 'steel':   return r.ttkResults.steel.ttk;
        case 'titanium':return r.ttkResults.titanium.ttk;
        case 'ceramic': return r.ttkResults.ceramic.ttk;
        // BTK sorts
        case 'btk_none':    return r.ttkResults.none.btk;
        case 'btk_rusty':   return r.ttkResults.rusty.btk;
        case 'btk_uhmwpe':  return r.ttkResults.uhmwpe.btk;
        case 'btk_steel':   return r.ttkResults.steel.btk;
        case 'btk_titanium':return r.ttkResults.titanium.btk;
        case 'btk_ceramic': return r.ttkResults.ceramic.btk;
      }
    };

    const mapped = filtered.map(w => {
      const materials: ArmorMaterial[] = ['none', 'rusty', 'uhmwpe', 'steel', 'titanium', 'ceramic'];
      const ttkResults = {} as Record<ArmorMaterial, { ttk: number; btk: number }>;
      for (const m of materials) {
        ttkResults[m] = getTTK(w, m, size, damageMult);
      }
      return { weapon: w, ttkResults };
    });

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
  }, [size, search, filter, sortKey, sortDir, damageMult]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const isSortActive = (key: SortKey) => sortKey === key;

  const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
    if (!active) return <ArrowUpDown className="w-3 h-3 text-[#3a4350] group-hover:text-[#5c6570]" />;
    return dir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-[#ff6b35]" />
      : <ChevronDown className="w-3.5 h-3.5 text-[#ff6b35]" />;
  };

  return (
    <section className="tactical-card p-4 md:p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#ff6b35]" />
          <h2 className="text-lg font-bold tracking-tight text-[#e4e7eb]">Master Armor Data Table</h2>
        </div>
        <div className="text-xs text-[#5c6570] font-mono-tactical">
          Size: <span className="text-[#ff6b35] font-semibold">{PLATE_SIZE_LABEL[size]}</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="border-b border-[#282f3a]">
              {/* Static columns */}
              {[
                { key: 'name' as SortKey,    label: 'Weapon',  align: 'left' },
                { key: 'caliber' as SortKey, label: 'Caliber', align: 'left' },
                { key: 'rpm' as SortKey,     label: 'RPM',     align: 'left' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-3 text-left cursor-pointer select-none transition-colors group ${
                    isSortActive(col.key) ? 'text-[#ff6b35]' : 'text-[#8b939e] hover:text-[#e4e7eb]'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{col.label}</span>
                    <SortIcon active={isSortActive(col.key)} dir={sortDir} />
                  </div>
                </th>
              ))}

              {/* Armor columns — each has two clickable sub-headers: TTK and BTK */}
              {ARMOR_COLUMNS.map(col => {
                const ttkKey = col.key as SortKey;
                const btkKey = `btk_${col.key}` as SortKey;
                const ttkActive = isSortActive(ttkKey);
                const btkActive = isSortActive(btkKey);
                const spec = col.material !== 'none' ? getArmorSpec(col.material, size) : null;
                return (
                  <th
                    key={col.key}
                    className="px-1 py-2 text-center min-w-[120px]"
                  >
                    {/* Column name + armor spec */}
                    <div className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap mb-1 ${
                      ttkActive || btkActive ? 'text-[#ff6b35]' : 'text-[#8b939e]'
                    }`}>
                      {col.shortLabel}
                    </div>
                    {spec ? (
                      <div className="text-[9px] text-[#5c6570] font-mono-tactical mb-1.5">
                        {spec.mitigation}% · {spec.hp}HP
                      </div>
                    ) : (
                      <div className="text-[9px] text-[#5c6570] font-mono-tactical mb-1.5">0% mitigation</div>
                    )}
                    {/* TTK / BTK sort toggles */}
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
                <td colSpan={9} className="text-center py-12 text-[#5c6570] text-sm">
                  No weapons match your search.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.weapon.id}
                  className={`border-b border-[#1c2128] hover:bg-[#1c2128]/50 transition-colors ${idx % 2 === 0 ? 'bg-[#0d0f12]/30' : ''}`}
                >
                  {/* Weapon name */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-8 rounded-full ${categoryColor(row.weapon.category)}`} />
                      <div>
                        <div className="text-sm font-semibold text-[#e4e7eb]">{row.weapon.name}</div>
                        <div className="text-[10px] text-[#5c6570] font-mono-tactical uppercase">{row.weapon.category}</div>
                      </div>
                    </div>
                  </td>
                  {/* Caliber */}
                  <td className="px-3 py-3">
                    <span className="text-xs font-mono-tactical text-[#8b939e]">
                      {row.weapon.caliber}
                      {CALIBER_ALIASES[row.weapon.caliber] && (
                        <span className="text-[#5c6570] ml-1">({CALIBER_ALIASES[row.weapon.caliber]})</span>
                      )}
                    </span>
                  </td>
                  {/* RPM */}
                  <td className="px-3 py-3">
                    <span className="text-xs font-mono-tactical text-[#8b939e]">{row.weapon.rpm}</span>
                  </td>
                  {/* Armor columns */}
                  {ARMOR_COLUMNS.map(col => {
                    const result = row.ttkResults[col.material];
                    const barPct = maxTTK > 0 ? (result.ttk / maxTTK) * 100 : 0;
                    const color = ttkColor(result.ttk, maxTTK);
                    const ttkActive = isSortActive(col.key as SortKey);
                    const btkActive = isSortActive(`btk_${col.key}` as SortKey);
                    return (
                      <td key={col.key} className="px-2 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {/* TTK */}
                          <span
                            className={`text-sm font-bold font-mono-tactical ${ttkActive ? 'ring-1 ring-[#ff6b35]/30 rounded px-1' : ''}`}
                            style={{ color }}
                          >
                            {result.ttk}ms
                          </span>
                          {/* BTK */}
                          <div className={`flex items-center gap-1 text-[10px] font-mono-tactical ${btkActive ? 'ring-1 ring-[#3b9eff]/40 rounded px-1' : ''}`}>
                            <span className="text-[#5c6570]">BTK</span>
                            <span className="font-bold text-[#8b939e]">{result.btk}</span>
                          </div>
                          {/* Bar */}
                          <div className="w-full h-1.5 bg-[#161a20] rounded-full overflow-hidden mt-0.5">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${barPct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-[#282f3a] flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono-tactical text-[#5c6570]">
        <span className="uppercase tracking-wider">TTK Scale:</span>
        <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-[#4ade80]" /><span>Instant</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-[#facc15]" /><span>Moderate</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-[#fb923c]" /><span>Slow</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-[#ef4444]" /><span>Very Slow</span></div>
        <div className="flex items-center gap-x-3 ml-auto gap-y-1 flex-wrap justify-end">
          <span>Click <span className="text-[#ff6b35]">TTK</span> or <span className="text-[#3b9eff]">BTK</span> button in any column header to sort by that metric</span>
        </div>
      </div>
    </section>
  );
}

const PLATE_SIZE_LABEL: Record<PlateSize, string> = { S: 'Small (S)', L: 'Large (L)', XL: 'Extra Large (XL)' };

const CALIBER_ALIASES: Record<string, string> = {
  '.308 Win': '7.62x51',
};

// Sorts by actual projectile diameter in mm. Ascending = smallest first (9x18 → 12.7x55).
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

function categoryColor(cat: string): string {
  switch (cat) {
    case 'heavy':        return 'bg-[#ff6b35]';
    case 'intermediate': return 'bg-[#3b9eff]';
    case 'smg':          return 'bg-[#a3e635]';
    default:             return 'bg-[#5c6570]';
  }
}
