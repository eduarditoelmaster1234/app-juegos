import { Capacitor } from '@capacitor/core';

/**
 * Utilidades de detección e instalación de la PWA.
 *
 * La detección de "app instalada" se basa exclusivamente en el modo real de
 * ejecución (display-mode / navigator.standalone) o en Capacitor. Nunca en
 * localStorage ni en una marca guardada por la propia app.
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable' | 'error';

export type InstallEnvironment =
  | 'ios-safari'
  | 'ios-other'
  | 'in-app'
  | 'chromium'
  | 'other';

export type DevicePlatform = 'ios' | 'android' | 'desktop';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let appInstalledEvent = false;
let captureInitialized = false;

const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

function getNavigator(): Navigator | null {
  return typeof window === 'undefined' ? null : window.navigator;
}

function getUserAgent(): string {
  return getNavigator()?.userAgent ?? '';
}

/**
 * Debe llamarse antes de montar React para no perder un
 * `beforeinstallprompt` que llegue durante el arranque.
 *
 * La landing pública captura el evento en un script inline temprano y luego
 * lo entrega acá, para que tampoco se pierda si el módulo carga después.
 */
export function initializeInstallPromptCapture(
  earlyPrompt: BeforeInstallPromptEvent | null = null,
  alreadyInstalled = false,
): void {
  if (captureInitialized || typeof window === 'undefined') return;
  captureInitialized = true;

  if (alreadyInstalled) {
    appInstalledEvent = true;
  } else if (earlyPrompt) {
    deferredPrompt = earlyPrompt;
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    // Evitamos el mini-banner del navegador: la app muestra su propia
    // pantalla de instalación.
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    appInstalledEvent = false;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    appInstalledEvent = true;
    notifyListeners();
  });
}

export function subscribeToInstallChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export function hasAppInstalledEvent(): boolean {
  return appInstalledEvent;
}

export async function promptForInstall(): Promise<InstallOutcome> {
  const promptEvent = deferredPrompt;
  if (!promptEvent) return 'unavailable';

  // El evento solo puede usarse una vez. Si el navegador vuelve a emitirlo,
  // se guarda de nuevo y la UI recupera el botón automáticamente.
  deferredPrompt = null;
  notifyListeners();

  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    return choice.outcome === 'accepted' ? 'accepted' : 'dismissed';
  } catch {
    return 'error';
  }
}

/**
 * Modo app instalada:
 * - PWA en Android/escritorio: display-mode standalone.
 * - PWA en iOS/iPadOS: navigator.standalone.
 * - APK nativo de Capacitor: plataforma nativa.
 */
export function isInstalledAppMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return true;

  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };
  return navigatorWithStandalone.standalone === true;
}

export function isIosDevice(): boolean {
  const navigatorObject = getNavigator();
  if (!navigatorObject) return false;

  const userAgent = navigatorObject.userAgent;
  const isIpadOs =
    navigatorObject.platform === 'MacIntel' && navigatorObject.maxTouchPoints > 1;

  return /iPad|iPhone|iPod/i.test(userAgent) || isIpadOs;
}

export function isIosSafari(): boolean {
  if (!isIosDevice()) return false;
  return (
    /Safari/i.test(getUserAgent()) &&
    !/(CriOS|FxiOS|EdgiOS|OPiOS|GSA|DuckDuckGo|Mercury|Brave)/i.test(getUserAgent())
  );
}

export function isEmbeddedBrowser(): boolean {
  return /(FBAN|FBAV|FB_IAB|Instagram|Line\/|WhatsApp|Twitter|MicroMessenger|Snapchat|Pinterest|LinkedInApp|Telegram|TikTok|BytedanceWebview|; wv\))/i.test(
    getUserAgent(),
  );
}

export function isChromiumBrowser(): boolean {
  if (isIosDevice() || isEmbeddedBrowser()) return false;

  const userAgent = getUserAgent();
  if (/Firefox|FxiOS/i.test(userAgent)) return false;

  return /Chrome\/|Chromium\/|CriOS\/|Edg\/|OPR\/|Brave\//i.test(userAgent);
}

export function getInstallEnvironment(): InstallEnvironment {
  if (isEmbeddedBrowser()) return 'in-app';
  if (isIosDevice()) return isIosSafari() ? 'ios-safari' : 'ios-other';
  if (isChromiumBrowser()) return 'chromium';
  return 'other';
}

export function getDevicePlatform(): DevicePlatform {
  if (isIosDevice()) return 'ios';
  if (/Android/i.test(getUserAgent())) return 'android';
  return 'desktop';
}

export function getManualInstallSteps(): string[] {
  if (getDevicePlatform() === 'android') {
    return [
      'Abrí el menú del navegador (⋮).',
      'Elegí “Instalar aplicación” o “Añadir a pantalla de inicio”.',
      'Confirmá la instalación y abrí GANAMOS desde el icono.',
    ];
  }

  return [
    'Buscá el icono de instalación en la barra de direcciones.',
    'O abrí el menú del navegador y elegí “Instalar GANAMOS”.',
    'Confirmá y abrí la app desde tu escritorio o menú de aplicaciones.',
  ];
}
