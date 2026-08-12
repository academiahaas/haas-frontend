import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_CONTACT_USER,
    pass: process.env.GMAIL_CONTACT_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { destinatario, assunto, corpoHtml } = await req.json();

    if (!destinatario || !assunto || !corpoHtml) {
      return NextResponse.json({ erro: "Parâmetros ausentes." }, { status: 400 });
    }

    await transporter.sendMail({
      from: '"Haas Language" <contact@academiahaas.com>',
      to: destinatario,
      subject: assunto,
      html: corpoHtml,
    });

    return NextResponse.json({ sucesso: true });
  } catch (err: any) {
    console.error("Erro ao enviar e-mail:", err);
    return NextResponse.json({ erro: "Falha ao enviar e-mail.", detalhe: err.message }, { status: 500 });
  }
}
