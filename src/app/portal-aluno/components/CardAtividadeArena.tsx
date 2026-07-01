"use client";

import { useState } from "react";

interface CardAtividadeArenaProps {
  unitNumber: number;          // Número da unidade atual (Ex: 12)
  currentStep: number;         // Etapa atual do aluno (Ex: 5)
  totalSteps: number;          // Total de etapas da trilha (Ex: 8)
  activityName: string;        // Nome da atividade fixo (Ex: "Regularização de Palavras")
  children: React.ReactNode;   // Onde entra o exercício gerado pela IA (múltipla escolha, escrita, etc.)
}

export default function CardAtividadeArena({ 
  unitNumber = 12, 
  currentStep = 5, 
  totalSteps = 8, 
  activityName = "Regularização de Palavras",
  children 
}: CardAtividadeArenaProps) {
  
  // Cálculo matemático da porcentagem da barra de progresso das etapas
  const porcentagemProgresso = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

  return (
    <div className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-sm flex flex-col justify-between min-h-[480px]">
      
      {/* 🔝 TOP BAR DELA: Indicadores de Unidade, Etapa e a Barra Fluida */}
      <div className="w-full space-y-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* Identificador da Unidade */}
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-300 tracking-wider uppercase">
              Unidade {unitNumber}
            </span>
          </div>

          {/* Marcador de Etapa Estilo HAAS */}
          <div className="bg-white/[0.03] border border-white/5 px-3 py-1 rounded-xl font-mono">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1.5 font-bold">Etapa</span>
            <span className="text-xs font-bold text-amber-400">{currentStep}</span>
            <span className="text-[10px] text-slate-500 font-normal mx-0.5">/</span>
            <span className="text-xs text-slate-400 font-medium">{totalSteps}</span>
          </div>
        </div>

        {/* BARRA DE PROGRESSO DE ETAPA MESTRE */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-[1px] border border-white/[0.02]">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            style={{ width: `${porcentagemProgresso}%` }}
          />
        </div>
      </div>

      {/* 🏷️ SUB-HEAD: Nome Obrigatório da Atividade */}
      <div className="border-b border-white/5 pb-3.5 mb-6">
        <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block font-bold">// Modo de Execução</span>
        <h3 className="text-base font-bold text-slate-200 tracking-tight">
          {activityName}
        </h3>
      </div>

      {/* 🎯 CORPO CENTRAL: Onde a mágica do exercício acontece */}
      <div className="flex-1 w-full flex flex-col justify-center py-2">
        {children || (
          <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-black/10">
            <p className="text-xs font-mono text-slate-500">Aguardando injeção do bloco de exercício da IA...</p>
          </div>
        )}
      </div>

    </div>
  );
}
