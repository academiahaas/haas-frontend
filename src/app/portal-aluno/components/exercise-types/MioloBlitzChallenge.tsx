'use client';
import React, { useState, useEffect, useRef } from 'react';
import { registrarFeedbackEErro } from '@/utils/motorResiliencia';
import { supabase } from '@/lib/supabase';
import { Zap, ShieldAlert, Award } from 'lucide-react';

interface MioloBlitzChallengeProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  triggerGlow?: boolean;
  unidadeAtiva?: string;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
}

interface BlitzQuestion {
  word: string;
  correct: string;
  options: string[];
}

export default function MioloBlitzChallenge({
  onSelectCorrect,
  onSelectWrong,
  triggerGlow,
  unidadeAtiva,
  onValidateResult
}: MioloBlitzChallengeProps) {
  const [exerciseId, setExerciseId] = useState("");
  const [questions, setQuestions] = useState<BlitzQuestion[]>([
    { word: "CARREGANDO...", correct: "Carregando...", options: ["Carregando...", "...", "...", "..."] }
  ]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ id: string; text: string; color: string } | null>(null);
  const [clickedOption, setClickedOption] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const validadoRef = useRef<boolean>(false);

  useEffect(() => {
    if (gameOver && onValidateResult && !validadoRef.current) {
      validadoRef.current = true;
      onValidateResult(totalXp > 0, `Desafio Concluído! Você conquistou ${totalXp} PTS no Blitz.`, totalXp, exerciseId || unidadeAtiva);
    }
  }, [gameOver, onValidateResult, totalXp, exerciseId, unidadeAtiva]);

  

    useEffect(() => {
    async function carregarBlitzDoBanco() {
      try {
        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined" || nomeUnidade.includes("Labirinto") || nomeUnidade.includes("Primeiro")) {
          nomeUnidade = "1.1";
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);

        let query = supabase.from("exercises").select("*").eq("activity_type", 3);
        if (isUUID) {
          query = query.eq("unit_id", nomeUnidade);
        } else {
          query = query.eq("unit", nomeUnidade);
        }

        const { data: dados, error } = await query;

        if (error) throw error;

        if (dados && dados.length > 0) {
          const formatadas = dados.map((item) => {
            let erradas = [];
            if (item.alternative_options) {
              if (Array.isArray(item.alternative_options)) {
                erradas = item.alternative_options;
              } else if (typeof item.alternative_options === 'string') {
                try {
                  erradas = JSON.parse(item.alternative_options);
                } catch (e) {
                  erradas = item.alternative_options.split(',').map(s => s.trim());
                }
              }
            }

            const todasOpcoes = item.correct_answer 
              ? Array.from(new Set([item.correct_answer, ...erradas]))
              : erradas;

            return {
              word: item.reading_text || 'WORD',
              correct: item.correct_answer || '',
              options: todasOpcoes
            };
          });

          console.log("=== ⚡ MIOLO: FORMATADO E APLICADO NO ESTADO ===", formatadas);
          setQuestions(formatadas);
            if (dados[0]?.id) setExerciseId(String(dados[0].id));
        }
      } catch (err) {
        console.error("Erro ao processar dados da central cliente no Blitz:", err);
      }
    }
    carregarBlitzDoBanco();
  }, [unidadeAtiva]);

  const currentQuestion = questions[currentIndex % questions.length];

  useEffect(() => {
    if (gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIndex, gameOver]);

  const handleOptionClick = async (opcao: string) => {
    if (clickedOption || gameOver) return;
    setClickedOption(opcao);
    const acertou = opcao === currentQuestion.correct;
    
    if (acertou) {
      setTotalXp((v) => v + 10);
      setFeedback({ id: String(Date.now()), text: '+10 PTS • EXTRAORDINÁRIO!', color: 'text-emerald-400' });
      if (onSelectCorrect) onSelectCorrect();
    } else {
      setFeedback({ id: String(Date.now()), text: 'SINTAXE INCORRETA!', color: 'text-rose-400' });
      if (onSelectWrong) onSelectWrong();
    }

    // Dispara a telemetria em background para persistir o erro instantaneamente se errar
    try {
      registrarFeedbackEErro({
        userId: "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1",
        enunciado: `Desafio Blitz - Palavra Alvo: ${currentQuestion.word}`,
        respostaCorreta: currentQuestion.correct,
        respostaAluno: opcao,
        idiomaNativoAluno: "Español"
      });
    } catch (e) {
      console.error(e);
    }
    
    setTimeout(() => {
      setFeedback(null);
      setClickedOption(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setGameOver(true);
      }
    }, 1200);
  };

  if (gameOver) {
    return (
      <div className='flex flex-col items-center justify-center p-6 bg-[#020813] border border-slate-900 rounded-2xl w-full h-full font-mono text-center animate-fade-in'>
        <Award className='w-12 h-12 text-[#FF8A2B] mb-3 animate-bounce' />
        <h3 className='text-[clamp(16px,2vw,22px)] font-black text-[#F8FAFC] tracking-wider uppercase mb-1'>Desafio Concluído</h3>
        <p className='text-[clamp(12px,1.4vw,15px)] text-slate-400 mb-4 font-medium'>Sua performance gerou rendimento</p>
        <div className='text-[clamp(22px,2.8vw,32px)] font-black text-[#FF8A2B] bg-[#FF8A2B]/10 px-8 py-2.5 rounded-xl border border-[#FF8A2B]/20 shadow-[0_0_20px_rgba(255,138,43,0.1)]'>
          +{totalXp} PTS
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-stretch justify-between w-full h-full font-mono animate-fade-in flex-1 min-h-0 gap-4'>
      <div className='flex items-center justify-between bg-white/[0.02] border border-white/[0.04] px-4 py-2.5 rounded-xl shadow-md'>
        <div className='flex items-center gap-2'>
          <Zap className='w-4 h-4 text-[#FF8A2B]' />
          <span className='text-[10px] md:text-xs font-bold text-slate-400 tracking-wider uppercase'>BLITZ LEVEL</span>
        </div>
        <div className='text-xs md:text-sm font-black tracking-widest text-[#FF8A2B]'>
          00:{timeLeft < 10 ? '0' + timeLeft : timeLeft}
        </div>
      </div>
      
      <div className='flex-1 flex flex-col items-center justify-center bg-[#01070e] border border-slate-900 rounded-2xl p-6 relative shadow-inner overflow-hidden min-h-[110px]'>
        <span className='absolute top-3 left-4 text-[9px] font-bold text-white/10 tracking-widest uppercase'>TARGET TOKEN</span>
        <h2 className='text-xl md:text-3xl font-black text-[#F8FAFC] tracking-wide uppercase select-none animate-pulse'>{currentQuestion.word}</h2>
        
        {feedback && (
          <div key={feedback.id} className={'absolute bottom-3 text-[10px] font-black tracking-widest animate-bounce ' + feedback.color}>
            {feedback.text}
          </div>
        )}
      </div>
      
      <div className='grid grid-cols-2 gap-2 w-full'>
        {currentQuestion.options.map((opcao, idx) => {
          const isThisClicked = clickedOption === opcao;
          let btnStyle = 'bg-[#0c192e] border-white/[0.04] text-[#F8FAFC] hover:border-[#FF8A2B]/30 hover:bg-white/[0.01]';
          
          if (isThisClicked) {
            btnStyle = opcao === currentQuestion.correct
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-rose-950/40 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
          }
          
          return (
            <button
              key={idx}
              disabled={clickedOption !== null || gameOver}
              onClick={() => handleOptionClick(opcao)}
              className={'w-full py-3 px-4 rounded-xl font-sans font-bold text-[clamp(14px,1.8vw,18px)] leading-snug border text-center transition-all duration-150 ' + btnStyle}
            >
              {opcao}
            </button>
          );
        })}
      </div>
    </div>
  );
}