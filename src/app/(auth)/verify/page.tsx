import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 pb-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">✉️</div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Check your email</h1>
        <p className="mt-2 text-sm text-slate-600">
          We sent you a sign-in link. Tap it on this device to continue — you can close this tab.
        </p>
        <p className="mt-6 text-xs text-slate-400">Nothing there? Check spam, or go back and try again.</p>
      </div>
    </div>
  );
}
