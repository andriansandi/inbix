import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const inboxes = sqliteTable("inboxes", {
  id: text("id").primaryKey(),
  emailAddress: text("email_address").notNull().unique(),
  domain: text("domain").notNull(),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  inboxId: text("inbox_id")
    .notNull()
    .references(() => inboxes.id, { onDelete: "cascade" }),
  fromAddress: text("from_address").notNull(),
  fromName: text("from_name"),
  toAddress: text("to_address").notNull(),
  subject: text("subject"),
  textContent: text("text_content"),
  htmlContent: text("html_content"),
  rawHeaders: text("raw_headers"),
  size: integer("size").notNull().default(0),
  hasAttachments: integer("has_attachments", { mode: "boolean" }).notNull().default(false),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  receivedAt: integer("received_at").notNull(),
});

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(),
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  contentId: text("content_id"),
  r2Key: text("r2_key").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  prefix: text("prefix").notNull(),
  createdAt: integer("created_at").notNull(),
  lastUsedAt: integer("last_used_at"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const domains = sqliteTable("domains", {
  id: text("id").primaryKey(),
  domain: text("domain").notNull().unique(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  createdAt: integer("created_at").notNull(),
});
