"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CopyButton({
  value,
  label = "Copy link",
  variant = "secondary",
  className,
}: {
  value: string;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (http, iframes) — fall back to a prompt the user can copy from.
      window.prompt("Copy this link:", value);
    }
  }

  return (
    <Button type="button" variant={variant} onClick={copy} className={className}>
      {copied ? "Copied ✓" : label}
    </Button>
  );
}
