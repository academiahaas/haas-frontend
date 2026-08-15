import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { corporate_account_id, plan_key, nombre, email, dias, horario, idioma_curso } = await req.json();

    if (!corporate_account_id || !plan_key || !nombre || !email || !idioma_curso) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const { data: convite, error: erroConvite } = await supabase
      .from("corporate_pending_invites")
      .insert([{
        corporate_account_id,
        plan_key,
        nombre,
        email,
        dias_semana: dias || null,
        horario: horario || null,
        idioma_curso
      }])
      .select("id")
      .single();

    if (erroConvite) {
      console.error("Erro ao criar convite pendente:", erroConvite);
      return NextResponse.json({ error: erroConvite.message }, { status: 500 });
    }

    return NextResponse.json({ sucesso: true, convite_id: convite.id });
  } catch (err: any) {
    console.error("Erro inesperado em agregar-colaborador:", err);
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
