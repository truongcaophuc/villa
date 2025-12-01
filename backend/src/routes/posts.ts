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
    let locale = typeof req.query.locale === "string" ? req.query.locale : undefined;
    if (!locale) locale = "vi";
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const categorySlug = typeof req.query.categorySlug === "string" ? req.query.categorySlug : undefined;
    const tagId = typeof req.query.tagId === "string" ? req.query.tagId : undefined;
    const tagSlug = typeof req.query.tagSlug === "string" ? req.query.tagSlug : undefined;

    let filterPostIds: string[] | null = null;
    let catIdFinal = categoryId;
    let tagIdFinal = tagId;

    if (!catIdFinal && categorySlug) {
      let cr = await c.from("categories").select("id").eq("slug", categorySlug).limit(1);
      if (!cr.data || cr.data.length === 0) {
        const ctrReq = await c.from("category_translations").select("category_id").eq("locale", locale).eq("slug", categorySlug).limit(1);
        catIdFinal = (ctrReq.data && ctrReq.data[0] && ctrReq.data[0].category_id) || undefined;
        if (!catIdFinal) {
          const ctrFallback = await c.from("category_translations").select("category_id").eq("locale", "vi").eq("slug", categorySlug).limit(1);
          catIdFinal = (ctrFallback.data && ctrFallback.data[0] && ctrFallback.data[0].category_id) || undefined;
        }
      } else {
        catIdFinal = (cr.data && cr.data[0] && cr.data[0].id) || undefined;
      }
    }
    if (!tagIdFinal && tagSlug) {
      let tr0 = await c.from("tags").select("id").eq("slug", tagSlug).limit(1);
      if (!tr0.data || tr0.data.length === 0) {
        const ttrReq = await c.from("tag_translations").select("tag_id").eq("locale", locale).eq("slug", tagSlug).limit(1);
        tagIdFinal = (ttrReq.data && ttrReq.data[0] && ttrReq.data[0].tag_id) || undefined;
        if (!tagIdFinal) {
          const ttrFallback = await c.from("tag_translations").select("tag_id").eq("locale", "vi").eq("slug", tagSlug).limit(1);
          tagIdFinal = (ttrFallback.data && ttrFallback.data[0] && ttrFallback.data[0].tag_id) || undefined;
        }
      } else {
        tagIdFinal = (tr0.data && tr0.data[0] && tr0.data[0].id) || undefined;
      }
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

    let q = c.from("posts").select("id,featured_image,published_at,is_published,author_id,created_at", { count: "exact" }).order("published_at", { ascending: false });
    if (filterPostIds && filterPostIds.length) q = q.in("id", filterPostIds);
    if (filterPostIds && filterPostIds.length === 0) {
      return res.json({ items: [], total: 0 });
    }
    const r = await q.range(from, to);
    let items = (r.data || []) as any[];
    if (items.length) {
      const ids = items.map((p) => p.id);
      const trReq = await c.from("post_translations").select("post_id,title,excerpt,meta_title,meta_description,slug").eq("locale", locale).in("post_id", ids);
      const byPost: Record<string, any> = {};
      (trReq.data || []).forEach((t: any) => { byPost[t.post_id] = t; });
      const missing = ids.filter((id) => !byPost[id]);
      if (missing.length) {
        const trFallback = await c.from("post_translations").select("post_id,title,excerpt,meta_title,meta_description,slug").eq("locale", "vi").in("post_id", missing);
        (trFallback.data || []).forEach((t: any) => { if (!byPost[t.post_id]) byPost[t.post_id] = t; });
      }
      items = items.map((p) => {
        const t = byPost[p.id];
        return { ...p, title: t?.title, excerpt: t?.excerpt, meta_title: t?.meta_title, meta_description: t?.meta_description, slug: t?.slug };
      });
    }
    res.json({ items, total: r.count || items.length || 0 });
  } catch (e) { next(e); }
});

postsRouter.get("/with-relations", async (req, res, next) => {
  try {
    const { supabase } = req as any;
    const c = supabase || supabaseAdmin();
    const { from, to } = parsePagination(req.query);
    let locale = typeof req.query.locale === "string" ? req.query.locale : undefined;
    if (!locale) locale = "vi";
    const r = c ? await c.from("posts").select("id,featured_image,published_at,is_published,author_id,created_at", { count: "exact" }).order("published_at", { ascending: false }).range(from, to) : { data: [], count: 0 };
    const items = (r.data || []) as any[];
    const postIds = items.map((p) => p.id);
    const authorIds = Array.from(new Set(items.map((p) => p.author_id).filter(Boolean)));
    const tagsMap: Record<string, { id: string; name: string; slug: string }[]> = {};
    const catsMap: Record<string, { id: string; name: string; slug: string }[]> = {};

    if (postIds.length) {
    const pt = await c.from("post_tags").select("post_id,tag_id").in("post_id", postIds);
    const pc = await c.from("post_categories").select("post_id,category_id").in("post_id", postIds);
    const tagIds: string[] = Array.from(new Set(((pt.data || []) as { tag_id: string }[]).map((x) => x.tag_id)));
    const catIds: string[] = Array.from(new Set(((pc.data || []) as { category_id: string }[]).map((x) => x.category_id)));
      const tagsBase = tagIds.length ? await c.from("tags").select("id").in("id", tagIds) : { data: [] };
      const catsBase = catIds.length ? await c.from("categories").select("id").in("id", catIds) : { data: [] };
      let tagTr = tagIds.length ? await c.from("tag_translations").select("tag_id,name,slug").eq("locale", locale).in("tag_id", tagIds) : { data: [] };
      let catTr = catIds.length ? await c.from("category_translations").select("category_id,name,slug").eq("locale", locale).in("category_id", catIds) : { data: [] };
      const tagTrById: Record<string, any> = {};
      const catTrById: Record<string, any> = {};
      (tagTr.data || []).forEach((t: any) => { tagTrById[t.tag_id] = t; });
      (catTr.data || []).forEach((c1: any) => { catTrById[c1.category_id] = c1; });
      const missingTagIds = tagIds.filter((id) => !tagTrById[id]);
      const missingCatIds = catIds.filter((id) => !catTrById[id]);
      if (missingTagIds.length) {
        const tagFallback = await c.from("tag_translations").select("tag_id,name,slug").eq("locale", "vi").in("tag_id", missingTagIds);
        (tagFallback.data || []).forEach((t: any) => { if (!tagTrById[t.tag_id]) tagTrById[t.tag_id] = t; });
      }
      if (missingCatIds.length) {
        const catFallback = await c.from("category_translations").select("category_id,name,slug").eq("locale", "vi").in("category_id", missingCatIds);
        (catFallback.data || []).forEach((c1: any) => { if (!catTrById[c1.category_id]) catTrById[c1.category_id] = c1; });
      }
      (pt.data || []).forEach((x: any) => {
        const arr = tagsMap[x.post_id] || (tagsMap[x.post_id] = []);
        const t = tagTrById[x.tag_id];
        if (t) arr.push({ id: x.tag_id, name: t.name, slug: t.slug });
      });
      (pc.data || []).forEach((x: any) => {
        const arr = catsMap[x.post_id] || (catsMap[x.post_id] = []);
        const c2 = catTrById[x.category_id];
        if (c2) arr.push({ id: x.category_id, name: c2.name, slug: c2.slug });
      });
    }

    const authors = authorIds.length ? await c.from("users").select("id,name,email,avatar").in("id", authorIds) : { data: [] };
    const authorById: Record<string, any> = {};
    (authors.data || []).forEach((u: any) => { authorById[u.id] = u; });

    let full = items.map((p) => ({
      ...p,
      tags: tagsMap[p.id] || [],
      categories: catsMap[p.id] || [],
      author: p.author_id ? authorById[p.author_id] || null : null,
    }));
    if (locale && postIds.length) {
      const trReq = await c.from("post_translations").select("post_id,title,excerpt,meta_title,meta_description,slug,content").eq("locale", locale).in("post_id", postIds);
      const byPost: Record<string, any> = {};
      (trReq.data || []).forEach((t: any) => { byPost[t.post_id] = t; });
      const missing = postIds.filter((id) => !byPost[id]);
      if (missing.length) {
        const trFallback = await c.from("post_translations").select("post_id,title,excerpt,meta_title,meta_description,slug,content").eq("locale", "vi").in("post_id", missing);
        (trFallback.data || []).forEach((t: any) => { if (!byPost[t.post_id]) byPost[t.post_id] = t; });
      }
      full = full.map((p) => byPost[p.id] ? { ...p, title: byPost[p.id].title, excerpt: byPost[p.id].excerpt, meta_title: byPost[p.id].meta_title, meta_description: byPost[p.id].meta_description, slug: byPost[p.id].slug, content: byPost[p.id].content } : p);
    }
    res.json({ items: full, total: r.count || 0 });
  } catch (e) { next(e); }
});

postsRouter.get("/:slug", async (req, res, next) => {
  try {
    const { supabase } = req as any;
    const c = supabase || supabaseAdmin();
    let locale = typeof req.query.locale === "string" ? req.query.locale : undefined;
    if (!locale) locale = "vi";
    let postId: string | null = null;
    let trForResponse: any = null;

    // 1) Tìm postId theo slug ở bất kỳ locale
    const trAny = await c
      .from("post_translations")
      .select("post_id,locale,slug")
      .eq("slug", req.params.slug)
      .limit(1);
    const foundAny = (trAny.data && trAny.data[0]) || null;
    if (foundAny) postId = foundAny.post_id;

    if (!postId) return res.json(null);

    // 2) Lấy bản dịch cho locale yêu cầu, nếu thiếu thì fallback sang 'vi'
    const trReq = await c
      .from("post_translations")
      .select("post_id,title,excerpt,content,meta_title,meta_description,slug")
      .eq("post_id", postId)
      .eq("locale", locale)
      .limit(1);
    trForResponse = (trReq.data && trReq.data[0]) || null;
    if (!trForResponse) {
      const trVi = await c
        .from("post_translations")
        .select("post_id,title,excerpt,content,meta_title,meta_description,slug")
        .eq("post_id", postId)
        .eq("locale", "vi")
        .limit(1);
      trForResponse = (trVi.data && trVi.data[0]) || null;
    }

    // 3) Lấy bản ghi gốc của post
    const pr = await c
      .from("posts")
      .select("id,featured_image,published_at,is_published,author_id,created_at")
      .eq("id", postId)
      .limit(1);
    const base = (pr.data && pr.data[0]) || null;
    if (!base || !trForResponse) return res.json(null);
    const row = {
      ...base,
      title: trForResponse.title,
      slug: trForResponse.slug,
      excerpt: trForResponse.excerpt,
      content: trForResponse.content,
      meta_title: trForResponse.meta_title,
      meta_description: trForResponse.meta_description,
    };
  let author: any = null;
  if (row.author_id) {
    const au = await c.from("users").select("id,name,email,avatar").eq("id", row.author_id).limit(1);
    author = (au.data && au.data[0]) || null;
  }
  type Brief = { id: string; name: string; slug: string };
  let categories: Brief[] = [];
  let tags: Brief[] = [];
  {
    const pid = postId || row.id;
    const pt = await c.from("post_tags").select("tag_id").eq("post_id", pid);
    const pc = await c.from("post_categories").select("category_id").eq("post_id", pid);
    const tagIds: string[] = Array.from(new Set(((pt.data || []) as { tag_id: string }[]).map((x) => x.tag_id)));
    const catIds: string[] = Array.from(new Set(((pc.data || []) as { category_id: string }[]).map((x) => x.category_id)));
    let tTr = tagIds.length ? await c.from("tag_translations").select("tag_id,name,slug").eq("locale", locale).in("tag_id", tagIds) : { data: [] };
    let cTr = catIds.length ? await c.from("category_translations").select("category_id,name,slug").eq("locale", locale).in("category_id", catIds) : { data: [] };
    type TagTrRow = { tag_id: string; name: string; slug: string };
    type CatTrRow = { category_id: string; name: string; slug: string };
    const tTrById: Record<string, TagTrRow> = {};
    const cTrById: Record<string, CatTrRow> = {};
    (tTr.data || []).forEach((t: any) => { tTrById[t.tag_id] = t; });
    (cTr.data || []).forEach((c: any) => { cTrById[c.category_id] = c; });
    const missingTagIds = tagIds.filter((id) => !tTrById[id]);
    const missingCatIds = catIds.filter((id) => !cTrById[id]);
    if (missingTagIds.length) {
      const tagFallback = await c.from("tag_translations").select("tag_id,name,slug").eq("locale", "vi").in("tag_id", missingTagIds);
      (tagFallback.data || []).forEach((t: any) => { if (!tTrById[t.tag_id]) tTrById[t.tag_id] = t; });
    }
    if (missingCatIds.length) {
      const catFallback = await c.from("category_translations").select("category_id,name,slug").eq("locale", "vi").in("category_id", missingCatIds);
      (catFallback.data || []).forEach((c1: any) => { if (!cTrById[c1.category_id]) cTrById[c1.category_id] = c1; });
    }
    tags = tagIds.map((id: string): Brief => {
      const t = tTrById[id];
      return { id, name: t?.name || "", slug: t?.slug || "" };
    });
    categories = catIds.map((id: string): Brief => {
      const c1 = cTrById[id];
      return { id, name: c1?.name || "", slug: c1?.slug || "" };
    });
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
    const body = z.object({
      featured_image: z.string().optional(),
      published_at: z.string().datetime().optional(),
      is_published: z.boolean().optional(),
      tag_ids: z.array(z.string().uuid()).optional(),
      category_ids: z.array(z.string().uuid()).optional(),
      translation: z.object({ locale: z.string().min(2), title: z.string().min(1), slug: z.string().min(1), excerpt: z.string().optional(), content: z.string().min(1), meta_title: z.string().optional(), meta_description: z.string().optional() }).optional()
    }).parse(req.body);
    const insertPayload = {
      featured_image: body.featured_image,
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
      if (body.translation) {
        const tr = body.translation;
        await admin.from("post_translations").upsert({ post_id: created.id, locale: tr.locale, title: tr.title, slug: tr.slug, excerpt: tr.excerpt, content: tr.content, meta_title: tr.meta_title, meta_description: tr.meta_description });
      }
    }
    res.json(created);
  } catch (e) { next(e); }
});

postsRouter.patch("/:id", requireRole("writer"), async (req, res, next) => {
  try {
    const supabase = (req as any).supabase;
    const admin = supabaseAdmin();
    const user = (req as any).user;
    if (!user) return res.status(401).json({ code: "unauthorized" });
    // Writers can only edit their own posts; editors/admins can edit any
    if (user.role !== "editor" && user.role !== "admin") {
      const pr = await supabase.from("posts").select("author_id").eq("id", req.params.id).limit(1);
      const base = (pr.data && pr.data[0]) || null;
      if (!base) return res.status(404).json({ code: "not_found" });
      if (base.author_id !== user.id) return res.status(403).json({ code: "forbidden" });
    }
    const body = z.object({ featured_image: z.string().url().optional(), published_at: z.string().datetime().optional(), is_published: z.boolean().optional(), tag_ids: z.array(z.string().uuid()).optional(), category_ids: z.array(z.string().uuid()).optional(), translation: z.object({ locale: z.string().min(2), title: z.string().min(1).optional(), slug: z.string().min(1).optional(), excerpt: z.string().optional(), content: z.string().optional(), meta_title: z.string().optional(), meta_description: z.string().optional() }).optional() }).parse(req.body);
    const updatePayload: Record<string, unknown> = {};
    if (typeof body.featured_image !== "undefined") updatePayload.featured_image = body.featured_image;
    if (typeof body.published_at !== "undefined") updatePayload.published_at = body.published_at;
    if (typeof body.is_published !== "undefined") updatePayload.is_published = body.is_published;
    let updated: any = null;
    if (Object.keys(updatePayload).length > 0) {
      const { data, error } = await supabase.from("posts").update(updatePayload).eq("id", req.params.id).select().limit(1);
      if (error) return res.status(400).json({ code: "update_failed" });
      updated = (data && data[0]) || null;
    }
    if (Array.isArray(body.tag_ids)) {
      await admin.from("post_tags").delete().eq("post_id", req.params.id);
      if (body.tag_ids.length) await admin.from("post_tags").insert(body.tag_ids.map((tid) => ({ post_id: req.params.id, tag_id: tid })));
    }
    if (Array.isArray(body.category_ids)) {
      await admin.from("post_categories").delete().eq("post_id", req.params.id);
      if (body.category_ids.length) await admin.from("post_categories").insert(body.category_ids.map((cid) => ({ post_id: req.params.id, category_id: cid })));
    }
    if (body.translation) {
      const tr = body.translation;
      const existing = await admin
        .from("post_translations")
        .select("post_id")
        .eq("post_id", req.params.id)
        .eq("locale", tr.locale)
        .limit(1);
      const hasExisting = !!(existing.data && existing.data[0]);
      if (hasExisting) {
        const updateSet: Record<string, any> = {};
        if (typeof tr.title !== "undefined") updateSet.title = tr.title;
        if (typeof tr.slug !== "undefined") updateSet.slug = tr.slug;
        if (typeof tr.excerpt !== "undefined") updateSet.excerpt = tr.excerpt;
        if (typeof tr.content !== "undefined") updateSet.content = tr.content;
        if (typeof tr.meta_title !== "undefined") updateSet.meta_title = tr.meta_title;
        if (typeof tr.meta_description !== "undefined") updateSet.meta_description = tr.meta_description;
        if (Object.keys(updateSet).length) {
          const up = await admin
            .from("post_translations")
            .update(updateSet)
            .eq("post_id", req.params.id)
            .eq("locale", tr.locale)
            .select()
            .limit(1);
          if (up.error) {
            if ((up.error as any).code === "23505") return res.status(409).json({ code: "duplicate_slug" });
            return res.status(400).json({ code: "translation_update_failed" });
          }
        }
      } else {
        if (typeof tr.title !== "string" || tr.title.length < 1 || typeof tr.slug !== "string" || tr.slug.length < 1) {
          return res.status(400).json({ code: "translation_create_requires_title_and_slug" });
        }
        const payload: Record<string, any> = { post_id: req.params.id, locale: tr.locale, title: tr.title, slug: tr.slug };
        if (typeof tr.excerpt !== "undefined") payload.excerpt = tr.excerpt;
        if (typeof tr.content !== "undefined") payload.content = tr.content;
        if (typeof tr.meta_title !== "undefined") payload.meta_title = tr.meta_title;
        if (typeof tr.meta_description !== "undefined") payload.meta_description = tr.meta_description;
        const up = await admin
          .from("post_translations")
          .upsert(payload)
          .select()
          .limit(1);
        if (up.error) {
          if ((up.error as any).code === "23505") return res.status(409).json({ code: "duplicate_slug" });
          return res.status(400).json({ code: "translation_upsert_failed" });
        }
      }
    }
    res.json(updated || { id: req.params.id });
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
// Post translations endpoints
postsRouter.post(":id/translations", requireRole("editor"), async (req, res, next) => {
  try {
    const admin = supabaseAdmin();
    const body = z.object({ locale: z.string().min(2), title: z.string().min(1), slug: z.string().min(1), excerpt: z.string().optional(), content: z.string().optional(), meta_title: z.string().optional(), meta_description: z.string().optional() }).parse(req.body);
    const { data, error } = await admin.from("post_translations").upsert({ post_id: req.params.id, locale: body.locale, title: body.title, slug: body.slug, excerpt: body.excerpt, content: body.content, meta_title: body.meta_title, meta_description: body.meta_description }).select().limit(1);
    if (error) return res.status(400).json({ code: "translation_upsert_failed" });
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});
