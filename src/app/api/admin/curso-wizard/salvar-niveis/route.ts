import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { course_id, niveis } = await req.json();

    const linhas = niveis.map((n: any) => ({
      id: crypto.randomUUID(),
      course_id,
      level_tag: n.level_tag,
      level_name: n.level_name,
      pedagogical_focus: n.pedagogical_focus,
      total_hours: n.total_hours,
      required_xp: 3000
    }));

    const { data, error } = await supabase.from("levels").insert(linhas).select("id, level_tag");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const horasTotais = niveis.reduce((soma: number, n: any) => soma + (n.total_hours || 0), 0);
    await supabase.from("courses").update({ estimated_hours: horasTotais }).eq("id", course_id);

    return NextResponse.json({ sucesso: true, niveis: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
