const ALLOWED_TAGS = new Set([
  "a", "b", "br", "div", "em", "h1", "h2", "h3", "h4", "h5", "h6",
  "hr", "i", "img", "li", "ol", "p", "pre", "span", "strong", "table",
  "tbody", "td", "th", "thead", "tr", "u", "ul", "blockquote", "code",
  "del", "font", "sub", "sup", "dd", "dl", "dt", "center", "small",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "name"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  font: new Set(["color", "size", "face"]),
  span: new Set(["style"]),
  div: new Set(["style"]),
  p: new Set(["style"]),
  td: new Set(["style", "align", "colspan", "rowspan"]),
  th: new Set(["style", "align", "colspan", "rowspan"]),
  table: new Set(["style", "border", "cellpadding", "cellspacing", "width"]),
};

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "cid:", "data:"]);

const DANGEROUS_CSS_PATTERNS = [
  /expression\s*\(/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /url\s*\(\s*['"]?\s*javascript:/gi,
  /position\s*:\s*fixed/gi,
  /position\s*:\s*absolute/gi,
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function sanitizeAttrValue(tag: string, attr: string, value: string): string {
  if (attr === "href" || attr === "src") {
    try {
      const url = new URL(value, "http://placeholder.invalid");
      if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
        return "";
      }
      if (url.protocol === "data:" && tag === "img") {
        if (!/^data:image\//i.test(value)) return "";
        return value;
      }
      return value;
    } catch {
      return "";
    }
  }

  if (attr === "style") {
    let sanitized = value;
    for (const pattern of DANGEROUS_CSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, "");
    }
    return sanitized;
  }

  return value;
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  const tokenizer = new HTMLTokenStream(html);
  let result = "";
  let depth = 0;
  const openTags: string[] = [];

  for (const token of tokenizer) {
    if (token.type === "text") {
      result += escapeHtml(token.value);
    } else if (token.type === "comment" || token.type === "doctype") {
      continue;
    } else if (token.type === "open") {
      const tag = token.tag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) continue;

      if (tag === "script" || tag === "style" || tag === "iframe" || tag === "object" || tag === "embed") {
        continue;
      }

      const allowedForTag = ALLOWED_ATTRS[tag] ?? new Set<string>();
      let attrs = "";

      for (const [name, value] of token.attrs) {
        const lowerName = name.toLowerCase();
        if (!allowedForTag.has(lowerName)) continue;
        if (lowerName.startsWith("on")) continue;

        const sanitizedValue = sanitizeAttrValue(tag, lowerName, value);
        if (sanitizedValue) {
          attrs += ` ${lowerName}="${escapeHtml(sanitizedValue)}"`;
        }
      }

      if (VOID_TAGS.has(tag)) {
        result += `<${tag}${attrs} />`;
      } else {
        result += `<${tag}${attrs}>`;
        openTags.push(tag);
        depth++;
      }
    } else if (token.type === "close") {
      const tag = token.tag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) continue;
      if (VOID_TAGS.has(tag)) continue;

      const idx = openTags.lastIndexOf(tag);
      if (idx === -1) continue;

      for (let i = openTags.length - 1; i >= idx; i--) {
        result += `</${openTags[i]}>`;
        depth--;
      }
      openTags.length = idx;
    }
  }

  while (openTags.length > 0) {
    result += `</${openTags.pop()!}>`;
  }

  return result;
}

const VOID_TAGS = new Set(["br", "hr", "img"]);

interface Token {
  type: "text" | "open" | "close" | "comment" | "doctype";
  value: string;
  tag?: string;
  attrs?: [string, string][];
}

class HTMLTokenStream implements Iterable<Token> {
  private html: string;
  private pos = 0;

  constructor(html: string) {
    this.html = html;
  }

  [Symbol.iterator](): Iterator<Token> {
    return {
      next: () => {
        if (this.pos >= this.html.length) {
          return { done: true, value: undefined };
        }

        if (this.html[this.pos] === "<") {
          if (this.html.startsWith("<!--", this.pos)) {
            const end = this.html.indexOf("-->", this.pos + 4);
            const closePos = end === -1 ? this.html.length : end + 3;
            this.pos = closePos;
            return { done: false, value: { type: "comment", value: "" } };
          }

          if (/^<!doctype/i.test(this.html.slice(this.pos))) {
            const end = this.html.indexOf(">", this.pos);
            this.pos = end === -1 ? this.html.length : end + 1;
            return { done: false, value: { type: "doctype", value: "" } };
          }

          const end = this.html.indexOf(">", this.pos);
          if (end === -1) {
            const text = this.html.slice(this.pos);
            this.pos = this.html.length;
            return { done: false, value: { type: "text", value: text } };
          }

          const tagContent = this.html.slice(this.pos + 1, end).trim();
          this.pos = end + 1;

          if (tagContent.startsWith("/")) {
            const tag = tagContent.slice(1).split(/\s/)[0] || "";
            return { done: false, value: { type: "close", value: "", tag } };
          }

          const [tag, ...attrParts] = tagContent.split(/\s+/);
          const attrs = this.parseAttrs(attrParts.join(" "));

          return {
            done: false,
            value: { type: "open", value: "", tag: tag || "", attrs },
          };
        }

        const nextLt = this.html.indexOf("<", this.pos);
        const textEnd = nextLt === -1 ? this.html.length : nextLt;
        const text = this.html.slice(this.pos, textEnd);
        this.pos = textEnd;

        return { done: false, value: { type: "text", value: text } };
      },
    };
  }

  private parseAttrs(str: string): [string, string][] {
    const attrs: [string, string][] = [];
    const regex = /(\w[\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
      const name = match[1];
      const value = match[2] ?? match[3] ?? match[4] ?? "";
      attrs.push([name, value]);
    }

    return attrs;
  }
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
