import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: "default" | "compact";
}

export function CopyButton({ text, label = "Copy", variant = "default" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleCopy}
        aria-label={copied ? "Copied" : `Copy ${label.toLowerCase()}`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-[0.98]"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors active:scale-[0.98]",
        copied
          ? "text-success"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}
