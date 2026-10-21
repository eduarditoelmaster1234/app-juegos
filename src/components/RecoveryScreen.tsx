import React, { useState } from 'react';
import { ArrowLeft, User, Phone, KeyRound, CheckCircle2, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';

interface RecoveryScreenProps {
  onNavigateToLogin: () => void;
}

type RecoveryStep = 'select' | 'username_form' | 'password_form' | 'username_success' | 'password_success';

export const RecoveryScreen: React.FC<RecoveryScreenProps> = ({ onNavigateToLogin }) => {
  const [step, setStep] = useState<RecoveryStep>('select');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Submit for recovering username
  const handleRecoverUsername = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      setErrorMessage('Por favor ingresá tu número de teléfono registrado');
      return;
    }
    if (phoneDigits.length < 6) {
      setErrorMessage('Ingresá un número de teléfono válido (mínimo 6 dígitos)');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep('username_success');
    }, 400);
  };

  // Submit for recovering password
  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Por favor ingresá tu usuario o número de teléfono registrado');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep('password_success');
    }, 400);
  };

  const handleBack = () => {
    if (step === 'select') {
      onNavigateToLogin();
    } else {
      setErrorMessage('');
      setStep('select');
    }
  };

  return (
    <div className="relative flex flex-col justify-between min-h-full w-full px-5 py-5 overflow-y-auto bg-gradient-to-b from-[#0a0316] via-[#07020f] to-[#04010a]">
      {/* Controlled, soft ambient violet glow */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between w-full pt-1 pb-2">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 text-violet-300 hover:text-white rounded-full hover:bg-violet-900/20 transition-colors cursor-pointer"
          aria-label="Volver"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <GanamosLogo size="sm" showSubtitle={false} />

        <div className="w-6" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-[340px] mx-auto my-auto flex flex-col">
        {/* Header Title & Intro */}
        <div className="text-center mb-5">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Recuperar acceso
          </h1>
          <p className="text-xs text-violet-300/60 mt-1 leading-relaxed">
            {step === 'select'
              ? '¿Tenés problemas para ingresar? Seleccioná qué dato necesitás recuperar y te ayudaremos a recuperar el acceso a tu cuenta.'
              : step === 'username_form'
              ? 'Ingresá tu teléfono para solicitar la verificación de tu nombre de usuario.'
              : step === 'password_form'
              ? 'Ingresá tu usuario o teléfono para gestionar el restablecimiento de tu contraseña.'
              : 'Instrucciones para completar la recuperación de tu cuenta.'}
          </p>
        </div>

        {/* STEP 1: SELECT OPTION */}
        {step === 'select' && (
          <div className="space-y-3">
            {/* Option A: Olvidé mi usuario */}
            <button
              onClick={() => {
                setErrorMessage('');
                setStep('username_form');
              }}
              className="w-full p-4 rounded-2xl bg-[#130726]/90 hover:bg-[#190a33] active:bg-[#100520] border border-violet-500/20 hover:border-violet-400/40 shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-3.5 text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:text-white group-hover:bg-violet-600/30 transition-all shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Olvidé mi usuario
                </h2>
                <p className="text-[11px] text-violet-300/60 mt-0.5">
                  Recuperá tu usuario con tu teléfono registrado
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-400/60 group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Option B: Olvidé mi contraseña */}
            <button
              onClick={() => {
                setErrorMessage('');
                setStep('password_form');
              }}
              className="w-full p-4 rounded-2xl bg-[#130726]/90 hover:bg-[#190a33] active:bg-[#100520] border border-violet-500/20 hover:border-violet-400/40 shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-3.5 text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:text-white group-hover:bg-violet-600/30 transition-all shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Olvidé mi contraseña
                </h2>
                <p className="text-[11px] text-violet-300/60 mt-0.5">
                  Gestioná el cambio seguro de tu clave de acceso
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-400/60 group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        )}

        {/* STEP 2A: USERNAME RECOVERY FORM */}
        {step === 'username_form' && (
          <form onSubmit={handleRecoverUsername} className="space-y-3.5">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
                Número de teléfono registrado *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-violet-400/60 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="+54 9 11 2345-6789"
                  autoComplete="tel"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs sm:text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
                />
              </div>
              <p className="text-[10px] text-violet-400/60 pl-1 pt-0.5">
                Por seguridad, los datos son verificados manualmente por administración.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] active:scale-[0.98] transition-all cursor-pointer border border-violet-400/30 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Solicitar recuperación</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2B: PASSWORD RECOVERY FORM */}
        {step === 'password_form' && (
          <form onSubmit={handleRecoverPassword} className="space-y-3.5">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
                Usuario o teléfono registrado *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-violet-400/60 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Tu nombre de usuario o teléfono"
                  autoComplete="username"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs sm:text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
                />
              </div>
              <p className="text-[10px] text-violet-400/60 pl-1 pt-0.5">
                Identificá tu cuenta para iniciar el protocolo de restablecimiento.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] active:scale-[0.98] transition-all cursor-pointer border border-violet-400/30 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Solicitar recuperación</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* SUCCESS STATE A: USERNAME RECOVERY PREPARED */}
        {step === 'username_success' && (
          <div className="p-5 rounded-2xl bg-[#140827] border border-violet-500/25 text-center space-y-3.5 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-400/30 text-violet-300 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-violet-400" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">
                Solicitud registrada
              </h2>
              <p className="text-xs text-violet-300/70 mt-1.5 leading-relaxed">
                El administrador de GANAMOS verificará los datos registrados de tu teléfono y te asistirá para recuperar el acceso a tu cuenta.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-800/30 text-[11px] text-violet-300/80 text-left space-y-1">
              <div className="font-semibold text-white">Próximo paso:</div>
              <div>• Aguardá la confirmación del administrador o comunicate por los canales oficiales con tu número registrado.</div>
            </div>

            <button
              onClick={onNavigateToLogin}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(124,58,237,0.25)] cursor-pointer active:scale-[0.98] transition-transform"
            >
              <span>Volver a Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SUCCESS STATE B: PASSWORD RECOVERY PREPARED */}
        {step === 'password_success' && (
          <div className="p-5 rounded-2xl bg-[#140827] border border-violet-500/25 text-center space-y-3.5 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-400/30 text-violet-300 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-violet-400" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">
                Solicitud preparada
              </h2>
              <p className="text-xs text-violet-300/70 mt-1.5 leading-relaxed">
                Tu solicitud de recuperación fue preparada. Seguí las instrucciones de atención para verificar tu identidad y recuperar el acceso.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-800/30 text-[11px] text-violet-300/80 text-left space-y-1">
              <div className="font-semibold text-white">Nota de seguridad:</div>
              <div>• El restablecimiento definitivo se coordina tras validar la titularidad de tu cuenta con el equipo de atención.</div>
            </div>

            <button
              onClick={onNavigateToLogin}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(124,58,237,0.25)] cursor-pointer active:scale-[0.98] transition-transform"
            >
              <span>Volver a Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Return to login link (only visible on non-success steps) */}
        {(step === 'select' || step === 'username_form' || step === 'password_form') && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-xs font-medium text-violet-300/80 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-violet-900/20 cursor-pointer"
            >
              ¿Recordaste tus datos?{' '}
              <span className="text-violet-400 underline underline-offset-4 font-semibold hover:text-violet-300">
                Iniciá sesión
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2 text-[10px] text-violet-400/35">
        GANAMOS © {new Date().getFullYear()} · Recuperación de Cuenta
      </footer>
    </div>
  );
};
