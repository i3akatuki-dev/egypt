/* 自动生成，请勿手工编辑：见 tools/build_assets.py */
var CACHE = 'egypt-manyou-89003caed1';
var ASSETS = [
  'css/style.css',
  'fonts/Cinzel.woff2',
  'icons/apple-touch-icon.png',
  'icons/favicon.png',
  'icons/icon-1024.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/splash-icon.png',
  'img/a01/1.webp',
  'img/a01/2.webp',
  'img/a01/3.webp',
  'img/a01/4.webp',
  'img/a01/5.webp',
  'img/a02/1.webp',
  'img/a02/2.webp',
  'img/a02/3.webp',
  'img/a02/4.webp',
  'img/a03/1.webp',
  'img/a03/2.webp',
  'img/a03/3.webp',
  'img/a03/4.webp',
  'img/a04/1.webp',
  'img/a04/2.webp',
  'img/a04/3.webp',
  'img/a04/4.webp',
  'img/a05/1.webp',
  'img/a05/2.webp',
  'img/a05/3.webp',
  'img/a05/4.webp',
  'img/a06/1.webp',
  'img/a06/2.webp',
  'img/a06/3.webp',
  'img/a06/4.webp',
  'img/a07/1.webp',
  'img/a07/2.webp',
  'img/a07/3.webp',
  'img/a07/4.webp',
  'img/a07/5.webp',
  'img/a08/1.webp',
  'img/a08/2.webp',
  'img/a08/3.webp',
  'img/a08/4.webp',
  'img/a09/1.webp',
  'img/a09/2.webp',
  'img/a09/3.webp',
  'img/a10/1.webp',
  'img/a10/2.webp',
  'img/a10/3.webp',
  'img/a11/1.webp',
  'img/a11/2.webp',
  'img/a11/3.webp',
  'img/a11/4.webp',
  'img/a12/1.webp',
  'img/a12/2.webp',
  'img/a12/3.webp',
  'img/a13/1.webp',
  'img/a13/2.webp',
  'img/a13/3.webp',
  'img/a13/4.webp',
  'img/a14/1.webp',
  'img/a14/2.webp',
  'img/a14/3.webp',
  'img/a14/4.webp',
  'img/a14/5.webp',
  'img/a15/1.webp',
  'img/a15/2.webp',
  'img/a15/3.webp',
  'img/a15/4.webp',
  'img/a16/1.webp',
  'img/a16/2.webp',
  'img/a16/3.webp',
  'img/a17/1.webp',
  'img/a17/2.webp',
  'img/a17/3.webp',
  'img/a17/4.webp',
  'img/a18/1.webp',
  'img/a18/2.webp',
  'img/a18/3.webp',
  'img/a18/4.webp',
  'img/a19/1.webp',
  'img/a19/2.webp',
  'img/a19/3.webp',
  'img/a19/4.webp',
  'img/a20/1.webp',
  'img/a20/2.webp',
  'img/a20/3.webp',
  'img/a21/1.webp',
  'img/a21/2.webp',
  'img/a21/3.webp',
  'img/a22/1.webp',
  'img/a22/2.webp',
  'img/a22/3.webp',
  'img/a22/4.webp',
  'img/a23/1.webp',
  'img/a23/2.webp',
  'img/a23/3.webp',
  'img/a24/1.webp',
  'img/a24/2.webp',
  'img/a24/3.webp',
  'img/a24/4.webp',
  'index.html',
  'js/app.js',
  'js/credits.js',
  'js/data.js',
  'js/map.js',
  'manifest.webmanifest',
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(ASSETS).then(function () { return self.skipWaiting(); });
  }).catch(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      return k === CACHE ? null : caches.delete(k);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 页面导航：优先缓存里的 index.html，断网也能进
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () { return caches.match('index.html'); })
    );
    return;
  }

  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.ok && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
  }));
});
