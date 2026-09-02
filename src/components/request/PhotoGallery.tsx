import type { Photo } from "@prisma/client";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {photos.map((photo) => (
        // eslint-disable-next-line @next/next/no-img-element
        <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
          <img src={photo.url} alt="" className="aspect-square rounded-lg object-cover" />
        </a>
      ))}
    </div>
  );
}
