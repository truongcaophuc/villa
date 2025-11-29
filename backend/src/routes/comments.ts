import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";
import { parsePagination } from "../helpers/pagination";

export const commentsRouter = Router();

commentsRouter.get("/", async (req, res, next) => {
  try {
    const c = supabaseAdmin();
    const hasLimit = typeof req.query.limit === "string" && Number(req.query.limit) > 0;
    const { from, to } = hasLimit ? { from: 0, to: Number(req.query.limit as string) - 1 } : parsePagination(req.query);
    const postId = typeof req.query.postId === "string" ? req.query.postId : undefined;
    let q = c.from("comments").select("id,content,created_at,post_id,user_id", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
    if (postId) q = q.eq("post_id", postId);
    const r = await q;
    const rows = (r.data || []) as any[];
    const userIds = Array.from(new Set(rows.map((x) => x.user_id).filter(Boolean)));
    const users = userIds.length ? await c.from("users").select("id,name,email,avatar").in("id", userIds) : { data: [] };
    const userById: Record<string, any> = {};
    (users.data || []).forEach((u: any) => { userById[u.id] = u; });
    const items = rows.map((x: any) => ({ id: x.id, content: x.content, createdAt: x.created_at, userId: x.user_id, user: userById[x.user_id] ? { name: userById[x.user_id].name || userById[x.user_id].email, email: userById[x.user_id].email, avatar: userById[x.user_id].avatar } : null }));
    res.json({ items, total: r.count || 0 });
  } catch (e) { next(e); }
});

commentsRouter.post("/", authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const body = z.object({ content: z.string().min(1), postId: z.string().uuid() }).parse(req.body);
    const { data, error } = await supabaseAdmin().from("comments").insert({ content: body.content, post_id: body.postId, user_id: user.id }).select().limit(1);
    if (error) return res.status(400).json({ code: "create_failed" });
    const created = (data && data[0]) || null;
    let userInfo: any = null;
    if (created) {
      const u = await supabaseAdmin().from("users").select("id,name,email,avatar").eq("id", user.id).limit(1);
      userInfo = (u.data && u.data[0]) || null;
    }
    res.json(created ? { id: created.id, content: created.content, createdAt: created.created_at, userId: created.user_id, user: userInfo ? { name: userInfo.name || userInfo.email, email: userInfo.email, avatar: userInfo.avatar } : null } : null);
  } catch (e) { next(e); }
});

commentsRouter.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const body = z.object({ content: z.string().min(1) }).parse(req.body);
    const c = supabaseAdmin();
    const { data } = await c.from("comments").select("id,content,created_at,user_id,post_id").eq("id", req.params.id).limit(1);
    const existing = (data && data[0]) || null;
    if (!existing) return res.status(404).json({ code: "not_found" });
    if (existing.user_id !== user.id) return res.status(403).json({ code: "forbidden" });
    const upd = await c.from("comments").update({ content: body.content }).eq("id", req.params.id).select().limit(1);
    if (upd.error) return res.status(400).json({ code: "update_failed" });
    const updated = (upd.data && upd.data[0]) || null;
    let userInfo: any = null;
    if (updated) {
      const u = await c.from("users").select("id,name,email,avatar").eq("id", updated.user_id).limit(1);
      userInfo = (u.data && u.data[0]) || null;
    }
    res.json(updated ? { id: updated.id, content: updated.content, createdAt: updated.created_at, userId: updated.user_id, user: userInfo ? { name: userInfo.name || userInfo.email, email: userInfo.email, avatar: userInfo.avatar } : null } : null);
  } catch (e) { next(e); }
});
