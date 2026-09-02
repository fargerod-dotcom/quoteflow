import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  LOW: "bg-red-100 text-red-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-green-100 text-green-800",
};

const LABELS: Record<string, string> = {
  LOW: "Low confidence — check this quote carefully",
  MEDIUM: "Medium confidence",
  HIGH: "High confidence",
};

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", STYLES[confidence])}>
      {LABELS[confidence] ?? confidence}
    </span>
  );
}
