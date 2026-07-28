"use client";
import { useAuth } from "@/contexts/AuthContext";
import { getExerciseByActivityType } from "@/services/centralService";
import { supabase } from "@/lib/supabase";
import { chamarGeminiInteligente } from './geminiService';
import React, { useState, useEffect } from "react";
import { registrarFeedbackEErro } from "@/utils/motorResiliencia";
import { CheckCircle, XCircle, Sparkles, Send, HelpCircle } from "lucide-react";

interface MioloProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: string;
  unidadeAtiva?: string;
}

interface OpcaoJogo {
  texto: string;
  isCorreta: boolean;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Encuentra el error: selecciona la opción que contiene el error:",
    validando: "Analizando respuesta...",
    validar: "Validar Resposta",
    aguardando: "Cargando desafío..."
  },
  en: {
    instrucao: "Find the mistake: select the option that contains the error:",
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

export default function MioloCacaErro({ onSelectionChange, onValidateResult, status, unidadeAtiva }: MioloProps) {
  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
  const [opcoes, setOpcoes] = useState<OpcaoJogo[]>([]);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);

  useEffect(() => {
    if (status === "CHECKING") {
      executarValidacaoInterna();
    }
  }, [status]);

  const [localStatus, setLocalStatus] = useState<"IDLE" | "CORRECT" | "WRONG">("IDLE");
  const [isShortText, setIsShortText] = useState(true);
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [correctOption, setCorrectOption] = useState<string>("");
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState("");
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");

  
  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        let unitParaBusca = "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0";
        if (unidadeAtiva && String(unidadeAtiva).trim() !== "0" && String(unidadeAtiva).length > 10) {
          unitParaBusca = String(unidadeAtiva);
        }

        console.log("🔍 [CAÇA ERRO RESOLVIDO] Buscando para UUID:", unitParaBusca);
        // Tenta buscar pelo tipo 2 (Caça Erro na SQL oficial) e fallback pro 7
        let res = await getExerciseByActivityType(unitParaBusca, 2);
        if (!res.success || !res.data || res.data.length === 0) {
          res = await getExerciseByActivityType(unitParaBusca, 7);
        }

        const dados = res.success && res.data ? res.data : [];

        if (dados.length > 0) {
          const exe = dados[0];
          if (exe.id) setExerciseId(exe.id);

          const respCorreta = exe.correct_answer || "";
          setCorrectOption(respCorreta);

          let optsDistracao: string[] = [];
          if (exe.alternative_options) {
            try {
              optsDistracao = typeof exe.alternative_options === "string" 
                ? JSON.parse(exe.alternative_options) 
                : exe.alternative_options;
            } catch (e) {
              console.warn("Aviso ao parsear alternative_options no Caça Erro:", e);
            }
          }

          // Junta a resposta que contém o erro com as opções de distração
          let todasOpcoes: string[] = [];
          if (respCorreta && !optsDistracao.includes(respCorreta)) {
            todasOpcoes = [respCorreta, ...optsDistracao];
          } else {
            todasOpcoes = optsDistracao;
          }

          // Mapeia garantindo o identificador da resposta que contém o erro
          if (todasOpcoes.length > 0) {
            const opcoesMapeadas: OpcaoJogo[] = todasOpcoes.map((texto: string) => ({
              texto,
              isCorreta: String(texto).trim().toLowerCase() === String(respCorreta).trim().toLowerCase()
            }));
            
            // Embaralha levemente para a correta não ficar sempre em primeiro
            const opcoesEmbaralhadas = [...opcoesMapeadas].sort(() => Math.random() - 0.5);
            setOpcoes(opcoesEmbaralhadas);
          }

          if (exe.correct_feedback) setFeedbackCorretoBanco(exe.correct_feedback);
          if (exe.incorrect_feedback) setFeedbackIncorretoBanco(exe.incorrect_feedback);
          if (exe.correct_incentive) setIncentivoCorretoBanco(exe.correct_incentive);
          if (exe.incorrect_incentive) setIncentivoIncorretoBanco(exe.incorrect_incentive);

        } else {
          console.warn("⚠️ Nenhum exercício do Caça Erro encontrado.");
        }
      } catch (err) {
        console.error("❌ Erro ao carregar Caça Erro:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [unidadeAtiva]);


  const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1/exercises";
  const SUPABASE_USER_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1/users";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
  // USER_ID_ALVO dinamico via useAuth

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
    async function carregar() {
      try {
        setCarregando(true);
        let unitParaBusca = "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0";
        if (unidadeAtiva && String(unidadeAtiva).trim() !== "0" && String(unidadeAtiva).length > 10) {
          unitParaBusca = String(unidadeAtiva);
        }

        console.log("🔍 [CAÇA ERRO RESOLVIDO] Buscando para UUID:", unitParaBusca);
        // Tenta buscar pelo tipo 2 (Caça Erro na SQL oficial) e fallback pro 7
        let res = await getExerciseByActivityType(unitParaBusca, 2);
        if (!res.success || !res.data || res.data.length === 0) {
          res = await getExerciseByActivityType(unitParaBusca, 7);
        }

        const dados = res.success && res.data ? res.data : [];

        if (dados.length > 0) {
          const exe = dados[0];
          if (exe.id) setExerciseId(exe.id);

          const respCorreta = exe.correct_answer || "";
          setCorrectOption(respCorreta);

          let optsDistracao: string[] = [];
          if (exe.alternative_options) {
            try {
              optsDistracao = typeof exe.alternative_options === "string" 
                ? JSON.parse(exe.alternative_options) 
                : exe.alternative_options;
            } catch (e) {
              console.warn("Aviso ao parsear alternative_options no Caça Erro:", e);
            }
          }

          // Junta a resposta que contém o erro com as opções de distração
          let todasOpcoes: string[] = [];
          if (respCorreta && !optsDistracao.includes(respCorreta)) {
            todasOpcoes = [respCorreta, ...optsDistracao];
          } else {
            todasOpcoes = optsDistracao;
          }

          // Mapeia garantindo o identificador da resposta que contém o erro
          if (todasOpcoes.length > 0) {
            const opcoesMapeadas: OpcaoJogo[] = todasOpcoes.map((texto: string) => ({
              texto,
              isCorreta: String(texto).trim().toLowerCase() === String(respCorreta).trim().toLowerCase()
            }));
            
            // Embaralha levemente para a correta não ficar sempre em primeiro
            const opcoesEmbaralhadas = [...opcoesMapeadas].sort(() => Math.random() - 0.5);
            setOpcoes(opcoesEmbaralhadas);
          }

          if (exe.correct_feedback) setFeedbackCorretoBanco(exe.correct_feedback);
          if (exe.incorrect_feedback) setFeedbackIncorretoBanco(exe.incorrect_feedback);
          if (exe.correct_incentive) setIncentivoCorretoBanco(exe.correct_incentive);
          if (exe.incorrect_incentive) setIncentivoIncorretoBanco(exe.incorrect_incentive);

        } else {
          console.warn("⚠️ Nenhum exercício do Caça Erro encontrado.");
        }
      } catch (err) {
        console.error("❌ Erro ao carregar Caça Erro:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [unidadeAtiva]);



  
  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        let unitParaBusca = "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0";
        if (unidadeAtiva && String(unidadeAtiva).trim() !== "0" && String(unidadeAtiva).length > 10) {
          unitParaBusca = String(unidadeAtiva);
        }

        console.log("🔍 [CAÇA ERRO RESOLVIDO] Buscando para UUID:", unitParaBusca);
        // Tenta buscar pelo tipo 2 (Caça Erro na SQL oficial) e fallback pro 7
        let res = await getExerciseByActivityType(unitParaBusca, 2);
        if (!res.success || !res.data || res.data.length === 0) {
          res = await getExerciseByActivityType(unitParaBusca, 7);
        }

        const dados = res.success && res.data ? res.data : [];

        if (dados.length > 0) {
          const exe = dados[0];
          if (exe.id) setExerciseId(exe.id);

          const respCorreta = exe.correct_answer || "";
          setCorrectOption(respCorreta);

          let optsDistracao: string[] = [];
          if (exe.alternative_options) {
            try {
              optsDistracao = typeof exe.alternative_options === "string" 
                ? JSON.parse(exe.alternative_options) 
                : exe.alternative_options;
            } catch (e) {
              console.warn("Aviso ao parsear alternative_options no Caça Erro:", e);
            }
          }

          // Junta a resposta que contém o erro com as opções de distração
          let todasOpcoes: string[] = [];
          if (respCorreta && !optsDistracao.includes(respCorreta)) {
            todasOpcoes = [respCorreta, ...optsDistracao];
          } else {
            todasOpcoes = optsDistracao;
          }

          // Mapeia garantindo o identificador da resposta que contém o erro
          if (todasOpcoes.length > 0) {
            const opcoesMapeadas: OpcaoJogo[] = todasOpcoes.map((texto: string) => ({
              texto,
              isCorreta: String(texto).trim().toLowerCase() === String(respCorreta).trim().toLowerCase()
            }));
            
            // Embaralha levemente para a correta não ficar sempre em primeiro
            const opcoesEmbaralhadas = [...opcoesMapeadas].sort(() => Math.random() - 0.5);
            setOpcoes(opcoesEmbaralhadas);
          }

          if (exe.correct_feedback) setFeedbackCorretoBanco(exe.correct_feedback);
          if (exe.incorrect_feedback) setFeedbackIncorretoBanco(exe.incorrect_feedback);
          if (exe.correct_incentive) setIncentivoCorretoBanco(exe.correct_incentive);
          if (exe.incorrect_incentive) setIncentivoIncorretoBanco(exe.incorrect_incentive);

        } else {
          console.warn("⚠️ Nenhum exercício do Caça Erro encontrado.");
        }
      } catch (err) {
        console.error("❌ Erro ao carregar Caça Erro:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [unidadeAtiva]);


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
        userId: USER_ID_ALVO || "anonymous-user",
        enunciado: "Exercício Caça-Erro: Identificar a frase gramaticalmente correta.",
        respostaCorreta: correctOption,
        respostaAluno: selecionado,
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? "CORRECT" : "WRONG");
      setFeedbackIA(resultado.acertou ? (feedbackCorretoBanco || resultado.feedback) : (feedbackIncorretoBanco || resultado.feedback));
      const textoMentora1 = resultado.acertou ? (incentivoCorretoBanco || "Excelente visão! Erro identificado.") : (incentivoIncorretoBanco || "Atenção à estrutura da frase.");
      if (onValidateResult) onValidateResult(resultado.acertou, textoMentora1, resultado.acertou ? 10 : 0, exerciseId || unidadeAtiva);
    } catch (e) {
      const acertou = selecionado === correctOption;
      setLocalStatus(acertou ? "CORRECT" : "WRONG");
      setFeedbackIA(acertou ? (feedbackCorretoBanco || "Excelente escolha!") : (feedbackIncorretoBanco || "Esta opção contém um desvio estrutural."));
      const textoMentora2 = acertou ? (incentivoCorretoBanco || "Excelente visão! Erro identificado.") : (incentivoIncorretoBanco || "Quase lá! Analise os trechos com cuidado.");
      if (onValidateResult) onValidateResult(acertou, textoMentora2, acertou ? 10 : 0, exerciseId || unidadeAtiva);
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
              onClick={() => { handleSelect(op.texto); setTimeout(() => { executarValidacaoInterna(); }, 50); }}
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
                <span>Mentora Haas</span>
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
