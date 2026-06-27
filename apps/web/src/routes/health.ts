import { Hono } from "hono";
import type { HonoEnv } from "@inbix/shared";
import { json } from "@inbix/shared";

export const healthRoutes = new Hono<HonoEnv>();

healthRoutes.get("/health", (c) => {
  return json({
    success: true,
    data: {
      status: "ok",
      timestamp: Date.now(),
      version: "0.1.0",
    },
  });
});

healthRoutes.get("/health/db", async (c) => {
  try {
    const result = await c.env.DB.prepare("SELECT 1 as test").first();
    return json({
      success: true,
      data: { database: "ok", result },
    });
  } catch (err) {
    return json(
      {
        success: false,
        error: `Database error: ${(err as Error).message}`,
      },
      503
    );
  }
});

healthRoutes.get("/health/r2", async (c) => {
  try {
    const testKey = `health-check/${Date.now()}`;
    await c.env.R2_BUCKET.put(testKey, new TextEncoder().encode("ok"));
    await c.env.R2_BUCKET.delete(testKey);
    return json({
      success: true,
      data: { r2: "ok" },
    });
  } catch (err) {
    return json(
      {
        success: false,
        error: `R2 error: ${(err as Error).message}`,
      },
      503
    );
  }
});
