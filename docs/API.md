# API Reference

Inbix exposes a first-class REST API for creating disposable inboxes, receiving emails, and automating workflows.

- **Base URL**: `https://your-worker.workers.dev/api`
- **OpenAPI (Swagger)**: `GET /api/docs` and `GET /api/docs/ui`
- **Authentication**: Bearer token via `Authorization` header. Supports both Clerk session tokens and Inbix API keys.

## Authentication

Provide a bearer token in every request that requires authentication:

```http
Authorization: Bearer inbix_your_api_key_here
```

Two token types are accepted:

| Type | Use case | Obtained from |
|---|---|---|
| API key | Automation, CI/CD, MCP clients | `POST /api/keys` (requires Clerk session) |
| Clerk session token | Dashboard / user operations | Clerk frontend session |

Some endpoints, such as creating or deleting API keys, require a Clerk session token and cannot be used with an API key.

## Response format

Successful responses follow this envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Description of the error"
}
```

Pagination responses wrap `data` with a `pagination` object:

```json
{
  "success": true,
  "data": {
    "data": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## Rate limiting

- 60 requests per minute per IP.
- 10 inbox creations per minute per IP.
- API keys are tracked individually for authenticated requests.

Rate limit status is returned in standard HTTP headers.

---

## Health

### Check service health

```http
GET /api/health
```

### Check database connectivity

```http
GET /api/health/db
```

### Check R2 connectivity

```http
GET /api/health/r2
```

---

## Inboxes

### Create inbox

```http
POST /api/inboxes
Content-Type: application/json
Authorization: Bearer <token>

{
  "domain": "optional.example.com",
  "ttlSeconds": 86400
}
```

- `domain` — optional custom domain.
- `ttlSeconds` — optional TTL (default depends on auth state; authenticated users get a longer TTL).

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "emailAddress": "random@inbix.xyz",
    "domain": "inbix.xyz",
    "userId": null,
    "createdAt": 1735300000000,
    "expiresAt": 1735386400000,
    "isActive": true
  }
}
```

### List inboxes

```http
GET /api/inboxes?page=1&pageSize=20
Authorization: Bearer <token>
```

### Get inbox

```http
GET /api/inboxes/:id
Authorization: Bearer <token>
```

### Delete inbox

```http
DELETE /api/inboxes/:id
Authorization: Bearer <token>
```

### List messages in inbox

```http
GET /api/inboxes/:id/messages?page=1&pageSize=50
Authorization: Bearer <token>
```

### Real-time updates (SSE)

```http
GET /api/inboxes/:id/events
Authorization: Bearer <token>
```

Returns a server-sent event stream with event types:

- `message` — a new message arrived.
- `inbox_expired` — the inbox expired.
- `heartbeat` — keepalive ping.

### Real-time updates (WebSocket)

```http
GET /api/inboxes/:id/ws
Upgrade: websocket
```

Connects a WebSocket through a Durable Object room for the inbox.

---

## Messages

### Get message

```http
GET /api/messages/:id
Authorization: Bearer <token>
```

Marks the message as read automatically on first fetch.

### Get sanitized HTML

```http
GET /api/messages/:id/html
Authorization: Bearer <token>
```

Returns sanitized HTML with strict CSP headers. Safe to render in an iframe.

### Delete message

```http
DELETE /api/messages/:id
Authorization: Bearer <token>
```

### List attachments

```http
GET /api/messages/:id/attachments
Authorization: Bearer <token>
```

### Download attachment

```http
GET /api/messages/:id/attachments/:attachmentId
Authorization: Bearer <token>
```

Returns the attachment binary with `Content-Disposition: attachment`.

---

## Domains

### List domains

```http
GET /api/domains
Authorization: Bearer <token>
```

### Add domain

```http
POST /api/domains
Content-Type: application/json
Authorization: Bearer <token>

{
  "domain": "custom.example.com",
  "isDefault": false
}
```

The domain must still be configured in Cloudflare Email Routing before it can receive emails.

---

## API Keys

API key management requires a Clerk session token (`Authorization: Bearer <clerk_session_token>`). API keys themselves cannot manage other API keys.

### Create API key

```http
POST /api/keys
Content-Type: application/json
Authorization: Bearer <clerk_session_token>

{
  "name": "CI/CD Key"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "CI/CD Key",
    "prefix": "inbix_abc",
    "createdAt": 1735300000000,
    "key": "inbix_full_key_shown_once"
  }
}
```

> The full key is returned only once. Store it securely.

### List API keys

```http
GET /api/keys
Authorization: Bearer <clerk_session_token>
```

### Revoke API key

```http
DELETE /api/keys/:id
Authorization: Bearer <clerk_session_token>
```

---

## Webhooks

Create webhooks to receive HTTP callbacks for inbox and message events.

Supported events:

- `inbox.created`
- `inbox.deleted`
- `message.received`
- `message.deleted`

### Create webhook

```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://example.com/webhook",
  "events": ["message.received"]
}
```

### List webhooks

```http
GET /api/webhooks
Authorization: Bearer <token>
```

### Get webhook

```http
GET /api/webhooks/:id
Authorization: Bearer <token>
```

### Delete webhook

```http
DELETE /api/webhooks/:id
Authorization: Bearer <token>
```

### List deliveries

```http
GET /api/webhooks/:id/deliveries?page=1&pageSize=20
Authorization: Bearer <token>
```

### Test webhook

```http
POST /api/webhooks/:id/test
Authorization: Bearer <token>
```

---

## API Logs

When request logging is enabled, API key requests are logged for debugging and audit purposes.

### List logs

```http
GET /api/logs?page=1&pageSize=20
Authorization: Bearer <token>
```

---

## Push Notifications

Push endpoints require authentication and are used by the dashboard to manage Web Push subscriptions.

### Subscribe

```http
POST /api/push/subscribe
Content-Type: application/json
Authorization: Bearer <token>

{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

### Unsubscribe

```http
DELETE /api/push/subscribe
Content-Type: application/json
Authorization: Bearer <token>

{
  "endpoint": "https://..."
}
```

or:

```json
{
  "subscriptionId": "..."
}
```

### List subscriptions

```http
GET /api/push/subscriptions
Authorization: Bearer <token>
```

### Get VAPID public key

```http
GET /api/push/vapid-public-key
Authorization: Bearer <token>
```

---

## Notification Preferences

### Get preferences

```http
GET /api/notifications/preferences
Authorization: Bearer <token>
```

### Update preferences

```http
PATCH /api/notifications/preferences
Content-Type: application/json
Authorization: Bearer <token>

{
  "pushEnabled": true,
  "notifyOnNewMessage": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}
```

### Send test notification

```http
POST /api/notifications/test
Authorization: Bearer <token>
```

---

## SDK Usage

Use the official TypeScript SDK to simplify integration:

```bash
npm install @inbix/sdk
```

```typescript
import { InbixClient } from "@inbix/sdk";

const client = new InbixClient({
  baseUrl: "https://your-worker.workers.dev",
  apiKey: "inbix_your_api_key_here",
});

const inbox = await client.createInbox({ ttlSeconds: 3600 });

const unsubscribe = client.subscribeToInbox(
  inbox.id,
  (message) => console.log("New message:", message),
  (error) => console.error("SSE error:", error)
);

const { data: messages } = await client.listMessages(inbox.id);
const message = await client.getMessage(messages[0].id);
```

For AI agents and MCP clients, see [`docs/MCP.md`](./MCP.md).
