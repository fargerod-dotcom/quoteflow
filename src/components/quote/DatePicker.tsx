"use client";

import { formatDate } from "@/lib/utils";

export function DatePicker({ dates }: { dates: Date[] }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-slate-700">Pick a date</legend>
      {dates.map((date) => {
        const value = date.toISOString();
        return (
          <label
            key={value}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
          >
            <input type="radio" name="scheduledDate" value={value} required />
            {formatDate(date)}
          </label>
        );
      })}
    </fieldset>
  );
}
