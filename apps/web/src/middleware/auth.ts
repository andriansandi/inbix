import { createMiddleware } from "hono/factory";
import { verifyToken } from "@clerk/backend";
import type { HonoEnv } from "../lib/env";
import { errorResponse, API_KEY_PREFIX, hashApiKey } from "@inbix/shared";
import { createDatabase, getApiKeyByHash, updateApiKeyLastUsed } from "@inbix/database";

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    await next();
    return;
  }

  const token = authHeader.slice(7);

  if (token.startsWith(API_KEY_PREFIX)) {
    const keyHash = await hashApiKey(token);
    const db = createDatabase(c.env.DB);
    const apiKey = await getApiKeyByHash(db, keyHash);

    if (apiKey) {
      c.set("apiKeyId", apiKey.id);
      c.set("userId", apiKey.userId ?? undefined);
      c.set("authMethod", "apikey");
      c.executionCtx.waitUntil(updateApiKeyLastUsed(db, apiKey.id).catch(() => {}));
    }

    await next();
    return;
  }

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
      c.set("authMethod", "clerk");
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

  if (token.startsWith(API_KEY_PREFIX)) {
    const keyHash = await hashApiKey(token);
    const db = createDatabase(c.env.DB);
    const apiKey = await getApiKeyByHash(db, keyHash);

    if (!apiKey) {
      return errorResponse("Invalid or revoked API key", 401);
    }

    c.set("apiKeyId", apiKey.id);
    c.set("userId", apiKey.userId ?? undefined);
    c.set("authMethod", "apikey");
    c.executionCtx.waitUntil(updateApiKeyLastUsed(db, apiKey.id).catch(() => {}));
    await next();
    return;
  }

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
    c.set("authMethod", "clerk");
  } catch {
    return errorResponse("Invalid or expired token", 401);
  }

  await next();
});

export const requireClerkAuth = createMiddleware<HonoEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse("Authentication required", 401);
  }

  const token = authHeader.slice(7);

  if (token.startsWith(API_KEY_PREFIX)) {
    return errorResponse("This endpoint requires session authentication, not an API key", 401);
  }

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
    c.set("authMethod", "clerk");
  } catch {
    return errorResponse("Invalid or expired token", 401);
  }

  await next();
});
