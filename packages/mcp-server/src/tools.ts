import { z } from "zod";
import {
  ErrorCode,
  McpError,
  type EmbeddedResource,
  type TextContent,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import {
  InbixClient,
  InbixError,
  type Inbox,
  type Message,
  type MessageSummary,
  type PaginatedResponse,
} from "@inbix/sdk";
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

type Content = TextContent | EmbeddedResource;

const ok = (text: string): TextContent => ({ type: "text", text });

const resource = (res: EmbeddedResource["resource"]): EmbeddedResource => ({
  type: "resource",
  resource: res,
});

function handleError(err: unknown): never {
  if (err instanceof McpError) {
    throw err;
  }

  if (err instanceof z.ZodError) {
    const details = err.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new McpError(ErrorCode.InvalidParams, `Invalid arguments: ${details}`);
  }

  if (err instanceof InbixError) {
    const code =
      err.status >= 400 && err.status < 500
        ? ErrorCode.InvalidRequest
        : ErrorCode.InternalError;
    throw new McpError(code, err.message);
  }

  if (err instanceof Error) {
    throw new McpError(ErrorCode.InternalError, err.message);
  }

  throw new McpError(ErrorCode.InternalError, "Unknown error");
}

const idSchema = z.string().min(1);

const createInboxSchema = z.object({
  domain: z.string().min(1).max(253).optional(),
  ttlSeconds: z.number().int().min(60).optional(),
});

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

const inboxIdSchema = z.object({
  inboxId: idSchema,
});

const messageIdSchema = z.object({
  messageId: idSchema,
});

const attachmentSchema = z.object({
  messageId: idSchema,
  attachmentId: idSchema,
});

const waitSchema = z.object({
  inboxId: idSchema,
  timeoutSeconds: z.number().int().min(1).max(300).default(60),
  pollIntervalSeconds: z.number().int().min(1).max(60).default(3),
});

const searchSchema = z.object({
  query: z.string().min(1),
  inboxId: idSchema.optional(),
  searchBody: z.boolean().default(false),
  limit: z.number().int().min(1).max(100).default(20),
});

const numberProp = (
  description: string,
  defaultValue?: number,
  min?: number,
  max?: number
): Record<string, unknown> => {
  const p: Record<string, unknown> = { type: "number", description };
  if (defaultValue !== undefined) p.default = defaultValue;
  if (min !== undefined) p.minimum = min;
  if (max !== undefined) p.maximum = max;
  return p;
};

const booleanProp = (
  description: string,
  defaultValue?: boolean
): Record<string, unknown> => {
  const p: Record<string, unknown> = { type: "boolean", description };
  if (defaultValue !== undefined) p.default = defaultValue;
  return p;
};

export const TOOLS: Tool[] = [
  {
    name: "create_inbox",
    description: "Create a new disposable inbox. Optionally specify a domain and TTL in seconds.",
    inputSchema: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Domain for the inbox address" },
        ttlSeconds: {
          type: "number",
          description: "Time-to-live in seconds (minimum 60)",
        },
      },
    },
  },
  {
    name: "list_inboxes",
    description: "List existing inboxes with pagination.",
    inputSchema: {
      type: "object",
      properties: {
        page: numberProp("Page number", 1, 1),
        pageSize: numberProp(
          "Items per page",
          DEFAULT_PAGE_SIZE,
          1,
          MAX_PAGE_SIZE
        ),
      },
    },
  },
  {
    name: "read_inbox",
    description: "Get details of a specific inbox by ID.",
    inputSchema: {
      type: "object",
      properties: {
        inboxId: { type: "string", description: "Inbox ID" },
      },
      required: ["inboxId"],
    },
  },
  {
    name: "delete_inbox",
    description: "Delete an inbox and all associated messages.",
    inputSchema: {
      type: "object",
      properties: {
        inboxId: { type: "string", description: "Inbox ID" },
      },
      required: ["inboxId"],
    },
  },
  {
    name: "list_inbox_messages",
    description: "List messages inside an inbox with pagination.",
    inputSchema: {
      type: "object",
      properties: {
        inboxId: { type: "string", description: "Inbox ID" },
        page: numberProp("Page number", 1, 1),
        pageSize: numberProp(
          "Items per page",
          DEFAULT_PAGE_SIZE,
          1,
          MAX_PAGE_SIZE
        ),
      },
      required: ["inboxId"],
    },
  },
  {
    name: "read_message",
    description: "Read a specific message by ID, including text and HTML content.",
    inputSchema: {
      type: "object",
      properties: {
        messageId: { type: "string", description: "Message ID" },
      },
      required: ["messageId"],
    },
  },
  {
    name: "download_attachment",
    description:
      "Download an attachment. Text files are returned inline; binary files are returned as base64 blobs.",
    inputSchema: {
      type: "object",
      properties: {
        messageId: { type: "string", description: "Message ID" },
        attachmentId: { type: "string", description: "Attachment ID" },
      },
      required: ["messageId", "attachmentId"],
    },
  },
  {
    name: "wait_for_email",
    description:
      "Wait until an email arrives in an inbox. This polls the Inbix API on the client side so the agent can make a single blocking call.",
    inputSchema: {
      type: "object",
      properties: {
        inboxId: { type: "string", description: "Inbox ID" },
        timeoutSeconds: numberProp(
          "Maximum time to wait",
          60,
          1,
          300
        ),
        pollIntervalSeconds: numberProp(
          "How often to poll for new messages",
          3,
          1,
          60
        ),
      },
      required: ["inboxId"],
    },
  },
  {
    name: "wait_for_otp",
    description:
      "Wait for an email in an inbox and extract an OTP (one-time password) code from it.",
    inputSchema: {
      type: "object",
      properties: {
        inboxId: { type: "string", description: "Inbox ID" },
        timeoutSeconds: numberProp(
          "Maximum time to wait",
          60,
          1,
          300
        ),
        pollIntervalSeconds: numberProp(
          "How often to poll for new messages",
          3,
          1,
          60
        ),
      },
      required: ["inboxId"],
    },
  },
  {
    name: "extract_verification_link",
    description: "Extract verification, login, or magic links from a message.",
    inputSchema: {
      type: "object",
      properties: {
        messageId: { type: "string", description: "Message ID" },
      },
      required: ["messageId"],
    },
  },
  {
    name: "search_messages",
    description:
      "Search messages by subject and sender across inboxes. Optionally search message bodies (slower). Uses client-side filtering while the backend search endpoint is not available.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        inboxId: {
          type: "string",
          description: "Limit search to a single inbox",
        },
        searchBody: booleanProp("Also search message bodies", false),
        limit: numberProp("Maximum number of results", 20, 1, 100),
      },
      required: ["query"],
    },
  },
];

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  client: InbixClient
): Promise<Content[]> {
  try {
    switch (name) {
      case "create_inbox": {
        const parsed = createInboxSchema.parse(args);
        const inbox = await client.createInbox(parsed);
        return [ok(formatInbox(inbox))];
      }

      case "list_inboxes": {
        const { page = 1, pageSize = DEFAULT_PAGE_SIZE } =
          paginationSchema.parse(args);
        const result = await client.listInboxes(page, pageSize);
        return [ok(formatPaginated(result, formatInbox))];
      }

      case "read_inbox": {
        const { inboxId } = inboxIdSchema.parse(args);
        const inbox = await client.getInbox(inboxId);
        return [ok(formatInbox(inbox))];
      }

      case "delete_inbox": {
        const { inboxId } = inboxIdSchema.parse(args);
        await client.deleteInbox(inboxId);
        return [ok(`Inbox ${inboxId} has been deleted.`)];
      }

      case "list_inbox_messages": {
        const parsed = z
          .object({
            inboxId: idSchema,
            page: z.number().int().min(1).default(1),
            pageSize: z
              .number()
              .int()
              .min(1)
              .max(MAX_PAGE_SIZE)
              .default(DEFAULT_PAGE_SIZE),
          })
          .parse(args);
        const result = await client.listMessages(
          parsed.inboxId,
          parsed.page,
          parsed.pageSize
        );
        return [ok(formatPaginated(result, formatMessageSummary))];
      }

      case "read_message": {
        const { messageId } = messageIdSchema.parse(args);
        const message = await client.getMessage(messageId);
        return [ok(formatMessage(message))];
      }

      case "download_attachment": {
        const { messageId, attachmentId } = attachmentSchema.parse(args);
        const blob = await client.downloadAttachment(messageId, attachmentId);
        const contentType = blob.type || "application/octet-stream";
        const uri = `inbix://messages/${messageId}/attachments/${attachmentId}`;
        const isText =
          contentType.startsWith("text/") ||
          /\/(?:json|xml|javascript|css|csv)$|\+xml$/i.test(contentType);

        if (isText) {
          return [resource({ uri, mimeType: contentType, text: await blob.text() })];
        }

        const buffer = Buffer.from(await blob.arrayBuffer());
        return [
          resource({
            uri,
            mimeType: contentType,
            blob: buffer.toString("base64"),
          }),
        ];
      }

      case "wait_for_email": {
        const parsed = waitSchema.parse(args);
        const message = await waitForEmail(
          client,
          parsed.inboxId,
          parsed.timeoutSeconds * 1000,
          parsed.pollIntervalSeconds * 1000
        );
        return [ok(formatMessageSummary(message))];
      }

      case "wait_for_otp": {
        const parsed = waitSchema.parse(args);
        const message = await waitForEmail(
          client,
          parsed.inboxId,
          parsed.timeoutSeconds * 1000,
          parsed.pollIntervalSeconds * 1000
        );
        const full = await client.getMessage(message.id);
        const haystack = `${full.subject ?? ""}\n${full.textContent ?? ""}\n${stripTags(
          full.htmlContent
        )}`;
        const codes = extractOtps(haystack);
        if (codes.length === 0) {
          return [
            ok(
              `Email arrived but no OTP was found.\n\n${formatMessageSummary(
                message
              )}`
            ),
          ];
        }
        return [
          ok(
            `OTP: ${codes[0]}\n\nOther candidates: ${codes.join(
              ", "
            )}\n\nMessage:\n${formatMessageSummary(message)}`
          ),
        ];
      }

      case "extract_verification_link": {
        const { messageId } = messageIdSchema.parse(args);
        const message = await client.getMessage(messageId);
        const urls = [
          ...findUrls(message.textContent),
          ...findUrls(stripTags(message.htmlContent)),
        ];
        const unique = Array.from(new Set(urls));
        if (unique.length === 0) {
          return [ok("No links found in this message.")];
        }
        return [
          ok(`Found ${unique.length} link(s):\n\n${unique.join("\n")}`),
        ];
      }

      case "search_messages": {
        const { query, inboxId, searchBody, limit } = searchSchema.parse(args);
        const results = await searchMessages(
          client,
          query,
          inboxId,
          searchBody,
          limit
        );
        if (results.length === 0) {
          return [ok("No matching messages found.")];
        }
        return [
          ok(
            `Found ${results.length} message(s):\n\n${results
              .map(formatMessageSummary)
              .join("\n---\n")}`
          ),
        ];
      }

      default: {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    }
  } catch (err) {
    handleError(err);
  }
}

function formatInbox(inbox: Inbox): string {
  return [
    `ID: ${inbox.id}`,
    `Address: ${inbox.emailAddress}`,
    `Domain: ${inbox.domain}`,
    `Active: ${inbox.isActive}`,
    `Created: ${new Date(inbox.createdAt).toISOString()}`,
    `Expires: ${new Date(inbox.expiresAt).toISOString()}`,
  ].join("\n");
}

function formatMessageSummary(message: MessageSummary): string {
  return [
    `ID: ${message.id}`,
    `Inbox: ${message.inboxId}`,
    `From: ${message.fromName ? `${message.fromName} <${message.fromAddress}>` : message.fromAddress}`,
    `Subject: ${message.subject ?? "(no subject)"}`,
    `Attachments: ${message.hasAttachments ? "yes" : "no"}`,
    `Size: ${message.size} bytes`,
    `Received: ${new Date(message.receivedAt).toISOString()}`,
    `Read: ${message.isRead}`,
  ].join("\n");
}

function formatMessage(message: Message): string {
  const lines = [formatMessageSummary(message), ""];
  if (message.textContent) {
    lines.push("--- text ---", message.textContent);
  }
  if (message.htmlContent) {
    lines.push("", "--- html (stripped) ---", stripTags(message.htmlContent));
  }
  return lines.join("\n");
}

function formatPaginated<T>(
  page: PaginatedResponse<T>,
  formatItem: (item: T) => string
): string {
  const header = `Page ${page.pagination.page}/${page.pagination.totalPages} · ${page.pagination.total} total`;
  if (page.data.length === 0) {
    return `${header}\n\nNo items.`;
  }
  return `${header}\n\n${page.data
    .map(formatItem)
    .join("\n---\n")}`;
}

function stripTags(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function findUrls(text: string | null | undefined): string[] {
  if (!text) return [];
  const matches =
    text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi) ?? [];
  return Array.from(new Set(matches));
}

function extractOtps(text: string): string[] {
  const matches = text.match(/\b\d{4,8}\b/g) ?? [];
  return Array.from(new Set(matches));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForEmail(
  client: InbixClient,
  inboxId: string,
  timeoutMs: number,
  intervalMs: number
): Promise<MessageSummary> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const page = await client.listMessages(inboxId, 1, 1);
    if (page.data.length > 0) {
      return page.data[0];
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await sleep(Math.min(intervalMs, remaining));
  }

  throw new McpError(
    ErrorCode.InternalError,
    `No email arrived in inbox ${inboxId} within the timeout.`
  );
}

async function searchMessages(
  client: InbixClient,
  query: string,
  inboxId: string | undefined,
  searchBody: boolean,
  limit: number
): Promise<MessageSummary[]> {
  const normalizedQuery = query.toLowerCase();
  const results: MessageSummary[] = [];

  async function searchInbox(id: string): Promise<void> {
    let page = 1;
    while (results.length < limit) {
      const messages = await client.listMessages(
        id,
        page,
        Math.min(MAX_PAGE_SIZE, limit * 2)
      );
      if (messages.data.length === 0) break;

      for (const message of messages.data) {
        if (results.length >= limit) break;
        if (await matchesMessage(message, normalizedQuery, searchBody, client)) {
          results.push(message);
        }
      }

      if (page >= messages.pagination.totalPages) break;
      page++;
    }
  }

  if (inboxId) {
    await searchInbox(inboxId);
    return results;
  }

  const inboxes = await client.listInboxes(1, 50);
  for (const inbox of inboxes.data) {
    await searchInbox(inbox.id);
    if (results.length >= limit) break;
  }

  return results;
}

async function matchesMessage(
  message: MessageSummary,
  query: string,
  searchBody: boolean,
  client: InbixClient
): Promise<boolean> {
  const haystack = `${message.subject ?? ""} ${message.fromAddress} ${
    message.fromName ?? ""
  }`.toLowerCase();
  if (haystack.includes(query)) return true;

  if (!searchBody) return false;

  try {
    const full = await client.getMessage(message.id);
    const body = `${full.textContent ?? ""} ${stripTags(
      full.htmlContent
    )}`.toLowerCase();
    return body.includes(query);
  } catch {
    return false;
  }
}
