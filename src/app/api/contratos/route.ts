import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const token = randomBytes(16).toString("hex");
  const c = await prisma.contrato.create({
    data: {
      titulo: body.titulo, tipo: body.tipo,
      firmanteEmail: body.email, firmanteNombre: body.nombre ?? null, firmanteDni: body.dni,
      tokenFirma: token, estado: "ENVIADO", creadoPorId: (session.user as any).id,
    },
  });
  return NextResponse.json(c, { status: 201 });
}
