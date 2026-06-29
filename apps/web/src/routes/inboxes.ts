import { Hono } from "hono";
import type { HonoEnv } from "../lib/env";
import {
  json,
  errorResponse,
  createInboxSchema,
  paginationSchema,
  ANONYMOUS_INBOX_TTL_SECONDS,
  AUTHENTICATED_INBOX_TTL_SECONDS,
  FREE_TIER_INBOX_LIMIT,
  API_KEY_INBOX_LIMIT,
  generateId,
} from "@inbix/shared";
import {
  createDatabase,
  createInbox,
  getInbox,
  listInboxes,
  countInboxesByUser,
  deleteInbox,
  getDefaultDomain,
  listMessages,
} from "@inbix/database";
import { streamSSE } from "hono/streaming";
import { SSE_HEARTBEAT_MS } from "@inbix/shared";
import { triggerWebhooks } from "../lib/webhook";

export const inboxRoutes = new Hono<HonoEnv>();

inboxRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = createInboxSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const { domain, ttlSeconds } = parsed.data;
  const userId = c.get("userId");
  const authMethod = c.get("authMethod");
  const db = createDatabase(c.env.DB);

  if (userId) {
    const userInboxCount = await countInboxesByUser(db, userId);
    const limit = authMethod === "apikey" ? API_KEY_INBOX_LIMIT : FREE_TIER_INBOX_LIMIT;
    if (userInboxCount >= limit) {
      return errorResponse(
        `Inbox limit reached (${limit === Infinity ? "unlimited" : limit} max)`,
        403
      );
    }
  }

  let targetDomain = domain;

  if (!targetDomain) {
    const defaultDomain = await getDefaultDomain(db);
    targetDomain = defaultDomain?.domain ?? c.env.APP_DOMAIN ?? "example.com";
  }

  const ttl = ttlSeconds ?? (userId ? AUTHENTICATED_INBOX_TTL_SECONDS : ANONYMOUS_INBOX_TTL_SECONDS);
  const localPart = generateId(10);
  const emailAddress = `${localPart}@${targetDomain}`;
  const expiresAt = Date.now() + ttl * 1000;

  const inbox = await createInbox(db, emailAddress, targetDomain, expiresAt, userId);

  await c.env.CACHE.put(
    `inbox:${emailAddress}`,
    inbox.id,
    { expirationTtl: ttl }
  );

  if (userId) {
    c.executionCtx.waitUntil(
      triggerWebhooks(c.env, userId, "inbox.created", inbox).catch(() => {})
    );
  }

  return json({ success: true, data: inbox }, 201);
});

inboxRoutes.get("/", async (c) => {
  const query = paginationSchema.safeParse(c.req.query());

  if (!query.success) {
    return errorResponse("Invalid pagination parameters", 400);
  }

  const userId = c.get("userId");
  const db = createDatabase(c.env.DB);
  const { rows, total } = await listInboxes(db, query.data.page, query.data.pageSize, userId);
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

inboxRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDatabase(c.env.DB);
  const inbox = await getInbox(db, id);

  if (!inbox || !inbox.isActive) {
    return errorResponse("Inbox not found", 404);
  }

  if (inbox.expiresAt < Date.now()) {
    await deleteInbox(db, id);
    return errorResponse("Inbox has expired", 410);
  }

  return json({ success: true, data: inbox });
});

inboxRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.get("userId");
  const db = createDatabase(c.env.DB);
  const inbox = await getInbox(db, id);

  if (!inbox) {
    return errorResponse("Inbox not found", 404);
  }

  await deleteInbox(db, id);
  await c.env.CACHE.delete(`inbox:${inbox.emailAddress}`);

  if (userId) {
    c.executionCtx.waitUntil(
      triggerWebhooks(c.env, userId, "inbox.deleted", { id: inbox.id, emailAddress: inbox.emailAddress }).catch(() => {})
    );
  }

  return json({ success: true, message: "Inbox deleted" });
});

inboxRoutes.get("/:id/messages", async (c) => {
  const id = c.req.param("id");
  const query = paginationSchema.safeParse(c.req.query());

  if (!query.success) {
    return errorResponse("Invalid pagination parameters", 400);
  }

  const db = createDatabase(c.env.DB);
  const inbox = await getInbox(db, id);

  if (!inbox || !inbox.isActive) {
    return errorResponse("Inbox not found", 404);
  }

  const { rows, total } = await listMessages(db, id, query.data.page, query.data.pageSize);
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

inboxRoutes.get("/:id/events", (c) => {
  const id = c.req.param("id");

  return streamSSE(c, async (stream) => {
    const db = createDatabase(c.env.DB);
    const inbox = await getInbox(db, id);

    if (!inbox || !inbox.isActive) {
      await stream.writeSSE({ event: "error", data: "Inbox not found" });
      return;
    }

    let lastCheck = Date.now();
    const seenIds = new Set<string>();

    const interval = setInterval(async () => {
      try {
        const { rows } = await listMessages(db, id, 1, 50);
        for (const msg of rows) {
          if (!seenIds.has(msg.id) && msg.receivedAt > lastCheck) {
            seenIds.add(msg.id);
            await stream.writeSSE({
              event: "message",
              data: JSON.stringify(msg),
            });
          }
        }
        lastCheck = Date.now();

        if (inbox.expiresAt < Date.now()) {
          await stream.writeSSE({ event: "inbox_expired", data: id });
          clearInterval(interval);
          return;
        }

        await stream.writeSSE({ event: "heartbeat", data: String(Date.now()) });
      } catch {
        // ignore errors during polling
      }
    }, SSE_HEARTBEAT_MS);

    stream.onAbort(() => {
      clearInterval(interval);
    });
  });
});
