// app/(public)/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";

type SearchParams = { action?: string; callbackUrl?: string };

export default async function PublicHome({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const session = await auth();

  // Nếu đã đăng nhập → điều hướng theo role
  const role = (session?.user as any)?.role as
    | "admin"
    | "tutor"
    | "parent"
    | undefined;

  if (role === "admin") redirect("/admin");
  if (role === "tutor") redirect("/tutor");
  if (role === "parent") redirect("/parent");

  // Chưa đăng nhập → đẩy sang login (mặc định) hoặc register nếu ?action=register
  const cb = searchParams?.callbackUrl ?? "/";
  const dest = searchParams?.action === "register" ? "/register" : "/login";
  redirect(`${dest}?callbackUrl=${encodeURIComponent(cb)}`);
}
