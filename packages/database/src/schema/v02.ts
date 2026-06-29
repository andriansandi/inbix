import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const webhooks = sqliteTable("webhooks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  url: text("url").notNull(),
  events: text("events").notNull(),
  secret: text("secret").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull(),
});

export const webhookDeliveries = sqliteTable("webhook_deliveries", {
  id: text("id").primaryKey(),
  webhookId: text("webhook_id")
    .notNull()
    .references(() => webhooks.id, { onDelete: "cascade" }),
  event: text("event").notNull(),
  payload: text("payload").notNull(),
  status: text("status", { enum: ["pending", "delivered", "failed"] }).notNull().default("pending"),
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export const apiLogs = sqliteTable("api_logs", {
  id: text("id").primaryKey(),
  apiKeyId: text("api_key_id"),
  userId: text("user_id"),
  method: text("method").notNull(),
  path: text("path").notNull(),
  status: integer("status").notNull(),
  durationMs: integer("duration_ms").notNull(),
  requestId: text("request_id"),
  createdAt: integer("created_at").notNull(),
});
