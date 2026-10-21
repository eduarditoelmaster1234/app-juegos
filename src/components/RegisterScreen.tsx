import React, { useState } from 'react';
import { User, Lock, Phone, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisteredDemo?: (profile: {
    firstName: string;
    lastName: string;
    phone: string;
    username: string;
  }) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisteredDemo,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory field checks
    if (!formData.firstName.trim()) {
      setErrorMessage('Por favor ingresá tu nombre');
      return;
    }
    if (!formData.lastName.trim()) {
      setErrorMessage('Por favor ingresá tu apellido');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Por favor ingresá tu número de teléfono');
      return;
    }
    // Clean phone validation (at least 6 digits)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 6) {
      setErrorMessage('Ingresá un número de teléfono válido (mínimo 6 dígitos)');
      return;
    }
    if (!formData.username.trim()) {
      setErrorMessage('Por favor elegí un nombre de usuario');
      return;
    }
    if (formData.username.trim().length < 3) {
      setErrorMessage('El usuario debe tener al menos 3 caracteres');
      return;
    }
    if (!formData.password) {
      setErrorMessage('Por favor ingresá una contraseña');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Verificalas.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    // Visual validation completion: ready for backend hookup
    setTimeout(() => {
      setIsLoading(false);
      setValidationSuccess(true);
      if (onRegisteredDemo) {
        onRegisteredDemo({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          username: formData.username.trim(),
        });
      }
    }, 400);
  };

  return (
    <div className="relative flex flex-col justify-between min-h-full w-full px-6 py-6 overflow-y-auto bg-gradient-to-b from-[#0e0422] via-[#090217] to-[#05010d]">
      {/* Subtle ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Top bar with back button */}
      <div className="relative z-10 flex items-center justify-between w-full pt-2 mb-3">
        <button
          onClick={onNavigateToLogin}
          className="p-2 -ml-2 text-violet-300 hover:text-white rounded-full hover:bg-violet-900/30 transition-colors cursor-pointer"
          aria-label="Volver al inicio de sesión"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <GanamosLogo size="sm" showSubtitle={false} />

        <div className="w-8" />
      </div>

      {/* Main form container */}
      <div className="relative z-10 w-full max-w-sm mx-auto my-auto flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Crear Cuenta
          </h1>
          <p className="text-xs text-violet-300/70 mt-1">
            Completá tus datos para registrarte en GANAMOS
          </p>
        </div>

        {validationSuccess ? (
          <div className="p-6 rounded-2xl bg-[#170a30] border border-violet-500/30 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-violet-600/20 border border-violet-400/40 text-violet-300 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Datos validados correctamente
              </h2>
              <p className="text-xs text-violet-300/70 mt-2 leading-relaxed">
                El formulario quedó listo y validado para su conexión con el backend.
              </p>
            </div>
            <button
              onClick={onNavigateToLogin}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <span>Ir a Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* Nombre y Apellido (2 columns) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  className="w-full h-11 px-3 bg-[#170a30]/80 hover:bg-[#1b0c38] focus:bg-[#1d0e3d] text-white placeholder-violet-300/40 text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  className="w-full h-11 px-3 bg-[#170a30]/80 hover:bg-[#1b0c38] focus:bg-[#1d0e3d] text-white placeholder-violet-300/40 text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Número de Teléfono */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
                Número de teléfono *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-violet-400/70 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej: +54 9 11 2345-6789"
                  autoComplete="tel"
                  className="w-full h-11 pl-10 pr-3 bg-[#170a30]/80 hover:bg-[#1b0c38] focus:bg-[#1d0e3d] text-white placeholder-violet-300/40 text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Usuario */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
                Usuario *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-violet-400/70 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Elegí tu nombre de usuario"
                  autoComplete="username"
                  className="w-full h-11 pl-10 pr-3 bg-[#170a30]/80 hover:bg-[#1b0c38] focus:bg-[#1d0e3d] text-white placeholder-violet-300/40 text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
                Contraseña *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-violet-400/70 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="w-full h-11 pl-10 pr-10 bg-[#170a30]/80 hover:bg-[#1b0c38] focus:bg-[#1d0e3d] text-white placeholder-violet-300/40 text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-violet-400/70 hover:text-violet-200 p-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmación de contraseña */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-violet-200/80 pl-1 block">
                Confirmar contraseña *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-violet-400/70 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repetí la contraseña"
                  autoComplete="new-password"
                  className="w-full h-11 pl-10 pr-10 bg-[#170a30]/80 hover:bg-[#1b0c38] focus:bg-[#1d0e3d] text-white placeholder-violet-300/40 text-sm font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-violet-400/70 hover:text-violet-200 p-1 cursor-pointer transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button: CREAR CUENTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(139,92,246,0.35)] hover:shadow-[0_6px_28px_rgba(139,92,246,0.45)] active:scale-[0.98] transition-all cursor-pointer border border-violet-400/30 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>CREAR CUENTA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Secondary link: ¿Ya tenés cuenta? Iniciá sesión */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-xs font-semibold text-violet-300 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-violet-900/30 cursor-pointer"
          >
            ¿Ya tenés cuenta?{' '}
            <span className="text-violet-400 underline underline-offset-4 font-bold">
              Iniciá sesión
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-2 text-[11px] text-violet-400/40">
        GANAMOS © {new Date().getFullYear()} · Registro Oficial
      </div>
    </div>
  );
};
