import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { NavLinks, MobileTabBar } from "@/components/nav/NavLinks";

export function DashboardNav({ businessName, newCount }: { businessName: string; newCount: number }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard/inbox">
              <Logo />
            </Link>
            <span className="hidden truncate text-sm text-slate-400 sm:inline">/ {businessName}</span>
          </div>
          <nav className="flex items-center gap-1">
            <div className="hidden sm:contents">
              <NavLinks newCount={newCount} />
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <MobileTabBar newCount={newCount} />
    </>
  );
}
