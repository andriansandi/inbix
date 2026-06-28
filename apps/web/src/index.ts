import { createApp } from "./app";
import { handleEmail } from "./email/handler";
import { cleanupExpiredData } from "./lib/cleanup";
import type { HonoEnv, EmailEnv } from "./lib/env";

const app = createApp();

export default {
  async fetch(request: Request, env: HonoEnv["Bindings"], ctx: ExecutionContext): Promise<Response> {
    ctx.waitUntil(cleanupExpiredData(env).catch(() => {}));
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (
      response.status === 404 &&
      request.method === "GET" &&
      !url.pathname.startsWith("/api/") &&
      (request.headers.get("accept") ?? "").includes("text/html")
    ) {
      const assetResponse = await env.ASSETS.fetch(new Request(new URL("/index.html", url)));
      if (env.CLERK_PUBLISHABLE_KEY) {
        const html = await assetResponse.text();
        const injected = html.replace(
          "<head>",
          `<head><script>window.__CLERK_PUBLISHABLE_KEY__=${JSON.stringify(env.CLERK_PUBLISHABLE_KEY)};</script>`
        );
        return new Response(injected, {
          status: assetResponse.status,
          statusText: assetResponse.statusText,
          headers: assetResponse.headers,
        });
      }
      return assetResponse;
    }
    return response;
  },

  async email(message: ForwardableEmailMessage, env: EmailEnv["Bindings"], ctx: ExecutionContext): Promise<void> {
    await handleEmail(message, env, ctx);
  },
} satisfies ExportedHandler<HonoEnv["Bindings"]>;
