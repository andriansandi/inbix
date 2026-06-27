# FAQ

## General

### What is Inbix?
Inbix is an open-source disposable email platform that runs entirely on Cloudflare Workers. It lets you generate temporary email addresses, receive emails, and read them in a modern web dashboard — all without managing SMTP servers, Docker containers, or VPS instances.

### Is Inbix free?
Yes. Inbix is MIT-licensed open source. Cloudflare's free tier provides 100K Worker requests/day, 5M D1 reads/day, and 10GB R2 storage — more than enough for personal or small-team use.

### How is Inbix different from other disposable email services?
Most disposable email services are hosted by third parties. You don't control the data, the domain, or the uptime. Inbix is self-hosted on your own Cloudflare account — you own the data, the domain, and the infrastructure.

### Do I need to know Cloudflare to use it?
Basic Cloudflare knowledge helps (creating a D1 database, R2 bucket, enabling Email Routing). The deployment guide walks through every step. If you can run `git clone` and `pnpm deploy`, you can run Inbix.

## Technical

### Do I need a domain?
Yes. Cloudflare Email Routing requires a domain managed by Cloudflare DNS. You can register a domain through Cloudflare Registrar or transfer an existing domain.

### Can I use multiple domains?
Yes. Add domains via the API (`POST /api/domains`) or configure them in the dashboard. All domains must have Email Routing enabled and pointed to the Inbix Worker.

### How long do inboxes last?
By default, 24 hours. You can customize the TTL when creating an inbox (1 minute to 7 days). Expired inboxes and their messages are automatically deleted.

### How are attachments handled?
Attachments are stored in Cloudflare R2 (object storage). Metadata (filename, content type, size) is stored in D1. Attachments are downloadable via the API and dashboard. Max size: 10MB per attachment, 20 attachments per message.

### Is the HTML email viewer safe?
Yes. All HTML is sanitized through a custom pipeline that strips scripts, dangerous CSS, and unsafe URLs. The sanitized HTML is rendered in a sandboxed iframe with a strict Content-Security-Policy.

### How does real-time work?
The dashboard uses Server-Sent Events (SSE). When a new email arrives, the Worker stores it in D1, and the SSE connection polls for new messages and streams them to the dashboard instantly.

### Can I use the API without the dashboard?
Yes. The REST API is fully functional standalone. Use it for automation, CI/CD pipelines, or custom integrations.

### Does Inbix work with CI/CD pipelines?
Yes. The API is designed for automation. Generate an inbox, use it in your test suite, poll for messages, and delete it when done — all via the REST API.

## Self-Hosting

### Can I run Inbix without Cloudflare?
Not currently. Inbix is Cloudflare-native by design, using D1, R2, KV, and Email Workers. A version with alternative backends (PostgreSQL, S3, etc.) is on the roadmap.

### How much does it cost to run?
For most users: $0/month on Cloudflare's free tier. For high-volume usage, Cloudflare Workers paid plan is $5/month and includes 10M requests.

### Can I restrict access to my instance?
The MVP is open (no authentication). API key authentication is planned for v0.2. For now, you can restrict access via Cloudflare Access (Zero Trust).

### How do I update Inbix?
```bash
git pull origin main
pnpm install
pnpm db:migrate
pnpm deploy
```

## Privacy & Security

### Where is my data stored?
All data is in your Cloudflare account. D1 (metadata), R2 (attachments), and KV (cache) — nothing is sent to third parties.

### Is my data encrypted?
D1, R2, and KV encrypt data at rest. Data in transit uses HTTPS/TLS. Cloudflare handles all encryption.

### Can Cloudflare read my emails?
Cloudflare processes emails through Email Routing and Workers. While Cloudflare's infrastructure handles the data, your Worker code controls what is stored and how. Inbix only stores email content in your D1/R2 — no analytics, no logging of content.

### How do I delete all data?
Delete the D1 database, R2 bucket, and KV namespaces via Wrangler. Or set very short TTLs and let auto-expiration handle it.

## Roadmap

See the [README](../README.md#roadmap) for the full roadmap.

### Will you add authentication?
Yes. API key authentication is planned for v0.2. Admin dashboard with user accounts is planned for v1.0.

### Will you add webhooks?
Yes, webhooks are planned for v0.3. You'll be able to configure a webhook URL per inbox to receive real-time notifications.

### Will you add search?
Yes, full-text search across messages is planned for v0.3.
