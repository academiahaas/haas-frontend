'use client';
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Sparkles, Send, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MioloBlocosProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
}

interface BlocoItem {
  id: string;
  texto: string;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Construye la estructura correcta moviendo los bloques:",
    placeholder: "Toca en los bloques de abajo para ordenar",
    validando: "Analizando...",
    validar: "Validar Respuesta",
    aguardando: "Cargando desafío..."
  },
  en: {
    instrucao: "Build the correct structure by moving the blocks:",
    placeholder: "Tap the blocks below to order",
    validando: "Analyzing...",
    validar: "Validate Answer",
    aguardando: "Loading challenge..."
  },
  pt: {
    instrucao: "Construa a estrutura correta movendo os blocos:",
    placeholder: "Toque nos blocos abaixo para ordenar",
    validando: "Analisando...",
    validar: "Validar Resposta",
    aguardando: "Carregando desafio..."
  }
};

export default function MioloBlocos({
  onSelectionChange,
  onValidateResult,
  status: propStatus = 'IDLE',
  unidadeAtiva
}: MioloBlocosProps) {
  const [gabaritoFrase, setGabaritoFrase] = useState<string>("");
  const [fraseOriginalGabarito, setFraseOriginalGabarito] = useState<string>("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [blocosDisponiveis, setBlocosDisponiveis] = useState<BlocoItem[]>([]);
  const [blocosMontados, setBlocosMontados] = useState<BlocoItem[]>([]);
  
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
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
      setLocalStatus('IDLE');
      setFeedbackIA('');
    } else {
      setLocalStatus(propStatus);
    }
  }, [propStatus]);

  useEffect(() => {
    async function carregarBlocosDoBanco() {
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

        let query = supabase.from("exercises").select("*").eq("activity_type", 5);
        if (isUUID) {
          query = query.eq("unit_id", nomeUnidade);
        } else {
          query = query.eq("unit", nomeUnidade);
        }

        const { data: dados, error } = await query;

        if (error) throw error;

        let gabaritoBruto = dados && dados.length > 0 ? (dados[0].correct_answer || "") : "";
        if (dados && dados.length > 0) {
          setFeedbackCorretoBanco(dados[0].correct_feedback || "");
          setFeedbackIncorretoBanco(dados[0].incorrect_feedback || "");
          setIncentivoCorretoBanco(dados[0].correct_incentive || "");
          setIncentivoIncorretoBanco(dados[0].incorrect_incentive || "");
        }
        let altOptionsRaw = dados && dados.length > 0 ? dados[0].alternative_options : null;

        // Validação de Emergência: String de resposta vazia ou curta demais
        if (!gabaritoBruto || gabaritoBruto.trim().length < 3) {
          console.warn("⚠️ [CONCURSO DE EMERGÊNCIA] Blocos de Gramática ausentes. Acionando IA...");
          gabaritoBruto = await resilienciaTextoCompleto("", nomeUnidade + " - Frase Curta Estruturada Gramatical");
        }

        setFraseOriginalGabarito(gabaritoBruto);
        const fraseLimpa = gabaritoBruto.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim().toLowerCase();
        setGabaritoFrase(fraseLimpa);

        let palavrasOriginais: string[] = [];
        if (altOptionsRaw) {
          try {
            palavrasOriginais = typeof altOptionsRaw === 'string' ? JSON.parse(altOptionsRaw) : altOptionsRaw;
          } catch (e) {
            palavrasOriginais = gabaritoBruto.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
          }
        } else {
          palavrasOriginais = gabaritoBruto.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
        }

        palavrasOriginais = palavrasOriginais.map(p => p.trim()).filter(Boolean);

        const blocosMapeados = palavrasOriginais.map((palavra, index) => ({
          id: `${palavra}-${index}-${Math.random()}`,
          texto: palavra
        }));

        setBlocosMontados([]);
        setBlocosDisponiveis([...blocosMapeados].sort(() => Math.random() - 0.5));
      } catch (err) {
        console.error("Erro ao carregar blocos do Supabase:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarBlocosDoBanco();
  }, [unidadeAtiva]);

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
    } catch (e) {}
  };

  const handlePush = (bloco: BlocoItem) => {
    if (localStatus !== "IDLE" || analisando) return;
    dispararSomClique();
    
    const novosMontados = [...blocosMontados, bloco];
    setBlocosMontados(novosMontados);
    setBlocosDisponiveis(prev => prev.filter(b => b.id !== bloco.id));
    
    if (onSelectionChange) onSelectionChange(novosMontados.length > 0);
  };

  const handlePull = (bloco: BlocoItem) => {
    if (localStatus !== "IDLE" || analisando) return;
    dispararSomClique();

    const novosMontados = blocosMontados.filter(b => b.id !== bloco.id);
    setBlocosMontados(novosMontados);
    setBlocosDisponiveis(prev => [...prev, bloco]);
    
    if (onSelectionChange) onSelectionChange(novosMontados.length > 0);
  };

  const executarValidacaoInterna = async () => {
    if (localStatus !== 'IDLE' || blocosMontados.length === 0 || analisando) return;
    setAnalisando(true);
    setFeedbackIA("");

    const fraseMontadaAluno = blocosMontados.map(b => b.texto).join(" ");

    try {
      const resultado = await registrarFeedbackEErro({
        userId: USER_ID_ALVO,
        enunciado: "Exercício de Ordenação Gramatical (Blocos Embaralhados).",
        respostaCorreta: fraseOriginalGabarito,
        respostaAluno: fraseMontadaAluno,
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(resultado.acertou ? (feedbackCorretoBanco || resultado.feedback) : (feedbackIncorretoBanco || resultado.feedback));
      if (onValidateResult) onValidateResult(resultado.acertou, resultado.acertou ? incentivoCorretoBanco : incentivoIncorretoBanco);
    } catch (e) {
      const fraseMontadaAlunoLimpa = blocosMontados.map(b => b.texto).join(" ").trim().toLowerCase();
      const acertou = fraseMontadaAlunoLimpa === gabaritoFrase;
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? (feedbackCorretoBanco || "Excelente ordenação de sintaxe!") : (feedbackIncorretoBanco || "A estrutura dos blocos possui desvios de ordem sintática."));
      if (onValidateResult) onValidateResult(acertou, acertou ? incentivoCorretoBanco : incentivoIncorretoBanco);
    } finally {
      setAnalisando(false);
    }
  };

    useEffect(() => {
    const escutarSubmitGlobal = () => {
      executarValidacaoInterna();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [blocosMontados, localStatus, analisando, gabaritoFrase, fraseOriginalGabarito]);

  if (carregando) {
    return (
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[11px] md:text-[1.1vw] uppercase tracking-widest">
        {t?.aguardando || "CARREGANDO DESAFIO..."}
      </div>
    );
  }

  const exibirContainerInferior = localStatus !== 'IDLE' || analisando;

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between items-stretch text-left font-sans flex-1 min-h-0 gap-2.5 p-0.5 overflow-hidden">
      
      {/* Enunciado Técnico Responsivo */}
      <div className="flex items-center gap-2 shrink-0 bg-[#070d19]/40 p-2.5 rounded-xl border border-white/[0.02]">
        <HelpCircle size={14} className="text-cyan-400 shrink-0" />
        <span className="text-[11px] md:text-[1.1vw] font-bold text-slate-300 uppercase tracking-wider leading-snug">
          {t.instrucao}
        </span>
      </div>

      {/* ÁREA DE CONSTRUÇÃO DE FRASES */}
      <div className={`w-full p-3 flex-1 rounded-2xl flex flex-wrap content-center justify-center gap-2 items-center border transition-all duration-200 overflow-y-auto max-h-[35vh] min-h-[90px] ${localStatus !== "IDLE" || analisando ? "hidden" : ""} ${
        localStatus === "CORRECT" ? "bg-emerald-950/20 border-emerald-500/30" :
        localStatus === "WRONG" ? "bg-rose-950/20 border-rose-500/30" :
        "bg-[#01070e] border-white/[0.03] shadow-inner"
      }`}>
        {blocosMontados.length === 0 && (
          <span className="text-slate-500 text-[11px] md:text-[1.1vw] font-bold uppercase tracking-widest pointer-events-none text-center px-4 opacity-60">
            {t.placeholder}
          </span>
        )}
        {blocosMontados.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => handlePull(b)}
            disabled={localStatus !== "IDLE" || analisando}
            className="px-3 py-2 bg-gradient-to-b from-[#FF8A2B] to-[#FF7420] text-white text-[clamp(14px,1.6vw,18px)] font-black rounded-xl border border-[#FFB478]/30 cursor-pointer shadow-sm active:scale-95 transition-all whitespace-nowrap tracking-wide"
          >
            {b.texto}
          </button>
        ))}
      </div>

      {/* BANCO DE BLOCOS SELECIONÁVEIS INFERIOR */}
      <div className={`flex flex-wrap gap-2 w-full p-2.5 bg-[#070d19]/30 border border-white/[0.02] rounded-xl justify-center items-center shrink-0 max-h-[22vh] min-h-[70px] overflow-y-auto ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {blocosDisponiveis.map((b) => (
          <button
            key={b.id}
            type="button"
            disabled={localStatus !== "IDLE" || analisando}
            onClick={() => handlePush(b)}
            className="px-3 py-2 bg-[#0c192e] hover:border-cyan-500/30 hover:text-cyan-400 border border-white/[0.04] text-slate-300 text-[clamp(14px,1.6vw,18px)] font-bold rounded-xl cursor-pointer transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            {b.texto}
          </button>
        ))}
      </div>

      {/* CONTAINER DE VALIDAÇÃO E COMENTÁRIO COMPLETAMENTE FLUIDO */}
      {exibirContainerInferior && (
        <div className="w-full flex-1 flex flex-col justify-end mt-0.5 animate-fade-in">
          

          {analisando && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 animate-pulse min-h-[120px]">
              <div className="flex items-center gap-1.5 font-black text-[clamp(10px,1.2vw,12px)] uppercase tracking-wider mb-0.5">
                <Sparkles size={12} className="animate-spin" />
                <span>Mentora Haas</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-300 font-medium italic break-words w-full">"{t.validando}"</p>
            </div>
          )}

          {localStatus === 'CORRECT' && feedbackIA && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl animate-fade-in min-h-[120px] gap-1.5">
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] md:text-[1vw] font-black uppercase tracking-wider">
                <CheckCircle size={11} /> <span>Gramática Correta!</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl animate-fade-in min-h-[120px] gap-1.5">
              <div className="flex items-center gap-1 text-rose-400 text-[10px] md:text-[1vw] font-black uppercase tracking-wider">
                <XCircle size={11} /> <span>Análise de Sintaxe</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
