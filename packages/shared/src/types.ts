export interface Inbox {
  id: string;
  emailAddress: string;
  createdAt: number;
  expiresAt: number;
}

export interface MessageSummary {
  id: string;
  inboxId: string;
  fromAddress: string;
  fromName: string | null;
  subject: string | null;
  hasAttachments: boolean;
  size: number;
  receivedAt: number;
  isRead: boolean;
}

export interface Message extends MessageSummary {
  textContent: string | null;
  htmlContent: string | null;
  rawHeaders: string | null;
}

export interface Attachment {
  id: string;
  messageId: string;
  filename: string;
  contentType: string;
  size: number;
  contentId: string | null;
  r2Key: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: number;
  lastUsedAt: number | null;
}

export interface Domain {
  id: string;
  domain: string;
  isDefault: boolean;
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "user";
  createdAt: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateInboxOptions {
  domain?: string;
  ttlSeconds?: number;
}

export interface SSEEvent {
  type: "message" | "inbox_expired" | "heartbeat";
  data: unknown;
}

export type HonoEnv = {
  Bindings: {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    CACHE: KVNamespace;
    ASSETS: Fetcher;
    ENVIRONMENT: string;
    APP_DOMAIN: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_KV: KVNamespace;
  };
  Variables: {
    requestId: string;
  };
};

export type EmailEnv = {
  Bindings: {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    CACHE: KVNamespace;
    APP_DOMAIN: string;
  };
};
