import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, corporate_account_id } = await req.json();

    if (!email || !corporate_account_id) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ corporate_account_id: null, corporate_group_id: null })
      .eq("email", email)
      .eq("corporate_account_id", corporate_account_id)
      .select("id, name, email");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No se encontro un colaborador con ese correo en tu empresa" }, { status: 404 });
    }

    return NextResponse.json({ sucesso: true, removido: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
