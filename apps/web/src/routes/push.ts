import { Hono } from "hono";
import type { HonoEnv } from "../lib/env";
import { requireAuth } from "../middleware/auth";
import {
  json,
  errorResponse,
  pushSubscribeSchema,
  PUSH_MAX_SUBSCRIPTIONS_PER_USER,
} from "@inbix/shared";
import {
  createDatabase,
  createPushSubscription,
  listPushSubscriptions,
  deactivatePushSubscription,
  deactivatePushSubscriptionByEndpoint,
  countActiveSubscriptions,
} from "@inbix/database";

export const pushRoutes = new Hono<HonoEnv>();

pushRoutes.use("*", requireAuth);

pushRoutes.post("/subscribe", async (c) => {
  const userId = c.get("userId")!;
  const body = await c.req.json().catch(() => ({}));
  const parsed = pushSubscribeSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid subscription", 400);
  }

  const { endpoint, keys } = parsed.data;
  const db = createDatabase(c.env.DB);

  const existing = await listPushSubscriptions(db, userId);
  const duplicate = existing.find((s) => s.endpoint === endpoint);
  if (duplicate) {
    return json({ success: true, data: duplicate });
  }

  const count = await countActiveSubscriptions(db, userId);
  if (count >= PUSH_MAX_SUBSCRIPTIONS_PER_USER) {
    return errorResponse(
      `Subscription limit reached (${PUSH_MAX_SUBSCRIPTIONS_PER_USER} max)`,
      403
    );
  }

  const userAgent = c.req.header("User-Agent") ?? null;

  const subscription = await createPushSubscription(db, {
    userId,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    userAgent,
  });

  return json({ success: true, data: subscription }, 201);
});

pushRoutes.delete("/subscribe", async (c) => {
  const userId = c.get("userId")!;
  const body = await c.req.json().catch(() => ({}));
  const db = createDatabase(c.env.DB);

  if (body.endpoint) {
    await deactivatePushSubscriptionByEndpoint(db, body.endpoint, userId);
  } else if (body.subscriptionId) {
    await deactivatePushSubscription(db, body.subscriptionId, userId);
  } else {
    return errorResponse("Provide 'endpoint' or 'subscriptionId'", 400);
  }

  return json({ success: true, message: "Unsubscribed" });
});

pushRoutes.get("/subscriptions", async (c) => {
  const userId = c.get("userId")!;
  const db = createDatabase(c.env.DB);
  const subscriptions = await listPushSubscriptions(db, userId);

  return json({ success: true, data: subscriptions });
});

pushRoutes.get("/vapid-public-key", async (c) => {
  const key = c.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return errorResponse("VAPID public key not configured", 503);
  }
  return json({ success: true, data: { publicKey: key } });
});
