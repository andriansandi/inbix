# Development Guide

## Local Setup

### Requirements

- Node.js 24+ (see repo `.nvmrc`)
- pnpm 11+
- A Cloudflare account (for local D1/R2/KV emulation)

### Install

```bash
git clone https://github.com/andriansandi/inbix.git
cd inbix
pnpm install
```

## Environment Setup

The dashboard and the Worker need matching Clerk keys from the same Clerk application.

### Dashboard (`apps/dashboard/.env`)

Create `apps/dashboard/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

This value must match the `CLERK_PUBLISHABLE_KEY` used by the Worker.

### Worker (root `.dev.vars`)

Create `.dev.vars` at the repo root:

```env
APP_DOMAIN=inbix.xyz
CORS_ORIGIN=http://localhost:5176
ENVIRONMENT=development
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:noreply@inbix.xyz
```

`VAPID_*` keys are only required for local Web Push testing.

### Local database

If the local D1 database does not have tables, apply the migrations manually. `pnpm db:migrate` is currently not working, so use Wrangler directly:

```bash
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0001_initial.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0002_add_user_id.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0003_add_missing_tables.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0004_notifications.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0005_v02_api_and_automation.sql
```

Then seed the default domain:

```bash
npx wrangler d1 execute inbix --local --config wrangler.jsonc \
  --command="INSERT OR IGNORE INTO domains (id, domain, is_default, is_verified, created_at) VALUES ('domain_inbix_xyz', 'inbix.xyz', 1, 1, strftime('%s','now')*1000)"
```

## Running Locally

### Start Worker (API + Email handler)

```bash
pnpm --filter @inbix/web dev
```

This runs `wrangler dev` which starts a local Worker at `http://localhost:8791` with local D1, R2, and KV emulated by Miniflare.

### Start Dashboard

```bash
pnpm --filter @inbix/dashboard dev
```

This runs Vite dev server at `http://localhost:5176` with `/api` requests proxied to the Worker.

### Run Both Simultaneously

```bash
# Terminal 1
pnpm --filter @inbix/web dev

# Terminal 2
pnpm --filter @inbix/dashboard dev
```

Or use turbo:
```bash
pnpm dev
```

## Common Commands

```bash
pnpm typecheck       # Type check all packages (run before PR)
pnpm build           # Build all packages
pnpm lint            # Lint all packages (eslint may not be installed in some envs)
pnpm db:generate     # Generate D1 migration from schema changes (currently broken, write SQL manually)
pnpm db:migrate      # Run D1 migrations (currently broken, use wrangler d1 execute)
pnpm db:studio       # Open Drizzle Studio (visual DB browser)
pnpm --filter @inbix/web tail  # View live Worker logs
```

## Working with the Database

### Modifying Schema

1. Edit `packages/database/src/schema/index.ts`
2. Write the migration SQL manually in `packages/database/migrations/`
3. Update `packages/database/migrations/meta/_journal.json`
4. Apply the migration locally:
   ```bash
   npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/XXXX_your_migration.sql
   ```

### Drizzle Studio

Visual database browser:
```bash
pnpm db:studio
```

## Working with Packages

### Shared Types & Schemas

Add shared types to `packages/shared/src/types.ts` and Zod schemas to `packages/shared/src/schemas.ts`.

### Database Queries

Add query functions to `packages/database/src/queries/index.ts`. Use Drizzle ORM's query builder.

### Email Parser

Email parsing logic is in `packages/parser/`. The main entry is `parseEmail()` which uses `postal-mime` to parse raw MIME.

### SDK

The TypeScript SDK is in `packages/sdk/`. It provides a `InbixClient` class with methods for all API endpoints.

## Testing Email Locally

The `wrangler dev` local environment does not support the `email()` handler. To test email reception:

### Option 1: Deploy a Staging Worker

```bash
# Deploy to a staging environment
pnpm deploy
# Send emails to the deployed address
```

### Option 2: Manual Insert via API

Use the API to test the dashboard without real emails:
```bash
# Create an inbox
curl -X POST http://localhost:8791/api/inboxes

# The dashboard will show the inbox
```

## Testing the MCP Server locally

1. Start the local stack:

```bash
pnpm dev
```

2. Seed a local test API key:

```bash
npx wrangler d1 execute inbix --local --config wrangler.jsonc \
  --command="INSERT OR REPLACE INTO api_keys (id, name, key_hash, prefix, user_id, created_at, last_used_at, is_active) VALUES ('key_local_test', 'Local Test Key', '7dff8481e8d2d24bdd50828893c621ebc1b342bbace3ea03854b0ec006e1f7f5', 'inbix_local', NULL, strftime('%s','now')*1000, NULL, 1)"
```

3. Run the smoke test:

```bash
node packages/mcp-server/scripts/smoke-test.cjs
```

This starts the MCP server via STDIO and calls `create_inbox` against `http://localhost:8791`.

See [`docs/MCP.md`](./MCP.md) for full client configuration examples.

## Debugging

### Worker Logs

```bash
# Local
pnpm --filter @inbix/web dev  # logs in terminal

# Production
pnpm --filter @inbix/web tail
```

### D1 Queries

```bash
# Run a query
npx wrangler d1 execute inbix --command "SELECT * FROM inboxes LIMIT 5"

# Run a query (local)
npx wrangler d1 execute inbix --local --command "SELECT * FROM inboxes LIMIT 5"
```

### R2 Objects

```bash
# List objects
npx wrangler r2 object list inbix-attachments

# Get an object
npx wrangler r2 object get inbix-attachments/attachments/xxx/filename.ext
```

## Code Style

- TypeScript strict mode
- No `any` types
- No comments (self-documenting code)
- Conventional Commits
- File naming: `camelCase` for files, `PascalCase` for React components
- Import order: external packages → internal packages → relative imports
