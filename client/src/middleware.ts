
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return NextResponse.next();
  }

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
      url.search = "";
      return NextResponse.redirect(url);
    }

    const neededRole = pathname.split("/")[1];
    const role = (token.user as any)?.role;

    if (role !== neededRole) {
      const url = req.nextUrl.clone();
      url.pathname = roleHome(role);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|static|.*\\..*|favicon.ico|robots.txt).*)",
  ],
};
