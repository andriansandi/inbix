import { Link } from "react-router-dom";
import {
  ArrowRight,
  Terminal,
  Zap,
  Radio,
  Shield,
  Globe,
  Server,
  Database,
  Cloud,
  Waypoints,
  Code2,
  GitBranch,
  CheckCircle2,
  Boxes,
  KeyRound,
  Webhook,
  Bot,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="animate-in">
              <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Programmable email infrastructure.
              </h1>
              <p className="mt-6 max-w-md text-pretty text-lg text-muted-foreground">
                Open source, Cloudflare-native. Generate inboxes, receive
                emails, and automate through REST APIs, SDKs, and MCP.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://github.com/andriansandi/inbix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98]"
                >
                  <GitBranch className="h-4 w-4" />
                  View Source
                </a>
              </div>
            </div>

            {/* Code example */}
            <div className="animate-in">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                  </div>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">create-inbox.ts</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
                  <code>
                    <span className="text-muted-foreground">{"import"} </span>
                    <span className="text-foreground">{"{ InbixClient }"}</span>
                    <span className="text-muted-foreground">{" from "}</span>
                    <span className="text-primary">{'"@inbix/sdk"'}</span>
                    <span className="text-muted-foreground">{";"}</span>
                    {"\n\n"}
                    <span className="text-muted-foreground">{"const"}</span>
                    <span className="text-foreground">{" client"}</span>
                    <span className="text-muted-foreground">{" = new "}</span>
                    <span className="text-foreground">{"InbixClient"}</span>
                    <span className="text-muted-foreground">{"({"}</span>
                    {"\n  "}
                    <span className="text-foreground">{"baseUrl"}</span>
                    <span className="text-muted-foreground">{": "}</span>
                    <span className="text-primary">{'"https://api.inbix.xyz"'}</span>
                    <span className="text-muted-foreground">{","}</span>
                    {"\n"}<span className="text-muted-foreground">{"});"}</span>
                    {"\n\n"}
                    <span className="text-muted-foreground">{"const"}</span>
                    <span className="text-foreground">{" inbox"}</span>
                    <span className="text-muted-foreground">{" = await "}</span>
                    <span className="text-foreground">{"client"}</span>
                    <span className="text-muted-foreground">{"."}</span>
                    <span className="text-foreground">{"createInbox"}</span>
                    <span className="text-muted-foreground">{"();"}</span>
                    {"\n"}
                    <span className="text-muted-foreground">{"console."}</span>
                    <span className="text-foreground">{"log"}</span>
                    <span className="text-muted-foreground">{"(inbox."}</span>
                    <span className="text-foreground">{"emailAddress"}</span>
                    <span className="text-muted-foreground">{");"}</span>
                    {"\n\n"}
                    <span className="text-muted-foreground">{"client."}</span>
                    <span className="text-foreground">{"subscribeToInbox"}</span>
                    <span className="text-muted-foreground">{"(inbox."}</span>
                    <span className="text-foreground">{"id"}</span>
                    <span className="text-muted-foreground">{", (msg) => {"}</span>
                    {"\n  "}
                    <span className="text-muted-foreground">{"console."}</span>
                    <span className="text-foreground">{"log"}</span>
                    <span className="text-muted-foreground">{'("New:", msg.'}</span>
                    <span className="text-foreground">{"subject"}</span>
                    <span className="text-muted-foreground">{");"}</span>
                    {"\n"}
                    <span className="text-muted-foreground">{"});"}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars - asymmetric grid */}
      <section id="features" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-8">
          <h2 className="max-w-lg text-3xl font-bold tracking-tight md:text-4xl">
            Built for developers, not for email.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Everything is an API call. The dashboard is just one client.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            {[
              { icon: Code2, title: "API-first", desc: "Full REST API for every operation. Create inboxes, read messages, download attachments, all programmatically." },
              { icon: Radio, title: "Real-time SSE", desc: "Server-Sent Events push new messages to your client the moment they arrive. No polling required." },
              { icon: Cloud, title: "Cloudflare-native", desc: "Runs entirely on Cloudflare Workers, D1, R2, and KV. No external services, no SMTP servers." },
            ].map((f) => (
              <div key={f.title} className="bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Secondary features - hairline list */}
          <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, title: "HTML sanitized", desc: "All HTML emails sanitized against XSS. Rendered in sandboxed iframes." },
              { icon: Boxes, title: "Attachment support", desc: "Receive and download attachments up to 10MB. Stored in Cloudflare R2." },
              { icon: Zap, title: "Auto expiration", desc: "Inboxes expire automatically. Custom TTL from 1 minute to 7 days." },
              { icon: KeyRound, title: "API keys", desc: "Generate API keys for automation, CI/CD pipelines, and integrations." },
              { icon: Webhook, title: "Webhooks", desc: "Receive HTTP callbacks when messages arrive. Build event-driven workflows." },
              { icon: Bot, title: "MCP Server", desc: "Use with Claude, Cursor, and any MCP-compatible AI agent." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 border-b border-border py-4">
                <div className="mt-0.5 shrink-0">
                  <f.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{f.title}</h4>
                  <p className="mt-0.5 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            One Worker. Everything included.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            A single Cloudflare Worker handles email routing, API, and static
            assets. No microservices, no orchestration.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Email Worker", sub: "Parses MIME, extracts content", icon: Terminal },
              { label: "Hono API", sub: "REST API + SSE real-time", icon: Server },
              { label: "D1 Database", sub: "Inbox and message metadata", icon: Database },
              { label: "R2 Storage", sub: "Attachments and large content", icon: Boxes },
              { label: "KV Cache", sub: "Rate limiting and caching", icon: Zap },
              { label: "React Dashboard", sub: "Static SPA served by Worker", icon: Globe },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {["Cloudflare Workers", "Hono", "TypeScript", "D1", "R2", "KV", "Drizzle ORM", "Zod", "React", "Vite", "TailwindCSS"].map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section id="deploy" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Deploy in 60 seconds.
              </h2>
              <p className="mt-4 text-muted-foreground">
                No Docker. No VPS. No SMTP. Just Cloudflare.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  { title: "Clone and install", cmd: "git clone https://github.com/andriansandi/inbix.git\ncd inbix && pnpm install" },
                  { title: "Create Cloudflare resources", cmd: "npx wrangler d1 create inbix\nnpx wrangler r2 bucket create inbix-attachments\npnpm db:migrate" },
                  { title: "Deploy", cmd: "pnpm deploy" },
                ].map((step) => (
                  <div key={step.title}>
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <h3 className="text-sm font-semibold">{step.title}</h3>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border bg-card">
                      <pre className="overflow-x-auto p-3 font-mono text-xs text-muted-foreground">
                        <code>{step.cmd}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <Waypoints className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">Email routing setup</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  In Cloudflare Dashboard, navigate to your domain, then
                  Email, then Routing, then Routes. Add a catch-all rule
                  that sends to your deployed Worker.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <Server className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">Self-hostable</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  MIT licensed. No artificial limitations. Unlimited inboxes,
                  unlimited API usage, unlimited custom domains. Deploy on
                  your own Cloudflare account in minutes.
                </p>
                <Link
                  to="/pricing"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
                >
                  Compare plans
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Start building with Inbix.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Open source. Free to self-host. Cloud plans start at $2.99/month.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98]"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
