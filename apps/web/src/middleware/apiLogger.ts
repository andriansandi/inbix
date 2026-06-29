import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "../lib/env";
import { createDatabase, createApiLog } from "@inbix/database";

export const apiLogger = createMiddleware<HonoEnv>(async (c, next) => {
  const startTime = Date.now();
  await next();
  const durationMs = Date.now() - startTime;

  const apiKeyId = c.get("apiKeyId");
  if (!apiKeyId) return;

  const userId = c.get("userId");
  const requestId = c.get("requestId");

  c.executionCtx.waitUntil(
    createApiLog(createDatabase(c.env.DB), {
      apiKeyId,
      userId: userId ?? null,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
      requestId,
    }).catch(() => {})
  );
});
