import { createApp } from "./app";
import { handleEmail } from "./email/handler";
import { cleanupExpiredData } from "./lib/cleanup";
import type { HonoEnv, EmailEnv } from "./lib/env";

const app = createApp();

export default {
  async fetch(request: Request, env: HonoEnv["Bindings"], ctx: ExecutionContext): Promise<Response> {
    ctx.waitUntil(cleanupExpiredData(env).catch(() => {}));
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return app.fetch(request, env, ctx);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    if (
      request.method === "GET" &&
      (request.headers.get("accept") ?? "").includes("text/html")
    ) {
      const htmlResponse = await env.ASSETS.fetch(
        new Request(new URL("/index.html", url))
      );
      if (env.CLERK_PUBLISHABLE_KEY) {
        const html = await htmlResponse.text();
        const injected = html.replace(
          "<head>",
          `<head><script>window.__CLERK_PUBLISHABLE_KEY__=${JSON.stringify(env.CLERK_PUBLISHABLE_KEY)};</script>`
        );
        return new Response(injected, {
          status: htmlResponse.status,
          statusText: htmlResponse.statusText,
          headers: htmlResponse.headers,
        });
      }
      return htmlResponse;
    }

    return new Response("Not Found", { status: 404 });
  },

  async email(message: ForwardableEmailMessage, env: EmailEnv["Bindings"], ctx: ExecutionContext): Promise<void> {
    await handleEmail(message, env, ctx);
  },
} satisfies ExportedHandler<HonoEnv["Bindings"]>;
