"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Check, AlertTriangle, X, Trophy, Zap, Target, ArrowRight } from 'lucide-react';

interface QuizData {
  id?: string;
  tema_tag: string;
  nivel: string;
  enunciado: string;
  opcoes: string[];
  opcao_correta: string;
  feedback_gps: string;
}

interface ArenaQuizMobileProps {
  quizzes: QuizData[];
  xpPorAcerto?: number;
  creditosIA?: number;
  streakInicial?: number;
  xpInicial?: number;
  unidadeAtual?: string;
  precisaoInicial?: number;
  onFinalizarMissao: (scoreFinal: number) => void;
  onClose: () => void;
}

export default function ArenaQuizMobile({
  quizzes,
  xpPorAcerto = 10,
  creditosIA = 0,
  streakInicial = 0,
  xpInicial = 0,
  unidadeAtual = "1/5",
  precisaoInicial = 77,
  onFinalizarMissao,
  onClose
}: ArenaQuizMobileProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpcao, setSelectedOpcao] = useState<string | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [isCorreto, setIsCorreto] = useState(false);
  
  const [streak, setStreak] = useState(streakInicial);
  const [xpAcumulado, setXpAcumulado] = useState(xpInicial);
  const [totalAcertos, setTotalAcertos] = useState(0);

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Limpa timers ao desmontar o componente para evitar vazamento de memória
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [currentIndex]);

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#040914] flex flex-col items-center justify-center p-6 text-center text-white z-[9999]">
        <AlertTriangle className="text-cyan-400 mb-4 animate-bounce" size={48} />
        <h3 className="text-lg font-black tracking-wide uppercase">Nenhum exercício na Arena</h3>
        <p className="text-slate-400 text-xs mt-2 max-w-xs">Aguardando a Mentora carregar as cascas...</p>
      </div>
    );
  }

  const currentQuiz = quizzes[currentIndex];

  const handleSelecionarOpcao = (opcao: string) => {
    if (respondido) return;
    setSelectedOpcao(opcao);
  };

  const handleSubmeter = () => {
    if (!selectedOpcao || respondido) return;

    const acertou = selectedOpcao === currentQuiz.opcao_correta;
    setIsCorreto(acertou);
    setRespondido(true);

    if (acertou) {
      setStreak(prev => prev + 1);
      setXpAcumulado(prev => prev + xpPorAcerto + (streak >= 2 ? 5 : 0));
      setTotalAcertos(prev => prev + 1);

      // 🏎️ ACERTOU: Avança voando em 1.5 segundos
      autoAdvanceTimerRef.current = setTimeout(() => {
        executarAvanco();
      }, 1500);

    } else {
      setStreak(0);

      // 🧠 ERROU: Dá 3.5 segundos para o aluno ler o feedback_gps antes do salto automático
      autoAdvanceTimerRef.current = setTimeout(() => {
        executarAvanco();
      }, 3500);
    }
  };

  const executarAvanco = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOpcao(null);
      setRespondido(false);
    } else {
      onFinalizarMissao(xpAcumulado);
    }
  };

  const handleAvancarManual = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    executarAvanco();
  };

  const precisao = currentIndex === 0 && !respondido
    ? 100 
    : Math.round((totalAcertos / (respondido ? currentIndex + 1 : currentIndex || 1)) * 100);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#040914] text-white flex flex-col p-4 font-sans select-none h-screen w-screen overflow-hidden">
      
      {/* PAINEL CONECTADO AOS 5 CARDS DO SUPABASE */}
      <div className="flex items-center justify-between gap-1.5 bg-[#081120] border border-white/[0.05] p-2.5 rounded-2xl mb-4 shadow-2xl overflow-x-auto no-scrollbar">
        {/* 1. Creditos IA */}
        <div className="flex items-center gap-1 bg-amber-500/10 border border-cyan-500/40/20 px-2 py-1 rounded-xl text-purple-300 font-mono font-extrabold text-xs shrink-0">
          <Zap size={12} className="fill-amber-400 text-purple-300" />
          <span>{creditosIA}</span>
        </div>

        {/* 2. Precisao */}
        <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-xl text-cyan-400 font-mono font-extrabold text-xs shrink-0">
          <Target size={12} />
          <span>{precisaoInicial}%</span>
        </div>

        {/* 3. Streak / Ofensiva */}
        <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded-xl text-purple-400 font-mono font-extrabold text-xs shrink-0">
          <Zap size={12} className="fill-purple-400 text-purple-400" />
          <span>x{streak}</span>
        </div>

        {/* 4. Score / XP */}
        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl text-emerald-400 font-mono font-extrabold text-xs shrink-0">
          <Trophy size={12} />
          <span>+{xpAcumulado}</span>
        </div>

        {/* 5. Progresso Unidades */}
        <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-xl text-purple-400 font-mono font-extrabold text-xs shrink-0">
          <span className="text-[10px]">⭐</span>
          <span>{unidadeAtual}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-5 px-1">
        <div>
          <span className="text-[9px] font-mono font-black text-cyan-400 tracking-widest block uppercase mb-0.5">
            MÓDULO {currentQuiz.nivel} • EXERCÍCIO {currentIndex + 1} DE {quizzes.length}
          </span>
          <h2 className="text-xs font-black text-slate-200 uppercase tracking-wide">
            Missão de {currentQuiz.tema_tag === 'vocabulary' ? 'Vocabulário Ativo' : 'Estrutura Gramatical'}
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-white/[0.03] hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-h-[35%] bg-[#081120]/50 border border-white/[0.02] p-5 rounded-3xl mb-5 shadow-inner overflow-y-auto">
        <p className="text-sm font-semibold text-slate-100 text-center leading-relaxed">
          {currentQuiz.enunciado}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[45%] pb-4 pr-1">
        {currentQuiz.opcoes.map((opcao, idx) => {
          const isSelected = selectedOpcao === opcao;
          let cardStyle = "border-white/[0.04] bg-[#081120] text-slate-300";
          
          if (isSelected && !respondido) {
            cardStyle = "border-cyan-500/50 bg-cyan-950/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]";
          } else if (respondido) {
            if (opcao === currentQuiz.opcao_correta) {
              cardStyle = "border-emerald-500/50 bg-emerald-950/30 text-emerald-400";
            } else if (isSelected && !isCorreto) {
              cardStyle = "border-red-500/50 bg-red-950/30 text-red-400";
            } else {
              cardStyle = "border-white/[0.02] bg-[#050b14] text-slate-600 opacity-40";
            }
          }

          return (
            <button
              key={idx}
              disabled={respondido}
              onClick={() => handleSelecionarOpcao(opcao)}
              className={`w-full border p-4 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] ${cardStyle}`}
            >
              <span className="text-[11px] font-bold tracking-wide uppercase flex-1">{opcao}</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                isSelected ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10'
              }`}>
                {respondido && opcao === currentQuiz.opcao_correta && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                {respondido && isSelected && !isCorreto && <div className="w-2 h-2 rounded-full bg-red-400" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-2">
        {respondido ? (
          <div className="animate-in slide-in-from-bottom-5 duration-300">
            <div className={`p-4 rounded-2xl border flex flex-col gap-2 mb-3 ${
              isCorreto ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400' : 'bg-red-950/30 border-red-500/20 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isCorreto ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  {isCorreto ? <Check size={14} /> : <AlertTriangle size={14} />}
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest font-mono">
                  {isCorreto ? 'Resposta Correta' : 'Foco no Erro'}
                </h4>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-medium pl-8">
                {currentQuiz.feedback_gps}
              </p>
            </div>

            <button 
              onClick={handleAvancarManual}
              className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              <span>{currentIndex === quizzes.length - 1 ? 'Finalizar Missão' : 'Próxima Casca'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <button 
            disabled={!selectedOpcao}
            onClick={handleSubmeter}
            className={`w-full font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all border-none ${
              selectedOpcao 
                ? 'bg-gradient-to-r from-cyan-400 to-amber-500 text-white active:scale-[0.99]' 
                : 'bg-white/[0.03] text-slate-500 cursor-not-allowed'
            }`}
          >
            Validar Resposta
          </button>
        )}
      </div>

    </div>
  );
}
