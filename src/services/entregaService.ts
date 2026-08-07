import { supabase } from '@/lib/supabase';
import { EntregaData } from '@/types/entrega';

export async function getEntregasPorUsuario(userId: string): Promise<EntregaData[]> {
  const { data, error } = await supabase
    .from('assignments_submissions')
    .select('id, user_id, unit_id, photo_url, teacher_feedback, assigned_score, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar entregas:', error);
    return [];
  }

  return data as EntregaData[];
}
