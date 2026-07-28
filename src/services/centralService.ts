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

    // 1.1 Competencias do usuario
    const { data: compData } = await supabase
      .from("user_competencias")
      .select("*")
      .eq("user_id", targetUid)
      .maybeSingle();

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

    let rawComp = profile?.competencias;
    if (typeof rawComp === "string") {
      try { rawComp = JSON.parse(rawComp); } catch (e) { rawComp = null; }
    }

    const baseScore = Number(profile?.placement_test_score ?? profile?.clinical_precision ?? 70);
    const competenciasObj = {
      habla: Number(compData?.habla ?? rawComp?.habla ?? profile?.habla ?? 0),
      escucha: Number(compData?.escucha ?? rawComp?.escucha ?? profile?.escucha ?? 0),
      gramatica: Number(compData?.gramatica ?? rawComp?.gramatica ?? profile?.gramatica ?? 0),
      escritura: Number(compData?.escritura ?? rawComp?.escritura ?? profile?.escritura ?? 0),
      lectura: Number(compData?.lectura ?? rawComp?.lectura ?? profile?.lectura ?? 0),
    };

    return {
      user: userObj,
      ...userObj,
      error_logs: await getUserErrorLogs(targetUid),
      
      ...profile,
      modules_content: modulesContentData || [],
      units: unitsData || [],
      unit_progress: unitProgressData || [],
      competencias: competenciasObj,
    };
  } catch (err) {
    console.error("❌ Erro ao processar Central Data:", err);
    return { user: null };
  }
}

export async function getTopRanking(limit: number = 10) {
  try {
    console.log('🔍 [DEBUG RANKING] Iniciando busca no Supabase...');
    const { data, error } = await supabase
      .from('users')
      .select('id, name, nickname, total_xp')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [DEBUG RANKING ERRO SUPABASE]:', error);
      return [];
    }

    console.log('🔥 [DEBUG RANKING DADOS RETORNADOS]:', data);
    return data || [];
  } catch (err) {
    console.error('❌ [DEBUG RANKING EXCEÇÃO]:', err);
    return [];
  }
}


export async function getUserErrorLogs(userId?: string) {
  try {
    const DEFAULT_ID = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
    const targetUid = userId || DEFAULT_ID;

    let { data, error } = await supabase
      /* Guard applied */ .from("user_error_logs")
      .select("id, user_id, conteudo, frequencia")
      .eq("user_id", targetUid);

    if ((!data || data.length === 0) && targetUid !== DEFAULT_ID) {
      const fallback = await supabase
        /* Guard applied */ .from("user_error_logs")
        .select("id, user_id, conteudo, frequencia")
        .eq("user_id", DEFAULT_ID);
      data = fallback.data;
    }

    if (error) {
      console.error("❌ [CentralService] Erro user_error_logs:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("❌ [CentralService] Excecao em getUserErrorLogs:", err);
    return [];
  }
}

export interface TeacherReviewPayload {
  user_id?: string | null;
  teacher_name?: string;
  rating_stars: number;
  comment?: string;
  class_date: string;
}

export async function submitTeacherReview(payload: TeacherReviewPayload) {
  try {
    const { data, error } = await supabase
      .from("teacher_reviews")
      .insert([
        {
          user_id: payload.user_id || null,
          teacher_name: payload.teacher_name || "Professor",
          rating_stars: payload.rating_stars,
          comment: payload.comment || "",
          class_date: payload.class_date
        }
      ]);

    if (error) {
      console.error("❌ [CentralService] Erro ao salvar teacher_review:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("❌ [CentralService] Exceção em submitTeacherReview:", err);
    return { success: false, error: err };
  }
}

export async function getExerciseByActivityType(unitId: string | undefined, activityType: number) {
  try {
    const DEFAULT_UNIT_ID = "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0";
    let targetUnit = (unitId && String(unitId).trim() !== "0" && String(unitId).length > 10) ? String(unitId) : "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0";

    // Tenta buscar o exercicio para o unit_id recebido
    let { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("unit_id", targetUnit)
      .eq("activity_type", activityType);

    // Se nao encontrar para a unidade atual ou a unidade nao for UUID valido, usa o fallback principal
    if ((!data || data.length === 0) && targetUnit !== DEFAULT_UNIT_ID) {
      const fallback = await supabase
        .from("exercises")
        .select("*")
        .eq("unit_id", DEFAULT_UNIT_ID)
        .eq("activity_type", activityType);

      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error(`❌ [CentralService] Erro ao buscar atividade ${activityType}:`, error.message);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error(`❌ [CentralService] Exceção em getExerciseByActivityType:`, err);
    return { success: false, data: [], error: err };
  }
}
