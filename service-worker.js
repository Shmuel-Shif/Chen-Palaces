const CACHE_NAME = 'harmonot-chen-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/login.js',
    '/js/common.js',
    '/images/logo/logo.png',
    '/images/icon-192.png',
    '/images/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// התקנת Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache.map(url => {
                    // אם זה לא URL חיצוני, נוסיף את prefix של גיטהאב
                    if (!url.startsWith('http')) {
                        return '/harmonot-chen' + url;
                    }
                    return url;
                }));
            })
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
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 