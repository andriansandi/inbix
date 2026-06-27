import { useState, useEffect, useCallback, useRef } from "react";
import type { Inbox, MessageSummary } from "@inbix/shared";
import { api } from "../lib/api";

export function useInbox(inboxId: string | null) {
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchInbox = useCallback(async () => {
    if (!inboxId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInbox(inboxId);
      setInbox(data);
      const msgData = await api.listMessages(inboxId);
      setMessages(msgData.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [inboxId]);

  const refresh = useCallback(async () => {
    if (!inboxId) return;
    try {
      const msgData = await api.listMessages(inboxId);
      setMessages(msgData.data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [inboxId]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  useEffect(() => {
    if (!inboxId) return;

    const eventSource = new EventSource(`/api/inboxes/${inboxId}/events`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data) as MessageSummary;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [msg, ...prev];
        });
      } catch {
        // ignore
      }
    });

    eventSource.addEventListener("inbox_expired", () => {
      setInbox((prev) => (prev ? { ...prev, expiresAt: 0 } : null));
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [inboxId]);

  return { inbox, messages, loading, error, refresh, fetchInbox };
}
