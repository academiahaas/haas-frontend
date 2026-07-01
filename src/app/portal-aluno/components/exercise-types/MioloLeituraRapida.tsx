'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle, XCircle } from 'lucide-react';

interface MioloLeituraRapidaProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
}

export default function MioloLeituraRapida({ onSelectCorrect, onSelectWrong }: MioloLeituraRapidaProps) {
  const countdownTime = 10;
  const microtext = "CRITICAL METRIC: Pushing unstaged configuration changes directly into production clusters without running automated pipeline test suites triggered widespread replica deadlocks and high-latency sharding blocks last Tuesday.";
  const questionAssertion = "According to the text, the replica deadlocks were caused by executing automated pipeline test suites.";
  
  const [timeLeft, setTimeLeft] = useState<number>(countdownTime);
  const [phase, setPhase] = useState<'LEITURA' | 'PERGUNTA'>('LEITURA');
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (phase === 'LEITURA') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setPhase('PERGUNTA');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleSelectAnswer = (answer: boolean) => {
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

    if (phase !== 'PERGUNTA' || statusFeedback !== null) return;
    setSelectedAnswer(answer);

    if (answer === false) {
      setStatusFeedback('CORRECT');
      onSelectCorrect?.();
    } else {
      setStatusFeedback('WRONG');
      onSelectWrong?.();
      setTimeout(() => {
        setSelectedAnswer(null);
        setStatusFeedback(null);
      }, 1500);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-4 text-left font-mono animate-fade-in flex-1 min-h-0">
      
      {/* Barra de Cronômetro do Sprint */}
      <div className="flex items-center justify-between bg-[#070d19] border border-white/[0.04] rounded-xl px-3 py-2 w-full select-none shrink-0">
        <span className="text-[clamp(11px,3vw,13px)] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Timer size={13} className={phase === 'LEITURA' ? 'animate-spin text-[#f59e0b]' : 'text-slate-500'} />
          {phase === 'LEITURA' ? 'Tempo restante de leitura' : 'Fase de julgamento ativa'}
        </span>
        <span className={`text-xs font-mono font-black ${timeLeft <= 3 && phase === 'LEITURA' ? 'text-red-500 animate-pulse' : 'text-[#f59e0b]'}`}>
          00:{timeLeft < 10 ? '0' : ''}{timeLeft}
        </span>
      </div>

      {/* ÁREA DE CONTEÚDO ELÁSTICA (OCUPA TODO O VÃO DISPONÍVEL) */}
      <div className="w-full flex-1 flex flex-col justify-between min-h-0">
        {phase === 'LEITURA' ? (
          <div className="bg-[#0c192e] border border-white/[0.04] rounded-xl p-4 text-[clamp(13px,3.8vw,16px)] font-medium leading-relaxed text-slate-200 shadow-xl select-text flex-1 flex items-center justify-center text-center overflow-y-auto scrollbar-none">
            {microtext}
          </div>
        ) : (
          <div className="flex flex-col justify-between flex-1 w-full min-h-0 gap-4">
            <div className="bg-[#070d19] border border-white/[0.04] rounded-2xl p-4 text-[clamp(13px,3.8vw,15px)] font-bold text-slate-200 leading-relaxed shadow-md flex-1 flex flex-col justify-center">
              <span className="text-[clamp(11px,3vw,13px)] font-black text-[#f59e0b] block mb-2 uppercase tracking-wide">
                Afirmação para Julgamento:
              </span>
              "{questionAssertion}"
            </div>

            <div className="grid grid-cols-2 gap-3 w-full shrink-0">
              <button
                onClick={() => handleSelectAnswer(true)}
                disabled={statusFeedback === 'CORRECT'}
                className={`py-4 rounded-xl border-2 font-black text-[clamp(12px,3.5vw,14px)] uppercase tracking-wider transition-all active:scale-[0.97] select-none ${
                  selectedAnswer === true && statusFeedback === 'WRONG' 
                    ? 'border-red-500 bg-[#140406] text-red-500' 
                    : 'border-slate-800 bg-[#04111C]/40 text-slate-300'
                }`}
              >
                True (Verdadeiro)
              </button>
              <button
                onClick={() => handleSelectAnswer(false)}
                className={`py-4 rounded-xl border-2 font-black text-[clamp(12px,3.5vw,14px)] uppercase tracking-wider transition-all active:scale-[0.97] select-none ${
                  selectedAnswer === false && statusFeedback === 'CORRECT' 
                    ? 'border-[#00E676] bg-[#021008] text-[#00E676]' 
                    : 'border-slate-800 bg-[#04111C]/40 text-slate-300'
                }`}
              >
                False (Falso)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FEEDBACK INFERIOR - ESPAÇAMENTO REESCRITO ZERO (ELIMINADO MIN-H E DIVS SOBRESSALENTES) */}
      {statusFeedback === 'CORRECT' && (
        <div className="w-full shrink-0 flex items-center justify-center pt-1">
          <div className="flex items-center gap-2 text-[#00E676] text-[11px] font-black uppercase tracking-wider animate-bounce text-center">
            <CheckCircle size={15} /> <span>Análise de contexto perfeita! Você interpretou o log corretamente.</span>
          </div>
        </div>
      )}
      
    </div>
  );
}
