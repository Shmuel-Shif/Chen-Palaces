const CACHE_NAME = 'chen-palaces-cache-v2';
const urlsToCache = [
    './',
    './index.html',
    './hall.html',
    './dashboard.html',
    './css/styles.css',
    './css/whatsapp-float.css',
    './js/firebase-config.js',
    './js/login.js',
    './js/hall.js',
    './js/dashboard.js',
    './js/common.js',
    './images/icon-192.png',
    './images/icon-512.png',
    './images/logo/logo.png',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// התקנת Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// שימוש בקבצים מה-cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// עדכון גרסאות של ה-cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 