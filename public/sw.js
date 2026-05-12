/* Secret Verb — minimal service worker so the app meets PWA install criteria.
 * Pass-through fetch; bump this comment to ship a new SW and refresh clients. */
self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request))
})
