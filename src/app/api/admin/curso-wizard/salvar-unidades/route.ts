import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { module_content_id, module_number, level, unidades } = await req.json();

    const linhas = unidades.map((u: any) => ({
      module_content_id,
      module_id: module_content_id,
      module_number,
      level,
      unit_number: u.unit_number,
      unit_title: u.unit_title,
      pedagogical_objective: u.pedagogical_objective,
      situational_content: u.situational_content,
      hidden_grammatical_structure: u.hidden_grammatical_structure,
      estimated_hours: u.estimated_hours,
      required_xp: 150
    }));

    const { data, error } = await supabase.from("units").insert(linhas).select("id, unit_title");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sucesso: true, unidades: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
