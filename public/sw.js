// Minimal service worker: no offline caching (that's a separate, riskier
// change with a stale-app-shell failure mode) — this exists only to
// satisfy the browser's requirement that push notifications and "Add to
// Home Screen" both need an active service worker registration.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "言葉 Kotoba Engine", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "言葉 Kotoba Engine", {
      body: payload.body,
      icon: "/icon",
      badge: "/icon",
      data: { url: payload.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
