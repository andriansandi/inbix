# Contributing to Inbix

Thank you for your interest in contributing to Inbix! This document covers everything you need to know.

## Prerequisites

- Node.js 22+
- pnpm 11+
- A Cloudflare account (for testing Workers locally)
- Git

## Getting Started

1. **Fork & Clone**

```bash
git clone https://github.com/your-username/inbix.git
cd inbix
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Set Up Local Environment**

Copy the example local vars file at the repo root:

```bash
cp .dev.vars.example .dev.vars
```

Fill in the missing values (Clerk keys, VAPID keys, etc.).

4. **Create Local D1 Database**

```bash
npx wrangler d1 create inbix --local
# Update wrangler.jsonc with the database_id
```

5. **Apply Migrations**

```bash
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0001_initial.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0002_add_user_id.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0003_add_missing_tables.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0004_notifications.sql
npx wrangler d1 execute inbix --local --config wrangler.jsonc --file=packages/database/migrations/0005_v02_api_and_automation.sql
```

6. **Seed Default Domain**

```bash
npx wrangler d1 execute inbix --local --config wrangler.jsonc \
  --command="INSERT OR IGNORE INTO domains (id, domain, is_default, is_verified, created_at) VALUES ('domain_inbix_xyz', 'inbix.xyz', 1, 1, strftime('%s','now')*1000)"
```

7. **Start Development Servers**

```bash
# Terminal 1: Worker + API
pnpm --filter @inbix/web dev

# Terminal 2: Dashboard
pnpm --filter @inbix/dashboard dev
```

The dashboard runs at `http://localhost:5176` and proxies API requests to the Worker at `http://localhost:8791`.

## Project Structure

See the [README](README.md#monorepo-structure) for the full structure overview.

### Key Conventions

- **TypeScript everywhere** — strict mode, avoid `any` types.
- **Zod for validation** — all API inputs are validated with Zod schemas.
- **Drizzle ORM** — use the query functions in `packages/database/src/queries/`.
- **Shared types** — put shared types in `packages/shared`, not in app code.
- **No comments** — code should be self-documenting.
- **File naming** — `camelCase` for files, `PascalCase` for React components.

## Making Changes

### Code Style

- Use TypeScript strict mode.
- Follow existing patterns in the codebase.
- Avoid `any` — use `unknown` and narrow.
- Use Zod schemas for all API input validation.
- Prefer pure functions in packages, side-effectful code in apps.

### Before Submitting

1. **Type check**: `pnpm typecheck`
2. **Lint**: `pnpm lint`
3. **Build**: `pnpm build`
4. **Test your changes locally**

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add custom username support
fix: resolve SSE connection dropping after 30s
docs: update deployment guide
refactor: extract attachment validation to parser package
chore: bump dependencies
```

### Pull Requests

**All changes must go through a Pull Request.** Direct pushes to `main` are not allowed.

1. Create a feature branch from `main`:
   ```bash
   git checkout main && git pull origin main
   git checkout -b feat/my-feature      # feature
   git checkout -b fix/my-bug           # bug fix
   git checkout -b docs/my-docs         # documentation
   git checkout -b refactor/my-refactor # refactoring
   ```
2. Make your changes.
3. Ensure `pnpm typecheck` and `pnpm build` pass.
4. Push and create a PR using the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
5. Link any related issues.
6. Wait for CI to pass (typecheck, build, security audit).
7. Request review — PRs must be **manually approved** via the GitHub UI before merging.
8. Merge via **Squash and merge** (recommended).

**Branch protection rules on `main`**:

- Apply to everyone, including the repo owner.
- Require a Pull Request before merging.
- Required reviewers are optional (0 required reviews), so solo developers can create, review, and merge their own PRs.
- Require status checks to pass (CI: Type Check, Build, Security Audit).
- No force push and no branch deletion.
- Require linear history.

### PR Checklist

- [ ] Code follows the project's style conventions.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm build` passes.
- [ ] No new `any` types introduced.
- [ ] API changes are reflected in the SDK and docs.
- [ ] Breaking changes are documented.

## Testing

Inbix currently relies on manual testing and the built-in MCP smoke test. A broader automated test suite is on the roadmap. When adding new logic, please verify the affected endpoints or flows locally.

## Adding New Features

### New API Endpoint

1. Add the route in `apps/web/src/routes/`.
2. Add the Zod validation schema in `packages/shared/src/schemas.ts`.
3. Add database queries in `packages/database/src/queries/index.ts`.
4. Add the SDK method in `packages/sdk/src/index.ts`.
5. Update the API docs in `docs/API.md`.

### New UI Component

1. Add the component in `packages/ui/src/components/`.
2. Export it from `packages/ui/src/index.ts`.
3. Use it in dashboard pages.

### New Database Table

1. Add the schema in `packages/database/src/schema/index.ts`.
2. Write the migration SQL manually in `packages/database/migrations/` (drizzle-kit generation is currently not used).
3. Update `migrations/meta/_journal.json` accordingly.
4. Add query functions in `packages/database/src/queries/index.ts`.
5. Apply the migration locally with `npx wrangler d1 execute`.

## Reporting Issues

Use the [issue templates](.github/ISSUE_TEMPLATE/) to report bugs or request features. Provide as much detail as possible.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
