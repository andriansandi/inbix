import { Mail, Paperclip, RefreshCw, ArrowLeft } from "lucide-react";
import type { MessageSummary } from "@inbix/shared";
import { formatRelativeTime, getInitials, cn } from "../lib/utils";

interface MessageListProps {
  messages: MessageSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
  onBack: () => void;
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  onRefresh,
  loading,
  onBack,
}: MessageListProps) {
  return (
    <div className="flex h-full flex-col border-r border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-semibold">Messages</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {messages.length}
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-full bg-muted p-4">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Waiting for incoming emails...
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => onSelect(msg.id)}
                className={cn(
                  "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent/50",
                  selectedId === msg.id && "bg-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                    {getInitials(msg.fromAddress)}
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className={cn("truncate text-sm", !msg.isRead && "font-semibold")}>
                      {msg.fromName ?? msg.fromAddress}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(msg.receivedAt)}
                    </span>
                  </div>
                </div>
                <p className={cn("truncate text-sm text-muted-foreground", !msg.isRead && "text-foreground")}>
                  {msg.subject ?? "(no subject)"}
                </p>
                {msg.hasAttachments && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    Attachment
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
