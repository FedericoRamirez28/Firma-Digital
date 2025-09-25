// app/components/contratos/DigitalSignature.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";

type DigitalSignatureProps = {
  open?: boolean;            // si es modal
  onClose?: () => void;      // si es modal
  mode?: "inline" | "modal"; // decide layout
  onConfirm: (dataUrl: string) => void;
};

export default function DigitalSignature({ open = false, onClose, mode = "inline", onConfirm }: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pad, setPad] = useState<SignaturePad | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (pad) return;

    const instance = new SignaturePad(canvasRef.current, { minWidth: 1, maxWidth: 3 });
    (instance as any).addEventListener?.("endStroke", () => {
      setDataUrl(instance.toDataURL("image/png"));
    });
    setPad(instance);

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const canvas = canvasRef.current!;
      const { offsetWidth, offsetHeight } = canvas;
      canvas.width = offsetWidth * ratio;
      canvas.height = offsetHeight * ratio;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(ratio, ratio);
      instance.clear();
      setDataUrl(null);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [pad]);

  const content = (
    <div className="grid gap-3">
      <div className="border rounded bg-white">
        <canvas ref={canvasRef} className="w-full h-64 block" />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          className="border rounded px-4 py-2"
          onClick={() => {
            pad?.clear();
            setDataUrl(null);
          }}
        >
          Limpiar
        </button>
        <button
          className="bg-indigo-600 text-white rounded px-4 py-2 disabled:opacity-50"
          disabled={!dataUrl}
          onClick={() => dataUrl && onConfirm(dataUrl)}
        >
          Aceptar
        </button>
      </div>
    </div>
  );

  if (mode === "inline") return content;

  // Modal
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                      w-full md:w-[700px] bg-white rounded-t-2xl md:rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Firmar</h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded hover:bg-slate-100">✕</button>
        </div>
        {content}
      </div>
    </div>
  );
}
