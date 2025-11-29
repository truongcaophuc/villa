import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (req, res, next) => {
  try {

    const c = (req as any).supabase || supabaseAdmin();
    const r = await c.from("categories").select("id,name,slug,created_at").order("name");
    res.json(r.data || []);
  } catch (e) { next(e); }
});

categoriesRouter.use(authenticate);

categoriesRouter.post("/", requireRole("editor"), async (req, res, next) => {
  try {
    const c = (req as any).supabase;
    const body = z.object({ name: z.string().min(1), slug: z.string().min(1) }).parse(req.body);
    const { data, error } = await c.from("categories").insert(body).select().limit(1);


    if (error) return res.status(400).json({ code: "create_failed" });
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});

categoriesRouter.patch("/:id", requireRole("editor"), async (req, res, next) => {
  try {
    const c = (req as any).supabase;
    const body = z.object({ name: z.string().min(1).optional(), slug: z.string().min(1).optional() }).parse(req.body);
    const { data, error } = await c.from("categories").update(body).eq("id", req.params.id).select().limit(1);
    if (error) return res.status(400).json({ code: "update_failed" });
    res.json((data && data[0]) || null);
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