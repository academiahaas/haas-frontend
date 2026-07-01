'use client';
import React from 'react';

export function TrilhaFasesCentral({ t }) {
  return (
    <div className="col-span-2 bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl max-h-[460px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">{t.trilhaCompetencias}</h2>
      
      <div className="border border-[#1C2C39] rounded-xl p-3.5 bg-[#101D28] flex items-center gap-3 shadow-sm opacity-60">
        <div className="h-6 w-6 rounded-full bg-orange-500/10 border border-orange-500 flex items-center justify-center text-orange-400 text-xs font-bold">✓</div>
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] text-slate-400 font-bold">{t.modulo} 1</span>
          <p className="font-bold text-xs text-slate-400 truncate">Verb Tenses (CEFR B1)</p>
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.completo}</span>
      </div>

      <div className="border border-[#1C2C39] rounded-xl p-3.5 bg-[#101D28] flex items-center gap-3 shadow-sm opacity-60">
        <div className="h-6 w-6 rounded-full bg-orange-500/10 border border-orange-500 flex items-center justify-center text-orange-400 text-xs font-bold">✓</div>
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] text-slate-400 font-bold">{t.modulo} 2</span>
          <p className="font-bold text-xs text-slate-400 truncate">Prepositions (CEFR B2)</p>
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.completo}</span>
      </div>

      <div className="border-2 border-[#00E5FF] rounded-xl p-5 bg-gradient-to-br from-[#132637] via-[#0E1A26] to-[#0A131C] flex flex-col gap-3 shadow-[0_0_15px_rgba(0,229,255,0.2)] relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="block text-[10px] text-[#00E5FF] font-black uppercase tracking-wide font-mono">{t.modulo} 3</span>
            <h3 className="font-black text-sm text-white tracking-wide">If Clauses (CEFR B2)</h3>
          </div>
          <span className="text-[9px] bg-orange-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-lg">MISSION</span>
        </div>
        <p className="text-xs text-cyan-300/90 font-bold leading-tight">⚠️ Domínio atual: 68% • Último treino: há 3 dias. Vértice recuou 12%.</p>
        <button className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs py-2.5 rounded-xl uppercase tracking-widest transition-colors shadow-lg shadow-orange-500/30">
          {t.treinarReativar}
        </button>
      </div>

      <div className="border border-[#1C2C39] rounded-xl p-3.5 bg-[#101D28]/40 flex items-center gap-3 opacity-20">
        <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">💬</div>
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] text-slate-600 font-bold">{t.modulo} 4</span>
          <p className="font-bold text-xs text-slate-500 truncate">Intermediate Prepositions (CEFR B2)</p>
        </div>
        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Concluído</span>
      </div>
    </div>
  );
}
