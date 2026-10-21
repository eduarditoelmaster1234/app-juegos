import { registerPlugin } from '@capacitor/core';

export interface GameBrowserPlugin {
  /**
   * Abre una plataforma dentro de un WebView nativo de la app.
   * La promesa se resuelve cuando el usuario cierra el visor.
   */
  open(options: { url: string; title?: string }): Promise<{ closed: boolean }>;
}

export const GameBrowser = registerPlugin<GameBrowserPlugin>('GameBrowser');
