import type { EmailEnv } from "../lib/env";
import { getDomainFromEmail, generateId } from "@inbix/shared";
import { parseEmail, validateAttachments } from "@inbix/parser";
import {
  createDatabase,
  getInboxByEmail,
  createMessage,
  createAttachment,
} from "@inbix/database";
import { sanitizeFilename } from "@inbix/shared";
import { notifyNewMessage } from "../lib/notify";
import { triggerWebhooks } from "../lib/webhook";

export async function handleEmail(
  message: ForwardableEmailMessage,
  env: EmailEnv["Bindings"],
  ctx: ExecutionContext
): Promise<void> {
  const toAddress = message.to;
  const domain = getDomainFromEmail(toAddress);

  if (!domain) {
    console.warn(`[email] Invalid to address: ${toAddress}`);
    message.setReject("Invalid recipient");
    return;
  }

  const db = createDatabase(env.DB);

  const inbox = await getInboxByEmail(db, toAddress);

  if (!inbox || !inbox.isActive || inbox.expiresAt < Date.now()) {
    console.info(`[email] No active inbox for: ${toAddress}`);
    message.setReject("Inbox not found or expired");
    return;
  }

  const rawEmail = await new Response(message.raw).arrayBuffer();
  const parsed = await parseEmail(rawEmail);

  const msgRecord = await createMessage(db, {
    inboxId: inbox.id,
    fromAddress: parsed.fromAddress,
    fromName: parsed.fromName,
    toAddress: parsed.toAddress || toAddress,
    subject: parsed.subject,
    textContent: parsed.textContent,
    htmlContent: parsed.htmlContent,
    rawHeaders: parsed.rawHeaders,
    size: parsed.size,
    hasAttachments: parsed.attachments.length > 0,
  });

  if (parsed.attachments.length > 0) {
    const validated = validateAttachments(parsed.attachments);

    for (const att of validated) {
      if (att.error) {
        console.warn(`[email] Skipping attachment: ${att.error}`);
        continue;
      }

      const r2Key = `attachments/${msgRecord.id}/${generateId(8)}/${sanitizeFilename(att.filename)}`;

      await env.R2_BUCKET.put(r2Key, att.content, {
        httpMetadata: {
          contentType: att.contentType,
        },
      });

      await createAttachment(db, {
        messageId: msgRecord.id,
        filename: att.filename,
        contentType: att.contentType,
        size: att.size,
        contentId: att.contentId,
        r2Key,
      });
    }
  }

  console.info(
    `[email] Stored message ${msgRecord.id} for inbox ${inbox.id} (${inbox.emailAddress})`
  );

  ctx.waitUntil(
    notifyNewMessage(
      env,
      { id: inbox.id, emailAddress: inbox.emailAddress, userId: inbox.userId ?? null },
      {
        id: msgRecord.id,
        fromAddress: msgRecord.fromAddress,
        fromName: msgRecord.fromName,
        subject: msgRecord.subject,
      }
    ).catch((err) => {
      console.warn(`[email] Push notification failed:`, err);
    })
  );

  ctx.waitUntil(
    (async () => {
      const roomId = env.REALTIME_ROOM.idFromName(inbox.id);
      const room = env.REALTIME_ROOM.get(roomId);
      await room.fetch(
        new Request("https://realtime/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "message",
            data: {
              id: msgRecord.id,
              inboxId: inbox.id,
              fromAddress: msgRecord.fromAddress,
              fromName: msgRecord.fromName,
              subject: msgRecord.subject,
              hasAttachments: parsed.attachments.length > 0,
              size: msgRecord.size,
              receivedAt: msgRecord.receivedAt,
              isRead: false,
            },
          }),
        })
      );
    })().catch((err) => {
      console.warn(`[email] WebSocket broadcast failed:`, err);
    })
  );

  if (inbox.userId) {
    ctx.waitUntil(
      triggerWebhooks(env, inbox.userId, "message.received", {
        id: msgRecord.id,
        inboxId: inbox.id,
        fromAddress: msgRecord.fromAddress,
        fromName: msgRecord.fromName,
        subject: msgRecord.subject,
        hasAttachments: parsed.attachments.length > 0,
        receivedAt: msgRecord.receivedAt,
      }).catch((err) => {
        console.warn(`[email] Webhook delivery failed:`, err);
      })
    );
  }
}
