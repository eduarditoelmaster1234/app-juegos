import React from 'react';

interface GanamosLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const GanamosLogo: React.FC<GanamosLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-lg tracking-wider',
    md: 'text-2xl tracking-widest',
    lg: 'text-3xl tracking-[0.2em]',
    xl: 'text-4xl tracking-[0.25em]',
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Brand Icon & Wordmark Lockup */}
      <div className="flex items-center gap-2.5">
        {/* Stylized Violet Crown Emblem */}
        <div
          className={`${iconSizes[size]} relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800 shadow-[0_0_24px_rgba(139,92,246,0.45)] border border-violet-400/30 shrink-0`}
        >
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/25 pointer-events-none" />

          {/* Crown SVG */}
          <svg
            className="w-3/5 h-3/5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 19h20" />
            <path d="M4 19l1-12 5 6 4-9 4 9 5-6 1 12H4z" fill="currentColor" fillOpacity="0.25" />
            <circle cx="5" cy="7" r="1.5" fill="currentColor" />
            <circle cx="10" cy="13" r="1.5" fill="currentColor" />
            <circle cx="14" cy="4" r="1.5" fill="currentColor" />
            <circle cx="18" cy="13" r="1.5" fill="currentColor" />
            <circle cx="23" cy="7" r="1.5" fill="currentColor" />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col">
          <span
            className={`${textSizes[size]} font-extrabold uppercase bg-gradient-to-r from-white via-purple-100 to-violet-300 bg-clip-text text-transparent drop-shadow-sm font-sans leading-none`}
          >
            GANAMOS
          </span>
          {showSubtitle && (
            <span className="text-[10px] tracking-[0.3em] font-semibold text-violet-400 uppercase mt-1 text-center">
              Oficial
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
