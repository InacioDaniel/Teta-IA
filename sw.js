// sw.js
const VERSION = 'teta-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/teta.js',
  '/og-image.png',
  '/offline.html',
  // models que queres cachear (ex.: TFJS coco-ssd se hospedares em /models)
  '/models/coco-ssd/model.json',
  '/models/coco-ssd/group1-shard1of1.bin',
  // adiciona outros ficheiros de modelo que colocares em /models
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== VERSION).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  // Try network first for API requests, otherwise serve from cache
  if (req.method !== 'GET') return;
  ev.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // cache runtime assets (optional)
        const copy = res.clone();
        caches.open(VERSION).then(cache => {
          // don't cache large responses like video dynamically unless wanted
          cache.put(req, copy);
        });
        return res;
      }).catch(() => {
        // fallback if offline: return offline page for navigations
        if (req.mode === 'navigate') return caches.match('/offline.html');
      });
    })
  );
});
