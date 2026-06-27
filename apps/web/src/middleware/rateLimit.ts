import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "../lib/env";
import { RATE_LIMIT, json } from "@inbix/shared";

export const rateLimit = createMiddleware<HonoEnv>(async (c, next) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }

  const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
  const key = `rl:${ip}:${Math.floor(Date.now() / (RATE_LIMIT.WINDOW_SECONDS * 1000))}`;

  const current = parseInt((await c.env.RATE_LIMIT_KV.get(key)) ?? "0", 10);

  if (current >= RATE_LIMIT.MAX_REQUESTS) {
    c.header("X-RateLimit-Limit", String(RATE_LIMIT.MAX_REQUESTS));
    c.header("X-RateLimit-Remaining", "0");
    c.header("Retry-After", String(RATE_LIMIT.WINDOW_SECONDS));
    return json(
      { success: false, error: "Rate limit exceeded. Please try again later." },
      429
    );
  }

  await c.env.RATE_LIMIT_KV.put(key, String(current + 1), {
    expirationTtl: RATE_LIMIT.WINDOW_SECONDS,
  });

  c.header("X-RateLimit-Limit", String(RATE_LIMIT.MAX_REQUESTS));
  c.header("X-RateLimit-Remaining", String(RATE_LIMIT.MAX_REQUESTS - current - 1));

  await next();
});
