import Link from "next/link";
import { signOut } from "@/lib/auth";

const LINKS = [
  { href: "/dashboard/inbox", label: "Inbox" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/dashboard/inbox" className="text-lg font-semibold text-slate-900">
          QuoteFlow
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
