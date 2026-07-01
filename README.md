<div align="center">

# Inbix

### Open Source Cloudflare-native Email API Platform

Programmable email inboxes on Cloudflare's edge. Generate inboxes, receive emails, and automate through REST APIs, SDKs, and MCP. No SMTP, no Docker, no VPS.

[![Deploy](https://img.shields.io/badge/deploy-cloudflare-F97316?style=flat-square)](https://workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square)](https://www.typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

</div>

---

## Quick Start

```bash
git clone https://github.com/andriansandi/inbix.git
cd inbix
pnpm install
pnpm deploy
```

That's it. You now have a working disposable email service running on Cloudflare's edge network.

## Features

### Core Platform (v0.1)

- **Generate inbox**: One click or one API call to get a programmable email address
- **Receive email**: Powered by Cloudflare Email Workers
- **Inbox list**: Manage multiple inboxes with auto-expiration
- **Read HTML email**: Sanitized and rendered in a sandboxed iframe
- **Read plain text**: Toggle between HTML and plain text views
- **Attachments**: Download attachments up to 10MB (stored in R2)
- **Auto expiration**: Inboxes expire automatically (configurable TTL)
- **Copy email**: Copy address to clipboard
- **Delete inbox**: Clean up manually or let it expire
- **Real-time updates**: New messages appear instantly via SSE
- **REST API**: Full REST API for automation, CI/CD, and integrations
- **TypeScript SDK**: Official SDK for JavaScript and TypeScript
- **Clerk authentication**: Email, password, magic link, Google, GitHub, passkeys

### Notification Platform (v0.4 Phase 1)

- **Web Push notifications**: Browser push when new emails arrive (Web Push API + VAPID)
- **In-app toast notifications**: Animated toasts at top-right when tab is visible
- **Notification preferences**: Push enable/disable, quiet hours, notify on new message
- **Multi-device support**: Subscribe multiple devices per account
- **Push click navigation**: Click notification → land directly on the inbox
- **Service Worker**: Handles push events and notification clicks

### Roadmap

- API key authentication with per-key rate limiting
- Custom usernames and multiple domains
- Webhooks for event-driven workflows
- Full-text search across messages
- Official SDKs (Python, Go, PHP, Java, C#)
- ✅ MCP Server for AI agents (Claude, Cursor, Windsurf)
- Stripe billing (Free, Pro, Team, Enterprise)
- Team workspaces and shared inboxes
- Multi-channel notifications (FCM, APNs, Telegram, Slack, Discord)
- Analytics and audit logs

## MCP Server

Inbix has an official [Model Context Protocol](https://modelcontextprotocol.io) server for AI agents and MCP clients.

```bash
npm add -g @inbix/mcp-server
```

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "inbix": {
      "command": "npx",
      "args": ["-y", "@inbix/mcp-server"],
      "env": {
        "INBIX_API_KEY": "inbix_your_api_key_here"
      }
    }
  }
}
```

Supported clients: Claude Desktop, Claude Code, Cursor, Windsurf, VS Code, and any STDIO-based MCP host.

See the full [MCP Server guide](./docs/MCP.md) for configuration details and example workflows.

## Architecture

```
                    ┌──────────────────────┐
                    │  Incoming Email      │
                    │  (Cloudflare Email   │
                    │  Routing)            │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Email Worker        │
                    │  (parse MIME,        │
                    │   extract content)   │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │              │
       ┌─────────▼──┐  ┌───────▼──────┐  ┌──▼─────────┐
       │  D1        │  │  R2          │  │  KV        │
       │  (metadata)│  │  (attachments)│  │  (cache)   │
       └─────────┬──┘  └───────┬──────┘  └──┬─────────┘
                 │             │              │
                 └─────────────┼──────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Hono API            │
                    │  (REST + SSE)        │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  React Dashboard     │
                    │  (static assets)     │
                    └──────────────────────┘
```

Everything runs in a **single Cloudflare Worker**. The Worker handles both incoming emails (`email` handler) and HTTP requests (`fetch` handler). The dashboard is built as a static SPA and served via Workers Static Assets.

### Monorepo Structure

```
inbix/
├── apps/
│   ├── web/                # Cloudflare Worker (API + Email + static assets)
│   │   ├── src/
│   │   │   ├── index.ts    # Entry: fetch + email handlers
│   │   │   ├── app.ts      # Hono app
│   │   │   ├── routes/     # API routes (inboxes, messages, push, notifications)
│   │   │   ├── email/      # Email handler (triggers push notifications)
│   │   │   ├── middleware/ # CORS, rate limit, security, auth
│   │   │   └── lib/        # webPush, notify, cleanup, utilities
│   │   ├── public/         # Dashboard build output
│   │   └── wrangler.toml
│   └── dashboard/          # React SPA (Vite + TailwindCSS + shadcn/ui)
│       ├── src/
│       │   ├── pages/      # Home, Dashboard, Settings, Auth, NotFound
│       │   ├── components/ # MessageList, ToastProvider, NotificationsTab, etc.
│       │   ├── hooks/      # useInbox, useAuth, usePushNotifications
│       │   └── lib/        # API client, utils
│       └── vite.config.ts
├── packages/
│   ├── database/           # Drizzle ORM schemas + queries + migrations
│   ├── parser/             # Email parsing (postal-mime) + HTML sanitization
│   ├── sdk/                # TypeScript SDK for the REST API
│   ├── shared/             # Shared types, constants, Zod schemas, utils
│   └── ui/                 # Shared shadcn/ui components
├── docs/                   # Documentation
├── .github/                # Issue templates, PR template, workflows
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Runtime      | Cloudflare Workers                  |
| Backend      | Hono                                |
| Language     | TypeScript                          |
| Database     | Cloudflare D1 (SQLite)             |
| Object Storage | Cloudflare R2                     |
| Cache        | Cloudflare KV                       |
| Email        | Cloudflare Email Workers            |
| ORM          | Drizzle ORM                         |
| Validation   | Zod                                 |
| Realtime     | Server-Sent Events (SSE)           |
| Frontend     | React 19 + Vite                     |
| Styling      | TailwindCSS + shadcn/ui            |
| Auth         | Clerk (email, Google, GitHub, passkeys) |
| Notifications| Web Push (VAPID + RFC 8291)        |
| Deployment   | Wrangler                            |
| CI/CD        | GitHub Actions                      |
| Package Manager | pnpm                            |

## Deployment Guide

### Prerequisites

1. A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
2. Node.js 20+ and pnpm installed
3. A domain configured in Cloudflare (for email routing)

### Step 1: Clone & Install

```bash
git clone https://github.com/andriansandi/inbix.git
cd inbix
pnpm install
```

### Step 2: Create Cloudflare Resources

```bash
# Create D1 database
npx wrangler d1 create inbix
# Copy the database_id into apps/web/wrangler.toml

# Create R2 bucket
npx wrangler r2 bucket create inbix-attachments

# Create KV namespaces
npx wrangler kv namespace create CACHE
npx wrangler kv namespace create RATE_LIMIT_KV
# Copy the namespace IDs into apps/web/wrangler.toml
```

### Step 3: Run Database Migrations

```bash
pnpm db:migrate
```

### Step 4: Update wrangler.toml

Edit `apps/web/wrangler.toml` and replace the placeholder IDs with the ones from Step 2:

```toml
[[d1_databases]]
binding = "DB"
database_name = "inbix"
database_id = "your-actual-d1-id"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "inbix-attachments"

[[kv_namespaces]]
binding = "CACHE"
id = "your-actual-cache-kv-id"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-actual-rate-limit-kv-id"
```

### Step 5: Deploy

```bash
pnpm deploy
```

### Step 6: Set Up Email Routing

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → your domain → **Email** → **Routing**
2. Enable Email Routing
3. Go to **Routes** tab
4. Add a **Catch-all** rule → **Send to a Worker** → select `inbix`
5. Save

You're done! Your disposable email service is live.

## API Reference

### Create Inbox

```http
POST /api/inboxes
Content-Type: application/json

{
  "domain": "optional.example.com",
  "ttlSeconds": 86400
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "emailAddress": "random@inbix.xyz",
    "domain": "inbix.xyz",
    "createdAt": 1735300000000,
    "expiresAt": 1735386400000,
    "isActive": true
  }
}
```

### List Inboxes

```http
GET /api/inboxes?page=1&pageSize=20
```

### Get Inbox

```http
GET /api/inboxes/:id
```

### Delete Inbox

```http
DELETE /api/inboxes/:id
```

### List Messages

```http
GET /api/inboxes/:id/messages?page=1&pageSize=50
```

### Get Message

```http
GET /api/messages/:id
```

### Get Sanitized HTML

```http
GET /api/messages/:id/html
```

Returns sanitized HTML with strict CSP headers.

### Delete Message

```http
DELETE /api/messages/:id
```

### List Attachments

```http
GET /api/messages/:id/attachments
```

### Download Attachment

```http
GET /api/messages/:id/attachments/:attachmentId
```

### Real-time Updates (SSE)

```http
GET /api/inboxes/:id/events
```

Returns Server-Sent Events. Event types:
- `message` — new message received
- `inbox_expired` — inbox has expired
- `heartbeat` — keepalive

### Health Check

```http
GET /api/health
GET /api/health/db
GET /api/health/r2
```

### Push Notifications

```http
POST   /api/push/subscribe          # Subscribe to push (requires auth)
DELETE /api/push/subscribe           # Unsubscribe (requires auth)
GET    /api/push/subscriptions       # List active subscriptions (requires auth)
GET    /api/push/vapid-public-key    # Get VAPID public key (requires auth)
```

### Notification Preferences

```http
GET   /api/notifications/preferences  # Get preferences (requires auth)
PATCH /api/notifications/preferences  # Update preferences (requires auth)
POST  /api/notifications/test         # Send test push (requires auth)
```

## Development

```bash
# Install dependencies
pnpm install

# Start both Vite (:5176) + wrangler (:8791)
pnpm dev

# Or run individually
pnpm --filter @inbix/dashboard dev   # Vite at :5176
pnpm --filter @inbix/web dev          # Wrangler at :8791

# Type check all packages
pnpm typecheck

# Build all packages
pnpm build

# Deploy
pnpm deploy
```

### Using the SDK

```typescript
import { InbixClient } from "@inbix/sdk";

const client = new InbixClient({
  baseUrl: "https://your-worker.workers.dev",
});

// Create an inbox
const inbox = await client.createInbox({ ttlSeconds: 3600 });
console.log(inbox.emailAddress);

// Subscribe to new messages
const unsubscribe = client.subscribeToInbox(
  inbox.id,
  (message) => console.log("New message:", message),
  (error) => console.error("SSE error:", error)
);

// List messages
const { data: messages } = await client.listMessages(inbox.id);

// Get a message
const message = await client.getMessage(messages[0].id);
```

## Environment Variables

### Worker (wrangler.jsonc `[vars]`)

| Variable        | Description                     | Default     |
| --------------- | ------------------------------- | ----------- |
| `ENVIRONMENT`   | Environment name                | `production`|
| `APP_DOMAIN`    | Default domain for inboxes      | `inbix.xyz` |
| `CORS_ORIGIN`   | Allowed CORS origins (comma-sep)| `https://inbix.xyz` |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key (frontend) | — |
| `VAPID_PUBLIC_KEY` | Web Push public key (VAPID) | — |
| `VAPID_SUBJECT` | Web Push contact (mailto:)  | `mailto:noreply@inbix.xyz` |

### Worker Secrets (via `wrangler secret put`)

| Secret          | Description                     |
| --------------- | ------------------------------- |
| `CLERK_SECRET_KEY` | Clerk backend secret key     |
| `VAPID_PRIVATE_KEY` | Web Push private key (VAPID) |

### Local Development (.dev.vars)

Copy `.dev.vars.example` to `.dev.vars` at the repo root and fill in values:

```
APP_DOMAIN=inbix.xyz
CORS_ORIGIN=http://localhost:5176
ENVIRONMENT=development
CLERK_SECRET_KEY=sk_test_xxx
CLERK_PUBLISHABLE_KEY=pk_test_xxx
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:noreply@inbix.xyz
```

Local dev runs Vite at `http://localhost:5176` and wrangler at `http://localhost:8791`.

## Database Schema

### Tables

| Table          | Description                              |
| -------------- | ---------------------------------------- |
| `inboxes`      | Disposable inbox records                 |
| `messages`     | Email messages                           |
| `attachments`  | File attachments (metadata in D1, content in R2) |
| `api_keys`     | API keys for authentication              |
| `domains`      | Supported domains                        |
| `users`        | Users (optional, for admin dashboard)    |
| `push_subscriptions` | Web Push subscription endpoints + keys |
| `notification_preferences` | Push, quiet hours, notify settings |
| `notification_logs` | Notification delivery audit trail  |

## Roadmap

### v0.1 — MVP (Current)
- [x] Generate random inbox
- [x] Receive email via Cloudflare Email Workers
- [x] Inbox list & management
- [x] Read HTML & plain text emails
- [x] Attachment support
- [x] Auto expiration
- [x] Real-time updates via SSE
- [x] Dashboard UI
- [x] Clerk authentication
- [x] REST API + TypeScript SDK

### v0.4 — Notification Platform (Phase 1)
- [x] Web Push notifications (VAPID + RFC 8291)
- [x] In-app toast notifications
- [x] Notification preferences (quiet hours, notify on new message)
- [x] Multi-device push subscription
- [x] Push click → navigate to inbox
- [x] Service Worker (push events + notification click)

### v0.2 — API & Automation
- [ ] REST API with API key authentication
- [ ] Rate limiting (per-key)
- [ ] Custom usernames
- [ ] Multiple domains support
- [ ] TypeScript SDK package

### v0.3 — Power Features
- [ ] Webhooks
- [ ] Full-text search
- [ ] Email forwarding
- [ ] Spam protection
- [ ] Custom TTL per inbox

### v1.0 — Production
- [ ] Admin dashboard
- [ ] Analytics & metrics
- [ ] Multi-tenant support
- [ ] Audit logs
- [ ] Official Docker image for local dev

## FAQ

**Is Inbix free?**
Yes, Inbix is open source under the MIT license. Cloudflare's free tier includes 100K Worker requests/day, 5M D1 reads/day, and 1GB R2 storage — more than enough for personal use.

**Do I need a domain?**
Yes, you need a domain configured in Cloudflare to receive emails. Email Routing requires a domain managed by Cloudflare DNS.

**Can I use this in production?**
Yes. The codebase is designed to be production-ready. See [SECURITY.md](SECURITY.md) for security considerations.

**How does email receiving work?**
Cloudflare Email Routing receives emails for your domain and forwards them to the Worker's `email` handler. The Worker parses the MIME, stores metadata in D1, attachments in R2, and the dashboard polls via SSE.

**Is my data private?**
All data is stored in your own Cloudflare account. No data is sent to any third-party service. Inboxes auto-expire and data is permanently deleted.

**Can I self-host without Cloudflare?**
Inbix is Cloudflare-native by design. It uses Cloudflare-specific APIs (D1, R2, KV, Email Workers). A self-hosted version with alternative backends is on the roadmap.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

### Development Workflow (PR-Based)

Semua perubahan — baik feature maupun fix — **wajib** melalui Pull Request. Tidak ada push langsung ke `main`.

**Alur:**

1. **Buat branch** dari `main` dengan prefix yang sesuai:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/nama-fitur      # untuk feature baru
   git checkout -b fix/nama-bug         # untuk bug fix
   git checkout -b docs/nama-dokumentasi # untuk dokumentasi
   git checkout -b refactor/nama-refactor # untuk refactoring
   ```

2. **Buat perubahan** dan pastikan lolos check:
   ```bash
   pnpm typecheck   # harus pass
   pnpm build       # harus pass
   ```

3. **Commit** dengan [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: tambah custom username support"
   git commit -m "fix: resolve SSE connection dropping"
   git commit -m "docs: update deployment guide"
   ```

4. **Push branch** dan buat PR:
   ```bash
   git push origin feat/nama-fitur
   gh pr create --title "feat: nama fitur" --body "deskripsi perubahan"
   ```

5. **Tunggu CI pass** — GitHub Actions otomatis menjalankan typecheck, build, dan security audit pada setiap PR.

6. **Manual approval** — PR harus di-review dan di-approve manual via GitHub UI sebelum bisa di-merge. Branch `main` dilindungi dengan **branch protection rules**:
   - Require pull request before merging
   - Require status checks to pass (CI)
   - Require conversation resolution
   - No force push to `main`

7. **Merge** — setelah approved, merge PR via GitHub UI (Squash and merge recommended).

**Aturan branch protection sudah dikonfigurasi dengan `enforce_admins: true`** —
berlaku untuk **semua orang, termasuk repo owner**. Tidak ada yang bisa push
langsung ke `main`. Setiap perubahan wajib lewat Pull Request, lalu di-merge
manual via GitHub UI. Untuk solo developer, reviewer tidak diwajibkan (0 required
reviews) — kamu bisa create PR, review sendiri, dan merge.

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk detail lengkap.

## Security

For security concerns, please read [SECURITY.md](SECURITY.md) and report vulnerabilities privately.

## License

[MIT](LICENSE) © 2025 Andrian Sandi
