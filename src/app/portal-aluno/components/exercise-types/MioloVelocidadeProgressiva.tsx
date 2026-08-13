"use client";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackTraducoes, obterLangKeyCompartilhado } from "./feedbackTraducoes";
import { resilienciaTextoCompleto, resilienciaOpcoes, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Turtle, Zap, Rocket, CheckCircle, XCircle, RefreshCw, Sparkles, Send , HelpCircle } from "lucide-react";

interface OptionItem {
  id: number;
  text: string;
}

interface MioloProps {
  initialExerciseData?: any;
  exerciseData?: any;
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  nivelAtivo?: string;
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

export default function MioloVelocidadeProgressiva({ initialExerciseData, exerciseData, 
  onSelectCorrect,
  onSelectWrong,
  unidadeAtiva,
  nivelAtivo,
onValidateResult
 }: MioloProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
  const [readingText, setReadingText] = useState("Carregando desafio...");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
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
  const GEMINI_API_KEY = "CHAVE_REVOGADA_NAO_USAR";
  // USER_ID_ALVO dinamico via useAuth

  const obterLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoesAbas[obterLangKey()] || traducoesAbas["es"];

  useEffect(() => {
    async function carregarDados() {
      if (!unidadeAtiva) {
        console.log("🔍 [MioloVelocidadeProgressiva.tsx] Aguardando UUID/UnidadeAtiva da Central...");
        return;
      }
      try {
        setCarregando(true);
          

          
          
        let userDados = [];
        const uidReforco = USER_ID_ALVO || (typeof window !== "undefined" ? localStorage.getItem("haas_user_id") : null);
        if (uidReforco && uidReforco !== "undefined" && String(uidReforco).trim() !== "") {
          const userRes = await fetch(`${SUPABASE_URL}/users?id=eq.${uidReforco}`, {
            headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` }
          });
          if (userRes.ok) {
            userDados = await userRes.json();
          }
        }
        
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }

        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined" || nomeUnidade.includes("Labirinto")) {
          nomeUnidade = "1.1";
        }
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);
        
        // --- BYPASS MESTRE: USA DADOS DA ARENA ---
          const payload = initialExerciseData || exerciseData;
          let dados = null;
          let error = null;

          if (payload && (payload.id || payload.reading_text || payload.correct_answer)) {
            console.log("🔒 [MARCHAS DE ÁUDIO 13] Usando dados da Arena:", payload.id);
            dados = [payload];
          } else {
            let query = supabase.from("exercises").select("*").eq("activity_type", 13);
            if (isUUID) {
              query = query.eq("unit_id", nomeUnidade);
            } else {
              query = query.eq("unit", nomeUnidade);
            }
            const resSupabase = await query.limit(1);
            dados = resSupabase.data;
            error = resSupabase.error;
          }
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
        audioTranscriptRef.current = exe.audio_transcript || "";
        audioUrlRef.current = exe.audio_url || "";
        setCorrectAnswer(respostaLimpa);
        setFeedbackCorretoBanco(exe.correct_feedback || "");
        setFeedbackIncorretoBanco(exe.incorrect_feedback || "");
        setIncentivoCorretoBanco(exe.correct_incentive || "");
        setIncentivoIncorretoBanco(exe.incorrect_incentive || "");
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
  }, [unidadeAtiva, nivelAtivo]);

  const audioTranscriptRef = useRef<string>("");
  const audioUrlRef = useRef<string>("");

  const playAudio = (speed: 'slow' | 'normal' | 'native', rate: number) => {
    setActiveSpeed(speed);
    if (audioUrlRef.current) {
      const audio = new Audio(audioUrlRef.current);
      audio.playbackRate = rate;
      audio.play();
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && readingText) {
      window.speechSynthesis.cancel();

      let cleanText = audioTranscriptRef.current || readingText;
      if (!audioTranscriptRef.current) {
        const textoAudio = (correctAnswer || "").split(/[,/]/);
        textoAudio.forEach(part => {
          cleanText = cleanText.replace(/___+/, part.trim());
        });
        cleanText = cleanText.replace(/___+/g, "lacuna");
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
      
      const textoMentora1 = resultado.acertou ? (incentivoCorretoBanco || feedbackTraducoes.velocidadeProgressiva.incentivoCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (incentivoIncorretoBanco || feedbackTraducoes.velocidadeProgressiva.incentivoIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno)));
      if (onValidateResult) {
        onValidateResult(resultado.acertou, textoMentora1, resultado.acertou ? 10 : 0, exerciseId || unidadeAtiva);
      }
      if (resultado.acertou && onSelectCorrect) onSelectCorrect();
      if (!resultado.acertou && onSelectWrong) onSelectWrong();
    } catch (e) {
      const acertou = selectedId === correctId;
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? (feedbackCorretoBanco || feedbackTraducoes.velocidadeProgressiva.feedbackCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (feedbackIncorretoBanco || feedbackTraducoes.velocidadeProgressiva.feedbackIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno))));
      const textoMentora2 = acertou ? (incentivoCorretoBanco || feedbackTraducoes.velocidadeProgressiva.incentivoCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (incentivoIncorretoBanco || feedbackTraducoes.velocidadeProgressiva.incentivoIncorretoQuase(obterLangKeyCompartilhado(idiomaNativoAluno)));
      if (onValidateResult) {
        onValidateResult(acertou, textoMentora2, acertou ? 10 : 0, exerciseId || unidadeAtiva);
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

    let selectedText = "";
    if ((localStatus as any) === 'CORRECT') {
      selectedText = correctAnswer;
    } else if (selectedId !== null) {
      selectedText = options.find(o => o.id === selectedId)?.text || "";
    }

    // Se o texto tiver vírgula ou barra, separa em lista para cada lacuna
    const palabras = selectedText ? selectedText.split(/[,/]/).map(p => p.trim().toUpperCase()) : [];

    return (
      <span>
        {parts.map((part, index) => {
          const valorLacuna = palabras[index] || (selectedText ? selectedText.toUpperCase() : "______");
          const temSelecao = Boolean(selectedText);

          return (
            <React.Fragment key={index}>
              {part}
              {index < parts.length - 1 && (
                <span className={temSelecao ? "text-cyan-400 font-black px-1 transition-all duration-150" : "text-slate-400 font-bold"}>
                  {valorLacuna}
                </span>
              )}
            </React.Fragment>
          );
        })}
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
    <div className="w-full h-full flex flex-col font-sans select-none gap-4 p-2 overflow-hidden flex-1 min-h-0">
      
      {/* 1. BARRA SUPERIOR DE INSTRUÇÃO MINIMALISTA */}
      <div className="flex items-center gap-2 shrink-0 px-1">
        <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
        <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest">
          {t.instrucao}
        </span>
      </div>

      {/* 2. CONTROLES DE MARCHA DE ÁUDIO (VELOCIDADES) */}
      <div className="grid grid-cols-3 gap-2 w-full shrink-0">
        <button
          type="button"
          onClick={() => playAudio('slow', 0.75)}
          className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-[13px] md:text-[14px] uppercase cursor-pointer min-h-[46px] transition-all shadow-sm ${
            activeSpeed === 'slow' 
              ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/30' 
              : 'bg-[#080C16]/60 hover:bg-[#0E1726] border-slate-700/50 text-slate-300'
          }`}
        >
          <Turtle size={16} className={activeSpeed === 'slow' ? 'text-cyan-400' : 'text-slate-400'} />
          <span>{t.slow}</span>
        </button>

        <button
          type="button"
          onClick={() => playAudio('normal', 1.08)}
          className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-[13px] md:text-[14px] uppercase cursor-pointer min-h-[46px] transition-all shadow-sm ${
            activeSpeed === 'normal' 
              ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/30' 
              : 'bg-[#080C16]/60 hover:bg-[#0E1726] border-slate-700/50 text-slate-300'
          }`}
        >
          <Zap size={16} className={activeSpeed === 'normal' ? 'text-cyan-400' : 'text-slate-400'} />
          <span>{t.mid}</span>
        </button>

        <button
          type="button"
          onClick={() => playAudio('native', 1.30)}
          className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-[13px] md:text-[14px] uppercase cursor-pointer min-h-[46px] transition-all shadow-sm ${
            activeSpeed === 'native' 
              ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/30' 
              : 'bg-[#080C16]/60 hover:bg-[#0E1726] border-slate-700/50 text-slate-300'
          }`}
        >
          <Rocket size={16} className={activeSpeed === 'native' ? 'text-cyan-400' : 'text-slate-400'} />
          <span>{t.pro}</span>
        </button>
      </div>

      {/* 3. CARD DO PARÁGRAFO/ENUNCIADO */}
      <div className="w-full bg-[#080C16]/80 border border-slate-700/50 rounded-xl p-5 flex items-center justify-center shrink-0 min-h-[75px] shadow-sm">
        <p className="text-[clamp(16px,2vw,20px)] font-bold leading-relaxed text-center text-slate-100 w-full break-words tracking-wide">
          {renderDynamicText()}
        </p>
      </div>

      {/* 4. BANCO DE OPÇÕES DE RESPOSTA */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 w-full flex-1 min-h-0 overflow-y-auto pr-1 ${exibirContainerInferior ? "hidden" : ""}`}>
        {options.map((opt, idx) => {
          const isSelected = selectedId === opt.id;
          const letterBadge = String.fromCharCode(65 + idx);
          
          let cardStyle = "border-slate-700/50 bg-[#080C16]/60 hover:bg-[#0E1726] hover:border-slate-500 text-slate-200";
          let badgeStyle = "bg-[#080C16] border-slate-800 text-slate-400 group-hover:border-cyan-900/50 group-hover:text-cyan-400";

          if (isSelected) {
            if ((localStatus as any) === 'CORRECT') {
              cardStyle = "border-emerald-500/80 bg-emerald-950/30 text-emerald-300 font-bold shadow-sm";
              badgeStyle = "bg-emerald-500 text-slate-950 font-black border-emerald-400";
            } else if ((localStatus as any) === 'WRONG') {
              cardStyle = "border-rose-500/80 bg-rose-950/30 text-rose-300 font-bold shadow-sm";
              badgeStyle = "bg-rose-500 text-slate-950 font-black border-rose-400";
            } else {
              cardStyle = "border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold ring-1 ring-cyan-400/30 shadow-sm";
              badgeStyle = "bg-cyan-400 text-slate-950 font-black border-cyan-300";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelecionarItem(opt.id)}
              disabled={localStatus === 'CORRECT' || analisando}
              className={`group w-full py-3 px-4 rounded-xl border text-[clamp(14px,1.6vw,17px)] font-medium transition-all cursor-pointer flex items-center gap-3.5 min-h-[56px] leading-normal break-words shadow-sm ${cardStyle}`}
            >
              <div className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-lg border text-[13px] tracking-wider transition-all select-none ${badgeStyle}`}>
                {letterBadge}
              </div>
              <span className="flex-1 text-left">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* 5. CONTAINER DE VALIDAÇÃO E FEEDBACK DA MENTORA (EM CAMADAS) */}
      {exibirContainerInferior && (
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in p-2">
          {analisando && (
            <div className="w-full max-w-2xl bg-[#080C16]/90 border border-cyan-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.12)] gap-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[13px] uppercase tracking-widest">
                <Sparkles size={16} className="animate-spin" />
                <span>Mentora Haas</span>
              </div>
              <p className="text-[16px] text-slate-300 font-medium italic">"{t.validando}"</p>
            </div>
          )}

          {localStatus === 'CORRECT' && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#080C16]/90 border border-emerald-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(16,185,129,0.12)] gap-3">
              <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-bold uppercase tracking-widest">
                <CheckCircle size={16} /> <span>{feedbackTraducoes.titulos.velocidadeCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))}</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#080C16]/90 border border-rose-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(244,63,94,0.12)] gap-3">
              <div className="flex items-center gap-2 text-rose-400 text-[13px] font-bold uppercase tracking-widest">
                <XCircle size={16} /> <span>{feedbackTraducoes.titulos.velocidadeIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno))}</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
