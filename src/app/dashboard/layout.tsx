import { requireBusiness } from "@/lib/auth-helpers";
import { DashboardNav } from "@/components/nav/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireBusiness();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
