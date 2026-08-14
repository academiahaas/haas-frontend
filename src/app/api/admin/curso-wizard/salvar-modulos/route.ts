import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { level_id, level_tag, modulos } = await req.json();

    const linhas = modulos.map((m: any) => ({
      id: crypto.randomUUID(),
      level_id,
      level_tag,
      module_number: m.module_number,
      module_title: m.module_title,
      pedagogical_objective: m.pedagogical_objective,
      thematic_content: m.thematic_content,
      estimated_hours: m.estimated_hours,
      required_xp: 600
    }));

    const { data, error } = await supabase.from("modules_content").insert(linhas).select("id, module_title, module_number");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sucesso: true, modulos: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
