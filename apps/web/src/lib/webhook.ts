import {
  createDatabase,
  listWebhooksForEvent,
  createWebhookDelivery,
} from "@inbix/database";
import { WEBHOOK_DELIVERY_TIMEOUT_MS } from "@inbix/shared";

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function deliverWebhook(
  db: ReturnType<typeof createDatabase>,
  webhook: { id: string; url: string; secret: string },
  event: string,
  data: unknown
): Promise<void> {
  const body = JSON.stringify({
    event,
    timestamp: Date.now(),
    data,
  });

  const signature = await signPayload(body, webhook.secret);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_DELIVERY_TIMEOUT_MS);

  let status: "delivered" | "failed" = "failed";
  let responseCode: number | null = null;
  let responseBody: string | null = null;

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Inbix-Event": event,
        "X-Inbix-Signature": `sha256=${signature}`,
      },
      body,
      signal: controller.signal,
    });

    responseCode = response.status;
    responseBody = (await response.text()).slice(0, 1000);
    status = response.status >= 200 && response.status < 300 ? "delivered" : "failed";
  } catch (err) {
    responseBody = (err as Error).message;
  } finally {
    clearTimeout(timeout);
  }

  await createWebhookDelivery(db, {
    webhookId: webhook.id,
    event,
    payload: body,
    status,
    responseCode,
    responseBody,
    attempts: 1,
  });
}

export async function triggerWebhooks(
  env: { DB: D1Database },
  userId: string,
  event: string,
  data: unknown
): Promise<void> {
  const db = createDatabase(env.DB);
  const webhooks = await listWebhooksForEvent(db, userId, event);

  if (webhooks.length === 0) return;

  await Promise.all(
    webhooks.map((wh) =>
      deliverWebhook(db, { id: wh.id, url: wh.url, secret: wh.secret }, event, data).catch(
        (err) => {
          console.warn(`[webhook] Delivery failed for ${wh.id}:`, err);
        }
      )
    )
  );
}
