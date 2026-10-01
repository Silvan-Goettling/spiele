// Offline-Speicher für "Insel der vier Siegel"
// Bei Änderungen am Spiel die Versionsnummer erhöhen, dann lädt das iPhone die neue Fassung.
const VERSION = 'insel-3d-v1';
const DATEIEN = ['./', './index.html', './three.module.min.js', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(speicher => speicher.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== VERSION).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Erst aus dem Speicher antworten (schnell und offline), im Hintergrund die neue Fassung holen
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(treffer => {
      const netz = fetch(e.request).then(antwort => {
        if (antwort && antwort.ok) {
          const kopie = antwort.clone();
          caches.open(VERSION).then(speicher => speicher.put(e.request, kopie));
        }
        return antwort;
      }).catch(() => treffer);
      return treffer || netz;
    })
  );
});
