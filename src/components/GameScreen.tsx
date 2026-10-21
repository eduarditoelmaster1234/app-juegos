import React, { useState } from 'react';
import { ArrowLeft, RotateCw, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';

interface GameScreenProps {
  onBackToHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToHome }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelperBanner, setShowHelperBanner] = useState(true);

  const GAME_URL = 'https://ganamosbet.org/';

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-[#070110] overflow-hidden select-none">
      {/* Game Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-3 py-2.5 bg-[#120625] border-b border-violet-900/40 shrink-0">
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 active:bg-violet-800 text-violet-200 hover:text-white border border-violet-500/20 text-xs font-bold transition-all cursor-pointer min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </button>

        {/* Center Logo */}
        <div className="flex items-center gap-1.5">
          <GanamosLogo size="sm" showSubtitle={false} />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleReload}
            title="Recargar juego"
            className="p-2 rounded-xl text-violet-300 hover:text-white hover:bg-violet-900/40 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href={GAME_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en ventana externa"
            className="p-2 rounded-xl text-violet-300 hover:text-white hover:bg-violet-900/40 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Helper notice if framed site is restricted by security headers */}
      {showHelperBanner && (
        <div className="relative z-10 px-3 py-1.5 bg-violet-950/90 border-b border-violet-800/40 flex items-center justify-between text-[11px] text-violet-200">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="truncate">
              Conexión directa con ganamosbet.org
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-violet-300 hover:text-white"
            >
              Abrir directo
            </a>
            <button
              onClick={() => setShowHelperBanner(false)}
              className="text-violet-400 hover:text-violet-200 px-1 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Container for Game Iframe */}
      <div className="relative flex-1 w-full h-full bg-[#090217]">
        {/* Loading Spinner Screen */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090217] space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-violet-900/50 border-t-violet-400 animate-spin" />
              <div className="absolute w-8 h-8 rounded-full bg-violet-600/30 blur-sm" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-white tracking-wide">
                Cargando GANAMOS...
              </p>
              <p className="text-xs text-violet-400/60">
                Estableciendo conexión segura
              </p>
            </div>
          </div>
        )}

        {/* The Game Iframe */}
        <iframe
          key={iframeKey}
          src={GAME_URL}
          title="GanamosBet Juego"
          onLoad={() => setIsLoading(false)}
          allow="fullscreen; autoplay; clipboard-write; encrypted-media"
          className="w-full h-full border-0 bg-transparent"
        />

        {/* Fallback helper bottom card if external site blocks iframe */}
        <div className="absolute bottom-3 inset-x-3 z-10 p-3 rounded-xl bg-[#14062c]/90 backdrop-blur-md border border-violet-500/20 shadow-lg flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-violet-400 shrink-0" />
            <div className="text-[11px] text-violet-200/90 leading-tight">
              ¿Problemas de visualización en el navegador?
            </div>
          </div>
          <a
            href={GAME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 px-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold tracking-wide transition-colors shrink-0"
          >
            Abrir GanamosBet
          </a>
        </div>
      </div>
    </div>
  );
};
