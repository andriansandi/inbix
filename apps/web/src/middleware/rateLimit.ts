import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "../lib/env";
import { RATE_LIMIT, API_KEY_RATE_LIMIT, json } from "@inbix/shared";

export const rateLimit = createMiddleware<HonoEnv>(async (c, next) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }

  const apiKeyId = c.get("apiKeyId");
  const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";

  const limit = apiKeyId ? API_KEY_RATE_LIMIT.MAX_REQUESTS : RATE_LIMIT.MAX_REQUESTS;
  const windowSeconds = apiKeyId ? API_KEY_RATE_LIMIT.WINDOW_SECONDS : RATE_LIMIT.WINDOW_SECONDS;
  const identifier = apiKeyId ?? ip;

  const key = `rl:${identifier}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;

  const current = parseInt((await c.env.RATE_LIMIT_KV.get(key)) ?? "0", 10);

  if (current >= limit) {
    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", "0");
    c.header("Retry-After", String(windowSeconds));
    return json(
      { success: false, error: "Rate limit exceeded. Please try again later." },
      429
    );
  }

  await c.env.RATE_LIMIT_KV.put(key, String(current + 1), {
    expirationTtl: windowSeconds,
  });

  c.header("X-RateLimit-Limit", String(limit));
  c.header("X-RateLimit-Remaining", String(limit - current - 1));

  await next();
});
