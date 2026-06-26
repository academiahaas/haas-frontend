/* =========================================================================
  COMPONENTE: CELEBRAÇÃO DE MÓDULO (MODULE COMPLETION SCREEN)
  HAAS ACADEMY - FOCO EM RECOMPENSAS DIÁRIAS E PERFORMANCE TÁTICA
  =========================================================================
*/

'use client';

import React from 'react';
import { Trophy, Coins, Target, ArrowRight, Sparkles, Award } from 'lucide-react';

interface ModuleCompletionScreenProps {
  mostrar: boolean;
  moedasGanhas: number;
  precisaoFinal: number;
  onAvancar: () => void;
}

export function ModuleCompletionScreen({ mostrar, moedasGanhas, precisaoFinal, onAvancar }: ModuleCompletionScreenProps) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-[#05090e]/95 backdrop-blur-md z-[999999] flex flex-col items-center justify-center p-4 select-none animate-fadeIn">
      
      {/* Keyframes de animação Arcade */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleUpGamer {
          0% { opacity: 0; transform: scale(0.9) translateY(40px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-up-gamer {
          animation: scaleUpGamer 0.5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}} />

      {/* CARD DE VITÓRIA DO MÓDULO */}
      <div className="w-full max-w-lg bg-[#09131f] border-2 border-slate-800 rounded-[36px] p-8 text-center flex flex-col items-center gap-6 shadow-[0_30px_70px_rgba(0,0,0,0.95)] animate-scale-up-gamer">
        
        {/* Ícone de Troféu Amarelo Clássico */}
        <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.2)] relative">
          <Trophy size={48} strokeWidth={2} className="animate-bounce" />
          <div className="absolute -top-1 -right-1 text-yellow-400 animate-pulse">
            <Sparkles size={16} />
          </div>
        </div>

        {/* Textos de Impacto */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest block">MODULE COMPLETED</span>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Módulo Concluído!
          </h1>
          <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">
            Excelente performance! Você limpou o mapa e coletou as recompensas deste bloco de estudos.
          </p>
        </div>

        {/* RESUMO DE STATS DO MÓDULO */}
        <div className="grid grid-cols-2 gap-4 w-full mt-2">
          
          {/* Box de Moedas */}
          <div className="bg-[#04090f] border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center gap-1.5 shadow-inner">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-[#FFD700] border border-yellow-500/20">
              <Coins size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">TOTAL GANHO</span>
            <span className="text-xl font-black text-white font-mono">+{moedasGanhas} Moedas</span>
          </div>

          {/* Box de Precisão */}
          <div className="bg-[#04090f] border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center gap-1.5 shadow-inner">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[#00FF66] border border-emerald-500/20">
              <Target size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">PRECISÃO TÁTICA</span>
            <span className="text-xl font-black text-[#00FF66] font-mono">{precisaoFinal}%</span>
          </div>

        </div>

        {/* Rodapé do Card */}
        <div className="w-full flex items-center gap-3 bg-[#04090f] border border-slate-900 rounded-xl p-3 text-left">
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/10 text-[#00E5FF] flex-shrink-0">
            <Award size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-mono font-black text-cyan-400 uppercase tracking-widest">HAAS PROGRESS SYSTEM</span>
            <p className="text-[10px] font-bold text-slate-400 leading-tight">Pontuação computada na grade oficial do seu passaporte linguístico.</p>
          </div>
        </div>

        {/* Botão de Avanço */}
        <button 
          onClick={onAvancar}
          className="w-full mt-2 py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 bg-gradient-to-b from-[#F8891D] to-[#E67212] text-white shadow-[0_6px_25px_rgba(248,137,29,0.45)] hover:brightness-110 active:scale-95 transition-all scale-[1.01] cursor-pointer"
        >
          AVANÇAR PARA PRÓXIMO MÓDULO <ArrowRight size={14} strokeWidth={3} />
        </button>

      </div>
    </div>
  );
}