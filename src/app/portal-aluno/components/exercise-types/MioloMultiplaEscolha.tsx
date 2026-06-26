"use client";
import React, { useState, useEffect } from 'react';

interface MioloProps {
  options?: string[];
  correctOption?: string;
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
}

export default function MioloMultiplaEscolha({ 
  options = [
    'Iniciando o deploy sem rodar validações secundárias de banco.',
    'Verificando as migrações e integridade dos clusters antes do fluxo final.',
    'Corrigindo pacotes de latência alta diretamente no cluster de produção.',
    'Ignorando os testes de integração contínua (CI/CD) para ganho de velocidade.'
  ], 
  correctOption = 'Verificando as migrações e integridade dos clusters antes do fluxo final.',
  onSelectionChange,
  onValidateResult,
  status = 'IDLE'
}: MioloProps) {
  const [selecionado, setSelecionado] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'IDLE') setSelecionado(null);
  }, [status]);

  const handleSelect = (opcao: string) => {
    if (status !== 'IDLE') return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1020, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);
      }
    } catch (e) {}
    setSelecionado(opcao);
    if (onSelectionChange) onSelectionChange(true);
  };

  const executarValidacaoInterna = () => {
    if (!selecionado || !onValidateResult) return;
    onValidateResult(selecionado === correctOption);
  };

  return (
    <div className="flex flex-col items-stretch justify-between w-full h-full font-mono text-left animate-fade-in flex-1 min-h-0">
      {options.map((opcao, idx) => {
        const isThisSelected = selecionado === opcao;
        
        let customStyle = "bg-[#0c192e] border-white/[0.04] text-[#F8FAFC] shadow-[0_6px_18px_rgba(0,0,0,0.15)] hover:brightness-[1.03] hover:border-[#f59e0b]/40 hover:brightness-[1.08] hover:shadow-lg";
        
        if (isThisSelected) {
          if (status === 'CORRECT') {
            customStyle = "bg-gradient-to-b from-[#FF8A2B] to-[#FF7420] border-[#FFB478]/35 text-white shadow-[0_0_24px_rgba(255,160,70,0.35)]";
          } else if (status === 'WRONG') {
            customStyle = "bg-[#6B2B2B] border-red-500/20 text-[#F8FAFC]";
          } else {
            customStyle = "bg-gradient-to-b from-[#FF8A2B] to-[#FF7420] border-[#FFB478]/35 text-white shadow-[0_10px_32px_rgba(255,120,40,0.22)] active:scale-[0.98]";
          }
        }

        return (
          <button
            key={idx}
            disabled={status !== 'IDLE'}
            onClick={() => handleSelect(opcao)}
            className={`w-full flex items-center justify-start text-left gap-3 p-2.5 md:p-4 rounded-xl font-sans font-medium text-xs md:text-sm leading-normal border cursor-pointer transition-all duration-180 ease-out ${customStyle}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black font-mono border shrink-0 transition-all ${
              isThisSelected ? 'bg-white/20 border-white/40 text-white' : 'bg-[#070d19] border-[#f59e0b]/30 text-[#f59e0b]'
            }`}>
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="flex-1">{opcao}</span>
          </button>
        );
      })}

      <button id="hidden-paragraph-trigger" onClick={executarValidacaoInterna} className="hidden" />
    </div>
  );
}
