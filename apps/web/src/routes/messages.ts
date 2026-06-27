import { Hono } from "hono";
import type { HonoEnv } from "@inbix/shared";
import { json, errorResponse } from "@inbix/shared";
import {
  createDatabase,
  getMessage,
  deleteMessage,
  markMessageRead,
  listAttachmentsByMessage,
  getAttachment,
} from "@inbix/database";
import { sanitizeHtml } from "@inbix/parser";

export const messageRoutes = new Hono<HonoEnv>();

messageRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDatabase(c.env.DB);
  const message = await getMessage(db, id);

  if (!message) {
    return errorResponse("Message not found", 404);
  }

  if (!message.isRead) {
    await markMessageRead(db, id);
  }

  return json({ success: true, data: { ...message, isRead: true } });
});

messageRoutes.get("/:id/html", async (c) => {
  const id = c.req.param("id");
  const db = createDatabase(c.env.DB);
  const message = await getMessage(db, id);

  if (!message) {
    return errorResponse("Message not found", 404);
  }

  const html = message.htmlContent
    ? sanitizeHtml(message.htmlContent)
    : `<pre style="white-space: pre-wrap; font-family: monospace; padding: 1rem;">${message.textContent ?? "No content"}</pre>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data: https:;",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

messageRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDatabase(c.env.DB);
  const message = await getMessage(db, id);

  if (!message) {
    return errorResponse("Message not found", 404);
  }

  const attachments = await listAttachmentsByMessage(db, id);
  for (const att of attachments) {
    await c.env.R2_BUCKET.delete(att.r2Key);
  }

  await deleteMessage(db, id);

  return json({ success: true, message: "Message deleted" });
});

messageRoutes.get("/:id/attachments", async (c) => {
  const id = c.req.param("id");
  const db = createDatabase(c.env.DB);
  const message = await getMessage(db, id);

  if (!message) {
    return errorResponse("Message not found", 404);
  }

  const attachments = await listAttachmentsByMessage(db, id);
  return json({ success: true, data: attachments });
});

messageRoutes.get("/:id/attachments/:attachmentId", async (c) => {
  const messageId = c.req.param("id");
  const attachmentId = c.req.param("attachmentId");
  const db = createDatabase(c.env.DB);

  const message = await getMessage(db, messageId);
  if (!message) {
    return errorResponse("Message not found", 404);
  }

  const attachment = await getAttachment(db, attachmentId);
  if (!attachment || attachment.messageId !== messageId) {
    return errorResponse("Attachment not found", 404);
  }

  const object = await c.env.R2_BUCKET.get(attachment.r2Key);
  if (!object) {
    return errorResponse("Attachment content not found", 404);
  }

  const headers = new Headers();
  headers.set("Content-Type", attachment.contentType);
  headers.set("Content-Length", String(attachment.size));
  headers.set(
    "Content-Disposition",
    `attachment; filename="${attachment.filename}"`
  );
  headers.set("Cache-Control", "private, max-age=3600");

  return new Response(object.body, { headers });
});
