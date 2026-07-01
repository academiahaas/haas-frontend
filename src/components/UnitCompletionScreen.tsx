/* =========================================================================
  COMPONENTE: BANNER DE FIM DE UNIDADE (UNIT COMPLETION SCREEN)
  HAAS ACADEMY - DESIGN SLIM PARA MICRO-VITÓRIAS FLUIDAS SEM BLOQUEIO DE TELA
  =========================================================================
*/

'use client';

import React from 'react';
import { CheckCircle2, Coins, ArrowRight, Sparkles } from 'lucide-react';

interface UnitCompletionScreenProps {
  mostrar: boolean;
  onAvancarUnidade: () => void;
}

export function UnitCompletionScreen({ mostrar, onAvancarUnidade }: UnitCompletionScreenProps) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-[#05090e]/85 backdrop-blur-sm z-[999999] flex flex-col items-center justify-center p-4 select-none animate-fadeIn">
      
      {/* Keyframes de transição ultra-rápida e fluida */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideDownSlim {
          0% { opacity: 0; transform: translateY(-30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-down-slim {
          animation: slideDownSlim 0.35s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}} />

      {/* BANNER ULTRA-SLIM DE INPUT ACELERADO */}
      <div className="w-full max-w-md bg-[#09131f] border-2 border-emerald-500/20 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] animate-slide-down-slim">
        
        {/* Ícone de Check Neon Compacto */}
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[#00FF66] relative animate-pulse">
          <CheckCircle2 size={32} strokeWidth={2.5} />
          <div className="absolute -top-1 -right-1 text-yellow-400">
            <Sparkles size={12} />
          </div>
        </div>

        {/* Textos de Progresso Rápido */}
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest block">UNIT COMPLETED</span>
          <h2 className="text-xl font-black tracking-tight text-white uppercase">
            Unidade Concluída!
          </h2>
          <p className="text-[11px] font-bold text-slate-400 max-w-[280px] mx-auto leading-tight">
            Mais um passo na grade tática. Seus pontos foram enviados diretamente para o baú.
          </p>
        </div>

        {/* Feedback de Moedas */}
        <div className="flex items-center gap-2 bg-[#04090f] border border-slate-800/60 px-4 py-2 rounded-xl text-xs font-mono font-black text-white shadow-inner">
          <Coins size={14} className="text-[#FFD700]" />
          <span>+10 MOEDAS ADICIONADAS</span>
        </div>

        {/* Botão de Avanço Imediato */}
        <button 
          onClick={onAvancarUnidade}
          className="w-full py-3 rounded-xl font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 bg-gradient-to-b from-emerald-500 to-emerald-600 text-black shadow-[0_4px_15px_rgba(0,255,102,0.25)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          PRÓXIMA LIÇÃO <ArrowRight size={12} strokeWidth={3} />
        </button>

      </div>
    </div>
  );
}