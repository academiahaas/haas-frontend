// @ts-nocheck
'use client';

import React from 'react';
import { TrendingUp, Award, Link2 } from 'lucide-react';

export function EvolucaoPanel() {
  return (
    <div className="space-y-4">
      <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl text-xs font-bold text-slate-300 space-y-3">
        <h3 className="text-white font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2"><TrendingUp size={14} className="text-indigo-400"/> Painel de Evolução</h3>
        <div className="font-mono space-y-1">
          <p>Nível Atual: <span className="text-white font-black">B1</span></p>
          <p>Próximo Nível: <span className="text-indigo-400 font-black">B2</span></p>
          <p>Restante: <span className="text-amber-400 font-black">--- XP</span></p>
        </div>
      </div>
      <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl text-xs font-bold text-slate-300 space-y-2">
        <h3 className="text-white font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2"><Link2 size={14} className="text-indigo-400"/> Recursos Útiles</h3>
        <ul className="space-y-2 pt-1 font-medium text-indigo-400">
          <li><a href="#" className="hover:underline flex items-center gap-1">📝 Avaliação de Classe (Google Forms)</a></li>
          <li><a href="#" className="hover:underline flex items-center gap-1">📅 Reprogramação de Classes (Calendar)</a></li>
        </ul>
      </div>
    </div>
  );
}
