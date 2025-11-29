export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import ArticleTOC from "@/components/ArticleTOC";
import CommentAuthGate from "@/components/CommentAuthGate";
import CommentsSection from "@/components/CommentsSection";
import {Badge} from "@/components/ui/badge";
import { apiGet } from "@/lib/backend";
import { getServerT } from "@/lib/i18n/server";
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image?: string | null;
  categories?: { id: string; name: string; slug: string }[];
  tags?: { id: string; name: string; slug: string }[];
  author?: { id: string; name: string; avatar?: string | null } | null;
  published_at?: string | null;
  created_at: string | null;
};

type RelatedPost = {
  id: string;
  title: string;
  slug: string;
  featured_image?: string | null;
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getServerT();
  const { slug } = await params;
  let entry: Post | null = null;
  try {
    entry = await apiGet(`/posts/${slug}`);
  } catch {}
  if (!entry) {
    return (
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold">Bài viết không tồn tại</h1>
      </div>
    );
  }
  const a = entry;
  const toSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const headings: { id: string; text: string; level: number }[] = [];
  {
    const html = a.content || "";
    const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(html)) !== null) {
      const level = parseInt(m[1], 10);
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      const id = toSlug(text);
      headings.push({ id, text, level });
    }
  }

  const counters = [0, 0, 0, 0, 0, 0];
  const headingsWithNumber = headings.map((h) => {
    const level = Math.max(1, Math.min(6, h.level));
    counters[level - 1]++;
    for (let i = level; i < 6; i++) counters[i] = 0;
    const num = counters.slice(0, level).join(".");
    return { ...h, num };
  });

  const primaryCat = (a.categories || [])[0];
  let related: RelatedPost[] = [];
  let relatedTotal = 0;
  try {
    if (primaryCat) {
      const r = await apiGet(`/posts?categoryId=${primaryCat.id}`);
      const items: Post[] = r.items || [];
      relatedTotal = r.total || items.length || 0;
      related = items
        .filter((p) => p.slug !== a.slug)
        .slice(0, 5)
        .map((p) => ({ id: p.id, title: p.title, slug: p.slug, featured_image: p.featured_image }));
    }
  } catch {}

  return (
    <div className="px-[150px] py-10 mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-20">
        <article className="max-w-none">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-muted">
            {a.author?.avatar ? (
              <Image
                src={a.author.avatar}
                alt={a.author.name || ""}
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-base font-medium">
                {(a.author?.name || "").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{a.author?.name}</div>
              <div className="text-xs text-muted-foreground">
                {(a?.created_at || "").slice(0, 19).replace("T", " ")}
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">{a.title}</h1>
          {(a.categories && a.categories.length > 0) ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {a.categories.map((c) => (
                <Link key={c.id} href={{ pathname: "/blog", query: { categorySlug: c.slug } }}>
                  <Badge variant="outline">{c.name}</Badge>
                </Link>
              ))}
            </div>
          ) : null}
          <div
            className="prose max-w-none mt-10"
            dangerouslySetInnerHTML={{ __html: a.content || "" }}
          />
          {(a.tags && a.tags.length > 0) ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {a.tags.map((t) => (
                <Link key={t.id} href={{ pathname: "/blog", query: { tagSlug: t.slug } }}>
                  <Badge variant="secondary">#{t.name}</Badge>
                </Link>
              ))}
            </div>
          ) : null}
        </article>
        <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
          <ArticleTOC
            items={headingsWithNumber}
            className="rounded-lg border p-4"
          />
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-3">{t("relatedPosts")}</h3>
            <ul className="space-y-3">
              {related.map((rp) => (
                <li key={rp.id} className="flex items-center gap-3">
                  {rp.featured_image && (
                    <Image
                      src={rp.featured_image}
                      alt={rp.title}
                      width={60}
                      height={40}
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <Link href={`/blog/${rp.slug}`} className="text-sm hover:underline">
                    {rp.title}
                  </Link>
                </li>
              ))}
            </ul>
            {primaryCat && relatedTotal > 5 ? (
              <div className="mt-3">
                <Link href={{ pathname: "/blog", query: { categorySlug: primaryCat.slug } }} className="text-sm underline">{t("seeMore")}</Link>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">{t("comments")}</h2>
        <CommentAuthGate>
          <CommentsSection postId={entry.id} />
        </CommentAuthGate>
      </section>
    </div>
  );
}
