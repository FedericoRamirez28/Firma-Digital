import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type Role = "admin" | "comercial";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // dejar pasar login y callbacks
  if (url.pathname.startsWith("/login") || url.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = (token as any)?.role as Role | undefined;

  if (!token) {
    const to = new URL("/login", req.url);
    to.searchParams.set("callbackUrl", url.pathname + url.search);
    return NextResponse.redirect(to);
  }

  const isAdminZone = url.pathname.startsWith("/admin");
  const isComZone  = url.pathname.startsWith("/comercial");

  if (isAdminZone && role !== "admin") {
    return NextResponse.redirect(new URL("/comercial/contratos", req.url));
  }
  if (isComZone && role !== "comercial") {
    return NextResponse.redirect(new URL("/admin/contratos", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/comercial/:path*"],
};
