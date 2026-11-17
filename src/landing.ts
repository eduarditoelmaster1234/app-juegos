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
// evento para que los botones puedan usarlo aunque el módulo haya cargado después.
initializeInstallPromptCapture(
  window.__ganamosInstallPrompt ?? null,
  Boolean(window.__ganamosAppInstalled),
);

// El service worker debe registrarse desde la landing para que el navegador
// considere instalable la PWA antes de abrir la aplicación.
if (import.meta.env.PROD && 'serviceWorker' in navigator && !isInstalledAppMode()) {
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
  initHeader();
  initReveals();
  initStageParallax();
  initInstallFlow();
}

/** Cabecera translúcida al hacer scroll. */
function initHeader(): void {
  const header = document.querySelector<HTMLElement>('.masthead');
  if (!header) return;

  let queued = false;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 18);
    queued = false;
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/** Aparición suave de las secciones al llegar a ellas. */
function initReveals(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!items.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  for (const item of items) {
    item.classList.add('reveal');
    const delay = item.dataset.revealDelay;
    if (delay) item.style.setProperty('--reveal-delay', `${delay}ms`);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
  );

  for (const item of items) observer.observe(item);
}

/** Paralaje muy leve de los teléfonos con puntero fino. */
function initStageParallax(): void {
  const stage = document.querySelector<HTMLElement>('.hero__stage');
  const phones = stage?.querySelector<HTMLElement>('.stage__phones');
  if (!stage || !phones) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reducedMotion.matches) return;

  let frame = 0;

  const onPointerMove = (event: PointerEvent) => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      phones.style.setProperty('--shift-x', `${(-x * 10).toFixed(1)}px`);
      phones.style.setProperty('--shift-y', `${(-y * 8).toFixed(1)}px`);
      frame = 0;
    });
  };

  const reset = () => {
    phones.style.setProperty('--shift-x', '0px');
    phones.style.setProperty('--shift-y', '0px');
  };

  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerleave', reset);
}

/**
 * Instalación: todos los botones comparten el mismo flujo real de la PWA.
 * El botón de la sección de instalación conserva los ids canónicos.
 */
function initInstallFlow(): void {
  const triggers = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-install-trigger]'),
  );
  const canonical = document.querySelector<HTMLButtonElement>('#install-button');
  const help = document.querySelector<HTMLElement>('#install-help');

  if (!triggers.length || !help) return;

  const environment = getInstallEnvironment();
  const automaticInstall = environment === 'chromium';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const readyLabel = automaticInstall ? 'Instalar GANAMOS' : 'Cómo instalar GANAMOS';
  const readyShort = automaticInstall ? 'Instalar' : 'Cómo instalar';

  const readyHint = (() => {
    switch (environment) {
      case 'ios-safari':
        return 'Tres pasos desde Safari';
      case 'ios-other':
        return 'Abrí esta página en Safari';
      case 'in-app':
        return 'Abrila en tu navegador';
      case 'chromium':
        return 'Android, iPhone y computadora';
      default:
        return 'Te mostramos los pasos';
    }
  })();

  const setLabels = (label: string, short: string, hint: string) => {
    for (const trigger of triggers) {
      const labelNodes = trigger.querySelectorAll<HTMLElement>('[data-install-label]');
      labelNodes.forEach((node) => {
        node.textContent = node.hasAttribute('data-install-short') ? short : label;
      });

      const hintNodes = trigger.querySelectorAll<HTMLElement>('[data-install-hint]');
      hintNodes.forEach((node) => {
        node.textContent = hint;
        node.hidden = hint.length === 0;
      });
    }
  };

  const setState = (state: 'ready' | 'installed') => {
    for (const trigger of triggers) trigger.dataset.state = state;
  };

  const setDisabled = (disabled: boolean) => {
    for (const trigger of triggers) trigger.disabled = disabled;
  };

  const hideHelp = () => {
    help.hidden = true;
    help.innerHTML = '';
  };

  const showHelp = (html: string, scroll: boolean) => {
    help.innerHTML = html;
    help.hidden = false;

    if (!scroll) return;

    help.focus({ preventScroll: true });
    help.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  const manualSteps = getManualInstallSteps()
    .map((step) => `<li>${step}</li>`)
    .join('');

  const helpContent = {
    iosSafari: `
      <strong>Instalá GANAMOS en tu iPhone o iPad</strong>
      <ol>
        <li>En Safari, tocá el botón <strong>Compartir</strong>.</li>
        <li>Desplazá y elegí <strong>Añadir a pantalla de inicio</strong>.</li>
        <li>Tocá <strong>Agregar</strong> y abrí GANAMOS desde el ícono.</li>
      </ol>`,
    iosOther: `
      <strong>Abrí esta página en Safari</strong>
      <p>En iPhone y iPad, la instalación desde la pantalla de inicio se realiza desde Safari.</p>
      <ol>
        <li>Copiá la dirección de esta página.</li>
        <li>Abrila en Safari.</li>
        <li>Tocá Compartir → Añadir a pantalla de inicio → Agregar.</li>
      </ol>`,
    inApp: `
      <strong>Abrí GANAMOS en tu navegador</strong>
      <p>Estás viendo esta página dentro de otra aplicación. Para instalar la app, abrila en un navegador compatible.</p>
      <ol>
        <li>Abrí el menú de esta aplicación y elegí “Abrir en el navegador”.</li>
        <li>Continuá en Chrome, Brave, Edge o Safari.</li>
      </ol>`,
    unsupported: `
      <strong>Abrí GANAMOS en un navegador compatible</strong>
      <p>La instalación funciona en Chrome, Brave, Edge y Safari, según tu dispositivo.</p>
      <p>En Android o computadora: Chrome, Brave o Edge.<br>En iPhone o iPad: Safari.</p>`,
    manual: `
      <strong>Instalá GANAMOS desde el menú del navegador</strong>
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

  const showInstalled = (scroll: boolean) => {
    setState('installed');
    setLabels('GANAMOS está instalada', 'Instalada', '');
    setDisabled(true);
    showHelp(helpContent.installed, scroll);
  };

  setState('ready');
  setLabels(readyLabel, readyShort, readyHint);
  setDisabled(false);

  if (hasAppInstalledEvent()) showInstalled(false);

  subscribeToInstallChanges(() => {
    if (hasAppInstalledEvent()) {
      showInstalled(false);
      return;
    }

    // El navegador volvió a ofrecer el instalador (por ejemplo, tras cancelar).
    if (automaticInstall && getDeferredInstallPrompt()) {
      setState('ready');
      setLabels(readyLabel, readyShort, readyHint);
      setDisabled(false);
      hideHelp();
    }
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', async () => {
      const fromCanonical = trigger === canonical;
      const scroll = !fromCanonical;

      // En modo instalado se entra a la app; en una pestaña normal no se puede
      // abrir la PWA instalada, así que solo se recuerda usar el icono.
      if (isInstalledAppMode()) {
        window.location.href = '/app.html';
        return;
      }

      if (hasAppInstalledEvent()) {
        showInstalled(scroll);
        return;
      }

      switch (environment) {
        case 'ios-safari':
          showHelp(helpContent.iosSafari, scroll);
          return;
        case 'ios-other':
          showHelp(helpContent.iosOther, scroll);
          return;
        case 'in-app':
          showHelp(helpContent.inApp, scroll);
          return;
        case 'other':
          showHelp(helpContent.unsupported, scroll);
          return;
        default:
          break;
      }

      if (!getDeferredInstallPrompt()) {
        showHelp(helpContent.manual, scroll);
        return;
      }

      setDisabled(true);
      const outcome = await promptForInstall();

      if (hasAppInstalledEvent()) {
        showInstalled(scroll);
        return;
      }

      setDisabled(false);

      if (outcome === 'accepted') {
        showHelp(helpContent.accepted, scroll);
        return;
      }

      if (outcome === 'dismissed') {
        showHelp(helpContent.dismissed, scroll);
        return;
      }

      if (outcome === 'error') {
        showHelp(helpContent.error, scroll);
        return;
      }

      showHelp(helpContent.manual, scroll);
    });
  });
}
