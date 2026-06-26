'use client';
import React, { useState } from 'react';
import { Turtle, Zap, Rocket, CheckCircle, XCircle } from 'lucide-react';

interface MioloVelocidadeProgressivaProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
}

export default function MioloVelocidadeProgressiva({ onSelectCorrect, onSelectWrong }: MioloVelocidadeProgressivaProps) {
  const fraseAlvo = "I need to check the data before pushing to production.";
  const [activeSpeed, setActiveSpeed] = useState<'slow' | 'normal' | 'native' | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const options = [
    { id: 1, text: 'O som do "D" em "NEED" sofre elisão completa (sumiço).' },
    { id: 2, text: 'O "TO" reduz para uma vogal neutra e se conecta como um "R de arara" rápido no "CHECK".' },
    { id: 3, text: 'O "G" de "PUSHING" alonga a vogal e gera uma pausa glotal estrutural.' }
  ];
  const correctId = 2;

  const playAudio = (speed: 'slow' | 'normal' | 'native', rate: number) => {
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

    setActiveSpeed(speed);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(fraseAlvo);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleValidarOpcao = (id: number) => {
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
    setSelectedId(id);

    if (id === correctId) {
      setStatus('CORRECT');
      onSelectCorrect?.();
    } else {
      setStatus('WRONG');
      onSelectWrong?.();
      setTimeout(() => {
        setSelectedId(null);
        setStatus('IDLE');
      }, 1500);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-stretch text-left font-mono animate-fade-in min-h-0 flex-1 gap-6 py-auto">
      
      {/* ENUNCIADO DE COMANDO (TOPO) */}
      <span className="text-[clamp(11px,3vw,13px)] font-black text-cyan-400 uppercase tracking-wider block shrink-0 leading-snug">
        Alterne as marchas de escuta nativa e marque a alteração de redução fonética:
      </span>

      {/* CONTROLES DE VELOCIDADE EXPANDIDOS */}
      <div className="grid grid-cols-3 gap-2 w-full shrink-0">
        <button
          onClick={() => playAudio('slow', 0.6)}
          className={`py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-black text-[clamp(11px,3vw,13px)] uppercase cursor-pointer transition-all active:scale-[0.96] select-none ${
            activeSpeed === 'slow' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-[#020B12] border-slate-800 text-slate-400'
          }`}
        >
          <Turtle size={18} /> <span>0.6x Slow</span>
        </button>
        <button
          onClick={() => playAudio('normal', 0.9)}
          className={`py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-black text-[clamp(11px,3vw,13px)] uppercase cursor-pointer transition-all active:scale-[0.96] select-none ${
            activeSpeed === 'normal' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-[#020B12] border-slate-800 text-slate-400'
          }`}
        >
          <Zap size={18} /> <span>1.0x Mid</span>
        </button>
        <button
          onClick={() => playAudio('native', 1.25)}
          className={`py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-black text-[clamp(11px,3vw,13px)] uppercase cursor-pointer transition-all active:scale-[0.96] select-none ${
            activeSpeed === 'native' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-[#020B12] border-slate-800 text-slate-400'
          }`}
        >
          <Rocket size={18} /> <span>1.3x Pro</span>
        </button>
      </div>

      {/* ALTERNATIVAS DE ANÁLISE LINGUÍSTICA (MEIO EXPANDIDO) */}
      <div className="flex flex-col justify-center gap-3 w-full flex-1 min-h-0">
        {options.map((opt) => {
          const isCurrent = selectedId === opt.id;
          let optStyle = "border-slate-800 bg-[#04111C]/40 text-slate-300 hover:border-cyan-500/20";
          
          if (isCurrent) {
            if (status === 'CORRECT') optStyle = "border-[#00E676] bg-[#021008] text-[#00E676]";
            if (status === 'WRONG') optStyle = "border-red-500 bg-[#140406] text-red-500 animate-shake";
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleValidarOpcao(opt.id)}
              disabled={status === 'CORRECT'}
              className={`w-full text-left p-3 rounded-xl border-2 text-[clamp(13px,3.8vw,15px)] font-bold leading-relaxed transition-all cursor-pointer flex-1 min-h-0 flex items-center`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* FEEDBACK INFERIOR - REMOVIDO MIN-H E TORNADO CONDICIONAL PURO */}
      {status === 'CORRECT' && (
        <div className="w-full shrink-0 flex items-center justify-center pt-1">
          <div className="flex items-center gap-2 text-[#00E676] text-[11px] font-black uppercase tracking-wider animate-bounce text-center">
            <CheckCircle size={15} /> <span>Mapeamento fonético brilhante! É assim que nativos emendam a frase.</span>
          </div>
        </div>
      )}
      
    </div>
  );
}
