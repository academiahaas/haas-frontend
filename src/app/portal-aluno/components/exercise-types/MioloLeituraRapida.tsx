'use client';
import { getExerciseByActivityType } from "@/services/centralService";
import { useAuth } from "@/contexts/AuthContext";
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle, XCircle, Sparkles, Send, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MioloLeituraRapidaProps {
  initialExerciseData?: any;
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
  nivelAtivo?: string;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Lee el texto con atención antes de que se agote el tiempo:",
    botaoIrParaDigitacao: "¡Ya terminé de leer! Ir a la validación",
    placeholder: "Escribe o resume el párrafo anterior con precisión textual para validar...",
    validando: "Analizando...",
    aguardando: "Cargando desafío..."
  },
  en: {
    instrucao: "Read the text carefully before time runs out:",
    botaoIrParaDigitacao: "I've finished reading! Go to validation",
    placeholder: "Type or summarize the paragraph above with textual precision to validate...",
    validando: "Analyzing...",
    aguardando: "Loading challenge..."
  },
  pt: {
    instrucao: "Leia o texto com atenção antes que o tempo acabe:",
    botaoIrParaDigitacao: "Já terminei de ler! Ir para a validação",
    placeholder: "Digite ou resume o parágrafo acima com precisão textual para validar...",
    validando: "Analisando...",
    aguardando: "Carregando desafio..."
  }
};

export default function MioloLeituraRapida({
  initialExerciseData,
  onSelectionChange,
  onValidateResult,
  status: propStatus = 'IDLE',
  unidadeAtiva
}: MioloLeituraRapidaProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [textoLongo, setTextoLongo] = useState("Carregando parágrafo de interpretação...");
  const [textoGabarito, setTextoGabarito] = useState("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [inputValue, setInputValue] = useState("");
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [fase, setFase] = useState<'LEITURA' | 'DIGITACAO'>('LEITURA');
  
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Sync Adaptativo Determinístico - Leitura Rápida
  useEffect(() => {
    if (initialExerciseData) {
      console.log("⚡ [MioloLeituraRapida] Hydrating adaptative exercise:", initialExerciseData);
      const ex = initialExerciseData;
      setExerciseId(ex.id || "");
      
      const respostaCorreta = String(ex.correct_answer || "").trim();
      // Tenta buscar de campos comuns e, se falhar, assume que o texto é o próprio gabarito
      const textoParaLer = String(ex.reading_text || ex.text || ex.question || ex.correct_answer || "").trim();
      
      setTextoLongo(textoParaLer);
      setTextoGabarito(respostaCorreta);
      
      // Cálculo dinâmico do tempo caso não venha estipulado (mínimo de 30s)
      const numPalavras = textoParaLer.split(/\s+/).length;
      const tempoCalculado = Math.max(30, Math.ceil(numPalavras * 0.5)); // ~120 PPM
      setTimeLeft(ex.timer || tempoCalculado);

      setFeedbackCorretoBanco(ex.explanation || ex.feedback_correct || "");
      setFeedbackIncorretoBanco(ex.feedback_incorrect || "");
      
      setFase('LEITURA');
      setInputValue("");
      setLocalStatus('IDLE');
      setCarregando(false);
    }
  }, [initialExerciseData]);


  const timerRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      setLocalStatus('IDLE');
      setFeedbackIA('');
      if (fase === 'DIGITACAO') {
        setInputValue("");
        setFase('LEITURA');
        setTimeLeft(30);
      }
    } else {
      setLocalStatus(propStatus);
    }
  }, [propStatus]);

  useEffect(() => {
    if (initialExerciseData && (initialExerciseData.id || initialExerciseData.text)) {
      console.log("🔒 [MioloLeituraRapida] MODO ADAPTATIVO ATIVO (Bypass efetuado).");
      setCarregando(false);
      return;
    }
    async function carregarLeituraDoBanco() {
      if (!unidadeAtiva) {
        console.log("🔍 [MioloLeituraRapida.tsx] Aguardando UUID/UnidadeAtiva da Central...");
        return;
      }
      try {
        setCarregando(true);
          

          
          
        
        try {
          if (typeof USER_ID_ALVO !== "undefined" && USER_ID_ALVO && String(USER_ID_ALVO).trim() !== "") {
            if (!USER_ID_ALVO || USER_ID_ALVO === "undefined" || USER_ID_ALVO === "null") return;
            const { data: userDados } =
    await supabase
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

        const response = await getExerciseByActivityType(nomeUnidade, 6);
        const dados = (response && response.data) ? response.data : [];

        

        let textoBase = dados && dados.length > 0 ? (dados[0].reading_text || dados[0].correct_answer || "") : "";
        if (dados && dados.length > 0) {
          setFeedbackCorretoBanco(dados[0].correct_feedback || "");
          setFeedbackIncorretoBanco(dados[0].incorrect_feedback || "");
          setIncentivoCorretoBanco(dados[0].incentivo_correto || "");
          setIncentivoIncorretoBanco(dados[0].incentivo_incorreto || "");
          if (dados[0]?.id) setExerciseId(String(dados[0].id));
          setIncentivoCorretoBanco(dados[0].correct_incentive || "");
          setIncentivoIncorretoBanco(dados[0].incorrect_incentive || "");
        }

        // Validação de Emergência: Caso o banco retorne vazio ou colunas corrompidas
        if (!textoBase || textoBase.trim().length < 5) {
          console.warn("⚠️ [CONCURSO DE EMERGÊNCIA] Texto de Leitura Rápida ausente. Acionando IA...");
          textoBase = await resilienciaTextoCompleto("", nomeUnidade + " - Parágrafo Completo para Leitura Dinâmica");
        }

        setTextoLongo(textoBase);
        setTextoGabarito(textoBase.trim());
        setInputValue("");
        setFase('LEITURA');
        setTimeLeft(30);
      } catch (err) {
        console.error("Erro ao carregar Tipo 6 do Supabase:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarLeituraDoBanco();
  }, [unidadeAtiva]);

  useEffect(() => {
    if (localStatus !== 'IDLE') {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (fase === 'LEITURA') {
            setFase('DIGITACAO');
            return 60;
          }
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [fase, localStatus]);

  useEffect(() => {
    if (fase === 'DIGITACAO' && inputRef.current) {
      inputRef.current.focus();
    }
    // Mantém o botão Submeter global ativo para receber o primeiro clique na fase de leitura
    if (fase === 'LEITURA' && onSelectionChange) {
      onSelectionChange(true);
    }
  }, [fase]);

  useEffect(() => {
    const escutarSubmitGlobal = () => {
      // Usamos referências locais do estado atualizado
      if (localStatus !== 'IDLE' || analisando) return;
      
      if (fase === 'LEITURA') {
        setFase('DIGITACAO');
        setTimeLeft(60);
      } else {
        executarValidacaoInterna();
      }
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [fase, inputValue, localStatus, analisando, textoGabarito]);

  useEffect(() => {
    if (fase === 'DIGITACAO' && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Na fase de LEITURA, o botão laranja sempre fica aceso para avançar.
    // Na fase de DIGITACAO, ele só acende se o aluno tiver digitado algo válido.
    if (onSelectionChange) {
      if (fase === 'LEITURA') {
        onSelectionChange(true);
      } else {
        onSelectionChange(inputValue.trim().length > 0);
      }
    }
  }, [fase, inputValue]);

  useEffect(() => {
    const escutarSubmitGlobal = () => {
      if (localStatus !== 'IDLE' || analisando) return;
      
      if (fase === 'LEITURA') {
        setFase('DIGITACAO');
        setTimeLeft(60);
      } else {
        // Na fase de digitação, só valida se houver texto
        if (inputValue.trim().length > 0) {
          executarValidacaoInterna();
        }
      }
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [fase, inputValue, localStatus, analisando, textoGabarito]);
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (onSelectionChange) onSelectionChange(val.trim().length > 0);
  };

  const executarValidacaoInterna = async () => {
    if (localStatus !== 'IDLE' || inputValue.trim().length === 0 || analisando) return;
    setAnalisando(true);
    setFeedbackIA("");

    try {
      const resultado = await registrarFeedbackEErro({
        userId: USER_ID_ALVO,
        enunciado: `Exercício de Leitura Rápida e Retenção Textual. Parágrafo original: "${textoGabarito}"`,
        respostaCorreta: textoGabarito,
        respostaAluno: inputValue.trim(),
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(resultado.acertou ? (feedbackCorretoBanco || resultado.feedback) : (feedbackIncorretoBanco || resultado.feedback));
      if (onValidateResult) {
          const palavrasGabarito = textoGabarito.trim().split(/\s+/).filter(Boolean);
          const palavrasAluno = inputValue.trim().split(/\s+/).filter(Boolean);
          let acertos = 0;
          palavrasGabarito.forEach((palavra, idx) => {
            if (palavrasAluno[idx] && palavrasAluno[idx].toLowerCase().replace(/[^a-zA-Z0-9à-úÀ-Ú]/g, "") === palavra.toLowerCase().replace(/[^a-zA-Z0-9à-úÀ-Ú]/g, "")) {
              acertos++;
            }
          });
          const nota = palavrasGabarito.length > 0 ? Number(((acertos / palavrasGabarito.length) * 10).toFixed(1)) : (resultado.acertou ? 10 : 0);
          const aprovado = nota >= 6;
          const textoMentora1 = aprovado ? (incentivoCorretoBanco || feedbackCorretoBanco || "Excelente velocidade e retenção de leitura!") : (incentivoIncorretoBanco || feedbackIncorretoBanco || "Atenção ao ritmo de leitura e compreensão do texto.");
          onValidateResult(aprovado, textoMentora1, nota, exerciseId || unidadeAtiva);
        }
    } catch (e) {
      const respostaAlunoLimpa = inputValue.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const gabaritoLimpo = textoGabarito.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const possuiMinimo = respostaAlunoLimpa.length >= Math.min(20, gabaritoLimpo.length * 0.3);
      
      setLocalStatus(possuiMinimo ? 'CORRECT' : 'WRONG');
      setFeedbackIA(possuiMinimo ? (feedbackCorretoBanco || "Fidelidade e retenção textual validadas!") : (feedbackIncorretoBanco || "Texto incompleto ou distante do conteúdo original."));
      if (onValidateResult) {
          const palavrasGabarito = textoGabarito.trim().split(/\s+/).filter(Boolean);
          const palavrasAluno = inputValue.trim().split(/\s+/).filter(Boolean);
          let acertos = 0;
          palavrasGabarito.forEach((palavra, idx) => {
            if (palavrasAluno[idx] && palavrasAluno[idx].toLowerCase().replace(/[^a-zA-Z0-9à-úÀ-Ú]/g, "") === palavra.toLowerCase().replace(/[^a-zA-Z0-9à-úÀ-Ú]/g, "")) {
              acertos++;
            }
          });
          const nota = palavrasGabarito.length > 0 ? Number(((acertos / palavrasGabarito.length) * 10).toFixed(1)) : (possuiMinimo ? 10 : 0);
          const aprovado = nota >= 6;
          const textoMentora2 = aprovado ? (incentivoCorretoBanco || "Excelente velocidade e retenção de leitura!") : (incentivoIncorretoBanco || "Atenção ao ritmo de leitura e compreensão do texto.");
          onValidateResult(aprovado, textoMentora2, nota, exerciseId || unidadeAtiva);
        }
    } finally {
      setAnalisando(false);
    }
  };

  if (carregando) {
    return (
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[12px] md:text-[14px] uppercase tracking-widest">
        {t?.aguardando || "CARREGANDO DESAFIO..."}
      </div>
    );
  }

  const modoFeedback = localStatus !== 'IDLE' || analisando;

  return (
    <div className="w-full h-full flex flex-col font-sans select-none gap-4 p-2 overflow-hidden flex-1 min-h-0">
      
      {/* BARRA SUPERIOR DE INSTRUÇÃO E TIMER */}
      <div className="flex items-center justify-between shrink-0 px-1 gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
          <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest">
            {t.instrucao}
          </span>
        </div>

        {/* Timer ocultado no modo feedback */}
        {!modoFeedback && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold text-[12px] tracking-wider shrink-0 transition-all ${
            timeLeft <= 10 
              ? 'text-rose-400 border-rose-500/40 bg-rose-950/30 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.2)]' 
              : 'text-amber-400 border-amber-500/30 bg-amber-950/30'
          }`}>
            <Timer size={14} />
            <span>{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* ÁREA CENTRAL PRINCIPAL (CONTAINER EM CAMADAS) */}
      <div className="bg-[#0a1120]/80 border border-slate-700/50 rounded-xl flex-1 min-h-0 w-full overflow-hidden flex flex-col items-center justify-center shadow-sm p-4 md:p-6">
        {analisando ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 gap-3 animate-pulse flex-1">
            <Sparkles size={26} className="animate-spin text-cyan-400" />
            <span className="text-[13px] text-cyan-400 font-bold uppercase tracking-widest">{t.validando}</span>
          </div>
        ) : localStatus === 'CORRECT' && feedbackIA ? (
          /* CARD EM CAMADAS DE SUCESSO */
          <div className="w-full max-w-2xl bg-[#070d19]/90 border border-emerald-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(16,185,129,0.12)] gap-3">
            <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-bold uppercase tracking-widest">
              <CheckCircle size={16} /> <span>Excelente Retenção!</span>
            </div>
            <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
          </div>
        ) : localStatus === 'WRONG' && feedbackIA ? (
          /* CARD EM CAMADAS DE ANÁLISE / ERRO */
          <div className="w-full max-w-2xl bg-[#070d19]/90 border border-rose-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(244,63,94,0.12)] gap-3">
            <div className="flex items-center gap-2 text-rose-400 text-[13px] font-bold uppercase tracking-widest">
              <XCircle size={16} /> <span>Análise de Leitura</span>
            </div>
            <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
          </div>
        ) : fase === 'LEITURA' ? (
          <div className="w-full h-full p-2 text-[clamp(16px,2vw,20px)] font-medium text-slate-100 leading-relaxed select-none flex-1 flex items-center justify-center overflow-y-auto">
            <p className="font-sans text-justify whitespace-pre-wrap tracking-wide w-full max-w-3xl mx-auto">{textoLongo}</p>
          </div>
        ) : (
          /* FASE DE DIGITAÇÃO */
          <div className="w-full h-full flex flex-col gap-4 flex-1 min-h-0">
            <div className="w-full p-4 rounded-xl border border-slate-800 bg-[#070d19]/80 text-[14px] text-slate-400 leading-relaxed select-none blur-[1.5px] opacity-40 pointer-events-none shrink-0 max-h-[90px] overflow-hidden">
              <p className="font-sans text-justify whitespace-pre-wrap line-clamp-3">
                {textoLongo}
              </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                ref={inputRef}
                value={inputValue}
                disabled={localStatus !== 'IDLE' || analisando}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={t.placeholder}
                className="w-full flex-1 bg-[#070d19] border border-slate-700/80 rounded-xl font-sans text-[14px] md:text-[15px] text-slate-100 p-4 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 resize-none leading-relaxed placeholder-slate-500 transition-all shadow-inner"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
