import { supabase } from '@/lib/supabase';

// ==========================================
// CONTRATO DE TIPOS DO SUPABASE (CENTRAL)
// ==========================================
export interface Table_assignments_submissions {
  id: any;
  user_id: any;
  unit_id: any;
  photo_url: any;
  teacher_feedback: any;
  assigned_score: any;
  status: any;
  created_at: any;
}

export interface Table_badges {
  id: any;
  title: any;
  description: any;
  image_url: any;
  created_at: any;
}

export interface Table_courses {
  id: any;
  title: any;
  objective_portunhol: any;
  objective_retention_generational: any;
  objective_timeline: any;
  objective_linguistic_register: any;
  objective_autonomy: any;
  operational_objective: any;
  estimated_hours: any;
  created_at: any;
}

export interface Table_exercises {
  id: any;
  lesson_id: any;
  activity_type: any;
  difficulty_level: any;
  created_at: any;
  level: any;
  module: any;
  unit: any;
  reading_text: any;
  audio_url: any;
  audio_transcript: any;
  correct_answer: any;
  alternative_options: any;
}

export interface Table_formal_exams {
  id: any;
  user_id: any;
  exam_type: any;
  level_tag: any;
  speaking_score: any;
  writing_score: any;
  listening_score: any;
  reading_score: any;
  grammar_score: any;
  total_score: any;
  audio_submission_url: any;
  text_submission_url: any;
  teacher_feedback: any;
  evaluated_by: any;
  exam_date: any;
  created_at: any;
}

export interface Table_lessons {
  id: any;
  module_id: any;
  title: any;
  lesson_number: any;
  order_index: any;
  created_at: any;
  body_content: any;
  level: any;
  module: any;
  unit: any;
  unit_id: any;
}

export interface Table_levels {
  id: any;
  level_tag: any;
  level_name: any;
  total_hours: any;
  pedagogical_focus: any;
  retention_interface_mechanic: any;
  structural_modules: any;
  mathematical_modeling_exercises: any;
  created_at: any;
  course_id: any;
}

export interface Table_modules_content {
  id: any;
  level_tag: any;
  module_number: any;
  module_title: any;
  estimated_hours: any;
  pedagogical_objective: any;
  thematic_content: any;
  structures_and_verbs: any;
  created_at: any;
  level_id: any;
}

export interface Table_prompts {
  id: any;
  prompt_tag: any;
  prompt_title: any;
  system_instruction: any;
  created_at: any;
}

export interface Table_teacher_reviews {
  id: any;
  user_id: any;
  teacher_name: any;
  rating_stars: any;
  comment: any;
  class_date: any;
  created_at: any;
}

export interface Table_units {
  id: any;
  module_id: any;
  module_number: any;
  unit_number: any;
  unit_title: any;
}

export interface Table_user_competencias {
  id: any;
  user_id: any;
  habla: any;
  escucha: any;
  lectura: any;
  escritura: any;
  gramatica: any;
}

export interface Table_user_error_logs {
  id: any;
  user_id: any;
  conteudo: any;
  frequencia: any;
}

export interface Table_user_subscriptions {
  id: any;
  user_id: any;
  plan_category: any;
  is_avulso: any;
  class_credits_total: any;
  class_credits_available: any;
  replacement_credits: any;
  ai_is_unlimited: any;
  ai_consultation_limit: any;
  ai_consultation_used: any;
  coupon_code: any;
  amount_paid: any;
  payment_method: any;
  is_outside_colombia: any;
  start_date: any;
  expiration_date: any;
  created_at: any;
}

export interface Table_user_unit_progress {
  id: any;
  user_id: any;
  unit_id: any;
  completed_at: any;
  unit_xp: any;
}

export interface Table_users {
  id: any;
  name: any;
  target_level: any;
  streak_days: any;
  current_level: any;
  nickname: any;
  student_type: any;
  clinical_precision: any;
  days_studied_week: any;
  total_immersion_es: any;
  active_vocabulary_es: any;
  next_expiration_es: any;
  course_language: any;
  total_immersion: any;
  active_vocabulary: any;
  trained_days: any;
  course_id: any;
  total_xp: any;
  current_combo: any;
  level_id: any;
  email: any;
  learning_motivation: any;
  placement_test_score: any;
  is_onboarding_completed: any;
}

export interface CentralPortalData {
  user: Table_users | null;
  competencias: Table_user_competencias | null;
  error_logs: Table_user_error_logs[];
  subscriptions: Table_user_subscriptions | null;
  unit_progress: Table_user_unit_progress[];
  reviews: Table_teacher_reviews[];
  submissions: Table_assignments_submissions[];
  exams: Table_formal_exams[];
  modules_content?: Table_modules_content[];
  units?: Table_units[];
}

// ==========================================
// FUNÇÃO CENTRAL BUSCANDO TODA A ESTEIRA (A1 ao C1)
// ==========================================
export async function fetchCentralPortalData(): Promise<CentralPortalData | null> {
  try {
    // MODO DE TESTE ATIVO: Substitua pelo ID de teste que preferir
    const userId = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

    const userRes = await supabase.from('users').select('*').eq('id', userId).maybeSingle();

    // Busca em paralelo trayendo TODOS os módulos organizados por nível e número
    const [
      competenciasRes,
      errorLogsRes,
      subscriptionsRes,
      unitProgressRes,
      reviewsRes,
      submissionsRes,
      examsRes,
      modulesRes,
      unitsRes
    ] = await Promise.all([
      supabase.from('user_competencias').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_error_logs').select('*').eq('user_id', userId),
      supabase.from('user_subscriptions').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_unit_progress').select('*').eq('user_id', userId),
      supabase.from('teacher_reviews').select('*').eq('user_id', userId),
      supabase.from('assignments_submissions').select('*').eq('user_id', userId),
      supabase.from('formal_exams').select('*').eq('user_id', userId),
      supabase.from('modules_content').select('*').order('level_tag', { ascending: true }).order('module_number', { ascending: true }),
      supabase.from('units').select('*').order('unit_number', { ascending: true })
    ]);

    return {
      user: userRes.data || null,
      competencias: competenciasRes.data || null,
      error_logs: errorLogsRes.data || [],
      subscriptions: subscriptionsRes.data || null,
      unit_progress: unitProgressRes.data || [],
      reviews: reviewsRes.data || [],
      submissions: submissionsRes.data || [],
      exams: examsRes.data || [],
      modules_content: modulesRes.data || [],
      units: unitsRes.data || []
    };

  } catch (error) {
    console.error('Erro crítico na central de conexão:', error);
    return null;
  }
}
