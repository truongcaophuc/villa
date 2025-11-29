import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

export const usersRouter = Router();

usersRouter.use(authenticate);

// Get current user profile
usersRouter.get("/me", async (req, res, next) => {
  try {
    const user = (req as any).user;
    const { data, error } = await supabaseAdmin()
      .from("users")
      .select("id,email,name,role,avatar,created_at")
      .eq("id", user.id)
      .limit(1);
    if (error) return res.status(400).json({ code: "fetch_failed" });
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});

// Update current user profile (name, avatar)
usersRouter.patch("/me", async (req, res, next) => {
  try {
    const user = (req as any).user;
    const body = z.object({ name: z.string().min(1).optional(), avatar: z.string().url().optional() }).parse(req.body);
    const { data, error } = await supabaseAdmin()
      .from("users")
      .update(body)
      .eq("id", user.id)
      .select("id,email,name,role,avatar,created_at")
      .limit(1);
    if (error) return res.status(400).json({ code: "update_failed" });
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});

usersRouter.get("/", requireRole("admin"), async (req, res, next) => {
  try {
    const { data } = await supabaseAdmin().from("users").select("id,email,name,role,avatar,created_at");
    res.json(data || []);
  } catch (e) { next(e); }
});

usersRouter.get("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const { data } = await supabaseAdmin().from("users").select("id,email,name,role,avatar,created_at").eq("id", req.params.id).limit(1);
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});

usersRouter.post("/", requireRole("admin"), async (req, res, next) => {
  try {
    const body = z.object({ id: z.string().uuid().optional(), email: z.string().email(), name: z.string().min(1), role: z.enum(["admin","editor","writer","viewer","user"]), avatar: z.string().url().optional() }).parse(req.body);
    let userId = body.id || null;
    if (!userId) {
      const created = await supabaseAdmin().auth.admin.createUser({ email: body.email, password: "123456", email_confirm: true });
      if (created.error || !created.data?.user?.id) {
        return res.status(409).json({ code: "email_exists" });
      }
      userId = created.data.user.id;
    }
    const payload = { id: userId, email: body.email, name: body.name, role: body.role, avatar: body.avatar };
    const { data, error } = await supabaseAdmin().from("users").upsert(payload).select().limit(1);
    if (error) return res.status(400).json({ code: "upsert_failed" });
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});

usersRouter.patch("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const body = z.object({ name: z.string().min(1).optional(), role: z.enum(["admin","editor","writer","viewer","user"]).optional(), banned: z.boolean().optional(), avatar: z.string().url().optional() }).parse(req.body);
    const { data, error } = await supabaseAdmin().from("users").update(body).eq("id", req.params.id).select().limit(1);
    if (error) return res.status(400).json({ code: "update_failed" });
    res.json((data && data[0]) || null);
  } catch (e) { next(e); }
});

usersRouter.delete("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin().from("users").delete().eq("id", req.params.id);
    if (error) return res.status(400).json({ code: "delete_failed" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});