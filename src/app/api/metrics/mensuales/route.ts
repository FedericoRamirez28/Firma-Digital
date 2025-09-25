// app/api/metrics/mensuales/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    { mes: "Ene", ventas: 14, firmados: 9 },
    { mes: "Feb", ventas: 11, firmados: 8 },
    { mes: "Mar", ventas: 18, firmados: 13 },
    { mes: "Abr", ventas: 20, firmados: 15 },
    { mes: "May", ventas: 22, firmados: 18 },
    { mes: "Jun", ventas: 25, firmados: 20 },
  ];
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
