import { useState, useEffect, useCallback } from "react";
import type { Inbox, MessageSummary } from "@inbix/shared";
import { api } from "../lib/api";

export function useInbox(inboxId: string | null) {
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    let ws: WebSocket | null = null;
    let eventSource: EventSource | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let sseStarted = false;
    let cleanedUp = false;

    const handleMessage = (data: MessageSummary) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [data, ...prev];
      });
    };

    const handleExpired = () => {
      setInbox((prev) => (prev ? { ...prev, expiresAt: 0 } : null));
    };

    const startSSE = () => {
      if (sseStarted || cleanedUp) return;
      sseStarted = true;
      eventSource = new EventSource(`/api/inboxes/${inboxId}/events`);
      eventSource.addEventListener("message", (event) => {
        try {
          handleMessage(JSON.parse(event.data) as MessageSummary);
        } catch {
          // ignore
        }
      });
      eventSource.addEventListener("inbox_expired", () => {
        handleExpired();
      });
      eventSource.onerror = () => {
        eventSource?.close();
      };
    };

    const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/inboxes/${inboxId}/ws`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      pingInterval = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "message") {
          handleMessage(msg.data as MessageSummary);
        } else if (msg.type === "inbox_expired") {
          handleExpired();
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      if (pingInterval) clearInterval(pingInterval);
      startSSE();
    };

    return () => {
      cleanedUp = true;
      if (pingInterval) clearInterval(pingInterval);
      ws?.close();
      eventSource?.close();
    };
  }, [inboxId]);

  return { inbox, messages, loading, error, refresh, fetchInbox };
}
