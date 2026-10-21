import React, { useState } from 'react';
import { ArrowLeft, RotateCw, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';

interface GameScreenProps {
  onBackToHome: () => void;
  gameUrl?: string;
  gameTitle?: string;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  onBackToHome,
  gameUrl = 'https://ganamosbet.plus/',
  gameTitle = 'GanamosBet',
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelperBanner, setShowHelperBanner] = useState(true);

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  // Extract clean domain for display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const domain = getDomain(gameUrl);

  return (
    <div className="relative flex flex-col h-full w-full bg-[#05010a] overflow-hidden select-none">
      {/* Game Header Bar - Unified 56px height */}
      <header className="relative z-20 flex items-center justify-between px-3.5 sm:px-4 h-14 bg-[#0c041c] border-b border-violet-950/70 shrink-0">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-violet-950/50 hover:bg-violet-900/50 active:bg-violet-800 text-violet-200 hover:text-white border border-violet-500/20 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        {/* Center Title / Logo */}
        <div className="flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-[180px]">
          <GanamosLogo size="sm" showSubtitle={false} />
          <span className="text-xs font-bold text-violet-200 truncate hidden sm:inline">
            · {gameTitle}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleReload}
            title="Recargar juego"
            className="w-9 h-9 rounded-xl text-violet-300 hover:text-white hover:bg-violet-900/30 transition-colors cursor-pointer flex items-center justify-center"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href={gameUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Abrir ${gameTitle} en ventana externa`}
            className="w-9 h-9 rounded-xl text-violet-300 hover:text-white hover:bg-violet-900/30 transition-colors cursor-pointer flex items-center justify-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Helper notice if framed site is restricted by security headers */}
      {showHelperBanner && (
        <div className="relative z-10 px-3.5 sm:px-4 py-2 bg-[#140628] border-b border-violet-900/40 flex items-center justify-between text-[11px] text-violet-200">
          <div className="flex items-center gap-2 truncate pr-2">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="truncate">
              {gameTitle} — {domain}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-violet-300 hover:text-white"
            >
              Abrir directo
            </a>
            <button
              type="button"
              onClick={() => setShowHelperBanner(false)}
              className="text-violet-400 hover:text-violet-200 px-1 font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Container for Game Iframe */}
      <div className="relative flex-1 w-full h-full bg-[#06010d]">
        {/* Loading Spinner Screen */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070210] space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-3 border-violet-900/40 border-t-violet-400 animate-spin" />
              <div className="absolute w-6 h-6 rounded-full bg-violet-600/20 blur-xs" />
            </div>
            <div className="text-center space-y-0.5 px-4">
              <p className="text-xs font-bold text-white tracking-wide">
                Cargando {gameTitle}...
              </p>
              <p className="text-[11px] text-violet-400/60 font-mono">
                {domain}
              </p>
            </div>
          </div>
        )}

        {/* The Game Iframe */}
        <iframe
          key={iframeKey}
          src={gameUrl}
          title={`${gameTitle} — Plataforma oficial`}
          onLoad={() => setIsLoading(false)}
          allow="fullscreen; autoplay; clipboard-write; encrypted-media"
          className="w-full h-full border-0 bg-transparent"
        />

        {/* Fallback helper bottom card */}
        <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 max-w-[420px] mx-auto z-10 p-3 rounded-2xl bg-[#120524]/95 backdrop-blur-md border border-violet-500/20 shadow-xl flex items-center justify-between gap-2.5 pointer-events-auto">
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            <AlertCircle className="w-4 h-4 text-violet-400 shrink-0" />
            <div className="text-[11px] text-violet-200/90 leading-tight truncate">
              ¿No se visualiza {gameTitle} en el navegador?
            </div>
          </div>
          <a
            href={gameUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold tracking-wide transition-colors shrink-0 flex items-center justify-center"
          >
            Abrir directo
          </a>
        </div>
      </div>
    </div>
  );
};
