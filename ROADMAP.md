# Roadmap

This document outlines the planned development milestones for Inbix.

## v0.1 — MVP (Current)

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

**Goal**: Production-ready API for automation and CI/CD.

- [ ] API key authentication
- [ ] Per-key rate limiting
- [ ] Custom usernames (choose your own inbox address)
- [ ] Multiple domains support (add/remove via API/dashboard)
- [ ] TypeScript SDK published to npm
- [ ] API documentation site (OpenAPI/Swagger)
- [ ] Webhook for inbox creation
- [ ] Inbox quota management
- [ ] Request/response logging (opt-in)
- [ ] Integration test suite

### GitHub Issues for v0.2
- #13 Implement API key generation and authentication
- #14 Add per-key rate limiting
- #15 Support custom usernames
- #16 Add multi-domain management UI
- #17 Publish @inbix/sdk to npm
- #18 Generate OpenAPI spec
- #19 Set up integration tests with Vitest
- #20 Add webhook support for inbox events

---

## v0.3 — Power Features

**Goal**: Advanced features for power users.

- [ ] Webhooks for new messages
- [ ] Full-text search across messages
- [ ] Email forwarding (redirect to real inbox)
- [ ] Spam protection (header analysis, content scoring)
- [ ] Custom TTL per inbox (fine-grained)
- [ ] Inbox pinning (prevent auto-expiry)
- [ ] Message starring/favorites
- [ ] Export inbox (JSON, EML)
- [ ] Dark/light mode toggle
- [ ] Keyboard shortcuts
- [ ] WebSocket support (alternative to SSE)
- [ ] Durable Objects for real-time (if SSE proves insufficient)

### GitHub Issues for v0.3
- #21 Implement message webhooks
- #22 Add full-text search with FTS5
- #23 Email forwarding support
- #24 Spam protection heuristics
- #25 Inbox pinning and custom TTL
- #26 Message export (JSON, EML)
- #27 Dark/light mode toggle
- #28 Keyboard shortcuts

---

## v1.0 — Production

**Goal**: Enterprise-ready, multi-tenant platform.

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
