import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { corporate_account_id, boss_email, amount, group_id, quantidade_pessoas } = await req.json();

    if (!corporate_account_id || !boss_email || !amount) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("corporate_payments")
      .insert([{ corporate_account_id, boss_email, amount, status: "pending", group_id: group_id || null, quantidade_pessoas: quantidade_pessoas || 1 }])
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
          destinatario: boss_email,
          assunto: "Pago registrado — Haas Academy",
          corpoHtml: `<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;"><h2>Pago registrado</h2><p>Hemos registrado tu aviso de pago por <strong>$ ${Number(amount).toLocaleString("es-CO")} COP</strong>. El sistema verificará el valor recibido y activará tu plan automáticamente una vez confirmado. Te enviaremos otro correo cuando esto ocurra.</p><hr/><p style="color:#999;font-size:11px;">Haas Language</p></div>`
        })
      });
    } catch (erroEmailChefe) {
      console.error("Erro ao enviar email para o chefe:", erroEmailChefe);
    }

    try {
      await fetch(`${req.nextUrl.origin}/api/email/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatario: "haasbruna@gmail.com",
          assunto: `Recordatorio: generar factura para ${empresaInfo?.company_name || "empresa corporativa"}`,
          corpoHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6; padding:40px 16px; font-family: Arial, Helvetica, sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(11,21,40,0.12);">
      <tr><td style="background:linear-gradient(135deg,#0b1528,#0f2647); padding:40px 32px 32px 32px; text-align:center;">
        <img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" alt="Haas Academy" style="height:36px; margin-bottom:20px;" />
        <div style="font-size:38px; line-height:1; margin-bottom:12px;">🧾</div>
        <h1 style="color:#ffffff; font-size:22px; margin:0; font-weight:800;">Nuevo Pago Corporativo</h1>
        <p style="color:#9fb3d1; font-size:13px; margin:10px 0 0 0;">Registrado en el portal empresarial</p>
      </td></tr>
      <tr><td style="padding:36px 32px 24px 32px;">
        <div style="color:#333; font-size:15px; line-height:1.8;">
          <p style="margin:0 0 8px 0;"><strong>Empresa:</strong> ${empresaInfo?.company_name || "N/A"}</p>
          <p style="margin:0 0 8px 0;"><strong>Correo:</strong> ${boss_email}</p>
          <p style="margin:0 0 16px 0;"><strong>Valor:</strong> $ ${Number(amount).toLocaleString("es-CO")} COP</p>
          <p style="margin:0;">Recuerda generar la factura electrónica correspondiente en el portal de la DIAN.</p>
        </div>
      </td></tr>
      <tr><td style="background:#f5f8fc; padding:24px 32px;">
        <p style="color:#8a93a3; font-size:11px; line-height:1.6; margin:0; text-align:center;">Haas Language</p>
      </td></tr>
    </table>
  </td></tr>
</table>`
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
