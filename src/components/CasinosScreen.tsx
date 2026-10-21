import React, { useState } from 'react';
import { ExternalLink, Sparkles, Zap, Crown, Dices, Trophy, Shield, Gem, Search } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';
import { CASINO_PLATFORMS, CasinoPlatform } from '../data/casinos';

interface CasinosScreenProps {
  onSelectPlatform: (url: string, name: string) => void;
}

export const CasinosScreen: React.FC<CasinosScreenProps> = ({ onSelectPlatform }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlatforms = CASINO_PLATFORMS.filter((platform) =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    platform.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBadgeIcon = (icon: CasinoPlatform['accentIcon']) => {
    switch (icon) {
      case 'crown':
        return <Crown className="w-3.5 h-3.5 text-amber-300" />;
      case 'lightning':
        return <Zap className="w-3.5 h-3.5 text-violet-300" />;
      case 'dice':
        return <Dices className="w-3.5 h-3.5 text-purple-300" />;
      case 'trophy':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'diamond':
        return <Gem className="w-3.5 h-3.5 text-cyan-300" />;
      case 'shield':
        return <Shield className="w-3.5 h-3.5 text-violet-300" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-violet-300" />;
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-gradient-to-b from-[#0a0316] via-[#07020f] to-[#04010a] overflow-hidden">
      {/* Soft ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header - Unified standard height */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-5 h-14 bg-[#0e0420]/95 backdrop-blur-md border-b border-violet-950/60 shrink-0">
        <GanamosLogo size="sm" showSubtitle={false} />
        <div className="text-right">
          <span className="text-[11px] font-bold text-violet-200 block uppercase tracking-wider leading-tight">
            Casinos
          </span>
          <span className="text-[10px] text-violet-400/60 font-medium">
            14 plataformas
          </span>
        </div>
      </header>

      {/* Intro & Search Filter */}
      <div className="relative z-10 px-4 sm:px-5 pt-3 pb-2.5 shrink-0 space-y-2.5">
        <div className="space-y-0.5">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Plataformas de juego
          </h1>
          <p className="text-[11px] text-violet-300/60">
            Elegí tu plataforma y accedé al instante.
          </p>
        </div>

        {/* Quick Search input */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-violet-400/50 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar casino..."
            className="w-full h-10 pl-9 pr-3.5 bg-[#130726]/80 text-white placeholder-violet-300/35 text-xs rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Platforms Scrollable List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-2 space-y-2.5">
        {filteredPlatforms.map((platform) => {
          const isPrimary = platform.id === 'ganamosbet';

          return (
            <div
              key={platform.id}
              className={`p-3 sm:p-3.5 rounded-2xl bg-[#130726]/90 hover:bg-[#1a0a33] border transition-all duration-200 shadow-sm flex items-center justify-between group gap-2.5 ${
                isPrimary
                  ? 'border-violet-400/40 bg-gradient-to-r from-[#1b0a38] to-[#130726]'
                  : 'border-violet-500/20 hover:border-violet-400/30'
              }`}
            >
              {/* Left Identity: Stylized Monogram Emblem & Details */}
              <div className="flex items-center gap-3 min-w-0 pr-1">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${platform.themeColor} border border-violet-400/30 flex flex-col items-center justify-center text-white shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform`}
                >
                  <span className="text-[11px] font-black tracking-tight leading-none">
                    {platform.shortTag}
                  </span>
                  <div className="mt-0.5 opacity-90">
                    {renderBadgeIcon(platform.accentIcon)}
                  </div>
                </div>

                <div className="min-w-0 truncate space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                      {platform.name}
                    </h2>
                    {isPrimary && (
                      <span className="text-[9px] font-bold text-violet-200 bg-violet-600/30 border border-violet-400/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                        Principal
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-violet-300/50 block font-mono truncate">
                    {platform.domain}
                  </span>
                </div>
              </div>

              {/* Right: Ingresar button */}
              <div className="shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectPlatform(platform.url, platform.name)}
                  className={`h-9 px-3 sm:px-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isPrimary
                      ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_2px_12px_rgba(124,58,237,0.35)] border border-violet-400/40'
                      : 'bg-violet-950/70 hover:bg-violet-900/80 active:bg-violet-800 text-violet-200 hover:text-white border border-violet-500/25'
                  }`}
                >
                  <span>Ingresar</span>
                  <ExternalLink className="w-3 h-3 text-violet-300" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredPlatforms.length === 0 && (
          <div className="p-8 text-center text-xs text-violet-300/50">
            No se encontraron plataformas que coincidan con &quot;{searchQuery}&quot;.
          </div>
        )}

        {/* Bottom space for smooth scroll */}
        <div className="h-3 shrink-0" />
      </div>
    </div>
  );
};
