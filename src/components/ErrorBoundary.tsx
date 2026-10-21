import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Evita que un error de renderizado deje la app en una pantalla blanca.
 * El detalle técnico queda en la consola; el usuario ve una salida clara.
 */
export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error de interfaz:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#05010a] px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-400/25 text-red-300 flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-base font-bold text-white">Algo salió mal</h1>
        <p className="mt-1.5 max-w-[300px] text-xs text-violet-300/65 leading-relaxed">
          La aplicación encontró un error inesperado. Podés recargarla para volver a
          empezar.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 h-11 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
        >
          <RotateCw className="w-4 h-4" />
          Recargar app
        </button>
      </div>
    );
  }
}
