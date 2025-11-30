import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (req, res, next) => {
  try {
    const c = (req as any).supabase || supabaseAdmin();
    let locale = typeof req.query.locale === "string" ? req.query.locale : undefined;
    if (!locale) locale = "vi";
    const r = await c.from("categories").select("id,created_at").order("created_at");
    let items = (r.data || []) as any[];
    if (items.length) {
      const ids = items.map((x) => x.id);
      const tr = await c.from("category_translations").select("category_id,name,slug").eq("locale", locale).in("category_id", ids);
      const byId: Record<string, any> = {};
      (tr.data || []).forEach((t: any) => { byId[t.category_id] = t; });
      const missing = ids.filter((id) => !byId[id]);
      if (missing.length) {
        const trFallback = await c.from("category_translations").select("category_id,name,slug").eq("locale", "vi").in("category_id", missing);
        (trFallback.data || []).forEach((t: any) => { if (!byId[t.category_id]) byId[t.category_id] = t; });
      }
      items = items.map((c1) => ({ id: c1.id, name: byId[c1.id]?.name, slug: byId[c1.id]?.slug, created_at: c1.created_at }));
    }
    res.json(items);
  } catch (e) { next(e); }
});

categoriesRouter.use(authenticate);

categoriesRouter.post("/", requireRole("editor"), async (req, res, next) => {
  try {
    const c = (req as any).supabase;
    const body = z.object({ name: z.string().min(1), slug: z.string().min(1), locale: z.string().min(2).optional() }).parse(req.body);
    const locale = body.locale || "vi";
    const r1 = await c.from("categories").insert({}).select().limit(1);
    const created = (r1.data && r1.data[0]) || null;
    if (!created || r1.error) return res.status(400).json({ code: "create_failed" });
    const r2 = await c
      .from("category_translations")
      .upsert({ category_id: created.id, locale, name: body.name, slug: body.slug })
      .select()
      .limit(1);
    if (r2.error) {
      if ((r2.error as any).code === "23505") return res.status(409).json({ code: "duplicate_slug" });
      await c.from("categories").delete().eq("id", created.id);
      return res.status(400).json({ code: "translation_upsert_failed" });
    }
    return res.json({ id: created.id, name: body.name, slug: body.slug, created_at: created.created_at });
  } catch (e) { next(e); }
});

categoriesRouter.patch("/:id", requireRole("editor"), async (req, res, next) => {
  try {
    const c = (req as any).supabase;
    const body = z.object({ locale: z.string().min(2), name: z.string().min(1).optional(), slug: z.string().min(1).optional() }).parse(req.body);
    const r = await c
      .from("category_translations")
      .update({ name: body.name, slug: body.slug })
      .eq("category_id", req.params.id)
      .eq("locale", body.locale)
      .select()
      .limit(1);
    if (r.error) return res.status(400).json({ code: "update_failed" });
    const updated = (r.data && r.data[0]) || null;
    if (!updated) {
      if (typeof body.name === "string" && typeof body.slug === "string") {
        const up = await c
          .from("category_translations")
          .upsert({ category_id: req.params.id, locale: body.locale, name: body.name, slug: body.slug })
          .select()
          .limit(1);
        if (up.error) {
          if ((up.error as any).code === "23505") return res.status(409).json({ code: "duplicate_slug" });
          return res.status(400).json({ code: "translation_upsert_failed" });
        }
        return res.json((up.data && up.data[0]) || null);
      }
      return res.status(400).json({ code: "translation_not_found_create_requires_name_and_slug" });
    }
    res.json(updated);
  } catch (e) { next(e); }
});

categoriesRouter.delete("/:id", requireRole("editor"), async (req, res, next) => {
  try {
    const c = (req as any).supabase;
    const { error } = await c.from("categories").delete().eq("id", req.params.id);
    if (error) return res.status(400).json({ code: "delete_failed" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

categoriesRouter.post("/:id/translations", requireRole("editor"), async (req, res, next) => {
  try {
    const admin = supabaseAdmin();
    const body = z.object({ locale: z.string().min(2), name: z.string().min(1), slug: z.string().min(1) }).parse(req.body);
    const { data, error } = await admin.from("category_translations").upsert({ category_id: req.params.id, locale: body.locale, name: body.name, slug: body.slug }).select().limit(1);
    if (error) return res.status(400).json({ code: "translation_upsert_failed" });
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});
