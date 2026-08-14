import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { unit_id, pedagogical_objective, situational_content, hidden_grammatical_structure } = await req.json();
    const { error } = await supabase.from("units").update({ pedagogical_objective, situational_content, hidden_grammatical_structure }).eq("id", unit_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sucesso: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
