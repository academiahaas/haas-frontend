import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "A senha precisa ter no mínimo 6 caracteres." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[criar-conta] Erro ao criar usuário no Auth:", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: data.msg || data.error_description || data.message || "Erro ao criar conta." }, { status: res.status });
    }

    // Envia e-mail de boas-vindas (não bloqueia a resposta se falhar)
    try {
      const nomeAluno = email.split("@")[0];
      fetch(`${req.nextUrl.origin}/api/email/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatario: email,
          assunto: "¡Bienvenido(a) a Haas Language! 🎉",
          corpoHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6; padding:40px 16px; font-family: Arial, Helvetica, sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(11,21,40,0.12);">

        <tr>
          <td style="background:linear-gradient(135deg,#0b1528,#0f2647); padding:40px 32px 32px 32px; text-align:center;">
            <img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" alt="Haas Academy" style="height:36px; margin-bottom:20px;" />
            <div style="font-size:38px; line-height:1; margin-bottom:12px;">🎉</div>
            <h1 style="color:#ffffff; font-size:24px; margin:0; font-weight:800;">¡Bienvenido(a) a Haas Academy!</h1>
            <p style="color:#9fb3d1; font-size:14px; margin:10px 0 0 0;">Tu viaje para hablar un nuevo idioma empieza hoy</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 32px 8px 32px;">
            <p style="color:#0b1528; font-size:16px; line-height:1.6; margin:0 0 8px 0; font-weight:700;">¡Hola, \${nomeAluno}!</p>
            <p style="color:#5a6478; font-size:14px; line-height:1.7; margin:0;">Ya diste el primer paso para dejar de traducir en tu cabeza y empezar a pensar &mdash; y hablar &mdash; en tu nuevo idioma de verdad. Nada de teoría aburrida: aquí se aprende hablando, desde el primer día.</p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:14px 16px; background:#f5f8fc; border-radius:12px;" width="33%">
                  <div style="font-size:22px; margin-bottom:6px;">⚡</div>
                  <div style="color:#0b1528; font-size:12px; font-weight:700; line-height:1.3;">Práctica real desde el día 1</div>
                </td>
                <td width="8"></td>
                <td style="padding:14px 16px; background:#f5f8fc; border-radius:12px;" width="33%">
                  <div style="font-size:22px; margin-bottom:6px;">🎯</div>
                  <div style="color:#0b1528; font-size:12px; font-weight:700; line-height:1.3;">Metodología pensada para ti</div>
                </td>
                <td width="8"></td>
                <td style="padding:14px 16px; background:#f5f8fc; border-radius:12px;" width="33%">
                  <div style="font-size:22px; margin-bottom:6px;">💬</div>
                  <div style="color:#0b1528; font-size:12px; font-weight:700; line-height:1.3;">Conversación, no solo gramática</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:8px 32px 40px 32px; text-align:center;">
            <a href="https://campus.academiahaas.com" style="background:linear-gradient(135deg,#0284c7,#0369a1); color:#fff; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:800; font-size:15px; display:inline-block; box-shadow:0 4px 14px rgba(2,132,199,0.35);">Comenzar mi primera lección →</a>
          </td>
        </tr>

        <tr>
          <td style="background:#f5f8fc; padding:24px 32px;">
            <p style="color:#8a93a3; font-size:11px; line-height:1.6; margin:0; text-align:center;">
              Haas Academy &mdash; Aprende un idioma de forma real.<br/>
              Síguenos en Instagram: <a href="https://www.instagram.com/haasidiomas/" style="color:#0284c7; text-decoration:none; font-weight:bold;">@haasidiomas</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`,
        }),
      }).catch((e) => console.warn("Erro ao enviar e-mail de boas-vindas:", e));
    } catch (emailErr) {
      console.warn("Erro ao processar e-mail de boas-vindas:", emailErr);
    }

    return NextResponse.json({ success: true, userId: data.id });
  } catch (err: any) {
    console.error("[criar-conta] Exceção:", err);
    return NextResponse.json({ error: "Erro interno ao criar conta." }, { status: 500 });
  }
}
