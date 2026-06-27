import type { Inbox } from "@inbix/shared";

const STORAGE_KEY = "inbix:inboxes";

export function getStoredInboxes(): Inbox[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Inbox[];
    const now = Date.now();
    const active = all.filter((i) => i.expiresAt > now);
    if (active.length !== all.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    }
    return active;
  } catch {
    return [];
  }
}

export function addStoredInbox(inbox: Inbox): Inbox[] {
  const current = getStoredInboxes();
  if (current.some((i) => i.id === inbox.id)) return current;
  const updated = [inbox, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeStoredInbox(id: string): Inbox[] {
  const current = getStoredInboxes();
  const updated = current.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
