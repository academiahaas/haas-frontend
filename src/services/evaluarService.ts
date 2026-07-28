import { submitTeacherReview, TeacherReviewPayload } from "./centralService";

export type EvaluacionProfesor = TeacherReviewPayload;

export async function salvarAvaliacaoProfessor(dados: EvaluacionProfesor) {
  return await submitTeacherReview(dados);
}
