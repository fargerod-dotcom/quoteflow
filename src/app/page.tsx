import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-slate-900">QuoteFlow</h1>
      <p className="mt-3 text-base text-slate-600">
        Capture job requests, get an AI-drafted quote in seconds, and book the job —
        all from one link on your website or Google profile.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/login">
          <Button>Get started</Button>
        </Link>
      </div>
    </div>
  );
}
