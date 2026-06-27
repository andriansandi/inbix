CREATE TABLE `inboxes` (
  `id` text PRIMARY KEY NOT NULL,
  `email_address` text NOT NULL UNIQUE,
  `domain` text NOT NULL,
  `created_at` integer NOT NULL,
  `expires_at` integer NOT NULL,
  `is_active` integer NOT NULL DEFAULT true
);

CREATE TABLE `messages` (
  `id` text PRIMARY KEY NOT NULL,
  `inbox_id` text NOT NULL REFERENCES inboxes(`id`) ON DELETE CASCADE,
  `from_address` text NOT NULL,
  `from_name` text,
  `to_address` text NOT NULL,
  `subject` text,
  `text_content` text,
  `html_content` text,
  `raw_headers` text,
  `size` integer NOT NULL DEFAULT 0,
  `has_attachments` integer NOT NULL DEFAULT false,
  `is_read` integer NOT NULL DEFAULT false,
  `received_at` integer NOT NULL
);

CREATE TABLE `attachments` (
  `id` text PRIMARY KEY NOT NULL,
  `message_id` text NOT NULL REFERENCES messages(`id`) ON DELETE CASCADE,
  `filename` text NOT NULL,
  `content_type` text NOT NULL,
  `size` integer NOT NULL,
  `content_id` text,
  `r2_key` text NOT NULL,
  `created_at` integer NOT NULL
);

CREATE TABLE `api_keys` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `key_hash` text NOT NULL UNIQUE,
  `prefix` text NOT NULL,
  `created_at` integer NOT NULL,
  `last_used_at` integer,
  `is_active` integer NOT NULL DEFAULT true
);

CREATE TABLE `domains` (
  `id` text PRIMARY KEY NOT NULL,
  `domain` text NOT NULL UNIQUE,
  `is_default` integer NOT NULL DEFAULT false,
  `is_verified` integer NOT NULL DEFAULT false,
  `created_at` integer NOT NULL
);

CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL UNIQUE,
  `role` text NOT NULL DEFAULT 'user',
  `created_at` integer NOT NULL
);

CREATE INDEX `idx_inboxes_email` ON `inboxes` (`email_address`);
CREATE INDEX `idx_inboxes_active` ON `inboxes` (`is_active`);
CREATE INDEX `idx_inboxes_expires` ON `inboxes` (`expires_at`);
CREATE INDEX `idx_messages_inbox` ON `messages` (`inbox_id`);
CREATE INDEX `idx_messages_received` ON `messages` (`received_at`);
CREATE INDEX `idx_attachments_message` ON `attachments` (`message_id`);
CREATE INDEX `idx_api_keys_hash` ON `api_keys` (`key_hash`);
CREATE INDEX `idx_domains_default` ON `domains` (`is_default`);
