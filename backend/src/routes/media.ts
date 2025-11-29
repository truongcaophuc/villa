import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole } from "../middleware/auth";
import { env } from "../config/env";
import { supabaseAdmin } from "../config/supabase";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const mediaRouter = Router();

mediaRouter.get("/", async (req, res, next) => {
  try {
    const c = (req as any).supabase || supabaseAdmin();
    const r = c ? await c.from("media").select("id,filename,url,mime_type,created_at,owner_id").order("created_at", { ascending: false }) : { data: [] };
    res.json(r.data || []);
  } catch (e) { next(e); }
});

mediaRouter.post("/upload", authenticate, requireRole("writer"), upload.single("file"), async (req, res, next) => {
  try {
    console.log("upload file")
    const user = (req as any).user;
    const c = (req as any).supabase;
    const file = (req as any).file;
    if (!file) return res.status(400).json({ code: "no_file" });
    const admin = supabaseAdmin();
    const bucket = await admin.storage.getBucket(env.MEDIA_BUCKET);
    if (!bucket.data) {
      await admin.storage.createBucket(env.MEDIA_BUCKET, { public: true });
    }
    
    const filename = `${user.id}/${Date.now()}_${file.originalname}`;
    const put = await admin.storage.from(env.MEDIA_BUCKET).upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
    console.log("put", put);
    if (put.error) return res.status(400).json({ code: "upload_failed" });
    const url = admin.storage.from(env.MEDIA_BUCKET).getPublicUrl(filename).data.publicUrl;
    const ins = await c.from("media").insert({ filename, url, mime_type: file.mimetype, owner_id: user.id }).select().limit(1);
    if (ins.error) return res.status(400).json({ code: "record_failed" });
    res.json((ins.data && ins.data[0]) || null);
  } catch (e) { next(e); }
});

mediaRouter.delete("/:id", authenticate, requireRole("editor"), async (req, res, next) => {
  try {
    const admin = supabaseAdmin();
    const { data } = await admin.from("media").select("id,filename").eq("id", req.params.id).limit(1);
    const row = (data && data[0]) || null;
    if (!row) return res.status(404).json({ code: "not_found" });
    await admin.storage.from(env.MEDIA_BUCKET).remove([row.filename]);
    const del = await admin.from("media").delete().eq("id", req.params.id);
    if (del.error) return res.status(400).json({ code: "delete_failed" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
