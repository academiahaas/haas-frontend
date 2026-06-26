// @ts-nocheck
'use client';

import React, { useState } from 'react';

interface BauErrosProps {
  idioma?: "PT" | "ES" | "EN";
}

export function BauErros({ idioma = "PT" }: BauErrosProps) {
  const [erros, setErros] = useState([
    { id: 1, termo: 'oficina /escritório', score: '0.8' },
    { id: 2, termo: 'em reunião', score: '1.0' }
  ]);

  return (
    <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl shadow-xl text-xs font-bold text-slate-300 space-y-4">
      <h3 className="text-white font-black uppercase tracking-wider border-b border-slate-800 pb-2">
        {idioma === "PT" ? "Baú de Erros Recorrentes" : idioma === "ES" ? "Baúl de Errores Recurrentes" : "Recurring Errors Chest"}
      </h3>
      <div className="space-y-2 font-mono">
        {erros.map(e => (
          <div key={e.id} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-xl border border-slate-800/50">
            <span className="text-slate-300 font-sans">{e.termo}</span>
            <span className="text-amber-500 font-black">{e.score}</span>
          </div>
        ))}
      </div>
      <button 
        type="button" 
        onClick={() => setErros([])} 
        className="w-full py-2 bg-white text-slate-900 font-black text-center rounded-xl text-[11px] uppercase tracking-wider hover:bg-slate-200 transition-all cursor-pointer shadow"
      >
        {idioma === "PT" ? "Limpar Baú" : idioma === "ES" ? "Limpiar Baúl" : "Clear Chest"}
      </button>
    </div>
  );
}
