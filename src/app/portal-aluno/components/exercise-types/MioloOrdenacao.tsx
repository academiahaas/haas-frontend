'use client';
import { getExerciseByActivityType } from "@/services/centralService";
import { feedbackTraducoes, obterLangKeyCompartilhado } from "./feedbackTraducoes";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect, useRef } from 'react';
import { registrarFeedbackEErro } from '@/utils/motorResiliencia';
import { Volume2, CheckCircle, XCircle, Sparkles, Send, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FragmentItem {
  id: number;
  text: string;
}

interface MioloOrdenacaoProps {
  initialExerciseData?: any;
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
  nivelAtivo?: string;
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
  initialExerciseData,
  onSelectionChange,
  onValidateResult,
  status: propStatus = 'IDLE',
  unidadeAtiva
}: MioloOrdenacaoProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
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

  // Sync Adaptativo Determinístico - Ordenação (REDE AMPLA + DEBUG)
  useEffect(() => {
    if (initialExerciseData) {
      const ex = initialExerciseData;
      
      console.log("🐛 [DEBUG ORDENACAO] Dados brutos recebidos:", {
        correct_answer: ex.correct_answer,
        text: ex.text,
        question: ex.question,
        options: ex.options,
        alternative_options: ex.alternative_options
      });

      // 1. Mapeia a frase correta (Buscando em todas as colunas possíveis de texto)
      const correctString = String(ex.correct_answer || ex.text || ex.question || "").trim();
      setReferencePhrase(correctString);
      setTextoParaFalar(correctString);
      
      // 2. Extrai e processa as opções (Buscando em alternative_options ou options)
      let parsedOptions = [];
      const rawOptions = ex.alternative_options || ex.options;

      try {
        if (rawOptions) {
          if (Array.isArray(rawOptions)) {
            parsedOptions = rawOptions;
          } else if (typeof rawOptions === 'string') {
            try {
              parsedOptions = JSON.parse(rawOptions);
            } catch(err) {
              parsedOptions = rawOptions.split(',').map(w => w.trim()).filter(Boolean);
            }
          }
        }
      } catch(e) {
        console.error("Erro ao processar as opções de blocos:", e);
      }
      
      // 3. Fallback: Se não vieram opções nos arrays, quebra a frase correta em palavras
      if ((!parsedOptions || parsedOptions.length === 0) && correctString) {
        console.log("⚠️ [DEBUG ORDENACAO] Fallback ativado. Quebrando frase:", correctString);
        parsedOptions = correctString.split(' ').map(w => w.trim()).filter(Boolean);
        parsedOptions.sort(() => Math.random() - 0.5); // Embaralha as palavras
      }

      console.log("✅ [DEBUG ORDENACAO] Blocos finais gerados:", parsedOptions);

      // 4. Formata para o estado bank/deposit exigido pela UI
      const fragmentsFormatados = parsedOptions.map((texto, i) => ({
        id: i,
        text: String(texto).trim()
      }));

      setBank(fragmentsFormatados);
      setInitialFragments(fragmentsFormatados.map(f => f.text));
      setDeposit([]);
      
      setFeedbackCorretoBanco(ex.explanation || ex.feedback_correct || "");
      setFeedbackIncorretoBanco(ex.feedback_incorrect || "");
      
      setLocalStatus('IDLE');
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
      setLocalStatus('IDLE');
      setFeedbackIA('');
      if (listaExercicios && listaExercicios.length > 0) {
        configurarExercicio(listaExercicios[indexAtual]);
      } else if (initialFragments && initialFragments.length > 0) {
        setBank(initialFragments.map((text, idx) => ({ id: idx, text })).sort(() => Math.random() - 0.5));
        setDeposit([]);
      }
    } else if (propStatus) {
      setLocalStatus(propStatus);
    }
  }, [propStatus, initialFragments, listaExercicios, indexAtual]);

  useEffect(() => {
    if (initialExerciseData && (initialExerciseData.id || initialExerciseData.correct_answer)) {
      console.log("🔒 [MioloOrdenacao] MODO ADAPTATIVO ATIVO (Bypass efetuado).");
      setCarregando(false);
      return;
    }
    async function carregarOrdenacao() {
      if (!unidadeAtiva) {
        console.log("🔍 [MioloOrdenacao.tsx] Aguardando UUID/UnidadeAtiva da Central...");
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

        const response = (initialExerciseData && initialExerciseData.id) ? { success: true, data: [initialExerciseData] } : await getExerciseByActivityType(nomeUnidade, 7);
        const dados = (response && response.data) ? response.data : [];

        

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
        const textoMentora1 = resultado.acertou ? (incentivoCorretoBanco || feedbackCorretoBanco || feedbackTraducoes.ordenacao.incentivoCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (incentivoIncorretoBanco || feedbackIncorretoBanco || feedbackTraducoes.ordenacao.incentivoIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno)));
        onValidateResult(resultado.acertou, textoMentora1, resultado.acertou ? 10 : 0, initialExerciseData?.id || listaExercicios[indexAtual]?.id || listaExercicios[indexAtual]?.exercise_id || unidadeAtiva);
      }
    } catch (e) {
      const fraseMontadaAlunoLimpa = deposit.map(d => d.text).join(" ").trim().toLowerCase();
      const gabaritoOficial = referencePhrase.trim().toLowerCase();
      const acertou = fraseMontadaAlunoLimpa.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") === gabaritoOficial.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? (feedbackCorretoBanco || feedbackTraducoes.ordenacao.feedbackCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (feedbackIncorretoBanco || feedbackTraducoes.ordenacao.feedbackIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno))));
      if (onValidateResult) {
        const textoMentora2 = acertou ? (incentivoCorretoBanco || feedbackCorretoBanco || feedbackTraducoes.ordenacao.feedbackCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))) : (incentivoIncorretoBanco || feedbackIncorretoBanco || feedbackTraducoes.ordenacao.feedbackIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno)));
        onValidateResult(acertou, textoMentora2, acertou ? 10 : 0, initialExerciseData?.id || listaExercicios[indexAtual]?.id || listaExercicios[indexAtual]?.exercise_id || unidadeAtiva);
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
          onClick={playAudioOrdenacao}
          className="p-2.5 bg-[#0E1726] hover:bg-[#162238] border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm active:scale-95"
          title="Ouvir áudio"
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* ÁREA DE DEPÓSITO (DROP ZONE) */}
      <div className={`w-full p-4 rounded-xl flex flex-wrap content-start gap-3 items-center transition-all duration-300 min-h-[140px] shadow-inner ${exibirContainerInferior ? "hidden" : ""} ${
        localStatus === "CORRECT" ? "bg-emerald-950/20 border border-emerald-500/30" :
        localStatus === "WRONG" ? "bg-rose-950/20 border border-rose-500/30" :
        "bg-[#080C16]/60 border-2 border-dashed border-slate-700/50"
      }`}>
        {deposit.length === 0 && (
          <div className="w-full h-full flex items-center justify-center pointer-events-none opacity-40">
            <span className="text-slate-400 text-[13px] md:text-[15px] font-medium tracking-wide">
              {t.placeholder}
            </span>
          </div>
        )}
        {deposit.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleToBank(item)}
            disabled={localStatus !== 'IDLE' || analisando}
            className={`px-5 py-2.5 text-[clamp(14px,1.6vw,16px)] font-bold rounded-lg cursor-pointer shadow-[0_4px_0_0_#4c1d95] active:shadow-none active:translate-y-[4px] transition-all whitespace-nowrap ${
              localStatus === 'CORRECT' ? 'bg-emerald-600 border border-emerald-500 text-white shadow-[0_4px_0_0_#059669]' :
              localStatus === 'WRONG' ? 'bg-rose-600 border border-rose-500 text-white shadow-[0_4px_0_0_#e11d48]' :
              'bg-[#8b5cf6] hover:bg-[#a855f7] text-white'
            }`}
          >
            {item.text}
          </button>
        ))}
      </div>

      {/* BANCO DE BLOCOS DISPONÍVEIS */}
      {!exibirContainerInferior && (
        <div className="flex flex-wrap gap-3 w-full p-5 bg-[#080C16]/80 border border-slate-800/80 rounded-xl justify-center items-center shrink-0 min-h-[100px] overflow-y-auto shadow-sm">
          {bank.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={localStatus !== 'IDLE' || analisando}
              onClick={() => toggleToDeposit(item)}
              className="px-5 py-2.5 bg-[#080C16] hover:bg-[#0E1726] border border-slate-700/80 hover:border-slate-500 text-slate-200 text-[clamp(14px,1.6vw,16px)] font-medium rounded-lg cursor-pointer transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              {item.text}
            </button>
          ))}
        </div>
      )}

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
                <CheckCircle size={16} /> <span>{feedbackTraducoes.titulos.ordenacaoCorreto(obterLangKeyCompartilhado(idiomaNativoAluno))}</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#080C16]/90 border border-rose-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(244,63,94,0.12)] gap-3">
              <div className="flex items-center gap-2 text-rose-400 text-[13px] font-bold uppercase tracking-widest">
                <XCircle size={16} /> <span>{feedbackTraducoes.titulos.ordenacaoIncorreto(obterLangKeyCompartilhado(idiomaNativoAluno))}</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
