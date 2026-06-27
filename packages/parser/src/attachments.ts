import { MAX_ATTACHMENT_SIZE_BYTES, MAX_ATTACHMENTS_PER_MESSAGE } from "@inbix/shared";
import type { ParsedAttachment } from "./mime";
import { sanitizeFilename } from "@inbix/shared";

export interface ValidatedAttachment {
  filename: string;
  contentType: string;
  size: number;
  contentId: string | null;
  content: Uint8Array;
  r2Key: string;
  error: string | null;
}

const BLOCKED_CONTENT_TYPES = new Set([
  "application/x-msdos-program",
  "application/x-msdownload",
  "application/x-executable",
  "application/x-batch",
]);

export function validateAttachment(att: ParsedAttachment, index: number): ValidatedAttachment {
  const r2Key = `attachments/${Date.now()}/${index}/${sanitizeFilename(att.filename)}`;

  if (att.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return {
      ...att,
      r2Key,
      error: `Attachment exceeds max size of ${MAX_ATTACHMENT_SIZE_BYTES} bytes`,
    };
  }

  if (BLOCKED_CONTENT_TYPES.has(att.contentType.toLowerCase())) {
    return {
      ...att,
      r2Key,
      error: `Blocked content type: ${att.contentType}`,
    };
  }

  return {
    ...att,
    r2Key,
    error: null,
  };
}

export function validateAttachments(attachments: ParsedAttachment[]): ValidatedAttachment[] {
  if (attachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
    return attachments.slice(0, MAX_ATTACHMENTS_PER_MESSAGE).map((att) => ({
      ...att,
      r2Key: "",
      error: "Too many attachments",
    }));
  }

  return attachments.map((att, i) => validateAttachment(att, i));
}

export function isImageContentType(contentType: string): boolean {
  return contentType.startsWith("image/");
}

export function isTextContentType(contentType: string): boolean {
  return (
    contentType.startsWith("text/") ||
    contentType === "application/json" ||
    contentType === "application/xml"
  );
}
