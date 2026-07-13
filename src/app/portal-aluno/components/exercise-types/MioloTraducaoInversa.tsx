'use client';
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Sparkles, Send, Trophy, ArrowRight, BookOpen } from 'lucide-react';

interface PieceItem {
  id: number;
  text: string;
}

interface MioloProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
  streak?: number;
  getMultiplicador?: () => number;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Traduce la frase seleccionando los bloques:",
    validando: "Analizando...",
    validar: "Validar Respuesta",
    refazer: "Reiniciar",
    aguardando: "Selecciona bloques abajo...",
    sucesso: "¡Estructura Correcta!",
    erro: "Ajuste Necesario",
    avancar: "Avanzar a la Próxima Misión"
  },
  en: {
    instrucao: "Translate the sentence by selecting the blocks:",
    validando: "Analyzing...",
    validar: "Validate",
    refazer: "Reset",
    aguardando: "Select blocks below...",
    sucesso: "Correct Structure!",
    erro: "Adjustment Required",
    avancar: "Advance Mission"
  },
  pt: {
    instrucao: "Traduza a frase selecionando os blocos:",
    validando: "Analisando...",
    validar: "Validar Resposta",
    refazer: "Tentar de Novo",
    aguardando: "Selecione os blocos abaixo...",
    sucesso: "Estrutura Correta!",
    erro: "Ajuste Necessário",
    avancar: "Avançar para Próxima Missão"
  }
};

export default function MioloTraducaoInversa({
  onSelectionChange,
  onValidateResult,
  status = 'IDLE',
  unidadeAtiva,
  streak = 0,
  getMultiplicador
}: MioloProps) {
  const [listaExercicios, setListaExercicios] = useState<any[]>([]);
  const [fraseMatrizPT, setFraseMatrizPT] = useState("Carregando desafio...");
  const [stringAlvoCorreta, setStringAlvoCorreta] = useState("");
  const [initialPieces, setInitialPieces] = useState<string[]>([]);

  const [bankPieces, setBankPieces] = useState<PieceItem[]>([]);
  const [depositPieces, setDepositPieces] = useState<PieceItem[]>([]);
  
  // Controle de estado local para travar a tela de feedback micro sem fechar o exercício
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);

  const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
  const USER_ID_ALVO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

  const obterLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoesAbas[obterLangKey()] || traducoesAbas["es"];

  const multiplicadorAtivo = typeof getMultiplicador === 'function' ? getMultiplicador() : (streak >= 3 ? 1.5 : 1);
  const pontosGanhosCalculados = Math.round(25 * multiplicadorAtivo);

  useEffect(() => {
    async function carregarExerciciosDoBanco() {
      try {
        const userRes = await fetch(`${SUPABASE_URL}/users?id=eq.${USER_ID_ALVO}`, {
          headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` }
        });
        const userDados = await userRes.json();
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }

        const nomeUnidade = unidadeAtiva || "O Primeiro Impacto e as Vogais Fracas";
        const url = `${SUPABASE_URL}/exercises?unit=eq.${encodeURIComponent(nomeUnidade)}&activity_type=eq.12&limit=1`;
        
        const res = await fetch(url, {
          headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` }
        });
        
        let dadoExercicio = null;
        if (res.ok) {
          const dados = await res.json();
          if (dados && dados.length > 0) {
            dadoExercicio = dados[0];
            console.log("🔍 [RASTREAMENTO TRADUÇÃO INVERSA] Carregou Exercício ID:", dados[0]?.id, " | Unidade:", nomeUnidade);
          }
        }

        let textoOriginal = dadoExercicio?.reading_text || dadoExercicio?.texto || "";
        let respostaCerta = dadoExercicio?.correct_answer || dadoExercicio?.correta || "";

        // Validação de Emergência: Caso o banco retorne vazio ou colunas corrompidas
        if (!textoOriginal || !respostaCerta || textoOriginal.trim().length < 3) {
          console.warn("⚠️ [CONCURSO DE EMERGÊNCIA] Dados de Tradução Inversa corrompidos ou ausentes. Acionando IA...");
          const fraseMatrizGerada = await resilienciaTextoCompleto("", nomeUnidade + " - Frase Curta em Português");
          
          // Solicita a tradução correspondente ao motor central simulando o contexto inverso
          const traducaoAlvoGerada = await resilienciaTextoCompleto("", "Traduza estritamente para o inglês a frase: " + fraseMatrizGerada);
          
          textoOriginal = fraseMatrizGerada;
          respostaCerta = traducaoAlvoGerada;
        }
        
        setFraseMatrizPT(textoOriginal);
        setStringAlvoCorreta(respostaCerta);

        // Função interna para limpar pontuações e extrair palavras estritas de qualquer string
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
        
        // Junta tudo, padroniza minúsculas, remove duplicados e mistura os blocos de palavras unitárias
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

  const resetarJogo = () => {
    const todas = [...depositPieces, ...bankPieces].sort(() => Math.random() - 0.5);
    setBankPieces(todas);
    setDepositPieces([]);
    setLocalStatus('IDLE');
    setFeedbackIA("");
  };

  const executarValidacaoInterna = async () => {
    if (depositPieces.length === 0 || analisando || localStatus !== 'IDLE') return;
    setAnalisando(true);
    const fraseMontada = depositPieces.map(p => p.text).join(" ");

    try {
      const resultado = await registrarFeedbackEErro({
        userId: USER_ID_ALVO,
        enunciado: `Exercício de Tradução Inversa. Converter para o idioma alvo a frase: "${fraseMatrizPT}"`,
        respostaCorreta: stringAlvoCorreta,
        respostaAluno: fraseMontada,
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(resultado.feedback);
    } catch (e) {
      const acertou = fraseMontada.toLowerCase().trim() === stringAlvoCorreta.toLowerCase().trim();
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(acertou ? "Excelente! Tradução perfeita." : "Ordem dos blocos incorreta para o padrão corporativo.");
    } finally {
      setAnalisando(false);
    }
  };

  // O pai só é acionado aqui, quando o aluno revisa e clica no botão "Avançar" ou "Tentar de Novo" final
    useEffect(() => {
    const escutarSubmitGlobal = () => {
      executarValidacaoInterna();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [depositPieces, bankPieces, localStatus, analisando, fraseMatrizPT, stringAlvoCorreta]);

  const prosseguirParaProximoExercicio = () => {
    if (onValidateResult) {
      onValidateResult(localStatus === 'CORRECT');
    }
  };

  const fraseMontadaAtual = depositPieces.map(p => p.text).join(" ");

  return (
    <div className="w-full h-full flex flex-col justify-between text-left font-sans overflow-hidden select-none gap-3 p-1 flex-1 min-h-0">
      
      {/* 1. CARD DA FRASE ORIGINAL (Fluido e Responsivo) */}
      <div className="bg-[#070d19]/80 border border-white/[0.03] rounded-xl p-3 shadow-sm shrink-0">
        <div className="flex items-center gap-1.5 shrink-0 mb-1">
          <BookOpen size={13} className="text-cyan-400 shrink-0" />
          <span className="text-[clamp(13px,1.5vw,15px)] font-bold text-cyan-400 uppercase tracking-wider block">
            {t.instrucao}
          </span>
        </div>
        <p className="text-[clamp(16px,2.2vw,22px)] font-black leading-relaxed text-slate-100 w-full break-words text-center">
          "{fraseMatrizPT}"
        </p>
      </div>

      {/* 2. ÁREA DE DEPÓSITO DE BLOCOS (Crescimento orgânico e visível) */}
      <div className={`w-full min-h-[72px] md:min-h-[96px] bg-[#030712]/60 border border-dashed border-slate-800/80 rounded-xl p-3 flex flex-wrap gap-2 items-center justify-center shadow-inner overflow-visible ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {depositPieces.length === 0 ? (
          <span className="text-[clamp(10px,1.2vw,12px)] text-slate-600 uppercase font-black tracking-widest pointer-events-none">
            {t.aguardando}
          </span>
        ) : (
          depositPieces.map((piece) => (
            <button
              key={piece.id}
              disabled={localStatus !== 'IDLE' || analisando}
              onClick={() => handlePullToBank(piece)}
              className="px-4 py-2 bg-gradient-to-b from-cyan-400 to-cyan-500 text-slate-950 font-black rounded-xl text-[clamp(14px,2vw,18px)] cursor-pointer shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              {piece.text}
            </button>
          ))
        )}
      </div>

      {/* 3. BANCO DE BLOCOS PARA SELECIONAR */}
      <div className={`w-full flex flex-wrap gap-2 py-1 items-center justify-center shrink-0 ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {bankPieces.map((piece) => (
          <button
            key={piece.id}
            disabled={localStatus !== 'IDLE' || analisando}
            onClick={() => handlePushToDeposit(piece)}
            className="px-4 py-2.5 bg-[#1C3B50]/20 hover:bg-[#1C3B50]/40 text-slate-200 font-bold border border-slate-800/60 rounded-xl text-[clamp(14px,2vw,18px)] cursor-pointer active:scale-95 transition-all whitespace-nowrap"
          >
            {piece.text}
          </button>
        ))}
      </div>

      {/* 4. CONTAINER DE VALIDAÇÃO E COMENTÁRIO COMPLETAMENTE FLUIDO TELA CHEIA */}
      {(localStatus !== 'IDLE' || analisando) && (
        <div className="w-full flex-1 flex flex-col justify-end mt-0.5 animate-fade-in">
          
          {analisando && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 animate-pulse min-h-[120px]">
              <div className="flex items-center gap-1.5 font-black text-[clamp(10px,1.2vw,12px)] uppercase tracking-wider mb-0.5">
                <Sparkles size={12} className="animate-spin" />
                <span>Inteligência Artificial</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-300 font-medium italic break-words w-full">"{t.validando}"</p>
            </div>
          )}

          {localStatus !== 'IDLE' && feedbackIA && (
            <div className={`w-full flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl border animate-fade-in min-h-[120px] gap-1.5 ${
              localStatus === 'CORRECT' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-rose-950/20 border-rose-500/20 text-rose-400'
            }`}>
              <div className="flex items-center gap-1.5 font-black text-[clamp(10px,1.2vw,12px)] uppercase tracking-wider">
                {localStatus === 'CORRECT' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                <span>{localStatus === 'CORRECT' ? "Estrutura Correta!" : "Análise de Tradução"}</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}

        </div>
      )}


    </div>
  );
}
