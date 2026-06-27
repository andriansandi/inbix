import type { Context } from "hono";
import type { HonoEnv } from "@inbix/shared";
import { json } from "@inbix/shared";

type AppContext = Context<HonoEnv>;

export function errorHandler(err: Error, c: AppContext): Response {
  console.error(`[error] ${err.message}`, err.stack);
  const status = "status" in err ? (err as { status: number }).status : 500;
  return json(
    {
      success: false,
      error: status === 500 ? "Internal Server Error" : err.message,
    },
    status
  );
}

export function notFoundHandler(c: AppContext): Response {
  return json({ success: false, error: "Not Found" }, 404);
}
