// @ts-nocheck
'use client';

import React from 'react';

export function GraficoProficiencia() {
  return (
    <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
      <h3 className="text-white font-black text-xs uppercase tracking-wider border-b border-slate-800 pb-2">Gráfico de Proficiência</h3>
      <div className="flex justify-center items-center py-2">
        {/* Renderizado del Pentágono SVG idéntico a tu captura */}
        <svg width="160" height="160" viewBox="0 0 100 100" className="overflow-visible">
          <polygon points="50,5 93,36 77,88 23,88 7,36" fill="none" stroke="#1e293b" strokeWidth="1" />
          <polygon points="50,20 82,43 70,80 30,80 18,43" fill="none" stroke="#334155" strokeWidth="0.8" />
          <polygon points="50,35 71,50 63,72 37,72 29,50" fill="none" stroke="#475569" strokeWidth="0.5" />
          {/* Líneas de ejes */}
          <line x1="50" y1="50" x2="50" y2="5" stroke="#334155" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="93" y2="36" stroke="#334155" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="77" y2="88" stroke="#334155" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="23" y2="88" stroke="#334155" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="7" y2="36" stroke="#334155" strokeWidth="0.5" />
          {/* Capa de datos del alumno en cian */}
          <polygon points="50,25 80,40 68,75 40,82 22,46" fill="rgba(6, 182, 212, 0.15)" stroke="#06b6d4" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 border-t border-slate-800/60 pt-2">
        <span className="text-emerald-400">Fala: +8%</span>
        <span className="text-indigo-400">Escrita: +12%</span>
      </div>
    </div>
  );
}
