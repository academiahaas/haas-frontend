'use client';
import { resilienciaLacunas, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle, XCircle, Sparkles, Send, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DitadoLacunasProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Haz clic en el altavoz para escuchar y escribe la palabra ausente:",
    validando: "Analizando...",
    validar: "Validar Respuesta",
    aguardando: "Cargando desafío..."
  },
  en: {
    instrucao: "Click on the loudspeaker to listen and type the missing word:",
    validando: "Analyzing...",
    validar: "Validate Answer",
    aguardando: "Loading challenge..."
  },
  pt: {
    instrucao: "Clique no alto-falante para escutar e digite a palavra ausente:",
    validando: "Analisando...",
    validar: "Validar Resposta",
    aguardando: "Carregando desafio..."
  }
};

export default function DitadoLacunas({ 
  onSelectionChange, 
  onValidateResult, 
  status: propStatus = 'IDLE', 
  unidadeAtiva 
}: DitadoLacunasProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [localStatus = 'IDLE', setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const inputRef = useRef<HTMLInputElement>(null);



  const [fraseEstruturada, setFraseEstruturada] = useState<string>("");
  const [textoParaFalar, setTextoParaFalar] = useState("");
  const [targetWord, setTargetWord] = useState("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
  const USER_ID_ALVO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

  const obterLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoesAbas[obterLangKey()];

  useEffect(() => {
    if (propStatus === 'IDLE') {
      setInputValue('');
      setInputValues({});
      setLocalStatus('IDLE');
      setFeedbackIA('');
    } else {
      setLocalStatus(propStatus);
    }
  }, [propStatus]);

  useEffect(() => {
    async function carregarDitadoDoBanco() {
      try {
        setCarregando(true);
        
        try {
          const { data: userDados } = await supabase
            .from('users')
            .select('native_language')
            .eq('id', USER_ID_ALVO);
          if (userDados && userDados.length > 0) {
            setIdiomaNativoAluno(userDados[0].native_language || "Español");
          }
        } catch (e) { console.error(e); }

        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined" || nomeUnidade.includes("Labirinto") || nomeUnidade.includes("Primeiro")) {
          nomeUnidade = "1.1";
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);

        let query = supabase.from("exercises").select("*").eq("activity_type", 4);
        if (isUUID) {
          query = query.eq("unit_id", nomeUnidade);
        } else {
          query = query.eq("unit", nomeUnidade);
        }

        const { data: dados, error } = await query;
        if (error) throw error;
        
        // Ativação da camada de contingência em caso de dados corrompidos ou vazios
        let textoFinal = "";
        let respostaFinal = "";
        let audioFinal = "";

        if (dados && dados.length > 0) {
          const exe = dados[0];
          setFeedbackCorretoBanco(exe.correct_feedback || "");
          setFeedbackIncorretoBanco(exe.incorrect_feedback || "");
          setIncentivoCorretoBanco(exe.correct_incentive || "");
          setIncentivoIncorretoBanco(exe.incorrect_incentive || "");
          let rawText = exe.reading_text || "";
          // Substitui dinamicamente [lacuna], [lacuna ] ou variantes para ___
          textoFinal = rawText.replace(/\[lacuna\]/gi, "___");
          respostaFinal = exe.correct_answer || "";
          audioFinal = exe.audio_transcript || exe.correct_answer || "";
        }

        // Validação rigorosa: Se faltar texto, resposta ou os underlines obrigatórios da lacuna
        if (!textoFinal || !respostaFinal || !textoFinal.includes("___")) {
          console.warn("⚠️ [CONCURSO DE EMERGÊNCIA] Ditado de Lacunas corrompido. Acionando motor de resiliência por IA...");
          const contingencia = await resilienciaLacunas(textoFinal, respostaFinal, nomeUnidade);
          textoFinal = contingencia.texto;
          respostaFinal = contingencia.resposta;
          audioFinal = contingencia.texto.replace(/___+/g, contingencia.resposta);
        }

        setTargetWord(respostaFinal);
        setFraseEstruturada(textoFinal);
        setTextoParaFalar(audioFinal);
      } catch (err) {
        console.error("Erro no Ditado Prático:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDitadoDoBanco();
  }, [unidadeAtiva]);

  useEffect(() => {
    if (inputRef.current && fraseEstruturada) inputRef.current.focus();
  }, [fraseEstruturada]);

  const playAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && textoParaFalar) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textoParaFalar);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.08;    
      utterance.pitch = 1.02;   
      
      const vozes = window.speechSynthesis.getVoices();
      const vozIdeal = vozes.find(v => 
        v.name.includes("Google português do Brasil") || 
        v.name.includes("FranciscaOnline") || 
        v.name.includes("Luciana") ||
        (v.lang.includes("pt") && v.name.includes("Natural"))
      );
      
      if (vozIdeal) utterance.voice = vozIdeal;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleInputChange = (val: string, index: number = 0) => {
    const novosValores = { ...inputValues, [index]: val };
    setInputValues(novosValores);
    
    const textoCompleto = Object.values(novosValores).join(" ");
    setInputValue(textoCompleto);

    if (onSelectionChange) {
      const temPreenchido = Object.values(novosValores).some(v => v.trim().length > 0);
      onSelectionChange(temPreenchido);
    }
  };

  const executarValidacaoInterna = async () => {
    if (localStatus !== 'IDLE' || !inputValue.trim() || analisando) return;
    setAnalisando(true);
    setFeedbackIA("");

    try {
      const resultado = await registrarFeedbackEErro({
        userId: USER_ID_ALVO,
        enunciado: `Exercício de Ditado Prático (Lacunas). Contexto completo da frase: "${fraseEstruturada}". Áudio ditado: "${textoParaFalar}"`,
        respostaCorreta: targetWord,
        respostaAluno: inputValue.trim(),
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(resultado.acertou ? (feedbackCorretoBanco || resultado.feedback) : (feedbackIncorretoBanco || resultado.feedback));
      if (onValidateResult) onValidateResult(resultado.acertou, resultado.acertou ? incentivoCorretoBanco : incentivoIncorretoBanco);
    } catch (e) {
      const acertou = inputValue.trim().toLowerCase() === targetWord.toLowerCase();
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? (feedbackCorretoBanco || "Excelente!") : (feedbackIncorretoBanco || `Desvio ortográfico detectado. O esperado era: ${targetWord}`));
      if (onValidateResult) onValidateResult(acertou, acertou ? incentivoCorretoBanco : incentivoIncorretoBanco);
    } finally {
      setAnalisando(false);
    }
  };

    React.useEffect(() => {
    const escutarSubmitGlobal = () => {
      executarValidacaoInterna();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [inputValues, localStatus, analisando, targetWord]);

    useEffect(() => {
    const escutarSubmitGlobal = () => {
      executarValidacaoInterna();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [inputValues, localStatus, analisando, targetWord]);

  if (carregando) {
    return (
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-xs uppercase tracking-widest">
        {t?.aguardando || "CARREGANDO DESAFIO..."}
      </div>
    );
  }

  const partesDaFrase = fraseEstruturada.split(/___+/);
  const prefixo = partesDaFrase[0] || "";
  const sufixo = partesDaFrase[1] || "";
  const exibirContainerInferior = localStatus !== 'IDLE' || analisando || !!feedbackIA;

  return (
    <div className="w-full h-full flex flex-col justify-between items-stretch text-left font-sans flex-1 min-h-0 gap-3 p-1">
      
      <div className="flex items-center justify-between shrink-0 bg-[#070d19]/40 p-3 rounded-xl border border-white/[0.02] gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={15} className="text-cyan-400 shrink-0" />
          <span className="text-[clamp(11px,1.3vw,13px)] font-bold text-slate-300 uppercase tracking-wider leading-snug">
            {t.instrucao}
          </span>
        </div>
        <button 
          type="button"
          onClick={playAudio} 
          className="p-2 bg-[#0c192e] hover:bg-cyan-900/40 border border-cyan-500/20 text-cyan-400 rounded-xl transition-all cursor-pointer flex items-center justify-center h-8 w-8 shrink-0 shadow-sm"
        >
          <Volume2 size={14} />
        </button>
      </div>

      <div className={`bg-[#0c192e]/40 border border-white/[0.03] rounded-xl py-4 px-3 text-center text-[clamp(16px,2.2vw,22px)] font-black text-slate-200 leading-relaxed flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 flex-1 min-h-0 w-full overflow-y-auto shadow-inner ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {partesDaFrase.map((parte, index) => (
          <React.Fragment key={index}>
            <span className="font-sans font-medium text-[#F8FAFC]">{parte}</span>
            {index < partesDaFrase.length - 1 && (
              <input
                type="text"
                value={inputValues[index] || ""}
                disabled={localStatus !== "IDLE" || analisando}
                onChange={(e) => handleInputChange(e.target.value, index)}
                onKeyDown={(e) => e.key === "Enter" && executarValidacaoInterna()}
                placeholder="???"
                className={`bg-[#070d19] border-2 rounded-xl px-2 py-1 text-center font-black tracking-wide text-[clamp(14px,2vw,18px)] w-28 transition-all focus:outline-none focus:border-cyan-500/50 ${
                  localStatus === "CORRECT" ? "border-emerald-500 text-emerald-400" : localStatus === "WRONG" ? "border-rose-500 text-rose-400" : "border-white/[0.08] text-cyan-400"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {exibirContainerInferior && (
        <div className="w-full flex-1 flex flex-col justify-end mt-1 animate-fade-in">
          

          {analisando && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 animate-pulse min-h-[100px] md:min-h-[120px]">
              <div className="flex items-center gap-1.5 font-black text-[clamp(10px,1.2vw,12px)] uppercase tracking-wider mb-0.5">
                <Sparkles size={12} className="animate-spin" />
                <span>Mentora Haas</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-300 font-medium italic break-words w-full">"{t.validando}"</p>
            </div>
          )}

          {localStatus === 'CORRECT' && feedbackIA && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl animate-fade-in min-h-[100px] md:min-h-[120px] gap-1.5">
              <div className="flex items-center gap-1 text-emerald-400 text-[clamp(11px,1.3vw,14px)] font-black uppercase tracking-wider">
                <CheckCircle size={12} /> <span>Excelente!</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl animate-fade-in min-h-[100px] md:min-h-[120px] gap-1.5">
              <div className="flex items-center gap-1 text-rose-400 text-[clamp(11px,1.3vw,14px)] font-black uppercase tracking-wider">
                <XCircle size={12} /> <span>Análise de Escrita</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
