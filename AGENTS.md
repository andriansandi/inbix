# AGENTS.md

## Project Overview

Inbix — Open Source Cloudflare-native Email API Platform.
Monorepo: pnpm workspaces + turbo. Single Cloudflare Worker serves API + SPA.

- Repo: `git@github.com:andriansandi/inbix.git`
- Production: `https://inbix.xyz`

## Local Development

- **Web (dashboard/Vite):** `http://localhost:5176`
- **API (wrangler):** `http://localhost:8791`
- Vite proxies `/api` → `localhost:8791`
- Run: `pnpm dev` (turbo dev → Vite at :5176 + wrangler at :8791)

### Env Files

- `.dev.vars` at repo ROOT (next to `wrangler.jsonc`) — gitignored, contains:
  `CORS_ORIGIN=http://localhost:5176`, `ENVIRONMENT=development`, Clerk test keys, VAPID keys
- `apps/dashboard/.env` — `VITE_CLERK_PUBLISHABLE_KEY` = matching test key
- Frontend + backend MUST use keys from the same Clerk instance

### Local D1 Setup (fresh checkout)

```
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0001_initial.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0002_add_user_id.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0003_add_missing_tables.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0004_notifications.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --command="INSERT OR IGNORE INTO domains (id, domain, is_default, is_verified, created_at) VALUES ('domain_inbix_xyz', 'inbix.xyz', 1, 1, strftime('%s','now')*1000)"
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite (:5176) + wrangler (:8791) |
| `pnpm build` | Build all packages (turbo build) |
| `pnpm typecheck` | Typecheck all packages (12 tasks) — run before PR |
| `pnpm lint` | Lint (eslint not installed in some envs — may fail) |
| `pnpm deploy` | Build dashboard + deploy worker to Cloudflare |

## Workflow Conventions

- All changes via PR: branch from `origin/main` → push → `gh pr create --base main`
- User merges via GitHub UI
- After merge: `git checkout main && git pull && pnpm deploy`
- User communicates in Indonesian; respond in same language
- Run `pnpm typecheck` before PR
- `pnpm lint` may fail (eslint not installed) — skip if needed
- `pnpm install` may fail with `ERR_PNPM_IGNORED_BUILDS` — run again
- Restore `apps/web/public/.gitkeep` after builds (`git checkout -- apps/web/public/.gitkeep`)
- drizzle-kit migration generation is broken — write migration SQL manually + update `migrations/meta/_journal.json`
- `pnpm db:migrate` is broken — apply migrations manually via `wrangler d1 execute`

## Production Deploy

```
git checkout main && git pull
pnpm --filter @inbix/dashboard build
git checkout -- apps/web/public/.gitkeep
npx wrangler deploy --config wrangler.jsonc
```

## Environment

- **Production vars** (`wrangler.jsonc`): `ENVIRONMENT`, `APP_DOMAIN`, `CORS_ORIGIN`, `CLERK_PUBLISHABLE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`
- **Production secrets** (via `wrangler secret put`): `CLERK_SECRET_KEY`, `VAPID_PRIVATE_KEY`
- Wrangler v3 (`3.114.17`), `nodejs_compat` flag set
- Build runs WITHOUT `apps/dashboard/.env` in CI — Clerk key injected at runtime via Worker HTML injection

## Architecture

```
packages/
  database/     # Drizzle ORM schema, queries, migrations
  shared/       # Types, Zod schemas, constants, utils
  parser/       # MIME parsing, HTML sanitization
  sdk/          # TypeScript SDK
  ui/           # Shared UI components
apps/
  web/          # Cloudflare Worker (Hono API + email handler + static assets)
  dashboard/    # React SPA (Vite, React Router, Clerk, TailwindCSS)
```

### Key Files

- `apps/web/src/app.ts` — Hono app, route registration, CORS, middleware
- `apps/web/src/index.ts` — Worker entry (fetch + email handler), Clerk key injection
- `apps/web/src/email/handler.ts` — Email receiver, triggers push notifications
- `apps/web/src/lib/webPush.ts` — Web Push protocol (VAPID JWT + RFC 8291 encryption)
- `apps/web/src/lib/notify.ts` — Notification sender with preference checks
- `apps/web/src/middleware/auth.ts` — `authMiddleware` (optional) + `requireAuth` (strict)
- `apps/dashboard/src/components/ToastProvider.tsx` — In-app toast notifications
- `apps/dashboard/public/sw.js` — Service Worker for push notifications
