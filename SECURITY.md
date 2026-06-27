# Security Policy

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Inbix, please report it responsibly.

### How to Report

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@inbix.xyz**

Include the following:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Action              | Timeline     |
| ------------------- | ------------ |
| Acknowledge receipt | Within 48h   |
| Initial assessment  | Within 7 days|
| Fix or mitigation   | Within 30 days|
| Public disclosure   | After fix is released |

## Security Measures

Inbix implements the following security measures:

### HTML Sanitization
All HTML email content is sanitized before rendering. The sanitizer:
- Allows only a safe subset of HTML tags
- Strips `script`, `style`, `iframe`, `object`, `embed` tags
- Removes event handler attributes (`onclick`, `onload`, etc.)
- Blocks dangerous CSS (`expression()`, `javascript:`, `position: fixed/absolute`)
- Validates URL protocols (only `http`, `https`, `mailto`, `cid`, `data:image`)
- HTML is rendered in a sandboxed iframe with strict CSP

### Attachment Validation
- Maximum attachment size: 10MB
- Blocked content types (executables, batch files)
- Maximum 20 attachments per message
- Attachments stored in R2, served with `Content-Disposition: attachment`

### Rate Limiting
- 60 requests per minute per IP (configurable)
- 10 inbox creations per minute per IP
- Tracked via Cloudflare KV with automatic expiration

### Security Headers
- `Content-Security-Policy` — restrictive CSP on all responses
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, microphone, geolocation disabled

### CORS
- Only configured origins are allowed
- Credentials are not sent cross-origin

### SQL Injection Prevention
- All database queries use Drizzle ORM with parameterized queries
- No raw SQL string concatenation

### API Key Security
- API keys are hashed with SHA-256 before storage
- Keys are never logged or returned in API responses
- Constant-time comparison for key validation

## Self-Hosting Security Checklist

When self-hosting Inbix, ensure:

- [ ] `CORS_ORIGIN` is set to your specific domain (not `*`)
- [ ] Email Routing is configured with a catch-all to the Worker
- [ ] D1 database is not publicly accessible
- [ ] R2 bucket has no public access (all access via Worker)
- [ ] Rate limiting KV namespace is active
- [ ] `wrangler.toml` does not contain secrets (use `wrangler secret put`)
- [ ] HTTPS is enforced (Cloudflare does this by default)

## Dependency Security

- Dependencies are kept up to date
- `pnpm audit` is run in CI
- No `eval()` or `new Function()` in the codebase
- No `dangerouslySetInnerHTML` in React (HTML rendered via sandboxed iframe)

## Scope

This policy applies to the main `inbix` repository. Third-party integrations and custom deployments are out of scope.

## Acknowledgments

We thank all security researchers who responsibly disclose vulnerabilities.
