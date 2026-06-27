import { json } from "@inbix/shared";

export function errorHandler(err: Error): Response {
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

export function notFoundHandler(): Response {
  return json({ success: false, error: "Not Found" }, 404);
}
