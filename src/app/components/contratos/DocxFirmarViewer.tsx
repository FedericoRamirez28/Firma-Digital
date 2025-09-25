// app/components/contratos/DocxFirmarViewer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  plantillaId: string;
  values: Record<string, string>;
  firmaUrl?: string | null; // <- NUEVO
};

export default function DocxFirmarViewer({ plantillaId, values, firmaUrl }: Props) {
  const [html, setHtml] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const r = await fetch(`/api/plantillas/${encodeURIComponent(plantillaId)}/html`);
      const data = await r.json();
      if (!cancel) setHtml(data.html ?? "");
    })();
    return () => { cancel = true; };
  }, [plantillaId]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Inyectar campos editables ya bloqueados
    const nodes = root.querySelectorAll<HTMLElement>(".editable");
    nodes.forEach((el, idx) => {
      el.textContent = values[`edit_${idx}`] ?? el.textContent ?? "";
      el.setAttribute("contenteditable", "false");
      el.style.background = "#eef2ff";
    });

    // Inyectar la firma si existe
    const slot = root.querySelector<HTMLElement>(".firma-slot");
    if (firmaUrl) {
      const img = document.createElement("img");
      img.src = firmaUrl;
      img.alt = "Firma digital";
      img.style.maxWidth = "260px";
      img.style.display = "block";
      img.style.marginTop = "8px";
      img.style.objectFit = "contain";
      if (slot) {
        slot.innerHTML = "";
        slot.appendChild(img);
      } else {
        // Si no existe el placeholder, lo agregamos al final
        const cont = document.createElement("div");
        cont.className = "firma-slot";
        cont.appendChild(img);
        root.appendChild(cont);
      }
    }
  }, [html, values, firmaUrl]);

  return (
    <div
      ref={ref}
      className="min-h-[60vh] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
