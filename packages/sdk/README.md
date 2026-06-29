# @inbix/sdk

Official TypeScript SDK for [Inbix](https://inbix.xyz) — Open Source Cloudflare-native Email API Platform.

## Install

```bash
npm install @inbix/sdk
# or
pnpm add @inbix/sdk
# or
yarn add @inbix/sdk
```

## Quick Start

```typescript
import { InbixClient } from "@inbix/sdk";

const client = new InbixClient({
  baseUrl: "https://inbix.xyz",
  apiKey: "inbix_your_api_key", // optional, needed for authed endpoints
});

// Create a disposable inbox
const inbox = await client.createInbox();
console.log(inbox.emailAddress); // e.g. abc123@inbix.xyz

// List messages
const { data: messages } = await client.listMessages(inbox.id);

// Get a message
const message = await client.getMessage(messages[0].id);

// Delete the inbox
await client.deleteInbox(inbox.id);
```

## Authentication

The SDK supports two authentication methods:

### API Key (for automation/CI)

```typescript
const client = new InbixClient({
  baseUrl: "https://inbix.xyz",
  apiKey: "inbix_...",
});
```

### Clerk Session Token (for dashboard integrations)

```typescript
const client = new InbixClient({
  baseUrl: "https://inbix.xyz",
  token: clerkSessionToken,
});
```

## API Reference

### Inboxes

- `createInbox(options?)` — Create a new disposable inbox
- `getInbox(id)` — Get inbox details
- `listInboxes(page?, pageSize?)` — List inboxes (paginated)
- `deleteInbox(id)` — Delete an inbox
- `subscribeToInbox(inboxId, onMessage, onError?)` — SSE subscription for real-time messages

### Messages

- `listMessages(inboxId, page?, pageSize?)` — List messages in an inbox
- `getMessage(id)` — Get message details
- `getMessageHtml(id)` — Get sanitized HTML content
- `deleteMessage(id)` — Delete a message

### Attachments

- `listAttachments(messageId)` — List attachments for a message
- `downloadAttachment(messageId, attachmentId)` — Download attachment as Blob

### Domains

- `listDomains()` — List available domains

### API Keys (requires Clerk session token)

- `createApiKey(name)` — Create a new API key
- `listApiKeys()` — List your API keys
- `revokeApiKey(id)` — Revoke an API key

### Webhooks

- `createWebhook(url, events)` — Create a webhook
- `listWebhooks()` — List your webhooks
- `getWebhook(id)` — Get webhook details
- `deleteWebhook(id)` — Delete a webhook
- `listWebhookDeliveries(webhookId, page?, pageSize?)` — List delivery history
- `testWebhook(id)` — Send a test delivery

### Logs

- `listApiLogs(page?, pageSize?)` — List API request logs

### OpenAPI

- `getOpenApiSpec()` — Get the OpenAPI 3.0 spec

## Webhook Events

- `inbox.created` — New inbox created
- `inbox.deleted` — Inbox deleted
- `message.received` — New message received
- `message.deleted` — Message deleted

## Error Handling

```typescript
import { InbixClient, InbixError } from "@inbix/sdk";

try {
  const inbox = await client.createInbox();
} catch (err) {
  if (err instanceof InbixError) {
    console.error(err.status, err.message);
  }
}
```

## License

MIT
