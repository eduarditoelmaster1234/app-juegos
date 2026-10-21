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
    <div className="relative min-h-screen w-full bg-[#05010a] flex flex-col items-center justify-center overflow-x-hidden selection:bg-violet-600 selection:text-white">
      {/* Soft, controlled ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-violet-950/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-purple-950/20 rounded-full blur-[120px]" />
        {/* Very subtle hairline grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Viewport Mode Toggle for Desktop preview */}
      <div className="hidden lg:flex fixed top-4 right-5 z-50 items-center gap-2 px-3 py-1.5 rounded-full bg-[#120524]/85 border border-violet-500/20 backdrop-blur-md shadow-md text-xs font-semibold text-violet-200">
        <Smartphone className="w-3.5 h-3.5 text-violet-400" />
        <span>{isExpanded ? 'Modo Expandido' : 'Modo Móvil'}</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 p-0.5 hover:text-white transition-colors cursor-pointer"
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
            : 'h-screen sm:h-[844px] sm:max-w-[390px] sm:my-auto sm:rounded-[40px] sm:border-[6px] sm:border-[#16082c] sm:shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(139,92,246,0.18)]'
        } overflow-hidden bg-[#06010d]`}
      >
        {/* Status Bar */}
        {!isExpanded && (
          <div className="shrink-0 h-10 px-5 flex items-center justify-between text-xs text-violet-200/75 bg-[#0a0316] select-none z-30 border-b border-violet-950/50">
            <span className="font-semibold tracking-tight text-[12px] tabular-nums">
              {currentTime}
            </span>

            {/* Dynamic Island / Notch shape for desktop preview */}
            <div className="hidden sm:block w-20 h-3.5 bg-[#06010d] rounded-full mx-auto border border-violet-900/30" />

            <div className="flex items-center gap-1.5 text-violet-300/80">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Screen Viewport Content */}
        <div className="relative flex-1 w-full h-full flex flex-col overflow-hidden">
          {children}
        </div>

        {/* Home Indicator bar */}
        {!isExpanded && (
          <div className="shrink-0 h-3.5 bg-[#06010d] flex items-center justify-center pb-0.5">
            <div className="w-28 h-1 bg-violet-400/25 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
