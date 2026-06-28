import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: integer("created_at").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const notificationPreferences = sqliteTable("notification_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  pushEnabled: integer("push_enabled", { mode: "boolean" }).notNull().default(true),
  quietHoursStart: integer("quiet_hours_start"),
  quietHoursEnd: integer("quiet_hours_end"),
  notifyOnNewMessage: integer("notify_on_new_message", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at").notNull(),
});

export const notificationLogs = sqliteTable("notification_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  subscriptionId: text("subscription_id"),
  messageId: text("message_id"),
  status: text("status", { enum: ["sent", "failed"] }).notNull(),
  error: text("error"),
  createdAt: integer("created_at").notNull(),
});
