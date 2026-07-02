# Architecture

## Overview

Inbix is a Cloudflare-native disposable email platform built as a monorepo. Everything runs on Cloudflare's edge network — no external servers, databases, or services required.

## Core Design Decisions

### Single Worker

Inbix runs in a **single Cloudflare Worker** that handles:
1. **Email reception** — `email()` handler receives incoming emails via Cloudflare Email Routing
2. **HTTP API** — `fetch()` handler serves the REST API (Hono) and dashboard (static assets)

This keeps deployment simple (one `wrangler deploy`) and costs low (one Worker).

### Static Dashboard

The React dashboard is built as a static SPA and served via Workers Static Assets (`ASSETS` binding). The build output goes to `apps/web/public/`. The `not_found_handling = "single-page-application"` setting enables client-side routing.

### Real-time

Inbix supports two realtime transports:

- **Server-Sent Events (SSE)** — `GET /api/inboxes/:id/events` polls D1 for new messages and streams them to the client. Lightweight and sufficient for most dashboard use cases.
- **WebSocket** — `GET /api/inboxes/:id/ws` upgrades to a Durable Object room, providing sub-second updates for automation and high-volume scenarios.

## Request Flow

### Email Flow

```
1. Email arrives at Cloudflare Email Routing
2. Email Routing forwards to Worker's email() handler
3. Worker parses MIME with postal-mime
4. Metadata stored in D1 (messages table)
5. Attachments stored in R2
6. Dashboard receives new message via SSE poll
```

### API Flow

```
1. Client sends HTTP request to Worker
2. Hono router matches the route
3. Middleware: requestId → securityHeaders → CORS → rateLimit
4. Route handler queries D1 via Drizzle ORM
5. Response returned as JSON
```

### Dashboard Flow

```
1. User navigates to /
2. Worker serves static assets from ASSETS binding
3. React SPA loads
4. SPA calls /api/* for data
5. SSE subscription at /api/inboxes/:id/events for real-time
```

## Data Model

### D1 (SQLite) — Metadata

| Table         | Purpose                           |
| ------------- | --------------------------------- |
| `inboxes`     | Inbox records (id, email, expiry) |
| `messages`    | Email metadata (from, subject)    |
| `attachments` | Attachment metadata (r2_key)      |
| `api_keys`    | API key hashes                    |
| `domains`     | Supported domains                 |
| `users`       | Admin users (optional)            |

### R2 — Binary Data

- Email attachments (organized as `attachments/{messageId}/{random}/{filename}`)
- Health check test objects (ephemeral)

### KV — Cache & Rate Limiting

- `CACHE` namespace — inbox email-to-id mapping for fast lookups
- `RATE_LIMIT_KV` namespace — per-IP request counters with TTL

## Security Architecture

### HTML Sanitization Pipeline

```
Raw HTML → HTMLTokenStream → Tag whitelist filter → Attr whitelist filter
         → URL protocol validation → CSS sanitization → Escaped output
```

The sanitizer is a custom streaming tokenizer that:
- Allows only safe HTML tags (no script, style, iframe, etc.)
- Filters attributes per-tag (e.g., `a` only gets `href`, `title`, `name`)
- Validates URL protocols (blocks `javascript:`, `vbscript:`)
- Strips dangerous CSS patterns
- HTML is rendered in a sandboxed `<iframe sandbox="allow-same-origin">` with strict CSP

### Rate Limiting

Token bucket per IP using KV:
- Key: `rl:{ip}:{window_bucket}`
- TTL: 60 seconds (rate limit window)
- Limit: 60 requests per window
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

### Auto-Cleanup

On every request, the Worker schedules (via `ctx.waitUntil`) a background cleanup task that:
1. Finds expired inboxes
2. Deletes their messages and attachments (R2 + D1)
3. Hard-deletes the inbox record
4. Processes in batches of 50 to avoid CPU limits

## Package Dependencies

```
@inbix/shared     ← types, constants, zod schemas, utils
    ↑
@inbix/database   ← drizzle schemas + queries (depends on shared)
@inbix/parser     ← MIME parsing + sanitization (depends on shared)
@inbix/sdk        ← API client (depends on shared)
@inbix/ui         ← React components (standalone)
    ↑
@inbix/web        ← Worker (depends on database, parser, shared)
@inbix/dashboard  ← React SPA (depends on shared, sdk, ui)
```

## Realtime Evolution

The first iterations of Inbix relied on SSE polling to keep the dashboard simple and cost-effective on the Cloudflare free tier. As the platform added automation and AI-agent use cases, WebSocket support through Durable Objects was introduced for sub-second realtime updates. SSE remains the default dashboard transport; WebSocket is available for clients that need lower latency.

## Cost Model (Cloudflare Free Tier)

| Resource      | Free Tier            | Inbix Usage              |
| ------------- | -------------------- | ------------------------ |
| Worker requests | 100K/day           | ~1-10 per active user    |
| D1 reads     | 5M/day               | ~5-20 per message        |
| D1 writes    | 100K/day             | ~3-5 per message         |
| R2 storage   | 10GB                 | ~1MB per attachment      |
| R2 operations | 1M Class A, 10M Class B/month | Minimal          |
| KV reads     | 100K/day             | ~1-2 per request         |

**Estimated**: Free tier supports ~1000 active users/day with ~100 messages each.

## Scaling Considerations

- **D1** has a 10GB limit (paid: 50GB+). Messages are stored as text, attachments in R2.
- **R2** has no practical limit for this use case.
- **Worker CPU** — email parsing is CPU-intensive. For high volume, consider moving parsing to a separate Worker (Queue-triggered).
- **SSE connections** — each Worker can handle many concurrent SSE streams. For extreme scale, consider Durable Objects for connection management.
