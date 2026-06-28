import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Github } from "lucide-react";
import { LogoMark } from "@inbix/ui";
import { Modal } from "../components/Modal";
import { ANONYMOUS_INBOX_LIMIT, FREE_TIER_INBOX_LIMIT } from "@inbix/shared";

export function AuthPage() {
  const navigate = useNavigate();
  const [showAnonymousConfirm, setShowAnonymousConfirm] = useState(false);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <LogoMark size={32} />
          <span className="text-lg font-semibold tracking-tight">Inbix</span>
        </Link>

        <div className="rounded-xl border border-border bg-card p-8">
          <h1 className="text-center text-xl font-semibold tracking-tight">
            Sign in to Inbix
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign in to manage inboxes, API keys, and billing.
          </p>

          <div className="mt-6 space-y-3">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98]"
              onClick={() => alert("Authentication is planned. Use the dashboard without an account for now.")}
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </button>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98]"
              onClick={() => alert("Authentication is planned. Use the dashboard without an account for now.")}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Authentication is planned. Use the dashboard without an account for now.");
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              Send Magic Link
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Authentication supports passkeys, magic links,
            and social login.
          </p>
        </div>

        <button
          onClick={() => setShowAnonymousConfirm(true)}
          className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Continue without account
        </button>
      </div>

      <Modal
        open={showAnonymousConfirm}
        onClose={() => setShowAnonymousConfirm(false)}
      >
        <div className="space-y-4">
          <div className="space-y-1.5 pr-6">
            <h2 className="text-lg font-semibold tracking-tight">
              Continue without account?
            </h2>
            <p className="text-sm text-muted-foreground">
              Without an account you're limited to {ANONYMOUS_INBOX_LIMIT} active
              inbox with 60-minute retention. Create an account for up to{" "}
              {FREE_TIER_INBOX_LIMIT} mailboxes and 12-hour retention.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setShowAnonymousConfirm(false);
                navigate("/dashboard");
              }}
              className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              Continue without account
            </button>
            <button
              onClick={() => setShowAnonymousConfirm(false)}
              className="flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
