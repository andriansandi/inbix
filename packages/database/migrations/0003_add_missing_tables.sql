-- Fix: production D1 was missing tables (domains, attachments, api_keys)
-- and the inboxes.user_id column (migrations 0001/0002 were never applied
-- via drizzle migrator; tables were created ad-hoc and partially).
-- This migration is idempotent for CREATE/INDEX statements.
-- The ALTER TABLE is one-time (safe: user_id confirmed absent in production).

CREATE TABLE IF NOT EXISTS `attachments` (
  `id` text PRIMARY KEY NOT NULL,
  `message_id` text NOT NULL REFERENCES messages(`id`) ON DELETE CASCADE,
  `filename` text NOT NULL,
  `content_type` text NOT NULL,
  `size` integer NOT NULL,
  `content_id` text,
  `r2_key` text NOT NULL,
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `key_hash` text NOT NULL UNIQUE,
  `prefix` text NOT NULL,
  `created_at` integer NOT NULL,
  `last_used_at` integer,
  `is_active` integer NOT NULL DEFAULT true,
  `user_id` text
);

CREATE TABLE IF NOT EXISTS `domains` (
  `id` text PRIMARY KEY NOT NULL,
  `domain` text NOT NULL UNIQUE,
  `is_default` integer NOT NULL DEFAULT false,
  `is_verified` integer NOT NULL DEFAULT false,
  `created_at` integer NOT NULL
);

-- Indexes (idempotent; fills gaps on both existing and new tables)
CREATE INDEX IF NOT EXISTS `idx_inboxes_email` ON `inboxes` (`email_address`);
CREATE INDEX IF NOT EXISTS `idx_inboxes_active` ON `inboxes` (`is_active`);
CREATE INDEX IF NOT EXISTS `idx_inboxes_expires` ON `inboxes` (`expires_at`);
CREATE INDEX IF NOT EXISTS `idx_messages_inbox` ON `messages` (`inbox_id`);
CREATE INDEX IF NOT EXISTS `idx_messages_received` ON `messages` (`received_at`);
CREATE INDEX IF NOT EXISTS `idx_attachments_message` ON `attachments` (`message_id`);
CREATE INDEX IF NOT EXISTS `idx_api_keys_hash` ON `api_keys` (`key_hash`);
CREATE INDEX IF NOT EXISTS `idx_domains_default` ON `domains` (`is_default`);

-- Add user_id to inboxes (migration 0002 was not applied to production)
ALTER TABLE `inboxes` ADD COLUMN `user_id` text;
CREATE INDEX IF NOT EXISTS `idx_inboxes_user` ON `inboxes` (`user_id`);

-- Seed default domain so getDefaultDomain returns a row
INSERT OR IGNORE INTO `domains` (`id`, `domain`, `is_default`, `is_verified`, `created_at`)
VALUES ('domain_inbix_xyz', 'inbix.xyz', 1, 1, strftime('%s', 'now') * 1000);
