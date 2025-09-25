import { auth } from "@/auth";
import { redirect } from "next/navigation";

const roleHome = (role?: string) =>
  role === "admin"
    ? "/admin"
    : role === "tutor"
    ? "/tutor"
    : role === "parent"
    ? "/parent"
    : "/";

export default async function AfterLogin() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any)?.role as string | undefined;
  redirect(roleHome(role));
}
