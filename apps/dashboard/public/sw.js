self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Inbix", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Inbix";
  const options = {
    body: data.body || "",
    icon: data.icon || "/favicon.svg",
    badge: data.badge || "/favicon.svg",
    data: { url: data.url || "/" },
    timestamp: data.timestamp || Date.now(),
    requireInteraction: false,
  };

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const visibleClient = allClients.find(
        (c) => c.visibilityState === "visible"
      );

      if (visibleClient) {
        visibleClient.postMessage({
          type: "PUSH_RECEIVED",
          payload: data,
        });
      }

      await self.registration.showNotification(title, options);
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ("focus" in client) {
          const clientUrl = new URL(client.url);
          const targetPath = new URL(targetUrl, self.location.origin).pathname;

          if (clientUrl.pathname === targetPath) {
            return client.focus();
          }
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});
