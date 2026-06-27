export const APP_NAME = "Inbix";
export const APP_TAGLINE = "Open Source Cloudflare-native Email API Platform";
export const APP_URL = "https://inbix.xyz";
export const APP_VERSION = "0.1.0";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const DEFAULT_INBOX_TTL_SECONDS = 24 * 60 * 60;
export const MAX_INBOX_TTL_SECONDS = 7 * 24 * 60 * 60;
export const MIN_INBOX_TTL_SECONDS = 60;

export const MAX_MESSAGE_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_MESSAGE = 20;

export const INBOX_ID_LENGTH = 12;
export const MESSAGE_ID_LENGTH = 16;
export const API_KEY_PREFIX = "inbix_";
export const API_KEY_LENGTH = 40;

export const RATE_LIMIT = {
  WINDOW_SECONDS: 60,
  MAX_REQUESTS: 60,
  CREATE_INBOX_MAX: 10,
};

export const ANONYMOUS_INBOX_LIMIT = 1;
export const FREE_TIER_INBOX_LIMIT = 5;

export const SSE_HEARTBEAT_MS = 30_000;
export const SSE_RETRY_MS = 5_000;

export const EXPIRY_CHECK_INTERVAL_MS = 60_000;

export const CORS_ALLOWED_ORIGINS = ["https://inbix.xyz", "http://localhost:5173"];
