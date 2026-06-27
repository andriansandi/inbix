import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { LogoMark } from "@inbix/ui";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-6">
      <Link to="/" className="flex items-center gap-2.5">
        <LogoMark size={32} />
        <span className="text-lg font-semibold tracking-tight">Inbix</span>
      </Link>

      <div className="text-center">
        <p className="text-6xl font-bold tracking-tighter text-muted-foreground/20">
          404
        </p>
        <p className="mt-2 text-sm font-medium">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
