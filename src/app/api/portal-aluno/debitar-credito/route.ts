import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { userId, tipoBanco, novoValor } = await request.json();

    const supabaseUrl = "https://jdppxfokfhqjudwfwckd.supabase.co";
    const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const campoCredito = tipoBanco === "replacement" ? "replacement_credits" : "class_credits_available";

    const { error } = await supabaseAdmin
      .from("user_subscriptions")
      .update({ [campoCredito]: novoValor })
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
