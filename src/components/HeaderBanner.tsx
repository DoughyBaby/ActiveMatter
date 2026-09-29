import { Crosshair, AlertTriangle, Target } from 'lucide-react';
import { WEAPONS } from '@/data/weaponData';

export default function HeaderBanner() {
  return (
    <header className="relative overflow-hidden tactical-border border-b">
      {/* Grid texture background */}
      <div className="absolute inset-0 grid-texture opacity-60" />
      {/* Diagonal stripes */}
      <div className="absolute inset-0 diagonal-stripes" />
      {/* Scanline accent */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent animate-scanline" />
      </div>

      <div className="relative px-6 py-8 md:px-10 md:py-10 max-w-[1600px] mx-auto">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Crosshair className="w-7 h-7 text-[#ff6b35]" strokeWidth={2} />
              <div className="absolute inset-0 rounded-full animate-pulse-accent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#e4e7eb] leading-none">
                ACTIVE<span className="text-[#ff6b35]">MATTER</span>
              </h1>
              <p className="text-[10px] md:text-xs text-[#5c6570] tracking-[0.3em] uppercase mt-1 font-mono-tactical">
                TTK Analytics & Comparison Dashboard
              </p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono-tactical">
            <div className="flex items-center gap-2 text-[#8b939e]">
              <Target className="w-4 h-4 text-[#ff6b35]" />
              <span>220 HP Torso Vital Pool</span>
            </div>
            <div className="flex items-center gap-2 text-[#8b939e]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>15 Plate Configs</span>
            </div>
            <div className="flex items-center gap-2 text-[#8b939e]">
              <span className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse" />
              <span>{WEAPONS.length} Weapons</span>
            </div>
          </div>
        </div>

        {/* Banner message */}
        <div className="flex items-start gap-3 bg-[#0d0f12]/80 backdrop-blur-sm border border-[#282f3a] rounded-lg px-5 py-4 max-w-4xl">
          <AlertTriangle className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-sm md:text-[15px] text-[#8b939e] leading-relaxed">
            <span className="text-[#e4e7eb] font-semibold">Simulated torso TTK</span> factoring caliber base damage against the
            <span className="text-[#ff6b35] font-mono-tactical font-medium"> 220 HP </span>
            torso vital pool. Models dynamic per-shot armor durability loss across all
            <span className="text-[#e4e7eb] font-semibold"> 15 plate configurations </span>
            (5 materials in S, L, and XL sizes) with localized limb health pools and
            <span className="text-[#e4e7eb] font-semibold"> 100% (1.0x) overflow </span>
            damage routing to torso once a limb is knocked out.
          </p>
        </div>
      </div>
    </header>
  );
}
