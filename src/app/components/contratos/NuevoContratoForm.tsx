// src/app/components/contratos/NuevoContratoForm.tsx
"use client";

import { useRef, useState } from "react";
import DocxEditableViewer from "./DocxEditableViewer";
import "../../styles/pages/NuevoContratoForm.scss";

export default function NuevoContratoForm({ plantillaId }: { plantillaId: string }) {
  const valuesRef = useRef<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [linkPrivado, setLinkPrivado] = useState<string | null>(null);

  const onValues = (vals: Record<string, string>) => {
    valuesRef.current = vals;
  };

  const generarEnlacePrivado = async () => {
    setGenerating(true);
    try {
      const r = await fetch("/api/contratos/generar-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantillaId, values: valuesRef.current }),
      });
      const data = await r.json();
      setLinkPrivado(data.url);
    } finally {
      setGenerating(false);
    }
  };

  const descargarCopia = async () => {
    const r = await fetch("/api/contratos/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantillaId, values: valuesRef.current, format: "html-pdf" }),
    });
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Contrato-${plantillaId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ncf">
      <DocxEditableViewer plantillaId={plantillaId} onChange={onValues} />

      <div className="ncf__actions">
        <button
          type="button"
          onClick={generarEnlacePrivado}
          className="ncf-btn ncf-btn--primary"
          disabled={generating}
          aria-busy={generating}
        >
          {generating ? "Generando…" : "Generar enlace"}
        </button>

        <button
          type="button"
          onClick={descargarCopia}
          className="ncf-btn ncf-btn--secondary"
        >
          Descargar una copia
        </button>
      </div>

      {linkPrivado && (
        <div className="ncf__notice">
          <span>Enlace privado listo: </span>
          <a href={linkPrivado} className="ncf__link" target="_blank" rel="noreferrer">
            {linkPrivado}
          </a>
        </div>
      )}
    </div>
  );
}
