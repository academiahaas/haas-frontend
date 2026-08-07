// @ts-nocheck
'use client';

import React from 'react';

export function MetasFinanciero() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-[#0f172a]/60 border border-slate-800 p-4 rounded-2xl text-xs font-bold">
        <span className="text-slate-500 block uppercase mb-1">Metas Diárias</span>
        <span className="text-2xl font-black text-cyan-400 font-mono">4 / 5</span>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Atividades Concluídas</p>
      </div>
      <div className="bg-[#0f172a]/60 border border-slate-800 p-4 rounded-2xl text-xs font-bold">
        <span className="text-slate-500 block uppercase mb-1">Classroom Core</span>
        <span className="text-2xl font-black text-purple-400 font-mono">9.8</span>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Média de Fluência</p>
      </div>
      <div className="bg-[#0f172a]/60 border border-slate-800 p-4 rounded-2xl text-xs font-bold flex justify-between items-start border-l-2 border-l-emerald-500">
        <div>
          <span className="text-slate-500 block uppercase mb-1">Financial (COP)</span>
          <span className="text-xl font-black text-white font-mono">$ 650.000</span>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Faturamento Center</p>
        </div>
        <span className="bg-emerald-950 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-md border border-emerald-900 font-mono font-black">Ok</span>
      </div>
    </div>
  );
}
