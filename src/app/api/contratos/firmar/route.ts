import { prisma } from "@/lib/db"; import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const u = new URL(req.url); const token = u.searchParams.get("token"); const dni = u.searchParams.get("dni");
  if (!token || !dni) return NextResponse.json({ error:"faltan datos" }, { status:400 });
  const c = await prisma.contrato.findFirst({ where: { tokenFirma: token } });
  if (!c) return NextResponse.json({ error:"no existe" }, { status:404 });
  return c.firmanteDni === dni ? NextResponse.json({ ok:true }) : NextResponse.json({ error:"dni" }, { status:401 });
}
