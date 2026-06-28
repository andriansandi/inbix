import { Hono } from "hono";
import type { HonoEnv } from "../lib/env";
import { requireAuth } from "../middleware/auth";
import {
  json,
  errorResponse,
  notificationPreferencesSchema,
} from "@inbix/shared";
import {
  createDatabase,
  getNotificationPreferences,
  upsertNotificationPreferences,
  listPushSubscriptions,
  createNotificationLog,
} from "@inbix/database";
import { sendWebPush } from "../lib/webPush";

export const notificationRoutes = new Hono<HonoEnv>();

notificationRoutes.use("*", requireAuth);

notificationRoutes.get("/preferences", async (c) => {
  const userId = c.get("userId")!;
  const db = createDatabase(c.env.DB);
  const prefs = await getNotificationPreferences(db, userId);

  if (!prefs) {
    return json({
      success: true,
      data: {
        pushEnabled: true,
        quietHoursStart: null,
        quietHoursEnd: null,
        notifyOnNewMessage: true,
      },
    });
  }

  return json({ success: true, data: prefs });
});

notificationRoutes.patch("/preferences", async (c) => {
  const userId = c.get("userId")!;
  const body = await c.req.json().catch(() => ({}));
  const parsed = notificationPreferencesSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid preferences", 400);
  }

  const db = createDatabase(c.env.DB);
  const prefs = await upsertNotificationPreferences(db, userId, parsed.data);

  return json({ success: true, data: prefs });
});

notificationRoutes.post("/test", async (c) => {
  const userId = c.get("userId")!;
  const db = createDatabase(c.env.DB);

  const subscriptions = await listPushSubscriptions(db, userId);
  if (subscriptions.length === 0) {
    return errorResponse("No active push subscriptions. Subscribe first.", 400);
  }

  const vapid = {
    publicKey: c.env.VAPID_PUBLIC_KEY,
    privateKey: c.env.VAPID_PRIVATE_KEY,
    subject: c.env.VAPID_SUBJECT,
  };

  if (!vapid.publicKey || !vapid.privateKey) {
    return errorResponse("VAPID keys not configured", 503);
  }

  const payload = {
    title: "Inbix Test Notification",
    body: "Push notifications are working correctly!",
    url: "/dashboard",
    timestamp: Date.now(),
  };

  const results = await Promise.all(
    subscriptions.map(async (sub) => {
      const result = await sendWebPush({
        subscription: {
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
        payload,
        vapid,
      });

      await createNotificationLog(db, {
        userId,
        subscriptionId: sub.id,
        messageId: null,
        status: result.ok ? "sent" : "failed",
        error: result.ok ? null : result.error ?? `HTTP ${result.status}`,
      });

      return { subscriptionId: sub.id, ...result };
    })
  );

  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  return json({
    success: true,
    data: { sent, failed, results },
  });
});
