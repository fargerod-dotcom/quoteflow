import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Businesses" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/errors", label: "Errors" },
];

export function AdminNav() {
  return (
    <header className="border-b border-slate-200 bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold text-white">QuoteFlow Admin</span>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
