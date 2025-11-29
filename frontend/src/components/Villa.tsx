"use client";
import { useState } from "react";
import villaData from "@/assets/data.json";
import Image from "next/image";
import Link from "next/link";
export default function Villa() {
  const villas = villaData as any[];
  const total = villas.length;
  const windowSize = Math.min(4, total);
  const [startIndex, setStartIndex] = useState(0);
  const ITEM_WIDTH = 240; // width of each card
  const GAP = 16; // gap-4 = 16px
  const STEP = ITEM_WIDTH + GAP;
  const VIEWPORT = ITEM_WIDTH * 4 + GAP * 3; // 1008px
  const DURATION = 300; // ms
  const [offset, setOffset] = useState(-STEP);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const goPrev = () => {
    if (total === 0 || isAnimating) return;
    setIsAnimating(true);
    setTransitionEnabled(true);
    setOffset(0);
    setTimeout(() => {
      // Disable transition to reset position without visible jump
      setTransitionEnabled(false);
      setStartIndex((prev) => (prev - 1 + total) % total);
      setOffset(-STEP);
      setIsAnimating(false);
      // Re-enable transition for next interactions
      setTimeout(() => setTransitionEnabled(true), 100);
    }, DURATION);
  };
  const goNext = () => {
    if (total === 0 || isAnimating) return;
    setIsAnimating(true);
    setTransitionEnabled(true);
    setOffset(-2 * STEP);
    setTimeout(() => {
      // Disable transition to reset position without visible jump
      setTransitionEnabled(false);
      setStartIndex((prev) => (prev + 1) % total);
      setOffset(-STEP);
      setIsAnimating(false);
      // Re-enable transition for next interactions
      setTimeout(() => setTransitionEnabled(true), 100);
    }, DURATION);
  };
  return (
    <section className="px-4 py-8 bg-[#f5f5f5] text-primary z-50">
      <div className="relative">
        {/* Prev/Next buttons */}
        <button
          aria-label="Trước"
          onClick={goPrev}
          className="hidden md:flex absolute left-20 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white rounded-full w-10 h-10 items-center justify-center shadow text-[#17302c] text-4xl"
        >
          ‹
        </button>
        <button
          aria-label="Tiếp"
          onClick={goNext}
          className="hidden md:flex absolute right-20 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white rounded-full w-10 h-10 items-center justify-center shadow text-[#17302c] text-4xl"
        >
          ›
        </button>
        <div
          className="mx-auto overflow-hidden pb-2"
          style={{ width: `${VIEWPORT}px` }}
        >
          <div
            className="flex flex-nowrap gap-4"
            style={{
              transform: `translateX(${offset}px)`,
              transition: transitionEnabled
                ? `transform ${DURATION}ms ease-out`
                : "none",
            }}
          >
            {Array.from({ length: windowSize + 2 }).map((_, j) => {
              const i = j - 1; // left clone (-1), window 0..3, right clone (4)
              const v = villas[(((startIndex + i) % total) + total) % total];
              return (
                <Link
                  key={`${v.id}-${j}`}
                  href={`/villa/${v.id}`}
                  className="min-w-[240px] w-[240px]"
                >
                  <div className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <Image
                      width={240}
                      height={160}
                      src={
                        v.images?.thumbnail ||
                        v.images?.thumnail ||
                        v.images?.gallery?.[0]?.url ||
                        v.images?.gallery?.[0]?.caption ||
                        "/placeholder.svg"
                      }
                      alt={v.title || v.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3 bg-white text-[#17302c]">
                      {(() => {
                        const avg = Number(
                          v.rating?.average ??
                            v.ratingAverage ??
                            v.avgRating ??
                            0
                        );
                        const count = Number(
                          v.rating?.total_reviews ??
                            v.total_reviews ??
                            v.reviews?.length ??
                            0
                        );
                        const filled = Math.max(
                          0,
                          Math.min(5, Math.floor(avg))
                        );
                        const stars =
                          "★".repeat(filled) + "☆".repeat(5 - filled);
                        return (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-yellow-500 leading-none">
                              {stars}
                            </span>
                            <span className="leading-none">
                              {avg ? avg.toFixed(2) : "N/A"}
                            </span>
                            <span className="text-muted-foreground leading-none">
                              ({count} đánh giá)
                            </span>
                          </div>
                        );
                      })()}
                      <p className="font-semibold text-sm line-clamp-2">
                        {v.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {v.location?.city || "Địa điểm"}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#17302c] text-white hover:bg-[#1f3d38] text-xs">
                          Discover
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
