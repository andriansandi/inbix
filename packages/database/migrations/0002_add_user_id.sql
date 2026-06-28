-- Add user_id column to inboxes and api_keys tables
-- user_id is nullable: null for anonymous inboxes, Clerk user ID for authenticated users

ALTER TABLE inboxes ADD COLUMN user_id text;
ALTER TABLE api_keys ADD COLUMN user_id text;

CREATE INDEX IF NOT EXISTS idx_inboxes_user ON inboxes(user_id);
