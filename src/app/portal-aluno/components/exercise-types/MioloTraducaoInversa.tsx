"use client";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Sparkles, Send, Trophy, ArrowRight, HelpCircle } from 'lucide-react';

interface PieceItem {
  id: number;
  text: string;
}

interface MioloProps {
  initialExerciseData?: any;
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
  nivelAtivo?: string;
  streak?: number;
  getMultiplicador?: () => number;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "TRADUCE LA FRASE SELECCIONANDO LOS BLOQUES:",
    validando: "Analizando...",
    validar: "Validar Respuesta",
    refazer: "Reiniciar",
    aguardando: "Selecciona bloques abajo...",
    sucesso: "¡Estructura Correcta!",
    erro: "Ajuste Necesario",
    avancar: "Avanzar a la Próxima Misión"
  },
  en: {
    instrucao: "TRANSLATE THE SENTENCE BY SELECTING THE BLOCKS:",
    validando: "Analyzing...",
    validar: "Validate",
    refazer: "Reset",
    aguardando: "Select blocks below...",
    sucesso: "Correct Structure!",
    erro: "Adjustment Required",
    avancar: "Advance Mission"
  },
  pt: {
    instrucao: "TRADUZA A FRASE SELECIONANDO OS BLOCOS:",
    validando: "Analisando...",
    validar: "Validar Resposta",
    refazer: "Tentar de Novo",
    aguardando: "Selecione os blocos abaixo...",
    sucesso: "Estrutura Correta!",
    erro: "Ajuste Necessário",
    avancar: "Avançar para Próxima Missão"
  }
};

export default function MioloTraducaoInversa({onSelectionChange,
  onValidateResult,
  status = 'IDLE',
  unidadeAtiva,
  nivelAtivo,
streak = 0,
  getMultiplicador
, initialExerciseData}: MioloProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
  const [listaExercicios, setListaExercicios] = useState<any[]>([]);
  const [fraseMatrizPT, setFraseMatrizPT] = useState("Carregando desafio...");
  const [stringAlvoCorreta, setStringAlvoCorreta] = useState("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [initialPieces, setInitialPieces] = useState<string[]>([]);
  const [exerciseId, setExerciseId] = useState("");

  const [bankPieces, setBankPieces] = useState<PieceItem[]>([]);
  const [depositPieces, setDepositPieces] = useState<PieceItem[]>([]);
  
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);

  const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
  // USER_ID_ALVO dinamico via useAuth

  const obterLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoesAbas[obterLangKey()] || traducoesAbas["es"];

  useEffect(() => {
    async function carregarExerciciosDoBanco() {
      if (!unidadeAtiva) {
        console.log("🔍 [MioloTraducaoInversa.tsx] Aguardando UUID/UnidadeAtiva da Central...");
        return;
      }
      try {
        let userDados = [];
        if (USER_ID_ALVO && USER_ID_ALVO !== "undefined" && String(USER_ID_ALVO).trim() !== "") {
          if (!USER_ID_ALVO || USER_ID_ALVO === "undefined" || USER_ID_ALVO === "null") {
          console.warn("⚠️ USER_ID_ALVO ainda nao inicializado. Abortando busca em users.");
          return;
        }
        const userRes = await fetch(`${SUPABASE_URL}/users?id=eq.${USER_ID_ALVO}`, {
            headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` }
          });
          if (userRes.ok) {
            userDados = await userRes.json();
          }
        }
        
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }

        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined" || nomeUnidade.includes("Primeiro Impacto")) {
          nomeUnidade = "1.1";
        }
        const isUUIDUnit = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);
        const unitParam = isUUIDUnit ? `unit_id=eq.${encodeURIComponent(nomeUnidade)}` : `unit=eq.${encodeURIComponent(nomeUnidade)}`;
        let dadoExercicio = null;
          // --- BYPASS: USA DADOS DA ARENA SE EXISTIREM ---
          if (initialExerciseData && (initialExerciseData.id || initialExerciseData.reading_text || initialExerciseData.correct_answer || initialExerciseData.audio_transcript)) {
            console.log("🔒 [TRADUÇÃO INVERSA] Usando dados da Arena:", initialExerciseData.id);
            dadoExercicio = initialExerciseData;
          } else {
            const url = `${SUPABASE_URL}/exercises?${unitParam}&activity_type=eq.12&limit=1`;
            const res = await fetch(url, {
              headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` }
            });
            if (res.ok) {
              const dados = await res.json();
              if (dados && dados.length > 0) {
                dadoExercicio = dados[0];
              }
            }
          }
          // ------------------------------------------------
        
        // Replaced by Bypass

        let textoOriginal = dadoExercicio?.reading_text || dadoExercicio?.texto || "";
        let respostaCerta = dadoExercicio?.correct_answer || dadoExercicio?.correta || "";

        if (!textoOriginal || !respostaCerta || textoOriginal.trim().length < 3) {
          textoOriginal = "Olá! Como você está?";
          respostaCerta = "Hello! How are you?";
        }
        
        setFraseMatrizPT(textoOriginal);
        setStringAlvoCorreta(respostaCerta);
        setFeedbackCorretoBanco(dadoExercicio?.correct_feedback || "");
        setFeedbackIncorretoBanco(dadoExercicio?.incorrect_feedback || "");
        setIncentivoCorretoBanco(dadoExercicio?.correct_incentive || "");
        setIncentivoIncorretoBanco(dadoExercicio?.incorrect_incentive || "");
        if (dadoExercicio?.id) setExerciseId(String(dadoExercicio.id));

        const extrairPalavrasLimpas = (txt: string) => {
          if (!txt) return [];
          return txt
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿!¡"]/g, "")
            .split(/\s+/)
            .map(s => s.trim())
            .filter(Boolean);
        };

        const puras = extrairPalavrasLimpas(respostaCerta);
        let dists: string[] = [];
        
        const altOpts = dadoExercicio?.alternative_options;
        if (altOpts) {
          if (Array.isArray(altOpts)) {
            altOpts.forEach(item => {
              dists = dists.concat(extrairPalavrasLimpas(String(item)));
            });
          } else if (typeof altOpts === 'string') {
            try {
              const parsed = JSON.parse(altOpts);
              if (Array.isArray(parsed)) {
                parsed.forEach(item => { dists = dists.concat(extrairPalavrasLimpas(String(item))); });
              } else {
                dists = extrairPalavrasLimpas(altOpts);
              }
            } catch (e) {
              const separadores = altOpts.includes("/") ? altOpts.split("/") : altOpts.split(",");
              separadores.forEach(s => { dists = dists.concat(extrairPalavrasLimpas(s)); });
            }
          }
        }
        
        const todas = [...puras, ...dists]
          .map(w => w.toLowerCase())
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort(() => Math.random() - 0.5);

        setBankPieces(todas.map((txt, i) => ({ id: i, text: txt })));
        setDepositPieces([]);
        setLocalStatus('IDLE');
        setFeedbackIA("");
      } catch (err) {
        console.error(err);
      }
    }
    carregarExerciciosDoBanco();
  }, [unidadeAtiva, nivelAtivo]);

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
    } catch (e) {
      console.warn("Erro ao reproduzir clique sintetico:", e);
    }
  };

  const handlePushToDeposit = (piece: PieceItem) => {
    if (localStatus !== 'IDLE' || analisando) return;
    dispararSomClique();
    setBankPieces(prev => prev.filter(p => p.id !== piece.id));
    setDepositPieces(prev => [...prev, piece]);
  };

  const handlePullToBank = (piece: PieceItem) => {
    if (localStatus !== 'IDLE' || analisando) return;
    dispararSomClique();
    setDepositPieces(prev => prev.filter(p => p.id !== piece.id));
    setBankPieces(prev => [...prev, piece]);
  };

  const executarValidacaoInterna = async () => {
    if (depositPieces.length === 0 || analisando || localStatus !== "IDLE") return;
    setAnalisando(true);
    
    const fraseMontada = depositPieces.map(p => p.text.trim()).join(" ").toLowerCase().trim();
    const respostaCorretaPadrao = stringAlvoCorreta.toLowerCase().trim();

    const limpar = (txt) => txt.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿!¡"]/g, "").replace(/\s+/g, " ").trim();

    const respostaMontadaLimpa = limpar(fraseMontada);
    const respostaCorretaLimpa = limpar(respostaCorretaPadrao);

    const palavrasGabarito = respostaCorretaLimpa.split(/\s+/).filter(Boolean);
      const palavrasAluno = depositPieces.map(p => limpar(p.text.toLowerCase().trim())).filter(Boolean);
      let acertos = 0;
      palavrasGabarito.forEach((palavra, idx) => {
        if (palavrasAluno[idx] && palavrasAluno[idx] === palavra) acertos++;
      });
      const nota = palavrasGabarito.length > 0 ? Number(((acertos / palavrasGabarito.length) * 10).toFixed(1)) : 0;
      const acertou = nota >= 6;

    try {
      if (acertou) {
        setLocalStatus("CORRECT");
        setFeedbackIA(feedbackCorretoBanco || "Excelente! Tradução perfeita.");
        const textoMentora = incentivoCorretoBanco || "Excelente! Tradução perfeita.";
        if (onValidateResult) onValidateResult(true, textoMentora, nota, exerciseId || unidadeAtiva);
      } else {
        setLocalStatus("WRONG");
        setFeedbackIA(feedbackIncorretoBanco || `Quase lá! A tradução esperada é: "${stringAlvoCorreta}"`);
        const textoMentora = incentivoIncorretoBanco || "Quase lá! Atenção aos detalhes na tradução.";
        if (onValidateResult) onValidateResult(false, textoMentora, nota, exerciseId || unidadeAtiva);
      }
    } catch (e) {
      console.error("Erro na validação:", e);
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
  }, [depositPieces, bankPieces, localStatus, analisando, fraseMatrizPT, stringAlvoCorreta]);

  return (
    <div className="w-full h-full flex flex-col font-sans select-none gap-5 p-2 overflow-hidden flex-1 min-h-0">
      
      {/* INSTRUÇÃO MINIMALISTA */}
      <div className="flex items-center gap-2 shrink-0 px-1">
        <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
        <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest">
          {t.instrucao}
        </span>
      </div>

      {/* CARD DA FRASE DE REFERÊNCIA */}
      <div className="bg-[#0a1120]/80 border border-slate-700/50 rounded-xl p-5 shadow-sm shrink-0 flex items-center justify-center min-h-[90px]">
        <p className="text-[clamp(17px,2.2vw,22px)] font-bold leading-relaxed text-slate-100 w-full break-words text-center tracking-wide">
          "{fraseMatrizPT}"
        </p>
      </div>

      {/* ÁREA DE DEPÓSITO (Drop Zone Premium) */}
      <div className={`w-full min-h-[110px] bg-[#0a1120]/60 border-2 border-dashed border-slate-700/50 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-center shadow-inner transition-all duration-300 ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {depositPieces.length === 0 ? (
          <span className="text-[13px] md:text-[15px] text-slate-500 font-medium tracking-wide pointer-events-none text-center">
            {t.aguardando}
          </span>
        ) : (
          depositPieces.map((piece) => (
            <button
              key={piece.id}
              type="button"
              disabled={localStatus !== 'IDLE' || analisando}
              onClick={() => handlePullToBank(piece)}
              className="px-5 py-2.5 bg-[#8b5cf6] hover:bg-[#a855f7] text-white font-semibold rounded-lg text-[clamp(14px,1.6vw,17px)] cursor-pointer shadow-[0_4px_0_0_#4c1d95] active:shadow-none active:translate-y-[4px] transition-all whitespace-nowrap"
            >
              {piece.text}
            </button>
          ))
        )}
      </div>

      {/* BANCO DE BLOCOS DISPONÍVEIS */}
      <div className={`w-full flex flex-wrap gap-3 py-2 items-center justify-center shrink-0 min-h-[90px] p-4 bg-[#070d19]/60 border border-slate-800/80 rounded-xl ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {bankPieces.map((piece) => (
          <button
            key={piece.id}
            type="button"
            disabled={localStatus !== 'IDLE' || analisando}
            onClick={() => handlePushToDeposit(piece)}
            className="px-5 py-2.5 bg-[#13233f] hover:bg-[#1a2f55] hover:border-slate-500 border border-slate-600/50 text-slate-200 font-medium rounded-lg text-[clamp(14px,1.6vw,17px)] cursor-pointer shadow-sm active:scale-95 transition-all whitespace-nowrap"
          >
            {piece.text}
          </button>
        ))}
      </div>

      {/* CONTAINER DE VALIDAÇÃO E FEEDBACK DA MENTORA (EM CAMADAS) */}
      {(localStatus !== 'IDLE' || analisando) && (
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
                <CheckCircle size={16} /> <span>Estrutura Correta!</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#070d19]/90 border border-rose-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(244,63,94,0.12)] gap-3">
              <div className="flex items-center gap-2 text-rose-400 text-[13px] font-bold uppercase tracking-widest">
                <XCircle size={16} /> <span>Análise de Tradução</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
