import type { HonoEnv } from "@inbix/shared";
import {
  createDatabase,
  getExpiredInboxIds,
  getMessageIdsByInbox,
  getAttachmentIdsByMessage,
  hardDeleteInbox,
  deleteMessage,
} from "@inbix/database";

const CLEANUP_BATCH_SIZE = 50;

export async function cleanupExpiredData(env: HonoEnv["Bindings"]): Promise<void> {
  const db = createDatabase(env.DB);
  const now = Date.now();

  const expiredIds = await getExpiredInboxIds(db, now);

  if (expiredIds.length === 0) return;

  const batch = expiredIds.slice(0, CLEANUP_BATCH_SIZE);

  for (const inboxId of batch) {
    try {
      const messageIds = await getMessageIdsByInbox(db, inboxId);

      for (const msgId of messageIds) {
        const attachments = await getAttachmentIdsByMessage(db, msgId);
        for (const att of attachments) {
          await env.R2_BUCKET.delete(att.r2Key);
        }
        await deleteMessage(db, msgId);
      }

      await hardDeleteInbox(db, inboxId);
      console.info(`[cleanup] Deleted expired inbox: ${inboxId}`);
    } catch (err) {
      console.error(`[cleanup] Error deleting inbox ${inboxId}:`, err);
    }
  }
}
