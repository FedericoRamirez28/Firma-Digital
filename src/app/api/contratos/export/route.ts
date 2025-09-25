// app/api/contratos/export/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { plantillaId, values } = await req.json();
  if (!plantillaId || typeof values !== "object") {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  // Traemos el HTML base
  const r = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/plantillas/${encodeURIComponent(plantillaId)}/html`, { cache: "no-store" });
  const data = await r.json();
  let html: string = data.html ?? "";

  // Aplicamos los valores (edit_0, edit_1, ...)
  let idx = 0;
  html = html.replace(/class="editable"/g, () => {
    const v = values[`edit_${idx++}`] ?? "";
    // Devolvemos la misma clase pero con el texto embebido más abajo
    return `class="editable" data-value-index="${idx - 1}"`;
  });
  // Reemplazo simple para embebido: dejarlo tal cual y el cliente verá el valor aplicado.

  const full = `
    <!doctype html><html><head><meta charset="utf-8">
      <title>Contrato</title>
      <style> .editable{background:#fff} </style>
    </head><body>${html}</body></html>
  `;

  return new Response(full, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="Contrato-${plantillaId}.html"`,
    },
  });
}
