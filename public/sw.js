const CACHE_NAME = 'sst-portal-v4';
const STATIC_ASSETS = [
  '/',
  '/portal-empleados',
  '/favicon.svg',
  '/sst-colombia-logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => cached || caches.match('/'));
      })
  );
});

function portalPath(value) {
  return typeof value === 'string' && /^\/portal-empleados(?:\/|$)/.test(value)
    ? value
    : '/portal-empleados';
}

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  const count = Number.isFinite(data.badgeCount) ? Math.max(0, data.badgeCount) : 0;
  const options = {
    body: typeof data.body === 'string' ? data.body : 'Tienes una notificación nueva.',
    icon: '/sst-colombia-logo.png',
    badge: '/favicon.svg',
    tag: typeof data.tag === 'string' ? data.tag : 'sst-portal',
    data: { url: portalPath(data.url) },
  };
  event.waitUntil(Promise.all([
    self.registration.showNotification(
      typeof data.title === 'string' ? data.title : 'Portal SST Colombia',
      options
    ),
    count > 0 && typeof self.registration.setAppBadge === 'function'
      ? self.registration.setAppBadge(count).catch(() => {})
      : typeof self.registration.clearAppBadge === 'function'
        ? self.registration.clearAppBadge().catch(() => {})
        : Promise.resolve(),
  ]));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = portalPath(event.notification.data && event.notification.data.url);
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => {
      const url = new URL(client.url);
      return url.origin === self.location.origin && url.pathname.startsWith('/portal-empleados');
    });
    return existing ? existing.focus() : self.clients.openWindow(target);
  }));
});
