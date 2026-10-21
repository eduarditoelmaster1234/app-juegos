import React from 'react';
import { ArrowLeft, User, Phone, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';
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
  // Get initials for the avatar
  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || profile.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative flex flex-col justify-between min-h-full w-full px-6 py-5 overflow-y-auto bg-gradient-to-b from-[#0e0422] via-[#090217] to-[#060110]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-700/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between w-full pt-1 pb-4 border-b border-violet-900/30">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 p-2 -ml-2 text-violet-300 hover:text-white rounded-full hover:bg-violet-900/30 transition-colors cursor-pointer"
          aria-label="Volver al Inicio"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-semibold">Inicio</span>
        </button>

        <h1 className="text-sm font-bold text-white tracking-wide uppercase">
          Mi Perfil
        </h1>

        <GanamosLogo size="sm" showSubtitle={false} />
      </header>

      {/* Main Profile Info */}
      <main className="relative z-10 flex flex-col items-center flex-1 my-auto w-full max-w-sm mx-auto py-6 space-y-6">
        {/* User Avatar & Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 border-2 border-violet-400/40 shadow-[0_0_30px_rgba(139,92,246,0.45)] flex items-center justify-center text-white text-2xl font-black tracking-wider">
              {getInitials()}
            </div>
            <div
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#090217] flex items-center justify-center text-white shadow-md"
              title="Cuenta activa"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-xs font-semibold text-violet-400 mt-0.5">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* User Details Cards */}
        <div className="w-full space-y-2.5">
          {/* Nombre */}
          <div className="p-3.5 rounded-2xl bg-[#170a30]/90 border border-violet-500/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-violet-300/60 block">
                  Nombre
                </span>
                <span className="text-sm font-bold text-white">
                  {profile.firstName}
                </span>
              </div>
            </div>
          </div>

          {/* Apellido */}
          <div className="p-3.5 rounded-2xl bg-[#170a30]/90 border border-violet-500/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-violet-300/60 block">
                  Apellido
                </span>
                <span className="text-sm font-bold text-white">
                  {profile.lastName}
                </span>
              </div>
            </div>
          </div>

          {/* Teléfono */}
          <div className="p-3.5 rounded-2xl bg-[#170a30]/90 border border-violet-500/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-violet-300/60 block">
                  Número de teléfono
                </span>
                <span className="text-sm font-bold text-white font-mono tracking-wide">
                  {profile.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Usuario */}
          <div className="p-3.5 rounded-2xl bg-[#170a30]/90 border border-violet-500/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-violet-300/60 block">
                  Usuario de acceso
                </span>
                <span className="text-sm font-bold text-white">
                  {profile.username}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action: Cerrar sesión */}
        <div className="w-full pt-2">
          <button
            onClick={onLogout}
            className="w-full h-12 rounded-xl bg-red-950/30 hover:bg-red-950/50 text-red-200 hover:text-white border border-red-500/30 hover:border-red-400/50 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 text-center py-2 text-[11px] text-violet-400/40">
        GANAMOS · Cuenta Oficial
      </footer>
    </div>
  );
};
