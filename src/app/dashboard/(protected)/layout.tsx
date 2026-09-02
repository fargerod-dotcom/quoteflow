import { redirect } from "next/navigation";
import { requireBusiness } from "@/lib/auth-helpers";
import { isBusinessActive } from "@/lib/billing/stripe";

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await requireBusiness();
  if (!isBusinessActive(business)) redirect("/dashboard/billing");

  return <>{children}</>;
}
