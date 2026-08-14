import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    const { data: cursos } = await supabase
      .from("courses")
      .select("id, title, estimated_hours, created_at")
      .order("created_at", { ascending: false });

    if (!cursos) return NextResponse.json({ cursos: [] });

    const resultado = [];

    for (const curso of cursos) {
      const { data: niveis } = await supabase
        .from("levels")
        .select("id, level_tag, level_name, pedagogical_focus, total_hours")
        .eq("course_id", curso.id)
        .order("level_tag");

      const totalNiveis = niveis?.length || 0;
      const niveisComObjetivo = (niveis || []).filter((n) => n.pedagogical_focus).length;

      let modulosContagem = 0;
      let modulosComObjetivo = 0;
      let unidadesContagem = 0;
      let unidadesComObjetivo = 0;

      if (niveis && niveis.length > 0) {
        const idsNiveis = niveis.map((n) => n.id);
        const { data: modulos } = await supabase
          .from("modules_content")
          .select("id, level_id, module_title, pedagogical_objective")
          .in("level_id", idsNiveis);

        modulosContagem = modulos?.length || 0;
        modulosComObjetivo = (modulos || []).filter((m) => m.pedagogical_objective).length;

        if (modulos && modulos.length > 0) {
          const idsModulos = modulos.map((m) => m.id);
          const { data: unidades } = await supabase
            .from("units")
            .select("id, module_content_id, pedagogical_objective")
            .in("module_content_id", idsModulos);

          unidadesContagem = unidades?.length || 0;
          unidadesComObjetivo = (unidades || []).filter((u) => u.pedagogical_objective).length;
        }
      }

      const completo = totalNiveis > 0 && niveisComObjetivo === totalNiveis && modulosContagem > 0 && modulosComObjetivo === modulosContagem && unidadesContagem > 0 && unidadesComObjetivo === unidadesContagem;

      resultado.push({
        id: curso.id,
        title: curso.title,
        estimated_hours: curso.estimated_hours,
        totalNiveis,
        niveisComObjetivo,
        modulosContagem,
        modulosComObjetivo,
        unidadesContagem,
        unidadesComObjetivo,
        completo
      });
    }

    return NextResponse.json({ cursos: resultado });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
