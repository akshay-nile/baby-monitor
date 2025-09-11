const APP_CACHE = "baby-monitor-app-cache";
const META_CACHE = "baby-monitor-meta-cache";
const PUBLIC_FILES = ["./index.html", "./manifest.json", "./favicon.png"];

async function storeOrLoadMetaCache(key, value) {
    try {
        const cache = await caches.open(META_CACHE);
        const request = new Request(`https://local.meta.cache/${key}`);

        if (value === undefined) {
            const response = await cache.match(request);
            return response ? await response.json() : null;
        } else {
            const response = new Response(JSON.stringify(value));
            await cache.put(request, response);
        }
    } catch (err) {
        console.error("Error While Dealing With Meta-Cache:", err);
        return false;
    }
}

async function isUpdateAvailable() {
    try {
        const lastUpdateKey = "last-update";
        const lastUpdateVal = await storeOrLoadMetaCache(lastUpdateKey) ?? "0";

        const response = await fetch("https://akshaynile.pythonanywhere.com/baby-monitor", {
            headers: { "X-Last-Update": lastUpdateVal }, cache: "no-store"
        });
        const data = await response.json();

        if (data.is_updated) await storeOrLoadMetaCache(lastUpdateKey, data.last_update);
        return data.is_updated;
    } catch (err) {
        console.error("Error While Checking For Update:", err);
        return false;
    }
}

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        if (await isUpdateAvailable()) {
            console.warn("New Update Detected!\nReplacing the old cache with new one");
            await caches.delete(APP_CACHE);

            const cache = await caches.open(APP_CACHE);
            await cache.addAll(PUBLIC_FILES);
        }
        await self.clients.claim();
    })());
});

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(APP_CACHE)
        .then((cache) => cache.addAll(PUBLIC_FILES)));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(caches.open(APP_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        const response = await fetch(event.request);
        if (event.request.url.includes("/static/")) {
            cache.put(event.request, response.clone());
        }
        return response;
    }));
});
