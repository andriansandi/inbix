-- Notification Platform tables (v0.4 Phase 1 — Web Push)
-- Idempotent CREATE TABLE IF NOT EXISTS for safe re-application.

CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `endpoint` text NOT NULL,
  `p256dh` text NOT NULL,
  `auth` text NOT NULL,
  `user_agent` text,
  `created_at` integer NOT NULL,
  `is_active` integer NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL UNIQUE,
  `push_enabled` integer NOT NULL DEFAULT true,
  `quiet_hours_start` integer,
  `quiet_hours_end` integer,
  `notify_on_new_message` integer NOT NULL DEFAULT true,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `notification_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `subscription_id` text,
  `message_id` text,
  `status` text NOT NULL DEFAULT 'sent',
  `error` text,
  `created_at` integer NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_push_subs_user` ON `push_subscriptions` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_push_subs_active` ON `push_subscriptions` (`is_active`);
CREATE INDEX IF NOT EXISTS `idx_notif_prefs_user` ON `notification_preferences` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_notif_logs_user` ON `notification_logs` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_notif_logs_message` ON `notification_logs` (`message_id`);
