import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "@inbix/shared";
import { generateRequestToken } from "@inbix/shared";

export const requestId = createMiddleware<HonoEnv>(async (c, next) => {
  const id = c.req.header("X-Request-Id") ?? generateRequestToken();
  c.set("requestId", id);
  c.header("X-Request-Id", id);
  await next();
});
