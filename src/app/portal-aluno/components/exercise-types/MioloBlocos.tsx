'use client';
import { getExerciseByActivityType } from "@/services/centralService";
import { useAuth } from "@/contexts/AuthContext";
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Sparkles, Send, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MioloBlocosProps {
  initialExerciseData?: any;
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
  nivelAtivo?: string;
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
  initialExerciseData,
  onSelectionChange,
  onValidateResult,
  status: propStatus = 'IDLE',
  unidadeAtiva
}: MioloBlocosProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
  const [gabaritoFrase, setGabaritoFrase] = useState<string>("");
  const [fraseOriginalGabarito, setFraseOriginalGabarito] = useState<string>("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [blocosDisponiveis, setBlocosDisponiveis] = useState<BlocoItem[]>([]);
  const [blocosMontados, setBlocosMontados] = useState<BlocoItem[]>([]);
  
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Sync Adaptativo Determinístico - Blocos
  useEffect(() => {
    if (initialExerciseData) {
      console.log("⚡ [MioloBlocos] Hydrating adaptative exercise:", initialExerciseData);
      const ex = initialExerciseData;
      setExerciseId(ex.id || "");
      
      const correctString = String(ex.correct_answer || ex.text || "").trim();
      setGabaritoFrase(correctString);
      setFraseOriginalGabarito(correctString);
      
      let parsedOptions = [];
      try {
        if (Array.isArray(ex.options) && ex.options.length > 0) {
          parsedOptions = ex.options;
        } else if (typeof ex.options === 'string' && ex.options.trim().startsWith('[')) {
          parsedOptions = JSON.parse(ex.options);
        } else if (ex.alternative_options) {
           const altOpts = typeof ex.alternative_options === 'string' ? JSON.parse(ex.alternative_options) : ex.alternative_options;
           if (Array.isArray(altOpts) && altOpts.length > 0) parsedOptions = altOpts;
        }
      } catch(e) {
        console.error("Erro ao fazer parse dos blocos:", e);
      }
      
      if (parsedOptions.length === 0 && correctString) {
        parsedOptions = correctString.split(' ').map(w => w.trim()).filter(Boolean);
        parsedOptions.sort(() => Math.random() - 0.5);
      }

      const blocosFormatados = parsedOptions.map((texto, i) => ({
        id: `bloco-adapt-${i}`,
        texto: String(texto).trim()
      }));

      setBlocosDisponiveis(blocosFormatados);
      setBlocosMontados([]);
      
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
    } else {
      setLocalStatus(propStatus);
    }
  }, [propStatus]);

  useEffect(() => {
    async function carregarBlocosDoBanco() {
      if (initialExerciseData && (initialExerciseData.id || initialExerciseData.correct_answer)) {
        console.log("🔒 [MioloBlocos] MODO ADAPTATIVO ATIVO. Bloqueando busca generica. ExID:", initialExerciseData.id);
        setCarregando(false);
        return;
      }
      if (!unidadeAtiva) {
        console.log("🔍 [MioloBlocos.tsx] Aguardando UUID/UnidadeAtiva da Central...");
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

        const response = await getExerciseByActivityType(nomeUnidade, 5);
        const dados = (response && response.data) ? response.data : [];

        // Validação de erro tratada via response do centralService

        let gabaritoBruto = dados && dados.length > 0 ? (dados[0].correct_answer || "") : "";
        if (dados && dados.length > 0) {
          setFeedbackCorretoBanco(dados[0].correct_feedback || "");
          setFeedbackIncorretoBanco(dados[0].incorrect_feedback || "");
          if (dados[0]?.id) setExerciseId(String(dados[0].id));
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
      if (onValidateResult) {
          const blocosEsperados = (fraseOriginalGabarito || gabaritoFrase).trim().split(/\s+/).filter(Boolean);
          const blocosAluno = blocosMontados.map(b => b.texto.trim()).filter(Boolean);
          let acertos = 0;
          blocosEsperados.forEach((blocoEsp, idx) => {
            if (blocosAluno[idx] && blocosAluno[idx].toLowerCase() === blocoEsp.toLowerCase()) {
              acertos++;
            }
          });
          const nota = blocosEsperados.length > 0 ? Number(((acertos / blocosEsperados.length) * 10).toFixed(1)) : (resultado.acertou ? 10 : 0);
          const aprovado = nota >= 6;
          const textoMentora1 = aprovado ? (incentivoCorretoBanco || "Excelente montagem de sentença!") : (incentivoIncorretoBanco || "Atenção à ordem sintática dos blocos.");
          onValidateResult(aprovado, textoMentora1, nota, exerciseId || unidadeAtiva);
        }
    } catch (e) {
      const fraseMontadaAlunoLimpa = blocosMontados.map(b => b.texto).join(" ").trim().toLowerCase();
      const acertou = fraseMontadaAlunoLimpa === gabaritoFrase;
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? (feedbackCorretoBanco || "Excelente ordenação de sintaxe!") : (feedbackIncorretoBanco || "A estrutura dos blocos possui desvios de ordem sintática."));
      if (onValidateResult) {
          const blocosEsperados = (fraseOriginalGabarito || gabaritoFrase).trim().split(/\s+/).filter(Boolean);
          const blocosAluno = blocosMontados.map(b => b.texto.trim()).filter(Boolean);
          let acertos = 0;
          blocosEsperados.forEach((blocoEsp, idx) => {
            if (blocosAluno[idx] && blocosAluno[idx].toLowerCase() === blocoEsp.toLowerCase()) {
              acertos++;
            }
          });
          const nota = blocosEsperados.length > 0 ? Number(((acertos / blocosEsperados.length) * 10).toFixed(1)) : (acertou ? 10 : 0);
          const aprovado = nota >= 6;
          const textoMentora2 = aprovado ? (incentivoCorretoBanco || "Excelente montagem de sentença!") : (incentivoIncorretoBanco || "Atenção à ordem sintática dos blocos.");
          onValidateResult(aprovado, textoMentora2, nota, exerciseId || unidadeAtiva);
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
    <div className="w-full h-full flex flex-col font-sans flex-1 min-h-0 gap-5 p-2 overflow-hidden select-none">
      
      {/* BARRA SUPERIOR DE INSTRUÇÃO */}
      <div className="flex items-center gap-2 shrink-0 px-1">
        <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
        <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest">
          {t.instrucao}
        </span>
      </div>

      {/* ÁREA DE CONSTRUÇÃO DE FRASES (DROP ZONE) */}
      <div className={`w-full p-4 rounded-xl flex flex-wrap content-start gap-3 items-center transition-all duration-300 min-h-[140px] shadow-inner ${exibirContainerInferior ? "hidden" : ""} ${
        localStatus === "CORRECT" ? "bg-emerald-950/20 border border-emerald-500/30" :
        localStatus === "WRONG" ? "bg-rose-950/20 border border-rose-500/30" :
        "bg-[#0a1120]/60 border-2 border-dashed border-slate-700/50"
      }`}>
        {blocosMontados.length === 0 && (
          <div className="w-full h-full flex items-center justify-center pointer-events-none opacity-40">
            <span className="text-slate-400 text-[13px] md:text-[15px] font-medium tracking-wide">
              {t.placeholder}
            </span>
          </div>
        )}
        {blocosMontados.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => handlePull(b)}
            disabled={localStatus !== "IDLE" || analisando}
            className="px-5 py-2.5 bg-[#FF7420] hover:bg-[#FF8A2B] text-white text-[clamp(14px,1.6vw,16px)] font-bold rounded-lg shadow-[0_4px_0_0_#c45513] active:shadow-[0_0px_0_0_#c45513] active:translate-y-[4px] transition-all whitespace-nowrap cursor-pointer"
          >
            {b.texto}
          </button>
        ))}
      </div>

      {/* BANCO DE BLOCOS DISPONÍVEIS */}
      <div className={`flex flex-wrap gap-3 w-full p-5 bg-[#0a1120]/80 border border-slate-800/80 rounded-xl justify-center items-center shrink-0 min-h-[100px] overflow-y-auto shadow-sm ${exibirContainerInferior ? "hidden" : ""}`}>
        {blocosDisponiveis.map((b) => (
          <button
            key={b.id}
            type="button"
            disabled={localStatus !== "IDLE" || analisando}
            onClick={() => handlePush(b)}
            className="px-5 py-2.5 bg-[#070d19] hover:bg-[#13233f] border border-slate-700/80 hover:border-slate-500 text-slate-200 text-[clamp(14px,1.6vw,16px)] font-medium rounded-lg cursor-pointer transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            {b.texto}
          </button>
        ))}
      </div>

      {/* CONTAINER DE VALIDAÇÃO E FEEDBACK DA MENTORA (EM CAMADAS) */}
      {exibirContainerInferior && (
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in p-2">
          {analisando && (
            <div className="w-full max-w-2xl bg-[#070d19]/90 border border-cyan-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.12)] gap-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[13px] uppercase tracking-widest">
                <Sparkles size={16} className="animate-spin" />
                <span>Mentora Haas</span>
              </div>
              <p className="text-[16px] text-slate-300 font-medium italic">"{t.validando}"</p>
            </div>
          )}

          {localStatus === 'CORRECT' && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#070d19]/90 border border-emerald-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(16,185,129,0.12)] gap-3">
              <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-bold uppercase tracking-widest">
                <CheckCircle size={16} /> <span>Gramática Correta!</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#070d19]/90 border border-rose-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(244,63,94,0.12)] gap-3">
              <div className="flex items-center gap-2 text-rose-400 text-[13px] font-bold uppercase tracking-widest">
                <XCircle size={16} /> <span>Análise de Sintaxe</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
