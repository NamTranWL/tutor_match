// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// /admin, /tutor, /parent
const PROTECTED = ["/admin", "/tutor", "/parent"] as const;
const roleHome = (role?: string) =>
  role === "admin"
    ? "/admin"
    : role === "tutor"
    ? "/tutor"
    : role === "parent"
    ? "/parent"
    : "/";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (token && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome((token.user as any)?.role);
    return NextResponse.redirect(url);
  }

  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }
    const need = pathname.split("/")[1];
    const role = (token.user as any)?.role;
    if (role !== need) {
      const url = req.nextUrl.clone();
      url.pathname = roleHome(role);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // tránh _next, file tĩnh, api...
  matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};
