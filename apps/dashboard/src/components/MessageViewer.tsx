import { useState, useEffect } from "react";
import { Trash2, Paperclip, Download, ArrowLeft, MessageSquare } from "lucide-react";
import type { Message, Attachment } from "@inbix/shared";
import { api } from "../lib/api";
import { formatRelativeTime, formatBytes, cn } from "../lib/utils";
import { CopyButton } from "./CopyButton";
import { EmptyState } from "./EmptyState";

interface MessageViewerProps {
  messageId: string | null;
  inboxId: string;
  onDelete: () => void;
  onBack: () => void;
}

export function MessageViewer({ messageId, onDelete, onBack }: MessageViewerProps) {
  const [message, setMessage] = useState<Message | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"html" | "text">("html");

  useEffect(() => {
    if (!messageId) {
      setMessage(null);
      return;
    }

    setLoading(true);
    setView("html");

    api.getMessage(messageId)
      .then((data) => {
        setMessage(data);
        if (data.hasAttachments) {
          api.listAttachments(messageId).then(setAttachments).catch(() => {});
        } else {
          setAttachments([]);
        }
      })
      .catch(() => setMessage(null))
      .finally(() => setLoading(false));
  }, [messageId]);

  if (!messageId) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Select a message"
        description="Choose a message from the list to read its content."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  if (!message) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Back to messages"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (confirm("Delete this message?")) {
                  api.deleteMessage(message.id).then(onDelete);
                }
              }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
              aria-label="Delete message"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h1 className="mt-3 text-lg font-semibold tracking-tight">
          {message.subject ?? "(no subject)"}
        </h1>

        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
            {(message.fromName ?? message.fromAddress).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {message.fromName ?? message.fromAddress}
              </span>
              <CopyButton text={message.fromAddress} variant="compact" />
            </div>
            <p className="text-xs text-muted-foreground">
              {message.fromAddress} <span className="text-border">/</span> {formatRelativeTime(message.receivedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border px-4 py-2 md:px-6">
        <button
          onClick={() => setView("html")}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            view === "html" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          HTML
        </button>
        <button
          onClick={() => setView("text")}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            view === "text" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Plain Text
        </button>
      </div>

      {attachments.length > 0 && (
        <div className="border-b border-border px-4 py-3 md:px-6">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            {attachments.length} Attachment{attachments.length > 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => (
              <a
                key={att.id}
                href={api.getAttachmentUrl(message.id, att.id)}
                download={att.filename}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent active:scale-[0.98]"
              >
                <Download className="h-3 w-3" />
                <span className="max-w-32 truncate">{att.filename}</span>
                <span className="text-muted-foreground">{formatBytes(att.size)}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {view === "html" ? (
          <iframe
            src={api.getMessageHtmlUrl(message.id)}
            title="Email content"
            sandbox="allow-same-origin"
            className="h-full w-full rounded-lg border border-border bg-white"
          />
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-muted-foreground">
            {message.textContent ?? "No plain text content available."}
          </pre>
        )}
      </div>
    </div>
  );
}
