// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export type Role = "admin" | "comercial";

// Normaliza lo que venga de la DB (ADMIN/VENTAS, etc.)
function normalizeRole(input: unknown): Role {
  const v = String(input ?? "").trim().toLowerCase();
  if (["admin","administrator","adm","gerencia","manager"].includes(v)) return "admin";
  if (["ventas","seller","comercial","vendedor"].includes(v)) return "comercial";
  return "comercial";
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(c) {
        if (!c?.email || !c?.password) return null;

        const u = await prisma.user.findUnique({
          where: { email: c.email },
          select: { id: true, email: true, name: true, passwordHash: true, role: true },
        });
        if (!u) return null;

        const ok = await bcrypt.compare(c.password, u.passwordHash);
        if (!ok) return null;

        return {
          id: String(u.id),
          email: u.email,
          name: u.name ?? "",
          role: normalizeRole(u.role),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Al iniciar sesión copiamos role al token
      if (user) (token as any).role = (user as any).role as Role;

      // Fallback defensivo: si no hay role en el token, lo intentamos recuperar 1 vez
      if (!(token as any).role && token.sub) {
        const u = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        if (u?.role) (token as any).role = normalizeRole(u.role);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role as Role | undefined;
      }
      return session;
    },
  },
  // secret: process.env.NEXTAUTH_SECRET,
};

// Helper para Server Components / Route Handlers
export const getServerAuthSession = () => getServerSession(authOptions);

// (Opcional) Tipado de Session para TS:
// declare module "next-auth" {
//   interface Session {
//     user: { id: string; name?: string | null; email?: string | null; role: Role };
//   }
// }
