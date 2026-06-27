import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, RefreshCw, ArrowLeft, Inbox as InboxIcon, MessageSquare } from "lucide-react";
import type { Inbox } from "@inbix/shared";
import { api } from "../lib/api";
import { getStoredInboxes, addStoredInbox, removeStoredInbox } from "../lib/inboxStorage";
import { useInbox } from "../hooks/useInbox";
import { CopyButton } from "../components/CopyButton";
import { ExpiryTimer } from "../components/ExpiryTimer";
import { MessageList } from "../components/MessageList";
import { MessageViewer } from "../components/MessageViewer";
import { EmptyState } from "../components/EmptyState";
import { DashboardNav } from "../components/Navbar";
import { formatRelativeTime, cn } from "../lib/utils";

export function DashboardPage() {
  const { inboxId } = useParams<{ inboxId?: string }>();
  const navigate = useNavigate();

  const [inboxList, setInboxList] = useState<Inbox[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"inboxes" | "messages" | "viewer">("inboxes");

  const currentInboxId = inboxId ?? null;
  const { inbox, messages, loading, refresh } = useInbox(currentInboxId);

  const fetchInboxList = useCallback(async () => {
    setListLoading(true);
    try {
      setInboxList(getStoredInboxes());
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInboxList();
  }, [fetchInboxList]);

  useEffect(() => {
    if (inbox) {
      setInboxList((prev) => {
        if (prev.some((i) => i.id === inbox.id)) return prev;
        return addStoredInbox(inbox);
      });
    }
  }, [inbox]);

  const handleCreateInbox = async () => {
    try {
      const newInbox = await api.createInbox();
      setInboxList(addStoredInbox(newInbox));
      navigate(`/dashboard/${newInbox.id}`);
      setMobileView("messages");
    } catch (err) {
      alert(`Failed to create inbox: ${(err as Error).message}`);
    }
  };

  const handleDeleteInbox = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this inbox and all its messages?")) return;
    try {
      await api.deleteInbox(id);
      setInboxList(removeStoredInbox(id));
      if (id === currentInboxId) {
        navigate("/dashboard");
        setMobileView("inboxes");
      }
    } catch (err) {
      alert(`Failed to delete: ${(err as Error).message}`);
    }
  };

  const handleSelectInbox = (id: string) => {
    navigate(`/dashboard/${id}`);
    setSelectedMessageId(null);
    setMobileView("messages");
  };

  const handleSelectMessage = (id: string) => {
    setSelectedMessageId(id);
    setMobileView("viewer");
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <DashboardNav />

      <div className="flex flex-1 overflow-hidden">
        {/* Inbox list */}
        <aside
          className={cn(
            "w-72 shrink-0 border-r border-border",
            mobileView !== "inboxes" && "hidden lg:block"
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Inboxes</h2>
            <button
              onClick={fetchInboxList}
              disabled={listLoading}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              aria-label="Refresh inbox list"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", listLoading && "animate-spin")} />
            </button>
          </div>

          <div className="p-3">
            <button
              onClick={handleCreateInbox}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New Inbox
            </button>
          </div>

          <div className="overflow-y-auto" style={{ height: "calc(100dvh - 160px)" }}>
            {inboxList.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No inboxes yet</p>
                <button
                  onClick={handleCreateInbox}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  Create one
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {inboxList.map((box) => (
                  <button
                    key={box.id}
                    onClick={() => handleSelectInbox(box.id)}
                    className={cn(
                      "group flex w-full flex-col gap-1.5 px-4 py-3 text-left transition-colors hover:bg-accent/50",
                      currentInboxId === box.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-xs font-medium">{box.emailAddress}</span>
                      <button
                        onClick={(e) => handleDeleteInbox(box.id, e)}
                        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        aria-label="Delete inbox"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(box.createdAt)}
                      </span>
                      <ExpiryTimer expiresAt={box.expiresAt} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Message list */}
        <div
          className={cn(
            "w-80 shrink-0",
            mobileView !== "messages" && "hidden lg:block"
          )}
        >
          {currentInboxId && inbox ? (
            <>
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMobileView("inboxes")}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
                    aria-label="Back to inboxes"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-mono text-sm font-semibold">{inbox.emailAddress}</span>
                      <CopyButton text={inbox.emailAddress} variant="compact" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ExpiryTimer expiresAt={inbox.expiresAt} />
                </div>
              </div>
              <MessageList
                messages={messages}
                selectedId={selectedMessageId}
                onSelect={handleSelectMessage}
                onRefresh={refresh}
                loading={loading}
                onBack={() => setMobileView("inboxes")}
              />
            </>
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="No inbox selected"
              description="Select an inbox from the list or create a new one to get started."
              action={
                <button
                  onClick={handleCreateInbox}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  New Inbox
                </button>
              }
            />
          )}
        </div>

        {/* Message viewer */}
        <main
          className={cn(
            "flex-1",
            mobileView !== "viewer" && "hidden lg:block"
          )}
        >
          {currentInboxId ? (
            <MessageViewer
              messageId={selectedMessageId}
              inboxId={currentInboxId}
              onDelete={() => {
                setSelectedMessageId(null);
                refresh();
                setMobileView("messages");
              }}
              onBack={() => setMobileView("messages")}
            />
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No message selected"
              description="Select an inbox and choose a message to read its content."
            />
          )}
        </main>
      </div>
    </div>
  );
}
