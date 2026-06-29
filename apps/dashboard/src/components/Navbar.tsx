import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight, LayoutGrid } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { LogoMark } from "@inbix/ui";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Docs", href: "/#docs" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="text-base font-semibold tracking-tight">Inbix</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="https://github.com/andriansandi/inbix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <Link
              to="/sign-in"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Sign In
            </Link>
          </SignedOut>
          <SignedIn>
            <div className="hidden sm:block">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <Link
            to="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
            aria-label="Open Dashboard"
          >
            <LayoutGrid className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border lg:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </a>
              )
            )}
            <a
              href="https://github.com/andriansandi/inbix"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              GitHub
            </a>
            <SignedOut>
              <Link
                to="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm text-muted-foreground">Account</span>
              </div>
            </SignedIn>
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function DashboardNav() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
      <Link to="/" className="flex items-center gap-2.5">
        <LogoMark size={24} />
        <span className="text-sm font-semibold tracking-tight">Inbix</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <SignedIn>
          <Link
            to="/settings"
            className="hidden h-9 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            Settings
          </Link>
        </SignedIn>
        <SignedOut>
          <Link
            to="/sign-in"
            className="inline-flex h-9 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Sign In
          </Link>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}
