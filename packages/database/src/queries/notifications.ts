import { eq, and, desc, count } from "drizzle-orm";
import * as schema from "../schema";
import type { Database } from "./index";
import { generateId } from "@inbix/shared";

export async function createPushSubscription(
  db: Database,
  data: {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string | null;
  }
) {
  const id = `sub_${generateId(16)}`;
  const createdAt = Date.now();
  await db.insert(schema.pushSubscriptions).values({
    id,
    userId: data.userId,
    endpoint: data.endpoint,
    p256dh: data.p256dh,
    auth: data.auth,
    userAgent: data.userAgent ?? null,
    createdAt,
    isActive: true,
  });
  return { id, ...data, userAgent: data.userAgent ?? null, createdAt, isActive: true };
}

export async function listPushSubscriptions(db: Database, userId: string) {
  return db
    .select()
    .from(schema.pushSubscriptions)
    .where(and(eq(schema.pushSubscriptions.userId, userId), eq(schema.pushSubscriptions.isActive, true)))
    .orderBy(desc(schema.pushSubscriptions.createdAt));
}

export async function listAllPushSubscriptionsByInboxUserId(
  db: Database,
  userId: string
) {
  return db
    .select()
    .from(schema.pushSubscriptions)
    .where(and(eq(schema.pushSubscriptions.userId, userId), eq(schema.pushSubscriptions.isActive, true)));
}

export async function deactivatePushSubscription(db: Database, id: string, userId: string) {
  await db
    .update(schema.pushSubscriptions)
    .set({ isActive: false })
    .where(and(eq(schema.pushSubscriptions.id, id), eq(schema.pushSubscriptions.userId, userId)));
}

export async function deactivatePushSubscriptionByEndpoint(
  db: Database,
  endpoint: string,
  userId: string
) {
  await db
    .update(schema.pushSubscriptions)
    .set({ isActive: false })
    .where(and(eq(schema.pushSubscriptions.endpoint, endpoint), eq(schema.pushSubscriptions.userId, userId)));
}

export async function getNotificationPreferences(db: Database, userId: string) {
  const result = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertNotificationPreferences(
  db: Database,
  userId: string,
  data: {
    pushEnabled?: boolean;
    quietHoursStart?: number | null;
    quietHoursEnd?: number | null;
    notifyOnNewMessage?: boolean;
  }
) {
  const existing = await getNotificationPreferences(db, userId);
  const updatedAt = Date.now();

  if (existing) {
    await db
      .update(schema.notificationPreferences)
      .set({ ...data, updatedAt })
      .where(eq(schema.notificationPreferences.userId, userId));
    return { ...existing, ...data, updatedAt };
  }

  const id = `pref_${generateId(12)}`;
  const defaults = {
    pushEnabled: true,
    quietHoursStart: null,
    quietHoursEnd: null,
    notifyOnNewMessage: true,
  };
  await db.insert(schema.notificationPreferences).values({
    id,
    userId,
    ...defaults,
    ...data,
    updatedAt,
  });
  return { id, userId, ...defaults, ...data, updatedAt };
}

export async function createNotificationLog(
  db: Database,
  data: {
    userId: string;
    subscriptionId: string | null;
    messageId: string | null;
    status: "sent" | "failed";
    error?: string | null;
  }
) {
  const id = `log_${generateId(16)}`;
  const createdAt = Date.now();
  await db.insert(schema.notificationLogs).values({
    id,
    ...data,
    error: data.error ?? null,
    createdAt,
  });
  return { id, ...data, error: data.error ?? null, createdAt };
}

export async function countActiveSubscriptions(db: Database, userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(schema.pushSubscriptions)
    .where(and(eq(schema.pushSubscriptions.userId, userId), eq(schema.pushSubscriptions.isActive, true)));
  return total;
}
