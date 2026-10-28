/* Offline-Speicher. Bei jeder Änderung an Dateien VERSION erhöhen, damit Geräte die neue Fassung laden. */
const VERSION = 'hindi5-2026-10-28-7';
const FILES = [
  './', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest',
  'content/items.js', 'content/lessons-001-030.js', 'content/script.js', 'content/games.js', 'google-apps-script/Code.gs',
  'fonts/tiro-devanagari-hindi-devanagari-400-normal.woff2',
  'fonts/noto-sans-devanagari-devanagari-400-normal.woff2',
  'fonts/noto-sans-devanagari-devanagari-500-normal.woff2',
  'fonts/noto-sans-devanagari-devanagari-600-normal.woff2',
  'fonts/source-sans-3-latin-400-normal.woff2', 'fonts/source-sans-3-latin-600-normal.woff2',
  'fonts/source-sans-3-latin-ext-400-normal.woff2', 'fonts/source-sans-3-latin-ext-600-normal.woff2',
  'fonts/source-sans-3-vietnamese-400-normal.woff2', 'fonts/source-sans-3-vietnamese-600-normal.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Erst das Netz, damit neue Lektionen sofort ankommen; ohne Verbindung der Offline-Speicher. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
