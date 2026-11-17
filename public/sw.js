/**
 * Service worker mínimo de la PWA de GANAMOS.
 *
 * - Cachea la landing pública (`/`), la app React (`/app.html`) y los assets
 *   propios para permitir la instalación y la apertura offline.
 * - NO intercepta las llamadas a Chatwoot (otro origen): la mensajería y el
 *   WebSocket siempre van a la red, ya que Chatwoot es la fuente de verdad.
 */
const CACHE_NAME = 'ganamos-app-v5';
const PAGE_URLS = ['/', '/app.html'];
const APP_SHELL = [
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/verificacion.webp',
  '/trustpilot-rating.webp',
];
const STATIC_FILES = new Set([
  '/manifest.webmanifest',
  '/verificacion.webp',
  '/trustpilot-rating.webp',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Recursos fijos del shell. Si uno falla no se bloquea la instalación.
      await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));

      // Las páginas y los assets de Vite llevan hash en el nombre; se leen de
      // cada HTML para precargarlos y que el shell funcione offline desde la
      // primera instalación.
      for (const pageUrl of PAGE_URLS) {
        try {
          const response = await fetch(pageUrl);
          if (!response.ok) continue;

          const html = await response.clone().text();
          await cache.put(pageUrl, response);

          const assetUrls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(
            (match) => match[1],
          );
          await Promise.allSettled(assetUrls.map((url) => cache.add(url)));
        } catch {
          // Sin red durante la instalación: se cacheará al navegar.
        }
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
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;

          const fallback = url.pathname.startsWith('/app') ? '/app.html' : '/';
          return (await caches.match(fallback)) || (await caches.match('/'));
        }),
    );
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    STATIC_FILES.has(url.pathname) ||
    /\.(png|webp|jpg|jpeg|svg|woff2)$/i.test(url.pathname);

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
