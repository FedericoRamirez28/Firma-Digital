// src/app/api/contratos/validar/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const dni = searchParams.get("dni");

  if (!token || !dni) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const contrato = await prisma.contrato.findFirst({
    where: { tokenFirma: token },
  });

  if (!contrato) {
    return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
  }

  if (contrato.firmanteDni !== dni) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
