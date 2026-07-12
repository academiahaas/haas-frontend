export interface EntregaData {
  id: string;
  user_id: string;
  unit_id: string;
  photo_url: string;
  teacher_feedback: string | null;
  assigned_score: number | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
