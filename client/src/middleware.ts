// src/middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const roleNeeded: Record<"/admin" | "/tutor" | "/parent", string[]> = {
  "/admin": ["admin"],
  "/tutor": ["tutor"],
  "/parent": ["parent"],
};

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  // Chỉ xử lý các khu vực được bảo vệ
  const match = (
    Object.keys(roleNeeded) as Array<keyof typeof roleNeeded>
  ).find((prefix) => path.startsWith(prefix));

  if (!match) return NextResponse.next();

  // Chưa đăng nhập → đính kèm callbackUrl đầy đủ (pathname + search)
  if (!req.auth) {
    const loginUrl = new URL("/login", nextUrl);
    const cb = path + (nextUrl.search || "");
    loginUrl.searchParams.set("callbackUrl", cb);
    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập → kiểm tra role
  const role = (req.auth.user as any)?.role as string | undefined;

  // Sai role → đẩy về trang chủ theo role (nếu có) hoặc "/"
  if (!role || !roleNeeded[match].includes(role)) {
    const redirectUrl = new URL(role ? `/${role}` : "/", nextUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // Đúng role → cho qua
  return NextResponse.next();
});

// Áp dụng cho các vùng cần bảo vệ
export const config = {
  matcher: ["/admin/:path*", "/tutor/:path*", "/parent/:path*"],
};
