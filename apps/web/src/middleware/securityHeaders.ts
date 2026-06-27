import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "@inbix/shared";

export const securityHeaders = createMiddleware<HonoEnv>(async (c, next) => {
  await next();

  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
  );
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
});
