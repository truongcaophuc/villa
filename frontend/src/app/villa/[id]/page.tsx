"use client";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import Link from "next/link";
import MapEmbed from "@/components/MapEmbed";
import villaData from "@/assets/data.json";
import renderIcon from "@/lib/renderIcon";

type GalleryItem = { url: string; caption?: string };
type AmenityItem = { icon?: string; text: string };
type AmenityCategory = { category: string; items: AmenityItem[] };
type Highlight = { icon?: string; text: string; description?: string };
type Review = {
  name: string;
  avatar: string;
  rating: string;
  time: string;
  content: string;
};
type Villa = {
  id: string;
  name: string;
  type: string;
  location: {
    address: string;
    city: string;
    district: string;
    country: string;
    google_map_url?: string;
    latitude?: number;
    longitude?: number;
  };
  capacity: {
    max_guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  rating: {
    average: number;
    total_reviews: number;
    highlight?: string;
    description?: string;
  };
  host: {
    name: string;
    role?: string;
    experience_years?: number;
    avatar_url?: string;
  };
  highlights: Highlight[];
  description: { short: string; details: string[]; note?: string };
  amenities: AmenityCategory[];
  images: {
    cover?: string;
    thumbnail?: string;
    thumnail?: string;
    gallery: GalleryItem[];
  };
  reviews?: Review[];
};
const VillaDetail = () => {
  const villas = villaData as any[];
  const params = useParams();
  const { id } = params || {};
  const data = (villas.find((v) => v.id === id) || villas[0]) as Villa;

  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<
    Record<number, boolean>
  >({});
  const visibleReviews = (data.reviews || []).slice(0, 6);

  const [locExpanded, setLocExpanded] = useState(false);
  useEffect(() => {
    if (showAmenitiesModal || showReviewsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showAmenitiesModal, showReviewsModal]);
  return (
    <div>
      <div className="min-h-screen bg-background font-poppins mt-20 px-[120px]">
        <div className=" py-6 font-[600] text-2xl">{data.name}</div>
        {/* Gallery */}
        <section className="">
          {data.images?.gallery && data.images.gallery.length > 0 && (
            <div className="relative">
              {/* Hình chữ nhật chia làm 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[480px]">
                {/* Bên trái: 1 ảnh lớn */}
                <figure className="relative w-full h-[240px] md:h-full group">
                  <img
                    src={
                      data.images.gallery[0]?.url ||
                      (data.images.gallery[0] as any)?.caption
                    }
                    alt={
                      (data.images.gallery[0] as any)?.name ||
                      (data.images.gallery[0] as any)?.caption ||
                      "Ảnh lớn"
                    }
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Link
                    href={`/villa/${data.id}/gallery`}
                    className="absolute inset-0 z-10"
                  >
                    <div className="w-full h-full rounded-lg bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white font-medium">
                        Xem tất cả ảnh
                      </span>
                    </div>
                  </Link>
                </figure>
                {/* Bên phải: chia làm 4 ảnh (2x2) */}
                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[240px] md:h-full">
                  {data.images.gallery
                    .slice(1, 5)
                    .map((item: GalleryItem, idx: number) => (
                      <figure
                        key={idx}
                        className="relative w-full h-full group"
                      >
                        <img
                          src={item.url}
                          alt={item.caption || `Ảnh ${idx + 2}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Link
                          href={`/villa/${data.id}/gallery`}
                          className="absolute inset-0 z-10"
                        >
                          <div className="w-full h-full rounded-lg bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span className="text-white font-medium">
                              Xem tất cả ảnh
                            </span>
                          </div>
                        </Link>
                      </figure>
                    ))}
                </div>
              </div>
            </div>
          )}
        </section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-5">
          <div className=" md:col-span-2">
            {/* Title & summary */}
            <section className="py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 md:max-w-2xl">
                  <h1 className="text-3xl md:text-2xl font-bold">
                    Toàn bộ biệt thự tại {data.location.address}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {data.type} • {data.capacity.bedrooms} phòng ngủ •{" "}
                    {data.capacity.max_guests} khách • {data.capacity.beds}{" "}
                    giường • {data.capacity.bathrooms} phòng tắm
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.location.address} • {data.location.city}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <span className="font-semibold">
                      {data.rating.average.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      • {data.rating.total_reviews} đánh giá
                    </span>
                  </div>
                </div>
              </div>
            </section>
            {/* Highlights */}
            <section className="py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(data.highlights || []).map((h: Highlight, i: number) => (
                  <div
                    key={i}
                    className="flex flex-row border rounded-lg p-4 gap-4 items-center"
                  >
                    {renderIcon(h.icon || "")}
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold">{h.text}</div>
                      {h.description && (
                        <p className="text-sm text-muted-foreground">
                          {h.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {/* Amenities (preview 10 items, 2 columns). Full list in modal */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Tiện nghi</h2>
                {data.amenities && data.amenities.length > 0 && (
                  <button
                    className="rounded-md border px-3 py-1 text-sm"
                    onClick={() => setShowAmenitiesModal(true)}
                  >
                    Hiển thị tất cả
                  </button>
                )}
              </div>
              {(() => {
                const amenitiesFlat = (data.amenities || []).flatMap(
                  (cat) => cat.items
                );
                const preview = amenitiesFlat.slice(0, 10);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {preview.map((it: AmenityItem, j: number) => (
                      <span key={j} className="flex items-center gap-2">
                        {renderIcon(it.icon || "")}
                        <span>{it.text}</span>
                      </span>
                    ))}
                  </div>
                );
              })()}
            </section>
          </div>
          <div className="w-full sticky top-[150px] border rounded-lg p-4 shadow-sm self-start">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">2.650.000₫</span>
              <span className="text-sm text-muted-foreground">/ đêm</span>
            </div>
            <button className="mt-4 w-full rounded-md bg-primary text-primary-foreground py-2">
              Đặt lịch ngay
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Liên hệ để nhận ưu đãi theo số lượng đêm đặt.
            </p>
          </div>
        </div>
        {/* Host */}
        <section className="py-8">
          <h2 className="text-2xl font-bold mb-4">Chủ nhà</h2>
          <div className="flex items-center gap-4">
            {data.host.avatar_url ? (
              <img
                src={data.host.avatar_url}
                alt={data.host.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted" />
            )}
            <div>
              <p className="font-semibold">{data.host.name}</p>
              <p className="text-sm text-muted-foreground">
                {data.host.role || "Chủ nhà"}
                {data.host.experience_years
                  ? ` • ${data.host.experience_years} năm kinh nghiệm`
                  : ""}
              </p>
            </div>
          </div>
        </section>
        {/* Reviews */}
        {data.reviews && data.reviews.length > 0 && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Đánh giá từ khách</h2>
              <button
                className="rounded-md border px-3 py-1 text-sm"
                onClick={() => setShowReviewsModal(true)}
              >
                Hiển thị tất cả
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {(data.reviews || [])
                .slice(0, 6)
                .map((r: Review, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4 mr-20">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.time} • ⭐ {r.rating}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm text-muted-foreground whitespace-pre-line ${
                        expandedReviews[idx] ? "" : "line-clamp-3"
                      }`}
                    >
                      {r.content}
                    </p>
                    <button
                      className="mt-2 text-xs rounded-md border px-2 py-1"
                      onClick={() =>
                        setExpandedReviews((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                    >
                      {expandedReviews[idx] ? "Thu gọn" : "Hiển thị thêm"}
                    </button>
                  </div>
                ))}
            </div>
          </section>
        )}
        {/* Location */}
        <section className=" py-8">
          <h2 className="text-2xl font-bold mb-4">Vị trí trên bản đồ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <MapEmbed
                lat={data.location?.latitude || 0}
                lng={data.location?.longitude || 0}
              />
              {data.location?.google_map_url && (
                <p className="mt-2 text-sm">
                  <a
                    href={data.location.google_map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    Mở trên Google Maps
                  </a>
                </p>
              )}
            </div>
            <div className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Thông tin vị trí</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {(data as any).locationInfo?.description?.slice(
                  0,
                  locExpanded ? undefined : 220
                ) || ""}
                {!locExpanded &&
                (data as any).locationInfo?.description &&
                (data as any).locationInfo?.description.length > 220
                  ? "…"
                  : ""}
              </p>
              {(data as any).locationInfo?.transportation && (
                <div className={`mt-2 ${locExpanded ? "block" : "hidden"}`}>
                  <h4 className="font-semibold text-sm mb-1">Di chuyển</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {(data as any).locationInfo.transportation}
                  </p>
                </div>
              )}
              <button
                className="mt-3 text-sm rounded-md border px-3 py-1"
                onClick={() => setLocExpanded((v) => !v)}
              >
                {locExpanded ? "Thu gọn" : "Hiển thị thêm"}
              </button>
            </div>
          </div>
        </section>

        {/* Amenities Modal */}
        {showAmenitiesModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            onClick={() => setShowAmenitiesModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg max-w-4xl w-[92vw] max-h-[80vh] overflow-y-auto p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Tất cả tiện nghi</h3>
                <button
                  className="rounded-md border px-3 py-1 text-sm"
                  onClick={() => setShowAmenitiesModal(false)}
                >
                  Đóng
                </button>
              </div>
              <div className="space-y-6">
                {(data.amenities || []).map(
                  (cat: AmenityCategory, idx: number) => (
                    <div key={idx}>
                      <h4 className="font-semibold mb-2">{cat.category}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {cat.items.map((it: AmenityItem, j: number) => (
                          <span key={j} className="flex items-center gap-2">
                            {renderIcon(it.icon || "")}
                            <span>{it.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
        {/* Reviews Modal */}
        {showReviewsModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            onClick={() => setShowReviewsModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg max-w-4xl w-[92vw] max-h-[80vh] overflow-y-auto p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Tất cả đánh giá</h3>
                <button
                  className="rounded-md border px-3 py-1 text-sm"
                  onClick={() => setShowReviewsModal(false)}
                >
                  Đóng
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {(data.reviews || []).map((r: Review, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.time} • ⭐ {r.rating}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm text-muted-foreground whitespace-pre-line ${
                        expandedReviews[idx] ? "" : "line-clamp-3"
                      }`}
                    >
                      {r.content}
                    </p>
                    <button
                      className="mt-2 text-xs rounded-md border px-2 py-1"
                      onClick={() =>
                        setExpandedReviews((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                    >
                      {expandedReviews[idx] ? "Thu gọn" : "Hiển thị thêm"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VillaDetail;
