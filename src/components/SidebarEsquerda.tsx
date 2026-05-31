'use client';

import React from 'react';
import { Settings, Flame } from 'lucide-react';

export default function SidebarEsquerda() {
  // Configuração exata dos 10 blocos de XP da Sidebar (8 ativos laranjas, 2 escuros)
  const blocosXP = Array.from({ length: 10 }, (_, i) => i < 8);

  return (
    <aside className="w-[20%] bg-[#0C1A24] border-r border-[#152238] p-5 flex flex-col justify-between shrink-0 min-w-[260px] h-full relative select-none overflow-visible">
      
      {/* Bloco Superior: Logo + Card do Aluno */}
      <div className="flex flex-col gap-6">
        
        {/* LOGOTIPO OFICIAL HAAS IDIOMAS */}
        <div className="flex items-center gap-3 px-1 pt-2">
          <div className="h-11 w-11 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
            <span className="text-xl font-black text-[#0C1A24]">🤖</span>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-black text-[#00E5FF] tracking-tight leading-none uppercase">Haas</h1>
            <span className="text-[10px] text-slate-400 font-bold tracking-[0.32em] uppercase mt-1 leading-none">Idiomas</span>
          </div>
        </div>

        {/* CARD DE PERFIL DO ALUNO */}
        <div className="bg-[#152238] border border-slate-800/40 rounded-3xl p-5 relative shadow-inner">
          <button className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
            <Settings size={14} />
          </button>

          <div className="flex flex-col items-center text-center gap-2">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-cyan-200 border-2 border-[#0C1A24] flex items-center justify-center overflow-hidden shadow-md">
                <span className="text-3xl">👦🏽</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#00E5FF] text-[#0C1A24] font-mono text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#152238] shadow-md">
                B2
              </div>
            </div>

            <div className="flex flex-col mt-1">
              <h2 className="text-sm font-black text-white tracking-wide">Aluno Teste</h2>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">Nível B1 Intermediário</span>
            </div>
          </div>

          {/* BARRA DE PROGRESSO DE XP SEGMENTADA */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
              <span>XP: 2.450 / 3.000</span>
              <span className="text-[#F59E0B]">(81% para B2)</span>
            </div>
            
            <div className="flex items-center justify-between gap-1 w-full h-2">
              {blocosXP.map((ativo, index) => (
                <div
                  key={index}
                  className={`h-full flex-1 rounded-sm transition-all duration-300 ${
                    ativo ? 'bg-[#F59E0B] shadow-sm shadow-orange-500/20' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* MASCOTE DA MARCA E PARTÍCULAS (MÉTODO GEOMÉTRICO HIGH-TECH) */}
      <div className="w-full relative flex flex-col items-center justify-end shrink-0 pt-20 pb-4 overflow-visible select-none">
        
        <div 
          className="absolute -bottom-10 -left-12 h-36 w-36 bg-[#F59E0B]/15 rounded-full blur-2xl z-0 pointer-events-none" 
          style={{ mixBlendMode: 'screen' }}
        />

        <div className="absolute inset-x-0 -top-6 h-24 pointer-events-none z-10 overflow-visible">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#152238]/90 p-2 rounded-full border border-slate-800 shadow-lg shadow-orange-500/10 animate-bounce" style={{ animationDuration: '3s' }}>
            <Flame size={14} className="text-[#F59E0B]" fill="currentColor" />
          </div>

          <div className="absolute top-8 left-6 h-5 w-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center animate-pulse">
            <span className="text-[7px] text-indigo-300">⭐</span>
          </div>
          <div className="absolute top-0 right-10 h-4 w-4 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
            <span className="text-[6px] text-orange-300">⭐</span>
          </div>
          <div className="absolute top-10 right-4 h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-pulse" style={{ animationDuration: '2s' }}>
            <span className="text-[7px] text-amber-300">⭐</span>
          </div>
        </div>

        {/* VISOR HOLO-MECH DE IA (ESTILO DARK TECH) */}
        <div className="w-full flex justify-end relative z-20 overflow-visible translate-x-2 pr-2">
          <div className="relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
            
            <div className="h-28 w-28 bg-[#112240]/90 border-2 border-[#1e293b] rounded-2xl flex flex-col items-center justify-center relative p-3 shadow-2xl backdrop-blur-md group-hover:border-[#00E5FF]/40 transition-colors">
              
              <div className="absolute -top-3 left-4 h-4 w-1.5 bg-[#1e293b] rounded-t-sm group-hover:bg-[#00E5FF]/60 transition-colors" />
              <div className="absolute -top-3 right-4 h-4 w-1.5 bg-[#1e293b] rounded-t-sm group-hover:bg-[#00E5FF]/60 transition-colors" />

              <div className="w-full h-11 bg-[#07111e] border border-[#1b2b4a] rounded-xl flex items-center justify-between px-3 relative overflow-hidden shadow-inner">
                <div className="absolute inset-x-0 h-[1px] bg-[#00E5FF]/30 top-1/2 animate-pulse" />
                <div className="h-2 w-4 bg-[#00E5FF] rounded-sm shadow-[0_0_8px_#00E5FF] animate-pulse" />
                <div className="h-2 w-4 bg-[#00E5FF] rounded-sm shadow-[0_0_8px_#00E5FF] animate-pulse" />
              </div>

              <div className="flex gap-1 mt-3 justify-center w-full">
                <div className="h-1.5 w-1 bg-slate-700 rounded-full" />
                <div className="h-2 w-1 bg-[#00E5FF]/60 rounded-full animate-bounce" style={{ animationDuration: '1s' }} />
                <div className="h-3 w-1 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDuration: '0.8s' }} />
                <div className="h-2 w-1 bg-[#00E5FF]/60 rounded-full animate-bounce" style={{ animationDuration: '1.2s' }} />
                <div className="h-1.5 w-1 bg-slate-700 rounded-full" />
              </div>

            </div>

            <div className="absolute inset-0 bg-[#00E5FF]/5 rounded-2xl blur-xl pointer-events-none group-hover:bg-[#00E5FF]/10 transition-colors" />
          </div>
        </div>

        {/* Nome Identificador da Base */}
        <div className="w-full text-center mt-3 relative z-30 shrink-0">
          <span className="text-[10px] font-black text-[#00E5FF] tracking-[0.2em] uppercase bg-[#152238]/80 px-4 py-1.5 rounded-full border border-slate-800/80 shadow-md">
            HAAS BOT
          </span>
        </div>

      </div>

    </aside>
  );
}
