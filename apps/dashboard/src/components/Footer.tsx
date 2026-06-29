import { Link } from "react-router-dom";
import { LogoMark } from "@inbix/ui";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <LogoMark size={28} />
              <span className="text-base font-semibold tracking-tight">Inbix</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Open Source Cloudflare-native Email API Platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Product
              </span>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Resources
              </span>
              <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
              <a href="/#architecture" className="text-sm text-muted-foreground hover:text-foreground">
                Architecture
              </a>
              <a href="/#deploy" className="text-sm text-muted-foreground hover:text-foreground">
                Self-hosting
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Community
              </span>
              <a
                href="https://github.com/andriansandi/inbix"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href="https://github.com/andriansandi/inbix/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Issues
              </a>
              <a
                href="https://github.com/andriansandi/inbix/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contributing
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            MIT License.
          </p>
          <p className="text-sm text-muted-foreground">
            built ❤ by KODR
          </p>
        </div>
      </div>
    </footer>
  );
}
