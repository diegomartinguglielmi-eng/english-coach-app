// SayIt · funcionamiento sin conexión
// Al publicar una versión nueva, cambiá el número de CACHE para que los teléfonos se actualicen.
const CACHE = 'sayit-v2.0.0';
const CORE = [
  '/', '/index.html', '/styles.css', '/manifest.webmanifest', '/icon.svg',
  '/js/app.js', '/js/activities.js', '/js/audio.js', '/js/store.js', '/js/ui.js', '/js/api.js', '/js/content.js',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return; // el coach siempre va a la red

  // Tipografías de Google: se guardan la primera vez
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;

  // Archivos propios: primero la red (para tener la última versión), si no hay conexión, la copia guardada
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('/') : undefined)))
  );
});
