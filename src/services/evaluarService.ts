import { supabase } from '@/lib/supabase';

export interface EvaluacionProfesor {
  user_id: string;
  teacher_name: string;
  rating_stars: number;
  comment: string;
  class_date: string;
}

export async function salvarAvaliacaoProfessor(dados: EvaluacionProfesor) {
  const { data, error } = await supabase
    .from('teacher_reviews')
    .insert([
      {
        user_id: dados.user_id,
        teacher_name: dados.teacher_name,
        rating_stars: dados.rating_stars,
        comment: dados.comment,
        class_date: dados.class_date
      }
    ]);

  if (error) {
    console.error('Erro ao salvar avaliação do professor:', error);
    return { success: false, error };
  }

  return { success: true, data };
}
