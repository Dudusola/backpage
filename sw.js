// Offline shell: cache-first. Bump V when any file changes.
const V = 'backpage-10';
const FILES = ['./', 'index.html', 'tokens.css', 'style.css', 'game.js', 'ui.js', 'icon.svg', 'icon-512.png', 'manifest.webmanifest',
  'fonts/big-shoulders-display-latin-600-normal.woff2', 'fonts/big-shoulders-display-latin-800-normal.woff2',
  'fonts/newsreader-latin-400-normal.woff2', 'fonts/newsreader-latin-400-italic.woff2', 'fonts/newsreader-latin-600-normal.woff2',
  'fonts/jetbrains-mono-latin-500-normal.woff2'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(V).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => { if (e.request.method === 'GET') e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))); });
