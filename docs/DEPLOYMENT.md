# Deployment Guide

This guide walks through deploying Inbix to Cloudflare from scratch.

## Prerequisites

1. **Cloudflare Account** — [Sign up](https://dash.cloudflare.com/sign-up) (free tier is sufficient)
2. **Node.js 20+** — [Download](https://nodejs.org)
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

Copy the `database_id` into `apps/web/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "inbix"
database_id = "your-database-id-here"
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

Copy both namespace IDs into `apps/web/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-cache-kv-id"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-rate-limit-kv-id"
```

### 6. Run Database Migrations

```bash
pnpm db:migrate
```

This creates all tables (inboxes, messages, attachments, api_keys, domains, users) in your D1 database.

### 7. Update Environment Variables

Edit `apps/web/wrangler.toml` `[vars]` section:

```toml
[vars]
ENVIRONMENT = "production"
APP_DOMAIN = "yourdomain.com"
CORS_ORIGIN = "https://yourdomain.com"
```

### 8. Build & Deploy

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

Update `CORS_ORIGIN` in `wrangler.toml` to match:
```toml
CORS_ORIGIN = "https://mail.yourdomain.com"
```

Redeploy:
```bash
pnpm deploy
```

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
pnpm db:migrate  # Apply any new migrations
pnpm deploy
```

## Local Development

```bash
# Terminal 1: Start the Worker (local D1, R2, KV via miniflare)
pnpm --filter @inbix/web dev

# Terminal 2: Start the Dashboard (Vite dev server with API proxy)
pnpm --filter @inbix/dashboard dev
```

Dashboard: `http://localhost:5173`
Worker API: `http://localhost:8787`

### Local Email Testing

Cloudflare's local dev (`wrangler dev`) does not support the `email()` handler. To test email reception locally:

1. Use `wrangler dev` for API testing
2. Deploy to a staging Worker for email testing
3. Or use the API to manually insert test messages

## Troubleshooting

### "Database not found"
Ensure the `database_id` in `wrangler.toml` matches the output from `wrangler d1 create`.

### "KV namespace not found"
Ensure the KV namespace IDs in `wrangler.toml` match the outputs from `wrangler kv namespace create`.

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
Ensure `CORS_ORIGIN` in `wrangler.toml` includes your dashboard's origin.

## Rollback

```bash
# List recent deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler deployments rollback
```
