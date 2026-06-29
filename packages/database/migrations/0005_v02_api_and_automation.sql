-- v0.2 API & Automation tables (webhooks, webhook deliveries, API logs)
-- Idempotent CREATE TABLE IF NOT EXISTS for safe re-application.

CREATE TABLE IF NOT EXISTS `webhooks` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `url` text NOT NULL,
  `events` text NOT NULL,
  `secret` text NOT NULL,
  `is_active` integer NOT NULL DEFAULT true,
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `webhook_deliveries` (
  `id` text PRIMARY KEY NOT NULL,
  `webhook_id` text NOT NULL REFERENCES webhooks(`id`) ON DELETE CASCADE,
  `event` text NOT NULL,
  `payload` text NOT NULL,
  `status` text NOT NULL DEFAULT 'pending',
  `response_code` integer,
  `response_body` text,
  `attempts` integer NOT NULL DEFAULT 0,
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `api_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `api_key_id` text,
  `user_id` text,
  `method` text NOT NULL,
  `path` text NOT NULL,
  `status` integer NOT NULL,
  `duration_ms` integer NOT NULL,
  `request_id` text,
  `created_at` integer NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_webhooks_user` ON `webhooks` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_webhooks_active` ON `webhooks` (`is_active`);
CREATE INDEX IF NOT EXISTS `idx_webhook_deliveries_webhook` ON `webhook_deliveries` (`webhook_id`);
CREATE INDEX IF NOT EXISTS `idx_webhook_deliveries_status` ON `webhook_deliveries` (`status`);
CREATE INDEX IF NOT EXISTS `idx_api_logs_api_key` ON `api_logs` (`api_key_id`);
CREATE INDEX IF NOT EXISTS `idx_api_logs_user` ON `api_logs` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_api_logs_created` ON `api_logs` (`created_at`);
