const CACHE_NAME = 'aniyume-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

// Стратегия: Network First для API, Cache First для статики
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API запросы - всегда сеть
    if (url.pathname.includes('/api/') || url.pathname.includes('/streams')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    return caches.match(request).then((response) => {
                        if (response) return response;
                        // Return JSON error if offline/failed and not in cache
                        return new Response(JSON.stringify({
                            detail: "Network error / Offline",
                            offline: true
                        }), {
                            status: 503,
                            headers: { "Content-Type": "application/json" }
                        });
                    });
                })
        );
        return;
    }

    // Статика - сначала кэш
    event.respondWith(
        caches.match(request)
            .then((response) => response || fetch(request))
    );
});

// Очистка старого кэша
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
