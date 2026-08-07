"use client";

import React from "react";
import { useAlunoMetrics } from "@/hooks/useAlunoMetrics";

interface ArenaHeaderMobileProps {
  unidadeAtual?: string;
  precisao?: number;
  streak?: number;
  pts?: number;
  xp?: number;
  creditosIA?: number;
  onOpenLeitura?: () => void;
  onOpenVideo?: () => void;
  onOpenChatIA?: () => void;
  onRobotClick?: () => void;
}

export function ArenaHeaderMobile({
  unidadeAtual = "1/5",
  precisao: precisaoProp,
  streak: streakProp,
  pts: ptsProp,
  xp: xpProp,
  creditosIA: creditosIAProp,
  onOpenLeitura,
  onOpenVideo,
  onOpenChatIA,
  onRobotClick
}: ArenaHeaderMobileProps) {
  const { metrics, loading } = useAlunoMetrics();

  // Prioriza os dados em tempo real do banco; se não houver ou estiver carregando, utiliza a prop enviada
  const precisao = metrics?.clinical_precision ?? precisaoProp ?? 0;
  const streak = metrics?.streak_days ?? streakProp ?? 0;
  const pts = metrics?.total_xp ?? ptsProp ?? xpProp ?? 0;
  const creditosIA = metrics?.chat_credits ?? creditosIAProp ?? 0;

  return (
    <header className="w-full bg-[#0a0f1d] text-white p-4 border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onRobotClick} 
          className="relative text-2xl hover:scale-105 transition-transform"
        >
          🤖
        </button>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Precisão</span>
          <span className="text-sm font-bold text-emerald-400">
            {loading ? "..." : `${precisao}%`}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Ofensiva</span>
          <span className="text-sm font-bold text-purple-300">
            {loading ? "..." : `🔥 ${streak}d`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Pontos</span>
          <span className="text-sm font-bold text-indigo-400">
            {loading ? "..." : `${pts} XP`}
          </span>
        </div>

        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">IA Credits</span>
          <span className="text-sm font-bold text-cyan-400">
            {loading ? "..." : (metrics?.ai_is_unlimited ? "∞" : creditosIA)}
          </span>
        </div>
      </div>
    </header>
  );
}

export default ArenaHeaderMobile;
