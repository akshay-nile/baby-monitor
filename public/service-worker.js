const CACHE_KEY = "baby-monitor-cache";
const PUBLIC_FILES = ["./index.html", "./manifest.json", "./favicon.png"];

async function isIndexHtmlUpdated() {
    try {
        const cache = await caches.open(CACHE_KEY);
        const cachedResponse = await cache.match("./index.html");
        if (!cachedResponse) return true;
        const cachedHtml = (await cachedResponse.text()).trim();

        const serverResponse = await fetch("./index.html", { cache: "no-store" });
        const serverHtml = (await serverResponse.text()).trim();

        return serverHtml !== cachedHtml;
    } catch (err) {
        console.error("Error While Checking For Update:", err);
        return false;
    }
}

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        if (await isIndexHtmlUpdated()) {
            console.warn("New Update Detected!\nReplacing the old cache with new one");
            await caches.delete(CACHE_KEY);

            const cache = await caches.open(CACHE_KEY);
            await cache.addAll(PUBLIC_FILES);
        }
    })());
});

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open("app-cache")
        .then((cache) => cache.addAll(PUBLIC_FILES)));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(caches.open(CACHE_KEY).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        const response = await fetch(event.request);
        if (event.request.url.includes("/static/")) {
            cache.put(event.request, response.clone());
        }
        return response;
    }));
});
