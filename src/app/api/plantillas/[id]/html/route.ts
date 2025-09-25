// app/api/plantillas/[id]/html/route.ts
import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import mammoth from "mammoth";

const MAP: Record<string, { file: string; title: string }> = {
  "acto-ap": { file: "CONTRATO ACTO.docx", title: "Área Protegida — ACTO" },
  "mesmera-ap": { file: "CONTRATO MESMERA.docx", title: "Área Protegida — MESMERA" },
  "medom-laboral-socio": { file: "MEDICINA LABORAL Socio Nº.docx", title: "Medicina Laboral — Socio Nº" },
  "medom-laboral-ap": { file: "MEDICINA LABORAL. MEDOM CON A.P.docx", title: "Medicina Laboral + Área Protegida" },
};

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const meta = MAP[params.id];
  if (!meta) return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });

  const full = path.join(process.cwd(), "public", "plantillas", meta.file);
  try {
    await fs.access(full);
  } catch {
    return NextResponse.json({ error: "Archivo no disponible en el servidor" }, { status: 404 });
  }

  // StyleMap: todo lo resaltado en Word (highlight) → span[data-editable]
  // https://github.com/mwilliamson/mammoth.js#style-mappings
  const styleMap = `
    highlight => span.editable
  `;

  const result = await mammoth.convertToHtml(
    { path: full },
    { styleMap, includeDefaultStyleMap: true }
  );

  // Envolvemos con un contenedor y una mínima hoja de estilos embebida
  const html = `
    <style>
      .docx-container { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #0f172a; }
      .docx-container p { margin: 0 0 .75rem; line-height: 1.55; }
      .editable { background: #fff3c4; outline: none; border-radius: .25rem; padding: 0 .2rem; }
      .editable:focus { box-shadow: 0 0 0 2px rgba(99,102,241,.5); background: #fff; }
    </style>
    <div class="docx-container">${result.value}</div>
  `;

  return NextResponse.json({ title: meta.title, html });
}
