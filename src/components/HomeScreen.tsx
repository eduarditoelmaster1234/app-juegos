import React from 'react';
import { Play, LogOut, ChevronRight, Coins, Wallet } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';
import casinoBanner from '../assets/images/casino_roulette_banner.webp';

interface HomeScreenProps {
  username: string;
  onPlay: () => void;
  onOpenChat: (initialTopic?: 'cargar' | 'retirar') => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  username,
  onPlay,
  onOpenChat,
  onLogout,
  onOpenProfile,
}) => {
  return (
    <div className="relative flex flex-col justify-between h-full w-full px-4 sm:px-5 py-3 overflow-y-auto bg-gradient-to-b from-[#0a0316] via-[#07020f] to-[#04010a]">
      {/* Controlled, soft ambient violet glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-900/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Header - Standardized height and alignment */}
      <header className="relative z-10 flex items-center justify-between w-full h-12 shrink-0 border-b border-violet-950/40 pb-1">
        <GanamosLogo size="sm" showSubtitle={false} />

        <div className="flex items-center gap-2">
          {/* User profile button */}
          <button
            type="button"
            onClick={onOpenProfile}
            title="Ver mi perfil"
            className="flex items-center gap-2 h-9 px-3 rounded-full bg-[#15092a] hover:bg-[#1c0c38] active:bg-[#120724] border border-violet-500/20 hover:border-violet-400/40 transition-all cursor-pointer shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-violet-200 truncate max-w-[110px]">
              {username}
            </span>
          </button>

          {/* Quick logout button */}
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="w-9 h-9 rounded-full flex items-center justify-center text-violet-400/60 hover:text-violet-200 hover:bg-violet-900/25 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area - Evenly distributed vertical rhythm */}
      <main className="relative z-10 flex flex-col justify-center items-center flex-1 my-auto w-full max-w-[360px] mx-auto py-3 space-y-4">
        {/* Welcome Section */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ¡Hola, {username}!
          </h1>
          <p className="text-xs text-violet-300/60">
            Te damos la bienvenida a GANAMOS
          </p>
        </div>

        {/* PRIMARY HERO CTA: BOTÓN JUGAR CON IMAGEN DE CASINO VISIBLE Y EQUILIBRADA */}
        <div className="w-full relative group">
          {/* Refined subtle ambient backlight */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/40 via-purple-600/50 to-indigo-600/40 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />

          <button
            type="button"
            onClick={onPlay}
            className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden text-white shadow-[0_8px_30px_rgba(109,40,217,0.3)] hover:shadow-[0_12px_36px_rgba(109,40,217,0.45)] border border-violet-400/35 active:scale-[0.985] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center p-4"
          >
            {/* Casino roulette / chips photo */}
            <img
              src={casinoBanner}
              alt="Ruleta de casino GANAMOS"
              referrerPolicy="no-referrer"
              decoding="async"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-60 group-hover:scale-105 group-hover:opacity-70 transition-all duration-500 pointer-events-none"
            />

            {/* Carefully tuned scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090217]/95 via-violet-950/50 to-[#0e0422]/80 pointer-events-none" />

            {/* Subtle top gloss hairline */}
            <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

            {/* Glowing Icon Container */}
            <div className="relative z-10 w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-violet-600/35 backdrop-blur-md border border-violet-300/40 flex items-center justify-center mb-2 shadow-[0_4px_16px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white translate-x-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            </div>

            {/* Main Action Text - Crisp, dominant, perfectly legible */}
            <span className="relative z-10 text-3xl sm:text-4xl font-black tracking-widest uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              JUGAR
            </span>

            {/* Clean sub-label */}
            <span className="relative z-10 text-[11px] font-semibold text-violet-200/90 tracking-wide mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Acceder a GanamosBet
            </span>
          </button>
        </div>

        {/* ACCESOS SEPARADOS: CARGAR Y RETIRAR FICHAS */}
        <div className="w-full space-y-2.5">
          {/* Acceso 1: Cargar fichas */}
          <button
            type="button"
            onClick={() => onOpenChat('cargar')}
            className="w-full p-3.5 rounded-2xl bg-[#130726]/90 hover:bg-[#1a0a33] active:bg-[#100520] border border-violet-500/20 hover:border-violet-400/35 shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-all duration-200 cursor-pointer flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:text-white group-hover:bg-violet-600/30 transition-all shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                  Cargar fichas
                </h3>
                <p className="text-[11px] text-violet-300/60 leading-tight">
                  Coordinar carga con atención oficial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-violet-400/70 group-hover:text-violet-300 transition-colors pl-2 shrink-0">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Acceso 2: Retirar fichas */}
          <button
            type="button"
            onClick={() => onOpenChat('retirar')}
            className="w-full p-3.5 rounded-2xl bg-[#130726]/90 hover:bg-[#1a0a33] active:bg-[#100520] border border-violet-500/20 hover:border-violet-400/35 shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-all duration-200 cursor-pointer flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:text-white group-hover:bg-violet-600/30 transition-all shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                  Retirar fichas
                </h3>
                <p className="text-[11px] text-violet-300/60 leading-tight">
                  Solicitar retiro de fondos al soporte
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-violet-400/70 group-hover:text-violet-300 transition-colors pl-2 shrink-0">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </main>

      {/* Clean bottom spacer */}
      <div className="h-1 shrink-0" />
    </div>
  );
};
