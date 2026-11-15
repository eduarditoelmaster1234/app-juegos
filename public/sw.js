/**
 * Service worker mínimo de la PWA de GANAMOS.
 *
 * - Cachea el shell y los assets propios para permitir la instalación y la
 *   apertura offline.
 * - NO intercepta las llamadas a Chatwoot (otro origen): la mensajería y el
 *   WebSocket siempre van a la red, ya que Chatwoot es la fuente de verdad.
 */
const CACHE_NAME = 'ganamos-app-v2';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Si un recurso del shell falla no se bloquea la instalación completa.
      await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));

      // Los assets de Vite llevan hash en el nombre; se leen del index para
      // poder precargarlos y que el shell funcione offline desde la primera
      // instalación.
      try {
        const response = await fetch('/');
        if (response.ok) {
          const html = await response.clone().text();
          await cache.put('/index.html', response);
          const assetUrls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(
            (match) => match[1],
          );
          await Promise.allSettled(assetUrls.map((url) => cache.add(url)));
        }
      } catch {
        // Sin red durante la instalación: se cacheará al navegar.
      }

      await self.skipWaiting();
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then((cached) => cached || caches.match('/')),
        ),
    );
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest';

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
