import { Shield, ShieldOff } from 'lucide-react';
import { ARMOR_MATERIALS, PLATE_SIZES, type PlateSize } from '@/data/weaponData';

export default function ArmorSpecsPanel({ size }: { size: PlateSize }) {
  return (
    <section className="tactical-card p-4 md:p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[#ff6b35]" />
        <h2 className="text-lg font-bold tracking-tight text-[#e4e7eb]">Armor Specifications</h2>
        <span className="text-[10px] text-[#5c6570] font-mono-tactical uppercase tracking-wider ml-1">
          15 Plate Configs · 5 Materials × 3 Sizes
        </span>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-[#282f3a]">
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8b939e]">Material</th>
              {PLATE_SIZES.map(s => (
                <th key={s.id} className="px-3 py-2.5 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8b939e]">
                    {s.fullLabel} ({s.label})
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ARMOR_MATERIALS.map((mat, idx) => (
              <tr
                key={mat.id}
                className={`border-b border-[#1c2128] hover:bg-[#1c2128]/50 transition-colors ${idx % 2 === 0 ? 'bg-[#0d0f12]/30' : ''} ${mat.sizes[size] ? 'ring-1 ring-inset ring-[#ff6b35]/20' : ''}`}
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#ff6b35]" />
                    <span className="text-sm font-semibold text-[#e4e7eb]">{mat.name}</span>
                  </div>
                </td>
                {PLATE_SIZES.map(s => {
                  const spec = mat.sizes[s.id];
                  const active = s.id === size;
                  return (
                    <td key={s.id} className={`px-3 py-3 text-center transition-all ${active ? 'bg-[#ff6b35]/5' : ''}`}>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className={`text-sm font-bold font-mono-tactical ${active ? 'text-[#ff6b35]' : 'text-[#e4e7eb]'}`}>
                          {spec.mitigation}%
                        </div>
                        <div className="text-[10px] text-[#5c6570] font-mono-tactical">
                          {spec.hp} HP
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-3 border-t border-[#282f3a] flex items-center gap-2 text-[10px] font-mono-tactical text-[#5c6570]">
        <ShieldOff className="w-3.5 h-3.5" />
        <span>No Plates: 0% mitigation · 0 HP — direct damage to target</span>
        <span className="ml-auto">Highlighted column = current table selection</span>
      </div>
    </section>
  );
}
