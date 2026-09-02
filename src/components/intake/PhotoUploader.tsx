"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_PHOTOS, MAX_PHOTO_BYTES } from "@/lib/constants";

type Picked = { file: File; preview: string };

/**
 * Lets the customer add photos across several picks (camera, then library…)
 * and remove individual ones. The chosen files are mirrored into a hidden
 * `name="photos"` input via DataTransfer so the plain <form action> submit
 * still carries them.
 */
export function PhotoUploader() {
  const [picked, setPicked] = useState<Picked[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hiddenRef.current) return;
    const dt = new DataTransfer();
    picked.forEach((p) => dt.items.add(p.file));
    hiddenRef.current.files = dt.files;
  }, [picked]);

  useEffect(() => {
    return () => picked.forEach((p) => URL.revokeObjectURL(p.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(list: FileList | null) {
    const incoming = Array.from(list ?? []);
    if (incoming.length === 0) return;

    const tooBig = incoming.filter((f) => f.size > MAX_PHOTO_BYTES);
    const ok = incoming.filter((f) => f.size <= MAX_PHOTO_BYTES);

    setPicked((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const accepted = ok.slice(0, Math.max(0, room));
      if (tooBig.length > 0) {
        setError(`${tooBig.length === 1 ? "One photo is" : `${tooBig.length} photos are`} over 8MB and was skipped.`);
      } else if (ok.length > room) {
        setError(`You can attach up to ${MAX_PHOTOS} photos.`);
      } else {
        setError(null);
      }
      return [...prev, ...accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }))];
    });
  }

  function remove(index: number) {
    setPicked((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setError(null);
  }

  const full = picked.length >= MAX_PHOTOS;

  return (
    <div>
      {/* Real form field — hidden, kept in sync with `picked` */}
      <input ref={hiddenRef} type="file" name="photos" multiple className="hidden" tabIndex={-1} aria-hidden />
      {/* Pickers — not named, so they never submit on their own */}
      <input
        ref={pickerRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {picked.map((p, i) => (
          <div key={p.preview} className="relative aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt="" className="h-full w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove photo"
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow"
            >
              ×
            </button>
          </div>
        ))}

        {!full && (
          <>
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600 sm:hidden"
            >
              <CameraIcon />
              <span className="text-[11px] font-medium">Camera</span>
            </button>
            <button
              type="button"
              onClick={() => pickerRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600"
            >
              <PlusIcon />
              <span className="text-[11px] font-medium">{picked.length === 0 ? "Add photos" : "Add more"}</span>
            </button>
          </>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {picked.length === 0
          ? "A photo of the problem helps a lot — the quote will be more accurate."
          : `${picked.length} of ${MAX_PHOTOS} photos`}
      </p>
      {error && <p className="mt-1 text-xs text-amber-600">{error}</p>}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
