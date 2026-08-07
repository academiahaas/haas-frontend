"use client";
import React, { useState, useEffect } from 'react';

interface MioloProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
}

export default function MioloBlocos({ onSelectionChange, onValidateResult, status = 'IDLE' }: MioloProps) {
  const gabarito = ["SELECT", "users", "WHERE", "id = 1"];
  const [blocosDisponiveis, setBlocosDisponiveis] = useState<string[]>([]);
  const [blocosMontados, setBlocosMontados] = useState<string[]>([]);

  useEffect(() => {
    setBlocosDisponiveis(["WHERE", "SELECT", "id = 1", "users"].sort(() => Math.random() - 0.5));
    setBlocosMontados([]);
  }, [status === 'IDLE']);

  const handlePush = (bloco: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(1020, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.03);
      }
    } catch (e) {}

    if (status === 'CORRECT') return;
    const novosMontados = [...blocosMontados, bloco];
    setBlocosMontados(novosMontados);
    setBlocosDisponiveis(prev => prev.filter(b => b !== bloco));
    if (onSelectionChange) onSelectionChange(novosMontados.length > 0);
  };

  const handlePull = (bloco: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(1020, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.03);
      }
    } catch (e) {}

    if (status === 'CORRECT') return;
    const novosMontados = blocosMontados.filter(b => b !== bloco);
    setBlocosMontados(novosMontados);
    setBlocosDisponiveis(prev => [...prev, bloco]);
    if (onSelectionChange) onSelectionChange(novosMontados.length > 0);
  };

  const ejecutarValidacaoInterna = () => {
    const acertou = JSON.stringify(blocosMontados) === JSON.stringify(gabarito);
    if (onValidateResult) onValidateResult(acertou);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-4 font-mono text-left animate-fade-in min-h-0 flex-1">
      
      {/* Zona Superior: Label + Área de Montagem */}
      <div className="w-full flex flex-col gap-2 flex-1 min-h-0">
        <span className="text-[clamp(14px,4vw,16px)] font-black text-[#38BDF8] tracking-wider uppercase shrink-0 text-center block px-2">
          Construa a Query Estrutural Movendo os Blocos:
        </span>
        
        {/* Área de montagem profunda expandida */}
        <div className={`w-full p-4 min-h-[100px] flex-1 rounded-xl flex flex-wrap content-center justify-center gap-2 items-center transition-all duration-200 ${
          status === 'CORRECT' ? 'bg-[#042414]/30 border-2 border-[#22C55E]/30' :
          status === 'WRONG' ? 'bg-[#2E0B0E]/30 border-2 border-red-500/30 animate-shake' :
          'bg-[#070d19] border-2 border-dashed border-[#f59e0b]/20 shadow-2xl'
        }`}>
          {blocosMontados.length === 0 && (
            <span className="text-slate-400 text-[clamp(14px,4.5vw,17px)] font-black uppercase tracking-widest pointer-events-none text-center px-4">Toque nos blocos abaixo</span>
          )}
          {blocosMontados.map((b, idx) => (
            <button
              key={idx}
              onClick={() => handlePull(b)}
              className="px-3 py-2.5 bg-gradient-to-b from-[#FF8A2B] to-[#FF7420] text-white text-[clamp(14px,4vw,16px)] font-black rounded-xl border border-[#FFB478]/35 cursor-pointer shadow-md active:scale-95 transition-all whitespace-nowrap tracking-wide"
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Zona Inferior: Banco de blocos livres (Fica preso acima do rodapé da arena) */}
      <div className="flex flex-wrap gap-2.5 w-full p-2 bg-[#070d19]/40 border border-white/[0.02] rounded-xl justify-center items-center shrink-0 min-h-[85px]">
        {blocosDisponiveis.map((b, idx) => (
          <button
            key={idx}
            onClick={() => handlePush(b)}
            className="px-3 py-2.5 bg-[#0c192e] hover:bg-[#f59e0b]/10 border border-white/[0.04] hover:border-[#f59e0b]/40 text-[#F8FAFC] hover:text-[#f59e0b] text-[clamp(14px,4vw,16px)] font-black rounded-xl shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap tracking-wide"
          >
            {b}
          </button>
        ))}
      </div>

      <button id="hidden-paragraph-trigger" onClick={ejecutarValidacaoInterna} className="hidden" />
    </div>
  );
}
