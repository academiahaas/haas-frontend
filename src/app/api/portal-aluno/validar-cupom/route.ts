import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { code, user_id } = await req.json();

    if (!code) {
      return NextResponse.json({ valido: false, erro: "Codigo nao informado" }, { status: 400 });
    }

    const codigoLimpo = String(code).toUpperCase().trim();
    const hoje = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("discount_codes")
      .select("id, code, discount_percent, user_id, is_manual, valid_until, used")
      .eq("code", codigoLimpo)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ valido: false, erro: "Codigo nao encontrado" });
    }

    if (data.used) {
      return NextResponse.json({ valido: false, erro: "Este codigo ja foi utilizado" });
    }

    if (data.valid_until < hoje) {
      return NextResponse.json({ valido: false, erro: "Este codigo esta vencido" });
    }

    if (!data.is_manual && data.user_id && data.user_id !== user_id) {
      return NextResponse.json({ valido: false, erro: "Este codigo nao pertence a esta conta" });
    }

    return NextResponse.json({ valido: true, discount_percent: data.discount_percent, codigo_id: data.id });
  } catch (err: any) {
    return NextResponse.json({ valido: false, erro: "Erro inesperado" }, { status: 500 });
  }
}
