"use client";
import { resilienciaTextoCompleto, resilienciaOpcoes, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Turtle, Zap, Rocket, CheckCircle, XCircle, RefreshCw, Sparkles, Send } from "lucide-react";

interface OptionItem {
  id: number;
  text: string;
}

interface MioloProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Selecciona la opción correcta escuchando el audio:",
    validando: "Analizando...",
    validar: "Validar Respuesta",
    refazer: "Reiniciar",
    slow: "Lento",
    mid: "Medio",
    pro: "Nativo"
  },
  en: {
    instrucao: "Select the correct option by listening to the audio:",
    validando: "Analyzing...",
    validar: "Validate",
    refazer: "Reset",
    slow: "Slow",
    mid: "Medium",
    pro: "Native"
  },
  pt: {
    instrucao: "Selecione a opção correta escutando o áudio:",
    validando: "Analisando...",
    validar: "Validar Resposta",
    refazer: "Tentar de Novo",
    slow: "Lento",
    mid: "Médio",
    pro: "Nativo"
  }
};

export default function MioloVelocidadeProgressiva({
  onSelectCorrect,
  onSelectWrong,
  unidadeAtiva,
  onValidateResult
}: MioloProps) {
  const [readingText, setReadingText] = useState("Carregando desafio...");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [correctId, setCorrectId] = useState<number>(1);
  
  const [activeSpeed, setActiveSpeed] = useState<'slow' | 'normal' | 'native'>('normal');
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
  const USER_ID_ALVO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

  const obterLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoesAbas[obterLangKey()] || traducoesAbas["es"];

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        const userRes = await fetch(`${SUPABASE_URL}/users?id=eq.${USER_ID_ALVO}`, {
          headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` }
        });
        const userDados = await userRes.json();
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }

        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined" || nomeUnidade.includes("Labirinto")) {
          nomeUnidade = "1.1";
        }
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);
        
        let query = supabase.from("exercises").select("*").eq("activity_type", 13);
        if (isUUID) {
          query = query.eq("unit_id", nomeUnidade);
        } else {
          query = query.eq("unit", nomeUnidade);
        }
        
        const { data: dados, error } = await query.limit(1);
        console.log("🔍 [PROVA REAL MARCHAS] Dados retornados do Supabase:", { dados, error });
        
        let exe = null;
        if (dados && dados.length > 0) {
          exe = dados[0];
        }

        if (!exe) {
          exe = {
            reading_text: "Ontem o dia foi muito agitado. Eu ______ ao banco, fiz um depósito e depois tive que ir ao cartório.",
            correct_answer: "fui",
            alternative_options: ["fui", "fiz", "tive", "vim"]
          };
        }

        const textoLimpo = exe.reading_text || exe.texto || "";
        const respostaLimpa = exe.correct_answer || exe.correta || "";

        setReadingText(textoLimpo);
        setCorrectAnswer(respostaLimpa);
        setFeedbackCorretoBanco(exe.correct_feedback || "");
        setFeedbackIncorretoBanco(exe.incorrect_feedback || "");
          if (exe?.id) setExerciseId(String(exe.id));
        
        let rawOptions: string[] = [];
        const altOpts = exe.alternative_options || exe.alternativas;
        if (altOpts) {
          if (typeof altOpts === 'string') {
            try {
              let limpo = altOpts.trim();
              if (limpo.startsWith('"') && limpo.endsWith('"')) limpo = limpo.substring(1, limpo.length - 1);
              rawOptions = JSON.parse(limpo);
            } catch (e) {
              rawOptions = altOpts.replace(/[\[\]"'\\]/g, '').split(',').map((s: string) => s.trim());
            }
          } else if (Array.isArray(altOpts)) {
            rawOptions = altOpts;
          }
        }
        
        if (rawOptions.length === 0 && respostaLimpa) {
          rawOptions = [respostaLimpa, "tive", "fiz", "vim"];
        }

        const mapped = rawOptions.map((text, idx) => ({
          id: idx + 1,
          text: text
        }));
        setOptions(mapped);

        const idxCorreto = rawOptions.findIndex(opt => opt.trim().toLowerCase() === respostaLimpa.trim().toLowerCase());
        setCorrectId(idxCorreto !== -1 ? idxCorreto + 1 : 1);
        setLocalStatus('IDLE');
        setSelectedId(null);
        setFeedbackIA("");
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, [unidadeAtiva]);

  const playAudio = (speed: 'slow' | 'normal' | 'native', rate: number) => {
    setActiveSpeed(speed);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && readingText) {
      window.speechSynthesis.cancel();
      
      let cleanText = readingText;
      if (correctAnswer.includes('/')) {
        const parts = correctAnswer.split('/');
        parts.forEach(part => { cleanText = cleanText.replace(/______/, part.trim()); });
      } else {
        cleanText = cleanText.replace(/___+/g, correctAnswer || "lacuna");
      }

      const utterance = new SpeechSynthesisUtterance(cleanText.toLowerCase());
      utterance.lang = 'pt-BR';
      utterance.rate = rate; 
      utterance.pitch = 1.02; 

      const vozes = window.speechSynthesis.getVoices();
      const vozFeminina = 
        vozes.find(v => v.lang.includes("pt-BR") && (v.name.includes("Luciana") || v.name.includes("Francisca"))) ||
        vozes.find(v => v.lang.includes("pt-BR") && v.name.includes("Google português do Brasil")) ||
        vozes.find(v => v.lang.includes("pt-BR"));

      if (vozFeminina) utterance.voice = vozFeminina;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelecionarItem = (id: number) => {
    if (localStatus === 'CORRECT' || analisando) return;
    setSelectedId(id);
    setLocalStatus('IDLE');
  };

  const executarValidacaoInterna = async () => {
    if (selectedId === null || analisando) return;

    setAnalisando(true);
    setFeedbackIA("");

    const opcaoTexto = options.find(o => o.id === selectedId)?.text || "";
    const fraseMontadaComOpcao = readingText.replace(/___+/g, ` ${opcaoTexto.toUpperCase()} `);

    try {
      const resultado = await registrarFeedbackEErro({
        userId: USER_ID_ALVO,
        enunciado: `Exercício de Marchas de Áudio e Escuta Progressiva. Texto com lacuna: "${readingText}"`,
        respostaCorreta: correctAnswer,
        respostaAluno: opcaoTexto,
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(resultado.acertou ? (feedbackCorretoBanco || resultado.feedback) : (feedbackIncorretoBanco || resultado.feedback));
      
      if (onValidateResult) {
        onValidateResult(resultado.acertou, resultado.acertou ? (feedbackCorretoBanco || resultado.feedback) : (feedbackIncorretoBanco || resultado.feedback), resultado.acertou ? 10 : 0, exerciseId || unidadeAtiva);
      }
      if (resultado.acertou && onSelectCorrect) onSelectCorrect();
      if (!resultado.acertou && onSelectWrong) onSelectWrong();
    } catch (e) {
      const acertou = selectedId === correctId;
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? (feedbackCorretoBanco || "Excelente!") : (feedbackIncorretoBanco || "Incorreto."));
      if (onValidateResult) {
        onValidateResult(acertou, acertou ? (feedbackCorretoBanco || "Excelente!") : (feedbackIncorretoBanco || "Incorreto."), acertou ? 10 : 0, exerciseId || unidadeAtiva);
      }
      if (acertou && onSelectCorrect) onSelectCorrect();
      if (!acertou && onSelectWrong) onSelectWrong();
    } finally {
      setAnalisando(false);
    }
  };

  const renderDynamicText = () => {
    const parts = readingText.split(/___+/g);
    if (parts.length < 2) return <span>{readingText}</span>;

    let wordToShow = "______";
    let isSelectedStyle = false;

    if ((localStatus as any) === 'CORRECT') {
      wordToShow = correctAnswer.toUpperCase();
      isSelectedStyle = true;
    } else if (selectedId !== null) {
      wordToShow = (options.find(o => o.id === selectedId)?.text || "").toUpperCase();
      isSelectedStyle = true;
    }

    return (
      <span>
        {parts[0]}
        <span className={isSelectedStyle ? "text-cyan-400 font-black px-1 transition-all duration-150" : "text-slate-400 font-bold"}>
          {wordToShow}
        </span>
        {parts[1]}
      </span>
    );
  };

  const resetarExercicio = () => {
    setSelectedId(null);
    setLocalStatus('IDLE');
    setFeedbackIA("");
  };

    useEffect(() => {
    const escutarSubmitGlobal = () => {
      executarValidacaoInterna();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [selectedId, options, localStatus, analisando, readingText, correctAnswer]);

  if (carregando) {
    return (
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[1.1vw] tracking-widest uppercase">
        CONECTANDO...
      </div>
    );
  }

  const exibirContainerInferior = localStatus !== 'IDLE' || analisando;

  return (
    <div className="w-full h-full flex flex-col justify-between text-left font-sans overflow-visible select-none gap-2 p-1">
      
      {/* 1. INSTRUÇÃO COMPACTA */}
      <span className="text-[clamp(11px,1.3vw,13px)] font-bold text-cyan-400 uppercase tracking-wider block shrink-0">
        {t.instrucao}
      </span>

      {/* 2. MARCHAS DE ÁUDIO */}
      <div className="grid grid-cols-3 gap-1.5 w-full shrink-0">
        <button
          type="button"
          onClick={() => playAudio('slow', 0.75)}
          className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 font-black text-[clamp(13px,1.5vw,16px)] uppercase cursor-pointer min-h-[46px] h-auto transition-all ${
            activeSpeed === 'slow' ? 'bg-cyan-950/40 border-cyan-400 text-cyan-400' : 'bg-[#020B12] border-slate-800 text-slate-400'
          }`}
        >
          <Turtle size={13} /> <span>{t.slow}</span>
        </button>
        <button
          type="button"
          onClick={() => playAudio('normal', 1.08)}
          className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 font-black text-[clamp(13px,1.5vw,16px)] uppercase cursor-pointer min-h-[46px] h-auto transition-all ${
            activeSpeed === 'normal' ? 'bg-cyan-950/40 border-cyan-400 text-cyan-400' : 'bg-[#020B12] border-slate-800 text-slate-400'
          }`}
        >
          <Zap size={13} /> <span>{t.mid}</span>
        </button>
        <button
          type="button"
          onClick={() => playAudio('native', 1.30)}
          className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 font-black text-[clamp(13px,1.5vw,16px)] uppercase cursor-pointer min-h-[46px] h-auto transition-all ${
            activeSpeed === 'native' ? 'bg-cyan-950/40 border-cyan-400 text-cyan-400' : 'bg-[#020B12] border-slate-800 text-slate-400'
          }`}
        >
          <Rocket size={13} /> <span>{t.pro}</span>
        </button>
      </div>

      {/* 3. BOX DO PARÁGRAFO ADAPTATIVO */}
      <div className="w-full bg-[#070d19]/80 border border-white/[0.03] rounded-xl p-2.5 flex items-center justify-center shrink-0">
        <p className="text-[clamp(16px,2.2vw,22px)] font-black leading-relaxed text-center text-slate-100 w-full break-words p-1">
          {renderDynamicText()}
        </p>
      </div>

      {/* 4. BANCO DE OPÇÕES - CRESCE DINAMICAMENTE SE NÃO HOUVER VALIDAÇÃO */}
      <div className={`grid grid-cols-2 gap-2 w-full h-auto overflow-visible my-0.5 ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          let optStyle = "border-slate-800/80 bg-[#04111C]/30 text-slate-300";
          
          if (isSelected) {
            if ((localStatus as any) === 'CORRECT') optStyle = "border-emerald-500 bg-emerald-950/20 text-emerald-400";
            else if ((localStatus as any) === 'WRONG') optStyle = "border-rose-500 bg-rose-950/20 text-rose-400";
            else optStyle = "border-cyan-400 bg-cyan-950/30 text-cyan-400 font-black";
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelecionarItem(opt.id)}
              disabled={localStatus === 'CORRECT' || analisando}
              className={`w-full text-center py-3 px-4 rounded-xl border text-[clamp(14px,1.8vw,18px)] font-bold transition-all cursor-pointer flex items-center justify-center min-h-[48px] md:min-h-[56px] h-auto whitespace-nowrap shadow-sm ${optStyle}`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* 5. CONTAINER DE ANÁLISE ULTRA COMPACTO (SEM ESPAÇO FANTASMA EM IDLE) */}
      {analisando && (
        <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 animate-pulse min-h-[100px] md:min-h-[120px]">
          <div className="flex items-center gap-1.5 font-black text-[clamp(10px,1.2vw,12px)] uppercase tracking-wider mb-0.5">
            <Sparkles size={12} className="animate-spin" />
            <span>Mentora Haas</span>
          </div>
          <p className="text-[clamp(13px,1.6vw,16px)] text-slate-300 font-medium italic break-words w-full">"{t.validando}"</p>
        </div>
      )}

      {localStatus !== 'IDLE' && feedbackIA && (
        <div className={`w-full flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl border animate-fade-in min-h-[100px] md:min-h-[120px] ${
          localStatus === 'CORRECT' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-rose-950/20 border-rose-500/20 text-rose-400'
        }`}>
          <div className="flex items-center gap-1.5 font-black text-[clamp(10px,1.2vw,12px)] uppercase tracking-wider mb-0.5">
            {localStatus === 'CORRECT' ? <CheckCircle size={12} /> : <XCircle size={12} />}
            <span>{localStatus === 'CORRECT' ? "Estrutura Correta!" : "Análise de Coesão"}</span>
          </div>
          <p className="text-[clamp(11px,1.4vw,13px)] text-slate-300 font-medium italic break-words w-full">"{feedbackIA}"</p>
        </div>
      )}

    </div>
  );
}
