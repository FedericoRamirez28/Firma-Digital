// app/components/contratos/FirmarYEnviar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import DigitalSignature from "../ui/DigitalSignature";
import DocxFirmarViewer from "./DocxFirmarViewer";

type Props = {
  token: string;
  plantillaId: string;
  values: Record<string, string>;
};

export default function FirmarYEnviar({ token, plantillaId, values }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [to, setTo] = useState("");

  useEffect(() => {
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    const small = window.matchMedia?.("(max-width: 768px)")?.matches;
    setIsMobile(Boolean(coarse || small));
  }, []);

  async function saveSignature(dataUrl: string) {
    const r = await fetch(`/api/contratos/firmar?token=${encodeURIComponent(token)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firmaDataUrl: dataUrl }),
    });
    if (!r.ok) {
      alert("No se pudo guardar la firma");
      return;
    }
    const { url } = await r.json();
    setFirmaUrl(url); // <- esto actualiza el viewer
  }

  async function sendEmail() {
    if (!to) { alert("Ingresá un email destino"); return; }
    setSending(true);
    try {
      const r = await fetch(`/api/contratos/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, token }),
      });
      if (!r.ok) throw new Error("email");
      alert("¡Enviado!");
    } catch {
      alert("No se pudo enviar el mail");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6">
      <DocxFirmarViewer plantillaId={plantillaId} values={values} firmaUrl={firmaUrl} />

      {/* Acciones de firma */}
      {isMobile ? (
        <div className="flex gap-3">
          <button
            className="bg-indigo-600 text-white rounded px-4 py-2"
            onClick={() => setModalOpen(true)}
          >
            Firmar (móvil)
          </button>
          {firmaUrl && <span className="text-green-700 font-medium">Firma guardada</span>}
        </div>
      ) : (
        <div className="rounded-2xl border p-4">
          <p className="mb-3 font-medium">Firmar con mouse (PC)</p>
          <DigitalSignature
            mode="inline"
            onConfirm={saveSignature}
          />
          {firmaUrl && <p className="mt-2 text-green-700 font-medium">Firma guardada</p>}
        </div>
      )}

      {/* Modal mobile */}
      <DigitalSignature
        mode="modal"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={(dataUrl) => {
          saveSignature(dataUrl);
          setModalOpen(false);
        }}
      />

      {/* Enviar por mail */}
      <div className="rounded-2xl border p-4 grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-slate-600">Enviar a</span>
          <input
            type="email"
            value={to}
            onChange={e => setTo((e.target as HTMLInputElement).value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="cliente@correo.com"
          />
        </label>
        <button
          className="bg-emerald-600 text-white rounded px-4 py-2 disabled:opacity-50"
          onClick={sendEmail}
          disabled={!firmaUrl || sending}
          title={!firmaUrl ? "Primero guardá la firma" : ""}
        >
          {sending ? "Enviando..." : "Enviar contrato por mail"}
        </button>
      </div>
    </div>
  );
}
