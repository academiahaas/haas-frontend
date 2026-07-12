import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Usa a sua central oficial de conexões

export async function POST(request: Request) {
  try {
    const { user_id, unit_id, score } = await request.json();

    const finalUserId = user_id || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
    // Unidade fixa recuperada do seu banco caso venha nula ou um índice inválido do front
    const finalUnitId = (unit_id && unit_id.length > 5) ? unit_id : "b4a4526f-5ed8-4836-b1c1-8f18a5851b49";

    // 1. 🔍 BUSCA REAL: Pega os tipos de exercícios direto da sua central do Supabase
    const { data: exercicios, error: fetchError } = await supabase
      .from("exercises")
      .select("activity_type, difficulty_level");

    if (fetchError || !exercicios || exercicios.length === 0) {
      return NextResponse.json({ error: "Nenhum exercício encontrado no banco." }, { status: 404 });
    }

    // Filtra dinamicamente baseado no desempenho real
    const fáceis = exercicios.filter(e => e.difficulty_level === "easy" || e.difficulty_level === "medium").map(e => e.activity_type);
    const difíceis = exercicios.filter(e => e.difficulty_level === "hard").map(e => e.activity_type);

    let listaAlvo = exercicios.map(e => e.activity_type);

    if (score < 70 && fáceis.length > 0) {
      listaAlvo = fáceis;
    } else if (score >= 70 && difíceis.length > 0) {
      listaAlvo = difíceis;
    }

    const tiposUnicos = Array.from(new Set(listaAlvo));
    const nextActivityType = tiposUnicos[Math.floor(Math.random() * tiposUnicos.length)];

    // 2. 💾 GRAVAÇÃO NA CENTRAL: Atualiza a tabela através do cliente oficial
    const { error: upsertError } = await supabase
      .from("user_ia_decisions")
      .upsert(
        { 
          user_id: finalUserId, 
          unit_id: finalUnitId, 
          chosen_activity_type: nextActivityType, 
          updated_at: new Date().toISOString() 
        },
        { onConflict: "user_id,unit_id" }
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, recommended_activity: nextActivityType });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
