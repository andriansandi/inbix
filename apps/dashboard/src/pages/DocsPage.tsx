import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Terminal, Book, Code2, Zap, Copy, Check, ExternalLink, Package, Bot, ArrowRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@inbix/ui";
import { cn } from "../lib/utils";

type Tab = "quickstart" | "sdk" | "api" | "mcp";

const codeExamples: Record<string, string> = {
  install: `npm install @inbix/sdk`,
  quickstart: `import { InbixClient } from "@inbix/sdk";

const client = new InbixClient({
  baseUrl: "https://inbix.xyz",
  apiKey: "inbix_your_api_key",
});

// Create a disposable inbox
const inbox = await client.createInbox();
console.log(inbox.emailAddress); // e.g. abc123@inbix.xyz

// Wait for emails...
const { data: messages } = await client.listMessages(inbox.id);

// Read a message
const message = await client.getMessage(messages[0].id);
console.log(message.subject, message.textContent);

// Clean up
await client.deleteInbox(inbox.id);`,
  auth: `// API Key (for automation/CI)
const client = new InbixClient({
  baseUrl: "https://inbix.xyz",
  apiKey: "inbix_...",
});

// Session token (for dashboard integrations)
const client2 = new InbixClient({
  baseUrl: "https://inbix.xyz",
  token: sessionToken,
});`,
  webhooks: `// Create a webhook for new messages
const webhook = await client.createWebhook(
  "https://your-app.com/webhooks/inbix",
  ["message.received", "inbox.created"]
);

// Verify webhook signature (HMAC-SHA256)
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return signature === `+"`sha256=${expected}`"+`;
}`,
  realtime: `// Subscribe to real-time messages via SSE
const unsubscribe = client.subscribeToInbox(
  inbox.id,
  (message) => {
    console.log("New message:", message.subject);
  },
  (error) => {
    console.error("SSE error:", error);
  }
);

// Later: unsubscribe
unsubscribe();`,
  curl: `# Create an inbox
curl -X POST https://inbix.xyz/api/inboxes \
  -H "Authorization: Bearer inbix_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"domain": "inbix.xyz", "ttlSeconds": 3600}'

# List messages
curl https://inbix.xyz/api/inboxes/{inbox_id}/messages \
  -H "Authorization: Bearer inbix_your_api_key"`,
  mcpInstall: `npm install -g @inbix/mcp-server`,
  mcpClaude: `{
  "mcpServers": {
    "inbix": {
      "command": "npx",
      "args": ["-y", "@inbix/mcp-server"],
      "env": {
        "INBIX_API_KEY": "inbix_your_api_key",
        "INBIX_BASE_URL": "https://inbix.xyz"
      }
    }
  }
}`,
  mcpCursor: `{
  "mcpServers": {
    "inbix": {
      "command": "npx",
      "args": ["-y", "@inbix/mcp-server"],
      "env": {
        "INBIX_API_KEY": "inbix_your_api_key"
      }
    }
  }
}`,
  mcpWindsurf: `{
  "mcpServers": {
    "inbix": {
      "command": "npx",
      "args": ["-y", "@inbix/mcp-server"],
      "env": {
        "INBIX_API_KEY": "inbix_your_api_key"
      }
    }
  }
}`,
  mcpWorkflow: `// Ask your agent to do this:

1. create_inbox
2. use the address for sign-up / OTP
3. wait_for_otp (or wait_for_email)
4. extract_verification_link if needed
5. delete_inbox to clean up`,
};

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      {label && (
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Terminal className="h-3 w-3" />
          {label}
        </div>
      )}
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

const tabs: { id: Tab; label: string; icon: typeof Zap }[] = [
  { id: "quickstart", label: "Quick Start", icon: Zap },
  { id: "sdk", label: "SDK Guide", icon: Code2 },
  { id: "api", label: "API Reference", icon: Book },
  { id: "mcp", label: "MCP", icon: Bot },
];

export function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs: Tab[] = ["quickstart", "sdk", "api", "mcp"];
  const initialTab = validTabs.includes(searchParams.get("tab") as Tab)
    ? (searchParams.get("tab") as Tab)
    : "quickstart";
  const [tab, setTab] = useState<Tab>(initialTab);

  const updateTab = (next: Tab) => {
    setTab(next);
    setSearchParams((prev) => {
      prev.set("tab", next);
      return prev;
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-12 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="mt-2 text-muted-foreground">
            Everything you need to integrate with the Inbix Email API Platform.
          </p>
        </div>

        {/* Desktop tabs */}
        <div className="mb-8 hidden gap-1 border-b border-border md:flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => updateTab(t.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Mobile select */}
        <div className="mb-8 md:hidden">
          <Select value={tab} onValueChange={(value) => updateTab(value as Tab)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Start */}
        {tab === "quickstart" && (
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="mb-3 text-xl font-semibold">Install the SDK</h2>
              <CodeBlock code={codeExamples.install} label="Terminal" />
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Create Your First Inbox</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Create a disposable email inbox, receive emails, and read them programmatically.
              </p>
              <CodeBlock code={codeExamples.quickstart} label="TypeScript" />
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Authentication</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                The SDK supports two authentication methods: API keys (for automation) and Clerk session tokens (for dashboard integrations).
              </p>
              <CodeBlock code={codeExamples.auth} label="TypeScript" />
              <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Tip:</span> You can create API keys from the{" "}
                <Link to="/settings" className="text-primary hover:underline">Settings page</Link> after signing in.
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Using cURL</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Prefer raw HTTP? The REST API works with any HTTP client.
              </p>
              <CodeBlock code={codeExamples.curl} label="Terminal" />
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Connect via MCP</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Use Inbix directly from Claude, Cursor, Windsurf, and other MCP-compatible AI agents. Create inboxes, wait for OTPs, and extract verification links without writing code.
              </p>
              <button
                onClick={() => updateTab("mcp")}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                Open MCP Guide
                <ArrowRight className="h-4 w-4" />
              </button>
            </section>
          </div>
        )}

        {/* SDK Guide */}
        {tab === "sdk" && (
          <div className="flex flex-col gap-8">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">@inbix/sdk</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                The official TypeScript SDK for Inbix. Zero runtime dependencies, works in Node.js, browsers, and Cloudflare Workers.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.npmjs.com/package/@inbix/sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                >
                  npm <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://github.com/andriansandi/inbix/tree/main/packages/sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                >
                  GitHub <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Real-time Messages (SSE)</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Subscribe to an inbox to receive new messages in real-time via Server-Sent Events.
              </p>
              <CodeBlock code={codeExamples.realtime} label="TypeScript" />
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Webhooks</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Register webhooks to receive HTTP POST callbacks when events happen. Payloads are signed with HMAC-SHA256.
              </p>
              <CodeBlock code={codeExamples.webhooks} label="TypeScript" />
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">SDK Methods</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Method</th>
                      <th className="py-2 pr-4 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["createInbox(options?)", "Create a new disposable inbox"],
                      ["getInbox(id)", "Get inbox details"],
                      ["listInboxes(page?, pageSize?)", "List inboxes (paginated)"],
                      ["deleteInbox(id)", "Delete an inbox"],
                      ["listMessages(inboxId, page?, pageSize?)", "List messages in an inbox"],
                      ["getMessage(id)", "Get message details"],
                      ["getMessageHtml(id)", "Get sanitized HTML content"],
                      ["deleteMessage(id)", "Delete a message"],
                      ["listAttachments(messageId)", "List attachments for a message"],
                      ["downloadAttachment(messageId, attachmentId)", "Download attachment as Blob"],
                      ["subscribeToInbox(inboxId, onMessage, onError?)", "SSE real-time subscription"],
                      ["createApiKey(name)", "Create a new API key"],
                      ["listApiKeys()", "List your API keys"],
                      ["revokeApiKey(id)", "Revoke an API key"],
                      ["createWebhook(url, events)", "Create a webhook"],
                      ["listWebhooks()", "List your webhooks"],
                      ["deleteWebhook(id)", "Delete a webhook"],
                      ["testWebhook(id)", "Send a test webhook delivery"],
                      ["listApiLogs(page?, pageSize?)", "List API request logs"],
                    ].map(([method, desc]) => (
                      <tr key={method} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs text-primary">{method}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* API Reference */}
        {tab === "api" && (
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">Interactive API Reference</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Explore and test the Inbix REST API directly in your browser using Swagger UI.
              </p>
              <a
                href="/api/docs/ui"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                <Book className="h-4 w-4" />
                Open Swagger UI
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">OpenAPI Spec</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                The full OpenAPI 3.0 specification is available as JSON for importing into Postman, Insomnia, or other tools.
              </p>
              <div className="flex gap-2">
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Code2 className="h-4 w-4" />
                  /api/docs
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Base URL</h3>
              <CodeBlock code="https://inbix.xyz/api" label="Production" />
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Rate Limits</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Auth Method</th>
                      <th className="py-2 pr-4 font-medium">Limit</th>
                      <th className="py-2 pr-4 font-medium">Window</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">Anonymous</td>
                      <td className="py-2 pr-4 font-mono text-xs">60 req</td>
                      <td className="py-2 pr-4 text-muted-foreground">per minute</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">API Key</td>
                      <td className="py-2 pr-4 font-mono text-xs">120 req</td>
                      <td className="py-2 pr-4 text-muted-foreground">per minute</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* MCP */}
        {tab === "mcp" && (
          <div className="flex flex-col gap-8">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Model Context Protocol</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Connect Claude, Cursor, Windsurf, and any MCP-compatible AI agent to Inbix. Generate inboxes, wait for emails, extract OTPs, and clean up — all through a standardized protocol.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Claude", "Cursor", "Windsurf", "VS Code"].map((client) => (
                  <span
                    key={client}
                    className="inline-flex items-center rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {client}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Install</h3>
              <CodeBlock code={codeExamples.mcpInstall} label="Terminal" />
              <p className="mt-3 text-sm text-muted-foreground">
                Or let your MCP client run it directly with{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npx -y @inbix/mcp-server</code>.
              </p>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Get an API key</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                MCP clients authenticate with an Inbix API key. Create one from the{" "}
                <Link to="/settings" className="text-primary hover:underline">
                  Settings page
                </Link>{" "}
                after signing in.
              </p>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Claude Desktop</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add to your <code className="font-mono text-xs">claude_desktop_config.json</code>:
              </p>
              <CodeBlock code={codeExamples.mcpClaude} label="JSON" />
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Cursor</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add to your Cursor MCP config (usually <code className="font-mono text-xs">~/.cursor/mcp.json</code>):
              </p>
              <CodeBlock code={codeExamples.mcpCursor} label="JSON" />
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Windsurf</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add to your Windsurf config (usually <code className="font-mono text-xs">~/.codeium/windsurf/config.json</code>):
              </p>
              <CodeBlock code={codeExamples.mcpWindsurf} label="JSON" />
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Example workflow</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Once connected, ask your agent to handle an email-based flow end-to-end.
              </p>
              <CodeBlock code={codeExamples.mcpWorkflow} label="Agent prompt" />
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold">Available tools</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Tool</th>
                      <th className="py-2 pr-4 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["create_inbox", "Create a new disposable inbox"],
                      ["list_inboxes", "List existing inboxes"],
                      ["read_inbox", "Get inbox details"],
                      ["delete_inbox", "Delete an inbox"],
                      ["list_inbox_messages", "List messages in an inbox"],
                      ["read_message", "Read a message"],
                      ["download_attachment", "Download an attachment"],
                      ["wait_for_email", "Poll until an email arrives"],
                      ["wait_for_otp", "Wait and extract an OTP"],
                      ["extract_verification_link", "Extract verification links"],
                      ["search_messages", "Search messages"],
                    ].map(([tool, desc]) => (
                      <tr key={tool} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs text-primary">{tool}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
