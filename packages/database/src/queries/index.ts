import { eq, desc, lt, and, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";
import { generateInboxId, generateMessageId } from "@inbix/shared";

export type Database = ReturnType<typeof createDatabase>;

export function createDatabase(d1: D1Database) {
  return drizzle(d1, { schema });
}

export async function createInbox(
  db: Database,
  emailAddress: string,
  domain: string,
  expiresAt: number
) {
  const id = generateInboxId();
  const createdAt = Date.now();
  await db.insert(schema.inboxes).values({
    id,
    emailAddress,
    domain,
    createdAt,
    expiresAt,
    isActive: true,
  });
  return { id, emailAddress, domain, createdAt, expiresAt, isActive: true };
}

export async function getInbox(db: Database, id: string) {
  const result = await db
    .select()
    .from(schema.inboxes)
    .where(eq(schema.inboxes.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getInboxByEmail(db: Database, emailAddress: string) {
  const result = await db
    .select()
    .from(schema.inboxes)
    .where(eq(schema.inboxes.emailAddress, emailAddress))
    .limit(1);
  return result[0] ?? null;
}

export async function listInboxes(
  db: Database,
  page: number,
  pageSize: number
) {
  const offset = (page - 1) * pageSize;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(schema.inboxes)
      .where(eq(schema.inboxes.isActive, true))
      .orderBy(desc(schema.inboxes.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(schema.inboxes)
      .where(eq(schema.inboxes.isActive, true)),
  ]);
  return { rows, total };
}

export async function deleteInbox(db: Database, id: string) {
  await db
    .update(schema.inboxes)
    .set({ isActive: false })
    .where(eq(schema.inboxes.id, id));
}

export async function hardDeleteInbox(db: Database, id: string) {
  await db.delete(schema.inboxes).where(eq(schema.inboxes.id, id));
}

export async function getExpiredInboxIds(db: Database, before: number) {
  const result = await db
    .select({ id: schema.inboxes.id })
    .from(schema.inboxes)
    .where(
      and(
        lt(schema.inboxes.expiresAt, before),
        eq(schema.inboxes.isActive, true)
      )
    );
  return result.map((r) => r.id);
}

export async function createMessage(
  db: Database,
  data: {
    inboxId: string;
    fromAddress: string;
    fromName: string | null;
    toAddress: string;
    subject: string | null;
    textContent: string | null;
    htmlContent: string | null;
    rawHeaders: string | null;
    size: number;
    hasAttachments: boolean;
  }
) {
  const id = generateMessageId();
  const receivedAt = Date.now();
  await db.insert(schema.messages).values({
    id,
    ...data,
    isRead: false,
    receivedAt,
  });
  return { id, ...data, isRead: false, receivedAt };
}

export async function getMessage(db: Database, id: string) {
  const result = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function listMessages(
  db: Database,
  inboxId: string,
  page: number,
  pageSize: number
) {
  const offset = (page - 1) * pageSize;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.inboxId, inboxId))
      .orderBy(desc(schema.messages.receivedAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(schema.messages)
      .where(eq(schema.messages.inboxId, inboxId)),
  ]);
  return { rows, total };
}

export async function markMessageRead(db: Database, id: string) {
  await db
    .update(schema.messages)
    .set({ isRead: true })
    .where(eq(schema.messages.id, id));
}

export async function deleteMessage(db: Database, id: string) {
  await db.delete(schema.messages).where(eq(schema.messages.id, id));
}

export async function getMessageIdsByInbox(db: Database, inboxId: string) {
  const result = await db
    .select({ id: schema.messages.id })
    .from(schema.messages)
    .where(eq(schema.messages.inboxId, inboxId));
  return result.map((r) => r.id);
}

export async function createAttachment(
  db: Database,
  data: {
    messageId: string;
    filename: string;
    contentType: string;
    size: number;
    contentId: string | null;
    r2Key: string;
  }
) {
  const id = generateInboxId();
  const createdAt = Date.now();
  await db.insert(schema.attachments).values({
    id,
    ...data,
    createdAt,
  });
  return { id, ...data, createdAt };
}

export async function getAttachment(db: Database, id: string) {
  const result = await db
    .select()
    .from(schema.attachments)
    .where(eq(schema.attachments.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function listAttachmentsByMessage(db: Database, messageId: string) {
  return db
    .select()
    .from(schema.attachments)
    .where(eq(schema.attachments.messageId, messageId));
}

export async function getAttachmentIdsByMessage(db: Database, messageId: string) {
  const result = await db
    .select({ id: schema.attachments.id, r2Key: schema.attachments.r2Key })
    .from(schema.attachments)
    .where(eq(schema.attachments.messageId, messageId));
  return result;
}

export async function getDefaultDomain(db: Database) {
  const result = await db
    .select()
    .from(schema.domains)
    .where(eq(schema.domains.isDefault, true))
    .limit(1);
  return result[0] ?? null;
}

export async function listDomains(db: Database) {
  return db.select().from(schema.domains).orderBy(desc(schema.domains.createdAt));
}

export async function addDomain(
  db: Database,
  domain: string,
  isDefault: boolean
) {
  const id = generateInboxId();
  const createdAt = Date.now();
  if (isDefault) {
    await db
      .update(schema.domains)
      .set({ isDefault: false })
      .where(eq(schema.domains.isDefault, true));
  }
  await db.insert(schema.domains).values({
    id,
    domain,
    isDefault,
    isVerified: false,
    createdAt,
  });
  return { id, domain, isDefault, isVerified: false, createdAt };
}

export async function createApiKey(
  db: Database,
  name: string,
  keyHash: string,
  prefix: string
) {
  const id = generateInboxId();
  const createdAt = Date.now();
  await db.insert(schema.apiKeys).values({
    id,
    name,
    keyHash,
    prefix,
    createdAt,
    isActive: true,
  });
  return { id, name, prefix, createdAt, lastUsedAt: null, isActive: true };
}

export async function getApiKeyByHash(db: Database, keyHash: string) {
  const result = await db
    .select()
    .from(schema.apiKeys)
    .where(and(eq(schema.apiKeys.keyHash, keyHash), eq(schema.apiKeys.isActive, true)))
    .limit(1);
  return result[0] ?? null;
}

export async function updateApiKeyLastUsed(db: Database, id: string) {
  await db
    .update(schema.apiKeys)
    .set({ lastUsedAt: Date.now() })
    .where(eq(schema.apiKeys.id, id));
}

export async function listApiKeys(db: Database) {
  return db
    .select({
      id: schema.apiKeys.id,
      name: schema.apiKeys.name,
      prefix: schema.apiKeys.prefix,
      createdAt: schema.apiKeys.createdAt,
      lastUsedAt: schema.apiKeys.lastUsedAt,
      isActive: schema.apiKeys.isActive,
    })
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.isActive, true))
    .orderBy(desc(schema.apiKeys.createdAt));
}

export async function revokeApiKey(db: Database, id: string) {
  await db
    .update(schema.apiKeys)
    .set({ isActive: false })
    .where(eq(schema.apiKeys.id, id));
}

export async function getStats(db: Database) {
  const [inboxCount, messageCount, attachmentCount] = await Promise.all([
    db
      .select({ total: count() })
      .from(schema.inboxes)
      .where(eq(schema.inboxes.isActive, true)),
    db.select({ total: count() }).from(schema.messages),
    db.select({ total: count() }).from(schema.attachments),
  ]);
  return {
    inboxes: inboxCount[0]?.total ?? 0,
    messages: messageCount[0]?.total ?? 0,
    attachments: attachmentCount[0]?.total ?? 0,
  };
}
