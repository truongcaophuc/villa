"use client";
import villaData from "@/assets/data.json";
import { useEffect, useRef, useState } from "react";
import { useParams } from 'next/navigation';



type GalleryItem = { url: string; caption?: string };

const Gallery = () => {
  const villas = villaData as any[];
  const params = useParams();
  const { id } = params || {};
  const villa = (villas.find((v) => v.id === id) || villas[0]) as { images: { gallery: GalleryItem[] } };
  const gallery = villa.images?.gallery || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = () => setOpenIndex(null);
  const next = () =>
    setOpenIndex((i) => (i === null ? null : (i + 1) % gallery.length));
  const prev = () =>
    setOpenIndex((i) =>
      i === null ? null : (i - 1 + gallery.length) % gallery.length
    );

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  useEffect(() => {
    window.addEventListener("keydown", escHandler);
    return () => window.removeEventListener("keydown", escHandler);
  }, []);

  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Scroll to top when opening gallery route
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  useEffect(() => {
    if (openIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [openIndex]);
  return (
    <div className="min-h-screen bg-background font-poppins mt-20">
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Thư viện ảnh</h1>
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => window.history.back()}
          >
            Quay lại
          </button>
        </div>

        {/* Thumbnails grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {gallery.map((item, idx) => (
            <button
              key={idx}
              className="group relative"
              onClick={() => setOpenIndex(idx)}
            >
              <img
                src={item.url}
                alt={item.caption || `Ảnh ${idx + 1}`}
                className="w-full h-40 md:h-48 object-cover rounded-lg"
              />
              {item.caption && (
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                  {item.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {openIndex !== null && gallery[openIndex] && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto p-4">
          <button
            className="absolute top-4 right-4 rounded-md bg-white/90 px-3 py-1 text-sm"
            onClick={close}
          >
            Đóng
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 w-10 h-10 flex items-center justify-center text-xl"
            onClick={prev}
            aria-label="Ảnh trước"
          >
            ‹
          </button>
          <figure className="max-w-[90vw]">
            <img
              ref={imgRef}
              src={gallery[openIndex].url}
              alt={gallery[openIndex].caption || `Ảnh ${openIndex + 1}`}
              className="w-auto h-auto max-w-[90vw] max-h-[80vh] object-contain"
            />
            {gallery[openIndex].caption && (
              <figcaption className="mt-2 text-center text-white/90 text-sm">
                {gallery[openIndex].caption}
              </figcaption>
            )}
          </figure>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 w-10 h-10 flex items-center justify-center text-xl"
            onClick={next}
            aria-label="Ảnh tiếp theo"
          >
            ›
          </button>
        </div>
      )}

    </div>
  );
};

export default Gallery;
