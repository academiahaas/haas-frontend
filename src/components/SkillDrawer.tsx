/* =========================================================================
  COMPONENTE: DRAWER DE COMPETÊNCIAS METRICAS (GAVETA RETRÁTIL DE LOOT)
  HAAS ACADEMY - INTERFACE SEGURA DE ANÁLISE DE PROGRESSO
  =========================================================================
*/

'use client';

import React from 'react';
import { Award, Coins, PenTool, MessageSquare, Headphones, BookOpen, Flame } from 'lucide-react';

interface SkillDrawerProps {
  isOpen: boolean;
  moedasAcumuladas: number;
  META_MOEDAS_B2: number;
  pontosGramatica: number;
  pontosEscrita: number;
  pontosPronuncia: number;
  pontosEscuta: number;
  pontosLeitura: number;
  pontosConversacao: number;
  impactoHabilidade: string | null;
  refGramatica: React.RefObject<HTMLDivElement | null>;
  refEscrita: React.RefObject<HTMLDivElement | null>;
  refPronuncia: React.RefObject<HTMLDivElement | null>;
}

export function SkillDrawer({
  isOpen,
  moedasAcumuladas,
  META_MOEDAS_B2,
  pontosGramatica,
  pontosEscrita,
  pontosPronuncia,
  pontosEscuta,
  pontosLeitura,
  pontosConversacao,
  impactoHabilidade,
  refGramatica,
  refEscrita,
  refPronuncia
}: SkillDrawerProps) {
  return (
    <div 
      className={`absolute bottom-full left-1/2 -translate-x-1/2 w-full max-w-5xl bg-[#111E2E]/95 border-t border-x border-slate-800 rounded-t-2xl p-4 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col gap-3 text-[10px] font-bold transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.1) ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-12 pointer-events-none'}`}
    >
      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
        <span className="tracking-wider uppercase flex items-center gap-1.5">
          <Award size={14} className="text-[#00FF66]" /> Distribuição Detalhada de Competências para Certificação B2
        </span>
        <span className="font-mono text-[#00FF66]">{Math.floor((moedasAcumuladas / META_MOEDAS_B2) * 100)}% Geral</span>
      </div>
      
      <div className="grid grid-cols-6 gap-3 py-1">
        <div ref={refGramatica} className={`flex flex-col gap-1 p-2 rounded-xl bg-slate-800/40 border text-center transition-all duration-200 ${impactoHabilidade === 'gramatica' || pontosGramatica >= 100 ? 'border-emerald-500/50 bg-[#122b20] shadow-[0_0_10px_rgba(0,255,102,0.15)] scale-105' : 'border-slate-700/30'}`}>
          <span className="text-slate-400 uppercase text-[9px] flex items-center justify-center gap-1"><Coins size={10} /> Gramática</span>
          <span className="font-mono text-base text-[#00FF66] font-black">{pontosGramatica}/100</span>
        </div>
        
        <div ref={refEscrita} className={`flex flex-col gap-1 p-2 rounded-xl bg-slate-800/40 border text-center transition-all duration-200 ${impactoHabilidade === 'escrita' ? 'border-emerald-500 bg-[#122b20] shadow-[0_0_15px_#00FF66] scale-105' : pontosEscrita >= 100 ? 'border-emerald-500/50 bg-[#122b20]' : 'border-slate-700/30'}`}>
          <span className="text-slate-400 uppercase text-[9px] flex items-center justify-center gap-1"><PenTool size={10} /> Escrita</span>
          <span className="font-mono text-base text-[#00FF66] font-black">{pontosEscrita}/100</span>
        </div>
        
        <div ref={refPronuncia} className={`flex flex-col gap-1 p-2 rounded-xl bg-slate-800/40 border text-center transition-all duration-200 ${impactoHabilidade === 'pronuncia' ? 'border-emerald-500 bg-[#122b20] shadow-[0_0_15px_#00FF66] scale-105' : pontosPronuncia >= 100 ? 'border-emerald-500/50 bg-[#122b20]' : 'border-slate-700/30'}`}>
          <span className="text-slate-400 uppercase text-[9px] flex items-center justify-center gap-1"><MessageSquare size={10} /> Pronúncia</span>
          <span className="font-mono text-base text-[#00FF66] font-black">{pontosPronuncia}/100</span>
        </div>
        
        <div className={`flex flex-col gap-1 p-2 rounded-xl bg-slate-800/40 border text-center transition-all ${pontosEscuta >= 100 ? 'border-emerald-500/50 bg-[#122b20]' : 'border-slate-700/30'}`}>
          <span className="text-slate-400 uppercase text-[9px] flex items-center justify-center gap-1"><Headphones size={10} /> Escuta</span>
          <span className="font-mono text-base text-[#00FF66] font-black">{pontosEscuta}/100</span>
        </div>
        
        <div className={`flex flex-col gap-1 p-2 rounded-xl bg-slate-800/40 border text-center transition-all ${pontosLeitura >= 100 ? 'border-emerald-500/50 bg-[#122b20]' : 'border-slate-700/30'}`}>
          <span className="text-slate-400 uppercase text-[9px] flex items-center justify-center gap-1"><BookOpen size={10} /> Leitura</span>
          <span className="font-mono text-base text-[#00FF66] font-black">{pontosLeitura}/100</span>
        </div>
        
        <div className={`flex flex-col gap-1 p-2 rounded-xl bg-slate-800/40 border text-center transition-all ${pontosConversacao >= 100 ? 'border-emerald-500/50 bg-[#122b20]' : 'border-orange-500/30'}`}>
          <span className="text-orange-400 uppercase text-[9px] flex items-center justify-center gap-1"><Flame size={10} /> Aula Humana</span>
          <span className={`font-mono text-base font-black ${pontosConversacao >= 100 ? 'text-[#00FF66]' : 'text-orange-400'}`}>{pontosConversacao}/100</span>
        </div>
      </div>
    </div>
  );
}