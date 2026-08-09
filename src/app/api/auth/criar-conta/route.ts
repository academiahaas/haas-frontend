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

    return NextResponse.json({ success: true, userId: data.id });
  } catch (err: any) {
    console.error("[criar-conta] Exceção:", err);
    return NextResponse.json({ error: "Erro interno ao criar conta." }, { status: 500 });
  }
}
