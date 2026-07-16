'use client';
import { chamarGeminiInteligente } from './geminiService';
import { resilienciaTextoCompleto, resilienciaOpcoes, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Sparkles, Send, RefreshCw, HelpCircle } from 'lucide-react';

interface MioloProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean) => void;
  status?: "IDLE" | "CORRECT" | "WRONG";
  unidadeAtiva?: string;
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
  onSelectionChange,
  onValidateResult,
  status = "IDLE",
  unidadeAtiva
}: MioloProps) {
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctOption, setCorrectOption] = useState<string>("");
  const [pergunta, setPergunta] = useState<string>("Carregando enunciado...");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const escutarSubmitGlobal = () => {
      executarValidacaoInterna();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [selecionado, analisando]);
  const [isShortText, setIsShortText] = useState(true);

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
    async function carregarMultiplaEscolhaDoBanco() {
      try {
        setCarregando(true);
        
        const { data: userDados } = await supabase.from('users').select('native_language').eq('id', USER_ID_ALVO);
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }

        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined" || nomeUnidade.includes("Labirinto")) {
          nomeUnidade = "1.1";
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);

        let query = supabase.from("exercises").select("*").eq("activity_type", 1);
        if (isUUID) {
          query = query.eq("unit_id", nomeUnidade);
        } else {
          query = query.eq("unit", nomeUnidade);
        }

        let { data: dados, error } = await query.limit(1);
        console.log("🔍 [PROVA REAL MÚLTIPLA] Dados retornados do Supabase:", { dados, error });

        if (dados && dados.length > 0) {
          const exe = dados[0];
          setPergunta(exe.reading_text || "Selecione a resposta correta:");
          
          const respostaCerta = exe.correct_answer || "";
          setCorrectOption(respostaCerta);
          setFeedbackCorretoBanco(exe.correct_feedback || "");
          setFeedbackIncorretoBanco(exe.incorrect_feedback || "");

          let bancoOpts: string[] = [];
          if (exe.alternative_options) {
            if (Array.isArray(exe.alternative_options)) {
              bancoOpts = exe.alternative_options;
            } else if (typeof exe.alternative_options === 'string') {
              try {
                bancoOpts = JSON.parse(exe.alternative_options);
              } catch (e) {
                bancoOpts = exe.alternative_options.split(',').map((s: string) => s.trim());
              }
            }
          }

          const erradasLimpas = bancoOpts.filter(op => op !== respostaCerta);
          let listaUnificada = Array.from(new Set([respostaCerta, ...erradasLimpas])).filter(Boolean);

          // CUIDADO: SE TIVER EXATAMENTE 3 OPÇÕES, COMPLETA COM A IA PARA FICAR 4
          if (listaUnificada.length === 3) {
            try {
              const promptGerador = `Com base no enunciado "${exe.reading_text}" e sabendo que a resposta correta é "${respostaCerta}", crie uma única alternativa incorreta adicional que seja plausível para compor uma questão de múltipla escolha. Retorne estritamente o texto da nova opção, sem aspas, explicações ou formatação markdown. Evite repetir estas opções existentes: ${listaUnificada.join(', ')}.`;
              
              // 🧠 Pool de chaves gratuito com rodízio automático
              const textoAlternativa = await chamarGeminiInteligente(promptGerador);
              const dataIA = { candidates: [{ content: { parts: [{ text: textoAlternativa }] } }] };
              const responseIA = { ok: true, json: async () => dataIA };

              if (responseIA.ok) {
                const resData = await responseIA.json();
                const novaOpcao = resData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (novaOpcao && !listaUnificada.includes(novaOpcao)) {
                  listaUnificada.push(novaOpcao);
                }
              }
            } catch (errIA) {
              console.error("Erro ao gerar alternativa complementar via IA:", errIA);
            }
          }

          // Garante corte definitivo no teto de 4
          const listaFinal = listaUnificada.slice(0, 4);
          setOptions(listaFinal);

          const maiorTexto = listaFinal.reduce((max, current) => current.length > max.length ? current : max, "");
          setIsShortText(maiorTexto.length < 20);
        }
        setLocalStatus('IDLE');
        setSelecionado(null);
        setFeedbackIA("");
      } catch (err) {
        console.error("Erro ao carregar multipla escolha:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarMultiplaEscolhaDoBanco();
  }, [unidadeAtiva]);

  useEffect(() => {
    if (status === "IDLE") {
      setLocalStatus("IDLE");
      setSelecionado(null);
      setFeedbackIA("");
    }
  }, [status]);

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
        userId: USER_ID_ALVO,
        enunciado: pergunta,
        respostaCorreta: correctOption,
        respostaAluno: selecionado,
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(resultado.acertou ? (feedbackCorretoBanco || resultado.feedback) : (feedbackIncorretoBanco || resultado.feedback));
      if (onValidateResult) onValidateResult(resultado.acertou);
    } catch (e) {
      const acertou = selecionado === correctOption;
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? "Excelente!" : "Incorreto.");
      if (onValidateResult) onValidateResult(acertou);
    } finally {
      setAnalisando(false);
    }
  };

  const resetarExercicio = () => {
    setSelecionado(null);
    setLocalStatus('IDLE');
    setFeedbackIA("");
  };

    useEffect(() => {
    const escutarSubmitGlobal = () => {
      executarValidacaoInterna();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [selecionado, options, localStatus, analisando, pergunta, correctOption]);

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
              onClick={() => handleSelect(opcao)}
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
