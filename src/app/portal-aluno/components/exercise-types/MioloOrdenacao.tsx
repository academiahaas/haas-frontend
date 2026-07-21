'use client';
import React, { useState, useEffect, useRef } from 'react';
import { registrarFeedbackEErro } from '@/utils/motorResiliencia';
import { Volume2, CheckCircle, XCircle, Sparkles, Send, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FragmentItem {
  id: number;
  text: string;
}

interface MioloOrdenacaoProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Escucha el audio y ordena los bloques correctamente abajo:",
    placeholder: "Toque en los bloques de abajo para construir la frase...",
    validando: "Analizando...",
    validar: "Validar Respuesta",
    aguardando: "Cargando desafío..."
  },
  en: {
    instrucao: "Listen to the audio and order the blocks correctly below:",
    placeholder: "Tap the blocks below to build the sentence...",
    validando: "Analyzing...",
    validar: "Validate Answer",
    aguardando: "Loading challenge..."
  },
  pt: {
    instrucao: "Ouça o áudio e ordene os blocos corretamente abaixo:",
    placeholder: "Toque nos blocos abaixo para construir a frase...",
    validando: "Analisando...",
    validar: "Validar Resposta",
    aguardando: "Carregando desafio..."
  }
};

export default function MioloOrdenacao({
  onSelectionChange,
  onValidateResult,
  status: propStatus = 'IDLE',
  unidadeAtiva
}: MioloOrdenacaoProps) {
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [listaExercicios, setListaExercicios] = useState<any[]>([]);
  const [indexAtual, setIndexAtual] = useState(0);
  
  const [referencePhrase, setReferencePhrase] = useState("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [textoParaFalar, setTextoParaFalar] = useState("");
  const [initialFragments, setInitialFragments] = useState<string[]>([]);
  const [bank, setBank] = useState<FragmentItem[]>([]);
  const [deposit, setDeposit] = useState<FragmentItem[]>([]);

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
      if (listaExercicios.length > 0) {
        configurarExercicio(listaExercicios[indexAtual]);
      } else {
        setBank(initialFragments.map((text, idx) => ({ id: idx, text })).sort(() => Math.random() - 0.5));
        setDeposit([]);
      }
    } else {
      setLocalStatus(propStatus);
    }
  }, [propStatus]);

  useEffect(() => {
    async function carregarOrdenacao() {
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

        let query = supabase.from("exercises").select("*").eq("activity_type", 7);
        if (isUUID) {
          query = query.eq("unit_id", nomeUnidade);
        } else {
          query = query.eq("unit", nomeUnidade);
        }

        const { data: dados, error } = await query;

        if (error) throw error;

        if (dados && dados.length > 0) {
          setListaExercicios(dados);
          configurarExercicio(dados[0]);
        }
      } catch (err) {
        console.error("Erro no Supabase Ordenacao:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarOrdenacao();
  }, [unidadeAtiva]);

  const configurarExercicio = (exe: any) => {
    if (!exe) return;
    
    const respostaAlvo = exe.correct_answer || exe.audio_transcript || "";
    setReferencePhrase(respostaAlvo);
    setFeedbackCorretoBanco(exe.correct_feedback || "");
    setFeedbackIncorretoBanco(exe.incorrect_feedback || "");
      setIncentivoCorretoBanco(exe.incentivo_correto || "");
      setIncentivoIncorretoBanco(exe.incentivo_incorreto || "");
    setIncentivoCorretoBanco(exe.correct_incentive || "");
    setIncentivoIncorretoBanco(exe.incorrect_incentive || "");
    setTextoParaFalar(exe.audio_transcript || exe.correct_answer || "");
    
    let frags: string[] = [];

    if (exe.alternative_options) {
      if (Array.isArray(exe.alternative_options)) {
        frags = exe.alternative_options;
      } else if (typeof exe.alternative_options === 'string') {
        try {
          const parsed = JSON.parse(exe.alternative_options);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            frags = parsed;
          } else {
            frags = respostaAlvo.split(/\s+/).filter((w: string) => w.length > 0);
          }
        } catch (e) {
          frags = respostaAlvo.split(/\s+/).filter((w: string) => w.length > 0);
        }
      }
    } else {
      frags = respostaAlvo.split(/\s+/).filter((w: string) => w.length > 0);
    }
      
    setInitialFragments(frags);
    setBank(frags.map((text, idx) => ({ id: idx, text })).sort(() => Math.random() - 0.5));
    setDeposit([]);
  };

  const playAudioOrdenacao = () => {
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

  const dispararSomClique = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {
      console.warn("Erro ao reproduzir clique sintetico:", e);
    }
  };

  const toggleToDeposit = (item: FragmentItem) => {
    if (localStatus !== 'IDLE' || analisando) return;
    dispararSomClique();
    const newBank = bank.filter(b => b.id !== item.id);
    const newDeposit = [...deposit, item];
    setBank(newBank);
    setDeposit(newDeposit);
    if (onSelectionChange) onSelectionChange(true);
  };

  const toggleToBank = (item: FragmentItem) => {
    if (localStatus !== 'IDLE' || analisando) return;
    dispararSomClique();
    const newDeposit = deposit.filter(d => d.id !== item.id);
    const newBank = [...bank, item];
    setBank(newBank);
    setDeposit(newDeposit);
    if (onSelectionChange) onSelectionChange(newDeposit.length > 0);
  };

  const executarValidacaoInterna = async () => {
    if (localStatus !== 'IDLE' || deposit.length === 0 || analisando) return;
    setAnalisando(true);
    setFeedbackIA("");

    const fraseMontadaAluno = deposit.map(d => d.text).join(" ");

    try {
      const resultado = await registrarFeedbackEErro({
        userId: USER_ID_ALVO,
        enunciado: `Exercício de Ordenação de Frases Auditivas. Áudio original ditado: "${textoParaFalar}"`,
        respostaCorreta: referencePhrase,
        respostaAluno: fraseMontadaAluno,
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(resultado.acertou ? (feedbackCorretoBanco || resultado.feedback) : (feedbackIncorretoBanco || resultado.feedback));
      if (onValidateResult) {
        const textoMentora1 = resultado.acertou ? (incentivoCorretoBanco || feedbackCorretoBanco || "Excelente ordenação de sentença!") : (incentivoIncorretoBanco || feedbackIncorretoBanco || "Atenção à ordem sintática dos elementos.");
        onValidateResult(resultado.acertou, textoMentora1, resultado.acertou ? 10 : 0, listaExercicios[indexAtual]?.id || listaExercicios[indexAtual]?.exercise_id || unidadeAtiva);
      }
    } catch (e) {
      const fraseMontadaAlunoLimpa = deposit.map(d => d.text).join(" ").trim().toLowerCase();
      const gabaritoOficial = referencePhrase.trim().toLowerCase();
      const acertou = fraseMontadaAlunoLimpa.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") === gabaritoOficial.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? (feedbackCorretoBanco || "Excelente ordenação sintática!") : (feedbackIncorretoBanco || "A ordem dos blocos possui desvios de concordância."));
      if (onValidateResult) {
        const textoMentora2 = acertou ? (incentivoCorretoBanco || feedbackCorretoBanco || "Excelente ordenação sintática!") : (incentivoIncorretoBanco || feedbackIncorretoBanco || "A ordem dos blocos possui desvios de concordância.");
        onValidateResult(acertou, textoMentora2, acertou ? 10 : 0, listaExercicios[indexAtual]?.id || listaExercicios[indexAtual]?.exercise_id || unidadeAtiva);
      }
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
  }, [deposit, localStatus, analisando, referencePhrase]);

  if (carregando) {
    return (
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[1.1vw] uppercase tracking-widest">
        {t?.aguardando || "CARREGANDO DESAFIO..."}
      </div>
    );
  }

  const exibirContainerInferior = localStatus !== 'IDLE' || analisando;

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between items-stretch text-left font-sans flex-1 min-h-0 gap-2 p-0.5 overflow-hidden">
      
      {/* BARRA SUPERIOR DE INSTRUÇÃO E ÁUDIO */}
      <div className="flex items-center justify-between shrink-0 bg-[#070d19]/40 p-2 rounded-xl border border-white/[0.02] gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-cyan-400 shrink-0" />
          <span className="text-[13px] md:text-[1.1vw] font-bold text-slate-300 uppercase tracking-wider leading-snug">
            {t.instrucao}
          </span>
        </div>
        <button 
          type="button"
          onClick={playAudioOrdenacao}
          className="p-2 bg-[#0c192e] hover:bg-cyan-900/40 border border-cyan-500/20 text-cyan-400 rounded-xl transition-all cursor-pointer flex items-center justify-center h-8 w-8 shrink-0 shadow-sm"
        >
          <Volume2 size={14} />
        </button>
      </div>

      {/* ÁREA DE DEPÓSITO (ALTURA ADAPTADA CONTROLADA PARA EVITAR VAZAMENTOS) */}
      <div className={`w-full p-3 flex-1 rounded-2xl flex flex-wrap content-center justify-center gap-2 items-center border transition-all duration-200 overflow-y-auto max-h-[35vh] min-h-[100px] ${
        localStatus === "CORRECT" ? "bg-emerald-950/20 border-emerald-500/30" :
        localStatus === "WRONG" ? "bg-rose-950/20 border-rose-500/30" :
        "bg-[#01070e] border-white/[0.03] shadow-inner"
      }`}>
        {deposit.length === 0 && (
          <span className="text-slate-500 text-[13px] md:text-[1.1vw] font-bold uppercase tracking-widest pointer-events-none text-center px-4 opacity-60">
            {t.placeholder}
          </span>
        )}
        {deposit.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleToBank(item)}
            disabled={localStatus !== 'IDLE' || analisando}
            className={`px-3 py-1.5 text-[13px] md:text-[1.1vw] font-black rounded-xl border cursor-pointer shadow-sm active:scale-95 transition-all whitespace-nowrap tracking-wide ${
              localStatus === 'CORRECT' ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 border-emerald-500 text-white' :
              localStatus === 'WRONG' ? 'bg-gradient-to-b from-rose-600 to-rose-700 border-rose-500 text-white' :
              'bg-gradient-to-b from-[#FF8A2B] to-[#FF7420] text-white border-[#FFB478]/30'
            }`}
          >
            {item.text}
          </button>
        ))}
      </div>

      {/* BANCO DE BLOCOS DISPONÍVEIS INFERIOR (ALTURA REDUZIDA PARA RESPONSIVIDADE) */}
      {!exibirContainerInferior && (
        <div className="flex flex-wrap gap-2 w-full p-2 bg-[#070d19]/30 border border-white/[0.02] rounded-xl justify-center items-center shrink-0 max-h-[22vh] min-h-[80px] overflow-hidden">
          {bank.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={localStatus !== 'IDLE' || analisando}
              onClick={() => toggleToDeposit(item)}
              className="px-2.5 py-1.5 bg-[#0c192e] hover:border-cyan-500/30 hover:text-cyan-400 border border-white/[0.04] text-slate-300 text-[13px] md:text-[1.1vw] font-bold rounded-xl cursor-pointer transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              {item.text}
            </button>
          ))}
        </div>
      )}

      {/* CONTAINER DE VALIDAÇÃO E COMENTÁRIO COMPLETAMENTE INTEGRADO CONTRA VAZAMENTOS */}
      {exibirContainerInferior && (
        <div className="w-full flex-1 flex flex-col justify-center items-stretch mt-0.5 animate-fade-in min-h-0 overflow-hidden bg-[#0c192e] border border-white/[0.04] rounded-xl p-4">
          

          {analisando && (
            <div className="text-[10px] md:text-[1vw] text-cyan-400 font-bold tracking-widest text-center py-2 uppercase flex items-center justify-center gap-2 bg-cyan-950/10 border border-cyan-500/10 rounded-xl animate-pulse h-[36px]">
              <Sparkles size={11} className="animate-spin text-cyan-400" /> <span>{t.validando}</span>
            </div>
          )}

          {localStatus === 'CORRECT' && feedbackIA && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-xl animate-fade-in min-h-0 overflow-hidden">
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] md:text-[1vw] font-black uppercase tracking-wider">
                <CheckCircle size={11} /> <span>Sintaxe Correta!</span>
              </div>
              <p className="text-[11px] md:text-[1.1vw] text-slate-300 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full flex flex-col items-center justify-center gap-0.5 text-center bg-rose-950/20 border border-rose-500/20 py-1 px-3 rounded-xl animate-fade-in min-h-[40px] max-h-[70px] overflow-y-auto">
              <div className="flex items-center gap-1 text-rose-400 text-[10px] md:text-[1vw] font-black uppercase tracking-wider">
                <XCircle size={11} /> <span>Análise de Estrutura</span>
              </div>
              <p className="text-[11px] md:text-[1.1vw] text-slate-300 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
