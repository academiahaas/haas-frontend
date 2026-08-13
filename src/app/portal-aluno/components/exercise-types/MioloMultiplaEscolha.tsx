'use client';
import { useAuth } from "@/contexts/AuthContext";
import { feedbackTraducoes, obterLangKeyCompartilhado } from "./feedbackTraducoes";
import { chamarGeminiInteligente } from './geminiService';
import { resilienciaTextoCompleto, resilienciaOpcoes, registrarFeedbackEErro } from '@/utils/motorResiliencia';

import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Sparkles, Send, RefreshCw, HelpCircle } from 'lucide-react';

interface MioloProps {
  initialExerciseData?: any;
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

export default function MioloMultiplaEscolha({ initialExerciseData, exerciseData,
 
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
  useEffect(() => {
    async function buscarIdioma() {
      try {
        const uid = typeof window !== "undefined" ? localStorage.getItem("haas_user_id") : null;
        if (!uid) return;
        const { data: userDados } = await supabase
          .from("users")
          .select("native_language")
          .eq("id", uid);
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }
      } catch (e) {
        console.warn("Erro ao buscar idioma nativo:", e);
      }
    }
    buscarIdioma();
  }, []);
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  
  // Sync Adaptativo Genérico e Escalável (Suporta qualquer registro da tabela exercises)
  useEffect(() => {
    if (initialExerciseData) {
      console.log("⚡ [MioloMultiplaEscolha] Carregando exercício adaptativo ID:", initialExerciseData.id);
      
      const ex = initialExerciseData;

      // 1. Extração dinâmica da pergunta (prompt ou reading_text)
      const enunciado = ex.prompt || ex.reading_text || "";

      // 2. Extração e Normalização das Opções (alternative_options ou options)
      let rawDistractors = ex.alternative_options || ex.options || [];
      if (typeof rawDistractors === 'string') {
        try { rawDistractors = JSON.parse(rawDistractors); } catch (e) { rawDistractors = []; }
      }
      if (!Array.isArray(rawDistractors)) rawDistractors = [];

      // Converte itens para string simples caso venham como objeto
      let distractorsClean = rawDistractors.map((item: any) => 
        typeof item === 'object' && item !== null ? (item.text || item.option || item.label || JSON.stringify(item)) : String(item)
      );

      const respostaCorreta = String(ex.correct_answer || "").trim();

      // 3. Consolidação: Junta a resposta correta com os distratores e remove duplicatas
      let allOptions = [...distractorsClean];
      if (respostaCorreta && !allOptions.some(opt => opt.trim().toLowerCase() === respostaCorreta.toLowerCase())) {
        allOptions.push(respostaCorreta);
      }

      // 4. Embaralhamento determinístico (Shuffle) para não ficar a resposta sempre no final
      allOptions = allOptions.sort(() => 0.5 - Math.random());

      // 5. Hidratação dos estados
      setPergunta(enunciado);
      setOptions(allOptions);
      setCorrectOption(respostaCorreta);
      setExerciseId(ex.id || "");
      setFeedbackCorretoBanco(ex.correct_feedback || "");
      setFeedbackIncorretoBanco(ex.incorrect_feedback || "");
      setIncentivoCorretoBanco(ex.correct_incentive || "");
      setIncentivoIncorretoBanco(ex.incorrect_incentive || "");
      
      setCarregando(false);
    }
  }, [initialExerciseData]);



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

  const GEMINI_API_KEY = "CHAVE_REVOGADA_NAO_USAR";
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
      const textoMentora1 = resultado.acertou ? (incentivoCorretoBanco || feedbackTraducoes.multiplaEscolha.incentivoCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (incentivoIncorretoBanco || feedbackTraducoes.multiplaEscolha.incentivoIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno)));
      if (onValidateResult) onValidateResult(resultado.acertou, textoMentora1, resultado.acertou ? 10 : 0, exerciseId || unidadeAtiva);
    } catch (e) {
      const acertou = selecionado === correctOption;
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? (feedbackCorretoBanco || feedbackTraducoes.multiplaEscolha.feedbackCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (feedbackIncorretoBanco || feedbackTraducoes.multiplaEscolha.feedbackIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno))));
      const textoMentora2 = acertou ? (incentivoCorretoBanco || feedbackTraducoes.multiplaEscolha.incentivoCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (incentivoIncorretoBanco || feedbackTraducoes.multiplaEscolha.incentivoIncorretoQuase(obterLangKeyCompartilhado(idiomaNativoAluno)));
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
    <div className="w-full h-full flex flex-col font-sans select-none gap-5 p-2 overflow-hidden flex-1 min-h-0">
      
      {/* BARRA SUPERIOR DE INSTRUÇÃO MINIMALISTA */}
      <div className="flex items-center gap-2 shrink-0 px-1">
        <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
        <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest">
          {t.instrucao}
        </span>
      </div>

      {/* CARD DO ENUNCIADO / PERGUNTA */}
      <div className="w-full bg-[#080C16]/80 border border-slate-700/50 rounded-xl p-5 flex items-center justify-center shrink-0 min-h-[80px] shadow-sm">
        <p className="text-[clamp(16px,2vw,20px)] font-bold leading-relaxed text-center text-slate-100 w-full break-words tracking-wide">
          {pergunta}
        </p>
      </div>

      {/* GRID / LISTA DE OPÇÕES DE RESPOSTA */}
      <div className={`w-full flex-1 justify-start gap-3 overflow-y-auto pr-1 ${isShortText ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'} ${exibirContainerInferior ? "hidden" : ""}`}>
        {options.map((opcao, idx) => {
          const isThisSelected = selecionado === opcao;
          const letterBadge = String.fromCharCode(65 + idx);
          
          let cardStyle = "border-slate-700/50 bg-[#080C16]/60 hover:bg-[#0E1726] hover:border-slate-500 text-slate-200";
          let badgeStyle = "bg-[#080C16] border-slate-800 text-slate-400 group-hover:border-cyan-900/50 group-hover:text-cyan-400";

          if (isThisSelected) {
            if (localStatus === 'CORRECT') {
              cardStyle = "border-emerald-500/80 bg-emerald-950/30 text-emerald-300 font-bold shadow-sm";
              badgeStyle = "bg-emerald-500 text-slate-950 font-black border-emerald-400";
            } else if (localStatus === 'WRONG') {
              cardStyle = "border-rose-500/80 bg-rose-950/30 text-rose-300 font-bold shadow-sm";
              badgeStyle = "bg-rose-500 text-slate-950 font-black border-rose-400";
            } else {
              cardStyle = "border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold ring-1 ring-cyan-400/30 shadow-sm";
              badgeStyle = "bg-cyan-400 text-slate-950 font-black border-cyan-300";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={localStatus === "CORRECT" || analisando}
              onClick={() => { handleSelect(opcao); }}
              className={`group w-full py-3 px-4 rounded-xl border text-[clamp(14px,1.6vw,17px)] font-medium transition-all cursor-pointer flex items-center gap-3.5 min-h-[56px] leading-normal break-words shadow-sm ${cardStyle}`}
            >
              <div className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-lg border text-[13px] tracking-wider transition-all select-none ${badgeStyle}`}>
                {letterBadge}
              </div>
              <span className="flex-1 text-left">{opcao}</span>
            </button>
          );
        })}
      </div>

      {/* CONTAINER DE VALIDAÇÃO E FEEDBACK DA MENTORA (EM CAMADAS) */}
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
                <CheckCircle size={16} /> <span>{feedbackTraducoes.titulos.multiplaEscolhaCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))}</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#080C16]/90 border border-rose-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(244,63,94,0.12)] gap-3">
              <div className="flex items-center gap-2 text-rose-400 text-[13px] font-bold uppercase tracking-widest">
                <XCircle size={16} /> <span>{feedbackTraducoes.titulos.multiplaEscolhaIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno))}</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
