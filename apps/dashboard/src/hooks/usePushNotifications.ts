import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import type { PushSubscription } from "@inbix/shared";

function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSubscriptions = useCallback(async () => {
    try {
      const subs = await api.getPushSubscriptions();
      setSubscriptions(subs);
      setIsSubscribed(subs.length > 0);
    } catch {
      // Not authenticated or error — ignore
    }
  }, []);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => refreshSubscriptions())
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, [refreshSubscriptions]);

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;

    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const { publicKey } = await api.getVapidPublicKey();
      const applicationServerKey = base64urlToArrayBuffer(publicKey);

      const reg = await navigator.serviceWorker.ready;
      const pushSubscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const sub = pushSubscription.toJSON();
      await api.pushSubscribe({
        endpoint: sub.endpoint!,
        keys: {
          p256dh: sub.keys!.p256dh,
          auth: sub.keys!.auth,
        },
      });

      await refreshSubscriptions();
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, refreshSubscriptions]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const pushSubscription = await reg.pushManager.getSubscription();

      if (pushSubscription) {
        await pushSubscription.unsubscribe();
        await api.pushUnsubscribe(pushSubscription.endpoint);
      }

      await refreshSubscriptions();
      return true;
    } catch (err) {
      console.error("Push unsubscription failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshSubscriptions]);

  const sendTest = useCallback(async () => {
    return api.sendTestNotification();
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    subscriptions,
    loading,
    subscribe,
    unsubscribe,
    sendTest,
    refreshSubscriptions,
  };
}
