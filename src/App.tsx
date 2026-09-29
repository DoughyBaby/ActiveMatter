import { useState, useMemo } from 'react';
import { Crosshair, Target, AlertTriangle, ShieldCheck } from 'lucide-react';
import HeaderBanner from '@/components/HeaderBanner';
import DuelSimulator from '@/components/DuelSimulator';
import FilterBar, { matchesFilter, type CaliberFilter } from '@/components/FilterBar';
import MasterTable from '@/components/MasterTable';
import ArmorSpecsPanel from '@/components/ArmorSpecsPanel';
import ExperimentalRangeSimulator from '@/components/ExperimentalRangeSimulator';
import HelmetTable from '@/components/HelmetTable';
import { WEAPONS, type PlateSize } from '@/data/weaponData';

type AppTab = 'cqb' | 'range';

export default function App() {
  const [tab, setTab] = useState<AppTab>('cqb');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CaliberFilter>('all');
  const [size, setSize] = useState<PlateSize>('L');

  const resultCount = useMemo(() => {
    return WEAPONS.filter(w => {
      if (!matchesFilter(w.category, filter)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!w.name.toLowerCase().includes(q) && !w.caliber.toLowerCase().includes(q)) return false;
      }
      return true;
    }).length;
  }, [search, filter]);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e4e7eb]">
      <HeaderBanner />

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Dual-mode tab switcher */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setTab('cqb')}
            className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-lg text-sm font-semibold transition-all border ${
              tab === 'cqb'
                ? 'bg-green-500/10 border-green-500/40 text-green-400'
                : 'bg-[#161a20] border-[#282f3a] text-[#8b939e] hover:border-[#3a4350] hover:text-[#e4e7eb]'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="font-mono-tactical tracking-wide">Verified CQB Lab (0-20m)</span>
          </button>
          <button
            onClick={() => setTab('range')}
            className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-lg text-sm font-semibold transition-all border ${
              tab === 'range'
                ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                : 'bg-[#161a20] border-[#282f3a] text-[#8b939e] hover:border-[#3a4350] hover:text-[#e4e7eb]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="font-mono-tactical tracking-wide">Experimental Range Simulator (25m-100m)</span>
          </button>
        </div>

        {tab === 'cqb' && (
          <>
            {/* Verified badge */}
            <div className="tactical-card p-4 animate-fade-in border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-green-400 font-mono-tactical">
                      Empirically Verified
                    </span>
                    <span className="text-[10px] text-green-400/60 font-mono-tactical">0-20M Baseline</span>
                  </div>
                  <p className="text-xs text-[#8b939e] leading-relaxed max-w-3xl">
                    Calculated using exact in-game armor durability pools, body sleeve mechanics,
                    and raw caliber damage against the <span className="text-[#e4e7eb] font-semibold">220 HP</span> torso vital pool.
                    Limb overflow uses the official <span className="text-green-400 font-semibold">1.0x (100%)</span> direct torso routing mechanic.
                  </p>
                </div>
              </div>
            </div>

            <FilterBar
              search={search}
              onSearch={setSearch}
              filter={filter}
              onFilter={setFilter}
              size={size}
              onSize={setSize}
              resultCount={resultCount}
            />
            <MasterTable size={size} search={search} filter={filter} />
            <ArmorSpecsPanel size={size} />
            <HelmetTable />
            <DuelSimulator />
          </>
        )}

        {tab === 'range' && (
          <>
            <FilterBar
              search={search}
              onSearch={setSearch}
              filter={filter}
              onFilter={setFilter}
              size={size}
              onSize={setSize}
              resultCount={resultCount}
            />
            <ExperimentalRangeSimulator size={size} search={search} filter={filter} />
            <HelmetTable />
            <DuelSimulator />
          </>
        )}
      </main>

      <footer className="border-t border-[#282f3a] mt-8">
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#5c6570] font-mono-tactical">
            <Crosshair className="w-4 h-4 text-[#ff6b35]" />
            <span>ACTIVEMATTER // TTK Analytics Engine</span>
          </div>
          <div className="text-[10px] text-[#5c6570] font-mono-tactical uppercase tracking-wider">
            Simulated data · Dynamic armor durability model · {WEAPONS.length} weapons · 220 HP torso vital pool
          </div>
        </div>
      </footer>
    </div>
  );
}
