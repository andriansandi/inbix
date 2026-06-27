<div align="center">

# Inbix

### Open Source Disposable Email Platform powered by Cloudflare Workers

The easiest disposable email platform to self-host. No Docker, no VPS, no SMTP server management — everything runs on Cloudflare.

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

### MVP (v0.1)

- **Generate random inbox** — One click to get a disposable email address
- **Receive email** — Powered by Cloudflare Email Workers
- **Inbox list** — Manage multiple inboxes
- **Read HTML email** — Sanitized and rendered in a sandboxed iframe
- **Read plain text** — Toggle between HTML and plain text views
- **Attachments** — Download attachments up to 10MB (stored in R2)
- **Auto expiration** — Inboxes expire automatically (configurable TTL)
- **Copy email** — Copy address to clipboard
- **Delete inbox** — Clean up manually or let it expire
- **Real-time updates** — New messages appear instantly via SSE

### Roadmap

- Custom usernames
- Multiple domains support
- REST API with API keys
- Webhooks
- Full-text search
- Rate limiting (dashboard)
- Analytics
- Admin dashboard
- Spam protection
- Multi-tenant support

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
│   │   │   ├── routes/     # API routes
│   │   │   ├── email/      # Email handler
│   │   │   ├── middleware/ # CORS, rate limit, security headers
│   │   │   └── lib/        # Cleanup, utilities
│   │   ├── public/         # Dashboard build output
│   │   └── wrangler.toml
│   └── dashboard/          # React SPA (Vite + TailwindCSS + shadcn/ui)
│       ├── src/
│       │   ├── pages/      # Home, Dashboard, NotFound
│       │   ├── components/ # MessageList, MessageViewer, etc.
│       │   ├── hooks/      # useInbox (SSE polling)
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

## Development

```bash
# Install dependencies
pnpm install

# Run dashboard dev server (with API proxy)
pnpm --filter @inbix/dashboard dev

# Run worker dev server
pnpm --filter @inbix/web dev

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

### Worker (wrangler.toml `[vars]`)

| Variable        | Description                     | Default     |
| --------------- | ------------------------------- | ----------- |
| `ENVIRONMENT`   | Environment name                | `production`|
| `APP_DOMAIN`    | Default domain for inboxes      | `inbix.xyz` |
| `CORS_ORIGIN`   | Allowed CORS origins (comma-sep)| `https://inbix.xyz` |

### Local Development (.dev.vars)

Copy `.dev.vars.example` to `.dev.vars` and fill in values:

```
APP_DOMAIN=localhost:8787
CORS_ORIGIN=http://localhost:5173
ENVIRONMENT=development
```

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
langsung ke `main`. Setiap PR harus di-approve manual via GitHub UI sebelum
bisa di-merge.

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk detail lengkap.

## Security

For security concerns, please read [SECURITY.md](SECURITY.md) and report vulnerabilities privately.

## License

[MIT](LICENSE) © 2025 Andrian Sandi
