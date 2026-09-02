import Link from "next/link";
import { requestSignInLink } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { TRIAL_DAYS } from "@/lib/constants";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 pb-24">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in or create your account</h1>
          <p className="mt-2 text-sm text-slate-600">
            We&rsquo;ll email you a one-tap link — no password to remember.
          </p>
          <form action={requestSignInLink} className="mt-6 flex flex-col gap-3">
            <input type="hidden" name="callbackUrl" value={searchParams?.callbackUrl ?? "/onboarding"} />
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                placeholder="you@yourbusiness.com"
                autoComplete="email"
                inputMode="email"
              />
            </div>
            <Button type="submit" size="lg">
              Email me a sign-in link
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          New here? Same button — your {TRIAL_DAYS}-day free trial starts after a 2-minute setup.
        </p>
      </div>
    </div>
  );
}
