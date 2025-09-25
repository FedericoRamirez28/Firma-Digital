// src/app/components/contratos/DocxEditableViewer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import "../../styles/pages/DocxEditableViewer.scss";

type Props = {
  plantillaId: string;
  onChange?: (values: Record<string, string>) => void;
};

export default function DocxEditableViewer({ plantillaId, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const r = await fetch(`/api/plantillas/${encodeURIComponent(plantillaId)}/html`, { cache: "no-store" });
      const data = await r.json();
      if (!cancel) {
        if (!r.ok) throw new Error(data?.error || "Error al cargar plantilla");
        setTitle(data.title ?? "");
        setHtml(data.html ?? "");
        setLoading(false);
      }
    })().catch((e) => {
      if (!cancel) {
        // mensaje de error simple dentro del panel
        setTitle("Error");
        setHtml(`<div style="color:#b91c1c;font-size:0.875rem;">${e.message}</div>`);
        setLoading(false);
      }
    });
    return () => { cancel = true; };
  }, [plantillaId]);

  // Hacer editables solo los spans con .editable
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // bloqueamos la edición del contenedor
    root.setAttribute("contenteditable", "false");

    const nodes = root.querySelectorAll<HTMLElement>(".editable");
    nodes.forEach((el, idx) => {
      el.setAttribute("contenteditable", "true");
      el.setAttribute("tabindex", "0");
      el.dataset.index = String(idx);
    });

    const onInput = () => collectValues();
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains("editable")) {
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") ?? "";
        // insertText para pegar texto plano
        document.execCommand("insertText", false, text);
      }
    };

    root.addEventListener("input", onInput, true);
    root.addEventListener("paste", onPaste as any, true);
    return () => {
      root.removeEventListener("input", onInput, true);
      root.removeEventListener("paste", onPaste as any, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  const collectValues = () => {
    const root = ref.current;
    if (!root) return {};
    const out: Record<string, string> = {};
    root.querySelectorAll<HTMLElement>(".editable").forEach((el, i) => {
      out[`edit_${i}`] = el.innerText;
    });
    onChange?.(out);
    return out;
  };

  if (loading) return <div className="docxv__loading">Cargando plantilla…</div>;

  return (
    <div className="docxv">
      <div className="docxv__title">{title}</div>
      <div
        ref={ref}
        className="docxv__panel"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
