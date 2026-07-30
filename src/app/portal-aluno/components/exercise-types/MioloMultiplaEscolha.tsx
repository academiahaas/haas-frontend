'use client';
import { useAuth } from "@/contexts/AuthContext";
import { chamarGeminiInteligente } from './geminiService';
import { resilienciaTextoCompleto, resilienciaOpcoes, registrarFeedbackEErro } from '@/utils/motorResiliencia';

import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Sparkles, Send, RefreshCw, HelpCircle } from 'lucide-react';

interface MioloProps {
  exerciseData?: any;
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: "IDLE" | "CORRECT" | "WRONG";
  unidadeAtiva?: string;
  nivelAtivo?: string;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Selecciona la opción contextual más adecuada:",
    validando: "Analizando respuesta...",
    validar: "Validar Respuesta",
    refazer: "Intentar de nuevo",
    aguardando: "Cargando desafío..."
  },
  en: {
    instrucao: "Select the most appropriate contextual option:",
    validando: "Analyzing response...",
    validar: "Validate Answer",
    refazer: "Try Again",
    aguardando: "Loading challenge..."
  },
  pt: {
    instrucao: "Selecione a opção contextual mais adequada:",
    validando: "Analisando resposta...",
    validar: "Validar Resposta",
    refazer: "Tentar de Novo",
    aguardando: "Carregando desafio..."
  }
};

export default function MioloMultiplaEscolha({
  exerciseData,
 
  onSelectionChange,
  onValidateResult,
  status = "IDLE",
  unidadeAtiva
}: MioloProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctOption, setCorrectOption] = useState<string>("");
  const [pergunta, setPergunta] = useState<string>("Carregando enunciado...");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (exerciseData) {
      console.log("📥 [MIOLO ESCOLHA - TIPO 1] Objeto bruto recebido:", exerciseData);

      // Enunciado
      setPergunta(exerciseData.reading_text || exerciseData.enunciado || "Selecione a opção correta:");

      // Alternativas (Garante array de 4 opções sem truncamento)
      let rawOpts = exerciseData.alternative_options || exerciseData.options || [];
      let opts = [];
      if (Array.isArray(rawOpts)) {
        opts = rawOpts;
      } else if (typeof rawOpts === "string") {
        try { opts = JSON.parse(rawOpts); } catch(e) { opts = []; }
      }
      setOptions(opts);

      // Resposta Correta (Leitura direta da coluna correct_answer)
      const correctVal = exerciseData.correct_answer !== undefined ? exerciseData.correct_answer : (exerciseData.resposta_correta || "");
      setCorrectOption(String(correctVal).trim());

      // Feedbacks
      if (exerciseData.correct_feedback) setFeedbackCorretoBanco(exerciseData.correct_feedback);
      if (exerciseData.incorrect_feedback) setFeedbackIncorretoBanco(exerciseData.incorrect_feedback);

      if (exerciseData.id) setExerciseId(String(exerciseData.id));
      setCarregando(false);
    }
  }, [exerciseData]);


  
  
  
  
  
  





  
  useEffect(() => {
    // Componente passivo: quando status reseta para IDLE ou novos dados chegam, reseta selecao
    if (status === "IDLE" || exerciseData) {
      setSelecionado(null);
      setLocalStatus("IDLE");
      setFeedbackIA("");
      if (onSelectionChange) onSelectionChange(false);
    }
  }, [status, exerciseData]);;;

  const [isShortText, setIsShortText] = useState(true);

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
    const handleGlobalValidate = () => {
      executarValidacaoInterna();
    };
    window.addEventListener("haas:validate", handleGlobalValidate);
    return () => {
      window.removeEventListener("haas:validate", handleGlobalValidate);
    };
  }, [selecionado, correctOption, options]);

  const handleSelect = (opcao: string) => {
    if (localStatus === "CORRECT" || analisando) return; 
    setSelecionado(opcao);
    setLocalStatus('IDLE');
    if (onSelectionChange) onSelectionChange(true);
  };

  const executarValidacaoInterna = async () => {
    if (!selecionado || analisando) return;
    setAnalisando(true);
    setFeedbackIA("");

    try {
      const resultado = await registrarFeedbackEErro({
        userId: USER_ID_ALVO || "anonymous-user",
        enunciado: pergunta,
        respostaCorreta: correctOption,
        respostaAluno: selecionado,
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(resultado.acertou ? (feedbackCorretoBanco || resultado.feedback) : (feedbackIncorretoBanco || resultado.feedback));
      const textoMentora1 = resultado.acertou ? (incentivoCorretoBanco || "Excelente! Opção correta.") : (incentivoIncorretoBanco || "Atenção aos detalhes da pergunta.");
      if (onValidateResult) onValidateResult(resultado.acertou, textoMentora1, resultado.acertou ? 10 : 0, exerciseId || unidadeAtiva);
    } catch (e) {
      const acertou = selecionado === correctOption;
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? (feedbackCorretoBanco || "Excelente!") : (feedbackIncorretoBanco || "Incorreto."));
      const textoMentora2 = acertou ? (incentivoCorretoBanco || "Excelente! Opção correta.") : (incentivoIncorretoBanco || "Quase lá! Revise as opções com atenção.");
      if (onValidateResult) onValidateResult(acertou, textoMentora2, acertou ? 10 : 0, exerciseId || unidadeAtiva);
    } finally {
      setAnalisando(false);
    }
  };

  const resetarExercicio = () => {
    setSelecionado(null);
    setLocalStatus('IDLE');
    setFeedbackIA("");
  };

    
  
  



  if (carregando) {
    return (
      <div className="w-full text-center py-6 text-cyan-400 font-bold animate-pulse text-xs tracking-widest uppercase">
        {t?.aguardando || "CARREGANDO..."}
      </div>
    );
  }

  const exibirContainerInferior = localStatus !== 'IDLE' || analisando;

  return (
    <div className="w-full h-full flex flex-col justify-between text-left font-sans overflow-y-auto select-none gap-3 p-1">
      
      <div className="flex items-center gap-1.5 shrink-0">
        <HelpCircle size={13} className="text-cyan-400 shrink-0" />
        <span className="text-[clamp(11px,1.3vw,13px)] font-bold text-cyan-400 uppercase tracking-wider block">
          {t.instrucao}
        </span>
      </div>

      <div className="w-full bg-[#070d19]/80 border border-white/[0.03] rounded-xl p-3 flex items-center justify-center shrink-0 min-h-[48px] md:min-h-[56px]">
        <p className="text-[clamp(16px,2.2vw,22px)] font-black leading-relaxed text-center text-slate-100 w-full break-words p-1">
          {pergunta}
        </p>
      </div>

      <div className={`w-full flex-1 justify-start gap-2.5 ${isShortText ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'} ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {options.map((opcao, idx) => {
          const isThisSelected = selecionado === opcao;
          let optStyle = "border-slate-800/80 bg-[#04111C]/30 text-slate-300 hover:bg-[#1C3B50]/10";
          
          if (isThisSelected) {
            if (localStatus === 'CORRECT' && optStyle) optStyle = "border-emerald-500 bg-emerald-950/20 text-emerald-400 font-black";
            else if (localStatus === 'WRONG') optStyle = "border-rose-500 bg-rose-950/20 text-rose-400 font-black";
            else optStyle = "border-cyan-400 bg-cyan-950/30 text-cyan-400 font-black ring-1 ring-cyan-400/20";
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={localStatus === "CORRECT" || analisando}
              onClick={() => { handleSelect(opcao); }}
              className={`w-full py-3 px-4 rounded-xl border text-[clamp(14px,1.8vw,18px)] font-bold transition-all cursor-pointer flex items-center min-h-[48px] md:min-h-[56px] h-auto leading-normal break-words ${
                isShortText ? 'text-center justify-center' : 'text-left justify-start'
              } ${optStyle}`}
            >
              {opcao}
            </button>
          );
        })}
      </div>

      {exibirContainerInferior && (
        <div className="w-full flex-1 flex flex-col justify-end mt-1 animate-fade-in">
          

          {analisando && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 font-black tracking-widest uppercase animate-pulse min-h-[100px] md:min-h-[120px] text-[clamp(12px,1.5vw,16px)]">
              <Sparkles size={12} className="animate-spin text-cyan-400" /> <span>{t.validando}</span>
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
            <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 text-center bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl animate-fade-in min-h-[100px] md:min-h-[120px]">
              <div className="flex items-center gap-1 text-rose-400 text-[clamp(11px,1.3vw,14px)] font-black uppercase tracking-wider">
                <XCircle size={12} /> <span>Ajuste necessário</span>
              </div>
              <div className="flex flex-col items-center justify-center w-full gap-2.5">
                <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic break-words text-center w-full">"{feedbackIA}"</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
