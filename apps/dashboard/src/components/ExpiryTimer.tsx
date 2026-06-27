import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { formatExpiry } from "../lib/utils";

interface ExpiryTimerProps {
  expiresAt: number;
}

export function ExpiryTimer({ expiresAt }: ExpiryTimerProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = expiresAt - Date.now();
  const isExpired = remaining <= 0;
  const isUrgent = remaining > 0 && remaining < 5 * 60 * 1000;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isExpired
          ? "bg-red-500/10 text-red-500"
          : isUrgent
            ? "bg-amber-500/10 text-amber-500"
            : "bg-muted text-muted-foreground"
      }`}
    >
      <Clock className="h-3 w-3" />
      {isExpired ? "Expired" : formatExpiry(expiresAt)}
    </div>
  );
}
