import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  async function loginAction(formData: FormData) {
    "use server";
    await signIn("resend", {
      email: formData.get("email"),
      redirectTo: searchParams?.callbackUrl ?? "/onboarding",
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold text-slate-900">Sign in to QuoteFlow</h1>
      <p className="mt-2 text-sm text-slate-600">
        We&rsquo;ll email you a link — no password needed.
      </p>
      <form action={loginAction} className="mt-6 flex flex-col gap-3">
        <Input
          type="email"
          name="email"
          required
          placeholder="you@yourbusiness.com"
          autoComplete="email"
        />
        <Button type="submit">Send me a sign-in link</Button>
      </form>
    </div>
  );
}
