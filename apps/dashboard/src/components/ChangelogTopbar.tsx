import { useState, useEffect, useRef, useCallback } from "react";
import { GitPullRequest, ChevronDown, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MergedPR {
  number: number;
  title: string;
  merged_at: string;
  html_url: string;
  user: { login: string };
}

const GITHUB_API = "https://api.github.com/repos/andriansandi/inbix/pulls?state=closed&sort=updated&direction=desc&per_page=20";
const STORAGE_KEY = "inbix:changelog:dismissed";
const MAX_ITEMS = 5;
const ROTATE_MS = 4000;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

export function ChangelogTopbar() {
  const [prs, setPrs] = useState<MergedPR[]>([]);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setDismissed(stored);

    fetch(GITHUB_API)
      .then((r) => r.json())
      .then((data: MergedPR[]) => {
        const merged = data
          .filter((pr) => pr.merged_at)
          .sort((a, b) => new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime())
          .slice(0, MAX_ITEMS);
        setPrs(merged);
      })
      .catch(() => {});
  }, []);

  const rotate = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % prs.length);
  }, [prs.length]);

  useEffect(() => {
    if (prs.length <= 1 || paused || open) return;
    const interval = setInterval(rotate, ROTATE_MS);
    return () => clearInterval(interval);
  }, [prs.length, paused, open, rotate]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const latest = prs[0];
  const current = prs[currentIdx];
  const isVisible = latest && String(latest.number) !== dismissed;

  const dismiss = () => {
    if (latest) {
      localStorage.setItem(STORAGE_KEY, String(latest.number));
      setDismissed(String(latest.number));
    }
  };

  if (!isVisible || !current) return null;

  return (
    <div
      ref={ref}
      className="relative z-50 border-b border-border bg-background/80 backdrop-blur-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-3 px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <GitPullRequest className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="shrink-0 text-xs font-semibold text-primary">
            Shipped:
          </span>
          <div className="relative h-4 min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.a
                key={current.number}
                href={current.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="truncate">{current.title}</span>
                <span className="shrink-0 text-primary/70">#{current.number}</span>
                <span className="hidden shrink-0 text-primary/50 sm:inline">
                  · {timeAgo(current.merged_at)}
                </span>
              </motion.a>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {prs.length > 1 && (
            <>
              <div className="hidden items-center gap-1 sm:flex">
                {prs.map((pr, i) => (
                  <button
                    key={pr.number}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-1 rounded-full transition-all ${
                      i === currentIdx
                        ? "w-4 bg-primary"
                        : "w-1 bg-primary/30 hover:bg-primary/50"
                    }`}
                    aria-label={`Update ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setOpen(!open)}
                className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs text-primary/70 transition-colors hover:bg-accent hover:text-primary"
              >
                {prs.length}
                <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            </>
          )}
          <button
            onClick={dismiss}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-primary/70 transition-colors hover:bg-accent hover:text-primary"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-9 border-b border-border bg-background shadow-lg"
          >
            <div className="mx-auto max-w-6xl px-6 py-3 md:px-8">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-primary/50">
                  Recent Updates
                </span>
                <a
                  href="https://github.com/andriansandi/inbix/pulls?q=is%3Apr+is%3Amerged"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View all <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex flex-col gap-1">
                {prs.map((pr, i) => (
                  <a
                    key={pr.number}
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent ${
                      i === currentIdx ? "bg-accent/50" : ""
                    }`}
                  >
                    <GitPullRequest className="h-3 w-3 shrink-0 text-primary" />
                    <span className="truncate text-primary">{pr.title}</span>
                    <span className="shrink-0 text-primary/50">#{pr.number}</span>
                    <span className="ml-auto shrink-0 text-primary/50">
                      {timeAgo(pr.merged_at)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
