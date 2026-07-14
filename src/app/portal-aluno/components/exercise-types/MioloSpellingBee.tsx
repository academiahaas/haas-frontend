"use client";
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from "react";
import { Volume2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface MioloSpellingBeeProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string) => void;
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

export default function MioloSpellingBee({ onSelectCorrect, onSelectWrong, unidadeAtiva, status: propStatus = 'IDLE', onValidateResult, onSelectionChange }: MioloSpellingBeeProps) {
  const [targetWord, setTargetWord] = useState("");
  const [userInput, setUserInput] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [status, setStatus] = useState<"IDLE" | "CORRECT" | "WRONG">("IDLE");
  const [carregando, setCarregando] = useState(true);
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [analisando, setAnalisando] = useState(false);
  const [feedbackIA, setFeedbackIA] = useState("");

  const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
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
      const nomeUnidade = unidadeAtiva || "O Primeiro Impacto e as Vogais Fracas";
      await fetch(`${SUPABASE_URL}/exercises`, {
        method: "POST",
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          unit: nomeUnidade,
          activity_type: 11,
          level: nivel,
          correct_answer: palavra,
          reading_text: palavra
        })
      });
    } catch (e) {
      console.warn("Erro ao registrar cache de spelling:", e);
    }
  };

  const gerarPalavraIA = async (nivel: string) => {
    try {
      const prompt = `Gere uma única palavra curta em português com acentuação gráfica opcional para um jogo de soletrar. Nível: ${nivel}. Retorne estritamente apenas a palavra limpa em maiúsculas sem pontos. Deve ter entre 4 e 7 letras no máximo.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
    } catch (e) {}
    return "CAFÉ";
  };

  useEffect(() => {
    async function inicializarSpelling() {
      try {
        setCarregando(true);
        const userRes = await fetch(`${SUPABASE_URL}/users?id=eq.${USER_ID_ALVO}`, {
          headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` }
        });
        const userDados = await userRes.json();
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }

        const nomeUnidade = unidadeAtiva || "O Primeiro Impacto e as Vogais Fracas";
        const url = `${SUPABASE_URL}/exercises?unit=eq.${encodeURIComponent(nomeUnidade)}&activity_type=eq.11&limit=1`;
        const res = await fetch(url, { headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` } });
        
        let palavraAlvo = "";
        if (res.ok) {
          const dados = await res.json();
          if (dados && dados.length > 0) {
            palavraAlvo = String(dados[0].correct_answer || dados[0].reading_text).toUpperCase().trim();
          }
        }

        // Validação de Emergência: Registro nulo, vazio ou menor que 2 letras
        if (!palavraAlvo || palavraAlvo.trim().length < 2) {
          console.warn("⚠️ [CONCURSO DE EMERGÊNCIA] Palavra do Spelling Bee ausente. Acionando motor central...");
          const palavraRecuperada = await resilienciaTextoCompleto("", nomeUnidade + " - Palavra Curta Única");
          // Limpa a palavra para garantir que venha apenas letras válidas em maiúsculo
          palavraAlvo = palavraRecuperada.toUpperCase().replace(/[^A-ZÁÉÍÓÚÂÊÔÃÕÇ]/g, "").trim().slice(0, 8);
          if (!palavraAlvo) palavraAlvo = "VISÃO";
        }

        setTargetWord(palavraAlvo);
        setUserInput(new Array(palavraAlvo.length).fill(""));
        setCurrentIndex(0);
        setStatus("IDLE");
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

    // Aguarda um pequeno delay de 1.2s para simular a análise visual antes de revelar o resultado
    setTimeout(async () => {
      setAnalisando(false);
      setStatus(acertou ? "CORRECT" : "WRONG");

      const mensagemFeedback = acertou 
        ? "Excelente soletração! Você organizou todas as letras na ordem ortográfica exata."
        : "A ordem das letras possui uma quebra ortográfica. Revise a posição dos caracteres e tente novamente.";

      setFeedbackIA(mensagemFeedback);

      // Avisa o pai para tocar o som premium sem interferir no balão da Mentora
      if (onValidateResult) {
        onValidateResult(acertou, "MANTER_MENTORA_INTACTA");
      }

      if (acertou) {
        if (onSelectCorrect) onSelectCorrect();
      } else {
        if (onSelectWrong) onSelectWrong();
      }

      // Telemetria silenciosa em segundo plano
      if (!acertou) {
        try {
          await registrarFeedbackEErro({
            userId: USER_ID_ALVO,
            enunciado: "Exercício de Soletração Ortográfica (Spelling Bee).",
            respostaCorreta: targetWord,
            respostaAluno: palavraMontada,
            idiomaNativoAluno: idiomaNativoAluno
          });
        } catch (err) {
          console.warn("Telemetria falhou de forma silenciosa.");
        }
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
    <div className="w-full h-full flex flex-col justify-between items-stretch text-left font-sans min-h-0 flex-1 gap-2 overflow-hidden p-1">
      
      {/* INSTRUÇÃO COMPACTADA */}
      <div className="flex items-center gap-2 shrink-0 bg-[#0c192e] p-2 rounded-xl border border-white/[0.04]">
        <button 
          onClick={playWordAudio} 
          className="p-1.5 bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 rounded-lg hover:text-cyan-300 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Volume2 size={14} />
        </button>
        <span className="text-[13px] md:text-[1.1vw] font-bold text-slate-300 tracking-wider uppercase">
          {t.instrucao}
        </span>
      </div>

      {/* ÁREA CENTRAL LIMPA APENAS COM OS TILES */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 h-auto w-full py-2 bg-[#050b14]/40 border border-white/[0.04] rounded-xl px-3">
        <div className="flex justify-center flex-wrap gap-1.5 w-full max-w-full justify-items-center">
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

      {/* TECLADO SEGURO (APARECE APENAS SE FOR IDLE E NÃO ESTIVER ANALISANDO) */}
      {status === "IDLE" && !analisando && (
        <div className="flex flex-col gap-1 w-full items-center bg-[#020B12]/80 p-1.5 rounded-xl border border-white/[0.02] shrink-0">
          
          {/* LINHA DE ACENTOS OTIMIZADA */}
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

          {/* ALFABETO COMPACTADO PARA RESPEITAR O CONTAINER PAI */}
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

      {/* TELA DE ANALISANDO ATIVA */}
      {analisando && (
        <div className="w-full shrink-0 flex items-center justify-center mt-auto h-[42px] bg-cyan-950/20 border border-cyan-500/30 rounded-xl gap-2 text-cyan-400 font-bold text-[12px] md:text-[1vw] uppercase tracking-widest animate-pulse">
          <RefreshCw size={14} className="animate-spin" /> ANALISANDO...
        </div>
      )}

      {/* FEEDBACK EXCLUSIVO EM ESPANHOL (APENAS O BALÃO EXPLICATIVO, SEM OS CARDS DE STATUS) */}
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