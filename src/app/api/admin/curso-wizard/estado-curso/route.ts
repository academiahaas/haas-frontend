import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { course_id } = await req.json();

    const { data: curso } = await supabase.from("courses").select("*").eq("id", course_id).single();
    if (!curso) return NextResponse.json({ error: "Curso nao encontrado" }, { status: 404 });

    const { data: niveis } = await supabase
      .from("levels")
      .select("*")
      .eq("course_id", course_id)
      .order("level_tag");

    const niveisComModulos = [];
    for (const nivel of niveis || []) {
      const { data: modulos } = await supabase
        .from("modules_content")
        .select("*")
        .eq("level_id", nivel.id)
        .order("module_number");

      const modulosComUnidades = [];
      for (const modulo of modulos || []) {
        const { data: unidades } = await supabase
          .from("units")
          .select("*")
          .eq("module_content_id", modulo.id)
          .order("unit_number");

        modulosComUnidades.push({ ...modulo, unidades: unidades || [] });
      }

      niveisComModulos.push({ ...nivel, modulos: modulosComUnidades });
    }

    return NextResponse.json({ sucesso: true, curso, niveis: niveisComModulos });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
