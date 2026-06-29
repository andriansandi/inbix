import { eq, and, desc, count } from "drizzle-orm";
import * as schema from "../schema";
import type { Database } from "./index";
import { generateId } from "@inbix/shared";

export async function createWebhook(
  db: Database,
  data: {
    userId: string;
    url: string;
    events: string[];
    secret: string;
  }
) {
  const id = `wh_${generateId(16)}`;
  const createdAt = Date.now();
  await db.insert(schema.webhooks).values({
    id,
    userId: data.userId,
    url: data.url,
    events: JSON.stringify(data.events),
    secret: data.secret,
    isActive: true,
    createdAt,
  });
  return {
    id,
    userId: data.userId,
    url: data.url,
    events: data.events,
    secret: data.secret,
    isActive: true,
    createdAt,
  };
}

export async function listWebhooks(db: Database, userId: string) {
  const rows = await db
    .select()
    .from(schema.webhooks)
    .where(and(eq(schema.webhooks.userId, userId), eq(schema.webhooks.isActive, true)))
    .orderBy(desc(schema.webhooks.createdAt));

  return rows.map((r) => ({
    ...r,
    events: JSON.parse(r.events) as string[],
  }));
}

export async function getWebhook(db: Database, id: string, userId: string) {
  const result = await db
    .select()
    .from(schema.webhooks)
    .where(and(eq(schema.webhooks.id, id), eq(schema.webhooks.userId, userId)))
    .limit(1);

  if (!result[0]) return null;
  return { ...result[0], events: JSON.parse(result[0].events) as string[] };
}

export async function deleteWebhook(db: Database, id: string, userId: string) {
  await db
    .update(schema.webhooks)
    .set({ isActive: false })
    .where(and(eq(schema.webhooks.id, id), eq(schema.webhooks.userId, userId)));
}

export async function listWebhooksForEvent(
  db: Database,
  userId: string,
  event: string
) {
  const rows = await db
    .select()
    .from(schema.webhooks)
    .where(and(eq(schema.webhooks.userId, userId), eq(schema.webhooks.isActive, true)));

  return rows
    .map((r) => ({ ...r, events: JSON.parse(r.events) as string[] }))
    .filter((w) => w.events.includes(event));
}

export async function createWebhookDelivery(
  db: Database,
  data: {
    webhookId: string;
    event: string;
    payload: string;
    status: "pending" | "delivered" | "failed";
    responseCode?: number | null;
    responseBody?: string | null;
    attempts?: number;
  }
) {
  const id = `whd_${generateId(16)}`;
  const createdAt = Date.now();
  await db.insert(schema.webhookDeliveries).values({
    id,
    webhookId: data.webhookId,
    event: data.event,
    payload: data.payload,
    status: data.status,
    responseCode: data.responseCode ?? null,
    responseBody: data.responseBody ?? null,
    attempts: data.attempts ?? 1,
    createdAt,
  });
  return { id, ...data, responseCode: data.responseCode ?? null, responseBody: data.responseBody ?? null, attempts: data.attempts ?? 1, createdAt };
}

export async function listWebhookDeliveries(
  db: Database,
  webhookId: string,
  page: number,
  pageSize: number
) {
  const offset = (page - 1) * pageSize;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(schema.webhookDeliveries)
      .where(eq(schema.webhookDeliveries.webhookId, webhookId))
      .orderBy(desc(schema.webhookDeliveries.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(schema.webhookDeliveries)
      .where(eq(schema.webhookDeliveries.webhookId, webhookId)),
  ]);
  return { rows, total };
}

export async function createApiLog(
  db: Database,
  data: {
    apiKeyId?: string | null;
    userId?: string | null;
    method: string;
    path: string;
    status: number;
    durationMs: number;
    requestId?: string | null;
  }
) {
  const id = `log_${generateId(16)}`;
  const createdAt = Date.now();
  await db.insert(schema.apiLogs).values({
    id,
    apiKeyId: data.apiKeyId ?? null,
    userId: data.userId ?? null,
    method: data.method,
    path: data.path,
    status: data.status,
    durationMs: data.durationMs,
    requestId: data.requestId ?? null,
    createdAt,
  });
  return { id, ...data, apiKeyId: data.apiKeyId ?? null, userId: data.userId ?? null, requestId: data.requestId ?? null, createdAt };
}

export async function listApiLogs(
  db: Database,
  userId: string,
  page: number,
  pageSize: number
) {
  const offset = (page - 1) * pageSize;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(schema.apiLogs)
      .where(eq(schema.apiLogs.userId, userId))
      .orderBy(desc(schema.apiLogs.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(schema.apiLogs)
      .where(eq(schema.apiLogs.userId, userId)),
  ]);
  return { rows, total };
}
