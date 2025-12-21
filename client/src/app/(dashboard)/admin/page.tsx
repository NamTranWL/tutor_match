import { auth } from "@/auth";
import type { Role } from "@/shared/components/layout/layout.menu";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-muted-foreground">Welcome to the admin area.</p>
      <div className="flex gap-3">
        <Link href="/admin/dashboard" className="px-3 py-2 rounded bg-primary text-white">
          Overview
        </Link>
        <Link href="/admin/users" className="px-3 py-2 rounded border">
          Users
        </Link>
        <Link href="/admin/bookings" className="px-3 py-2 rounded border">
          Bookings
        </Link>
        <Link href="/admin/payments" className="px-3 py-2 rounded border">
          Payments
        </Link>
      </div>
    </div>
  );
}
