import type { Photo } from "@prisma/client";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return <p className="text-xs text-slate-400">No photos attached.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {photos.map((photo) => (
        <a
          key={photo.id}
          href={photo.url}
          target="_blank"
          rel="noreferrer"
          className="group relative block overflow-hidden rounded-xl bg-slate-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="" className="aspect-square w-full object-cover transition group-hover:scale-105" />
        </a>
      ))}
    </div>
  );
}
