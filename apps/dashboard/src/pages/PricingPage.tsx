import { Link } from "react-router-dom";
import { Check, ArrowRight, Server, Cloud } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { cn } from "../lib/utils";

const cloudTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For testing and personal projects.",
    features: [
      "1 active inbox (anonymous)",
      "5 inboxes with account",
      "60-minute retention",
      "Shared public domains",
      "Web Dashboard",
      "Basic REST API",
      "Limited API requests",
    ],
    cta: "Get Started",
    ctaTo: "/auth",
    highlighted: false,
    disabled: false,
  },
  {
    name: "Pro",
    price: "$2.99",
    period: "per month",
    description: "For developers and automation.",
    features: [
      "Unlimited active inboxes",
      "Full REST API",
      "10,000 API requests/month",
      "7-day retention",
      "Custom inbox names",
      "Webhooks",
      "Higher rate limits",
      "Priority processing",
      "Ad-free",
    ],
    cta: "Upgrade to Pro",
    ctaTo: "/auth",
    highlighted: true,
    disabled: true,
  },
  {
    name: "Team",
    price: "$9.99",
    period: "per month",
    description: "For teams and organizations.",
    features: [
      "Everything in Pro",
      "Team Workspaces",
      "Shared Inboxes",
      "Shared API Keys",
      "Analytics",
      "Audit Logs",
      "Multiple Domains",
      "Higher API Limits",
    ],
    cta: "Upgrade to Team",
    ctaTo: "/auth",
    highlighted: false,
    disabled: true,
  },
];

export function PricingPage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Simple, transparent pricing.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Free to self-host. Cloud plans start at $2.99/month. No hidden
              fees, no artificial limitations on the open source edition.
            </p>
          </div>
        </div>
      </section>

      {/* Cloud pricing */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
          <div className="mb-12 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Cloud className="h-4 w-4" />
            Cloud Hosting
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {cloudTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative flex flex-col rounded-xl border p-6",
                  tier.highlighted
                    ? "border-primary bg-card"
                    : "border-border bg-card"
                )}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}

                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>

                {tier.name === "Pro" && (
                  <p className="mt-1 text-xs text-muted-foreground">or $24/year</p>
                )}

                {tier.disabled ? (
                  <button
                    disabled
                    title="Coming soon"
                    className={cn(
                      "mt-6 inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium opacity-50",
                      tier.highlighted
                        ? "bg-primary text-primary-foreground"
                        : "border border-border"
                    )}
                  >
                    {tier.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Link
                    to={tier.ctaTo}
                    className={cn(
                      "mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98]",
                      tier.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border hover:bg-accent"
                    )}
                  >
                    {tier.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Enterprise */}
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold">Enterprise</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Dedicated infrastructure, SLA, SSO, private deployment,
                dedicated domains, white-label.
              </p>
            </div>
            <a
              href="mailto:hello@inbix.xyz"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98]"
            >
              Contact Us
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Open Source / Self-hosted */}
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Server className="h-4 w-4" />
                Self-hosted
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Open Source. Unlimited everything.
              </h2>
              <p className="mt-4 text-muted-foreground">
                The MIT licensed edition has no artificial limitations. Deploy
                on your own Cloudflare account and get unlimited inboxes, API
                usage, and custom domains.
              </p>
              <a
                href="https://github.com/andriansandi/inbix"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                Self-host with 3 commands
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
              {[
                "MIT License",
                "Unlimited deployments",
                "Unlimited active inboxes",
                "Unlimited API usage",
                "Unlimited custom domains",
                "Full REST API",
                "SDK support",
                "MCP Server support",
                "Community support",
                "Public documentation",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 bg-card p-4">
                  <Check className="h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 md:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Frequently asked questions.
          </h2>

          <div className="mt-12 divide-y divide-border">
            {[
              {
                q: "Is Inbix really free to self-host?",
                a: "Yes. The self-hosted edition is MIT licensed with no artificial limitations. You only pay for your Cloudflare account, which has a generous free tier: 100K Worker requests/day, 5M D1 reads/day, and 1GB R2 storage.",
              },
              {
                q: "What is the difference between self-hosted and cloud?",
                a: "Self-hosted runs on your own Cloudflare account with unlimited everything. Cloud handles infrastructure, provides managed domains, adds webhooks, analytics, and team features. You can start self-hosted and migrate to cloud anytime.",
              },
              {
                q: "Can I use Inbix for CI/CD and automated testing?",
                a: "Yes. Inbix is designed for automation. Use the REST API or SDKs to create inboxes, wait for emails, extract OTPs, and verify signup flows in your test suites.",
              },
              {
                q: "What is the MCP Server?",
                a: "The MCP (Model Context Protocol) Server lets AI agents like Claude Desktop, Cursor, and Windsurf create inboxes, read messages, and extract verification codes directly. It is part of the roadmap and will be available as @inbix/mcp-server.",
              },
              {
                q: "Do you store my data?",
                a: "All data is stored in your own Cloudflare account when self-hosted. Inboxes auto-expire and data is permanently deleted. No data is sent to any third-party service.",
              },
            ].map((faq) => (
              <div key={faq.q} className="py-6">
                <h3 className="text-base font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
