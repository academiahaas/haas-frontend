"use client";
import { getExerciseByActivityType } from "@/services/centralService";
import { useAuth } from "@/contexts/AuthContext";
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from "react";
import { Volume2, CheckCircle, XCircle, RefreshCw, HelpCircle , Sparkles} from 'lucide-react';;
import { supabase } from '@/lib/supabase';

interface MioloSpellingBeeProps {
  initialExerciseData?: any;
  exerciseData?: any;
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  nivelAtivo?: string;
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
  exerciseData, initialExerciseData, 
  onSelectCorrect, 
  onSelectWrong, 
  unidadeAtiva,
  nivelAtivo,
status: propStatus = 'IDLE', 
  onValidateResult, 
  onSelectionChange 
}: MioloSpellingBeeProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
  const [targetWord, setTargetWord] = useState("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [userInput, setUserInput] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [status, setStatus] = useState<"IDLE" | "CORRECT" | "WRONG">("IDLE");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (exerciseData) {
      console.log("📥 [MIOLO SPELLING] Dados recebidos do banco:", exerciseData);
      const palavra = exerciseData.correct_answer || exerciseData.reading_text || exerciseData.palavra || "";
      if (palavra) setTargetWord(String(palavra).trim().toUpperCase());

      if (exerciseData.correct_feedback) setFeedbackCorretoBanco(exerciseData.correct_feedback);
      if (exerciseData.incorrect_feedback) setFeedbackIncorretoBanco(exerciseData.incorrect_feedback);
      if (exerciseData.correct_incentive) setIncentivoCorretoBanco(exerciseData.correct_incentive);
      if (exerciseData.incorrect_incentive) setIncentivoIncorretoBanco(exerciseData.incorrect_incentive);

      setCarregando(false);
    }
  }, [exerciseData]);

  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [analisando, setAnalisando] = useState(false);
  const [feedbackIA, setFeedbackIA] = useState("");
  const [exerciseId, setExerciseId] = useState("");

  // USER_ID_ALVO dinamico via useAuth
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
      // Checagem de USER_ID_ALVO ajustada para nao abortar o carregamento dos dados
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
      
      // Checagem de USER_ID_ALVO ajustada para nao abortar o carregamento dos dados
      const { data: envDados, error: envError } = await supabase.from('exercises').select('id').limit(1);
      const key_gemini = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
      
      const res = await Promise.resolve(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{\"status\": \"ok\", \"feedback\": \"Resposta registrada!\"}" }] } }] })))
      
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
      if (!unidadeAtiva) {
        console.log("🔍 [MioloSpellingBee.tsx] Aguardando UUID/UnidadeAtiva da Central...");
        return;
      }
      try {
        setCarregando(true);
          

          
          
        
        // Checagem de USER_ID_ALVO ajustada para nao abortar o carregamento dos dados
        let userDados = null;
        if (USER_ID_ALVO && USER_ID_ALVO !== "undefined" && String(USER_ID_ALVO).trim() !== "") {
          const res = await supabase.from("users").select("native_language").eq("id", USER_ID_ALVO);
          userDados = res.data;
        }
        
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }

        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined") {
          nomeUnidade = "1.1";
        }
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);
        
        
          // --- BYPASS: USA DADOS DA ARENA SE EXISTIREM ---
          const payload = initialExerciseData || exerciseData;
          if (payload && (payload.id || payload.word || payload.correct_answer || payload.reading_text)) {
            console.log("🔒 [SPELLING BEE] Usando dados da Arena:", payload.id);
            const exeDados = [payload];
            const item = exeDados[0];
            const palavra = String(item.word || item.correct_answer || item.reading_text || "").toUpperCase().trim();
            if (typeof setTargetWord === 'function') setTargetWord(palavra);
            if (typeof setFeedbackCorretoBanco === 'function') setFeedbackCorretoBanco(item.correct_feedback || "");
            if (typeof setFeedbackIncorretoBanco === 'function') setFeedbackIncorretoBanco(item.incorrect_feedback || "");
            if (typeof setIncentivoCorretoBanco === 'function') setIncentivoCorretoBanco(item.correct_incentive || "");
            if (typeof setIncentivoIncorretoBanco === 'function') setIncentivoIncorretoBanco(item.incorrect_incentive || "");
            if (typeof setExerciseId === 'function' && item.id) setExerciseId(String(item.id));
            if (typeof setUserInput === 'function') setUserInput(new Array(palavra.length).fill(""));
            if (typeof setCurrentIndex === 'function') setCurrentIndex(0);
            if (typeof setCarregando === 'function') setCarregando(false);
            return;
          }
          // ------------------------------------------------
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
          if (dados[0].id) setExerciseId(String(dados[0].id));
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
  }, [unidadeAtiva,
  nivelAtivo,
USER_ID_ALVO]);

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
    const targetUpper = (targetWord || "").toUpperCase().trim();
      let letrasCorretas = 0;
      const totalLetras = targetUpper.length || 1;
      for (let i = 0; i < totalLetras; i++) {
        if (palavraMontada[i] && palavraMontada[i] === targetUpper[i]) {
          letrasCorretas++;
        }
      }
      const nota = Number(((letrasCorretas / totalLetras) * 10).toFixed(1));
      const acertou = nota >= 6;

    setTimeout(async () => {
      setAnalisando(false);
      setStatus(acertou ? "CORRECT" : "WRONG");

      const mensagemFeedback = acertou 
        ? (feedbackCorretoBanco || "¡Excelente deletreo! Has organizado todas las letras en el orden ortográfico correcto de manera perfecta.") 
        : (feedbackIncorretoBanco || "El orden de las letras tiene un error ortográfico. Revisa la estructura y secuencia de la palabra.");

      setFeedbackIA(mensagemFeedback);

      if (onValidateResult) {
        onValidateResult(acertou, acertou ? (incentivoCorretoBanco || mensagemFeedback) : (incentivoIncorretoBanco || mensagemFeedback), nota, exerciseId || unidadeAtiva);
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
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[14px] tracking-widest uppercase">
        {t?.aguardando || "CONECTANDO..."}
      </div>
    );
  }

  const exibirContainerInferior = status !== "IDLE" || analisando;

  return (
    <div className="w-full h-full flex flex-col font-sans select-none gap-4 p-2 overflow-hidden flex-1 min-h-0">
      
      {/* BARRA SUPERIOR DE INSTRUÇÃO MINIMALISTA */}
      <div className="flex items-center gap-2 shrink-0 px-1">
        <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
        <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest">
          {t.instrucao}
        </span>
      </div>

      {/* CARD CENTRAL DE ÁUDIO E SLOTS DAS LETRAS */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-5 bg-[#0a1120]/80 border border-slate-700/50 rounded-xl min-h-[140px] shadow-sm">
        
        {/* Botão de Áudio Centralizado com Glow */}
        <button 
          type="button"
          onClick={playWordAudio} 
          className="w-16 h-16 bg-cyan-500/10 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 rounded-full transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center active:scale-95 group shrink-0"
          title="Escutar palavra"
        >
          <Volume2 size={26} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Slots de Letras da Palavra */}
        <div className="flex justify-center flex-wrap gap-2 w-full max-w-full">
          {userInput.map((char, idx) => {
            const isCurrent = idx === currentIndex && status !== "CORRECT" && status !== "WRONG";
            
            let slotStyle = "border-slate-700/60 text-slate-300 bg-[#070d19]";
            if (status === "CORRECT") {
              slotStyle = "border-emerald-500 text-emerald-400 bg-emerald-950/30 font-black shadow-sm";
            } else if (status === "WRONG") {
              slotStyle = "border-rose-500 text-rose-400 bg-rose-950/30 font-black animate-shake shadow-sm";
            } else if (isCurrent) {
              slotStyle = "border-cyan-400 text-cyan-300 bg-cyan-950/40 ring-1 ring-cyan-400/40 font-black shadow-sm";
            }

            return (
              <div
                key={idx}
                className={`w-[clamp(28px,5vw,38px)] h-[clamp(36px,7vw,46px)] rounded-lg border flex items-center justify-center font-sans font-bold text-[clamp(15px,1.8vw,20px)] transition-all shrink-0 ${slotStyle}`}
              >
                {char}
              </div>
            );
          })}
        </div>
      </div>

      {/* TECLADO VIRTUAL DARK PREMIUM */}
      {status === "IDLE" && !analisando && (
        <div className="flex flex-col gap-1.5 w-full items-center bg-[#070d19]/80 p-3 rounded-xl border border-slate-800/80 shrink-0">
          
          {/* Linha de Acentos */}
          <div className="flex gap-1 justify-center w-full mb-1 border-b border-slate-800/60 pb-2 overflow-x-auto select-none no-scrollbar">
            {accentRow.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleKeyPress(letter)}
                className="w-[8.5%] min-w-[22px] h-[34px] bg-cyan-950/30 hover:bg-cyan-900/50 active:bg-cyan-800 text-cyan-300 border border-cyan-800/40 rounded-md font-sans text-[13px] font-bold cursor-pointer transition-all select-none"
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Linhas Principais do Teclado */}
          {keyboardRows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1 justify-center w-full">
              {row.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleKeyPress(letter)}
                  className={`h-[36px] bg-[#13233f] hover:bg-[#1a2f55] active:bg-cyan-900/40 text-slate-200 border border-slate-700/50 rounded-md font-sans text-[14px] font-bold cursor-pointer transition-all select-none flex items-center justify-center ${
                    letter === "⌫" ? "w-[14%] bg-rose-950/30 hover:bg-rose-900/40 border-rose-800/50 text-rose-400" : "w-[9%]"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* CONTAINER DE VALIDAÇÃO E FEEDBACK DA MENTORA (EM CAMADAS) */}
      {exibirContainerInferior && (
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in p-2">
          {analisando && (
            <div className="w-full max-w-2xl bg-[#070d19]/90 border border-cyan-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.12)] gap-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[13px] uppercase tracking-widest">
                <Sparkles size={16} className="animate-spin" />
                <span>Mentora Haas</span>
              </div>
              <p className="text-[16px] text-slate-300 font-medium italic">Analisando Soletração...</p>
            </div>
          )}

          {status === "CORRECT" && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#070d19]/90 border border-emerald-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(16,185,129,0.12)] gap-3">
              <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-bold uppercase tracking-widest">
                <CheckCircle size={16} /> <span>Soletração Perfeita!</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}

          {status === "WRONG" && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#070d19]/90 border border-rose-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(244,63,94,0.12)] gap-3">
              <div className="flex items-center gap-2 text-rose-400 text-[13px] font-bold uppercase tracking-widest">
                <XCircle size={16} /> <span>Análise de Soletração</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
