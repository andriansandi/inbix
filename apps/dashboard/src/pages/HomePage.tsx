import { Link } from "react-router-dom";
import {
  Mail,
  Zap,
  Shield,
  Globe,
  Github,
  ArrowRight,
  Terminal,
  Layers,
  Lock,
  Server,
  Database,
  Cloud,
  CheckCircle2,
} from "lucide-react";

export function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Inbix</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#architecture" className="text-sm text-muted-foreground hover:text-foreground">Architecture</a>
            <a href="#deploy" className="text-sm text-muted-foreground hover:text-foreground">Deploy</a>
            <a
              href="https://github.com/andriansandi/inbix"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Open Source · Cloudflare Native · No SMTP
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
              Disposable Email,
              <br />
              <span className="text-primary">Powered by Cloudflare</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              The easiest disposable email platform to self-host. Clone, install,
              deploy — done. No Docker, no VPS, no SMTP server management.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Try Live Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#deploy"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Terminal className="h-4 w-4" />
                Quick Start
              </a>
            </div>
          </div>

          {/* Terminal */}
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-2 text-xs text-muted-foreground">bash</span>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="text-muted-foreground">$ <span className="text-foreground">git clone https://github.com/andriansandi/inbix.git</span></div>
                <div className="text-muted-foreground">$ <span className="text-foreground">cd inbix && pnpm install</span></div>
                <div className="text-muted-foreground">$ <span className="text-foreground">pnpm deploy</span></div>
                <div className="mt-2 text-emerald-500">✓ Deployed to Cloudflare Workers</div>
                <div className="text-primary">→ https://inbix.your-subdomain.workers.dev</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need, nothing you don't
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built for developers, QA engineers, and automation pipelines.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Zap, title: "Instant Inbox", desc: "Generate a random disposable email address in one click. No signup required." },
              { icon: Mail, title: "Real-time Messages", desc: "Watch emails arrive in real-time via Server-Sent Events. No refresh needed." },
              { icon: Shield, title: "HTML Sanitized", desc: "All HTML emails are sanitized to prevent XSS. View safely in a sandboxed iframe." },
              { icon: Layers, title: "Attachment Support", desc: "Receive and download attachments up to 10MB. Stored in Cloudflare R2." },
              { icon: Lock, title: "Auto Expiration", desc: "Inboxes expire automatically. Set custom TTL from 1 minute to 7 days." },
              { icon: Globe, title: "Multi-domain", desc: "Support multiple domains. Route emails from all your domains to one Worker." },
              { icon: Database, title: "D1 Database", desc: "All metadata stored in Cloudflare D1. Fast, reliable, serverless SQLite." },
              { icon: Cloud, title: "100% Cloudflare", desc: "No external dependencies. Everything runs on Cloudflare's edge network." },
              { icon: Server, title: "REST API", desc: "Full REST API for automation, CI/CD pipelines, and integrations." },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Architecture</h2>
            <p className="mt-4 text-muted-foreground">
              A single Cloudflare Worker handles everything. Simple, fast, cost-effective.
            </p>
          </div>

          <div className="mt-16">
            <div className="flex flex-col items-center gap-4">
              {[
                { label: "Incoming Email", sub: "Cloudflare Email Routing", icon: Mail },
                { label: "Email Worker", sub: "Parses MIME, extracts content & attachments", icon: Terminal },
                { label: "D1 Database", sub: "Stores inbox & message metadata", icon: Database },
                { label: "R2 Storage", sub: "Stores attachments & large content", icon: Layers },
                { label: "Hono API", sub: "REST API + SSE for real-time updates", icon: Server },
                { label: "Dashboard", sub: "React SPA served as static assets", icon: Globe },
              ].map((step, i) => (
                <div key={step.label} className="flex flex-col items-center">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{step.label}</div>
                      <div className="text-xs text-muted-foreground">{step.sub}</div>
                    </div>
                  </div>
                  {i < 5 && <div className="h-6 w-px bg-border" />}
                </div>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div className="mt-16">
            <h3 className="mb-6 text-center text-sm font-medium text-muted-foreground">Built with</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {["Cloudflare Workers", "Hono", "TypeScript", "D1", "R2", "KV", "Drizzle ORM", "Zod", "React", "Vite", "TailwindCSS", "shadcn/ui"].map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">Three steps from zero to running.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Generate Inbox", desc: "Click a button to get a random email address. Or create one via the REST API." },
              { num: "02", title: "Receive Emails", desc: "Send emails to the address. They appear instantly in the dashboard via SSE." },
              { num: "03", title: "Read & Download", desc: "View HTML or plain text. Download attachments. Inbox auto-expires when done." },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="text-5xl font-bold text-primary/20">{step.num}</div>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deploy */}
      <section id="deploy" className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Deploy in 60 seconds</h2>
            <p className="mt-4 text-muted-foreground">No Docker. No VPS. No SMTP. Just Cloudflare.</p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl space-y-8">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-semibold">1. Prerequisites</h3>
              </div>
              <ul className="ml-7 space-y-1 text-sm text-muted-foreground">
                <li>• A Cloudflare account (free tier works)</li>
                <li>• Node.js 20+ and pnpm installed</li>
                <li>• A domain configured in Cloudflare</li>
              </ul>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-semibold">2. Clone & Install</h3>
              </div>
              <div className="ml-7 overflow-hidden rounded-lg border border-border bg-background">
                <div className="p-3 font-mono text-sm">
                  <div className="text-muted-foreground">$ git clone https://github.com/andriansandi/inbix.git</div>
                  <div className="text-muted-foreground">$ cd inbix</div>
                  <div className="text-muted-foreground">$ pnpm install</div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-semibold">3. Configure Cloudflare Resources</h3>
              </div>
              <div className="ml-7 overflow-hidden rounded-lg border border-border bg-background">
                <div className="p-3 font-mono text-sm">
                  <div className="text-muted-foreground"># Create D1 database</div>
                  <div className="text-muted-foreground">$ npx wrangler d1 create inbix</div>
                  <div className="text-muted-foreground"># Create R2 bucket</div>
                  <div className="text-muted-foreground">$ npx wrangler r2 bucket create inbix-attachments</div>
                  <div className="text-muted-foreground"># Create KV namespaces</div>
                  <div className="text-muted-foreground">$ npx wrangler kv namespace create CACHE</div>
                  <div className="text-muted-foreground">$ npx wrangler kv namespace create RATE_LIMIT_KV</div>
                  <div className="text-muted-foreground"># Run migrations</div>
                  <div className="text-muted-foreground">$ pnpm db:migrate</div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-semibold">4. Deploy</h3>
              </div>
              <div className="ml-7 overflow-hidden rounded-lg border border-border bg-background">
                <div className="p-3 font-mono text-sm">
                  <div className="text-muted-foreground">$ pnpm deploy</div>
                  <div className="mt-1 text-emerald-500">✓ Deployed inbix to Cloudflare Workers</div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-semibold">5. Set up Email Routing</h3>
              </div>
              <p className="ml-7 text-sm text-muted-foreground">
                In Cloudflare Dashboard → Email → Routing → Routes,
                add a catch-all rule that sends to your deployed Worker.
                Done!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Getting Started", desc: "Quick setup guide", link: "#" },
              { title: "API Reference", desc: "REST API documentation", link: "#" },
              { title: "Architecture", desc: "How Inbix works internally", link: "#" },
              { title: "Self-hosting", desc: "Deploy on your own domain", link: "#" },
            ].map((doc) => (
              <a
                key={doc.title}
                href={doc.link}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <h3 className="text-base font-semibold group-hover:text-primary">{doc.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{doc.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Read more
                  <ArrowRight className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* GitHub CTA */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background">
              <Github className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Star us on GitHub
            </h2>
            <p className="mt-4 text-muted-foreground">
              Inbix is open source and MIT licensed. Star the repo, file issues,
              contribute, and help us make disposable email better.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <a
                href="https://github.com/andriansandi/inbix"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </a>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                Try Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold">Inbix</span>
              <span className="text-sm text-muted-foreground">· Open Source · MIT License</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://github.com/andriansandi/inbix" className="hover:text-foreground">GitHub</a>
              <a href="#" className="hover:text-foreground">Docs</a>
              <a href="https://inbix.xyz" className="hover:text-foreground">inbix.xyz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
