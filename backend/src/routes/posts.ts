import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth";
import { parsePagination } from "../helpers/pagination";
import { supabaseAdmin } from "../config/supabase";

export const postsRouter = Router();

postsRouter.get("/", async (req, res, next) => {
  try {
    const { supabase } = req as any;
    const c = supabase || supabaseAdmin();
    const { from, to } = parsePagination(req.query);
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const categorySlug = typeof req.query.categorySlug === "string" ? req.query.categorySlug : undefined;
    const tagId = typeof req.query.tagId === "string" ? req.query.tagId : undefined;
    const tagSlug = typeof req.query.tagSlug === "string" ? req.query.tagSlug : undefined;

    let filterPostIds: string[] | null = null;
    let catIdFinal = categoryId;
    let tagIdFinal = tagId;

    if (!catIdFinal && categorySlug) {
      const cr = await c.from("categories").select("id").eq("slug", categorySlug).limit(1);
      catIdFinal = (cr.data && cr.data[0] && cr.data[0].id) || undefined;
    }
    if (!tagIdFinal && tagSlug) {
      const tr = await c.from("tags").select("id").eq("slug", tagSlug).limit(1);
      tagIdFinal = (tr.data && tr.data[0] && tr.data[0].id) || undefined;
    }

    if (catIdFinal) {
      const pc = await c.from("post_categories").select("post_id").eq("category_id", catIdFinal);
      const ids = Array.from(new Set((pc.data || []).map((x: any) => x.post_id))) as string[];
      filterPostIds = ids;
    }
    if (tagIdFinal) {
      const pt = await c.from("post_tags").select("post_id").eq("tag_id", tagIdFinal);
      const ids = Array.from(new Set((pt.data || []).map((x: any) => x.post_id))) as string[];
      filterPostIds = filterPostIds ? filterPostIds.filter((id) => ids.includes(id)) : ids;
    }

    let q = c.from("posts").select("id,title,slug,excerpt,featured_image,meta_title,meta_description,published_at,is_published,author_id,created_at", { count: "exact" }).order("published_at", { ascending: false });
    if (filterPostIds && filterPostIds.length) q = q.in("id", filterPostIds);
    if (filterPostIds && filterPostIds.length === 0) {
      return res.json({ items: [], total: 0 });
    }
    const r = await q.range(from, to);
    res.json({ items: r.data || [], total: r.count || 0 });
  } catch (e) { next(e); }
});

postsRouter.get("/with-relations", async (req, res, next) => {
  try {
    const { supabase } = req as any;
    const c = supabase || supabaseAdmin();
    const { from, to } = parsePagination(req.query);
    const r = c ? await c.from("posts").select("id,title,slug,excerpt,featured_image,meta_title,meta_description,published_at,is_published,author_id,created_at", { count: "exact" }).order("published_at", { ascending: false }).range(from, to) : { data: [], count: 0 };
    const items = (r.data || []) as any[];
    const postIds = items.map((p) => p.id);
    const authorIds = Array.from(new Set(items.map((p) => p.author_id).filter(Boolean)));
    const tagsMap: Record<string, { id: string; name: string; slug: string }[]> = {};
    const catsMap: Record<string, { id: string; name: string; slug: string }[]> = {};

    if (postIds.length) {
      const pt = await c.from("post_tags").select("post_id,tag_id").in("post_id", postIds);
      const pc = await c.from("post_categories").select("post_id,category_id").in("post_id", postIds);
      const tagIds = Array.from(new Set((pt.data || []).map((x: any) => x.tag_id)));
      const catIds = Array.from(new Set((pc.data || []).map((x: any) => x.category_id)));
      const tags = tagIds.length ? await c.from("tags").select("id,name,slug").in("id", tagIds) : { data: [] };
      const cats = catIds.length ? await c.from("categories").select("id,name,slug").in("id", catIds) : { data: [] };
      const tagById: Record<string, any> = {};
      const catById: Record<string, any> = {};
      (tags.data || []).forEach((t: any) => { tagById[t.id] = t; });
      (cats.data || []).forEach((c1: any) => { catById[c1.id] = c1; });
      (pt.data || []).forEach((x: any) => {
        const arr = tagsMap[x.post_id] || (tagsMap[x.post_id] = []);
        const t = tagById[x.tag_id];
        if (t) arr.push(t);
      });
      (pc.data || []).forEach((x: any) => {
        const arr = catsMap[x.post_id] || (catsMap[x.post_id] = []);
        const c2 = catById[x.category_id];
        if (c2) arr.push(c2);
      });
    }

    const authors = authorIds.length ? await c.from("users").select("id,name,email,avatar").in("id", authorIds) : { data: [] };
    const authorById: Record<string, any> = {};
    (authors.data || []).forEach((u: any) => { authorById[u.id] = u; });

    const full = items.map((p) => ({
      ...p,
      tags: tagsMap[p.id] || [],
      categories: catsMap[p.id] || [],
      author: p.author_id ? authorById[p.author_id] || null : null,
    }));
    res.json({ items: full, total: r.count || 0 });
  } catch (e) { next(e); }
});

postsRouter.get("/:slug", async (req, res, next) => {
  try {
    const { supabase } = req as any;
    const c = supabase || supabaseAdmin();
  const r = await c
    .from("posts")
    .select(
      "id,title,slug,content,featured_image,meta_title,meta_description,published_at,is_published,author_id,created_at"
    )
    .eq("slug", req.params.slug)
    .limit(1);
  const row = (r.data && r.data[0]) || null;
  if (!row) return res.json(null);
  let author: any = null;
  if (row.author_id) {
    const au = await c.from("users").select("id,name,email,avatar").eq("id", row.author_id).limit(1);
    author = (au.data && au.data[0]) || null;
  }
  let categories: any[] = [];
  let tags: any[] = [];
  {
    const pt = await c.from("post_tags").select("tag_id").eq("post_id", row.id);
    const pc = await c.from("post_categories").select("category_id").eq("post_id", row.id);
    const tagIds = Array.from(new Set((pt.data || []).map((x: any) => x.tag_id)));
    const catIds = Array.from(new Set((pc.data || []).map((x: any) => x.category_id)));
    const tgs = tagIds.length ? await c.from("tags").select("id,name,slug").in("id", tagIds) : { data: [] };
    const cats = catIds.length ? await c.from("categories").select("id,name,slug").in("id", catIds) : { data: [] };
    tags = (tgs.data || []);
    categories = (cats.data || []);
  }
  res.json({ ...row, author, categories, tags });
  } catch (e) { next(e); }
});

postsRouter.use(authenticate);

postsRouter.post("/", requireRole("writer"), async (req, res, next) => {
  try {
    const user = (req as any).user;
    const supabase = (req as any).supabase;
    const admin = supabaseAdmin();
    const body = z.object({ title: z.string().min(1), slug: z.string().min(1), excerpt: z.string().optional(), content: z.string().min(1), featured_image: z.string().url().optional(), meta_title: z.string().optional(), meta_description: z.string().optional(), published_at: z.string().datetime().optional(), is_published: z.boolean().optional(), tag_ids: z.array(z.string().uuid()).optional(), category_ids: z.array(z.string().uuid()).optional() }).parse(req.body);
    const insertPayload = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      featured_image: body.featured_image,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      published_at: body.published_at,
      is_published: body.is_published,
      author_id: user.id,
    };
    const { data, error } = await supabase.from("posts").insert(insertPayload).select().limit(1);
    console.log("data là ",data)
    console.log("error là ",error)
    if (error) return res.status(400).json({ code: "create_failed" });
    const created = (data && data[0]) || null;
    if (created) {
      if (body.tag_ids?.length) {
        await admin.from("post_tags").insert(body.tag_ids.map((tid) => ({ post_id: created.id, tag_id: tid })));
      }
      if (body.category_ids?.length) {
        await admin.from("post_categories").insert(body.category_ids.map((cid) => ({ post_id: created.id, category_id: cid })));
      }
    }
    res.json(created);
  } catch (e) { next(e); }
});

postsRouter.patch("/:id", requireRole("editor"), async (req, res, next) => {
  try {
    const supabase = (req as any).supabase;
    const admin = supabaseAdmin();
    const body = z.object({ title: z.string().min(1).optional(), slug: z.string().min(1).optional(), excerpt: z.string().optional(), content: z.string().optional(), featured_image: z.string().url().optional(), meta_title: z.string().optional(), meta_description: z.string().optional(), published_at: z.string().datetime().optional(), is_published: z.boolean().optional(), tag_ids: z.array(z.string().uuid()).optional(), category_ids: z.array(z.string().uuid()).optional() }).parse(req.body);
    const updatePayload: Record<string, unknown> = {};
    if (typeof body.title !== "undefined") updatePayload.title = body.title;
    if (typeof body.slug !== "undefined") updatePayload.slug = body.slug;
    if (typeof body.excerpt !== "undefined") updatePayload.excerpt = body.excerpt;
    if (typeof body.content !== "undefined") updatePayload.content = body.content;
    if (typeof body.featured_image !== "undefined") updatePayload.featured_image = body.featured_image;
    if (typeof body.meta_title !== "undefined") updatePayload.meta_title = body.meta_title;
    if (typeof body.meta_description !== "undefined") updatePayload.meta_description = body.meta_description;
    if (typeof body.published_at !== "undefined") updatePayload.published_at = body.published_at;
    if (typeof body.is_published !== "undefined") updatePayload.is_published = body.is_published;
    const { data, error } = await supabase.from("posts").update(updatePayload).eq("id", req.params.id).select().limit(1);
    if (error) return res.status(400).json({ code: "update_failed" });
    const updated = (data && data[0]) || null;
    if (updated) {
      if (Array.isArray(body.tag_ids)) {
        await admin.from("post_tags").delete().eq("post_id", req.params.id);
        if (body.tag_ids.length) await admin.from("post_tags").insert(body.tag_ids.map((tid) => ({ post_id: req.params.id, tag_id: tid })));
      }
      if (Array.isArray(body.category_ids)) {
        await admin.from("post_categories").delete().eq("post_id", req.params.id);
        if (body.category_ids.length) await admin.from("post_categories").insert(body.category_ids.map((cid) => ({ post_id: req.params.id, category_id: cid })));
      }
    }
    res.json(updated);
  } catch (e) { next(e); }
});

postsRouter.delete("/:id", requireRole("editor"), async (req, res, next) => {
  try {
    const supabase = (req as any).supabase;
    const { error } = await supabase.from("posts").delete().eq("id", req.params.id);
    if (error) return res.status(400).json({ code: "delete_failed" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
