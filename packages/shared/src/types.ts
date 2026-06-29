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

export interface ApiKeyWithSecret extends ApiKey {
  key: string;
}

export interface Webhook {
  id: string;
  userId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: string;
  status: "pending" | "delivered" | "failed";
  responseCode: number | null;
  responseBody: string | null;
  attempts: number;
  createdAt: number;
}

export interface ApiLog {
  id: string;
  apiKeyId: string | null;
  userId: string | null;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  requestId: string | null;
  createdAt: number;
}

export type WebhookEvent =
  | "inbox.created"
  | "inbox.deleted"
  | "message.received"
  | "message.deleted";

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

export interface PushSubscription {
  id: string;
  endpoint: string;
  createdAt: number;
  isActive: boolean;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  notifyOnNewMessage: boolean;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  timestamp: number;
}
