'use client';

import React, { useState } from 'react';

export default function PortalMobile2() {
  const [etapa, setEtapa] = useState(0);

  return (
    /* min-h-screen permite o crescimento livre e flex-col distribui topo e base */
    <div className="w-full min-h-screen bg-[#030914] text-slate-200 p-4 flex flex-col justify-between font-sans">
      
      {/* CONTEÚDO SUPERIOR */}
      <div className="w-full flex flex-col">
        <header className="w-full pb-3 border-b border-white/[0.04] flex items-center justify-between mb-4">
          <h1 className="text-sm font-mono font-black uppercase tracking-wider text-white">HAAS PORTAL</h1>
          <span className="text-[10px] font-mono bg-slate-900 border border-white/[0.05] px-2 py-0.5 rounded-md text-cyan-400">
            Etapa {etapa} de 3
          </span>
        </header>

        <div className="w-full bg-slate-900/40 border border-white/[0.03] p-4 rounded-xl">
          <p className="text-xs text-slate-400">Conteúdo da tela aqui.</p>
        </div>
      </div>

      {/* BOTÃO INTEGRADO AO FLUXO (Aparece obrigatoriamente no final da folha) */}
      <div className="w-full pt-8 pb-4 mt-auto">
        <button 
          onClick={() => setEtapa((prev) => (prev < 3 ? prev + 1 : 0))}
          className="w-full h-12 bg-cyan-500 text-black font-mono font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center shadow-lg shadow-cyan-500/10"
        >
          Avançar Próxima Etapa →
        </button>
      </div>

    </div>
  );
}
