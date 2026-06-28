import { createMiddleware } from "hono/factory";
import { verifyToken } from "@clerk/backend";
import type { HonoEnv } from "../lib/env";
import { errorResponse } from "@inbix/shared";

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

export const requireAuth = createMiddleware<HonoEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse("Authentication required", 401);
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

    if (!payload.sub) {
      return errorResponse("Invalid authentication", 401);
    }

    c.set("userId", payload.sub);
  } catch {
    return errorResponse("Invalid or expired token", 401);
  }

  await next();
});
