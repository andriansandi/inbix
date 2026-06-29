import { createApp } from "./app";
import { handleEmail } from "./email/handler";
import { cleanupExpiredData } from "./lib/cleanup";
import type { HonoEnv, EmailEnv } from "./lib/env";

export { RealtimeRoom } from "./durableObjects/RealtimeRoom";

const app = createApp();

async function withClerkKey(response: Response, key: string): Promise<Response> {
  const html = await response.text();
  const injected = html.replace(
    "<head>",
    `<head><script>window.__CLERK_PUBLISHABLE_KEY__=${JSON.stringify(key)};</script>`
  );
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: HonoEnv["Bindings"], ctx: ExecutionContext): Promise<Response> {
    ctx.waitUntil(cleanupExpiredData(env).catch(() => {}));
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return app.fetch(request, env, ctx);
    }

    const assetResponse = await env.ASSETS.fetch(request);

    // Asset found. If it's an HTML document, inject the Clerk publishable key
    // (covers "/" and any path Assets serves as index.html with status 200).
    if (assetResponse.status !== 404) {
      if (
        request.method === "GET" &&
        env.CLERK_PUBLISHABLE_KEY &&
        (assetResponse.headers.get("content-type") ?? "").includes("text/html")
      ) {
        return withClerkKey(assetResponse, env.CLERK_PUBLISHABLE_KEY);
      }
      return assetResponse;
    }

    // SPA route (no matching static asset): serve index.html with the key.
    if (
      request.method === "GET" &&
      (request.headers.get("accept") ?? "").includes("text/html")
    ) {
      const htmlResponse = await env.ASSETS.fetch(
        new Request(new URL("/index.html", url))
      );
      if (env.CLERK_PUBLISHABLE_KEY) {
        return withClerkKey(htmlResponse, env.CLERK_PUBLISHABLE_KEY);
      }
      return htmlResponse;
    }

    return new Response("Not Found", { status: 404 });
  },

  async email(message: ForwardableEmailMessage, env: EmailEnv["Bindings"], ctx: ExecutionContext): Promise<void> {
    await handleEmail(message, env, ctx);
  },
} satisfies ExportedHandler<HonoEnv["Bindings"]>;
