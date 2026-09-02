"use server";

import { signIn } from "@/lib/auth";

export async function requestSignInLink(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/onboarding");

  await signIn("resend", { email, redirectTo: callbackUrl });
}
