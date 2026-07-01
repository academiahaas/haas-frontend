"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface StudentData {
  fullName: string;
  totalXp: number; 
  currentRank: string; 
  targetLevel: string;
  unitScoreCurrent: number; 
  unitScoreTarget: number; 
  recentErrors: { vocabulary: string; grammar: string }[];
  skillsData: { skill: string; value: number }[];
  currentStreak: number; 
  totalHoursStudied: number; 
  activatedVocabulary: number; 
  nextBillingDate: string; 
  planValue: string; 
  badges: string[]; // Mantém compatibilidade com o drawer simples
  eficienciaClinica: number; 
  consistenciaSemanal: { [key: string]: boolean }; 
}

export default function MotorInteligenciaMascote({ children }: { children: (data: StudentData, loading: boolean) => React.ReactNode }) {
  const [studentData, setStudentData] = useState<StudentData>({
    fullName: "Alpha_Leader",
    totalXp: 0,
    currentRank: "LÍDER ALPHA",
    targetLevel: "NÍVEL B1",
    unitScoreCurrent: 0,
    unitScoreTarget: 50, 
    recentErrors: [],
    skillsData: [],
    currentStreak: 12,
    totalHoursStudied: 14,
    activatedVocabulary: 450,
    nextBillingDate: "10/07/2026",
    planValue: "149.90",
    badges: ["Coesão", "Auditorias"],
    eficienciaClinica: 94, 
    consistenciaSemanal: { "L": true, "M": true, "X": true, "J": false, "V": true, "S": true, "D": false }
  });
  const [loading, setLoading] = useState(true);

  async function carregarEProcessarDados() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, total_xp, current_rank, current_streak, total_minutes_studied, activated_vocabulary_count")
        .eq("id", user.id)
        .single();

      const { data: course } = await supabase
        .from("student_courses")
        .select("target_level, next_billing_date, plan_value")
        .eq("student_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      const { data: progress } = await supabase
        .from("student_progress")
        .select("quiz_score_earned, units(score_points)")
        .eq("student_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: badgesData } = await supabase
        .from("student_badges")
        .select("badge_name")
        .eq("student_id", user.id)
        .eq("status", "active"); // Apenas as ativas sobem para o mini-drawer resumo

      const { data: allLogs } = await supabase
        .from("student_engagement_logs")
        .select("skill_type, is_correct, specific_vocabulary, specific_grammar, pronunciation_score, listening_comprehension_score, origin_source")
        .eq("student_id", user.id);

      const { data: weeklyConsistency } = await supabase
        .rpc("get_student_weekly_consistency", { p_student_id: user.id });

      const consistenciaEspanhol = weeklyConsistency ? {
        "L": weeklyConsistency.S || false,
        "M": weeklyConsistency.T || false,
        "X": weeklyConsistency.Q_1 || false,
        "J": weeklyConsistency.Q_2 || false,
        "V": weeklyConsistency.S_2 || false,
        "S": weeklyConsistency.S_3 || false,
        "D": weeklyConsistency.D || false
      } : { "L": true, "M": true, "X": true, "J": false, "V": true, "S": true, "D": false };

      const minutosTotais = profile?.total_minutes_studied || 840;
      const horasCalculadas = Math.round(minutosTotais / 60);

      let dataFormatada = "10/07/2026";
      if (course?.next_billing_date) {
        const [ano, mes, dia] = course.next_billing_date.split("-");
        dataFormatada = `${dia}/${mes}/${ano}`;
      }

      let porcentagemEficiencia = 94;
      if (allLogs && allLogs.length > 0) {
        const totalAcertos = allLogs.filter(l => l.is_correct === true).length;
        porcentagemEficiencia = Math.round((totalAcertos / allLogs.length) * 100);
      }

      const competencias = ["Fala", "Escuta", "Gramática", "Escrita", "Leitura"];
      const calculoSkills = competencias.map(skill => {
        const logsDaSkill = allLogs?.filter(l => l.skill_type === skill) || [];
        if (logsDaSkill.length === 0) {
          if (skill === "Fala") return { skill, value: 70 };
          if (skill === "Escuta") return { skill, value: 80 };
          if (skill === "Gramática") return { skill, value: 55 };
          if (skill === "Escrita") return { skill, value: 65 };
          return { skill, value: 85 };
        }
        if (skill === "Fala" || skill === "Escuta") {
          const logsAula = logsDaSkill.filter(l => l.origin_source === 'live_class');
          if (logsAula.length > 0) {
            const somaNotas = logsAula.reduce((acc, curr) => acc + (skill === "Fala" ? (curr.pronunciation_score || 70) : (curr.listening_comprehension_score || 80)), 0);
            return { skill, value: Math.round(somaNotas / logsAula.length) };
          }
        }
        const acertos = logsDaSkill.filter(l => l.is_correct === true).length;
        return { skill, value: Math.round((acertos / logsDaSkill.length) * 100) };
      });

      const errosRecentes = allLogs?.filter(l => l.is_correct === false).slice(-5) || [];
      const unitsData = progress?.units as unknown as { score_points: number } | undefined;

      setStudentData({
        fullName: profile?.full_name || "Alpha_Leader",
        totalXp: profile?.total_xp || 0,
        currentRank: profile?.current_rank || "LÍDER ALPHA",
        targetLevel: course?.target_level || "NÍVEL B1",
        unitScoreCurrent: progress?.quiz_score_earned || 0,
        unitScoreTarget: unitsData?.score_points || 50,
        recentErrors: errosRecentes.map(log => ({
          vocabulary: log.specific_vocabulary,
          grammar: log.specific_grammar
        })),
        skillsData: calculoSkills,
        currentStreak: profile?.current_streak || 0,
        totalHoursStudied: horasCalculadas,
        activatedVocabulary: profile?.activated_vocabulary_count || 450,
        nextBillingDate: dataFormatada,
        planValue: course?.plan_value ? Number(course.plan_value).toFixed(2) : "149.90",
        badges: badgesData?.map(b => b.badge_name) || [],
        eficienciaClinica: porcentagemEficiencia,
        consistenciaSemanal: consistenciaEspanhol
      });

    } catch (error) {
      console.error("Erro ao atualizar motor de badges:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarEProcessarDados();

    const canalRealtime = supabase
      .channel("mudancas_motor_badges")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_badges" },
        () => carregarEProcessarDados()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalRealtime);
    };
  }, []);

  return <>{children(studentData, loading)}</>;
}
