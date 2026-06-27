import { useState, useEffect } from "react";
import { Trash2, Paperclip, Download, ArrowLeft, Mail } from "lucide-react";
import type { Message, Attachment } from "@inbix/shared";
import { api } from "../lib/api";
import { formatRelativeTime, formatBytes } from "../lib/utils";
import { CopyButton } from "./CopyButton";

interface MessageViewerProps {
  messageId: string | null;
  inboxId: string;
  onDelete: () => void;
  onBack: () => void;
}

export function MessageViewer({ messageId, inboxId, onDelete, onBack }: MessageViewerProps) {
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
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="rounded-full bg-muted p-6">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Select a message to read</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Messages will appear here when received
          </p>
        </div>
      </div>
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
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
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
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h1 className="mt-2 text-lg font-semibold">
          {message.subject ?? "(no subject)"}
        </h1>

        <div className="mt-2 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium">
            {(message.fromName ?? message.fromAddress).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {message.fromName ?? message.fromAddress}
              </span>
              <CopyButton text={message.fromAddress} />
            </div>
            <p className="text-xs text-muted-foreground">
              {message.fromAddress} · {formatRelativeTime(message.receivedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border px-4 py-2">
        <button
          onClick={() => setView("html")}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            view === "html" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          HTML
        </button>
        <button
          onClick={() => setView("text")}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            view === "text" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Plain Text
        </button>
      </div>

      {attachments.length > 0 && (
        <div className="border-b border-border px-4 py-3">
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
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"
              >
                <Download className="h-3 w-3" />
                <span className="max-w-32 truncate">{att.filename}</span>
                <span className="text-muted-foreground">{formatBytes(att.size)}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {view === "html" ? (
          <iframe
            src={api.getMessageHtmlUrl(message.id)}
            title="Email HTML"
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
