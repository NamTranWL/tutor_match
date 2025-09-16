import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleNeeded: Record<"/admin" | "/tutor" | "/parent", string[]> = {
  "/admin": ["admin"],
  "/tutor": ["tutor"],
  "/parent": ["parent"],
};

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Chưa dùng session: giả lập role chưa xác định
  const role: string | undefined = undefined;

  const match = (
    Object.keys(roleNeeded) as Array<keyof typeof roleNeeded>
  ).find((prefix) => path.startsWith(prefix));

  if (!match) return NextResponse.next();

  // Khi chưa có role → coi như chưa đăng nhập
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Khi có role thật sau này:
  if (!roleNeeded[match].includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${role}`; // hoặc "/"
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/tutor/:path*", "/parent/:path*"],
};
