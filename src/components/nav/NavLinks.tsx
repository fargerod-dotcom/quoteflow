"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const DASHBOARD_LINKS = [
  { href: "/dashboard/inbox", label: "Inbox", icon: InboxIcon },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export function NavLinks({ newCount = 0 }: { newCount?: number }) {
  const pathname = usePathname();
  return (
    <>
      {DASHBOARD_LINKS.map((link) => {
        const active = pathname.startsWith(link.href) || (link.href === "/dashboard/inbox" && pathname.startsWith("/dashboard/requests"));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative rounded-lg px-3 py-2 text-sm font-medium",
              active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {link.label}
            {link.href === "/dashboard/inbox" && newCount > 0 && (
              <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {newCount}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

export function MobileTabBar({ newCount = 0 }: { newCount?: number }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
      <div className="grid grid-cols-3">
        {DASHBOARD_LINKS.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href) || (link.href === "/dashboard/inbox" && pathname.startsWith("/dashboard/requests"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[11px] font-medium",
                active ? "text-brand-600" : "text-slate-500"
              )}
            >
              <Icon />
              {link.label}
              {link.href === "/dashboard/inbox" && newCount > 0 && (
                <span className="absolute right-[calc(50%-1.5rem)] top-1 rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                  {newCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function InboxIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 13l2-8h14l2 8v6H3z" strokeLinejoin="round" />
      <path d="M3 13h5l1.5 2h5L16 13h5" strokeLinejoin="round" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  );
}
