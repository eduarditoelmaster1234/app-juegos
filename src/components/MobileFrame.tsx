import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState('18:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#06010d] flex flex-col items-center justify-center overflow-x-hidden selection:bg-violet-600 selection:text-white">
      {/* Immersive background aura */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-900/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/15 rounded-full blur-[140px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(168, 85, 247, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Viewport Mode Toggle for Desktop preview */}
      <div className="hidden lg:flex fixed top-4 right-5 z-50 items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/70 border border-violet-500/30 backdrop-blur-md shadow-lg text-xs font-semibold text-violet-200">
        <Smartphone className="w-3.5 h-3.5 text-violet-400" />
        <span>{isExpanded ? 'Modo Expandido' : 'Modo Móvil'}</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 p-1 hover:text-white transition-colors cursor-pointer"
          title={isExpanded ? 'Ver marco de celular' : 'Expandir pantalla'}
        >
          {isExpanded ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Main Container / Mobile Device Frame */}
      <div
        className={`relative z-10 w-full transition-all duration-300 flex flex-col ${
          isExpanded
            ? 'h-screen max-w-none'
            : 'h-screen sm:h-[844px] sm:max-w-[400px] sm:my-auto sm:rounded-[44px] sm:border-[8px] sm:border-[#1e0e38] sm:shadow-[0_20px_70px_rgba(109,40,217,0.35),0_0_0_1px_rgba(168,85,247,0.25)]'
        } overflow-hidden bg-[#070110]`}
      >
        {/* Simulated Mobile Status Bar (Visible on mobile and in mobile frame mode) */}
        {!isExpanded && (
          <div className="shrink-0 h-11 px-6 flex items-center justify-between text-xs text-violet-200/80 bg-[#0e0422] select-none z-30 border-b border-violet-950/40">
            <span className="font-semibold tracking-tight text-[13px]">
              {currentTime}
            </span>

            {/* Dynamic Island / Notch shape for desktop frame */}
            <div className="hidden sm:block w-24 h-4 bg-[#070110] rounded-full mx-auto border border-violet-900/30" />

            <div className="flex items-center gap-1.5 text-violet-300">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Screen Viewport Content */}
        <div className="relative flex-1 w-full h-full flex flex-col overflow-hidden">
          {children}
        </div>

        {/* Mobile Home Indicator bar */}
        {!isExpanded && (
          <div className="shrink-0 h-4 bg-[#070110] flex items-center justify-center pb-1">
            <div className="w-32 h-1 bg-violet-400/30 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
