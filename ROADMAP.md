# Roadmap

This document outlines the planned development milestones for Inbix.

## v0.1 — MVP (Complete)

**Goal**: A working disposable email service with a dashboard.

- [x] Generate random inbox
- [x] Receive email via Cloudflare Email Workers
- [x] Inbox list & management
- [x] Read HTML emails (sanitized)
- [x] Read plain text emails
- [x] Attachment support (stored in R2)
- [x] Auto expiration (configurable TTL)
- [x] Copy email address
- [x] Delete inbox
- [x] Real-time updates via SSE
- [x] Responsive dashboard UI
- [x] Homepage with features, architecture, deploy guide
- [x] REST API (create, list, get, delete inbox/messages)
- [x] HTML sanitization pipeline
- [x] Rate limiting
- [x] Security headers (CSP, X-Frame-Options, etc.)
- [x] CORS configuration
- [x] Auto cleanup of expired data
- [x] TypeScript SDK
- [x] Documentation (README, Architecture, Deployment, Development, FAQ)
- [x] GitHub templates (issue, PR, CODEOWNERS)
- [x] CI/CD (GitHub Actions)

### GitHub Issues for v0.1
- #1 Set up monorepo with pnpm workspaces and turbo
- #2 Implement Drizzle ORM schema and D1 migrations
- #3 Build email worker with MIME parsing
- #4 Create Hono API with inbox/message routes
- #5 Implement HTML sanitization pipeline
- #6 Build React dashboard with TailwindCSS + shadcn/ui
- #7 Add SSE for real-time message updates
- #8 Implement rate limiting with KV
- #9 Set up security headers and CORS
- #10 Create homepage with feature sections
- #11 Write documentation (README, deployment, architecture)
- #12 Set up GitHub Actions CI/CD

---

## v0.2 — API & Automation

**Goal**: Production-ready API for automation and CI/CD with realtime support.

- [x] API key authentication
- [x] Per-key rate limiting
- [x] WebSocket support (realtime alternative to SSE)
- [x] TypeScript SDK published to npm
- [x] API documentation site (OpenAPI/Swagger)
- [x] Webhook for inbox creation
- [x] Inbox quota management
- [x] Request/response logging (opt-in)

### GitHub Issues for v0.2
- #13 Implement API key generation and authentication
- #14 Add per-key rate limiting
- #17 Publish @inbix/sdk to npm
- #18 Generate OpenAPI spec
- #20 Add webhook support for inbox events

---

## v0.3 — Power Features

**Goal**: Advanced features for power users.

- [x] Webhooks for new messages
- [ ] Full-text search across messages
- [ ] Spam protection (header analysis, content scoring)
- [ ] Custom TTL per inbox (fine-grained)
- [ ] Inbox pinning (prevent auto-expiry)
- [ ] Message starring/favorites
- [ ] Export inbox (JSON, EML)
- [x] Dark/light mode toggle
- [ ] Keyboard shortcuts
- [x] Durable Objects for real-time (if SSE proves insufficient)

### GitHub Issues for v0.3
- #21 Implement message webhooks
- #22 Add full-text search with FTS5
- #24 Spam protection heuristics
- #25 Inbox pinning and custom TTL
- #26 Message export (JSON, EML)
- #27 Dark/light mode toggle
- #28 Keyboard shortcuts

---

## v0.4 — Notification Platform

**Goal**: Real-time notifications when new emails arrive, fully
Cloudflare-native, API-first, and built on open web standards.

> Inbix's notification architecture is **Cloudflare-native,
> event-driven, vendor-independent, and built on open web standards**.

### Architecture Principles

- Cloudflare Workers only
- No Firebase dependency
- Open Web Push standards
- PWA compatible
- Developer-first
- Event-driven architecture

### Phase 1 — Web Push Notifications (MVP)

Implement browser push notifications using the Web Push standard.

- [x] Browser Push API
- [x] Service Worker
- [x] VAPID key management
- [x] Push subscription endpoint
- [x] Store subscriptions in D1
- [x] Send notification from Email Worker
- [x] Click notification opens mailbox
- [x] Multiple devices per account
- [x] Notification permission management
- [x] Unsubscribe support

Notification payload:

- `title`
- `body`
- `icon`
- `badge`
- `url`
- `timestamp`

Acceptance criteria:

- Notification delivered within a few seconds after email arrives
- Works on Chrome, Edge, Firefox and PWA
- No third-party notification provider

### Phase 2 — Notification Preferences

Allow users to configure notification behavior.

- [x] Enable/disable push
- [ ] Per mailbox settings
- [x] Quiet hours
- [ ] Notification sound
- [ ] Priority notifications
- [ ] Only notify for important mail
- [ ] Domain filters
- [ ] Sender filters

### Phase 3 — Notification Service

Refactor notification logic into a dedicated service with an internal
event pipeline.

```
Email Received
      ↓
Notification Event
      ↓
Notification Service
      ↓
Web Push Adapter
```

The service exposes an internal API so additional adapters can be
added without modifying email processing.

- [ ] Extract notification logic into Notification Service
- [ ] Define internal notification event contract
- [ ] Implement Web Push adapter
- [ ] Add adapter registration mechanism

### Phase 4 — Multi-Channel Notifications

Expand notification delivery. Every adapter consumes the same
notification event.

Future adapters:

- [ ] Mobile Push (FCM)
- [ ] Apple Push (APNs)
- [ ] Telegram
- [ ] Slack
- [ ] Discord
- [ ] Generic Webhook

### API Endpoints

- [x] `POST /push/subscribe`
- [x] `DELETE /push/subscribe`
- [x] `GET /push/subscriptions`
- [x] `PATCH /push/preferences`
- [x] `POST /notifications/test`

### Database

New tables:

- [x] `push_subscriptions`
- [x] `notification_preferences`
- [x] `notification_logs`

### Security

- [ ] VAPID key rotation
- [x] Subscription validation
- [x] Rate limiting
- [x] Abuse protection
- [x] Device ownership verification

### Developer Experience

Expose internal notification APIs for future integrations. The
Notification Platform consumes these events instead of being tightly
coupled to the email processing pipeline.

Internal events:

- `email.received`
- `email.delivered`
- `email.bounced`
- `email.spam`
- `mailbox.created`
- `mailbox.deleted`

### Non Goals

The core platform must NOT rely on:

- Firebase Cloud Messaging as the primary notification infrastructure
- OneSignal
- Proprietary push services

These may be implemented later as optional adapters, but the core
platform relies on the standard Web Push protocol.

### GitHub Issues for v0.4
- #37 Implement Web Push infrastructure (VAPID, service worker, subscription endpoint)
- #38 Store push subscriptions in D1
- #39 Send push notifications from Email Worker
- #40 Notification click-through to mailbox
- #41 Multi-device push subscription support
- #42 Notification permission management and unsubscribe
- #43 Notification preferences (per mailbox, quiet hours, filters)
- #44 Refactor into Notification Service with event pipeline
- #45 Multi-channel notification adapters (FCM, APNs, Telegram, Slack, Discord, Webhook)
- #46 Push and notification API endpoints
- #47 Notification database tables (push_subscriptions, notification_preferences, notification_logs)
- #48 Notification security (VAPID rotation, validation, rate limiting, abuse protection)
- #49 Internal notification event system (email.received, email.delivered, etc.)

---

## v0.9 — AI Agents & Launch

**Goal**: Position Inbix as the Email Infrastructure for Developers
and AI Agents, preparing for the first public launch on Product Hunt.

This milestone focuses on developer experience, MCP integration,
documentation, examples, and launch readiness rather than adding
enterprise features.

### MCP Server

Implement the official MCP Server package.

Package: `@inbix/mcp-server`

Supported transports:

- STDIO
- HTTP

Initial tools:

- [x] `create_inbox`
- [x] `list_inboxes`
- [x] `read_inbox`
- [x] `read_message`
- [x] `wait_for_email`
- [x] `wait_for_otp`
- [x] `extract_verification_link`
- [x] `download_attachment`
- [x] `search_messages`
- [x] `delete_inbox`

Goals:

- Compatible with Claude Desktop
- Compatible with Claude Code
- Compatible with Cursor
- Compatible with Windsurf
- Compatible with VS Code MCP
- Compatible with OpenAI-compatible MCP Clients

### Developer Experience

Improve first-time developer onboarding.

Tasks:

- [ ] One-minute Quick Start
- [ ] API Quick Start
- [ ] SDK Quick Start
- [x] MCP Quick Start
- [ ] Interactive code examples
- [ ] Copy-paste snippets
- [ ] API playground
- [ ] Better error messages
- [ ] Consistent SDK APIs

### Examples

Create real-world examples.

Examples:

- [ ] Playwright email verification
- [ ] Cypress email verification
- [ ] Selenium OTP testing
- [ ] GitHub Actions integration
- [ ] Password reset automation
- [ ] Magic Link authentication
- [ ] OTP login testing
- [ ] AI Agent receives email
- [ ] AI Agent waits for OTP
- [ ] AI Agent extracts verification link

### Documentation

Expand documentation.

New docs:

- [x] MCP Guide
- [ ] AI Agent Guide
- [ ] Testing Guide
- [ ] Automation Guide
- [ ] Webhook Guide
- [ ] SDK Reference
- [ ] Authentication Guide
- [ ] Deployment Examples

### Homepage

Improve product positioning.

Tasks:

- [ ] Reposition homepage around "Email Infrastructure"
- [x] Add AI Agent section
- [ ] Add Testing section
- [ ] Add Automation section
- [ ] Add SDK section
- [x] Add MCP section
- [ ] Add integrations section
- [ ] Improve feature comparison
- [ ] Add architecture diagram

### Launch Readiness

Prepare for Product Hunt launch.

Tasks:

- [ ] Public GitHub repository
- [ ] OSS documentation review
- [ ] CHANGELOG
- [ ] Release notes
- [ ] License review
- [ ] Screenshots
- [ ] Open Graph images
- [ ] Favicon
- [ ] Product Hunt assets
- [ ] README polish

### GitHub Issues for v0.9

- #50 Official MCP Server
- #51 Developer Experience improvements
- #52 Documentation overhaul
- #53 Examples repository
- #54 Homepage positioning refresh
- #55 Product Hunt launch preparation

---

## v1.0 — Production

**Goal**: Enterprise-ready, multi-tenant platform.

- [ ] Custom usernames (choose your own inbox address)
- [ ] Multiple domains support (add/remove via API/dashboard)
- [ ] Integration test suite
- [ ] Admin dashboard with metrics
- [ ] Analytics (inbox creation, message volume, popular domains)
- [ ] Multi-tenant support (organizations, teams)
- [ ] User authentication (OAuth, email/password)
- [ ] Role-based access control
- [ ] Audit logs
- [ ] IP allowlisting
- [ ] Custom domain verification
- [ ] Email template rendering
- [ ] Inbound email filtering rules
- [ ] Official Docker image for local development
- [ ] Terraform module for infrastructure
- [ ] Helm chart for self-hosted (if backend abstraction is added)
- [ ] SLA monitoring and alerting
- [ ] Performance benchmarks and optimization

### GitHub Issues for v1.0
- #15 Support custom usernames
- #16 Add multi-domain management UI
- #19 Set up integration tests with Vitest
- #29 Admin dashboard with analytics
- #30 Multi-tenant architecture
- #31 User authentication system
- #32 Role-based access control
- #33 Audit logging
- #34 Custom domain verification flow
- #35 Terraform module
- #36 Performance optimization and benchmarks

---

## Future Ideas (Unscheduled)

- Mobile app (React Native)
- Browser extension (auto-fill disposable emails)
- CLI tool for terminal-based inbox management
- Plugin system for custom email processing
- Machine learning spam detection
- Disposable phone numbers (with Twilio integration)
- Email-to-webhook transformation pipeline
- GraphQL API alongside REST
- gRPC API for high-performance automation
- On-premise deployment guide (Cloudflare Hybrid)

---

## Release Process

1. Create a release branch (`release/v0.2`)
2. Update version in `package.json` files
3. Update `CHANGELOG.md`
4. Run full test suite
5. Create GitHub release with notes
6. Deploy to production
7. Tag the release commit

---

## Product Vision

Inbix is an Open Source Cloudflare-native Email Infrastructure
Platform.

Disposable inboxes are only one capability. The platform is primarily
designed for:

- Developers
- Test Automation
- CI/CD
- AI Agents
- API Integrations

The Dashboard is only one client. The REST API is the primary product.
Everything must be accessible through public APIs. SDKs, Dashboard and MCP
Server all consume the same APIs.

REST API, SDKs and the MCP Server are first-class interfaces.

---

## Monetization

### Open Source (Self-hosted)

- MIT License
- Unlimited deployments
- Unlimited active inboxes
- Unlimited API usage (subject to Cloudflare account limits)
- Unlimited custom domains
- Full REST API
- SDK support
- MCP Server support
- Community support
- Public documentation

No artificial limitations.

### Cloud Free

Anonymous:

- 1 Active Inbox
- 60-minute retention
- Shared public domains
- Limited API

Authenticated (Clerk):

- 5 Active Inboxes
- 12-hour retention
- Shared public domains
- Web Dashboard
- Basic REST API
- Limited API requests

Purpose: Encourage account creation before upgrading.

### Cloud Pro

Pricing: $2.99/month or $24/year

Features:

- Unlimited Active Inboxes
- Full REST API
- 10,000 API requests/month
- 7-day retention
- Custom inbox names
- Webhooks
- Higher rate limits
- Priority processing
- Ad-free

### Cloud Team

Pricing: $9.99/month

Features:

- Team Workspaces
- Shared Inboxes
- Shared API Keys
- Analytics
- Audit Logs
- Multiple Domains
- Higher API Limits

### Enterprise (Future)

- Dedicated infrastructure
- SLA
- SSO
- Private deployment
- Dedicated domains
- White-label

---

## Authentication

Official provider: Clerk

Supported methods:

- Email
- Password
- Magic Link
- Google
- GitHub
- Passkeys

Organizations: Use Clerk Organizations for Team plans.

RBAC roles:

- anonymous
- free
- pro
- team
- enterprise
- admin

Billing: Stripe

User entitlements are synchronized into Clerk metadata. The API reads
permissions directly from Clerk. No separate permission database.

---

## API First

Priorities:

1. Dashboard
2. REST API
3. SDKs
4. MCP Server
5. Cloud Hosting

---

## SDK Roadmap

Official SDKs:

- JavaScript
- TypeScript
- Python
- Go
- PHP
- Java
- C#

---

## MCP Roadmap

Package: `@inbix/mcp-server`

Supported transports:

- STDIO
- HTTP
- SSE (future)

Supported clients:

- Claude Desktop
- Claude Code
- Cursor
- Windsurf
- VS Code
- OpenAI-compatible MCP Clients

Initial tools:

- `create_inbox`
- `read_inbox`
- `read_message`
- `wait_for_email`
- `wait_for_otp`
- `extract_verification_link`
- `download_attachment`
- `search_messages`
- `delete_inbox`

Future MCP capabilities:

- Multi Inbox
- AI Spam Detection
- AI Phishing Detection
- Invoice Extraction
- Structured Email Extraction
- Email Summarization
- OTP Extraction
- Verification Link Extraction

---

## Repository Structure (Extended)

```
packages/
  mcp-server/     # @inbix/mcp-server
  sdk-js/         # JavaScript SDK
  sdk-python/     # Python SDK
  sdk-go/         # Go SDK
  sdk-php/        # PHP SDK
  shared/         # Shared types, constants, schemas
```

---

## Documentation Roadmap

Future documentation:

- API Reference
- SDK Guides
- MCP Guide
- Clerk Authentication
- Billing
- Organizations
- Self-hosting
- Cloud Deployment
- Playwright
- Cypress
- Selenium
- GitHub Actions
- Claude Code
- Cursor
- AI Agents
