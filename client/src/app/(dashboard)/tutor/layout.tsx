// app/(dashboard)/admin/layout.tsx
import { auth } from "@/auth";
import Header from "@/shared/components/layout/header";
import Footer from "@/shared/components/layout/footer";
import Sidebar from "@/shared/components/layout/sidebar";
import type { Role } from "@/shared/components/layout/layout.menu";
import TutorProfileGuard from "@/components/auth/TutorProfileGuard";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  return (
    <div className="min-h-screen flex">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col">
        <Header />
        <TutorProfileGuard>
          <main className="flex-1 p-4 bg-sky-100">{children}</main>
        </TutorProfileGuard>
        <Footer />
      </div>
    </div>
  );
}
