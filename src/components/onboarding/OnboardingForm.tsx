"use client";

import { useFormState } from "react-dom";
import { submitBusiness, type OnboardingState } from "@/actions/onboarding";

/**
 * Client shell around the (server-rendered) onboarding fields so validation
 * errors from the action render inline instead of as Next's generic error page.
 */
export function OnboardingForm({ children, className }: { children: React.ReactNode; className?: string }) {
  const [state, formAction] = useFormState<OnboardingState, FormData>(submitBusiness, { error: null });
  return (
    <form action={formAction} className={className}>
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      {children}
    </form>
  );
}
