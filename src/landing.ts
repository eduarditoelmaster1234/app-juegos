import './landing.css';
import type { BeforeInstallPromptEvent } from './lib/pwa/installation';
import {
  getDeferredInstallPrompt,
  getInstallEnvironment,
  getManualInstallSteps,
  hasAppInstalledEvent,
  initializeInstallPromptCapture,
  isInstalledAppMode,
  promptForInstall,
  subscribeToInstallChanges,
} from './lib/pwa/installation';

declare global {
  interface Window {
    __ganamosInstallPrompt?: BeforeInstallPromptEvent | null;
    __ganamosAppInstalled?: boolean;
  }
}

// La landing captura el prompt en un script inline temprano. Acá se adopta ese
// evento para que el botón pueda usarlo aunque el módulo haya cargado después.
initializeInstallPromptCapture(
  window.__ganamosInstallPrompt ?? null,
  Boolean(window.__ganamosAppInstalled),
);

// El service worker debe registrarse desde la landing para que el navegador
// considere instalable la PWA antes de abrir la aplicación.
if (
  import.meta.env.PROD &&
  'serviceWorker' in navigator &&
  !isInstalledAppMode()
) {
  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.warn('No se pudo registrar el service worker de la PWA.', error);
  });
}

// Si la landing se abre desde la PWA instalada, se entra directamente a la app.
// El script inline del <head> ya hace esta redirección antes del primer render;
// esta comprobación es una segunda barrera por si el modo cambia al cargar.
if (isInstalledAppMode()) {
  window.location.replace('/app.html');
} else {
  initLanding();
}

function initLanding(): void {
  const button = document.querySelector<HTMLButtonElement>('#install-button');
  const label = document.querySelector<HTMLElement>('#install-button-text');
  const hint = document.querySelector<HTMLElement>('#install-button-hint');
  const help = document.querySelector<HTMLElement>('#install-help');

  if (!button || !label || !help) return;

  const environment = getInstallEnvironment();
  const automaticInstall = environment === 'chromium';

  // La landing original usa una sola línea de promoción en el botón. Acá el
  // texto principal se conserva y una segunda línea aclara la acción real.
  const setLabel = (text: string, hintText = '') => {
    label.textContent = text;
    if (!hint) return;
    hint.textContent = hintText;
    hint.hidden = hintText.length === 0;
  };

  const initCountdown = () => {
    const target = document.querySelector<HTMLElement>('#countdown');
    if (!target) return;

    let remaining = 300;
    window.setInterval(() => {
      remaining = remaining <= 0 ? 300 : remaining - 1;
      const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
      const seconds = String(remaining % 60).padStart(2, '0');
      target.textContent = `${minutes}:${seconds}`;
    }, 1000);
  };

  initCountdown();

  const setState = (state: 'ready' | 'installed') => {
    button.dataset.state = state;
  };

  const hideHelp = () => {
    help.hidden = true;
    help.innerHTML = '';
  };

  const showHelp = (html: string) => {
    help.innerHTML = html;
    help.hidden = false;
  };

  const manualSteps = getManualInstallSteps()
    .map((step) => `<li>${step}</li>`)
    .join('');

  const helpContent = {
    iosSafari: `
      <strong>Instalá GANAMOS en tu iPhone</strong>
      <ol>
        <li>Tocá <strong>Compartir</strong> en la barra de Safari.</li>
        <li>Elegí <strong>Añadir a pantalla de inicio</strong>.</li>
        <li>Tocá <strong>Agregar</strong> y abrí GANAMOS desde el icono.</li>
      </ol>`,
    iosOther: `
      <strong>Abrí GANAMOS en Safari</strong>
      <p>En iPhone y iPad, la instalación desde la pantalla de inicio se realiza desde Safari.</p>
      <ol>
        <li>Copiá la dirección de esta página.</li>
        <li>Abrila en Safari.</li>
        <li>Tocá Compartir → Añadir a pantalla de inicio → Agregar.</li>
      </ol>`,
    inApp: `
      <strong>Abrí GANAMOS en tu navegador</strong>
      <p>Estás viendo esta página dentro de otra aplicación. Para instalar GANAMOS, abrí el enlace en un navegador compatible.</p>
      <ol>
        <li>Abrí el menú de esta aplicación y elegí “Abrir en el navegador”.</li>
        <li>Continuá en Chrome, Brave, Edge o Safari.</li>
      </ol>`,
    unsupported: `
      <strong>Abrí GANAMOS en un navegador compatible</strong>
      <p>Para instalar la app, abrí esta dirección en Chrome, Brave, Edge o Safari.</p>
      <p>En Android o escritorio: Chrome, Brave o Edge.<br>En iPhone/iPad: Safari.</p>`,
    manual: `
      <strong>Instalá GANAMOS desde el menú</strong>
      <ol>${manualSteps}</ol>`,
    accepted: `
      <strong>Instalación iniciada</strong>
      <p>Terminá la instalación en el aviso del navegador. Cuando finalice, abrí GANAMOS desde tu pantalla de inicio.</p>`,
    dismissed: `
      <strong>Instalación cancelada</strong>
      <p>Podés reintentarla desde el menú del navegador cuando quieras.</p>`,
    error: `
      <strong>No pudimos abrir el instalador</strong>
      <p>Usá el menú del navegador para instalar GANAMOS.</p>`,
    installed: `
      <strong>GANAMOS ya está instalada</strong>
      <p>Abrila desde el icono de tu pantalla de inicio o menú de aplicaciones. Por seguridad, esta pestaña del navegador seguirá bloqueada.</p>`,
  };

  const readyLabel = automaticInstall
    ? { text: '¡QUIERO MI B0N0 AHORA!', hint: 'Instalá GANAMOS para reclamarlo' }
    : { text: 'Cómo instalar GANAMOS', hint: 'Te mostramos los pasos' };

  const showInstalled = () => {
    setState('installed');
    setLabel('GANAMOS está instalada');
    button.disabled = true;
    showHelp(helpContent.installed);
  };

  setState('ready');
  setLabel(readyLabel.text, readyLabel.hint);

  if (hasAppInstalledEvent()) showInstalled();

  subscribeToInstallChanges(() => {
    if (hasAppInstalledEvent()) {
      showInstalled();
      return;
    }

    if (automaticInstall && getDeferredInstallPrompt()) {
      setState('ready');
      button.disabled = false;
      setLabel(readyLabel.text, readyLabel.hint);
      hideHelp();
    }
  });

  button.addEventListener('click', async () => {
    // En modo instalado se entra a la app; en una pestaña normal no se puede
    // abrir la PWA instalada, así que solo se recuerda usar el icono.
    if (isInstalledAppMode()) {
      window.location.href = '/app.html';
      return;
    }

    if (hasAppInstalledEvent()) {
      showInstalled();
      return;
    }

    if (environment === 'ios-safari') {
      showHelp(helpContent.iosSafari);
      return;
    }

    if (environment === 'ios-other') {
      showHelp(helpContent.iosOther);
      return;
    }

    if (environment === 'in-app') {
      showHelp(helpContent.inApp);
      return;
    }

    if (environment !== 'chromium') {
      showHelp(helpContent.unsupported);
      return;
    }

    if (!getDeferredInstallPrompt()) {
      showHelp(helpContent.manual);
      return;
    }

    button.disabled = true;
    const outcome = await promptForInstall();
    button.disabled = false;

    if (outcome === 'accepted') {
      showHelp(helpContent.accepted);
      return;
    }

    if (outcome === 'dismissed') {
      showHelp(helpContent.dismissed);
      return;
    }

    if (outcome === 'error') {
      showHelp(helpContent.error);
      return;
    }

    showHelp(helpContent.manual);
  });
}
