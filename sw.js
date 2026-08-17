const CACHE_NAME = 'geopocket-v1.0.1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/variables.css',
    './css/style.css',
    './css/navigation.css',
    './css/cards.css',
    './css/forms.css',
    './css/screens.css',
    './css/animations.css',
    './js/app.js',
    './js/router.js',
    './js/storage.js',
    './js/database.js',
    './js/settings.js',
    './js/diagnostic.js',
    './js/pdf.js',
    './js/utils.js',
    './data/minerals.js',
    './data/rocks.js',
    './data/terms.js',
    './screens/home.js',
    './screens/guide.js',
    './screens/mineral.js',
    './screens/diary.js',
    './screens/tools.js',
    './screens/profile.js',
    './screens/settings.js',
    './images/icons/icon-72.png',
    './images/icons/icon-96.png',
    './images/icons/icon-128.png',
    './images/icons/icon-144.png',
    './images/icons/icon-152.png',
    './images/icons/icon-192.png',
    './images/icons/icon-384.png',
    './images/icons/icon-512.png',
    './images/icons/favicon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
        .then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Пропускаем запросы к другим доменам
    if (url.origin !== self.location.origin) {
        event.respondWith(fetch(request));
        return;
    }

    // Пропускаем не-GET запросы
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const clone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, clone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Если нет кэша и нет сети – отдаём index.html
                        if (url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
                            return caches.match('./index.html');
                        }
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});