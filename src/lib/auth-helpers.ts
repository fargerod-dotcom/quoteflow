import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Business } from "@prisma/client";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  return session;
}

/** Requires a signed-in owner with a Business already created (post-onboarding). */
export async function requireBusiness(): Promise<Business> {
  const session = await requireSession();
  const business = await prisma.business.findUnique({
    where: { userId: session.user!.id },
  });
  if (!business) redirect("/onboarding");
  return business;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!isAdminEmail(session.user?.email)) redirect("/dashboard");
  return session;
}
