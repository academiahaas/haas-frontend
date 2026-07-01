"use client";
import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

interface FragmentItem {
  id: number;
  text: string;
}

interface MioloOrdenacaoProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
}

export default function MioloOrdenacao({ onSelectionChange, onValidateResult, status = 'IDLE' }: MioloOrdenacaoProps) {
  const referencePhrase = "I need to check the data before pushing to production.";
  const initialFragments = ["I need to", "before pushing", "the data", "check", "to production."];

  const [bank, setBank] = useState<FragmentItem[]>([]);
  const [deposit, setDeposit] = useState<FragmentItem[]>([]);

  useEffect(() => {
    setBank(initialFragments.map((text, idx) => ({ id: idx, text })).sort(() => Math.random() - 0.5));
    setDeposit([]);
  }, [status === 'IDLE']);

  const handlePush = (item: FragmentItem) => {
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
    const newDeposit = [...deposit, item];
    setDeposit(newDeposit);
    setBank(prev => prev.filter(b => b.id !== item.id));
    onSelectionChange?.(newDeposit.length > 0);
  };

  const handlePull = (item: FragmentItem) => {
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
    const newDeposit = deposit.filter(b => b.id !== item.id);
    setDeposit(newDeposit);
    setBank(prev => [...prev, item]);
    onSelectionChange?.(newDeposit.length > 0);
  };

  const executarValidacaoInterna = () => {
    const fraseConstruida = deposit.map(b => b.text).join(' ');
    const isCorrect = fraseConstruida === referencePhrase;
    onValidateResult?.(isCorrect);
  };

  const playSpeechNative = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(referencePhrase);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-4 text-left font-mono animate-fade-in min-h-0 flex-1">
      
      {/* 1) BOTÃO DE ÁUDIO INTEGRADO (TOPO) */}
      <div className="flex items-center gap-4 shrink-0 bg-[#070d19]/40 p-3 rounded-xl border border-white/[0.02]">
        <button 
          onClick={playSpeechNative}
          className="p-3.5 bg-[#1D2D44] hover:bg-[#243B55] border border-[#48627D]/30 text-[#38BDF8] rounded-xl cursor-pointer transition-all duration-150 active:scale-95 shadow-md shrink-0"
        >
          <Volume2 size={18} className="animate-pulse" />
        </button>
        <span className="text-[clamp(11px,3vw,13px)] font-black text-[#f59e0b]/90 uppercase tracking-wider leading-snug">
          Escute o áudio técnico e ordene as estruturas de código
        </span>
      </div>

      {/* 2) ÁREA DE MONTAGEM EXPANDIDA (MEIO) */}
      <div 
        className={`w-full rounded-xl p-4 min-h-[100px] flex-1 flex flex-wrap content-center justify-center gap-2.5 items-center transition-all duration-200 shadow-inner ${
          status === 'CORRECT' ? 'border-2 border-[#22C55E]/40 bg-[#042414]/30' :
          status === 'WRONG' ? 'border-2 border-[#EF4444]/40 bg-[#2E0B0E]/30 animate-shake' :
          'bg-[#070d19] border-2 border-dashed border-[#f59e0b]/20 shadow-2xl'
        }`}
      >
        {deposit.length === 0 && (
          <span className="text-slate-500 text-[clamp(11px,3.2vw,13px)] font-black uppercase tracking-widest pointer-events-none">Monte a frase aqui</span>
        )}
        {deposit.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePull(item)}
            className="px-3.5 py-2.5 bg-gradient-to-b from-[#FF8A2B] to-[#FF7420] text-white text-[clamp(14px,4vw,16px)] font-black rounded-xl border border-[#FFB478]/35 cursor-pointer shadow-md active:scale-95 transition-all whitespace-nowrap tracking-wide text-center"
          >
            {item.text}
          </button>
        ))}
      </div>

      {/* 3) BANCO DE PALAVRAS DISPONÍVEIS (BASE REESTRUTURADA) */}
      <div className="w-full flex flex-wrap gap-2.5 p-3 bg-[#070d19]/40 border border-white/[0.02] rounded-xl justify-center items-center shrink-0 min-h-[85px]">
        {bank.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePush(item)}
            className="px-3.5 py-2.5 bg-[#0c192e] hover:bg-[#f59e0b]/10 border border-white/[0.04] text-[#F8FAFC] hover:text-[#f59e0b] text-[clamp(14px,4vw,16px)] font-black rounded-xl shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap tracking-wide text-center"
          >
            {item.text}
          </button>
        ))}
      </div>

      {/* Gatilho Oculto mapeado nativamente para o CTA Master da Arena */}
      <button 
        id="hidden-validate-trigger" 
        onClick={executarValidacaoInterna} 
        className="hidden" 
      />

    </div>
  );
}
