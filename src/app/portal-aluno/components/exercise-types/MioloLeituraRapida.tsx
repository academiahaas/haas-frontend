'use client';
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle, XCircle, Sparkles, Send, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MioloLeituraRapidaProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
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
  onSelectionChange,
  onValidateResult,
  status: propStatus = 'IDLE',
  unidadeAtiva
}: MioloLeituraRapidaProps) {
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

  const timerRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    async function carregarLeituraDoBanco() {
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

        let query = supabase.from("exercises").select("*").eq("activity_type", 6);
        if (isUUID) {
          query = query.eq("unit_id", nomeUnidade);
        } else {
          query = query.eq("unit", nomeUnidade);
        }

        const { data: dados, error } = await query;

        if (error) throw error;

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
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[1.1vw] uppercase tracking-widest">
        {t?.aguardando || "CARREGANDO DESAFIO..."}
      </div>
    );
  }

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between items-stretch text-left font-sans flex-1 min-h-0 gap-2.5 p-0.5 overflow-hidden">
      
      {/* BARRA SUPERIOR DE INSTRUÇÃO */}
      <div className="flex items-center justify-between shrink-0 bg-[#070d19]/40 p-2.5 rounded-xl border border-white/[0.02] gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-cyan-400 shrink-0" />
          <span className="text-[13px] md:text-[1.1vw] font-bold text-slate-300 uppercase tracking-wider leading-snug">
            {t.instrucao}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-black text-[12px] md:text-[1vw] ${
          timeLeft <= 10 ? 'text-red-500 border-red-500/20 bg-red-500/5 animate-pulse' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
        }`}>
          <Timer size={13} />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* ÁREA CENTRAL MANTIDA INTEGRA E GRANDE */}
      <div className="bg-[#0c192e] border border-white/[0.04] rounded-xl flex-1 h-full min-h-0 w-full overflow-hidden flex flex-col items-stretch justify-start">
        {analisando ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 gap-2 animate-pulse flex-1">
            <Sparkles size={24} className="animate-spin text-cyan-400" />
            <span className="text-[clamp(12px,1.4vw,15px)] text-cyan-400 font-bold uppercase tracking-widest px-4">{t.validando}</span>
          </div>
        ) : localStatus === 'CORRECT' && feedbackIA ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center bg-emerald-950/10 p-4 overflow-y-auto animate-fade-in flex-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[12px] md:text-[1.1vw] font-black uppercase tracking-wider mb-1">
              <CheckCircle size={16} /> <span>Excelente Retenção!</span>
            </div>
            <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic max-w-2xl break-words leading-relaxed px-4">"{feedbackIA}"</p>
          </div>
        ) : localStatus === 'WRONG' && feedbackIA ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center bg-rose-950/10 p-4 overflow-y-auto animate-fade-in flex-1">
            <div className="flex items-center gap-1.5 text-rose-400 text-[12px] md:text-[1.1vw] font-black uppercase tracking-wider mb-1">
              <XCircle size={16} /> <span>Análise de Leitura</span>
            </div>
            <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic max-w-2xl break-words leading-relaxed px-4">"{feedbackIA}"</p>
          </div>
                ) : fase === 'LEITURA' ? (
          <div className="w-full p-6 text-[16px] md:text-[1.4vw] font-medium text-slate-200 leading-relaxed select-none flex-1 flex items-center justify-center overflow-hidden">
            <p className="font-sans text-slate-200 text-justify whitespace-pre-wrap tracking-wide w-full max-w-3xl mx-auto">{textoLongo}</p>
          </div>
        ) : (
          /* Na fase de DIGITAÇÃO, o texto continua visível no topo, mas compacto e sem scrollbar */
          <div className="w-full p-6 border-b border-white/[0.02] bg-white/[0.01] text-[14px] md:text-[1.2vw] font-normal text-slate-400 leading-relaxed select-none flex-1 overflow-hidden flex items-center justify-center">
            <p className="font-sans text-justify whitespace-pre-wrap tracking-wide w-full max-w-3xl mx-auto opacity-70">
              {textoLongo}
            </p>
          </div>
        )}
      </div>

      {/* RODAPÉ ESTÁVEL NO FIM DA TELA */}
      <div className={`w-full shrink-0 flex flex-col items-stretch ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {fase === 'LEITURA' ? (
          <button
            type="button"
            onClick={() => { setFase('DIGITACAO'); setTimeLeft(60); }}
            className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-black text-[12px] md:text-[1.1vw] uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition-all active:scale-95 text-center h-[38px] md:h-[44px] hidden pointer-events-none"
          >
            {t.botaoIrParaDigitacao}
          </button>
        ) : (
          <div className="w-full flex items-center gap-2 bg-[#070d19] border border-white/[0.08] rounded-xl p-1 focus-within:border-cyan-500/50 transition-all min-h-[44px]">
            <textarea
              ref={inputRef}
              value={inputValue}
              disabled={localStatus !== 'IDLE' || analisando}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent border-none font-sans text-[13px] md:text-[1.1vw] text-slate-200 p-2 focus:outline-none resize-none h-12 md:h-14 leading-tight"
            />

          </div>
        )}
      </div>

    </div>
  );
}
