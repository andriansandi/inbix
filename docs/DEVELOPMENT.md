# Development Guide

## Local Setup

```bash
git clone https://github.com/andriansandi/inbix.git
cd inbix
pnpm install
```

## Running Locally

### Start Worker (API + Email handler)

```bash
pnpm --filter @inbix/web dev
```

This runs `wrangler dev` which starts a local Worker at `http://localhost:8787` with local D1, R2, and KV emulated by Miniflare.

### Start Dashboard

```bash
pnpm --filter @inbix/dashboard dev
```

This runs Vite dev server at `http://localhost:5173` with API requests proxied to the Worker.

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
pnpm typecheck       # Type check all packages
pnpm build           # Build all packages
pnpm lint            # Lint all packages
pnpm db:generate     # Generate D1 migration from schema changes
pnpm db:migrate      # Run D1 migrations
pnpm db:studio       # Open Drizzle Studio (visual DB browser)
pnpm --filter @inbix/web tail  # View live Worker logs
```

## Working with the Database

### Modifying Schema

1. Edit `packages/database/src/schema/index.ts`
2. Generate migration:
   ```bash
   pnpm db:generate
   ```
3. Review the generated SQL in `packages/database/migrations/`
4. Apply migration:
   ```bash
   pnpm db:migrate
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
curl -X POST http://localhost:8787/api/inboxes

# The dashboard will show the inbox
```

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
