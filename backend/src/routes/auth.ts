import { Router } from "express";
import { z } from "zod";
import { supabaseAnon, supabaseAdmin } from "../config/supabase";
import { env } from "../config/env";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1).optional() }).parse(req.body);
    const { data, error } = await supabaseAnon().auth.signUp({ email: body.email, password: body.password });
    if (error || !data.user) return res.status(400).json({ code: "register_failed" });
    await supabaseAdmin().from("users").upsert({ id: data.user.id, email: body.email, name: body.name || body.email, role: "user" });
    res.json({ id: data.user.id });
  } catch (e) { next(e); }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
    const { data, error } = await supabaseAnon().auth.signInWithPassword({ email: body.email, password: body.password });
    if (error || !data.session) return res.status(401).json({ code: "login_failed" });
    res.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token, user: data.user });
  } catch (e) { next(e); }
});

authRouter.post("/bootstrap-superadmin", async (req, res, next) => {
  try {
    const secret = req.header("X-Setup-Secret") || "";
    if (!env.SUPABASE_BOOTSTRAP_SECRET || secret !== env.SUPABASE_BOOTSTRAP_SECRET) {
      return res.status(403).json({ code: "forbidden" });
    }
    const body = z.object({ email: z.string().email().optional(), password: z.string().min(6).optional() }).parse(req.body || {});
    const email = body.email || "superadmin@example.com";
    const password = body.password || "123456";
    let userId: string | null = null;
    const login = await supabaseAnon().auth.signInWithPassword({ email, password });
    if (login.data?.user?.id) {
      userId = login.data.user.id;
    } else {
      const created = await supabaseAdmin().auth.admin.createUser({ email, password, email_confirm: true });
      if (created.error || !created.data?.user?.id) return res.status(400).json({ code: "create_failed" });
      userId = created.data.user.id;
    }
    await supabaseAdmin().from("users").upsert({ id: userId, email, name: email, role: "admin" });
    res.json({ id: userId, email });
  } catch (e) { next(e); }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const body = z.object({ refresh_token: z.string().min(10) }).parse(req.body);
    const { data, error } = await supabaseAnon().auth.refreshSession({ refresh_token: body.refresh_token });
    if (error || !data.session) return res.status(401).json({ code: "refresh_failed" });
    res.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token, user: data.user });
  } catch (e) { next(e); }
});

// Exchange Google ID token for Supabase session and upsert user profile
authRouter.post("/exchange-google", async (req, res, next) => {
  try {
    const body = z.object({ id_token: z.string().min(10), name: z.string().optional(), email: z.string().email().optional(), avatar: z.string().url().optional() }).parse(req.body);
    const { data, error } = await supabaseAnon().auth.signInWithIdToken({ provider: "google", token: body.id_token });
    console.log("Sign in with Google ID token:", data, error);
    if (error || !data.session || !data.user) return res.status(401).json({ code: "exchange_failed" });
    const userId = data.user.id;
    const payload: { id: string; email?: string; name?: string; avatar?: string; role?: string } = { id: userId };
    if (body.email) payload.email = body.email;
    if (body.name) payload.name = body.name;
    if (body.avatar) payload.avatar = body.avatar;
    payload.role = "user";
    try { await supabaseAdmin().from("users").upsert(payload); } catch {}
    res.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token, user: data.user });
  } catch (e) { next(e); }
});