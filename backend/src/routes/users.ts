import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { authenticate, requireRole } from "../middleware/auth";
import { supabaseAdmin, supabaseAnon } from "../config/supabase";
import { env } from "../config/env";

export const usersRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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
    const adminUser = await supabaseAdmin().auth.admin.getUserById(user.id);
    const hasEmailIdentity = !adminUser.error && !!adminUser.data?.user && (((adminUser.data!.user as any).identities || []).some((i: any) => i.provider === "email"));
    const profile = (data && data[0]) || null;
    res.json(profile ? { ...profile, can_change_password: hasEmailIdentity } : null);
  } catch (e) { next(e); }
});

// Update current user profile (name, avatar)
usersRouter.patch("/me", async (req, res, next) => {
  try {
    const user = (req as any).user;
    const body = z.object({ name: z.string().min(1).optional(), avatar: z.string().optional() }).parse(req.body);
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

usersRouter.post("/me/avatar", upload.single("file"), async (req, res, next) => {
  try {
    const user = (req as any).user;
    const file = (req as any).file;
    if (!file) return res.status(400).json({ code: "no_file" });
    const admin = supabaseAdmin();
    const bucket = await admin.storage.getBucket(env.MEDIA_BUCKET);
    if (!bucket.data) {
      await admin.storage.createBucket(env.MEDIA_BUCKET, { public: true });
    }
    const base = `${Date.now()}_${file.originalname}`;
    const filename = `${user.id}/${base}`;
    const put = await admin.storage.from(env.MEDIA_BUCKET).upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
    if (put.error) return res.status(400).json({ code: "upload_failed" });
    const encoded = encodeURIComponent(base);
    const url = `/storage/v1/object/public/${env.MEDIA_BUCKET}/${user.id}/${encoded}`;
    res.json({ url });
  } catch (e) { next(e); }
});

usersRouter.post("/change-password", async (req, res, next) => {
  try {
    const user = (req as any).user;
    const body = z.object({ old_password: z.string().min(6), new_password: z.string().min(6) }).parse(req.body);
    const adminUser = await supabaseAdmin().auth.admin.getUserById(user.id);
    if (adminUser.error || !adminUser.data?.user) return res.status(401).json({ code: "unauthorized" });
    const hasEmailIdentity = ((adminUser.data.user as any).identities || []).some((i: any) => i.provider === "email");
    if (!hasEmailIdentity) {
      return res.status(400).json({ code: "oauth_only" });
    }
    const verify = await supabaseAnon().auth.signInWithPassword({ email: user.email, password: body.old_password });
    if (!verify.data?.user) return res.status(401).json({ code: "invalid_credentials" });
    const upd = await supabaseAdmin().auth.admin.updateUserById(user.id, { password: body.new_password });
    if (upd.error) return res.status(400).json({ code: "update_failed" });
    res.json({ ok: true });
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
