import React from 'react';
import { Home, MessageCircle } from 'lucide-react';

interface BottomNavProps {
  currentScreen: 'home' | 'chat';
  onNavigate: (screen: 'home' | 'chat') => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  unreadCount = 0,
}) => {
  return (
    <nav
      aria-label="Navegación principal"
      className="shrink-0 w-full bg-[#0d051e]/90 backdrop-blur-xl border-t border-purple-900/40 px-6 py-2 pb-5 z-30 transition-all select-none"
    >
      <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
        {/* Tab 1: Inicio */}
        <button
          onClick={() => onNavigate('home')}
          className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200 cursor-pointer min-h-[48px] ${
            currentScreen === 'home'
              ? 'text-white'
              : 'text-violet-300/50 hover:text-violet-200 hover:bg-violet-950/20'
          }`}
        >
          {currentScreen === 'home' && (
            <div className="absolute inset-0 bg-violet-600/15 rounded-2xl border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]" />
          )}
          <Home
            className={`w-6 h-6 transition-transform duration-200 relative ${
              currentScreen === 'home'
                ? 'text-violet-400 scale-110'
                : 'text-violet-300/50'
            }`}
            strokeWidth={currentScreen === 'home' ? 2.5 : 2}
          />
          <span
            className={`text-xs mt-1 font-semibold tracking-wide relative ${
              currentScreen === 'home' ? 'text-violet-200' : 'text-violet-300/60'
            }`}
          >
            Inicio
          </span>
        </button>

        {/* Tab 2: Chat */}
        <button
          onClick={() => onNavigate('chat')}
          className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200 cursor-pointer min-h-[48px] ${
            currentScreen === 'chat'
              ? 'text-white'
              : 'text-violet-300/50 hover:text-violet-200 hover:bg-violet-950/20'
          }`}
        >
          {currentScreen === 'chat' && (
            <div className="absolute inset-0 bg-violet-600/15 rounded-2xl border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]" />
          )}
          <div className="relative">
            <MessageCircle
              className={`w-6 h-6 transition-transform duration-200 ${
                currentScreen === 'chat'
                  ? 'text-violet-400 scale-110'
                  : 'text-violet-300/50'
              }`}
              strokeWidth={currentScreen === 'chat' ? 2.5 : 2}
            />
            {unreadCount > 0 && currentScreen !== 'chat' && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md shadow-violet-600/50">
                {unreadCount}
              </span>
            )}
          </div>
          <span
            className={`text-xs mt-1 font-semibold tracking-wide relative ${
              currentScreen === 'chat' ? 'text-violet-200' : 'text-violet-300/60'
            }`}
          >
            Chat
          </span>
        </button>
      </div>
    </nav>
  );
};
