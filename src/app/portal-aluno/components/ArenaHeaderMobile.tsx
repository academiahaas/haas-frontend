"use client";

import React from "react";
import { Target, Flame, Star, TrendingUp, Trophy, Zap, BookOpen, Video, Bot } from "lucide-react";

interface ArenaHeaderMobileProps {
  precisao?: number;
  streak?: number;
  unidadeAtual?: string;
  nivelText?: string;
  pts?: number;
  creditosIA?: number;
  statusRobo?: "IDLE" | "CORRETO" | "ERRADO" | "BONUS";
  onOpenLeitura?: () => void;
  onOpenVideo?: () => void;
  onOpenChatIA?: () => void;
}

export default function ArenaHeaderMobile({
  precisao = 77,
  streak = 1,
  unidadeAtual = "1/5",
  nivelText = "A1 • 77%",
  pts = 3,
  creditosIA = 499461,
  statusRobo = "IDLE",
  onOpenLeitura,
  onOpenVideo,
  onOpenChatIA
}: ArenaHeaderMobileProps) {
  const roboColorClass = 
    statusRobo === "CORRETO" || statusRobo === "BONUS"
      ? "text-emerald-400 border-emerald-500/50 bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
      : statusRobo === "ERRADO"
      ? "text-rose-400 border-rose-500/50 bg-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
      : "text-cyan-400 border-cyan-500/30 bg-cyan-950/40 hover:border-cyan-400";

  return (
    <header className="fixed top-0 inset-x-0 z-[9999] bg-[#070e1c] border-b border-cyan-500/20 px-2 py-2 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-1 select-none font-mono">
      {/* Bloco de Métricas com REQS na Destaque Principal */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px] sm:text-xs">
        {/* REQS (Créditos IA) - PRIORIDADE 1 */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-amber-500/30 px-2 py-1 rounded-lg text-yellow-400 font-black shrink-0 shadow-sm">
          <Zap size={12} className="text-yellow-400 fill-yellow-400/30" />
          <span>{creditosIA} REQS</span>
        </div>

        {/* Precisão */}
        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-1.5 py-1 rounded-lg text-cyan-400 font-bold shrink-0">
          <Target size={12} className="text-cyan-400" />
          <span>{precisao}%</span>
        </div>

        {/* Foguinho / Streak */}
        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-1.5 py-1 rounded-lg text-amber-400 font-bold shrink-0">
          <Flame size={12} className="text-amber-500 fill-amber-500/30 animate-pulse" />
          <span>{streak > 0 ? `x${streak}` : "0"}</span>
        </div>

        {/* Pontos */}
        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-1.5 py-1 rounded-lg text-amber-300 font-black shrink-0">
          <Trophy size={12} className="text-amber-400" />
          <span>+{pts} PTS</span>
        </div>

        {/* Unidade */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-1.5 py-1 rounded-lg text-emerald-400 font-bold shrink-0">
          <Star size={12} className="text-emerald-400" />
          <span>{unidadeAtual}</span>
        </div>
      </div>

      {/* Botões de Ação (Aulas / Robozinho) */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onOpenLeitura}
          title="Material de Leitura"
          className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <BookOpen size={15} />
        </button>

        <button
          onClick={onOpenVideo}
          title="Assistir Vídeo"
          className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <Video size={15} />
        </button>

        <button
          onClick={onOpenChatIA}
          title="Mentor IA"
          className={`p-1.5 rounded-full border transition-all active:scale-95 ${roboColorClass}`}
        >
          <Bot size={17} />
        </button>
      </div>
    </header>
  );
}
