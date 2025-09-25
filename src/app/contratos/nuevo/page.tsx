// app/contratos/nuevo/page.tsx
import { redirect } from "next/navigation";
import NuevoContratoForm from "@/app/components/contratos/NuevoContratoForm";

const PLANTILLAS = {
  "acto-ap": { titulo: "Área Protegida — ACTO", archivoDoc: "CONTRATO ACTO.doc" },
  "mesmera-ap": { titulo: "Área Protegida — MESMERA", archivoDoc: "CONTRATO MESMERA.doc" },
  "medom-laboral-socio": { titulo: "Medicina Laboral — Socio Nº", archivoDoc: "MEDICINA LABORAL Socio Nº.doc" },
  "medom-laboral-ap": { titulo: "Medicina Laboral + Área Protegida", archivoDoc: "MEDICINA LABORAL. MEDOM CON A.P.doc" },
} as const;

export default function NuevoContratoPage({
  searchParams,
}: { searchParams: { plantilla?: string } }) {
  const id = searchParams?.plantilla as keyof typeof PLANTILLAS | undefined;
  if (!id || !(id in PLANTILLAS)) redirect("/post-login");

  const p = PLANTILLAS[id];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Nuevo contrato</h1>
          <p className="text-s text-slate-200">
            Plantilla seleccionada: <span className="font-medium">{p.titulo}</span>{" "}
            <span className="italic">({p.archivoDoc})</span>
          </p>
        </div>
        {/* El botón Volver va dentro del Client Component o como <a> simple */}
        <a href="/post-login" className="text-xl bg-white text-black hover:underline p-2 rounded-sm">Volver</a>
      </header>

      {/* Todo lo interactivo vive en el Client Component */}
      <NuevoContratoForm plantillaId={id} />
    </main>
  );
}
