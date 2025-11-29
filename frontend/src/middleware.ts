import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["vi", "en"] as const;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const m = pathname.match(/^\/(vi|en)(\/.*|$)/);
  if (!m) {
    return NextResponse.next();
  }
  const locale = m[1];
  const rest = m[2] || "/";

  const url = req.nextUrl.clone();
  url.pathname = rest;

  const res = rest === "/" ? NextResponse.redirect(url) : NextResponse.rewrite(url);
  res.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  console.log("[middleware]", pathname, "->", url.pathname, "locale=", locale);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp)).*)",
  ],
};
