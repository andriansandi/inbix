# Deployment Guide

This guide walks through deploying Inbix to Cloudflare from scratch.

## Prerequisites

1. **Cloudflare Account** — [Sign up](https://dash.cloudflare.com/sign-up) (free tier is sufficient)
2. **Node.js 24+** — [Download](https://nodejs.org) (required by pnpm 11's `node:sqlite`; see repo `.nvmrc`)
3. **pnpm** — `npm install -g pnpm`
4. **Domain in Cloudflare** — Your domain must use Cloudflare DNS for Email Routing

## Step-by-Step

### 1. Clone & Install

```bash
git clone https://github.com/andriansandi/inbix.git
cd inbix
pnpm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

This opens a browser to authenticate with your Cloudflare account.

### 3. Create D1 Database

```bash
npx wrangler d1 create inbix
```

Output:
```
✅ Successfully created DB 'inbix'
[[d1_databases]]
binding = "DB"
database_name = "inbix"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the `database_id` into `wrangler.jsonc` (at the repo root):

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "inbix",
    "database_id": "your-database-id-here"
  }
]
```

### 4. Create R2 Bucket

```bash
npx wrangler r2 bucket create inbix-attachments
```

### 5. Create KV Namespaces

```bash
npx wrangler kv namespace create CACHE
npx wrangler kv namespace create RATE_LIMIT_KV
```

Copy both namespace IDs into `wrangler.jsonc` (at the repo root):

```jsonc
"kv_namespaces": [
  { "binding": "CACHE", "id": "your-cache-kv-id" },
  { "binding": "RATE_LIMIT_KV", "id": "your-rate-limit-kv-id" }
]
```

### 6. Run Database Migrations

`pnpm db:migrate` is currently not working, so apply migrations manually with Wrangler:

```bash
npx wrangler d1 execute inbix --config wrangler.jsonc --file=packages/database/migrations/0001_initial.sql
npx wrangler d1 execute inbix --config wrangler.jsonc --file=packages/database/migrations/0002_add_user_id.sql
npx wrangler d1 execute inbix --config wrangler.jsonc --file=packages/database/migrations/0003_add_missing_tables.sql
npx wrangler d1 execute inbix --config wrangler.jsonc --file=packages/database/migrations/0004_notifications.sql
npx wrangler d1 execute inbix --config wrangler.jsonc --file=packages/database/migrations/0005_v02_api_and_automation.sql
```

Then seed the default domain:

```bash
npx wrangler d1 execute inbix --config wrangler.jsonc \
  --command="INSERT OR IGNORE INTO domains (id, domain, is_default, is_verified, created_at) VALUES ('domain_inbix_xyz', 'inbix.xyz', 1, 1, strftime('%s','now')*1000)"
```

### 7. Update Environment Variables & Secrets

Edit `wrangler.jsonc` (at the repo root) `vars` section:

```jsonc
"vars": {
  "ENVIRONMENT": "production",
  "APP_DOMAIN": "yourdomain.com",
  "CORS_ORIGIN": "https://yourdomain.com",
  "CLERK_PUBLISHABLE_KEY": "pk_live_...",
  "VAPID_PUBLIC_KEY": "...",
  "VAPID_SUBJECT": "mailto:noreply@yourdomain.com"
}
```

Set sensitive values as secrets via Wrangler:

```bash
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
```

- `CLERK_SECRET_KEY` — Clerk backend secret (dashboard auth).
- `VAPID_PRIVATE_KEY` — Web Push private key (required for browser push notifications).

### 8. Deploy

Inbix uses **Cloudflare Workers Builds** for production deploys. Once your repo is
connected (Workers & Pages → `inbix` → Settings → Builds), every push to `main`
automatically builds and deploys.

Ensure the Workers Builds **build command** includes the dashboard build:

```
pnpm install --frozen-lockfile && pnpm --filter @inbix/dashboard build
```

The deploy command is the default `wrangler deploy`, which picks up `wrangler.jsonc`
at the repo root and bundles the dashboard assets from `apps/web/public/`.

#### Manual deploy (alternative)

To deploy from your machine instead:

```bash
pnpm deploy
```

This command:
1. Builds the dashboard (`pnpm --filter @inbix/dashboard build`) — outputs to `apps/web/public/`
2. Deploys the Worker (`wrangler deploy`) — includes the static assets

Output:
```
Deployed inbix to https://inbix.your-subdomain.workers.dev
```

### 9. Set Up Email Routing

This is the most important step — it enables email reception.

> **Prerequisite:** Your domain must be added as a **zone** in Cloudflare (DNS tab)
> and fully active. If your domain is not yet on Cloudflare, add it first
> (Dashboard → Add a Site → enter domain → change nameservers at your registrar)
> and wait for it to become `active` before continuing.

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain
3. Navigate to **Email** → **Email Routing**
4. Click **Enable Email Routing**
5. Cloudflare will add the required MX and TXT DNS records automatically
6. Go to the **Routes** tab
7. Click **Catch-all address**
8. Set action to **Send to a Worker**
9. Select the `inbix` Worker
10. Click **Save**

### 10. (Optional) Custom Domain

To serve Inbix on your own domain instead of `*.workers.dev`:

1. Go to **Workers & Pages** → your `inbix` Worker → **Settings** → **Triggers**
2. Under **Custom Domains**, click **Add Custom Domain**
3. Enter `mail.yourdomain.com` (or any subdomain)
4. Click **Add Domain**

Cloudflare will automatically create the DNS record and provision an SSL certificate.

Update `CORS_ORIGIN` in `wrangler.jsonc` to match:
```jsonc
"CORS_ORIGIN": "https://mail.yourdomain.com"
```

Redeploy (push to `main` for Workers Builds, or `pnpm deploy` manually).

### 11. Verify

1. Visit your Worker URL (e.g., `https://mail.yourdomain.com`)
2. Click **New Inbox**
3. Send a test email to the generated address
4. The email should appear in the dashboard within seconds

## Updating

To update Inbix to the latest version:

```bash
git pull origin main
pnpm install
# Apply any new migrations manually — pnpm db:migrate is currently not working
npx wrangler d1 execute inbix --config wrangler.jsonc --file=packages/database/migrations/XXXX_latest.sql
pnpm deploy
```

## Local Development

```bash
# Terminal 1: Start the Worker (local D1, R2, KV via miniflare)
pnpm --filter @inbix/web dev

# Terminal 2: Start the Dashboard (Vite dev server with API proxy)
pnpm --filter @inbix/dashboard dev

# Or run both via turbo
pnpm dev
```

Dashboard: `http://localhost:5176`
Worker API: `http://localhost:8791`

### Local Email Testing

Cloudflare's local dev (`wrangler dev`) does not support the `email()` handler. To test email reception:

1. Deploy to a staging Worker and send real emails there, or
2. Use the API to manually create inboxes and insert test messages.

## Troubleshooting

### "Database not found"
Ensure the `database_id` in `wrangler.jsonc` matches the output from `wrangler d1 create`.

### "KV namespace not found"
Ensure the KV namespace IDs in `wrangler.jsonc` match the outputs from `wrangler kv namespace create`.

### Emails not arriving
1. Verify Email Routing is enabled in Cloudflare Dashboard
2. Verify the catch-all route sends to the `inbix` Worker
3. Check Worker logs: `npx wrangler tail`
4. Ensure your domain's MX records point to Cloudflare

### Dashboard shows 404
Ensure the dashboard was built before deploying:
```bash
pnpm --filter @inbix/dashboard build
pnpm --filter @inbix/web wrangler deploy
```

### CORS errors
Ensure `CORS_ORIGIN` in `wrangler.jsonc` includes your dashboard's origin.

## Rollback

```bash
# List recent deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler deployments rollback
```
