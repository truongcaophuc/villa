import { Request, Response, NextFunction } from "express";
import { supabaseAdmin, clientForToken } from "../config/supabase";

export type Role = "admin" | "editor" | "writer" | "viewer" | "user";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ code: "unauthorized" });
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data?.user)
    return res.status(401).json({ code: "unauthorized" });
  const client = clientForToken(token);
  const { data: userRows } = await supabaseAdmin()
    .from("users")
    .select("id, email, role")
    .eq("id", data.user.id)
    .limit(1);
  const role =
    userRows && userRows[0]?.role ? (userRows[0].role as Role) : "viewer";
  (req as any).user = { id: data.user.id, email: data.user.email, role };
  (req as any).supabase = client;
  next();
}

export function requireRole(minRole: Role) {
  const order: Record<Role, number> = {
    user: 0,
    viewer: 1,
    writer: 2,
    editor: 3,
    admin: 4,
  };
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ code: "unauthorized" });
    if (order[user.role as Role] < order[minRole])
      return res.status(403).json({ code: "forbidden" });
    next();
  };
}
