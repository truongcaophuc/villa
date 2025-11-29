import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

export const tagsRouter = Router();

tagsRouter.get("/", async (req, res, next) => {
  try {
    const c = (req as any).supabase || supabaseAdmin();
    const r = c ? await c.from("tags").select("id,name,slug,created_at").order("name") : { data: [] };
    res.json(r.data || []);
  } catch (e) { next(e); }
});

tagsRouter.use(authenticate);

tagsRouter.post("/", requireRole("editor"), async (req, res, next) => {
  try {
    const c = (req as any).supabase;
    const body = z.object({ name: z.string().min(1), slug: z.string().min(1) }).parse(req.body);
    const { data, error } = await c.from("tags").insert(body).select().limit(1);
    if (error && (error as any).code === "23505") {
      return res.status(409).json({ code: "duplicate_slug" });
    }
    if (error) return res.status(400).json({ code: "create_failed" });
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});

tagsRouter.patch("/:id", requireRole("editor"), async (req, res, next) => {
  try {
    const c = (req as any).supabase;
    const body = z.object({ name: z.string().min(1).optional(), slug: z.string().min(1).optional() }).parse(req.body);
    const { data, error } = await c.from("tags").update(body).eq("id", req.params.id).select().limit(1);
    if (error) return res.status(400).json({ code: "update_failed" });
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});

tagsRouter.delete("/:id", requireRole("editor"), async (req, res, next) => {
  try {
    const c = (req as any).supabase;
    const { error } = await c.from("tags").delete().eq("id", req.params.id);
    if (error) return res.status(400).json({ code: "delete_failed" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});