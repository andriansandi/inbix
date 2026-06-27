import { createApp } from "./app";
import { handleEmail } from "./email/handler";
import { cleanupExpiredData } from "./lib/cleanup";
import type { HonoEnv, EmailEnv } from "@inbix/shared";

const app = createApp();

export default {
  async fetch(request: Request, env: HonoEnv["Bindings"], ctx: ExecutionContext): Promise<Response> {
    ctx.waitUntil(cleanupExpiredData(env).catch(() => {}));
    return app.fetch(request, env, ctx);
  },

  async email(message: ForwardableEmailMessage, env: EmailEnv["Bindings"], ctx: ExecutionContext): Promise<void> {
    await handleEmail(message, env, ctx);
  },
} satisfies ExportedHandler<HonoEnv["Bindings"]>;
