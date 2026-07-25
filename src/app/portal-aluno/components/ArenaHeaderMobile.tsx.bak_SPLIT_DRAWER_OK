"use client";

import React from "react";
import { Target, Flame, Star, Trophy, Zap, BookOpen, Video, MessageSquare } from "lucide-react";

interface ArenaHeaderMobileProps {
  precisao?: number;
  streak?: number;
  unidadeAtual?: string;
  nivelText?: string;
  pts?: number;
  creditosIA?: number;
  onOpenLeitura?: () => void;
  onOpenVideo?: () => void;
  onOpenChatIA?: () => void;
}

export default function ArenaHeaderMobile({
  precisao = 77,
  streak = 1,
  unidadeAtual = "1/5",
  pts = 3,
  creditosIA = 499461,
  onOpenLeitura,
  onOpenVideo,
  onOpenChatIA
}: ArenaHeaderMobileProps) {
  return (
    <header className="w-full bg-[#030712]/95 backdrop-blur-md border-b border-white/10 px-3 py-2 flex items-center justify-between text-xs select-none">
      
      {/* LADO ESQUERDO: METRICAS COMPACTAS (SEM SCROLLBAR) */}
      <div className="flex items-center gap-1.5 overflow-hidden">
        {/* REQS / Créditos IA */}
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold px-2 py-1 rounded-lg shrink-0">
          <Zap size={12} className="fill-amber-400" />
          <span className="text-[11px]">{creditosIA}</span>
        </div>

        {/* Precisão (77%) - SÓ APARECE EM TELAS MAIORES / EXPANDIDAS */}
        <div className="hidden sm:flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold px-2 py-1 rounded-lg shrink-0">
          <Target size={12} />
          <span>{precisao}%</span>
        </div>

        {/* Foguinho / Streak */}
        <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono font-bold px-2 py-1 rounded-lg shrink-0">
          <Flame size={12} className="fill-orange-400" />
          <span>x{streak}</span>
        </div>

        {/* PTS */}
        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold px-2 py-1 rounded-lg shrink-0">
          <Trophy size={12} />
          <span>+{pts}</span>
        </div>

        {/* Unidade */}
        <div className="hidden min-[380px]:flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-bold px-2 py-1 rounded-lg shrink-0">
          <Star size={12} />
          <span>{unidadeAtual}</span>
        </div>
      </div>

      {/* LADO DIREITO: ÍCONES REORGANIZADOS (LIVRO -> VÍDEO -> IA AO LADO) */}
      <div className="flex items-center gap-1.5 shrink-0 ml-1">
        {/* 1. Botão de Leitura */}
        <button
          onClick={onOpenLeitura}
          title="Material de Leitura"
          className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/50 active:scale-95 transition-all cursor-pointer"
        >
          <BookOpen size={15} />
        </button>

        {/* 2. Botão de Vídeo */}
        <button
          onClick={onOpenVideo}
          title="Assistir Vídeo"
          className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/50 active:scale-95 transition-all cursor-pointer"
        >
          <Video size={15} />
        </button>

        {/* 3. BALÃO DA IA - AGORA FIXO AO LADO DO VÍDEO (SEM PISCAR / PING) */}
        <button
          onClick={onOpenChatIA}
          title="Falar com a IA"
          className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <MessageSquare size={15} />
        </button>
      </div>

    </header>
  );
}
