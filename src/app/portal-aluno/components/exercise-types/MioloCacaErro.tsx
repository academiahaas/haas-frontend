"use client";
import { supabase } from "@/lib/supabase";
import { chamarGeminiInteligente } from './geminiService';
import React, { useState, useEffect } from "react";
import { registrarFeedbackEErro } from "@/utils/motorResiliencia";
import { CheckCircle, XCircle, Sparkles, Send, HelpCircle } from "lucide-react";

interface MioloProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean) => void;
  status?: "IDLE" | "CORRECT" | "WRONG";
  unidadeAtiva?: string;
}

interface OpcaoJogo {
  texto: string;
  isCorreta: boolean;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Analise as opções e selecione a alternativa correta em português:",
    validando: "Analizando respuesta...",
    validar: "Validar Resposta",
    aguardando: "Cargando desafío..."
  },
  en: {
    instrucao: "Analise as opções e selecione a alternativa correta em português:",
    validando: "Analyzing response...",
    validar: "Validate Answer",
    aguardando: "Loading challenge..."
  },
  pt: {
    instrucao: "Analise as opções e selecione a alternativa correta em português:",
    validando: "Analisando resposta...",
    validar: "Validar Resposta",
    aguardando: "Carregando desafio..."
  }
};

export default function MioloCacaErro({ onSelectionChange, onValidateResult, status = "IDLE", unidadeAtiva }: MioloProps) {
  const [opcoes, setOpcoes] = useState<OpcaoJogo[]>([]);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [localStatus, setLocalStatus] = useState<"IDLE" | "CORRECT" | "WRONG">("IDLE");
  const [isShortText, setIsShortText] = useState(true);
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [correctOption, setCorrectOption] = useState<string>("");

  useEffect(() => {
    const escutarSubmitGlobal = () => {
      executarValidacaoInterna();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [selecionado, analisando, correctOption]);

  const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1/exercises";
  const SUPABASE_USER_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1/users";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
  const USER_ID_ALVO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

  const obterLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoesAbas[obterLangKey()];

  const higienizarTexto = (raw: string): string => {
    let limpo = raw.trim();
    return limpo.replace(/^["'\s“‘]+|["'\s”’]+$/g, "").replace(/```json/g, "").replace(/```/g, "").trim();
  };

  useEffect(() => {
    async function carregarDadosCompletos() {
      try {
        setCarregando(true);

        try {
          const resUser = await fetch(`${SUPABASE_USER_URL}?id=eq.${USER_ID_ALVO}&select=native_language`, {
            headers: { "apikey": SERVICE_KEY, "Authorization": "Bearer " + SERVICE_KEY }
          });
          const userDados = await resUser.json();
          if (userDados && userDados.length > 0) {
            setIdiomaNativoAluno(userDados[0].native_language || "Español");
          }
        } catch (e) { console.error("Erro idioma:", e); }

        let nomeUnidade = unidadeAtiva;
        if (!nomeUnidade || nomeUnidade === "0" || nomeUnidade === "1" || nomeUnidade === "undefined" || nomeUnidade.includes("Labirinto") || nomeUnidade.includes("Primeiro")) {
          nomeUnidade = "1.1";
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nomeUnidade);

        let query = supabase.from("exercises").select("*").eq("activity_type", 2);
        if (isUUID) {
          query = query.eq("unit_id", nomeUnidade);
        } else {
          query = query.eq("unit", nomeUnidade);
        }

        const { data: dados, error: errorCaca } = await query.limit(1);
        console.log("🔍 [PROVA REAL CAÇA ERRO] Dados retornados do Supabase:", { dados, error: errorCaca });

        if (dados && dados.length > 0) {
          const exe = dados[0];
          
          // No Caça Erro (Tipo 2), "correct_answer" guarda o gabarito (frase errada que o aluno deve caçar)
          const fraseComErro = exe.correct_answer || "";
          setCorrectOption(fraseComErro);
          
          let distratoresFinais: string[] = [];
          if (exe.alternative_options) {
            if (Array.isArray(exe.alternative_options)) {
              distratoresFinais = exe.alternative_options;
            } else {
              try {
                const cache = JSON.parse(exe.alternative_options);
                if (Array.isArray(cache)) {
                  distratoresFinais = cache.map((item: any) => item.t || item.texto || item).filter(Boolean);
                }
              } catch(e) {
                distratoresFinais = [];
              }
            }
          }

          // Define fraseCorreta (baseline limpo) a partir das alternativas corretas para manter o Gemini funcionando
          const fraseCorreta = distratoresFinais[0] || "";

          // Monta a lista unificada contendo a frase errada (alvo) e as frases sem erro
          let listaUnificada = Array.from(new Set([fraseComErro, ...distratoresFinais])).filter(Boolean);

          if (listaUnificada.length === 3) {
            try {
              const promptQuarta = `Com base na frase correta "${fraseCorreta}", gere um distrator gramatical incorreto plausível em português de no máximo 8 palavras. Retorne ESTRITAMENTE um objeto JSON no formato: {"texto": "frase incorreta aqui"}`;
              // 🧠 Pool de chaves gratuito com rodízio automático
              const textoQuartaGerada = await chamarGeminiInteligente(promptQuarta);
              const dataQuarta = { candidates: [{ content: { parts: [{ text: textoQuartaGerada }] } }] };
              const resQuarta = { ok: true, json: async () => dataQuarta };
              
              let inseridoComSucesso = false;
              if (resQuarta.ok) {
                const qData = await resQuarta.json();
                let textoCru = qData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
                let textoFinalOpcao = "";
                
                try {
                  let limpado = textoCru.replace("```json", "").replace("```", "").trim();
                  let parsedQuarta = JSON.parse(limpado);
                  if (parsedQuarta && parsedQuarta.texto) textoFinalOpcao = parsedQuarta.texto.trim();
                } catch(jsonErr) {
                  textoFinalOpcao = textoCru.replace("```json", "").replace("```", "").trim();
                }

                if (textoFinalOpcao && textoFinalOpcao.length > 2 && !listaUnificada.includes(textoFinalOpcao)) {
                  listaUnificada.push(textoFinalOpcao);
                  inseridoComSucesso = true;
                }
              }
              
              if (!inseridoComSucesso) {
                // Força um distrator sintático básico garantindo que ele não colida com o Set
                listaUnificada.push(fraseCorreta + " modificada.");
              }
            } catch (e) {
              listaUnificada.push(fraseCorreta + " incorreta.");
            }
          }

          // Remove duplicadas absolutas geradas por fallbacks ou IA antes de limitar o array
          const listaLimpaSemDuplicadas = Array.from(new Set(listaUnificada)).filter(Boolean);
          const listaFinal = listaLimpaSemDuplicadas.slice(0, 4);
          
          const opcoesMontadas = listaFinal.map(texto => ({
            texto,
            isCorreta: texto === fraseCorreta
          }));

          opcoesMontadas.sort(() => Math.random() - 0.5);
          setOpcoes(opcoesMontadas);

          const maiorTexto = listaFinal.reduce((max, current) => current.length > max.length ? current : max, "");
          setIsShortText(maiorTexto.length < 25);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDadosCompletos();
  }, [unidadeAtiva]);

  useEffect(() => {
    if (status === "IDLE") {
      setLocalStatus("IDLE");
      setSelecionado(null);
      setFeedbackIA("");
    }
  }, [status]);

  const handleSelect = (texto: string) => {
    if (localStatus === "CORRECT" || analisando) return;
    setSelecionado(texto);
    setLocalStatus("IDLE");
    if (onSelectionChange) onSelectionChange(true);
  };

  const executarValidacaoInterna = async () => {
    if (!selecionado || analisando) return;
    setAnalisando(true);
    setFeedbackIA("");

    try {
      const resultado = await registrarFeedbackEErro({
        userId: USER_ID_ALVO,
        enunciado: "Exercício Caça-Erro: Identificar a frase gramaticalmente correta.",
        respostaCorreta: correctOption,
        respostaAluno: selecionado,
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? "CORRECT" : "WRONG");
      setFeedbackIA(resultado.feedback);
      if (onValidateResult) onValidateResult(resultado.acertou);
    } catch (e) {
      const acertou = selecionado === correctOption;
      setLocalStatus(acertou ? "CORRECT" : "WRONG");
      setFeedbackIA(acertou ? "Excelente escolha!" : "Esta opção contém um desvio estrutural.");
      if (onValidateResult) onValidateResult(acertou);
    } finally {
      setAnalisando(false);
    }
  };

  if (carregando) {
    return (
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-xs uppercase tracking-widest">
        {t?.aguardando || "CARREGANDO CHALLENGE..."}
      </div>
    );
  }

  const exibirContainerInferior = localStatus !== 'IDLE' || analisando;

  return (
    <div className="w-full h-full flex flex-col justify-between items-stretch text-left font-sans flex-1 min-h-0 gap-3 p-1">
      
      <div className="bg-[#070d19]/80 border border-white/[0.03] p-3 rounded-xl flex items-center gap-3 shrink-0">
        <HelpCircle size={15} className="text-cyan-400 shrink-0" />
        <p className="text-[clamp(11px,1.3vw,13px)] font-bold uppercase tracking-wider text-slate-300">
          {t.instrucao}
        </p>
      </div>

      <div className={`w-full flex-1 min-h-0 justify-stretch gap-2.5 ${isShortText ? "grid grid-cols-1 sm:grid-cols-2" : "flex flex-col"} ${localStatus !== "IDLE" || analisando ? "hidden" : ""}`}>
        {opcoes.map((op, idx) => {
          const isThisSelected = selecionado === op.texto;
          let optStyle = "border-slate-800/80 bg-[#04111C]/30 text-slate-300 hover:bg-[#1C3B50]/10";

          if (isThisSelected) {
            if (localStatus === "CORRECT") optStyle = "border-emerald-500 bg-emerald-950/20 text-emerald-400 font-black";
            else if (localStatus === "WRONG") optStyle = "border-rose-500 bg-rose-950/20 text-rose-400 font-black";
            else optStyle = "border-cyan-400 bg-cyan-950/30 text-cyan-400 font-black ring-1 ring-cyan-400/20";
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={localStatus === "CORRECT" || analisando}
              onClick={() => handleSelect(op.texto)}
              className={`w-full text-left py-3 px-4 rounded-xl border text-[clamp(14px,1.8vw,18px)] font-bold transition-all cursor-pointer flex items-center justify-start h-full leading-normal break-words ${optStyle}`}
            >
              <span className="leading-relaxed flex-1">{op.texto}</span>
            </button>
          );
        })}
      </div>

      {exibirContainerInferior && (
        <div className="w-full flex-1 flex flex-col justify-end mt-1 animate-fade-in">
          

          {analisando && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 animate-pulse min-h-[100px] md:min-h-[120px]">
              <div className="flex items-center gap-1.5 font-black text-[clamp(10px,1.2vw,12px)] uppercase tracking-wider mb-0.5">
                <Sparkles size={12} className="animate-spin" />
                <span>Inteligência Artificial</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-300 font-medium italic break-words w-full">"{t.validando}"</p>
            </div>
          )}

          {localStatus === "CORRECT" && feedbackIA && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl animate-fade-in min-h-[100px] md:min-h-[120px] gap-1.5">
              <div className="flex items-center gap-1 text-emerald-400 text-[clamp(11px,1.3vw,14px)] font-black uppercase tracking-wider">
                <CheckCircle size={12} /> <span>Excelente!</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === "WRONG" && feedbackIA && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl animate-fade-in min-h-[100px] md:min-h-[120px] gap-1.5">
              <div className="flex items-center gap-1 text-rose-400 text-[clamp(11px,1.3vw,14px)] font-black uppercase tracking-wider">
                <XCircle size={12} /> <span>Ajuste necessário</span>
              </div>
              <p className="text-[clamp(13px,1.6vw,16px)] text-slate-200 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
