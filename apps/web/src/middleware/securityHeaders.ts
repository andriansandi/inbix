import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "../lib/env";

export const securityHeaders = createMiddleware<HonoEnv>(async (c, next) => {
  await next();

  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");

  // Preserve a stricter CSP set by the route handler (e.g. the email HTML
  // endpoint at /api/messages/:id/html). Only apply the global CSP when the
  // handler hasn't set one.
  if (!c.res.headers.get("Content-Security-Policy")) {
    c.header(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self';"
    );
  }
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
});
