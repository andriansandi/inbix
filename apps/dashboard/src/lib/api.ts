import type {
  Inbox,
  MessageSummary,
  Message,
  Attachment,
  PaginatedResponse,
  PushSubscription,
  NotificationPreferences,
} from "@inbix/shared";
import { getAuthToken } from "./authToken";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }

  return data.data;
}

export const api = {
  createInbox: (options?: { domain?: string; ttlSeconds?: number }) =>
    request<Inbox>("POST", "/api/inboxes", options),

  getInbox: (id: string) =>
    request<Inbox>("GET", `/api/inboxes/${id}`),

  listInboxes: (page = 1, pageSize = 20) =>
    request<PaginatedResponse<Inbox>>("GET", `/api/inboxes?page=${page}&pageSize=${pageSize}`),

  deleteInbox: (id: string) =>
    request<void>("DELETE", `/api/inboxes/${id}`),

  listMessages: (inboxId: string, page = 1, pageSize = 50) =>
    request<PaginatedResponse<MessageSummary>>("GET", `/api/inboxes/${inboxId}/messages?page=${page}&pageSize=${pageSize}`),

  getMessage: (id: string) =>
    request<Message>("GET", `/api/messages/${id}`),

  getMessageHtmlUrl: (id: string) =>
    `${API_BASE}/api/messages/${id}/html`,

  deleteMessage: (id: string) =>
    request<void>("DELETE", `/api/messages/${id}`),

  listAttachments: (messageId: string) =>
    request<Attachment[]>("GET", `/api/messages/${messageId}/attachments`),

  getAttachmentUrl: (messageId: string, attachmentId: string) =>
    `${API_BASE}/api/messages/${messageId}/attachments/${attachmentId}`,

  getVapidPublicKey: () =>
    request<{ publicKey: string }>("GET", "/api/push/vapid-public-key"),

  pushSubscribe: (subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
    request<PushSubscription>("POST", "/api/push/subscribe", subscription),

  pushUnsubscribe: (endpoint: string) =>
    request<void>("DELETE", "/api/push/subscribe", { endpoint }),

  getPushSubscriptions: () =>
    request<PushSubscription[]>("GET", "/api/push/subscriptions"),

  getNotificationPreferences: () =>
    request<NotificationPreferences>("GET", "/api/notifications/preferences"),

  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) =>
    request<NotificationPreferences>("PATCH", "/api/notifications/preferences", prefs),

  sendTestNotification: () =>
    request<{ sent: number; failed: number; results: unknown[] }>("POST", "/api/notifications/test"),
};
