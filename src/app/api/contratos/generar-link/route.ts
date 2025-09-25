// app/api/contratos/generar-link/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(req: Request) {
  const { plantillaId, values } = await req.json();
  if (!plantillaId || typeof values !== "object") {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }
  const token = jwt.sign({ plantillaId, values }, SECRET, { expiresIn: "7d" });
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${base}/firmar/${encodeURIComponent(token)}`;
  return NextResponse.json({ url });
}
