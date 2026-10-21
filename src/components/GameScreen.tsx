import React, { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AlertCircle, ArrowLeft, RotateCw } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';
import { GameBrowser } from '../lib/gameBrowser';

interface GameScreenProps {
  onBackToHome: () => void;
  gameUrl?: string;
  gameTitle?: string;
}

type NativeStatus = 'opening' | 'error';

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const friendlyPluginError = (message: string) => {
  if (message.includes('HTTPS')) {
    return 'La dirección de esta plataforma no es segura y no se puede abrir.';
  }
  if (message.toLowerCase().includes('abierta')) {
    return 'Ya hay una plataforma abierta. Cerrá el juego actual e intentá de nuevo.';
  }
  return 'No pudimos abrir la plataforma dentro de la app. Intentá de nuevo.';
};

export const GameScreen: React.FC<GameScreenProps> = ({
  onBackToHome,
  gameUrl = 'https://ganamosbet.plus/',
  gameTitle = 'GanamosBet',
}) => {
  const isNative = Capacitor.isNativePlatform();
  const domain = getDomain(gameUrl);

  const [nativeStatus, setNativeStatus] = useState<NativeStatus>('opening');
  const [nativeError, setNativeError] = useState('');
  const [frameLoading, setFrameLoading] = useState(true);
  const [frameKey, setFrameKey] = useState(0);

  const startedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const openNativeBrowser = async () => {
    setNativeStatus('opening');
    setNativeError('');

    try {
      await GameBrowser.open({ url: gameUrl, title: gameTitle });
      if (mountedRef.current) {
        onBackToHome();
      }
    } catch (error) {
      if (!mountedRef.current) return;
      const rawMessage = error instanceof Error ? error.message : String(error);
      console.error('No se pudo abrir la plataforma:', rawMessage);
      setNativeError(friendlyPluginError(rawMessage));
      setNativeStatus('error');
    }
  };

  useEffect(() => {
    if (!isNative || startedRef.current) return;
    startedRef.current = true;
    void openNativeBrowser();
    // El efecto solo debe dispararse una vez por apertura de pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNative]);

  const reloadFrame = () => {
    setFrameLoading(true);
    setFrameKey((previous) => previous + 1);
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-[#05010a] overflow-hidden select-none">
      <header className="relative z-20 flex items-center justify-between px-3.5 sm:px-4 h-14 bg-[#0c041c] border-b border-violet-950/70 shrink-0">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-violet-950/50 hover:bg-violet-900/50 active:bg-violet-800 text-violet-200 hover:text-white border border-violet-500/20 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-[180px]">
          <GanamosLogo size="sm" showSubtitle={false} />
          <span className="text-xs font-bold text-violet-200 truncate hidden sm:inline">
            · {gameTitle}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!isNative && (
            <button
              type="button"
              onClick={reloadFrame}
              aria-label="Recargar plataforma"
              title="Recargar plataforma"
              className="w-9 h-9 rounded-xl text-violet-300 hover:text-white hover:bg-violet-900/30 transition-colors cursor-pointer flex items-center justify-center"
            >
              <RotateCw className={`w-3.5 h-3.5 ${frameLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </header>

      {isNative ? (
        <div className="relative flex-1 w-full flex items-center justify-center px-5 py-8 bg-gradient-to-b from-[#0a0316] via-[#07020f] to-[#04010a]">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

          {nativeStatus === 'opening' ? (
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-[3px] border-violet-900/40 border-t-violet-400 animate-spin" />
                <div className="absolute w-7 h-7 rounded-full bg-violet-600/20 blur-sm" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white tracking-wide">
                  Preparando {gameTitle}
                </p>
                <p className="text-[11px] text-violet-400/70 font-mono">{domain}</p>
              </div>
              <p className="text-[10.5px] text-violet-300/40">
                La plataforma se abre dentro de GANAMOS
              </p>
            </div>
          ) : (
            <div className="relative z-10 w-full max-w-[340px] p-5 rounded-2xl bg-[#140827] border border-violet-500/25 text-center space-y-4 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-400/25 text-red-300 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white">
                  No se pudo abrir la plataforma
                </h2>
                <p className="text-xs text-violet-300/65 leading-relaxed">{nativeError}</p>
                <p className="text-[10px] text-violet-400/45 font-mono pt-1">{domain}</p>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => void openNativeBrowser()}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]"
                >
                  Reintentar
                </button>
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="w-full h-10 rounded-xl bg-violet-950/40 hover:bg-violet-900/40 text-violet-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Volver a GANAMOS
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex-1 w-full h-full bg-[#06010d]">
          {frameLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070210] space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-[3px] border-violet-900/40 border-t-violet-400 animate-spin" />
              </div>
              <div className="text-center space-y-0.5 px-4">
                <p className="text-xs font-bold text-white tracking-wide">
                  Cargando {gameTitle}...
                </p>
                <p className="text-[11px] text-violet-400/60 font-mono">{domain}</p>
              </div>
            </div>
          )}

          <iframe
            key={frameKey}
            src={gameUrl}
            title={`${gameTitle} — Plataforma oficial`}
            onLoad={() => setFrameLoading(false)}
            allow="fullscreen; autoplay; clipboard-write; encrypted-media; gamepad"
            className="w-full h-full border-0 bg-transparent"
          />
        </div>
      )}
    </div>
  );
};
