// @ts-nocheck
'use client';

import React from 'react';

export function PerfilSidebar() {
  return (
    <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl text-center space-y-4 shadow-xl">
      <div className="relative w-20 h-20 mx-auto bg-indigo-950 rounded-full border-2 border-indigo-500 flex items-center justify-center overflow-hidden">
        <span className="text-2xl">🐰</span>
      </div>
      <div>
        <h2 className="text-lg font-black text-white tracking-tight">Alvo Teste</h2>
        <span className="text-xs font-bold text-indigo-400 font-mono bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-900/50">Nivel B1 Intermediário</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase font-mono"><span>XP: 7.450 / 1.000</span><span className="text-amber-400">(81% para B2)</span></div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner"><div className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full w-[81%]"></div></div>
      </div>
      <div className="pt-2 border-t border-slate-800/60 text-left">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">HAAS BOT</span>
        <p className="text-xs text-slate-300 font-medium leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">¡Listo para tu misión de hoy! Elige una competencia en la trilha central.</p>
      </div>
    </div>
  );
}
