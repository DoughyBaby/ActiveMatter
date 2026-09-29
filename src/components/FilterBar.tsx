import { Search, Crosshair, Filter } from 'lucide-react';
import type { PlateSize, WeaponCategory } from '@/data/weaponData';
import { PLATE_SIZES } from '@/data/weaponData';

export type CaliberFilter = 'all' | 'heavy' | 'intermediate' | 'smg' | 'lmg' | 'dmr' | 'bolt' | 'shotgun';

export const FILTER_OPTIONS: { id: CaliberFilter; label: string }[] = [
  { id: 'all',          label: 'All Weapons' },
  { id: 'heavy',        label: 'Battle Rifles' },
  { id: 'intermediate', label: 'Assault Rifles' },
  { id: 'smg',          label: 'SMGs' },
  { id: 'lmg',          label: 'Machine Guns' },
  { id: 'dmr',          label: 'DMRs' },
  { id: 'bolt',         label: 'Bolt-Action' },
  { id: 'shotgun',      label: 'Shotguns' },
];

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filter: CaliberFilter;
  onFilter: (v: CaliberFilter) => void;
  size: PlateSize;
  onSize: (v: PlateSize) => void;
  resultCount: number;
}

export default function FilterBar({
  search, onSearch, filter, onFilter, size, onSize, resultCount,
}: Props) {
  return (
    <div className="tactical-card p-4 md:p-5 animate-fade-in">
      <div className="flex flex-col gap-4">
        {/* Row 1: Search + Plate size toggle */}
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-wider text-[#5c6570] mb-1.5 font-mono-tactical">
              Search Weapons
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c6570]" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search by weapon name or caliber..."
                className="w-full bg-[#0d0f12] border border-[#282f3a] hover:border-[#3a4350] focus:border-[#ff6b35] rounded-md pl-9 pr-3 py-2.5 text-sm text-[#e4e7eb] placeholder:text-[#5c6570] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Plate size toggle */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#5c6570] mb-1.5 font-mono-tactical">
              Plate Size Toggle
            </label>
            <div className="flex gap-1 bg-[#0d0f12] border border-[#282f3a] rounded-md p-1">
              {PLATE_SIZES.map(s => {
                const active = s.id === size;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSize(s.id)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                      active
                        ? 'bg-[#ff6b35] text-white'
                        : 'text-[#8b939e] hover:text-[#e4e7eb]'
                    }`}
                  >
                    {s.fullLabel} ({s.label})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Filter pills + count */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[#5c6570] flex-shrink-0" />
            {FILTER_OPTIONS.map(opt => {
              const active = opt.id === filter;
              return (
                <button
                  key={opt.id}
                  onClick={() => onFilter(opt.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    active
                      ? 'bg-[#ff6b35] text-white border-[#ff6b35]'
                      : 'text-[#8b939e] border-[#282f3a] hover:border-[#3a4350] hover:text-[#e4e7eb]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#5c6570] font-mono-tactical">
            <Crosshair className="w-4 h-4 text-[#ff6b35]" />
            <span>{resultCount} weapons</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function matchesFilter(category: WeaponCategory, filter: CaliberFilter): boolean {
  if (filter === 'all') return true;
  return category === filter;
}
