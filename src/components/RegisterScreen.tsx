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
    }, 350);
  };

  return (
    <div className="relative flex flex-col justify-between min-h-full w-full px-5 py-5 overflow-y-auto bg-gradient-to-b from-[#0a0316] via-[#07020f] to-[#04010a]">
      {/* Subtle controlled ambient lighting */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top bar with back navigation */}
      <div className="relative z-10 flex items-center justify-between w-full pt-1 pb-2">
        <button
          onClick={onNavigateToLogin}
          className="p-2 -ml-2 text-violet-300 hover:text-white rounded-full hover:bg-violet-900/20 transition-colors cursor-pointer"
          aria-label="Volver al inicio de sesión"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <GanamosLogo size="sm" showSubtitle={false} />

        <div className="w-6" />
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-[340px] mx-auto my-auto flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Crear Cuenta
          </h1>
          <p className="text-xs text-violet-300/60 mt-0.5">
            Completá tus datos para registrarte
          </p>
        </div>

        {validationSuccess ? (
          <div className="p-5 rounded-2xl bg-[#140827] border border-violet-500/25 text-center space-y-3.5 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-400/30 text-violet-300 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Datos validados correctamente
              </h2>
              <p className="text-xs text-violet-300/60 mt-1 leading-relaxed">
                El formulario quedó listo para la conexión con el servidor.
              </p>
            </div>
            <button
              onClick={onNavigateToLogin}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(124,58,237,0.25)] cursor-pointer active:scale-[0.98] transition-transform"
            >
              <span>Ir a Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* Nombre y Apellido (2 columns for compact vertical rhythm) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-violet-200/80 pl-1 block">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  className="w-full h-10 px-3 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-violet-200/80 pl-1 block">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  className="w-full h-10 px-3 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-semibold text-violet-200/80 pl-1 block">
                Número de teléfono *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-violet-400/60 pointer-events-none">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+54 9 11 2345-6789"
                  autoComplete="tel"
                  className="w-full h-10 pl-9 pr-3 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Usuario */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-semibold text-violet-200/80 pl-1 block">
                Usuario *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-violet-400/60 pointer-events-none">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Elegí tu usuario"
                  autoComplete="username"
                  className="w-full h-10 pl-9 pr-3 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-semibold text-violet-200/80 pl-1 block">
                Contraseña *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-violet-400/60 pointer-events-none">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="w-full h-10 pl-9 pr-9 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-violet-400/60 hover:text-violet-200 p-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-semibold text-violet-200/80 pl-1 block">
                Confirmar contraseña *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-violet-400/60 pointer-events-none">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repetí la contraseña"
                  autoComplete="new-password"
                  className="w-full h-10 pl-9 pr-9 bg-[#130726]/90 hover:bg-[#17092e] focus:bg-[#1a0a33] text-white placeholder-violet-300/35 text-xs font-medium rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 text-violet-400/60 hover:text-violet-200 p-1 cursor-pointer transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button: CREAR CUENTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] active:scale-[0.98] transition-all cursor-pointer border border-violet-400/30 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

        {/* Secondary link */}
        <div className="text-center pt-3">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-xs font-medium text-violet-300/80 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-violet-900/20 cursor-pointer"
          >
            ¿Ya tenés cuenta?{' '}
            <span className="text-violet-400 underline underline-offset-4 font-semibold hover:text-violet-300">
              Iniciá sesión
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-2 text-[10px] text-violet-400/35">
        GANAMOS © {new Date().getFullYear()} · Registro Oficial
      </div>
    </div>
  );
};
