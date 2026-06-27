import { Hono } from "hono";
import type { HonoEnv } from "@inbix/shared";
import { json, errorResponse, addDomainSchema } from "@inbix/shared";
import { createDatabase, listDomains, addDomain } from "@inbix/database";

export const domainRoutes = new Hono<HonoEnv>();

domainRoutes.get("/", async (c) => {
  const db = createDatabase(c.env.DB);
  const domains = await listDomains(db);
  return json({ success: true, data: domains });
});

domainRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = addDomainSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const db = createDatabase(c.env.DB);
  const domain = await addDomain(db, parsed.data.domain, parsed.data.isDefault ?? false);
  return json({ success: true, data: domain }, 201);
});
