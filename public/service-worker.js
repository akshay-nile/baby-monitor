self.addEventListener("install", (event) => {
    event.waitUntil(caches.open("app-cache").then((cache) => {
        return cache.addAll([
            "./index.html",
            "./manifest.json",
            "./favicon.png"
        ]);
    }));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(caches.open("runtime-cache").then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        const response = await fetch(event.request);
        if (event.request.url.includes("/static/")) {
            cache.put(event.request, response.clone());
        }
        return response;
    }));
});
