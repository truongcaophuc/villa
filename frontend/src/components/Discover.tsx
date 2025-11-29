"use client";
import villaData from "@/assets/data.json";
import { Button } from "@/components/ui/button";
import img1 from "@/assets/img_1.jpg";
import img2 from "@/assets/img_2.jpg";
import img3 from "@/assets/img_3.jpg";
import Image from "next/image";
import { useRouter } from "next/navigation";
function getAvg(v: any): number {
  const avg = Number(v.rating?.average ?? v.ratingAverage ?? v.avgRating ?? 0);
  return isNaN(avg) ? 0 : avg;
}

function getThumb(v: any): string {
  return (
    v.images?.thumbnail ||
    v.images?.thumnail ||
    v.images?.gallery?.[0]?.url ||
    "/placeholder.svg"
  );
}

export default function Discover() {
  const router = useRouter();
  const villas = (villaData as any[]).slice();
  const top3 = villas.sort((a, b) => getAvg(b) - getAvg(a)).slice(0, 3);

  if (top3.length === 0) return null;

  return (
    <div>
      <section className="px-10 py-16 bg-[#F5F5F5] to-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-primary mb-8">
            Discover Top-Rated Villas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {top3.map((v) => {
              const avg = getAvg(v);
              const count = Number(
                v.rating?.total_reviews ??
                  v.total_reviews ??
                  v.reviews?.length ??
                  0
              );
              const stars =
                "★".repeat(Math.max(0, Math.min(5, Math.floor(avg)))) +
                "☆".repeat(5 - Math.max(0, Math.min(5, Math.floor(avg))));

              return (
                <div
                  key={v.id}
                  className="group"
                  onClick={() => router.push(`/villa/${v.id}`)}
                >
                  <div className="relative overflow-hidden rounded-lg shadow-sm">
                    {/* Ảnh villa */}
                    <Image
                      width={400}
                      height={250}
                      src={getThumb(v)}
                      alt={v.title || v.name}
                      className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay luôn nằm dưới */}
                    <div className="absolute left-0 right-0 bottom-0 p-4 bg-black/45 backdrop-blur-sm text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold line-clamp-1">
                            {v.name}
                          </h3>
                          <p className="text-xs opacity-85">
                            <span className="text-yellow-400">{stars}</span>
                            <span className="ml-2">
                              {avg ? avg.toFixed(2) : "N/A"}
                            </span>
                            <span className="ml-1 opacity-75">({count})</span>
                          </p>
                        </div>
                        <Button variant="primary" size="sm">
                          Discover
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Image src={img1} alt="banner" className="w-full" />
        <Image src={img2} alt="banner" className="w-full" />
        <Image src={img3} alt="banner" className="w-full" />
      </div>
    </div>
  );
}
