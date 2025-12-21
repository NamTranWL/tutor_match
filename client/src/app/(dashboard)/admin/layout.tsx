// app/(dashboard)/admin/layout.tsx
import { auth } from "@/auth";
import AdminHeader from "@/shared/components/layout/header";
import AdminFooter from "@/shared/components/layout/footer";
import AdminSidebar from "@/shared/components/layout/sidebar";
import type { Role } from "@/shared/components/layout/layout.menu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  return (
    <div className="min-h-screen flex">
      <AdminSidebar role={role} />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 bg-sky-100">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
