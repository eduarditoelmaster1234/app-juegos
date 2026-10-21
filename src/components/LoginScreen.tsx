import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Fingerprint, CheckCircle2, X } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [username, setUsername] = useState('Eduardo');
  const [password, setPassword] = useState('ganamos2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Biometric state
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'scanning' | 'success'>('scanning');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Por favor ingresá tu usuario');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Por favor ingresá tu contraseña');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    // Smooth login transition
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(username.trim());
    }, 350);
  };

  const handleStartBiometric = () => {
    setErrorMessage('');
    setShowBiometricModal(true);
    setBiometricStatus('scanning');

    // Simulate scanning duration then success
    setTimeout(() => {
      setBiometricStatus('success');
      setTimeout(() => {
        setShowBiometricModal(false);
        onLoginSuccess(username.trim() || 'Eduardo');
      }, 700);
    }, 1200);
  };

  const handleCancelBiometric = () => {
    setShowBiometricModal(false);
    setBiometricStatus('scanning');
  };

  return (
    <div className="relative flex flex-col justify-between min-h-full w-full px-6 py-8 overflow-y-auto bg-gradient-to-b from-[#0e0422] via-[#090217] to-[#05010d]">
      {/* Subtle ambient lighting */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-700/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top spacing / status bar clearance */}
      <div className="w-full pt-4" />

      {/* Center content */}
      <div className="relative z-10 w-full max-w-sm mx-auto my-auto flex flex-col items-center">
        {/* Brand Logo Lockup */}
        <div className="mb-6">
          <GanamosLogo size="xl" showSubtitle={true} />
        </div>

        {/* Welcome message */}
        <div className="text-center mb-7">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-violet-300/70 mt-1">
            Ingresá a tu cuenta para jugar
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-violet-200/80 pl-1 block">
              Usuario
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-violet-400/70 pointer-events-none">
                <User className="w-5 h-5" />
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
                className="w-full h-12 pl-11 pr-4 bg-[#170a30]/80 hover:bg-[#1b0c38] focus:bg-[#1d0e3d] text-white placeholder-violet-300/40 text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-violet-200/80 pl-1 block">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-violet-400/70 pointer-events-none">
                <Lock className="w-5 h-5" />
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
                className="w-full h-12 pl-11 pr-11 bg-[#170a30]/80 hover:bg-[#1b0c38] focus:bg-[#1d0e3d] text-white placeholder-violet-300/40 text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-violet-400/70 hover:text-violet-200 p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Primary Submit Button: Ingresar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || showBiometricModal}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(139,92,246,0.35)] hover:shadow-[0_6px_28px_rgba(139,92,246,0.45)] active:scale-[0.98] transition-all cursor-pointer border border-violet-400/30 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Separator / O */}
        <div className="w-full flex items-center my-4">
          <div className="flex-1 h-px bg-violet-900/30" />
          <span className="px-3 text-[11px] font-semibold text-violet-400/50 uppercase tracking-wider">
            o
          </span>
          <div className="flex-1 h-px bg-violet-900/30" />
        </div>

        {/* Biometric Quick Login Button */}
        <button
          type="button"
          onClick={handleStartBiometric}
          disabled={isLoading || showBiometricModal}
          className="w-full h-12 rounded-xl bg-[#170a30]/90 hover:bg-[#1e0e3e] active:bg-[#15092c] border border-violet-500/25 hover:border-violet-400/40 text-violet-200 hover:text-white flex items-center justify-center gap-2.5 text-xs font-bold tracking-wide transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)] cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-lg bg-violet-600/20 border border-violet-400/30 flex items-center justify-center text-violet-400 group-hover:text-violet-200 group-hover:scale-105 transition-all">
            <Fingerprint className="w-4 h-4" />
          </div>
          <span>Acceso Rápido con Biometría</span>
        </button>

        {/* Link: ¿No tenés cuenta? Registrate */}
        <div className="text-center pt-5">
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="text-xs font-semibold text-violet-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-violet-900/30 cursor-pointer"
          >
            ¿No tenés cuenta?{' '}
            <span className="text-violet-400 underline underline-offset-4 font-bold">
              Registrate
            </span>
          </button>
        </div>
      </div>

      {/* Biometric Scanning Modal / Overlay */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xs p-6 rounded-3xl bg-gradient-to-b from-[#1c0c38] to-[#120625] border border-violet-500/40 shadow-[0_0_60px_rgba(139,92,246,0.4)] flex flex-col items-center text-center">
            {/* Close button */}
            <button
              onClick={handleCancelBiometric}
              className="absolute top-4 right-4 p-1 text-violet-400/70 hover:text-white rounded-full transition-colors cursor-pointer"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scanning Animation Icon */}
            <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-violet-400/30 animate-ping opacity-30" />
              <div className="absolute inset-1 rounded-full border border-violet-500/40" />

              {/* Glowing background */}
              <div className="w-16 h-16 rounded-2xl bg-violet-600/25 border border-violet-400/40 flex items-center justify-center text-violet-300 shadow-inner">
                {biometricStatus === 'scanning' ? (
                  <Fingerprint className="w-9 h-9 text-violet-300 animate-pulse drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]" />
                ) : (
                  <CheckCircle2 className="w-9 h-9 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                )}
              </div>
            </div>

            {/* Modal Title & Status */}
            <h3 className="text-base font-bold text-white tracking-tight">
              {biometricStatus === 'scanning'
                ? 'Autenticación Biométrica'
                : 'Identidad Verificada'}
            </h3>

            <p className="text-xs text-violet-300/70 mt-1 mb-6 leading-relaxed">
              {biometricStatus === 'scanning'
                ? 'Colocá tu huella digital o mirá a la cámara para ingresar'
                : `¡Bienvenido de nuevo, ${username || 'Eduardo'}!`}
            </p>

            {/* Cancel Button */}
            {biometricStatus === 'scanning' && (
              <button
                type="button"
                onClick={handleCancelBiometric}
                className="py-2 px-5 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 border border-violet-500/20 text-xs font-semibold text-violet-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <div className="relative z-10 text-center py-2 text-[11px] text-violet-400/40">
        GANAMOS © {new Date().getFullYear()} · Todos los derechos reservados
      </div>
    </div>
  );
};
