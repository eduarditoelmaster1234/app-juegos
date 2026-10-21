import React from 'react';
import { ArrowLeft, User, Phone, LogOut, ShieldCheck } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';

export interface UserProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  username: string;
}

interface ProfileScreenProps {
  profile: UserProfileData;
  onBackToHome: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onBackToHome,
  onLogout,
}) => {
  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || profile.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative flex flex-col justify-between min-h-full w-full px-4 sm:px-5 py-3 overflow-y-auto bg-gradient-to-b from-[#0a0316] via-[#07020f] to-[#04010a]">
      {/* Controlled, soft ambient violet glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Header - Standardized 56px height */}
      <header className="relative z-10 flex items-center justify-between w-full h-14 shrink-0 border-b border-violet-950/60 pb-1">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-1.5 h-9 px-2.5 -ml-1 text-violet-300 hover:text-white rounded-xl hover:bg-violet-900/20 active:scale-95 transition-all cursor-pointer"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">Inicio</span>
        </button>

        <h1 className="text-xs font-bold text-white tracking-wider uppercase">
          Mi perfil
        </h1>

        <GanamosLogo size="sm" showSubtitle={false} />
      </header>

      {/* Main Profile Info */}
      <main className="relative z-10 flex flex-col items-center flex-1 my-auto w-full max-w-[340px] sm:max-w-[350px] mx-auto py-4 space-y-4">
        {/* User Avatar & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 border-2 border-violet-400/35 shadow-[0_4px_20px_rgba(139,92,246,0.3)] flex items-center justify-center text-white text-xl font-black tracking-wider">
              {getInitials()}
            </div>
            <div
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#07020f] flex items-center justify-center text-white shadow-sm"
              title="Cuenta activa"
            >
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-xs font-semibold text-violet-400">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* User Details List */}
        <div className="w-full space-y-2.5">
          {/* Nombre */}
          <div className="p-3.5 rounded-2xl bg-[#130726]/90 border border-violet-500/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-violet-300/60 block leading-tight">
                  Nombre
                </span>
                <span className="text-xs sm:text-sm font-bold text-white block leading-tight">
                  {profile.firstName}
                </span>
              </div>
            </div>
          </div>

          {/* Apellido */}
          <div className="p-3.5 rounded-2xl bg-[#130726]/90 border border-violet-500/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-violet-300/60 block leading-tight">
                  Apellido
                </span>
                <span className="text-xs sm:text-sm font-bold text-white block leading-tight">
                  {profile.lastName}
                </span>
              </div>
            </div>
          </div>

          {/* Teléfono */}
          <div className="p-3.5 rounded-2xl bg-[#130726]/90 border border-violet-500/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-violet-300/60 block leading-tight">
                  Número de teléfono
                </span>
                <span className="text-xs sm:text-sm font-bold text-white tabular-nums block leading-tight">
                  {profile.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Usuario */}
          <div className="p-3.5 rounded-2xl bg-[#130726]/90 border border-violet-500/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-violet-300/60 block leading-tight">
                  Usuario de acceso
                </span>
                <span className="text-xs sm:text-sm font-bold text-white block leading-tight">
                  {profile.username}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action: Cerrar sesión */}
        <div className="w-full pt-1.5">
          <button
            type="button"
            onClick={onLogout}
            className="w-full h-11 sm:h-12 rounded-xl bg-red-950/30 hover:bg-red-950/50 active:bg-red-950/70 text-red-200 hover:text-white border border-red-500/30 hover:border-red-400/40 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.985]"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2 text-[10px] text-violet-400/35 shrink-0">
        GANAMOS · Cuenta oficial
      </footer>
    </div>
  );
};
