// app/(dashboard)/admin/page.tsx  (SERVER COMPONENT)
import { auth } from "@/auth";
import AdminHeader from "@/components/layout/admin.header";
import AdminFooter from "@/components/layout/admin.footer";
import AdminSidebar from "@/components/layout/admin.sidebar";
import { Role } from "@/components/layout/layout.menu";

export default async function AdminPage() {
  const session = await auth(); // ✅ chạy ở server
  const role = session?.user?.role as Role | undefined;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar là client, nhận role từ server */}
      <AdminSidebar role={role} />

      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-4">
          {/* nội dung dashboard */}
          Admin dashboard
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
