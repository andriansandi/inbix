# Changelog

All notable changes to Inbix will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-06-27

### Added
- Initial release of Inbix
- Generate random disposable inbox with one click
- Receive emails via Cloudflare Email Workers
- Inbox list management (create, view, delete)
- Read HTML emails with sanitized rendering in sandboxed iframe
- Read plain text emails
- Attachment support (stored in R2, up to 10MB each)
- Auto expiration with configurable TTL (1 min to 7 days)
- Real-time message updates via Server-Sent Events (SSE)
- Copy email address to clipboard
- Responsive dashboard UI (dark mode first)
- Homepage with hero, features, architecture, deploy guide, GitHub CTA
- REST API for all operations
- TypeScript SDK (`@inbix/sdk`)
- HTML sanitization pipeline (custom tokenizer + tag/attr whitelist)
- Rate limiting (60 req/min per IP via KV)
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- CORS configuration
- Auto cleanup of expired inboxes and their data
- Drizzle ORM with D1 database
- Database migrations
- GitHub Actions CI (typecheck, build, audit)
- GitHub Actions deploy workflow
- Issue templates (bug report, feature request, question)
- Pull request template
- CODEOWNERS
- Documentation: README, Architecture, Deployment, Development, FAQ, Security, Contributing, Code of Conduct
- Roadmap with milestones (v0.1 → v1.0)

### Technical Details
- Monorepo with pnpm workspaces and Turborepo
- Single Cloudflare Worker handles both email and HTTP
- Dashboard served as static assets via Workers Static Assets
- Packages: shared, database, parser, sdk, ui
- Apps: web (Worker), dashboard (React SPA)
