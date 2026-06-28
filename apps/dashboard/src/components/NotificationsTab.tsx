import { useState, useEffect } from "react";
import { Bell, BellOff, Send, Loader2 } from "lucide-react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { api } from "../lib/api";
import type { NotificationPreferences } from "@inbix/shared";
import { cn } from "../lib/utils";
import { formatRelativeTime } from "../lib/utils";

export function NotificationsTab() {
  const {
    isSupported,
    permission,
    isSubscribed,
    subscriptions,
    loading,
    subscribe,
    unsubscribe,
    sendTest,
  } = usePushNotifications();

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    api.getNotificationPreferences().then(setPrefs).catch(() => {});
  }, []);

  const handleSubscribe = async () => {
    const ok = await subscribe();
    if (ok) {
      const defaultPrefs: NotificationPreferences = {
        pushEnabled: true,
        quietHoursStart: null,
        quietHoursEnd: null,
        notifyOnNewMessage: true,
      };
      setPrefs(defaultPrefs);
      await api.updateNotificationPreferences(defaultPrefs);
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
  };

  const handleTest = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const result = await sendTest();
      setTestResult(
        result.sent > 0
          ? `Sent to ${result.sent} device${result.sent > 1 ? "s" : ""}`
          : "Failed to send notification"
      );
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : "Failed");
    } finally {
      setSendingTest(false);
    }
  };

  const updatePrefs = async (updates: Partial<NotificationPreferences>) => {
    if (!prefs) return;
    const next = { ...prefs, ...updates };
    setPrefs(next);
    setSavingPrefs(true);
    try {
      const updated = await api.updateNotificationPreferences(updates);
      setPrefs(updated);
    } catch {
      setPrefs(prefs);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Push notifications are not supported in this browser.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Try using Chrome, Edge, Firefox, or install Inbix as a PWA.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get push notifications when new emails arrive in your inboxes.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Push Notifications</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {permission === "granted" && isSubscribed
                ? "Enabled — you'll receive notifications on this device."
                : permission === "denied"
                ? "Blocked — enable notifications in your browser settings."
                : "Enable to receive push notifications on this device."}
            </p>
          </div>
          {isSubscribed ? (
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              Disable
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading || permission === "denied"}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              Enable
            </button>
          )}
        </div>
      </div>

      {isSubscribed && (
        <>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Test Notification</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Send a test push to verify everything works.
                </p>
              </div>
              <button
                onClick={handleTest}
                disabled={sendingTest}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98] disabled:opacity-50"
              >
                {sendingTest ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Test
              </button>
            </div>
            {testResult && (
              <p className="mt-3 text-sm text-muted-foreground">{testResult}</p>
            )}
          </div>

          {prefs && (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm font-medium">Preferences</p>

              <label className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Notify on new messages
                </span>
                <button
                  onClick={() => updatePrefs({ notifyOnNewMessage: !prefs.notifyOnNewMessage })}
                  disabled={savingPrefs}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    prefs.notifyOnNewMessage ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                      prefs.notifyOnNewMessage ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>
              </label>

              <label className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Push enabled
                </span>
                <button
                  onClick={() => updatePrefs({ pushEnabled: !prefs.pushEnabled })}
                  disabled={savingPrefs}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    prefs.pushEnabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                      prefs.pushEnabled ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>
              </label>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Quiet hours start</label>
                  <select
                    value={prefs.quietHoursStart ?? ""}
                    onChange={(e) =>
                      updatePrefs({
                        quietHoursStart: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    disabled={savingPrefs}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Off</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, "0")}:00 UTC
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Quiet hours end</label>
                  <select
                    value={prefs.quietHoursEnd ?? ""}
                    onChange={(e) =>
                      updatePrefs({
                        quietHoursEnd: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    disabled={savingPrefs || prefs.quietHoursStart === null}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="">Off</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, "0")}:00 UTC
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {subscriptions.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm font-medium">Active Devices</p>
              <div className="mt-3 space-y-2">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-mono">
                        {sub.endpoint.split("/").pop()?.slice(0, 20)}…
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Added {formatRelativeTime(sub.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
