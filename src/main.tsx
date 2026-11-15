import {createRoot} from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// La PWA se registra solo en la build web. En el APK nativo el shell ya está
// empaquetado y no hace falta un service worker.
if (
  import.meta.env.PROD &&
  'serviceWorker' in navigator &&
  !Capacitor.isNativePlatform()
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('No se pudo registrar el service worker de la PWA.', error);
    });
  });
}
