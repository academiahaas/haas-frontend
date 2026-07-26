import { supabase } from "@/lib/supabase";

export async function fetchCentralPortalData(): Promise<any> {
  try {
    // 1. Tenta pegar o ID da sessão ou usa o ID fixo de desenvolvimento
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || process.env.NEXT_PUBLIC_DEV_USER_ID || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

    console.log("🔍 [centralService] Buscando dados para o ID:", userId);

    // 2. Busca dados do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userError) console.error("❌ Erro ao buscar usuario:", userError);

    // 3. Busca assinatura do usuário
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (subError) console.error("❌ Erro ao buscar assinatura:", subError);

    console.log("✅ [centralService] Resposta final:", { user, subscription });

    return {
      user: user || null,
      subscription: subscription || null,
      error_logs: [],
      competencias: {
        habla: user?.competencia_habla || 0,
        escucha: user?.competencia_escucha || 0,
        lectura: user?.competencia_lectura || 0,
        escritura: user?.competencia_escritura || 0,
        gramatica: user?.competencia_gramatica || 0
      },
      aulas_assistidas: [],
      conquistas: [],
      submissions: [],
      modules_content: [],
      units: [],
      unit_progress: []
    };

  } catch (error) {
    console.error("❌ Erro fatal no fetchCentralPortalData:", error);
    return null;
  }
}
