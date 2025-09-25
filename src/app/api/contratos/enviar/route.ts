// app/api/contratos/enviar/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";



const FROM = process.env.MAIL_FROM!;
const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;

export async function POST(req: NextRequest) {
  try {
    const { to, token } = await req.json() as { to: string; token: string };
    if (!to || !token) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/firmar/${encodeURIComponent(token)}`;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: FROM,
      to,
      subject: "Contrato firmado / revisión",
      html: `
        <p>Hola,</p>
        <p>Te enviamos el contrato para su revisión y/o descarga.</p>
        <p><a href="${url}">Abrir contrato</a></p>
        <p>Saludos.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "No se pudo enviar el mail" }, { status: 500 });
  }
}
