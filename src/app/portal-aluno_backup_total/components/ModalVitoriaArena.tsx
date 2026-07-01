"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface ModalVitoriaArenaProps {
  unitId: string;
  unitTitle: string;
  xpGanho: number;
  utGanho: number; // Suas Unidades de Treinamento (Ex: 25 UT)
  onFechar: () => void;
}

export default function ModalVitoriaArena({ 
  unitId, 
  unitTitle = "Voz Passiva Avançada", 
  xpGanho = 120, 
  utGanho = 25, 
  onFechar 
}: ModalVitoriaArenaProps) {
  
  const [loading, setLoading] = useState(false);
  const [ignorado, setIgnorado] = useState(false);

  // 1. AÇÃO DO BOTÃO: IGNORAR ETAPA NO SUPABASE
  async function ignorarEtapaAtual() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Grava no banco que o aluno pulou deliberadamente esta etapa (Ex: Fala)
      await supabase.from("student_engagement_logs").insert({
        student_id: user.id,
        skill_type: "Fala",
        is_correct: false,
        step_skipped: true,
        origin_source: "arena_app",
        specific_vocabulary: "Etapa Ignorada pelo Aluno Temporariamente"
      });

      setIgnorado(true);
      console.log("⏭️ Arena: Etapa ignorada com sucesso. Log salvo para recall da IA.");
    } catch (err) {
      console.error("Erro ao ignorar etapa:", err);
    } finally {
      setLoading(false);
    }
  }

  // 2. AÇÃO DO BOTÃO: FINALIZAR E REVISAR MÉTRICAS
  async function finalizarERevisar() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Salva a conclusão da unidade e injeta as UTs e XP no perfil dele
      await supabase.from("student_progress").insert({
        student_id: user.id,
        unit_id: unitId,
        quiz_score_earned: xpGanho
      });

      // Atualiza a carteira de UT do executivo no perfil
      await supabase.rpc("reward_student_arena_xp", { 
        p_student_id: user.id, 
        p_base_xp: xpGanho 
      });

      console.log("🏆 Vitória: Unidade concluída! UTs e XP computados no ecossistema.");
      onFechar();
    } catch (err) {
      console.error("Erro ao finalizar unidade:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.1)] backdrop-blur-md text-center space-y-6">
      
      {/* ÍCONE DE VITÓRIA / ANIMAÇÃO */}
      <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-lg animate-bounce mt-2">
        🏆
      </div>

      {/* TEXTOS INSTITUCIONAIS */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">¡Unidad Completada!</h3>
        <p className="text-xs text-slate-400 font-mono max-w-xs mx-auto">
          {unitTitle}
        </p>
      </div>

      {/* RECOMPENSAS: XP + UT (UNIDADES DE TREINAMENTO) */}
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">Recompensa</span>
          <span className="text-base font-mono font-bold text-amber-400">+{xpGanho} XP</span>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">Progresso</span>
          <span className="text-base font-mono font-bold text-emerald-400">+{utGanho} UT</span>
        </div>
      </div>

      {/* BOTÕES DE MANOBRA TÁTICA */}
      <div className="space-y-2.5 pt-2">
        {/* O BOTÃO DA VITÓRIA: ATUALIZAR E IR PARA O REVISE */}
        <button
          onClick={finalizarERevisar}
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-mono font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all transform active:scale-95"
        >
          {loading ? "Sincronizando..." : "✓ Métricas Atualizadas. Clic para Revisar"}
        </button>

        {/* BOTÃO FLUIDO: IGNORAR ETAPA (CASO ELE ESTEJA NO MEIO DA JORNADA) */}
        {!ignorado && (
          <button
            onClick={ignorarEtapaAtual}
            disabled={loading}
            className="w-full py-2.5 bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 text-[11px] font-mono rounded-xl transition-all"
          >
            ⏭️ Ignorar Etapa de Fala por Agora
          </button>
        )}
      </div>
    </div>
  );
}
