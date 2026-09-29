import { useState, useMemo } from 'react';
import { HardHat, ChevronDown, ChevronUp, Info, AlertTriangle } from 'lucide-react';
import {
  WEAPONS, HELMETS, HEAD_HP, calculateHeadshotTTK,
  type WeaponData, type HelmetData, type HelmetRarity,
} from '@/data/weaponData';

/* ─── Constants ─────────────────────────────────────── */

const RARITY_COLORS: Record<HelmetRarity, string> = {
  Common: '#8b939e',
  Uncommon: '#4ade80',
  Rare: '#60a5fa',
};

const RARITY_BG: Record<HelmetRarity, string> = {
  Common: 'rgba(139,147,158,0.08)',
  Uncommon: 'rgba(74,222,128,0.08)',
  Rare: 'rgba(96,165,250,0.08)',
};

type SortKey = 'name' | 'rarity' | 'durability' | 'projectile';
type SortDir = 'asc' | 'desc';

const RARITY_ORDER: Record<HelmetRarity, number> = { Common: 0, Uncommon: 1, Rare: 2 };

function getTTKColor(btk: number): string {
  if (btk <= 1) return '#ef4444';
  if (btk <= 2) return '#f97316';
  if (btk <= 3) return '#eab308';
  if (btk <= 5) return '#22c55e';
  return '#3b82f6';
}

/* ─── Weapon Selector ──────────────────────────────── */

function WeaponPicker({
  value, onChange,
}: {
  value: number;
  onChange: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = WEAPONS.find(w => w.id === value)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#0d0f12] border border-[#282f3a] hover:border-[#3a4350] rounded-md px-3 py-2 text-sm transition-colors"
      >
        <span className="font-semibold text-[#e4e7eb]">{selected.name}</span>
        <span className="text-[10px] text-[#5c6570] font-mono-tactical">{selected.caliber} · {selected.baseDamage} DMG</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#5c6570] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-72 max-h-72 overflow-y-auto bg-[#161a20] border border-[#282f3a] rounded-md shadow-xl animate-fade-in">
            {WEAPONS.map(w => (
              <button
                key={w.id}
                onClick={() => { onChange(w.id); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#1c2128] transition-colors text-left ${w.id === value ? 'bg-[#1c2128]' : ''}`}
              >
                <div>
                  <div className="font-medium text-[#e4e7eb]">{w.name}</div>
                  <div className="text-[10px] text-[#5c6570] font-mono-tactical">{w.caliber} · {w.rpm} RPM · {w.baseDamage} DMG</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────── */

export default function HelmetTable() {
  const [selectedWeaponId, setSelectedWeaponId] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>('projectile');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showInfo, setShowInfo] = useState(false);

  const selectedWeapon = useMemo(() => WEAPONS.find(w => w.id === selectedWeaponId)!, [selectedWeaponId]);

  const combatHelmets = useMemo(
    () => HELMETS.filter(h => h.id !== 'none'),
    [],
  );

  const sorted = useMemo(() => {
    return [...combatHelmets].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':       cmp = a.name.localeCompare(b.name); break;
        case 'rarity':     cmp = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]; break;
        case 'durability': cmp = a.durability - b.durability; break;
        case 'projectile': cmp = a.projectile - b.projectile; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [combatHelmets, sortKey, sortDir]);

  const noHelmetResult = useMemo(
    () => calculateHeadshotTTK(selectedWeapon, HELMETS[0]),
    [selectedWeapon],
  );

  const results = useMemo(
    () => sorted.map(h => ({ helmet: h, ...calculateHeadshotTTK(selectedWeapon, h) })),
    [sorted, selectedWeapon],
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 text-[#3a4350]" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-[#e4e7eb]" />
      : <ChevronDown className="w-3 h-3 text-[#e4e7eb]" />;
  }

  return (
    <section className="tactical-card accent-glow p-5 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <HardHat className="w-5 h-5 text-[#60a5fa]" />
          <h2 className="text-lg font-bold tracking-tight text-[#e4e7eb]">Helmet Protection Chart</h2>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-[10px] text-[#5c6570] font-mono-tactical uppercase">Weapon:</span>
          <WeaponPicker value={selectedWeaponId} onChange={setSelectedWeaponId} />
        </div>
      </div>

      {/* Estimation disclaimer */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center gap-2 mb-4 px-3 py-2 rounded-md bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors w-full text-left"
      >
        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        <span className="text-[11px] text-yellow-400/80 font-mono-tactical">
          TFMK-I stats confirmed (wiki.gg). Other helmet values extrapolated from rarity progression.
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-yellow-500/50 ml-auto transition-transform ${showInfo ? 'rotate-180' : ''}`} />
      </button>

      {showInfo && (
        <div className="mb-4 px-4 py-3 rounded-md bg-[#161a20] border border-[#282f3a] animate-fade-in">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#60a5fa] mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-[#8b939e] leading-relaxed space-y-1.5">
              <p>
                <span className="text-[#e4e7eb] font-semibold">Head HP: {HEAD_HP}</span> — The head vital pool.
                Without a helmet, any weapon dealing {HEAD_HP}+ damage is a one-shot headshot kill.
              </p>
              <p>
                Helmets use the same degrading mitigation model as body armor plates.
                The projectile protection % is the max mitigation at full durability; it drops linearly as the
                helmet takes damage (same wear-ratio formula as plates).
              </p>
              <p>
                <span className="text-yellow-400 font-semibold">Ballistic Helmet TFMK-I</span> stats are confirmed
                from the Active Matter wiki: 295 durability, 80% projectile protection.
                All other values are community-extrapolated estimates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bare head reference row */}
      <div className="mb-4 flex items-center gap-4 px-4 py-3 rounded-md bg-red-500/5 border border-red-500/20">
        <span className="text-xs font-semibold text-red-400 font-mono-tactical uppercase">No Helmet / Headgear</span>
        <span className="text-xs text-[#8b939e] font-mono-tactical">
          {HEAD_HP} HP head ·{' '}
          <span className="text-[#e4e7eb] font-semibold">{selectedWeapon.name}</span> ({selectedWeapon.baseDamage} DMG) →{' '}
          <span className="font-bold" style={{ color: getTTKColor(noHelmetResult.btk) }}>
            {noHelmetResult.btk} BTK / {noHelmetResult.ttk}ms TTK
          </span>
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#282f3a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#161a20]">
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-[#1c2128] transition-colors"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#5c6570] font-mono-tactical">
                  Helmet <SortIcon col="name" />
                </div>
              </th>
              <th
                className="px-3 py-3 text-center cursor-pointer hover:bg-[#1c2128] transition-colors"
                onClick={() => toggleSort('rarity')}
              >
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-[#5c6570] font-mono-tactical">
                  Rarity <SortIcon col="rarity" />
                </div>
              </th>
              <th
                className="px-3 py-3 text-right cursor-pointer hover:bg-[#1c2128] transition-colors"
                onClick={() => toggleSort('durability')}
              >
                <div className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-wider text-[#5c6570] font-mono-tactical">
                  Durability <SortIcon col="durability" />
                </div>
              </th>
              <th
                className="px-3 py-3 text-right cursor-pointer hover:bg-[#1c2128] transition-colors"
                onClick={() => toggleSort('projectile')}
              >
                <div className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-wider text-[#5c6570] font-mono-tactical">
                  Projectile % <SortIcon col="projectile" />
                </div>
              </th>
              <th className="px-3 py-3 text-right">
                <div className="text-[10px] uppercase tracking-wider text-[#5c6570] font-mono-tactical">
                  BTK
                </div>
              </th>
              <th className="px-3 py-3 text-right">
                <div className="text-[10px] uppercase tracking-wider text-[#5c6570] font-mono-tactical">
                  TTK
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="text-[10px] uppercase tracking-wider text-[#5c6570] font-mono-tactical">
                  Survivability
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ helmet, ttk, btk }) => {
              const barPct = Math.min((btk / 10) * 100, 100);
              const btkDelta = btk - noHelmetResult.btk;

              return (
                <tr
                  key={helmet.id}
                  className="border-t border-[#282f3a]/50 hover:bg-[#161a20]/50 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-[#e4e7eb]">{helmet.name}</div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: RARITY_COLORS[helmet.rarity], backgroundColor: RARITY_BG[helmet.rarity] }}
                    >
                      {helmet.rarity}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-tactical text-[#e4e7eb]">
                    {helmet.durability}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-tactical text-[#e4e7eb]">
                    {helmet.projectile}%
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono-tactical font-bold" style={{ color: getTTKColor(btk) }}>
                        {btk}
                      </span>
                      {btkDelta > 0 && (
                        <span className="text-[9px] font-mono-tactical text-green-400/70">
                          +{btkDelta}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-tactical font-bold" style={{ color: getTTKColor(btk) }}>
                    {ttk}ms
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="w-full max-w-[140px]">
                      <div className="h-2 bg-[#161a20] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${barPct}%`,
                            backgroundColor: getTTKColor(btk),
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer legend */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
        {[
          { label: '1 BTK (instant)', color: '#ef4444' },
          { label: '2 BTK', color: '#f97316' },
          { label: '3 BTK', color: '#eab308' },
          { label: '4-5 BTK', color: '#22c55e' },
          { label: '6+ BTK', color: '#3b82f6' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-[#5c6570] font-mono-tactical">{l.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
