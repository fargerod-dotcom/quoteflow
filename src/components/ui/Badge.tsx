import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  QUOTED: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-green-100 text-green-800",
  DECLINED: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {label}
    </span>
  );
}
