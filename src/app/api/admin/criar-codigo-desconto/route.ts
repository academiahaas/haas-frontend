import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { code, discount_percent, valid_until } = await req.json();

    if (!code || !discount_percent || !valid_until) {
      return NextResponse.json({ error: "Faltam dados: code, discount_percent ou valid_until" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("discount_codes")
      .insert([{
        code: String(code).toUpperCase().trim(),
        discount_percent: Number(discount_percent),
        is_manual: true,
        valid_until
      }])
      .select("id, code")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sucesso: true, codigo: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ codigos: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
