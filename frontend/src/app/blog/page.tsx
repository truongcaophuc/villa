import Link from "next/link";
import Image from "next/image";
import { apiGet } from "@/lib/backend";
import { cookies } from "next/headers";
import { getServerT } from "@/lib/i18n/server";
import { resolveStorageUrl } from "@/lib/media";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  categories?: { id: string; name: string; slug: string }[];
  author?: { name?: string; email: string; avatar?: string } | null;
};

const PAGE_SIZE = 12;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; categoryId?: string; tagId?: string; categorySlug?: string; tagSlug?: string }> }) {
  const t = await getServerT();
  const c = await cookies();
  const locale = (c.get("NEXT_LOCALE")?.value || "vi").startsWith("en") ? "en" : "vi";
  const { page, categoryId, tagId, categorySlug, tagSlug } = await searchParams;
  const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
  let items: Post[] = [];
  try {
    const from = (pageNum - 1) * PAGE_SIZE;
    const params: string[] = [`from=${from}`, `to=${from + PAGE_SIZE - 1}`];
    if (categoryId) params.push(`categoryId=${categoryId}`);
    if (tagId) params.push(`tagId=${tagId}`);
    if (categorySlug) params.push(`categorySlug=${categorySlug}`);
    if (tagSlug) params.push(`tagSlug=${tagSlug}`);
    params.push(`locale=${locale}`);
    const data = await apiGet(`/posts?${params.join("&")}`);
    items = data.items || [];
  } catch (e) {
    items = [];
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">{t("blog")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map((p) => {
          const { id, title, slug, excerpt, featured_image, author, published_at } = p;

          return (
            <article
              key={id}
              className="rounded-lg border bg-card shadow-sm overflow-hidden"
            >
              <Link href={`/blog/${slug}`} className="block">
                <Image
                  src={featured_image ? resolveStorageUrl(featured_image) : "/placeholder.svg"}
                  alt={title}
                  width={600}
                  height={360}
                  className="w-full h-48 object-cover"
                  unoptimized
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                    {title}
                  </h2>
                  {excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      <div className="mt-8 flex items-center justify-center gap-4">
        {pageNum > 1 ? (
          <Link
            href={`/blog?page=${pageNum - 1}`}
            className="inline-flex items-center rounded border px-3 py-2 text-sm"
          >
            {t("previous")}
          </Link>
        ) : (
          <span className="inline-flex items-center rounded border px-3 py-2 text-sm text-muted-foreground">
            {t("previous")}
          </span>
        )}
        <span className="text-sm text-muted-foreground">Trang {pageNum}</span>
        {items && items.length >= PAGE_SIZE ? (
          <Link
            href={`/blog?page=${pageNum + 1}`}
            className="inline-flex items-center rounded border px-3 py-2 text-sm"
          >
            {t("next")}
          </Link>
        ) : (
          <span className="inline-flex items-center rounded border px-3 py-2 text-sm text-muted-foreground">
            {t("next")}
          </span>
        )}
      </div>
    </div>
  );
}
