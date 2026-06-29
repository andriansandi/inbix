import { Hono } from "hono";
import type { HonoEnv } from "../lib/env";
import { requireClerkAuth } from "../middleware/auth";
import {
  json,
  errorResponse,
  createApiKeySchema,
  generateApiKey,
  hashApiKey,
  getApiKeyPrefix,
} from "@inbix/shared";
import {
  createDatabase,
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "@inbix/database";

export const apiKeyRoutes = new Hono<HonoEnv>();

apiKeyRoutes.use("*", requireClerkAuth);

apiKeyRoutes.post("/", async (c) => {
  const userId = c.get("userId")!;
  const body = await c.req.json().catch(() => ({}));
  const parsed = createApiKeySchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const rawKey = generateApiKey();
  const keyHash = await hashApiKey(rawKey);
  const prefix = getApiKeyPrefix(rawKey);

  const db = createDatabase(c.env.DB);
  const apiKey = await createApiKey(db, parsed.data.name, keyHash, prefix, userId);

  return json({ success: true, data: { ...apiKey, key: rawKey } }, 201);
});

apiKeyRoutes.get("/", async (c) => {
  const userId = c.get("userId")!;
  const db = createDatabase(c.env.DB);
  const keys = await listApiKeys(db, userId);

  return json({ success: true, data: keys });
});

apiKeyRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId")!;
  const id = c.req.param("id");
  const db = createDatabase(c.env.DB);

  await revokeApiKey(db, id, userId);

  return json({ success: true, message: "API key revoked" });
});
