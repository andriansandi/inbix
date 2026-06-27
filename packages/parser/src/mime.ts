import PostalMime from "postal-mime";

export interface ParsedAttachment {
  filename: string;
  contentType: string;
  size: number;
  contentId: string | null;
  content: Uint8Array;
}

export interface ParsedEmail {
  fromAddress: string;
  fromName: string | null;
  toAddress: string;
  subject: string | null;
  textContent: string | null;
  htmlContent: string | null;
  rawHeaders: string | null;
  size: number;
  hasAttachments: boolean;
  attachments: ParsedAttachment[];
}

export async function parseEmail(rawEmail: ArrayBuffer | string): Promise<ParsedEmail> {
  const buffer = typeof rawEmail === "string" ? new TextEncoder().encode(rawEmail) : rawEmail;
  const parsed = await PostalMime.parse(buffer);

  const fromAddress = parsed.from?.address ?? "unknown@unknown";
  const fromName = parsed.from?.name ?? null;
  const toAddress = parsed.to?.[0]?.address ?? "";
  const subject = parsed.subject ?? null;
  const textContent = parsed.text ?? null;
  const htmlContent = parsed.html ?? null;
  const rawHeaders = parsed.headers
    ? parsed.headers.map((h) => `${h.key}: ${h.value}`).join("\r\n")
    : null;

  const attachments: ParsedAttachment[] = (parsed.attachments ?? []).map((att) => ({
    filename: att.filename || "unnamed",
    contentType: att.mimeType || "application/octet-stream",
    size: att.content?.byteLength ?? 0,
    contentId: att.contentId ?? null,
    content: new Uint8Array(att.content ?? new ArrayBuffer(0)),
  }));

  return {
    fromAddress,
    fromName,
    toAddress,
    subject,
    textContent,
    htmlContent,
    rawHeaders,
    size: buffer.byteLength,
    hasAttachments: attachments.length > 0,
    attachments,
  };
}
