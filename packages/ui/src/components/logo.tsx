import * as React from "react";
import { cn } from "../lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function LogoMark({ size = 32, className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="32" height="32" rx="7" fill="hsl(var(--primary))" />
      <path
        d="M16 8.5 L22.5 12.25 L22.5 19.75 L16 23.5 L9.5 19.75 L9.5 12.25 Z"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="16" cy="16" r="2.5" fill="hsl(var(--primary-foreground))" />
    </svg>
  );
}

function Logo({ size = 32, className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
      <LogoMark size={size} />
      <span className="text-base font-semibold tracking-tight">Inbix</span>
    </div>
  );
}

export { Logo, LogoMark };
