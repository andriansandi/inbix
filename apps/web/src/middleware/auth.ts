import { createMiddleware } from "hono/factory";
import { verifyToken } from "@clerk/backend";
import type { HonoEnv } from "../lib/env";

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    await next();
    return;
  }

  const token = authHeader.slice(7);
  try {
    const authorizedParties = (c.env.CORS_ORIGIN ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
      authorizedParties,
    });

    if (payload.sub) {
      c.set("userId", payload.sub);
    }
  } catch {
    // Invalid token — proceed as anonymous
  }

  await next();
});
