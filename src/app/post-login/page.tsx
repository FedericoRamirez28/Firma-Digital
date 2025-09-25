// app/post-login/page.tsx
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export default async function PostLoginPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/login");

  const role = (session.user as any)?.role as "admin" | "comercial" | undefined;

  if (role === "admin") redirect("/admin/contratos");
  if (role === "comercial") redirect("/comercial/contratos");

  // Fallback: si no hay rol, entramos como comercial para evitar loops
  redirect("/(comercial)/contratos");
}
