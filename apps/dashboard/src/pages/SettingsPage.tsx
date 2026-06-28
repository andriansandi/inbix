import { useState } from "react";
import { KeyRound, User, Bell, Webhook, Copy, Check } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { NotificationsTab } from "../components/NotificationsTab";
import { cn } from "../lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "api-keys", label: "API Keys", icon: KeyRound },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("api-keys");
  const [copiedKey, setCopiedKey] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-12 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, API keys, and integrations.
        </p>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row">
          {/* Sidebar */}
          <nav className="flex gap-1 overflow-x-auto sm:w-48 sm:flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "api-keys" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">API Keys</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate API keys to authenticate REST API requests from
                    your applications, CI/CD pipelines, and SDKs.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Default Key</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        inbix_a1b2c3d4e5f6...
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("inbix_a1b2c3d4e5f6");
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent active:scale-[0.98]"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="h-3 w-3 text-success" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: Jan 15, 2025</span>
                    <span>Last used: Never</span>
                  </div>
                </div>

                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
                  onClick={() => alert("API key generation is coming soon.")}
                >
                  <KeyRound className="h-4 w-4" />
                  Generate New Key
                </button>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Profile</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Update your account information.
                  </p>
                </div>
                <SignedIn>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center gap-4">
                      <UserButton afterSignOutUrl="/" />
                      <div>
                        <p className="text-sm font-medium">
                          Manage your profile
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Update your name, email, password, and connected
                          accounts via the account dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                      Sign in to manage your profile, email, and password.
                    </p>
                  </div>
                </SignedOut>
              </div>
            )}

            {activeTab === "webhooks" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Webhooks</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Receive HTTP callbacks when messages arrive in your inboxes.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">
                    Webhooks are available on Pro and Team plans.
                    Upgrade to configure webhook endpoints and receive
                    real-time event notifications.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "notifications" && <NotificationsTab />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
