'use client';
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect, useRef } from 'react';
import { registrarFeedbackEErro } from '@/utils/motorResiliencia';
import { supabase } from '@/lib/supabase';
import { Zap, ShieldAlert, Award } from 'lucide-react';

interface MioloBlitzChallengeProps {
  initialExerciseData?: any;
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  triggerGlow?: boolean;
  unidadeAtiva?: string;
  nivelAtivo?: string;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
}

interface BlitzQuestion {
  word: string;
  correct: string;
  options: string[];
}

export default function MioloBlitzChallenge({
  initialExerciseData,
  onSelectCorrect,
  onSelectWrong,
  triggerGlow,
  unidadeAtiva,
  nivelAtivo,
  onValidateResult
}: MioloBlitzChallengeProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
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

  // Sync Adaptativo Determinístico - Desafio Blitz
  useEffect(() => {
    if (initialExerciseData) {
      console.log("⚡ [MioloBlitzChallenge] Hydrating adaptative exercise:", initialExerciseData);
      const ex = initialExerciseData;
      const targetId = ex.id || "";

      const word = ex.prompt || ex.reading_text || ex.activity_name || "Desafio Blitz";

      let rawOptions = ex.alternative_options || ex.options || [];
      if (typeof rawOptions === 'string') {
        try { rawOptions = JSON.parse(rawOptions); } catch (e) { rawOptions = []; }
      }
      if (!Array.isArray(rawOptions)) rawOptions = [];

      let cleanOpts = rawOptions.map((item: any) =>
        typeof item === 'object' && item !== null ? (item.text || item.option || item.label || JSON.stringify(item)) : String(item)
      );

      const correct = String(ex.correct_answer || "").trim();
      if (correct && !cleanOpts.some((o: string) => o.trim().toLowerCase() === correct.toLowerCase())) {
        cleanOpts.push(correct);
      }
      cleanOpts = cleanOpts.sort(() => 0.5 - Math.random());

      const formattedQuestion: BlitzQuestion = {
        word,
        correct,
        options: cleanOpts
      };

      setExerciseId(targetId);
      setQuestions([formattedQuestion]);
      setCurrentIndex(0);
      setTimeLeft(30);
      setGameOver(false);
      setTotalXp(0);
      setFeedback(null);
      setClickedOption(null);
    }
  }, [initialExerciseData]);


  


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
      if (initialExerciseData && (initialExerciseData.id || initialExerciseData.prompt || initialExerciseData.reading_text)) {
        console.log("🔒 [MioloBlitzChallenge] MODO ADAPTATIVO ATIVO. Bloqueando busca generica da unidade. ExID:", initialExerciseData.id);
        return;
      }
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

        // Garante filtro dinâmico de ordenação para entregar conteúdos do A1 ao C1 em sequência
        query = query.order("created_at", { ascending: true });

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
      if (onSelectCorrect) onSelectCorrect();
    } else {
      if (onSelectWrong) onSelectWrong();
    }

    // Dispara a telemetria em background para persistir o erro instantaneamente se errar
    try {
      registrarFeedbackEErro({
        userId: authUser?.id,
        enunciado: `Desafio Blitz - Palavra Alvo: ${currentQuestion.word}`,
        respostaCorreta: currentQuestion.correct,
        respostaAluno: opcao,
        idiomaNativoAluno: "Español"
      });
    } catch (e) {
      console.error(e);
    }
    
    setClickedOption(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setGameOver(true);
    }
  };

  if (gameOver) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center animate-fade-in p-2 select-none'>
        <div className='w-full max-w-xl bg-[#070d19]/90 border border-[#FF8A2B]/30 rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-[0_0_35px_rgba(255,138,43,0.15)] gap-4'>
          <Award className='w-14 h-14 text-[#FF8A2B] animate-pulse drop-shadow-[0_0_12px_rgba(255,138,43,0.4)]' />
          
          <div className='flex flex-col gap-1'>
            <h3 className='text-[clamp(20px,2.2vw,26px)] font-black text-slate-100 tracking-wider uppercase'>
              Desafio Concluído
            </h3>
            <p className='text-[clamp(13px,1.4vw,15px)] text-slate-400 font-medium'>
              Performance calculada com sucesso
            </p>
          </div>

          <div className='text-[clamp(26px,3vw,36px)] font-black text-[#FF8A2B] bg-[#FF8A2B]/10 px-8 py-3.5 rounded-xl border border-[#FF8A2B]/30 shadow-[0_0_20px_rgba(255,138,43,0.2)] tracking-wide'>
            +{totalXp} PTS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-stretch justify-between w-full h-full font-sans animate-fade-in flex-1 min-h-0 gap-4 p-1 select-none'>
      
      {/* Barra Superior - Timer & Nível */}
      <div className='flex items-center justify-between bg-[#070d19]/80 border border-slate-800/80 px-4 py-3 rounded-xl shadow-sm shrink-0'>
        <div className='flex items-center gap-2'>
          <Zap className='w-4 h-4 text-[#FF8A2B]' />
          <span className='text-[11px] md:text-xs font-bold text-slate-400 tracking-widest uppercase'>DESAFIO BLITZ</span>
        </div>
        <div className='text-xs md:text-sm font-black tracking-widest text-[#FF8A2B] font-mono bg-[#FF8A2B]/10 px-3 py-1 rounded-lg border border-[#FF8A2B]/20 shadow-[0_0_10px_rgba(255,138,43,0.1)]'>
          00:{timeLeft < 10 ? '0' + timeLeft : timeLeft}
        </div>
      </div>
      
      {/* Card Central - Alvo */}
      <div className='flex-1 flex flex-col items-center justify-center bg-[#070d19]/80 border border-slate-800/80 rounded-2xl p-6 relative shadow-inner overflow-hidden min-h-[130px]'>
        <span className='absolute top-3 left-4 text-[10px] font-bold text-cyan-400/70 tracking-widest uppercase'>OPÇÃO ALVO</span>
        <h2 className='text-xl md:text-3xl font-extrabold text-slate-100 tracking-wide uppercase select-none text-center px-4'>
          {currentQuestion.word}
        </h2>
        
        {feedback && (
          <div key={feedback.id} className={'absolute bottom-3 text-[11px] font-black tracking-widest animate-bounce ' + feedback.color}>
            {feedback.text}
          </div>
        )}
      </div>
      
      {/* Grade 2x2 de Opções */}
      <div className='grid grid-cols-2 gap-3 w-full shrink-0'>
        {currentQuestion.options.map((opcao, idx) => {
          const isThisClicked = clickedOption === opcao;
          let btnStyle = 'bg-[#13233f] hover:bg-[#1a2f55] border-slate-700/60 text-slate-200 hover:border-cyan-500/50 shadow-sm active:scale-95';
          
          if (isThisClicked) {
            btnStyle = opcao === currentQuestion.correct
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[0.98]'
              : 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] scale-[0.98]';
          }
          
          return (
            <button
              key={idx}
              disabled={clickedOption !== null || gameOver}
              onClick={() => handleOptionClick(opcao)}
              className={'w-full py-3.5 px-4 rounded-xl font-semibold text-[clamp(14px,1.6vw,17px)] border text-center transition-all duration-150 cursor-pointer whitespace-nowrap ' + btnStyle}
            >
              {opcao}
            </button>
          );
        })}
      </div>
    </div>
  );
}
