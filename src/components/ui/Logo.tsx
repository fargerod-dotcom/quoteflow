import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-7 w-7", className)}>
      <rect width="32" height="32" rx="8" fill="#2563eb" />
      <path
        d="M9 11h14M9 16h10M9 21h7"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="23" cy="21" r="3.25" fill="#fff" />
      <path d="M21.6 21l1 1 1.9-2" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight text-slate-900", className)}>
      <LogoMark />
      QuoteFlow
    </span>
  );
}
