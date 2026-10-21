import React from 'react';
import { Play, LogOut, ChevronRight, Sparkles, Coins, Wallet } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';
import casinoBanner from '../assets/images/casino_roulette_banner_1792544270379.jpg';

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
    <div className="relative flex flex-col justify-between min-h-full w-full px-6 py-5 overflow-y-auto bg-gradient-to-b from-[#0e0422] via-[#090217] to-[#060110]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-700/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between w-full pt-1 pb-3">
        <GanamosLogo size="sm" showSubtitle={false} />

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfile}
            title="Ver mi perfil"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/60 hover:bg-violet-900/60 active:bg-violet-800 border border-violet-500/20 hover:border-violet-400/40 transition-all cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-violet-200">
              {username}
            </span>
          </button>

          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="p-2 rounded-full text-violet-400/60 hover:text-violet-200 hover:bg-violet-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col justify-center items-center flex-1 my-auto w-full max-w-sm mx-auto py-2 space-y-5">
        {/* Welcome Section */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            ¡Hola, {username}!
          </h1>
          <p className="text-xs text-violet-300/70">
            Te damos la bienvenida a GANAMOS
          </p>
        </div>

        {/* PRIMARY HERO CTA: BOTÓN JUGAR CON IMAGEN DE CASINO INTEGRADA */}
        <div className="w-full relative group">
          {/* Ambient Glow behind the button */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

          <button
            onClick={onPlay}
            className="relative w-full py-8 px-6 rounded-2xl overflow-hidden text-white shadow-[0_12px_40px_rgba(124,58,237,0.45)] hover:shadow-[0_16px_50px_rgba(124,58,237,0.65)] border border-violet-400/40 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center"
          >
            {/* Integrated Casino Image Background */}
            <img
              src={casinoBanner}
              alt="Casino Roulette Ganamos"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-45 transition-all duration-700 pointer-events-none"
            />

            {/* Seamless Dark Violet / Purple Gradient Scrim for contrast & legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0422] via-violet-950/80 to-purple-900/70 pointer-events-none" />

            {/* Top glass reflection sheen */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

            {/* Glowing Center Icon Container */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-violet-600/30 backdrop-blur-md border border-violet-300/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform duration-300">
              <Play className="w-8 h-8 text-white fill-white translate-x-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
            </div>

            {/* Main Action Text - High contrast, sharp typography */}
            <span className="relative z-10 text-3xl sm:text-4xl font-black tracking-wider uppercase text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]">
              JUGAR
            </span>

            {/* Supporting hint */}
            <span className="relative z-10 text-xs font-semibold text-violet-200 tracking-wide mt-1.5 flex items-center gap-1.5 drop-shadow">
              <span>Ingresar a GanamosBet</span>
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            </span>
          </button>
        </div>

        {/* ACCESOS SEPARADOS DE ATENCIÓN POR CHAT */}
        <div className="w-full space-y-2.5">
          {/* Acceso 1: Cargar fichas */}
          <button
            onClick={() => onOpenChat('cargar')}
            className="w-full p-3.5 rounded-2xl bg-[#170a30]/90 hover:bg-[#1e0e3e] active:bg-[#15092c] border border-violet-500/20 hover:border-violet-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 cursor-pointer flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:text-white group-hover:bg-violet-600/30 transition-all shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Cargar fichas
                </h3>
                <p className="text-[11px] text-violet-300/60">
                  Contactá a soporte para recargar tu cuenta
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-violet-400/70 group-hover:text-violet-300 transition-colors">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Acceso 2: Retirar fichas */}
          <button
            onClick={() => onOpenChat('retirar')}
            className="w-full p-3.5 rounded-2xl bg-[#170a30]/90 hover:bg-[#1e0e3e] active:bg-[#15092c] border border-violet-500/20 hover:border-violet-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 cursor-pointer flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:text-white group-hover:bg-violet-600/30 transition-all shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Retirar fichas
                </h3>
                <p className="text-[11px] text-violet-300/60">
                  Solicitá tus retiros mediante atención oficial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-violet-400/70 group-hover:text-violet-300 transition-colors">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </main>

      {/* Bottom spacer for padding before navigation */}
      <div className="h-2" />
    </div>
  );
};
