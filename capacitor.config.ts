import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ganamos.app',
  appName: 'GANAMOS',
  webDir: 'dist',
  server: {
    // La landing pública queda en index.html; el APK abre directamente la app
    // React, que es el mismo entrypoint que usa la PWA instalada.
    appStartPath: '/app.html',
  },
};

export default config;
