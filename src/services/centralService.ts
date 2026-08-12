import { supabase } from "@/lib/supabase";

const MEU_ID_USUARIO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

export async function fetchCentralPortalData(overrideUid?: string): Promise<Record<string, any>> {
  try {
    let targetUid = overrideUid;
    if (!targetUid && typeof window !== "undefined") {
      targetUid = localStorage.getItem("haas_user_id") || localStorage.getItem("haas_uid") || localStorage.getItem("supabase_uid") || undefined;
    }
    if (!targetUid) {
      const { data: authData } = await supabase.auth.getUser();
      targetUid = authData?.user?.id || undefined;
    }

    let profile: any = null;

    // 1. Tenta buscar diretamente na tabela users pelo ID
    if (targetUid) {
      const { data: userById } = await supabase
        .from("users")
        .select("*, trained_days")
        .eq("id", targetUid)
        .maybeSingle();
      profile = userById;
    }

    // 2. Se não encontrou em users, busca em user_subscriptions (por sub_id, user_id ou email)
    if (!profile && targetUid) {
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("*")
        .or(`id.eq.${targetUid},user_id.eq.${targetUid},email.eq.${targetUid}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subData) {
        const searchRef = subData.user_id || subData.email;
        if (searchRef) {
          const { data: userBySub } = await supabase
            .from("users")
            .select("*, trained_days")
            .or(`id.eq.${searchRef},email.eq.${searchRef}`)
            .maybeSingle();
          profile = userBySub;
        }

        // 3. Se a linha em users ainda não existir, sintetiza o perfil direto dos dados da assinatura
        if (!profile) {
          const nomeCompleto = `${subData.first_name || ""} ${subData.last_name || ""}`.trim() || "Estudante";
          profile = {
            id: subData.user_id || subData.id,
            email: subData.email,
            name: nomeCompleto,
            first_name: subData.first_name || "Estudante",
            last_name: subData.last_name || "",
            current_level: subData.current_level || "A1",
            modulo_atual: 1,
            unidade_atual: 1,
            total_xp: 0,
            unit_xp: 0,
            course_language: subData.course_language || "ingles"
          };
        }
      }
    }

    // 4. Fallback final por e-mail no localStorage
    if (!profile && typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("haas_user_email");
      if (savedEmail) {
        const { data: userByEmail } = await supabase
          .from("users")
          .select("*, trained_days")
          .eq("email", savedEmail)
          .maybeSingle();
        profile = userByEmail;
      }
    }

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
      .or(`user_id.eq.${targetUid},id.eq.${targetUid}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Progresso em unidades
    const { data: unitProgressData } = await supabase
      .from("user_unit_progress")
      .select("unit_xp, unit_id")
      .eq("user_id", targetUid);

    // Pega o XP estritamente da ultima unidade ativa em vez de somar todas as linhas do banco
    const currentUnitProgress = (unitProgressData && unitProgressData.length > 0) 
      ? unitProgressData[unitProgressData.length - 1] 
      : null;
    // Pega o valor exato da ultima unidade atualizada do banco sem somar linhas passadas
    const lastProgressRecord = (unitProgressData && unitProgressData.length > 0)
      ? unitProgressData[unitProgressData.length - 1]
      : null;
    const calculatedUnitXp = lastProgressRecord ? Number(lastProgressRecord.unit_xp || 0) : 0;
    const lastUnitId = unitProgressData && unitProgressData.length > 0 ? unitProgressData[unitProgressData.length - 1].unit_id : null;

    // --- BUSCA DINÂMICA DE XP DA TABELA LEVELS ---
    // --- BUSCA DINÂMICA DE XP DA TABELA LEVELS ---
    let calculatedRequiredXp = 5000;
    try {
      let levelData = null;

      if (profile?.level_id) {
        const { data } = await supabase
          .from("levels")
          .select("required_xp")
          .eq("id", profile.level_id)
          .maybeSingle();
        levelData = data;
      }

      if (!levelData && profile?.current_level) {
        const { data } = await supabase
          .from("levels")
          .select("required_xp")
          .ilike("level_tag", profile.current_level)
          .maybeSingle();
        levelData = data;
      }

      if (levelData && levelData.required_xp !== undefined && levelData.required_xp !== null) {
        calculatedRequiredXp = Number(levelData.required_xp);
      }
    } catch (err) {
      console.error("[CentralService] Erro ao consultar tabela levels:", err);
    }
    // ----------------------------------------------

    // 4. Busca Módulos e Unidades para a Trilha
    const { data: modulesContentData } = await supabase
      .from("modules_content")
      .select("*");

    const { data: unitsData } = await supabase
      .from("units")
      .select("*");

    
    // Extrai o required_xp da tabela units para a unidade ativa
    const activeUnitObj = (unitsData || []).find((u: any) => 
      String(u.id) === String(lastUnitId) || 
      String(u.id) === String(profile?.unit_id) || 
      String(u.id) === String(profile?.unidade_atual)
    ) || (unitsData || [])[0];

    const actualUnitRequiredXp = activeUnitObj?.required_xp ? Number(activeUnitObj.required_xp) : (profile?.required_xp || 100);

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
      modulo_atual: profile?.modulo_atual || null,
      current_module_id: profile?.current_module_id || null,
      current_unit_id: profile?.current_unit_id || null,
      unit_xp: calculatedUnitXp,
      unit_required_xp: actualUnitRequiredXp,
      level_required_xp: calculatedRequiredXp,
      required_xp: calculatedRequiredXp,
    };

    let rawComp = profile?.competencias;
    if (typeof rawComp === "string") {
      try { rawComp = JSON.parse(rawComp); } catch (e) { rawComp = null; }
    }

    const baseScore = Number(profile?.placement_test_score ?? profile?.clinical_precision ?? 70);
    const competenciasObj = {
      habla: Number(profile?.score_fala ?? profile?.score_habla ?? compData?.habla ?? rawComp?.habla ?? profile?.habla ?? 70),
      escucha: Number(profile?.score_escuta ?? profile?.score_escucha ?? compData?.escucha ?? rawComp?.escucha ?? profile?.escucha ?? 70),
      gramatica: Number(profile?.score_gramatica ?? compData?.gramatica ?? rawComp?.gramatica ?? profile?.gramatica ?? 70),
      escritura: Number(profile?.score_escrita ?? profile?.score_escritura ?? compData?.escritura ?? rawComp?.escritura ?? profile?.escritura ?? 70),
      lectura: Number(profile?.score_leitura ?? profile?.score_lectura ?? compData?.lectura ?? rawComp?.lectura ?? profile?.lectura ?? 70),
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
    const DEFAULT_ID = typeof window !== "undefined" ? (localStorage.getItem("haas_user_id") || undefined) : undefined;
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

export async function getExerciseByActivityType(unitId: string | undefined, activityType: number, excludeIds: string[] = []) {
  try {
    let targetUnit = (unitId && String(unitId).trim() !== "0" && String(unitId).length > 10) ? String(unitId) : null;

    if (!targetUnit) {
      console.log("ℹ️ [CentralService] Aguardando inicialização do unit_id do aluno...");
      return { success: true, data: [] };
    }

    console.log(`🔍 [CentralService] Buscando exercicio activityType=${activityType} para unit_id=${targetUnit || 'Dinamica'} (excluir ${excludeIds.length} id(s))`);

    // Se nao tiver unitId valido informado, busca dinamicamente a primeira unidade ativa no banco
    if (!targetUnit) {
      const { data: activeUnit } = await supabase
        .from("units")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (activeUnit) {
        targetUnit = activeUnit.id;
      }
    }

    if (!targetUnit) {
      console.warn("⚠️ [CentralService] Nenhuma unidade valida foi informada ou encontrada.");
      return { success: false, data: [], error: "Unidade nao encontrada" };
    }

    // 1. Tentar buscar exercicios ineditos da unidade do aluno
    let query = supabase
      .from("exercises")
      .select("id, lesson_id, activity_type, difficulty_level, reading_text, correct_answer, alternative_options, correct_feedback, incorrect_feedback, correct_incentive, incorrect_incentive, unit_id")
      .eq("unit_id", targetUnit)
      .eq("activity_type", activityType);

    if (excludeIds.length > 0) {
      query = query.not("id", "in", `(${excludeIds.join(",")})`);
    }

    let { data, error } = await query;

    // 2. Se ineditos esgotaram, recicla acervo da MESMA unidade do aluno para Grind de XP
    if ((!data || data.length === 0) && excludeIds.length > 0) {
      console.log("🔄 [CentralService] Exercicios ineditos esgotados nesta unidade. Reciclando acervo para Grind de XP...");
      const recycleQuery = await supabase
        .from("exercises")
        .select("id, lesson_id, activity_type, difficulty_level, reading_text, correct_answer, alternative_options, correct_feedback, incorrect_feedback, correct_incentive, incorrect_incentive, unit_id")
        .eq("unit_id", targetUnit)
        .eq("activity_type", activityType);

      data = recycleQuery.data;
      error = recycleQuery.error;
    }

    if (error) {
      console.error(`❌ [CentralService] Erro na consulta do Supabase:`, error.message);
      return { success: false, data: [], error };
    }

    console.log("📦 [CentralService] Exercicios retornados:", data ? data.length : 0);
    return { success: true, data: data || [] };
  } catch (err) {
    console.error(`❌ [CentralService] Exceção em getExerciseByActivityType:`, err);
    return { success: false, data: [], error: err };
  }
}


export async function buscarProgressoAlunoCentral(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
    if (!userId) return null;
    const res = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=exercicios_concluidos,meta_exercicios,total_unidades_modulo,current_unit_id,modulo_atual,current_level,current_module_id`, {
      headers: { "apikey": key, "Authorization": "Bearer " + key }
    });
    const data = await res.json();
    return data && data.length > 0 ? data[0] : null;
  } catch (e) {
    return null;
  }
}


function intVal(v: any): number { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; }

export async function buscarInfoModuloContent(levelTag: string, moduleNumber: number | string) {
  try {
    const num = intVal(moduleNumber) || 1;
    const { data, error } = await supabase
      .from("modules_content")
      .select("module_title, pedagogical_objective, thematic_content")
      .eq("level_tag", levelTag)
      .eq("module_number", num)
      .maybeSingle();

    if (error) {
      console.error("Erro na busca de modules_content:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("Exceção ao buscar modules_content:", e);
    return null;
  }
}


export async function buscarUnidadesModuloCentral(levelTag: string, moduleNumber: number | string) {
  try {
    const num = intVal(moduleNumber) || 1;
    const { data, error } = await supabase
      .from("units")
      .select("id, unit_number, unit_title, estimated_hours, level, module_number, pedagogical_objective")
      .eq("level", levelTag)
      .eq("module_number", num)
      .order("unit_number", { ascending: true });

    if (error) {
      console.error("Erro na busca de units:", error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error("Exceção ao buscar units:", e);
    return [];
  }
}

export async function fetchNextExerciseForUser(userId: string) {
  try {
    if (!userId) return null;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('next_exercise_id, is_reviewing_exercise')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user?.next_exercise_id) {
      console.warn('[Adaptive] Nenhum next_exercise_id pendente para o usuário:', userId);
      return null;
    }

    const { data: exercise, error: exError } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', user.next_exercise_id)
      .maybeSingle();

    if (exError || !exercise) {
      console.error('[Adaptive] Erro ao carregar exercício por ID:', user.next_exercise_id, exError);
      return null;
    }

    return { ...exercise, is_reviewing_exercise: !!user.is_reviewing_exercise };
  } catch (err) {
    console.error('[Adaptive] Exceção em fetchNextExerciseForUser:', err);
    return null;
  }
}

// ============================================================================
// GATILHOS ARENA (CENTRAL SERVICE - BUSCA E LIMPEZA)
// ============================================================================

export async function checkPendingFlagsCentral(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('pending_unit_code, pending_module_code, pending_exam_code, exame_disponivel')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("❌ Erro ao buscar pending flags no CentralService:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("❌ Exceção ao buscar pending flags:", err);
    return null;
  }
}

export async function clearPendingUnitCentral(userId: string) {
  const { error } = await supabase
    .from('users')
    .update({ pending_unit_code: null })
    .eq('id', userId);
  return !error;
}

export async function clearPendingModuleCentral(userId: string) {
  const { error } = await supabase
    .from('users')
    .update({ pending_module_code: null })
    .eq('id', userId);
  return !error;
}

export async function clearPendingExamCentral(userId: string) {
  const { error } = await supabase
    .from('users')
    .update({ pending_exam_code: null })
    .eq('id', userId);
  return !error;
}

/**
 * Consulta a tabela user_agenda_appointments via centralService.
 * Retorna notification_sent e o link dinâmico da aula meeting_link.
 */
export async function buscarAulaAoVivoCentral(overrideUid?: string) {
  try {
    let targetUid = overrideUid;
    if (!targetUid && typeof window !== "undefined") {
      targetUid = localStorage.getItem("haas_uid") || localStorage.getItem("user_id") || undefined;
    }
    if (!targetUid) {
      targetUid = typeof window !== "undefined" ? (localStorage.getItem("haas_user_id") || undefined) : undefined;
    }

    const { data, error } = await supabase
      .from("user_agenda_appointments")
      .select("meeting_link, notification_sent, appointment_date, status")
      .eq("user_id", targetUid)
      .eq("status", "agendada")
      .eq("notification_sent", true)
      .is("canceled_at", null)
      .order("appointment_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { notificationSent: false, meetingLink: null };
    }
    const agora = new Date();
    const dataAula = new Date(data.appointment_date);
    const diferencaMs = dataAula.getTime() - agora.getTime();
    const dentroDaJanela = diferencaMs <= 10 * 60 * 1000 && diferencaMs >= -60 * 60 * 1000;

    return {
      notificationSent: Boolean(data.notification_sent) && dentroDaJanela,
      meetingLink: data.meeting_link || null,
    };
  } catch (err) {
    console.error("❌ Erro ao buscar aula ao vivo no centralService:", err);
    return { notificationSent: false, meetingLink: null };
  }
}
