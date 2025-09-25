// app/firmar/[token]/page.tsx
import jwt from "jsonwebtoken";
import { notFound } from "next/navigation";
import FirmarYEnviar from "@/app/components/contratos/FirmarYEnviar";

const SECRET = process.env.NEXTAUTH_SECRET!;

export default function FirmaDesdeLinkPage({ params }: { params: { token: string } }) {
  try {
    const payload = jwt.verify(params.token, SECRET) as { plantillaId: string; values: Record<string,string> };
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-xl font-semibold">Revisión y firma</h1>
        <FirmarYEnviar token={params.token} plantillaId={payload.plantillaId} values={payload.values} />
      </main>
    );
  } catch {
    notFound();
  }
}
