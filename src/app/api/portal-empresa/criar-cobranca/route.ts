import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { corporate_account_id, boss_email, amount } = await req.json();

    if (!corporate_account_id || !boss_email || !amount) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("corporate_payments")
      .insert([{ corporate_account_id, boss_email, amount, status: "pending" }])
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: empresaInfo } = await supabase
      .from("corporate_accounts")
      .select("company_name")
      .eq("id", corporate_account_id)
      .maybeSingle();

    try {
      await fetch(`${req.nextUrl.origin}/api/email/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatario: "haasbruna@gmail.com",
          assunto: `Recordatorio: generar factura para ${empresaInfo?.company_name || "empresa corporativa"}`,
          corpoHtml: `<div style="font-family:Arial,sans-serif;padding:20px;color:#1e293b;"><h2>Nuevo pago corporativo registrado</h2><p><strong>Empresa:</strong> ${empresaInfo?.company_name || "N/A"}</p><p><strong>Correo:</strong> ${boss_email}</p><p><strong>Valor:</strong> $ ${Number(amount).toLocaleString("es-CO")} COP</p><p>Recuerda generar la factura electronica correspondiente en el portal de la DIAN.</p></div>`
        })
      });
    } catch (erroEmail) {
      console.error("Erro ao enviar lembrete de fatura:", erroEmail);
    }

    return NextResponse.json({ sucesso: true, payment_id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
