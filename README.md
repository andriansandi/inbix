<div align="center">

# Inbix

### Open Source Cloudflare-native Email API Platform

Programmable email inboxes on Cloudflare's edge. Generate inboxes, receive emails, and automate through REST APIs, SDKs, webhooks, and MCP. No SMTP, no Docker, no VPS.

[![Deploy](https://img.shields.io/badge/deploy-cloudflare-F97316?style=flat-square)](https://workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square)](https://www.typescriptlang.org)
[![Docs](https://img.shields.io/badge/docs-wiki-0366d6?style=flat-square)](https://github.com/andriansandi/inbix/wiki)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

</div>

---

## Quick Start

```bash
git clone https://github.com/andriansandi/inbix.git
cd inbix
pnpm install
```

Then follow the [Deployment Guide](https://github.com/andriansandi/inbix/wiki/Deployment) to create your Cloudflare resources and deploy.

For local development, see the [Development Guide](https://github.com/andriansandi/inbix/wiki/Development).

## What is Inbix?

Inbix is an open-source, Cloudflare-native email infrastructure platform. It gives you disposable, programmable inboxes that can be created and consumed through a REST API, TypeScript SDK, webhooks, and an official MCP server — making it ideal for developers, test automation, CI/CD, and AI agents.

Everything runs in a **single Cloudflare Worker**: incoming emails hit the Worker's `email` handler, and the same Worker serves the Hono REST API, SSE/WebSocket realtime endpoints, and the React dashboard as static assets.

## Features

### v0.1 — Core Platform

- Generate random disposable inboxes
- Receive emails via Cloudflare Email Workers
- Inbox list and management with auto-expiration
- Read HTML emails (sanitized, rendered in a sandboxed iframe)
- Read plain text emails
- Attachment support (up to 10MB, stored in R2)
- Real-time updates via SSE and WebSocket
- REST API + TypeScript SDK (`@inbix/sdk`)
- Rate limiting and security headers
- Clerk authentication (email, password, magic link, Google, GitHub, passkeys)

### v0.2 — API & Automation

- API key authentication with per-key rate limiting
- WebSocket realtime rooms (Durable Objects)
- API keys management and inbox quotas
- Webhook support for inbox events
- Request/response logging (opt-in)
- Interactive OpenAPI/Swagger docs at `/api/docs/ui`

### v0.3 — Power Features

- Message webhooks (**done**)
- Dark/light mode toggle (**done**)
- Durable Objects for realtime (**done**)
- Full-text search, spam protection, custom TTL (**upcoming**)

### v0.4 — Notification Platform

- Web Push notifications (VAPID, service worker, multi-device)
- In-app toast notifications
- Notification preferences and quiet hours
- Click notifications to open the inbox

### v0.9 — AI Agents & Launch

- Official [MCP Server](https://github.com/andriansandi/inbix/wiki/MCP-Server) (`@inbix/mcp-server`)
- Tools for AI agents: create inbox, wait for email/OTP, extract verification links, download attachments

See the full [Roadmap](https://github.com/andriansandi/inbix/wiki/Roadmap) for milestones through v1.0.

## MCP Server

Inbix ships with an official [Model Context Protocol](https://modelcontextprotocol.io) server. AI agents and MCP clients can create inboxes, read messages, wait for OTPs, extract verification links, and more.

```bash
npm install -g @inbix/mcp-server
```

Claude Desktop config:

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

See the [MCP Server guide](https://github.com/andriansandi/inbix/wiki/MCP-Server) for full setup.

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
                    │  (REST + SSE + WS)   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  React Dashboard     │
                    │  (static assets)     │
                    └──────────────────────┘
```

### Monorepo Structure

```
inbix/
├── apps/
│   ├── web/                # Cloudflare Worker (API + Email + static assets)
│   └── dashboard/          # React SPA (Vite + TailwindCSS + shadcn/ui)
├── packages/
│   ├── database/           # Drizzle ORM schemas + queries + migrations
│   ├── parser/             # Email parsing (postal-mime) + HTML sanitization
│   ├── sdk/                # TypeScript SDK for the REST API
│   ├── shared/             # Shared types, constants, Zod schemas, utils
│   └── ui/                 # Shared shadcn/ui components
├── docs/                   # Documentation
└── .github/                # Issue templates, PR template, workflows
```

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| Backend | Hono |
| Language | TypeScript |
| Database | Cloudflare D1 (SQLite) |
| Object Storage | Cloudflare R2 |
| Cache | Cloudflare KV |
| Email | Cloudflare Email Workers |
| ORM | Drizzle ORM |
| Validation | Zod |
| Realtime | Server-Sent Events (SSE) + WebSocket (Durable Objects) |
| Frontend | React 19 + Vite |
| Styling | TailwindCSS + shadcn/ui |
| Auth | Clerk |
| Notifications | Web Push (VAPID + RFC 8291) |
| Deployment | Wrangler |
| CI/CD | GitHub Actions |
| Package Manager | pnpm |

## Documentation

All detailed documentation lives in the [GitHub Wiki](https://github.com/andriansandi/inbix/wiki):

- [Quick Start](https://github.com/andriansandi/inbix/wiki/Quick-Start)
- [Deployment Guide](https://github.com/andriansandi/inbix/wiki/Deployment)
- [Development Guide](https://github.com/andriansandi/inbix/wiki/Development)
- [API Reference](https://github.com/andriansandi/inbix/wiki/API-Reference) — source of truth: [`docs/API.md`](./docs/API.md)
- [Architecture](https://github.com/andriansandi/inbix/wiki/Architecture)
- [MCP Server](https://github.com/andriansandi/inbix/wiki/MCP-Server)
- [FAQ](https://github.com/andriansandi/inbix/wiki/FAQ)
- [Roadmap](https://github.com/andriansandi/inbix/wiki/Roadmap)
- [Contributing](https://github.com/andriansandi/inbix/wiki/Contributing)
- [Security](https://github.com/andriansandi/inbix/wiki/Security)

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Contributing Wiki](https://github.com/andriansandi/inbix/wiki/Contributing) to get started.

All changes must go through a Pull Request. Branch protection rules enforce this for everyone, including the repo owner.

## Security

For security concerns, please read [SECURITY.md](SECURITY.md) and report vulnerabilities privately to **security@inbix.xyz**.

## License

[MIT](LICENSE) © 2025 Andrian Sandi
