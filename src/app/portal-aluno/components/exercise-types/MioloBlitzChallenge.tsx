'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Zap, ShieldAlert, Award } from 'lucide-react';

interface MioloBlitzChallengeProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  triggerGlow?: boolean;
}

interface BlitzQuestion {
  word: string;
  correct: string;
  options: string[];
}

export default function MioloBlitzChallenge({
  onSelectCorrect,
  onSelectWrong,
  triggerGlow = false
}: MioloBlitzChallengeProps) {
  const questions: BlitzQuestion[] = [
    { word: "DEPLOY", correct: "Implantação", options: ["Implantação", "Desenvolvimento", "Deletar", "Atrasar"] },
    { word: "SHARDING", correct: "Fragmentação", options: ["Compactação", "Fragmentação", "Criptografia", "Alinhamento"] },
    { word: "PIPELINE", correct: "Esteira de automação", options: ["Conexão direta", "Esteira de automação", "Fila de espera", "Banco de dados"] }
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [totalXp, setTotalXp] = useState<number>(0);
  
  const [feedback, setFeedback] = useState<{ id: string; text: string; color: string } | null>(null);
  const [clickedOption, setClickedOption] = useState<string | null>(null);
  
  const timerRef = useRef<any>(null);
  const currentQuestion = questions[currentIndex % questions.length];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameOver]);

  const handleOptionClick = (option: string) => {
    if (gameOver || clickedOption !== null) return;
    
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
    setClickedOption(option);

    if (option === currentQuestion.correct) {
      setTimeLeft(prev => Math.min(prev + 2, 30));
      setTotalXp(prev => prev + 10);
      setFeedback({ id: Math.random().toString(), text: "+2s | +10 PTS 🔥", color: "text-emerald-400" });
      onSelectCorrect?.();

      setTimeout(() => {
        setClickedOption(null);
        setFeedback(null);
        setCurrentIndex(prev => prev + 1);
      }, 400);

    } else {
      setTimeLeft(prev => Math.max(prev - 4, 0));
      setFeedback({ id: Math.random().toString(), text: "-4s ⚠️", color: "text-red-500 font-mono" });
      onSelectWrong?.();

      setTimeout(() => {
        setClickedOption(null);
        setFeedback(null);
        setCurrentIndex(prev => prev + 1);
      }, 400);
    }
  };

  const barPercentage = (timeLeft / 30) * 100;
  const executarValidacaoInterna = () => {};

  return (
    <div className="w-full h-full flex flex-col items-center justify-between overflow-visible relative flex-1 min-h-0 gap-4">
      {feedback && (
        <div key={feedback.id} className={`absolute top-12 font-black text-[14px] tracking-wider uppercase animate-bounce ${feedback.color} z-30 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]`}>
          {feedback.text}
        </div>
      )}

      {gameOver ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center bg-[#040D17] border-2 border-amber-500 p-6 rounded-2xl text-center space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] animate-in zoom-in-95 duration-200 my-auto">
          <Award size={42} className="mx-auto text-amber-500 animate-pulse" />
          <h3 className="text-[clamp(14px,4.5vw,18px)] font-mono font-black text-white tracking-widest uppercase">TEMPO ESGOTADO</h3>
          <p className="text-[clamp(14px,4vw,16px)] text-slate-300 font-medium max-w-sm px-2 leading-relaxed text-center">Módulos de vocabulário técnico processados e synchronized com o ecossistema Haas.</p>
          <div className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-black text-[clamp(11px,3.5vw,14px)] rounded-xl tracking-wider w-11/12 max-w-xs text-center">
            TOTAL DE PROGRESSO: +{totalXp} PTS
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-between flex-1 min-h-0">
          
          {/* BARRA DE TEMPO */}
          <div className="w-full bg-black border border-slate-900 rounded-xl h-8 relative overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] flex items-center shrink-0">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 to-[#00F0FF] transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,240,255,0.6)]"
              style={{ width: `${barPercentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-[clamp(15px,4.5vw,18px)] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,1)] select-none">
              00:{timeLeft < 10 ? '0' : ''}{timeLeft}
            </div>
          </div>

          {/* PALAVRA CENTRALIZADA EM DESTAQUE */}
          <div className="text-center select-none w-full py-4 flex-1 flex flex-col items-center justify-center">
            <h1 className="text-white font-black text-[clamp(32px,9vw,44px)] tracking-widest leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] uppercase font-sans text-center break-words w-full">
              {currentQuestion.word}
            </h1>
            <p className="text-[clamp(12px,3.5vw,14px)] font-mono font-black text-slate-400 tracking-widest uppercase mt-3 flex items-center justify-center gap-1">
              <Zap size={11} className="text-[#00F0FF]" /> CLIQUE DIRETO NA TRADUÇÃO TÉCNICA
            </p>
          </div>

          {/* PAR DE OPÇÕES RESTRUTURADO EM ALTURA EQUILIBRADA */}
          <div className="grid grid-cols-2 gap-3 w-full flex-1 min-h-0 max-h-[160px] pb-1">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = clickedOption === option;
              const isCorrect = option === currentQuestion.correct;
              
              let borderClass = 'border-white/[0.04] bg-[#0c192e] text-slate-200 hover:bg-[#f59e0b]/10 hover:border-[#f59e0b]/40';
              if (isSelected) {
                borderClass = isCorrect 
                  ? 'border-emerald-500 bg-[#021008] text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold'
                  : 'border-red-500 bg-[#140406] text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-shake font-bold';
              }

              return (
                <button
                  key={idx}
                  disabled={clickedOption !== null}
                  onClick={() => handleOptionClick(option)}
                  className={`h-14 w-full rounded-xl border-2 flex items-center justify-center font-black text-[clamp(14px,3.8vw,17px)] leading-tight transition-all active:scale-[0.97] select-none text-center flex-1 min-h-0 px-2 whitespace-normal break-words ${borderClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button id="hidden-paragraph-trigger" onClick={executarValidacaoInterna} className="hidden" />
    </div>
  );
}
