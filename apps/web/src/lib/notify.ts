import type { EmailEnv } from "./env";
import {
  createDatabase,
  listAllPushSubscriptionsByInboxUserId,
  getNotificationPreferences,
  createNotificationLog,
} from "@inbix/database";
import { sendWebPush } from "./webPush";

export async function notifyNewMessage(
  env: EmailEnv["Bindings"],
  inbox: { id: string; emailAddress: string; userId: string | null },
  message: { id: string; fromAddress: string; fromName: string | null; subject: string | null }
): Promise<void> {
  if (!inbox.userId) return;

  const db = createDatabase(env.DB);

  const prefs = await getNotificationPreferences(db, inbox.userId);
  if (prefs) {
    if (!prefs.pushEnabled || !prefs.notifyOnNewMessage) return;

    if (prefs.quietHoursStart !== null && prefs.quietHoursEnd !== null) {
      const hour = new Date().getUTCHours();
      const start = prefs.quietHoursStart;
      const end = prefs.quietHoursEnd;
      const inQuietHours =
        start <= end
          ? hour >= start && hour < end
          : hour >= start || hour < end;
      if (inQuietHours) return;
    }
  }

  const subscriptions = await listAllPushSubscriptionsByInboxUserId(db, inbox.userId);
  if (subscriptions.length === 0) return;

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;

  const vapid = {
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
    subject: env.VAPID_SUBJECT,
  };

  const fromName = message.fromName || message.fromAddress;
  const title = message.subject ? `${fromName}` : "New message";
  const body = message.subject || `New message from ${fromName}`;

  const payload = {
    title,
    body,
    url: `/dashboard?inbox=${inbox.id}`,
    timestamp: Date.now(),
  };

  await Promise.all(
    subscriptions.map(async (sub) => {
      const result = await sendWebPush({
        subscription: {
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
        payload,
        vapid,
      });

      await createNotificationLog(db, {
        userId: inbox.userId!,
        subscriptionId: sub.id,
        messageId: message.id,
        status: result.ok ? "sent" : "failed",
        error: result.ok ? null : result.error ?? `HTTP ${result.status}`,
      });
    })
  );
}
