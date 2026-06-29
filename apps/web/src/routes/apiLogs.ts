import { Hono } from "hono";
import type { HonoEnv } from "../lib/env";
import { requireAuth } from "../middleware/auth";
import { json, errorResponse, listApiLogsSchema } from "@inbix/shared";
import { createDatabase, listApiLogs } from "@inbix/database";

export const apiLogRoutes = new Hono<HonoEnv>();

apiLogRoutes.use("*", requireAuth);

apiLogRoutes.get("/", async (c) => {
  const userId = c.get("userId")!;
  const query = listApiLogsSchema.safeParse(c.req.query());

  if (!query.success) {
    return errorResponse("Invalid pagination parameters", 400);
  }

  const db = createDatabase(c.env.DB);
  const { rows, total } = await listApiLogs(db, userId, query.data.page, query.data.pageSize);
  const totalPages = Math.ceil(total / query.data.pageSize);

  return json({
    success: true,
    data: {
      data: rows,
      pagination: {
        page: query.data.page,
        pageSize: query.data.pageSize,
        total,
        totalPages,
      },
    },
  });
});
