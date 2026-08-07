'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle, XCircle } from 'lucide-react';

interface DitadoLacunasProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
}

export default function DitadoLacunas({ onSelectCorrect, onSelectWrong }: DitadoLacunasProps) {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const targetWord = "check";
  const sentencePrefix = "I need to ";
  const sentenceSuffix = " the data before pushing to production.";

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const playAudio = () => {
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

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("I need to check the data before pushing to production.");
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVerificar = () => {
    if (status !== 'IDLE' || !inputValue.trim()) return;
    
    if (inputValue.trim().toLowerCase() === targetWord.toLowerCase()) {
      setStatus('CORRECT');
      onSelectCorrect?.();
    } else {
      setStatus('WRONG');
      onSelectWrong?.();
      setTimeout(() => {
        setInputValue('');
        setStatus('IDLE');
        if (inputRef.current) inputRef.current.focus();
      }, 1500);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-stretch text-left animate-fade-in font-mono flex-1 min-h-0 gap-4">
      
      {/* SEÇÃO DO PLAYER (TOPO) */}
      <div className="flex items-center gap-4 shrink-0 bg-[#070d19]/40 p-3 rounded-xl border border-white/[0.02]">
        <button 
          onClick={playAudio} 
          className="p-4 bg-[#0c192e] hover:bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl transition-all duration-150 cursor-pointer active:scale-95 shadow-[0_4px_15px_rgba(0,255,255,0.05)] shrink-0"
          title="Ouvir áudio técnico"
        >
          <Volume2 size={24} className="animate-pulse" />
        </button>
        <span className="text-[clamp(11px,3.2vw,13px)] font-black text-slate-400 uppercase tracking-wider leading-snug">
          Clique no <span className="text-cyan-400">alto-falante</span> para escutar e digite a palavra ausente
        </span>
      </div>

      {/* ÁREA CENTRAL DA FRASE (EXPANDIDA E CENTRALIZADA) */}
      <div className="bg-[#0c192e] border border-white/[0.04] rounded-xl py-5 px-3 text-[clamp(13px,3.8vw,16px)] font-bold text-slate-300 leading-relaxed flex flex-wrap items-center justify-center gap-x-2 gap-y-3 flex-1 min-h-0 w-full overflow-y-auto">
        <span>{sentencePrefix}</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={status === 'CORRECT'}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVerificar()}
          placeholder="???"
          className={`bg-[#070d19] border-2 rounded-xl px-3 py-1.5 text-center font-black tracking-wide text-[clamp(14px,4vw,16px)] w-32 transition-all focus:outline-none focus:border-[#f59e0b]/50 ${
            status === 'CORRECT' ? 'border-[#00E676] text-[#00E676]' : status === 'WRONG' ? 'border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]' : 'border-white/[0.08] text-[#f59e0b]'
          }`}
        />
        <span>{sentenceSuffix}</span>
      </div>

      {/* SEÇÃO DE FEEDBACKS / AÇÃO (BASE) */}
      <div className="w-full shrink-0 mt-auto min-h-[50px] flex items-center justify-center">
        {status === 'IDLE' && (
          <button 
            onClick={handleVerificar}
            className="w-full py-4 bg-[#070d19] hover:bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black text-[clamp(12px,3.5vw,14px)] uppercase tracking-widest rounded-xl transition-all duration-200 cursor-pointer shadow-[0_4px_15px_rgba(0,255,255,0.02)] hover:border-cyan-400"
          >
            Verificar Resposta (Enter)
          </button>
        )}

        {status === 'CORRECT' && (
          <div className="flex items-center justify-center gap-2 text-[#00E676] text-[clamp(12px,3.5vw,14px)] font-black uppercase tracking-wider animate-bounce w-full text-center py-2">
            <CheckCircle size={16} /> <span>Excelente! Escuta e grafia perfeitas.</span>
          </div>
        )}

        {status === 'WRONG' && (
          <div className="flex items-center justify-center gap-2 text-red-500 text-[clamp(12px,3.5vw,14px)] font-black uppercase tracking-wider animate-pulse w-full text-center py-2">
            <XCircle size={16} /> <span>Incorreto. Ouça novamente e ajuste a digitação!</span>
          </div>
        )}
      </div>
    </div>
  );
}
