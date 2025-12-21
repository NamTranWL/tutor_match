import { auth } from "@/auth";
import type { Role } from "@/shared/components/layout/layout.menu";

export default async function ParentPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  return <div className="text-lg font-medium">Parent dashboard</div>;
}
