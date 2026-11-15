import React, { useEffect, useState } from 'react';
import { isInstalledAppMode } from '../lib/pwa/installation';
import { InstallScreen } from './InstallScreen';

interface PwaAccessGateProps {
  children: React.ReactNode;
}

/**
 * Capa de acceso exclusiva para la PWA.
 *
 * El estado inicial se calcula de forma síncrona antes del primer render para
 * que una app instalada nunca muestre la pantalla de instalación, y un
 * navegador normal nunca llegue a montar la aplicación.
 */
export const PwaAccessGate: React.FC<PwaAccessGateProps> = ({ children }) => {
  const [installedMode, setInstalledMode] = useState<boolean>(() => isInstalledAppMode());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const displayMode = window.matchMedia('(display-mode: standalone)');
    const update = () => setInstalledMode(isInstalledAppMode());

    if (typeof displayMode.addEventListener === 'function') {
      displayMode.addEventListener('change', update);
    } else {
      displayMode.addListener(update);
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') update();
    };

    window.addEventListener('focus', update);
    window.addEventListener('pageshow', update);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (typeof displayMode.removeEventListener === 'function') {
        displayMode.removeEventListener('change', update);
      } else {
        displayMode.removeListener(update);
      }
      window.removeEventListener('focus', update);
      window.removeEventListener('pageshow', update);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (!installedMode) return <InstallScreen />;

  return <>{children}</>;
};
