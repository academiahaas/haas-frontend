"use client";

interface CardResumoArenaProps {
  precision: number;          // Precisão do aluno na sessão (Ex: 94)
  currentStreak: number;      // Dias consecutivos (Ex: 12)
  currentStep: number;         // Etapa atual (Ex: 5)
  totalSteps: number;          // Total de etapas (Ex: 8)
  unitScoreCurrent: number;   // Pontos acumulados na unidade atual (Ex: 32)
  progressoTendencia: "subida" | "descida" | "estavel"; // Direção do progresso do aluno
}

export default function CardResumoArena({
  precision = 94,
  currentStreak = 12,
  currentStep = 5,
  totalSteps = 8,
  unitScoreCurrent = 32,
  progressoTendencia = "subida"
}: CardResumoArenaProps) {
  
  return (
    <div className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="mb-4">
        <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block font-bold">// Resumo do Ritmo Atual</span>
      </div>

      {/* GRADE DE MÉTRICAS DO RESUMO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        
        {/* 1. PONTOS ACUMULADOS NA UNIDADE (O que você pediu foco!) */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col justify-center items-center">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Acumulado</span>
          <span className="text-sm font-mono font-bold text-amber-400 animate-pulse">
            {unitScoreCurrent} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
          </span>
        </div>

        {/* 2. ETAPA ATUAL */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col justify-center items-center">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Etapa Ativa</span>
          <span className="text-sm font-mono font-bold text-slate-200">
            {currentStep}<span className="text-slate-600 font-normal text-xs">/</span>{totalSteps}
          </span>
        </div>

        {/* 3. DIAS CONSECUTIVOS */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col justify-center items-center">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Racha Dias</span>
          <span className="text-sm font-mono font-bold text-orange-400 flex items-center gap-1">
            🔥 {currentStreak}d
          </span>
        </div>

        {/* 4. TENDÊNCIA DE PROGRESSO (Subida / Descida) */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col justify-center items-center">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Tendência</span>
          
          {progressoTendencia === "subida" && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono uppercase">
              ▲ Subida
            </span>
          )}
          {progressoTendencia === "descida" && (
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1 font-mono uppercase animate-bounce">
              ▼ Queda
            </span>
          )}
          {progressoTendencia === "estavel" && (
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 font-mono uppercase">
              ■ Estável
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
