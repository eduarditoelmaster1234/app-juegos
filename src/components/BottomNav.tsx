import React from 'react';
import { Home, Dices, MessageCircle } from 'lucide-react';

export type NavTab = 'home' | 'casinos' | 'chat';

interface BottomNavProps {
  currentScreen: NavTab;
  onNavigate: (screen: NavTab) => void;
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
      className="shrink-0 w-full bg-[#0b0318]/95 backdrop-blur-md border-t border-violet-950/70 px-3 py-1.5 pb-2.5 z-30 transition-all select-none"
    >
      <div className="max-w-[350px] mx-auto grid grid-cols-3 gap-1.5">
        {/* Tab 1: Inicio */}
        <button
          onClick={() => onNavigate('home')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 cursor-pointer min-h-[46px] ${
            currentScreen === 'home'
              ? 'text-white bg-violet-600/15 border border-violet-500/25 shadow-sm'
              : 'text-violet-300/45 hover:text-violet-200 hover:bg-violet-950/20'
          }`}
        >
          <Home
            className={`w-5 h-5 transition-colors ${
              currentScreen === 'home' ? 'text-violet-300' : 'text-violet-400/50'
            }`}
            strokeWidth={currentScreen === 'home' ? 2.4 : 2}
          />
          <span
            className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight ${
              currentScreen === 'home' ? 'font-bold text-violet-100' : 'font-medium text-violet-300/50'
            }`}
          >
            Inicio
          </span>
        </button>

        {/* Tab 2: Casinos */}
        <button
          onClick={() => onNavigate('casinos')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 cursor-pointer min-h-[46px] ${
            currentScreen === 'casinos'
              ? 'text-white bg-violet-600/15 border border-violet-500/25 shadow-sm'
              : 'text-violet-300/45 hover:text-violet-200 hover:bg-violet-950/20'
          }`}
        >
          <Dices
            className={`w-5 h-5 transition-colors ${
              currentScreen === 'casinos' ? 'text-violet-300' : 'text-violet-400/50'
            }`}
            strokeWidth={currentScreen === 'casinos' ? 2.4 : 2}
          />
          <span
            className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight ${
              currentScreen === 'casinos' ? 'font-bold text-violet-100' : 'font-medium text-violet-300/50'
            }`}
          >
            Casinos
          </span>
        </button>

        {/* Tab 3: Chat */}
        <button
          onClick={() => onNavigate('chat')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 cursor-pointer min-h-[46px] ${
            currentScreen === 'chat'
              ? 'text-white bg-violet-600/15 border border-violet-500/25 shadow-sm'
              : 'text-violet-300/45 hover:text-violet-200 hover:bg-violet-950/20'
          }`}
        >
          <div className="relative">
            <MessageCircle
              className={`w-5 h-5 transition-colors ${
                currentScreen === 'chat' ? 'text-violet-300' : 'text-violet-400/50'
              }`}
              strokeWidth={currentScreen === 'chat' ? 2.4 : 2}
            />
            {unreadCount > 0 && currentScreen !== 'chat' && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-violet-500 text-white text-[8px] font-bold flex items-center justify-center shadow">
                {unreadCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight ${
              currentScreen === 'chat' ? 'font-bold text-violet-100' : 'font-medium text-violet-300/50'
            }`}
          >
            Chat
          </span>
        </button>
      </div>
    </nav>
  );
};
