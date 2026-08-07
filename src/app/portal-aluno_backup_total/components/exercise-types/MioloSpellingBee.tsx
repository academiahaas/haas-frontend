'use client';
import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle, XCircle } from 'lucide-react';

interface MioloSpellingBeeProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
}

export default function MioloSpellingBee({ onSelectCorrect, onSelectWrong }: MioloSpellingBeeProps) {
  const targetWord = "MIGRATION";
  const [userInput, setUserInput] = useState<string[]>(new Array(targetWord.length).fill(""));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ];

  const playWordAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("MIGRATION");
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyPress = (letter: string) => {
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

    if (status === 'CORRECT' || currentIndex >= targetWord.length) return;
    
    const nextInput = [...userInput];
    nextInput[currentIndex] = letter;
    setUserInput(nextInput);

    if (letter === targetWord[currentIndex]) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setStatus('IDLE');

      if (nextIndex === targetWord.length) {
        setStatus('CORRECT');
        onSelectCorrect?.();
      }
    } else {
      setStatus('WRONG');
      onSelectWrong?.();
      setTimeout(() => setStatus('IDLE'), 1000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-stretch text-left font-mono animate-fade-in min-h-0 flex-1 gap-4">
      
      {/* 1) CONTROLADOR DE ÁUDIO (TOPO) */}
      <div className="flex items-center gap-4 shrink-0 bg-[#070d19]/40 p-3 rounded-xl border border-white/[0.02]">
        <button onClick={playWordAudio} className="p-3.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl cursor-pointer transition-all shrink-0">
          <Volume2 size={22} className="animate-pulse" />
        </button>
        <span className="text-[clamp(11px,3vw,13px)] font-black text-cyan-400 uppercase tracking-wider leading-snug">
          Escute o conceito técnico e soletre caractere por caractere:
        </span>
      </div>

      {/* 2) EXIBIÇÃO EXPANDIDA DAS LETRAS (MEIO) */}
      <div className="flex-1 flex items-center justify-center min-h-0 w-full py-2">
        <div className="flex justify-center flex-wrap gap-1.5 w-full max-w-full overflow-x-auto p-2">
          {userInput.map((char, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`w-[clamp(28px,7.5vw,36px)] h-[clamp(40px,10vw,48px)] rounded-xl border-2 flex items-center justify-center font-sans font-black text-[clamp(14px,4vw,18px)] transition-all shadow-md shrink-0 ${
                  status === 'CORRECT' ? 'border-[#00E676] text-[#00E676] bg-[#021008]' :
                  isCurrent && status === 'WRONG' ? 'border-red-500 text-red-500 bg-[#140406] animate-shake' :
                  isCurrent ? 'border-cyan-400 text-cyan-400 bg-[#041220]' : 'border-slate-800 text-slate-400 bg-[#020B12]'
                }`}
              >
                {char}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3) TECLADO VIRTUAL ERGONÔMICO (BASE FIXED ACIMA DO RODAPÉ) */}
      <div className="flex flex-col gap-1.5 w-full items-center bg-[#020B12]/80 p-2.5 sm:p-4 rounded-2xl border border-slate-900 shadow-inner shrink-0 mt-auto">
        {keyboardRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5 justify-center w-full">
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => handleKeyPress(letter)}
                disabled={status === 'CORRECT'}
                className="w-[9%] h-[clamp(34px,9vw,40px)] bg-[#1C3B50]/60 active:bg-[#1C3B50] text-slate-200 border border-slate-800 rounded-lg font-sans text-[clamp(11px,3.2vw,13px)] font-black cursor-pointer transition-all disabled:opacity-10 select-none flex items-center justify-center"
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* FEEDBACK INFERIOR - SEM RESERVA DE PIXELS FIXOS, APENAS APARECE CONDICIONALMENTE NO FIM */}
      {status === 'CORRECT' && (
        <div className="w-full shrink-0 flex items-center justify-center pt-1">
          <div className="flex items-center gap-2 text-[#00E676] text-[12px] font-black uppercase tracking-wider justify-center animate-bounce text-center">
            <CheckCircle size={16} /> <span>Soletrando Perfeito! Domínio completo do termo.</span>
          </div>
        </div>
      )}
      
    </div>
  );
}
