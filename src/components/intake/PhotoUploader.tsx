"use client";

import { useState } from "react";
import { MAX_PHOTOS } from "@/lib/constants";

export function PhotoUploader() {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > MAX_PHOTOS) {
      setError(`You can attach up to ${MAX_PHOTOS} photos — only the first ${MAX_PHOTOS} will be used.`);
    } else {
      setError(null);
    }
    setPreviews(files.slice(0, MAX_PHOTOS).map((f) => URL.createObjectURL(f)));
  }

  return (
    <div>
      <input
        type="file"
        name="photos"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleChange}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
      />
      {error && <p className="mt-1 text-xs text-amber-600">{error}</p>}
      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {previews.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="aspect-square rounded-lg object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}
