"use client";
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from "react";
import { Volume2, CheckCircle, XCircle, RefreshCw, HelpCircle } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface MioloSpellingBeeProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  onSelectionChange?: (hasItems: boolean) => void;
}

const traducoes: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Escucha y soletrea a continuación:",
    validar: "Validar",
    correto: "¡Correcto!",
    errado: "Inténtalo de nuevo.",
    refazer: "Reintentar"
  },
  en: {
    instrucao: "Listen and spell below:",
    validar: "Validate",
    correto: "Correct!",
    errado: "Try again.",
    refazer: "Try Again"
  },
  pt: {
    instrucao: "Escute e soletre abaixo:",
    validar: "Validar",
    correto: "Correto!",
    errado: "Tente de novo.",
    refazer: "Tentar De Novo"
  }
};

export default function MioloSpellingBee({ 
  onSelectCorrect, 
  onSelectWrong, 
  unidadeAtiva, 
  status: propStatus = 'IDLE', 
  onValidateResult, 
  onSelectionChange 
}: MioloSpellingBeeProps) {
  const [targetWord, setTargetWord] = useState("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [userInput, setUserInput] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [status, setStatus] = useState<"IDLE" | "CORRECT" | "WRONG">("IDLE");
  const [carregando, setCarregando] = useState(true);
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [analisando, setAnalisando] = useState(false);
  const [feedbackIA, setFeedbackIA] = useState("");

  const USER_ID_ALVO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
  const accentRow = ["Á", "É", "Í", "Ó", "Ú", "Â", "Ê", "Ô", "Ã", "Õ", "Ç"];

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", "⌫"]
  ];

  const obterLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoes[obterLangKey()] || traducoes["es"];

  const salvarNovaPalavraNoCache = async (palavra: string, nivel: string) => {
    try {
      const nomeUnidade = unidadeAtiva || "1.1";
      await supabase
        .from('exercises')
        .insert({
          unit: nomeUnidade,
          activity_type: 11,
          level: nivel,
          correct_answer: palavra,
          reading_text: palavra
        });
    } catch (e) {
      console.warn("Erro ao registrar cache de spelling:", e);
    }
  };

  const gerarPalavraIA = async (nivel: string) => {
    try {
      const prompt = `Gere uma única palavra curta em português com acentuação gráfica opcional para um jogo de soletrar. Nível: ${nivel}. Retorne estritamente apenas a palavra limpa em maiúsculas sem pontos. Deve ter entre 4 e 7 letras no máximo.`;
      
      const { data: envDados, error: envError } = await supabase.from('exercises').select('id').limit(1);
      const key_gemini = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key_gemini}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      
      if (res.ok) {
        const data = await res.json();
        const palavra = data?.candidates?.[0]?.content?.parts?.[0]?.text?.toUpperCase().trim() || "";
        if (palavra.length >= 3 && palavra.length <= 8 && !/[^A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(palavra)) {
          salvarNovaPalavraNoCache(palavra, nivel);
          return palavra;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "CAFÉ";
  };

  useEffect(() => {
    async function inicializarSpelling() {
      try {
        setCarregando(true);
        
        const { data: userDados } = await supabase
          .from('users')
          .select('native_language')
          .eq('id', USER_ID_ALVO);
        
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }

        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined") {
          nomeUnidade = "1.1";
        }
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);
        
        let query = supabase.from("exercises").select("*").eq("activity_type", 11);
        if (isUUID) {
          query = query.eq("unit_id", nomeUnidade);
        } else {
          query = query.eq("unit", nomeUnidade);
        }
        
        const { data: dados, error } = await query.limit(1);
        console.log("🔍 [PROVA REAL] Dados brutos retornados do Supabase:", { dados, error });
        
        let palavraAlvo = "";
        if (dados && dados.length > 0) {
          palavraAlvo = String(dados[0].correct_answer || dados[0].reading_text || "").toUpperCase().trim();
          setFeedbackCorretoBanco(dados[0].correct_feedback || "");
          setFeedbackIncorretoBanco(dados[0].incorrect_feedback || "");
          setIncentivoCorretoBanco(dados[0].correct_incentive || "");
          setIncentivoIncorretoBanco(dados[0].incorrect_incentive || "");
        }

        if (!palavraAlvo || palavraAlvo.trim().length < 2) {
          console.warn("⚠️ [CONCURSO DE EMERGÊNCIA] Palavra do Spelling Bee ausente. Acionando motor central...");
          const palavraRecuperada = await resilienciaTextoCompleto("", nomeUnidade + " - Palavra Curta Única");
          palavraAlvo = palavraRecuperada.toUpperCase().replace(/[^A-ZÁÉÍÓÚÂÊÔÃÕÇ]/g, "").trim().slice(0, 8);
          if (!palavraAlvo) palavraAlvo = "VISÃO";
        }

        setTargetWord(palavraAlvo);
        setUserInput(new Array(palavraAlvo.length).fill(""));
        setCurrentIndex(0);
        setStatus("IDLE");
        
        if (onSelectionChange) onSelectionChange(true);
      } catch (err) {
        setTargetWord("VISÃO");
        setUserInput(new Array(5).fill(""));
      } finally {
        setCarregando(false);
      }
    }
    inicializarSpelling();
  }, [unidadeAtiva]);

  const playWordAudio = () => {
    if (targetWord && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(targetWord.toLowerCase());
      utterance.lang = "pt-BR";
      utterance.rate = 1.08;
      utterance.pitch = 1.02;

      const vozes = window.speechSynthesis.getVoices();
      const vozFeminina = 
        vozes.find(v => v.lang.includes("pt-BR") && v.name.includes("Google português do Brasil")) ||
        vozes.find(v => v.lang.includes("pt-BR") && v.name.includes("Luciana")) ||
        vozes.find(v => v.lang.includes("pt-BR") && v.name.includes("Francisca")) ||
        vozes.find(v => v.lang.includes("pt-BR"));

      if (vozFeminina) utterance.voice = vozFeminina;
      window.speechSynthesis.speak(utterance);
    }
  };

  const dispararSomClique = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {
      console.warn("Erro ao reproduzir clique sintetico:", e);
    }
  };

  const handleKeyPress = (letter: string) => {
    dispararSomClique();
    if (status === "CORRECT") return;

    if (letter === "⌫") {
      if (currentIndex === 0 && userInput[0] === "") return;
      const prevIndex = Math.max(0, userInput[currentIndex] === "" ? currentIndex - 1 : currentIndex);
      const nextInput = [...userInput];
      nextInput[prevIndex] = "";
      setUserInput(nextInput);
      setCurrentIndex(prevIndex);
      setStatus("IDLE");
      return;
    }

    if (currentIndex >= targetWord.length) return;

    const nextInput = [...userInput];
    nextInput[currentIndex] = letter;
    setUserInput(nextInput);
    setCurrentIndex(Math.min(targetWord.length - 1, currentIndex + 1));
    setStatus("IDLE");
  };

  const validarSoletradoFinal = async () => {
    if (analisando) return;
    
    setAnalisando(true);
    setFeedbackIA("");

    const palavraMontada = userInput.join("").toUpperCase().trim();
    const acertou = palavraMontada === targetWord;

    setTimeout(async () => {
      setAnalisando(false);
      setStatus(acertou ? "CORRECT" : "WRONG");

      const mensagemFeedback = acertou 
        ? (feedbackCorretoBanco || "¡Excelente deletreo! Has organizado todas las letras en el orden ortográfico correcto de manera perfecta.") 
        : (feedbackIncorretoBanco || "El orden de las letras tiene un error ortográfico. Revisa la estructura y secuencia de la palabra.");

      setFeedbackIA(mensagemFeedback);

      if (onValidateResult) {
        onValidateResult(acertou, acertou ? incentivoCorretoBanco : incentivoIncorretoBanco, acertou ? 100 : 20, unidadeAtiva);
      }

      if (acertou) {
        if (onSelectCorrect) onSelectCorrect();
      } else {
        if (onSelectWrong) onSelectWrong();
      }

      try {
        await registrarFeedbackEErro({
          userId: USER_ID_ALVO,
          enunciado: `Ejercicio de Soletração Ortográfica (Spelling Bee) - Unidad ${unidadeAtiva || "1.1"}`,
          respostaCorreta: targetWord,
          respostaAluno: palavraMontada,
          idiomaNativoAluno: idiomaNativoAluno
        });
      } catch (err) {
        console.warn("Telemetria falhou de forma silenciosa.");
      }
    }, 1200);
  };

  useEffect(() => {
    const escutarSubmitGlobal = () => {
      validarSoletradoFinal();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [userInput, status, targetWord]);

  if (carregando) {
    return (
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[1.1vw] tracking-widest">
        CONECTANDO...
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-start items-stretch text-left font-sans min-h-0 flex-1 gap-4 overflow-hidden p-1">
      
      {/* Faixa de orientações unificada com (?) azul */}
      <div className="w-full bg-[#0a1424] border border-white/[0.05] rounded-xl py-3 px-4 flex items-center gap-2.5 shrink-0">
        <HelpCircle size={18} className="text-[#00e1ff] shrink-0" />
        <span className="text-[11px] md:text-[12px] font-bold text-slate-200 tracking-wider uppercase">
          {t.instrucao}
        </span>
      </div>

      {/* Seção Centralizada: Alto-falante e Letras */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-3 bg-[#050b14]/40 border border-white/[0.04] rounded-xl px-3 min-h-0">
        
        {/* Botão do Alto-falante centralizado */}
        <button 
          onClick={playWordAudio} 
          className="p-4 bg-[#0e1e31] border border-cyan-500/30 text-cyan-400 rounded-2xl hover:bg-[#12273f] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shrink-0"
          title="Escutar"
        >
          <Volume2 size={24} />
        </button>

        {/* Caixas de Texto da Palavra */}
        <div className="flex justify-center flex-wrap gap-1.5 w-full max-w-full justify-items-center mt-2">
          {userInput.map((char, idx) => {
            const isCurrent = idx === currentIndex && status !== "CORRECT" && status !== "WRONG";
            return (
              <div
                key={idx}
                className={`w-[clamp(24px,5.8vw,34px)] h-[clamp(32px,8vw,40px)] rounded-lg border flex items-center justify-center font-sans font-black text-[13px] md:text-[1.1vw] transition-all shrink-0 ${
                  status === "CORRECT" ? "border-emerald-500 text-emerald-400 bg-emerald-950/10" :
                  status === "WRONG" ? "border-rose-500 text-rose-400 bg-rose-950/10 animate-shake" :
                  isCurrent ? "border-cyan-400 text-cyan-400 bg-cyan-950/30" : "border-slate-800 text-slate-300 bg-[#070d19]"
                }`}
              >
                {char}
              </div>
            );
          })}
        </div>
      </div>

      {status === "IDLE" && !analisando && (
        <div className="flex flex-col gap-1 w-full items-center bg-[#020B12]/80 p-1.5 rounded-xl border border-white/[0.02] shrink-0">
          <div className="flex gap-0.5 justify-center w-full mb-0.5 border-b border-white/[0.03] pb-1 overflow-x-auto select-none no-scrollbar">
            {accentRow.map((letter) => (
              <button
                key={letter}
                onClick={() => handleKeyPress(letter)}
                className="w-[8.5%] min-w-[20px] h-[clamp(24px,6.5vw,30px)] bg-cyan-950/20 active:bg-cyan-900 text-cyan-300 border border-cyan-900/30 rounded font-sans text-[12px] md:text-[1vw] font-bold cursor-pointer transition-all disabled:opacity-5 select-none"
              >
                {letter}
              </button>
            ))}
          </div>

          {keyboardRows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-0.5 justify-center w-full">
              {row.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleKeyPress(letter)}
                  className={`h-[clamp(26px,7.5vw,32px)] bg-[#1C3B50]/30 active:bg-[#1C3B50] text-slate-200 border border-slate-800/60 rounded font-sans text-[13px] md:text-[1.1vw] font-black cursor-pointer transition-all disabled:opacity-5 select-none flex items-center justify-center ${
                    letter === "⌫" ? "w-[14%] bg-rose-950/20 border-rose-900/40 text-rose-400 text-[13px]" : "w-[9%]"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {analisando && (
        <div className="w-full mt-auto flex flex-col gap-3 animate-pulse">
          <div className="w-full p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 text-[15px] md:text-[1.25vw] leading-[1.6] font-semibold flex items-center justify-center gap-3 min-h-[80px]">
            <RefreshCw size={18} className="animate-spin text-cyan-400" />
            <span className="uppercase tracking-widest">ANALISANDO...</span>
          </div>
        </div>
      )}

      {!analisando && status !== "IDLE" && feedbackIA && (
        <div className="w-full mt-auto flex flex-col gap-3 animate-fade-in">
          <div className={`w-full p-6 rounded-2xl text-[15px] md:text-[1.25vw] border leading-[1.6] font-semibold shadow-lg animate-fade-in ${
            status === "CORRECT" 
              ? "bg-emerald-950/15 border-emerald-500/20 text-emerald-300" 
              : "bg-rose-950/15 border-rose-500/20 text-rose-300"
          }`}>
            {feedbackIA}
          </div>
        </div>
      )}

    </div>
  );
}
