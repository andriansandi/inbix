import type {
  Inbox,
  Message,
  MessageSummary,
  Attachment,
  ApiKey,
  ApiKeyWithSecret,
  Webhook,
  WebhookDelivery,
  ApiLog,
  Domain,
  PaginatedResponse,
  ApiResponse,
  CreateInboxOptions,
} from "@inbix/shared";

export type {
  Inbox,
  Message,
  MessageSummary,
  Attachment,
  ApiKey,
  ApiKeyWithSecret,
  Webhook,
  WebhookDelivery,
  ApiLog,
  Domain,
  PaginatedResponse,
  ApiResponse,
  CreateInboxOptions,
};

export type WebhookEvent =
  | "inbox.created"
  | "inbox.deleted"
  | "message.received"
  | "message.deleted";

export class InbixError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "InbixError";
  }
}

export interface InbixClientOptions {
  baseUrl: string;
  apiKey?: string;
  token?: string;
  fetch?: typeof fetch;
}

export class InbixClient {
  private baseUrl: string;
  private apiKey?: string;
  private token?: string;
  private fetchFn: typeof fetch;

  constructor(options: InbixClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.token = options.token;
    this.fetchFn = options.fetch ?? fetch;
  }

  private getAuthHeader(): string | undefined {
    if (this.apiKey) return `Bearer ${this.apiKey}`;
    if (this.token) return `Bearer ${this.token}`;
    return undefined;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const auth = this.getAuthHeader();
    if (auth) headers["Authorization"] = auth;

    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json() as ApiResponse<T>;

    if (!response.ok || !data.success) {
      throw new InbixError(
        data.error ?? `Request failed with status ${response.status}`,
        response.status
      );
    }

    return data.data as T;
  }

  async createInbox(options?: CreateInboxOptions): Promise<Inbox> {
    return this.request<Inbox>("POST", "/api/inboxes", options);
  }

  async getInbox(id: string): Promise<Inbox> {
    return this.request<Inbox>("GET", `/api/inboxes/${id}`);
  }

  async listInboxes(page = 1, pageSize = 20): Promise<PaginatedResponse<Inbox>> {
    return this.request<PaginatedResponse<Inbox>>(
      "GET",
      `/api/inboxes?page=${page}&pageSize=${pageSize}`
    );
  }

  async deleteInbox(id: string): Promise<void> {
    await this.request<void>("DELETE", `/api/inboxes/${id}`);
  }

  async listMessages(inboxId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<MessageSummary>> {
    return this.request<PaginatedResponse<MessageSummary>>(
      "GET",
      `/api/inboxes/${inboxId}/messages?page=${page}&pageSize=${pageSize}`
    );
  }

  async getMessage(id: string): Promise<Message> {
    return this.request<Message>("GET", `/api/messages/${id}`);
  }

  async getMessageHtml(id: string): Promise<string> {
    const headers: Record<string, string> = {};
    const auth = this.getAuthHeader();
    if (auth) headers["Authorization"] = auth;

    const response = await this.fetchFn(`${this.baseUrl}/api/messages/${id}/html`, {
      headers,
    });
    if (!response.ok) {
      throw new InbixError(`Failed to fetch HTML`, response.status);
    }
    return response.text();
  }

  async deleteMessage(id: string): Promise<void> {
    await this.request<void>("DELETE", `/api/messages/${id}`);
  }

  async listAttachments(messageId: string): Promise<Attachment[]> {
    return this.request<Attachment[]>("GET", `/api/messages/${messageId}/attachments`);
  }

  async downloadAttachment(messageId: string, attachmentId: string): Promise<Blob> {
    const headers: Record<string, string> = {};
    const auth = this.getAuthHeader();
    if (auth) headers["Authorization"] = auth;

    const response = await this.fetchFn(
      `${this.baseUrl}/api/messages/${messageId}/attachments/${attachmentId}`,
      { headers }
    );
    if (!response.ok) {
      throw new InbixError(`Failed to download attachment`, response.status);
    }
    return response.blob();
  }

  async listDomains(): Promise<Domain[]> {
    return this.request<Domain[]>("GET", "/api/domains");
  }

  subscribeToInbox(
    inboxId: string,
    onMessage: (message: MessageSummary) => void,
    onError?: (error: Event) => void
  ): () => void {
    const url = `${this.baseUrl}/api/inboxes/${inboxId}/events`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data) as MessageSummary;
        onMessage(message);
      } catch {
        // ignore parse errors
      }
    });

    eventSource.onerror = (event) => {
      onError?.(event);
    };

    return () => {
      eventSource.close();
    };
  }

  async createApiKey(name: string): Promise<ApiKeyWithSecret> {
    return this.request<ApiKeyWithSecret>("POST", "/api/keys", { name });
  }

  async listApiKeys(): Promise<ApiKey[]> {
    return this.request<ApiKey[]>("GET", "/api/keys");
  }

  async revokeApiKey(id: string): Promise<void> {
    await this.request<void>("DELETE", `/api/keys/${id}`);
  }

  async createWebhook(url: string, events: WebhookEvent[]): Promise<Webhook> {
    return this.request<Webhook>("POST", "/api/webhooks", { url, events });
  }

  async listWebhooks(): Promise<Webhook[]> {
    return this.request<Webhook[]>("GET", "/api/webhooks");
  }

  async getWebhook(id: string): Promise<Webhook> {
    return this.request<Webhook>("GET", `/api/webhooks/${id}`);
  }

  async deleteWebhook(id: string): Promise<void> {
    await this.request<void>("DELETE", `/api/webhooks/${id}`);
  }

  async listWebhookDeliveries(
    webhookId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<WebhookDelivery>> {
    return this.request<PaginatedResponse<WebhookDelivery>>(
      "GET",
      `/api/webhooks/${webhookId}/deliveries?page=${page}&pageSize=${pageSize}`
    );
  }

  async testWebhook(id: string): Promise<void> {
    await this.request<void>("POST", `/api/webhooks/${id}/test`);
  }

  async listApiLogs(page = 1, pageSize = 20): Promise<PaginatedResponse<ApiLog>> {
    return this.request<PaginatedResponse<ApiLog>>(
      "GET",
      `/api/logs?page=${page}&pageSize=${pageSize}`
    );
  }

  async getOpenApiSpec(): Promise<unknown> {
    const response = await this.fetchFn(`${this.baseUrl}/api/docs`);
    return response.json();
  }
}
