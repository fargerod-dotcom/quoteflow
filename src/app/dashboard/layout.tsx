import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { DashboardNav } from "@/components/nav/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await requireBusiness();
  const newCount = await prisma.request.count({ where: { businessId: business.id, status: "NEW" } });

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav businessName={business.name} newCount={newCount} />
      {/* Bottom padding clears the mobile tab bar */}
      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 sm:pb-6">{children}</main>
    </div>
  );
}
