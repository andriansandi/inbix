import { Hono } from "hono";
import type { HonoEnv } from "../lib/env";
import { requireAuth } from "../middleware/auth";
import {
  json,
  errorResponse,
  createWebhookSchema,
  paginationSchema,
  generateWebhookSecret,
  WEBHOOK_MAX_PER_USER,
} from "@inbix/shared";
import {
  createDatabase,
  createWebhook,
  listWebhooks,
  getWebhook,
  deleteWebhook,
  listWebhookDeliveries,
} from "@inbix/database";
import { deliverWebhook } from "../lib/webhook";

export const webhookRoutes = new Hono<HonoEnv>();

webhookRoutes.use("*", requireAuth);

webhookRoutes.post("/", async (c) => {
  const userId = c.get("userId")!;
  const body = await c.req.json().catch(() => ({}));
  const parsed = createWebhookSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const db = createDatabase(c.env.DB);
  const existing = await listWebhooks(db, userId);
  if (existing.length >= WEBHOOK_MAX_PER_USER) {
    return errorResponse(
      `Webhook limit reached (${WEBHOOK_MAX_PER_USER} max)`,
      403
    );
  }

  const secret = generateWebhookSecret();
  const webhook = await createWebhook(db, {
    userId,
    url: parsed.data.url,
    events: parsed.data.events,
    secret,
  });

  return json({ success: true, data: webhook }, 201);
});

webhookRoutes.get("/", async (c) => {
  const userId = c.get("userId")!;
  const db = createDatabase(c.env.DB);
  const webhooks = await listWebhooks(db, userId);

  return json({ success: true, data: webhooks });
});

webhookRoutes.get("/:id", async (c) => {
  const userId = c.get("userId")!;
  const id = c.req.param("id");
  const db = createDatabase(c.env.DB);
  const webhook = await getWebhook(db, id, userId);

  if (!webhook) {
    return errorResponse("Webhook not found", 404);
  }

  return json({ success: true, data: webhook });
});

webhookRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId")!;
  const id = c.req.param("id");
  const db = createDatabase(c.env.DB);
  const webhook = await getWebhook(db, id, userId);

  if (!webhook) {
    return errorResponse("Webhook not found", 404);
  }

  await deleteWebhook(db, id, userId);
  return json({ success: true, message: "Webhook deleted" });
});

webhookRoutes.get("/:id/deliveries", async (c) => {
  const userId = c.get("userId")!;
  const id = c.req.param("id");
  const query = paginationSchema.safeParse(c.req.query());

  if (!query.success) {
    return errorResponse("Invalid pagination parameters", 400);
  }

  const db = createDatabase(c.env.DB);
  const webhook = await getWebhook(db, id, userId);

  if (!webhook) {
    return errorResponse("Webhook not found", 404);
  }

  const { rows, total } = await listWebhookDeliveries(
    db,
    id,
    query.data.page,
    query.data.pageSize
  );
  const totalPages = Math.ceil(total / query.data.pageSize);

  return json({
    success: true,
    data: {
      data: rows,
      pagination: {
        page: query.data.page,
        pageSize: query.data.pageSize,
        total,
        totalPages,
      },
    },
  });
});

webhookRoutes.post("/:id/test", async (c) => {
  const userId = c.get("userId")!;
  const id = c.req.param("id");
  const db = createDatabase(c.env.DB);
  const webhook = await getWebhook(db, id, userId);

  if (!webhook) {
    return errorResponse("Webhook not found", 404);
  }

  await deliverWebhook(
    db,
    { id: webhook.id, url: webhook.url, secret: webhook.secret },
    "webhook.test",
    { message: "This is a test webhook delivery from Inbix." }
  );

  return json({ success: true, message: "Test webhook delivered" });
});
