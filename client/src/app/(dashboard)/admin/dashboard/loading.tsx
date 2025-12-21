import { auth } from "@/auth";
import type { Role } from "@/shared/components/layout/layout.menu";

export default async function AdminPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  return <div className="text-lg font-medium">Admin dashboard</div>;
}
