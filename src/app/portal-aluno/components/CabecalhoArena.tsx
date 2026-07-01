"use client";

interface CabecalhoArenaProps {
  unitTitle: string;          // Nome da unidade que está sendo estudada
  precision: number;          // Eficiência Clínica (Ex: 94)
  totalXp: number;            // Pontos totais do aluno
  currentStreak: number;      // Dias de ofensiva para calcular o multiplicador
  onSair: () => void;         // Ação do botão misterioso de fechar/salvar
}

export default function CabecalhoArena({ unitTitle, precision, totalXp, currentStreak, onSair }: CabecalhoArenaProps) {
  // Determina visualmente o texto do multiplicador idêntico ao seu print
  let multiplicadorText = "x1.0";
  if (currentStreak >= 14) multiplicadorText = "x1.5";
  else if (currentStreak >= 7) multiplicadorText = "x1.3";
  else if (currentStreak >= 3) multiplicadorText = "x1.2";

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between gap-6 max-w-7xl mx-auto rounded-b-2xl shadow-lg">
      
      {/* LADO ESQUERDO: Botão de Sair + Nome da Unidade sendo estudada */}
      <div className="flex items-center gap-4">
        {/* O BOTÃO MISTERIOSO REVELADO: Sair com segurança e salvar progresso */}
        <button 
          onClick={onSair}
          className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-300 group"
          title="Sair e Salvar Progresso"
        >
          <svg className="w-4 h-4 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div>
          <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block font-bold">// Unidade em Curso</span>
          <h2 className="text-sm font-bold text-white tracking-tight truncate max-w-xs md:max-w-md">
            {unitTitle || "Unit 1: Core Fundamentals"}
          </h2>
        </div>
      </div>

      {/* LADO DIREITO: Multiplicador de Ofensiva, Precisão e XP Total */}
      <div className="flex items-center gap-3.5 md:gap-5 font-mono">
        
        {/* 🔥 O MULTIPLICADOR MISTERIOSO X1.2 */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl animate-pulse">
          <span className="text-[10px] text-amber-400 font-bold tracking-tight">
            {multiplicadorText}
          </span>
          <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wider hidden sm:inline">
            Bônus
          </span>
        </div>

        {/* 🎯 PRECISÃO GERAL (EFICIÊNCIA CLÍNICA) */}
        <div className="text-right">
          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Precisão</span>
          <span className="text-xs font-bold text-emerald-400">
            {precision}%
          </span>
        </div>

        {/* 💎 XP TOTAL */}
        <div className="text-right border-l border-white/5 pl-3.5 md:pl-5">
          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Total XP</span>
          <span className="text-xs font-bold text-amber-500">
            {totalXp} <span className="text-[9px] text-slate-400 font-normal">pts</span>
          </span>
        </div>

      </div>

    </div>
  );
}
