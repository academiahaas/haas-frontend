'use client';
import { getExerciseByActivityType } from "@/services/centralService";
import { feedbackTraducoes, obterLangKeyCompartilhado } from "./feedbackTraducoes";
import { useAuth } from "@/contexts/AuthContext";
import { resilienciaLacunas, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle, XCircle, Sparkles, Send, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DitadoLacunasProps {
  initialExerciseData?: any;
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
  nivelAtivo?: string;
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
  initialExerciseData, 
  onSelectionChange, 
  onValidateResult, 
  status: propStatus = 'IDLE', 
  unidadeAtiva 
}: DitadoLacunasProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
  const [inputValue, setInputValue] = useState("");
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [localStatus = 'IDLE', setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const inputRef = useRef<HTMLInputElement>(null);



  const [fraseEstruturada, setFraseEstruturada] = useState<string>("");
  const [textoParaFalar, setTextoParaFalar] = useState("");
  const [targetWord, setTargetWord] = useState("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Sync Adaptativo Determinístico - Ditado / Palavra Oculta
  useEffect(() => {
    if (initialExerciseData) {
      console.log("⚡ [DitadoLacunas] Hydrating adaptative exercise:", initialExerciseData);
      const ex = initialExerciseData;
      const targetId = ex.id || "";

      let text = ex.prompt || ex.reading_text || ex.text || "";
      text = text.replace(/\[lacuna\]/gi, "___");
      const targetWordVal = String(ex.correct_answer || ex.target_word || "").trim();

      setExerciseId(targetId);
      setTargetWord(targetWordVal);
      setFraseEstruturada(text);
      setTextoParaFalar(text || targetWordVal);
      setInputValue("");
      setInputValues({});
      setLocalStatus('IDLE');
      setFeedbackCorretoBanco(ex.explanation || ex.feedback_correct || "");
      setFeedbackIncorretoBanco(ex.feedback_incorrect || "");
      setCarregando(false);
    }
  }, [initialExerciseData]);


  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
  // USER_ID_ALVO dinamico via useAuth

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
      if (initialExerciseData && (initialExerciseData.id || initialExerciseData.prompt || initialExerciseData.reading_text)) {
        console.log("🔒 [DitadoLacunas] MODO ADAPTATIVO ATIVO. Bloqueando busca generica por unidade. ExID:", initialExerciseData.id);
        setCarregando(false);
        return;
      }
      if (!unidadeAtiva) {
        console.log("🔍 [DitadoLacunas.tsx] Aguardando UUID/UnidadeAtiva da Central...");
        return;
      }
      try {
        setCarregando(true);
          

          
           
        
        try {
          if (typeof USER_ID_ALVO !== "undefined" && USER_ID_ALVO && String(USER_ID_ALVO).trim() !== "") {
            const { data: userDados } = await supabase
              .from("users")
              .select("native_language")
              .eq("id", USER_ID_ALVO);
            if (userDados && userDados.length > 0) {
              setIdiomaNativoAluno(userDados[0].native_language || "Español");
            }
          }
        } catch (e) { console.error(e); }

        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined" || nomeUnidade.includes("Labirinto") || nomeUnidade.includes("Primeiro")) {
          nomeUnidade = "1.1";
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);

        const response = await getExerciseByActivityType(nomeUnidade, 4);
        const exe = (response && response.data && response.data.length > 0) ? response.data[0] : null;
        
        // Ativação da camada de contingência em caso de dados corrompidos ou vazios
        let textoFinal = "";
        let respostaFinal = "";
        let audioFinal = "";

        if (exe) {
          setFeedbackCorretoBanco(exe.correct_feedback || "");
          setFeedbackIncorretoBanco(exe.incorrect_feedback || "");
          if (exe?.id) setExerciseId(String(exe.id));
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
      if (onValidateResult) {
        const respostasEsperadas = targetWord.split(/[,\s]+/).filter(Boolean);
        const respostasEnviadas = inputValue.trim().split(/[,\s]+/).filter(Boolean);
        let acertos = 0;
        respostasEsperadas.forEach((resp, idx) => {
          if (respostasEnviadas[idx] && respostasEnviadas[idx].toLowerCase() === resp.toLowerCase()) {
            acertos++;
          }
        });
        const nota = respostasEsperadas.length > 0 ? Number(((acertos / respostasEsperadas.length) * 10).toFixed(1)) : (resultado.acertou ? 10 : 0);
        const aprovado = nota >= 6;
        const textoMentora1 = aprovado ? (incentivoCorretoBanco || feedbackTraducoes.ditadoLacunas.incentivoCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (incentivoIncorretoBanco || feedbackTraducoes.ditadoLacunas.incentivoIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno)));
        onValidateResult(aprovado, textoMentora1, nota, exerciseId || unidadeAtiva);
      }
    } catch (e) {
      const acertou = inputValue.trim().toLowerCase() === targetWord.toLowerCase();
      setLocalStatus(acertou ? "CORRECT" : "WRONG");
      setFeedbackIA(acertou ? (feedbackCorretoBanco || feedbackTraducoes.ditadoLacunas.feedbackCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (feedbackIncorretoBanco || feedbackTraducoes.ditadoLacunas.feedbackIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno), targetWord)));
      if (onValidateResult) {
        const respostasEsperadas = targetWord.split(/[,\s]+/).filter(Boolean);
        const respostasEnviadas = inputValue.trim().split(/[,\s]+/).filter(Boolean);
        let acertos = 0;
        respostasEsperadas.forEach((resp, idx) => {
          if (respostasEnviadas[idx] && respostasEnviadas[idx].toLowerCase() === resp.toLowerCase()) {
            acertos++;
          }
        });
        const nota = respostasEsperadas.length > 0 ? Number(((acertos / respostasEsperadas.length) * 10).toFixed(1)) : (acertou ? 10 : 0);
        const aprovado = nota >= 6;
        const textoMentora2 = aprovado ? (incentivoCorretoBanco || feedbackTraducoes.ditadoLacunas.incentivoCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (incentivoIncorretoBanco || feedbackTraducoes.ditadoLacunas.incentivoIncorretoQuase(obterLangKeyCompartilhado(idiomaNativoAluno)));
        onValidateResult(aprovado, textoMentora2, nota, exerciseId || unidadeAtiva);
      }
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
    <div className="w-full h-full flex flex-col font-sans flex-1 min-h-0 gap-5 p-2 overflow-hidden select-none">
      
      {/* BARRA SUPERIOR DE INSTRUÇÃO E ÁUDIO */}
      <div className="flex items-center justify-between shrink-0 px-1 gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
          <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest">
            {t.instrucao}
          </span>
        </div>
        <button 
          type="button"
          onClick={playAudio} 
          className="p-2.5 bg-[#0E1726] hover:bg-[#162238] border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm active:scale-95"
          title="Ouvir áudio"
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* CARD PRINCIPAL COM A FRASE E LACUNA INLINE */}
      <div className={`bg-[#080C16]/80 border border-slate-700/50 rounded-xl p-6 text-center text-[clamp(16px,2vw,22px)] font-semibold text-slate-100 leading-relaxed flex flex-wrap items-center justify-center gap-x-2 gap-y-2 flex-1 min-h-[140px] w-full overflow-y-auto shadow-inner ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {partesDaFrase.map((parte, index) => (
          <React.Fragment key={index}>
            <span className="text-slate-100">{parte}</span>
            {index < partesDaFrase.length - 1 && (
              <input
                type="text"
                value={inputValues[index] || ""}
                disabled={localStatus !== "IDLE" || analisando}
                onChange={(e) => handleInputChange(e.target.value, index)}
                onKeyDown={(e) => e.key === "Enter" && executarValidacaoInterna()}
                placeholder="???"
                className={`bg-[#080C16] border-2 rounded-lg px-3 py-1 text-center font-bold text-cyan-400 placeholder-slate-600 tracking-wide text-[clamp(15px,1.8vw,19px)] w-32 sm:w-40 transition-all focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 shadow-inner ${
                  localStatus === "CORRECT" ? "border-emerald-500 text-emerald-400" : localStatus === "WRONG" ? "border-rose-500 text-rose-400" : "border-slate-700"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* CONTAINER DE VALIDAÇÃO E FEEDBACK DA MENTORA */}
      {exibirContainerInferior && (
        <div className="w-full flex flex-col justify-center my-auto animate-fade-in gap-4">
          {analisando && (
            <div className="w-full flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 animate-pulse min-h-[120px] shadow-[0_0_25px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-2 font-black text-[12px] font-mono uppercase tracking-widest mb-2">
                <Sparkles size={14} className="animate-spin" />
                <span>Mentora Haas</span>
              </div>
              <p className="text-[15px] text-slate-200 font-medium italic">"{t.validando}"</p>
            </div>
          )}

          {!analisando && localStatus === 'CORRECT' && feedbackIA && (
            <div className="w-full flex flex-col items-center justify-center text-center bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl animate-fade-in shadow-[0_0_35px_rgba(16,185,129,0.15)] gap-3">
              <div className="flex items-center gap-2 text-emerald-400 text-[12px] font-black font-mono tracking-widest uppercase">
                <CheckCircle size={14} /> <span>{feedbackTraducoes.titulos.ditadoCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))}</span>
              </div>
              <p className="text-[16px] text-slate-100 font-bold">
                "{feedbackIA}"
              </p>
            </div>
          )}

          {!analisando && localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full flex flex-col items-center justify-center text-center bg-rose-950/40 border border-rose-500/30 p-6 rounded-2xl animate-fade-in shadow-[0_0_35px_rgba(244,63,94,0.15)] gap-3">
              <div className="flex items-center gap-2 text-rose-400 text-[12px] font-black font-mono tracking-widest uppercase">
                <XCircle size={14} /> <span>{feedbackTraducoes.titulos.ditadoIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno))}</span>
              </div>
              <p className="text-[15px] text-slate-200 font-medium italic">
                "{feedbackIA}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
