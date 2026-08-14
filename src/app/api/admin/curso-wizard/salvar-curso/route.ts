import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { title, objective_autonomy, operational_objective, estimated_hours } = await req.json();

    const { data, error } = await supabase
      .from("courses")
      .insert([{ id: crypto.randomUUID(), title, objective_autonomy, operational_objective, estimated_hours, created_at: new Date().toISOString() }])
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sucesso: true, course_id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
