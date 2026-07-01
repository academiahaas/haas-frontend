"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface TopStudent {
  id: string;
  nickname: string;
  total_xp: number;
  current_rank: string;
}

export default function RankingTop10() {
  const [leaderboard, setLeaderboard] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarTop10() {
      try {
        // Busca os 10 alunos com maior XP acumulado no banco
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nickname, total_xp, current_rank")
          .order("total_xp", { ascending: false })
          .limit(10);

        if (error) throw error;

        // Se o banco estiver vazio (início), cria dados mockados elegantes com o padrão de Nickname requisitado
        if (!data || data.length === 0) {
          setLeaderboard([
            { id: "1", nickname: "Alpha_Leader", total_xp: 2450, current_rank: "ALPHA LEADER" },
            { id: "2", nickname: "Bruna_L", total_xp: 2100, current_rank: "LÍDER TECH" },
            { id: "3", nickname: "Carlos_E", total_xp: 1850, current_rank: "LÍDER TECH" },
            { id: "4", nickname: "Adriano_M", total_xp: 1400, current_rank: "EXPLORADOR" },
            { id: "5", nickname: "Fernanda_R", total_xp: 950, current_rank: "EXPLORADOR" },
          ]);
        } else {
          setLeaderboard(data);
        }
      } catch (error) {
        console.error("Erro ao carregar o ranking global:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarTop10();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="w-full bg-black/20 border border-white/5 rounded-2xl p-6 max-w-xl mx-auto mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase">// Arena Global • Top 10</h3>
        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono">Atualizado</span>
      </div>

      <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
        {leaderboard.map((student, index) => {
          const posicao = index + 1;
          const isPrimeiro = posicao === 1;

          return (
            <div
              key={student.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                isPrimeiro
                  ? "bg-amber-500/[0.04] border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                  : "bg-white/[0.01] border-white/5 hover:border-white/10"
              }`}
            >
              {/* Lado Esquerdo: Posição, Nickname e Insígnia */}
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 flex items-center justify-center font-mono text-sm font-bold rounded-md ${
                  isPrimeiro ? "text-amber-500 bg-amber-500/10" : "text-slate-500"
                }`}>
                  {isPrimeiro ? "👑" : posicao}
                </div>

                <div>
                  <span className={`text-sm font-semibold tracking-tight block ${isPrimeiro ? "text-amber-400" : "text-slate-200"}`}>
                    {student.nickname || `User_${student.id.slice(0,4)}`}
                  </span>
                  <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">
                    {student.current_rank}
                  </span>
                </div>
              </div>

              {/* Lado Direito: Pontuação */}
              <div className="text-right">
                <span className={`font-mono text-xs font-bold ${isPrimeiro ? "text-amber-500" : "text-slate-300"}`}>
                  {student.total_xp} <span className="text-[9px] font-normal text-slate-500">XP</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
