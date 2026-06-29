import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "./middleware/requestId";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { rateLimit } from "./middleware/rateLimit";
import { securityHeaders } from "./middleware/securityHeaders";
import { authMiddleware } from "./middleware/auth";
import { apiLogger } from "./middleware/apiLogger";
import type { HonoEnv } from "./lib/env";
import { inboxRoutes } from "./routes/inboxes";
import { messageRoutes } from "./routes/messages";
import { healthRoutes } from "./routes/health";
import { domainRoutes } from "./routes/domains";
import { pushRoutes } from "./routes/push";
import { notificationRoutes } from "./routes/notifications";
import { apiKeyRoutes } from "./routes/apiKeys";
import { webhookRoutes } from "./routes/webhooks";
import { apiLogRoutes } from "./routes/apiLogs";
import { openapiRoutes } from "./routes/openapi";

export function createApp() {
  const app = new Hono<HonoEnv>();

  app.use("*", logger());
  app.use("*", requestId);
  app.use("*", securityHeaders);
  app.use(
    "*",
    cors({
      origin: (origin, c) => {
        const allowed = (c.env.CORS_ORIGIN ?? "").split(",").map((s: string) => s.trim());
        if (origin && (allowed.includes(origin) || allowed.includes("*"))) {
          return origin;
        }
        return null;
      },
      allowMethods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["X-Request-Id"],
      maxAge: 86400,
    })
  );

  app.use("/api/*", authMiddleware);
  app.use("/api/*", rateLimit);
  app.use("/api/*", apiLogger);

  app.route("/api", healthRoutes);
  app.route("/api/inboxes", inboxRoutes);
  app.route("/api/messages", messageRoutes);
  app.route("/api/domains", domainRoutes);
  app.route("/api/push", pushRoutes);
  app.route("/api/notifications", notificationRoutes);
  app.route("/api/keys", apiKeyRoutes);
  app.route("/api/webhooks", webhookRoutes);
  app.route("/api/logs", apiLogRoutes);
  app.route("/api", openapiRoutes);

  app.notFound(notFoundHandler);
  app.onError(errorHandler);

  return app;
}
