import { Hono } from "hono";
import type { HonoEnv } from "../lib/env";
import { APP_VERSION } from "@inbix/shared";

export const openapiRoutes = new Hono<HonoEnv>();

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Inbix API",
    version: APP_VERSION,
    description:
      "Open Source Cloudflare-native Email API Platform. Create disposable inboxes, receive emails, and automate with webhooks.",
    license: { name: "MIT", url: "https://opensource.org/licenses/MIT" },
    contact: { url: "https://inbix.xyz" },
  },
  servers: [
    { url: "https://inbix.xyz", description: "Production" },
    { url: "http://localhost:8791", description: "Local development" },
  ],
  components: {
    securitySchemes: {
      apiKey: {
        type: "http",
        scheme: "bearer",
        description: "Use your Inbix API key (format: inbix_...) as the Bearer token.",
      },
      clerk: {
        type: "http",
        scheme: "bearer",
        description: "Use a Clerk session token as the Bearer token.",
      },
    },
    schemas: {
      Inbox: {
        type: "object",
        properties: {
          id: { type: "string" },
          emailAddress: { type: "string", format: "email" },
          domain: { type: "string" },
          userId: { type: "string", nullable: true },
          createdAt: { type: "integer" },
          expiresAt: { type: "integer" },
          isActive: { type: "boolean" },
        },
      },
      Message: {
        type: "object",
        properties: {
          id: { type: "string" },
          inboxId: { type: "string" },
          fromAddress: { type: "string" },
          fromName: { type: "string", nullable: true },
          subject: { type: "string", nullable: true },
          textContent: { type: "string", nullable: true },
          htmlContent: { type: "string", nullable: true },
          hasAttachments: { type: "boolean" },
          size: { type: "integer" },
          isRead: { type: "boolean" },
          receivedAt: { type: "integer" },
        },
      },
      Attachment: {
        type: "object",
        properties: {
          id: { type: "string" },
          messageId: { type: "string" },
          filename: { type: "string" },
          contentType: { type: "string" },
          size: { type: "integer" },
        },
      },
      ApiKey: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          prefix: { type: "string" },
          createdAt: { type: "integer" },
          lastUsedAt: { type: "integer", nullable: true },
        },
      },
      ApiKeyWithSecret: {
        allOf: [
          { $ref: "#/components/schemas/ApiKey" },
          {
            type: "object",
            properties: { key: { type: "string" } },
            required: ["key"],
          },
        ],
      },
      Webhook: {
        type: "object",
        properties: {
          id: { type: "string" },
          url: { type: "string", format: "uri" },
          events: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "inbox.created",
                "inbox.deleted",
                "message.received",
                "message.deleted",
              ],
            },
          },
          secret: { type: "string" },
          isActive: { type: "boolean" },
          createdAt: { type: "integer" },
        },
      },
      Domain: {
        type: "object",
        properties: {
          id: { type: "string" },
          domain: { type: "string" },
          isDefault: { type: "boolean" },
          isVerified: { type: "boolean" },
          createdAt: { type: "integer" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string" },
        },
      },
      PaginatedResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              data: { type: "array" },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "integer" },
                  pageSize: { type: "integer" },
                  total: { type: "integer" },
                  totalPages: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        tags: ["Health"],
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "string" },
                        timestamp: { type: "integer" },
                        version: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/inboxes": {
      post: {
        summary: "Create a new inbox",
        tags: ["Inboxes"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  domain: { type: "string" },
                  ttlSeconds: { type: "integer", minimum: 60, maximum: 604800 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Inbox created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Inbox" },
                  },
                },
              },
            },
          },
          "403": { description: "Inbox limit reached", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      get: {
        summary: "List inboxes",
        tags: ["Inboxes"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: {
          "200": {
            description: "Paginated list of inboxes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" },
              },
            },
          },
        },
      },
    },
    "/api/inboxes/{id}": {
      get: {
        summary: "Get inbox by ID",
        tags: ["Inboxes"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Inbox details", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Inbox" } } } } } },
          "404": { description: "Inbox not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "410": { description: "Inbox has expired", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        summary: "Delete an inbox",
        tags: ["Inboxes"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Inbox deleted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } } } } },
          "404": { description: "Inbox not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/inboxes/{id}/messages": {
      get: {
        summary: "List messages in an inbox",
        tags: ["Inboxes", "Messages"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: {
          "200": { description: "Paginated list of messages", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
          "404": { description: "Inbox not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/inboxes/{id}/events": {
      get: {
        summary: "Subscribe to SSE events for an inbox",
        tags: ["Inboxes"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "SSE stream of message and inbox events" },
        },
      },
    },
    "/api/messages/{id}": {
      get: {
        summary: "Get message by ID",
        tags: ["Messages"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Message details", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Message" } } } } } },
          "404": { description: "Message not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        summary: "Delete a message",
        tags: ["Messages"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Message deleted" },
          "404": { description: "Message not found" },
        },
      },
    },
    "/api/messages/{id}/html": {
      get: {
        summary: "Get sanitized HTML content of a message",
        tags: ["Messages"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Sanitized HTML", content: { "text/html": {} } },
          "404": { description: "Message not found" },
        },
      },
    },
    "/api/messages/{id}/attachments": {
      get: {
        summary: "List attachments for a message",
        tags: ["Messages", "Attachments"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "List of attachments", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Attachment" } } } } } } },
        },
      },
    },
    "/api/messages/{id}/attachments/{attachmentId}": {
      get: {
        summary: "Download an attachment",
        tags: ["Messages", "Attachments"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "attachmentId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Attachment binary", content: { "application/octet-stream": {} } },
          "404": { description: "Attachment not found" },
        },
      },
    },
    "/api/domains": {
      get: {
        summary: "List available domains",
        tags: ["Domains"],
        security: [{ apiKey: [] }, { clerk: [] }, {}],
        responses: {
          "200": { description: "List of domains", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Domain" } } } } } } },
        },
      },
    },
    "/api/keys": {
      post: {
        summary: "Create a new API key (requires Clerk session auth)",
        tags: ["API Keys"],
        security: [{ clerk: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { name: { type: "string", minLength: 1, maxLength: 100 } }, required: ["name"] },
            },
          },
        },
        responses: {
          "201": { description: "API key created (key only shown once)", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/ApiKeyWithSecret" } } } } } },
          "401": { description: "Authentication required (Clerk session, not API key)" },
        },
      },
      get: {
        summary: "List your API keys (requires Clerk session auth)",
        tags: ["API Keys"],
        security: [{ clerk: [] }],
        responses: {
          "200": { description: "List of API keys", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/ApiKey" } } } } } } },
        },
      },
    },
    "/api/keys/{id}": {
      delete: {
        summary: "Revoke an API key (requires Clerk session auth)",
        tags: ["API Keys"],
        security: [{ clerk: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "API key revoked" },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/api/webhooks": {
      post: {
        summary: "Create a webhook",
        tags: ["Webhooks"],
        security: [{ apiKey: [] }, { clerk: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  url: { type: "string", format: "uri" },
                  events: {
                    type: "array",
                    items: { type: "string", enum: ["inbox.created", "inbox.deleted", "message.received", "message.deleted"] },
                    minItems: 1,
                  },
                },
                required: ["url", "events"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Webhook created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Webhook" } } } } } },
          "403": { description: "Webhook limit reached" },
        },
      },
      get: {
        summary: "List your webhooks",
        tags: ["Webhooks"],
        security: [{ apiKey: [] }, { clerk: [] }],
        responses: {
          "200": { description: "List of webhooks", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Webhook" } } } } } } },
        },
      },
    },
    "/api/webhooks/{id}": {
      get: {
        summary: "Get webhook details",
        tags: ["Webhooks"],
        security: [{ apiKey: [] }, { clerk: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Webhook details" },
          "404": { description: "Webhook not found" },
        },
      },
      delete: {
        summary: "Delete a webhook",
        tags: ["Webhooks"],
        security: [{ apiKey: [] }, { clerk: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Webhook deleted" },
          "404": { description: "Webhook not found" },
        },
      },
    },
    "/api/webhooks/{id}/deliveries": {
      get: {
        summary: "List webhook delivery history",
        tags: ["Webhooks"],
        security: [{ apiKey: [] }, { clerk: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: {
          "200": { description: "Paginated delivery history" },
          "404": { description: "Webhook not found" },
        },
      },
    },
    "/api/webhooks/{id}/test": {
      post: {
        summary: "Send a test webhook delivery",
        tags: ["Webhooks"],
        security: [{ apiKey: [] }, { clerk: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Test webhook sent" },
          "404": { description: "Webhook not found" },
        },
      },
    },
    "/api/logs": {
      get: {
        summary: "List API request logs (opt-in, logged when using API keys)",
        tags: ["Logs"],
        security: [{ apiKey: [] }, { clerk: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: {
          "200": { description: "Paginated API logs" },
        },
      },
    },
  },
};

openapiRoutes.get("/docs", (c) => {
  return c.json(spec);
});

openapiRoutes.get("/docs/ui", () => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Inbix API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: "/api/docs",
        dom_id: "#swagger-ui",
        deepLinking: true,
      });
    };
  </script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
