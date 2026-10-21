import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';
import { useSafeTimeout } from '../hooks/useSafeTimeout';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToRecovery: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToRecovery,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scheduleTimeout = useSafeTimeout();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Por favor, ingresá tu nombre de usuario.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Por favor, ingresá tu contraseña.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    scheduleTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(username.trim());
    }, 300);
  };

  return (
    <div className="relative flex flex-col justify-between min-h-full w-full px-4 sm:px-5 py-5 sm:py-6 overflow-y-auto bg-gradient-to-b from-[#0a0316] via-[#07020f] to-[#04010a]">
      {/* Subtle controlled ambient lighting */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-60 h-60 bg-purple-900/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top spacer */}
      <div className="w-full pt-1 shrink-0" />

      {/* Center content container */}
      <div className="relative z-10 w-full max-w-[340px] mx-auto my-auto flex flex-col items-center py-2">
        {/* Brand Logo Lockup */}
        <div className="mb-4 sm:mb-5">
          <GanamosLogo size="lg" showSubtitle={true} />
        </div>

        {/* Title & subtitle */}
        <div className="text-center mb-5 sm:mb-6 space-y-1">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Iniciar sesión
          </h1>
          <p className="text-xs text-violet-300/60">
            Ingresá tus credenciales para acceder
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs text-center font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
              Usuario
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-violet-400/60 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Nombre de usuario"
                autoComplete="username"
                className="w-full h-11 pl-10 pr-3.5 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs sm:text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-violet-400/60 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-10 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs sm:text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1.5 w-9 h-9 flex items-center justify-center text-violet-400/60 hover:text-violet-200 rounded-lg cursor-pointer transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot credentials link */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={onNavigateToRecovery}
              className="text-[11px] font-medium text-violet-300/70 hover:text-violet-200 transition-colors py-0.5 cursor-pointer hover:underline underline-offset-4"
            >
              ¿Olvidaste tu usuario o contraseña?
            </button>
          </div>

          {/* Primary Submit Button: INGRESAR */}
          <div className="pt-1.5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] active:scale-[0.98] transition-all cursor-pointer border border-violet-400/30 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>INGRESAR</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Secondary Register Link */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="text-xs font-medium text-violet-300/80 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-violet-900/20 cursor-pointer"
          >
            ¿No tenés cuenta?{' '}
            <span className="text-violet-400 underline underline-offset-4 font-semibold hover:text-violet-300">
              Registrate
            </span>
          </button>
        </div>
      </div>

      {/* Clean footer */}
      <div className="relative z-10 text-center py-2 text-[10px] text-violet-400/35 shrink-0">
        GANAMOS © {new Date().getFullYear()} · Acceso oficial
      </div>
    </div>
  );
};
