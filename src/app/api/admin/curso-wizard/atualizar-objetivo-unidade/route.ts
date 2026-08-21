import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function limparCodigo(texto: string) {
  return (texto || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 10);
}

export async function POST(req: NextRequest) {
  try {
    const { unit_id, pedagogical_objective, situational_content, hidden_grammatical_structure, practical_phonetic_focus, skill_label, success_code } = await req.json();
    const { error } = await supabase.from("units").update({
      pedagogical_objective, situational_content, hidden_grammatical_structure,
      practical_phonetic_focus, skill_label,
      success_code: limparCodigo(success_code),
    }).eq("id", unit_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sucesso: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
