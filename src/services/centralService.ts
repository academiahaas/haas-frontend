import { supabase } from "@/lib/supabase";

const MEU_ID_USUARIO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

export async function fetchCentralPortalData(overrideUid?: string): Promise<Record<string, any>> {
  try {
    const targetUid = overrideUid || MEU_ID_USUARIO;

    // 1. Dados do perfil do usuário
    const { data: profile, error } = await supabase
      .from("users")
      .select("*, trained_days")
      .eq("id", targetUid)
      .maybeSingle();

    if (error) console.error("❌ Erro ao buscar dados na tabela users:", error.message);

    // 2. Assinatura ativa vinculada
    const { data: subData } = await supabase
      .from("user_subscriptions")
      .select("expiration_date, plan_category, class_credits_available, replacement_credits")
      .eq("user_id", targetUid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Progresso em unidades
    const { data: unitProgressData } = await supabase
      .from("user_unit_progress")
      .select("unit_xp, unit_id")
      .eq("user_id", targetUid);

    const calculatedUnitXp = (unitProgressData || []).reduce((acc: number, curr: any) => acc + (Number(curr.unit_xp) || 0), 0);
    const lastUnitId = unitProgressData && unitProgressData.length > 0 ? unitProgressData[unitProgressData.length - 1].unit_id : null;

    let calculatedRequiredXp = 0;
    if (lastUnitId) {
      const { data: unitInfo } = await supabase
        .from("units")
        .select("required_xp")
        .eq("id", lastUnitId)
        .maybeSingle();
      if (unitInfo?.required_xp) calculatedRequiredXp = Number(unitInfo.required_xp);
    } else {
      const { data: firstUnit } = await supabase
        .from("units")
        .select("required_xp")
        .limit(1)
        .maybeSingle();
      if (firstUnit?.required_xp) calculatedRequiredXp = Number(firstUnit.required_xp);
    }

    // Estrutura unificada puramente baseada nos dados REAIS do Supabase
    
    // 4. Busca Módulos e Unidades para a Trilha
    const { data: modulesContentData } = await supabase
      .from("modules_content")
      .select("*");

    const { data: unitsData } = await supabase
      .from("units")
      .select("*");

    const userObj = {
      id: profile?.id || targetUid,
      name: profile?.name || null,
      full_name: profile?.full_name || profile?.name || null,
      nickname: profile?.nickname || null,
      streak_days: profile?.streak_days ?? 0,
      total_xp: profile?.total_xp ?? 0,
      chat_credits: profile?.chat_credits ?? 0,
      current_level: profile?.current_level || null,
      student_type: profile?.student_type || null,
      clinical_precision: profile?.clinical_precision ?? 0,
      active_vocabulary: profile?.active_vocabulary ?? profile?.active_days ?? 0,
      active_days: profile?.active_days ?? profile?.active_vocabulary ?? 0,
      total_immersion: profile?.total_immersion ?? profile?.total_immersion_es ?? 0,
      total_immersion_es: profile?.total_immersion_es ?? profile?.total_immersion ?? 0,
      trained_days: (() => {
        const td = profile?.trained_days;
        if (!td) return [];
        if (typeof td === "string") {
          try { return JSON.parse(td); } catch (e) { return []; }
        }
        return Array.isArray(td) ? td : [];
      })(),
      expiration_date: subData?.expiration_date || profile?.expiration_date || null,
      next_expiration_es: subData?.expiration_date || profile?.expiration_date || null,
      plan_category: subData?.plan_category || profile?.plan_category || null,
      class_credits_available: subData?.class_credits_available ?? profile?.class_credits_available ?? 0,
      replacement_credits: subData?.replacement_credits ?? profile?.replacement_credits ?? 0,
      course_language: profile?.course_language || null,
      target_level: profile?.target_level || null,
      unit_xp: calculatedUnitXp,
      required_xp: calculatedRequiredXp,
    };

    const competenciasObj = profile?.competencias || {
      habla: profile?.habla ?? 0,
      escucha: profile?.escucha ?? 0,
      lectura: profile?.lectura ?? 0,
      escritura: profile?.escritura ?? 0,
    };

    return {
      user: userObj,
      ...userObj,
      error_logs: profile?.error_logs || [],
      
      competencias: competenciasObj,
      modules_content: modulesContentData || [],
      units: unitsData || [],
      unit_progress: unitProgressData || [],
      ...profile,
    };
  } catch (err) {
    console.error("❌ Erro ao processar Central Data:", err);
    return { user: null };
  }
}
