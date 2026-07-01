"use client";
import React, { useState, useEffect } from 'react';

interface MioloProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
}

export default function MioloCacaErro({ onSelectionChange, onValidateResult, status = 'IDLE' }: MioloProps) {
  const [linhaSelecionada, setLinhaSelecionada] = useState<number | null>(null);
  const linhaErrada = 3; // Linha com erro sintático estrutural

  const linhasCodigo = [
    "1  import pyil as np",
    "2  def data_schema(void):",
    "3  ____self.schema.bit = [!]", // ERRO AQUI
    "4  ____self.DEFAULT = 'NO_DATA'",
    "5  ____return True"
  ];

  useEffect(() => {
    if (status === 'IDLE') setLinhaSelecionada(null);
  }, [status]);

  const handleLineClick = (idx: number) => {
    if (status !== 'IDLE') return;
    
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
    setLinhaSelecionada(idx);
    if (onSelectionChange) onSelectionChange(true);
  };

  const executarValidacaoInterna = () => {
    if (linhaSelecionada === null || !onValidateResult) return;
    onValidateResult(linhaSelecionada === linhaErrada);
  };

  return (
    <div className="w-full h-full bg-[#070d19] border border-[#38BDF8]/20 p-4 rounded-xl font-mono text-[clamp(11px,3.2vw,15px)] text-slate-200 flex flex-col justify-between gap-2 flex-1 min-h-0 shadow-2xl animate-fade-in">
      <span className="text-[clamp(10px,2.5vw,13px)] font-bold text-[#38BDF8] tracking-widest block mb-2 uppercase shrink-0 text-center">
        ANALISE AS LINHAS DE ARQUITETURA ABAIXO:
      </span>
      
      {linhasCodigo.map((linha, idx) => {
        const isSelected = linhaSelecionada === idx;
        
        let lineStyle = "hover:bg-[#f59e0b]/10 hover:text-[#f59e0b] text-slate-300 border-l-2 border-transparent hover:border-[#f59e0b]/40 cursor-pointer transition-all";
        if (isSelected) {
          if (status === 'CORRECT') lineStyle = "bg-[#042414] text-[#22C55E] border-l-2 border-[#22C55E] font-bold";
          else if (status === 'WRONG') lineStyle = "bg-[#2E0B0E] text-[#EF4444] border-l-2 border-[#EF4444] font-bold animate-shake";
          else lineStyle = "bg-[#FF8228]/10 text-[#FF8A2B] border-l-2 border-[#FF8A2B] font-bold";
        }

        return (
          <div
            key={idx}
            onClick={() => handleLineClick(idx)}
            className={`p-3 rounded flex-1 flex items-center justify-start transition-all duration-150 select-none font-mono tracking-wide min-h-0 ${lineStyle}`}
          >
            {(() => {
              const match = linha.match(/^\s*(\d+)\s*(.*)$/);
              if (match) {
                const [_, numero, restoCodigo] = match;
                return (
                  <>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black font-mono bg-[#030914] border border-[#f59e0b]/30 text-[#f59e0b] shrink-0 shadow-sm mr-3">
                      {numero}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all leading-snug">{restoCodigo}</span>
                  </>
                );
              }
              return <span className="flex-1">{linha}</span>;
            })()}
          </div>
        );
      })}

      <button id="hidden-paragraph-trigger" onClick={executarValidacaoInterna} className="hidden" />
    </div>
  );
}
