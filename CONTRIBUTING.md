# Contributing to Inbix

Thank you for your interest in contributing to Inbix! This document covers everything you need to know.

## Prerequisites

- Node.js 22+
- pnpm 11+
- A Cloudflare account (for testing Workers locally)

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

```bash
cp apps/web/.dev.vars.example apps/web/.dev.vars
```

4. **Create Local D1 Database**

```bash
npx wrangler d1 create inbix-dev --local
# Update apps/web/wrangler.toml with the database_id
pnpm db:migrate
```

5. **Start Development Servers**

```bash
# Terminal 1: Start the Worker
pnpm --filter @inbix/web dev

# Terminal 2: Start the Dashboard
pnpm --filter @inbix/dashboard dev
```

The dashboard runs at `http://localhost:5173` and proxies API requests to the Worker at `http://localhost:8787`.

## Project Structure

See the [README](README.md#monorepo-structure) for the full structure overview.

### Key Conventions

- **TypeScript everywhere** — strict mode, no `any` types
- **Zod for validation** — all API inputs are validated with Zod schemas
- **Drizzle ORM** — use the query functions in `packages/database/src/queries/`
- **Shared types** — put shared types in `packages/shared`, not in app code
- **No comments** — code should be self-documenting
- **File naming** — `camelCase` for files, `PascalCase` for React components

## Making Changes

### Code Style

- Use TypeScript strict mode
- Follow existing patterns in the codebase
- No `any` types — use `unknown` and narrow
- Use Zod schemas for all API input validation
- Prefer pure functions in packages, side-effectful code in apps

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

**Semua perubahan wajib melalui Pull Request.** Tidak ada push langsung ke `main`.

1. Create a feature branch from `main`:
   ```bash
   git checkout main && git pull origin main
   git checkout -b feat/my-feature      # feature
   git checkout -b fix/my-bug           # bug fix
   git checkout -b docs/my-docs         # documentation
   git checkout -b refactor/my-refactor # refactoring
   ```
2. Make your changes
3. Ensure `pnpm typecheck` and `pnpm build` pass
4. Push and create a PR using the [PR template](.github/PULL_REQUEST_TEMPLATE.md)
5. Link any related issues
6. Wait for CI to pass (typecheck, build, security audit)
7. Request review — PR must be **manually approved** via GitHub UI before merging
8. Merge via **Squash and merge** (recommended)

**Branch protection rules** on `main` (dengan `enforce_admins: true`):
- **Berlaku untuk semua orang, termasuk repo owner** — tidak ada push langsung ke `main`
- Require pull request before merging
- Require approval (at least 1 reviewer) — manual approve via GitHub UI
- Require status checks to pass (CI: Type Check, Build, Security Audit)
- Require conversation resolution
- No force push, no branch deletion
- Require linear history

### PR Checklist

- [ ] Code follows the project's style conventions
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] No new `any` types introduced
- [ ] API changes are reflected in the SDK and docs
- [ ] Breaking changes are documented

## Testing

Currently, Inbix uses manual testing. A test framework setup is on the roadmap for v0.2.

## Adding New Features

### New API Endpoint

1. Add the route in `apps/web/src/routes/`
2. Add Zod validation schema in `packages/shared/src/schemas.ts`
3. Add database queries in `packages/database/src/queries/index.ts`
4. Add SDK method in `packages/sdk/src/index.ts`
5. Update API docs in `README.md`

### New UI Component

1. Add the component in `packages/ui/src/components/`
2. Export from `packages/ui/src/index.ts`
3. Use in dashboard pages

### New Database Table

1. Add schema in `packages/database/src/schema/index.ts`
2. Generate migration: `pnpm db:generate`
3. Add query functions in `packages/database/src/queries/index.ts`
4. Run migration: `pnpm db:migrate`

## Reporting Issues

Use the [issue templates](.github/ISSUE_TEMPLATE/) to report bugs or request features. Provide as much detail as possible.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
