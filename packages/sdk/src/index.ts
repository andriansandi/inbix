import type {
  Inbox,
  Message,
  MessageSummary,
  Attachment,
  PaginatedResponse,
  ApiResponse,
  CreateInboxOptions,
} from "@inbix/shared";

export type { Inbox, Message, MessageSummary, Attachment, PaginatedResponse, ApiResponse, CreateInboxOptions };

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
  fetch?: typeof fetch;
}

export class InbixClient {
  private baseUrl: string;
  private apiKey?: string;
  private fetchFn: typeof fetch;

  constructor(options: InbixClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.fetchFn = options.fetch ?? fetch;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

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
    const response = await this.fetchFn(`${this.baseUrl}/api/messages/${id}/html`, {
      headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
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

  async getAttachmentUrl(messageId: string, attachmentId: string): Promise<string> {
    const result = await this.request<{ url: string }>(
      "GET",
      `/api/messages/${messageId}/attachments/${attachmentId}`
    );
    return result.url;
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
}
