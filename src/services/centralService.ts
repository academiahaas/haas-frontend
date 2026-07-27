import { supabase } from "@/lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const MEU_ID_USUARIO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

export async function fetchCentralPortalData(overrideUid?: string): Promise<Record<string, any>> {
  try {
    const targetUid = overrideUid || MEU_ID_USUARIO;
    console.log("📡 Buscando dados no banco para o ID:", targetUid);

    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", targetUid)
      .maybeSingle();

    if (error) console.error("❌ Erro ao buscar dados na View:", error.message);

    // Busca direta da assinatura para garantir o vencimento correto
    const { data: subData } = await supabase
      .from("user_subscriptions")
      .select("expiration_date")
      .eq("id", targetUid)
      .maybeSingle();

    const userObj = {
      id: profile?.id || targetUid,
      name: profile?.name || "Seu Nome",
      full_name: profile?.full_name || profile?.name || "Seu Nome Completo",
      nickname: profile?.nickname || "Seu Apelido",
      streak_days: profile?.streak_days || 0,
      total_xp: profile?.total_xp || 0,
      chat_credits: profile?.chat_credits || 0,
      current_level: profile?.current_level || "INICIANTE",
      student_type: profile?.student_type || "padrao",
      clinical_precision: profile?.clinical_precision || 0,
      active_vocabulary: profile?.active_vocabulary || 0,
      total_immersion: profile?.total_immersion || profile?.total_immersion_es || 0,
      trained_days: profile?.trained_days || [],
      expiration_date: subData?.expiration_date || profile?.expiration_date || null,
    };

    const competenciasObj = profile?.competencias || {
      habla: profile?.habla || 0,
      escucha: profile?.escucha || 0,
      lectura: profile?.lectura || 0,
      escritura: profile?.escritura || 0,
    };

    return {
      user: userObj,
      ...userObj,
      error_logs: profile?.error_logs || [],
      competencias: competenciasObj,
      ...profile,
    };
  } catch (err) {
    console.error("❌ Erro inesperado:", err);
  }

  const defaultUser = {
    id: MEU_ID_USUARIO,
    name: "Sem Dados no Banco",
    full_name: "Sem Dados no Banco",
    nickname: "Sem Apelido",
    streak_days: 0,
    total_xp: 0,
    chat_credits: 0,
    current_level: "INICIANTE",
    student_type: "padrao",
    clinical_precision: 0,
    active_vocabulary: 0,
    total_immersion_es: 0,
    trained_days: [],
  };

  return {
    user: defaultUser,
    ...defaultUser,
    error_logs: [],
    competencias: { habla: 0, escucha: 0, lectura: 0, escritura: 0 },
  };
}
