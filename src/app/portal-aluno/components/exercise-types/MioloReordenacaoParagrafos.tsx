'use client';
import { useAuth } from "@/contexts/AuthContext";
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from 'react';
import { ArrowDown, CheckCircle, XCircle, Sparkles, HelpCircle } from 'lucide-react';
import { getExerciseByActivityType } from '@/services/centralService';
import { supabase } from '@/lib/supabase';

interface ParagrafoItem {
  id: number;
  text: string;
}

interface MioloReordenacaoProps {
  initialExerciseData?: any;
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
  nivelAtivo?: string;
}

const traducoesAbas: Record<string, Record<string, string>> = {
  es: {
    instrucao: "Coloque las frases del texto en la orden lógica:",
    validando: "Analizando...",
    validar: "Validar Respuesta",
    aguardando: "Cargando desafío..."
  },
  en: {
    instrucao: "Place the sentences of the text in logical order:",
    validando: "Analyzing...",
    validar: "Validate Answer",
    aguardando: "Loading challenge..."
  },
  pt: {
    instrucao: "Coloque as frases do texto na ordem lógica:",
    validando: "Analisando...",
    validar: "Validar Resposta",
    aguardando: "Carregando desafio..."
  }
};

export default function MioloReordenacaoParagrafos({
  onSelectionChange,
  onValidateResult,
  status: propStatus = 'IDLE',
  unidadeAtiva
, initialExerciseData}: MioloReordenacaoProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [items, setItems] = useState<ParagrafoItem[]>([]);
  const [gabaritoIds, setGabaritoIds] = useState<number[]>([]);
  const [textoGabaritoInteiro, setTextoGabaritoInteiro] = useState("");
  
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [dadosExercicio, setDadosExercicio] = useState<any>(null);

  // USER_ID_ALVO dinamico via useAuth

  const obtenerLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoesAbas[obtenerLangKey()] || traducoesAbas.es;

  
  
  
  useEffect(() => {
    async function carregar() {
      // --- BYPASS: USA DADOS DA ARENA SE EXISTIREM ---
      if (initialExerciseData && (initialExerciseData.id || initialExerciseData.options || initialExerciseData.correct_order)) {
        console.log("🔒 [MioloReordenacaoParagrafos] Usando dados da Arena:", initialExerciseData.id);
        
        setDadosExercicio(initialExerciseData);
        
        let frasesOriginais: string[] = [];
        const exe = initialExerciseData;
        
        if (exe.options) {
            try { frasesOriginais = typeof exe.options === "string" ? JSON.parse(exe.options) : exe.options; } catch(e){}
        } else if (exe.correct_order) {
            try { frasesOriginais = typeof exe.correct_order === "string" ? JSON.parse(exe.correct_order) : exe.correct_order; } catch(e){}
        } else if (exe.alternative_options) {
            try { frasesOriginais = typeof exe.alternative_options === "string" ? JSON.parse(exe.alternative_options) : exe.alternative_options; } catch(e){}
        } else if (exe.correct_answer) {
             frasesOriginais = String(exe.correct_answer).split("|").map((s: string) => s.trim());
        }

        if (Array.isArray(frasesOriginais) && frasesOriginais.length > 0) {
          const itemsMapeados: ParagrafoItem[] = frasesOriginais.map((text: string, idx: number) => ({ id: idx + 1, text }));
          setItems(itemsMapeados);
          setGabaritoIds(itemsMapeados.map(item => item.id));
          if (exe.correct_answer) setTextoGabaritoInteiro(exe.correct_answer);
        }
        
        setCarregando(false);
        return; // Aborta a busca por unidade
      }
      // ------------------------------------------------
      
      try {
        setCarregando(true);
          

          
        let unitParaBusca = (typeof window !== "undefined" ? (window as any).__dadosBanco?.current_unit_id : null);
          if (!unitParaBusca || unitParaBusca.length < 20) unitParaBusca = null;
        if (unidadeAtiva && String(unidadeAtiva).trim() !== "0" && String(unidadeAtiva).length > 10) {
          unitParaBusca = String(unidadeAtiva);
        }

        console.log("🔍 [REORDENACAO RESOLVIDA] Buscando para UUID:", unitParaBusca);
        const res = (initialExerciseData && (initialExerciseData.id || initialExerciseData.correct_order)) 
            ? { success: true, data: [initialExerciseData] } 
            : await getExerciseByActivityType(unitParaBusca, 8);
        const dados = res.success && res.data ? res.data : [];

        if (dados.length > 0) {
          const exe = dados[0];
          setDadosExercicio(exe);

          let frasesOriginais: string[] = [];

          // 1. Tenta extrair de alternative_options
          if (exe.alternative_options) {
            try {
              frasesOriginais = typeof exe.alternative_options === "string" 
                ? JSON.parse(exe.alternative_options) 
                : exe.alternative_options;
            } catch (e) {
              console.warn("Aviso ao parsear alternative_options:", e);
            }
          }

          // 2. Fallback para correct_answer se alternative_options for vazio
          if ((!frasesOriginais || frasesOriginais.length === 0) && exe.correct_answer) {
            frasesOriginais = String(exe.correct_answer).split("|").map((s: string) => s.trim());
          }

          // Mapeia para a interface ParagrafoItem
          if (Array.isArray(frasesOriginais) && frasesOriginais.length > 0) {
            const itemsMapeados: ParagrafoItem[] = frasesOriginais.map((text: string, idx: number) => ({
              id: idx + 1,
              text
            }));
            setItems(itemsMapeados);
            setGabaritoIds(itemsMapeados.map(item => item.id));
            if (exe.correct_answer) {
              setTextoGabaritoInteiro(exe.correct_answer);
            }
          }
        } else {
          console.warn("⚠️ Nenhum exercício do tipo 8 encontrado.");
        }
      } catch (err) {
        console.error("❌ Erro ao carregar Reordenação de Parágrafos:", err);
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
          

          
        let unitParaBusca = (typeof window !== "undefined" ? (window as any).__dadosBanco?.current_unit_id : null);
          if (!unitParaBusca || unitParaBusca.length < 20) unitParaBusca = null;
        if (unidadeAtiva && String(unidadeAtiva).trim() !== "0" && String(unidadeAtiva).length > 10) {
          unitParaBusca = String(unidadeAtiva);
        }

        console.log("🔍 [REORDENACAO RESOLVIDA] Buscando para UUID:", unitParaBusca);
        const res = (initialExerciseData && (initialExerciseData.id || initialExerciseData.correct_order)) 
            ? { success: true, data: [initialExerciseData] } 
            : await getExerciseByActivityType(unitParaBusca, 8);
        const dados = res.success && res.data ? res.data : [];

        if (dados.length > 0) {
          const exe = dados[0];
          setDadosExercicio(exe);

          let frasesOriginais: string[] = [];

          // 1. Tenta extrair de alternative_options
          if (exe.alternative_options) {
            try {
              frasesOriginais = typeof exe.alternative_options === "string" 
                ? JSON.parse(exe.alternative_options) 
                : exe.alternative_options;
            } catch (e) {
              console.warn("Aviso ao parsear alternative_options:", e);
            }
          }

          // 2. Fallback para correct_answer se alternative_options for vazio
          if ((!frasesOriginais || frasesOriginais.length === 0) && exe.correct_answer) {
            frasesOriginais = String(exe.correct_answer).split("|").map((s: string) => s.trim());
          }

          // Mapeia para a interface ParagrafoItem
          if (Array.isArray(frasesOriginais) && frasesOriginais.length > 0) {
            const itemsMapeados: ParagrafoItem[] = frasesOriginais.map((text: string, idx: number) => ({
              id: idx + 1,
              text
            }));
            setItems(itemsMapeados);
            setGabaritoIds(itemsMapeados.map(item => item.id));
            if (exe.correct_answer) {
              setTextoGabaritoInteiro(exe.correct_answer);
            }
          }
        } else {
          console.warn("⚠️ Nenhum exercício do tipo 8 encontrado.");
        }
      } catch (err) {
        console.error("❌ Erro ao carregar Reordenação de Parágrafos:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
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
      console.warn("Erro ao reproduzir som:", e);
    }
  };

  
  useEffect(() => {
    const handleGlobalValidate = () => {
      hackerValidarIA();
    };
    window.addEventListener("haas:validate", handleGlobalValidate);
    return () => {
      window.removeEventListener("haas:validate", handleGlobalValidate);
    };
  }, [items, dadosExercicio]);

  const moverItem = (index: number, direcao: "UP" | "DOWN") => {
    if (localStatus !== 'IDLE' || analisando) return;
    dispararSomClique();
    const novosItens = [...items];
    const destino = direcao === "UP" ? index - 1 : index + 1;
    if (destino < 0 || destino >= items.length) return;
    
    const [removido] = novosItens.splice(index, 1);
    novosItens.splice(destino, 0, removido);
    setItems(novosItens);
  };

  const hackerValidarIA = () => {
    if (localStatus !== "IDLE" || items.length === 0 || analisando) return;
    setAnalisando(true);
    setFeedbackIA("");

    const ordemAtualIds = items.map(it => it.id);
    let acertos = 0;
    const totalItems = gabaritoIds.length || 1;

    gabaritoIds.forEach((idEsperado, idx) => {
      if (ordemAtualIds[idx] && String(ordemAtualIds[idx]) === String(idEsperado)) {
        acertos++;
      }
    });

    const nota = Number(((acertos / totalItems) * 10).toFixed(1));
    const aprovado = nota >= 6;

    if (aprovado) {
      setLocalStatus("CORRECT");
      const feedbackTecnico = dadosExercicio?.correct_feedback || "¡Orden lógico validado con éxito!";
      const incentivoMentora = dadosExercicio?.correct_incentive || "";
      
      setFeedbackIA(feedbackTecnico);
      if (onValidateResult) onValidateResult(true, incentivoMentora || feedbackTecnico, nota, dadosExercicio?.id);
    } else {
      setLocalStatus("WRONG");
      const feedbackTecnico = dadosExercicio?.incorrect_feedback || "La secuencia lógica posee detalles de cohesión por corregir.";
      const incentivoMentora = dadosExercicio?.incorrect_incentive || "";
      
      setFeedbackIA(feedbackTecnico);
      if (onValidateResult) onValidateResult(false, incentivoMentora || feedbackTecnico, nota, dadosExercicio?.id);
    }

    setAnalisando(false);
  };

  
  
  
  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
          

          
        let unitParaBusca = (typeof window !== "undefined" ? (window as any).__dadosBanco?.current_unit_id : null);
          if (!unitParaBusca || unitParaBusca.length < 20) unitParaBusca = null;
        if (unidadeAtiva && String(unidadeAtiva).trim() !== "0" && String(unidadeAtiva).length > 10) {
          unitParaBusca = String(unidadeAtiva);
        }

        console.log("🔍 [REORDENACAO RESOLVIDA] Buscando para UUID:", unitParaBusca);
        const res = (initialExerciseData && (initialExerciseData.id || initialExerciseData.correct_order)) 
            ? { success: true, data: [initialExerciseData] } 
            : await getExerciseByActivityType(unitParaBusca, 8);
        const dados = res.success && res.data ? res.data : [];

        if (dados.length > 0) {
          const exe = dados[0];
          setDadosExercicio(exe);

          let frasesOriginais: string[] = [];

          // 1. Tenta extrair de alternative_options
          if (exe.alternative_options) {
            try {
              frasesOriginais = typeof exe.alternative_options === "string" 
                ? JSON.parse(exe.alternative_options) 
                : exe.alternative_options;
            } catch (e) {
              console.warn("Aviso ao parsear alternative_options:", e);
            }
          }

          // 2. Fallback para correct_answer se alternative_options for vazio
          if ((!frasesOriginais || frasesOriginais.length === 0) && exe.correct_answer) {
            frasesOriginais = String(exe.correct_answer).split("|").map((s: string) => s.trim());
          }

          // Mapeia para a interface ParagrafoItem
          if (Array.isArray(frasesOriginais) && frasesOriginais.length > 0) {
            const itemsMapeados: ParagrafoItem[] = frasesOriginais.map((text: string, idx: number) => ({
              id: idx + 1,
              text
            }));
            setItems(itemsMapeados);
            setGabaritoIds(itemsMapeados.map(item => item.id));
            if (exe.correct_answer) {
              setTextoGabaritoInteiro(exe.correct_answer);
            }
          }
        } else {
          console.warn("⚠️ Nenhum exercício do tipo 8 encontrado.");
        }
      } catch (err) {
        console.error("❌ Erro ao carregar Reordenação de Parágrafos:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [unidadeAtiva]);




  if (carregando) {
    return (
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[1.1vw] uppercase tracking-widest">
        {t?.aguardando || "CARREGANDO DESAFIO..."}
      </div>
    );
  }

  const exibirContainerInferior = localStatus !== 'IDLE' || analisando || !!feedbackIA;

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between items-stretch text-left font-sans flex-1 min-h-0 gap-2.5 p-0.5 overflow-hidden">
      
      <div className="flex items-center justify-between shrink-0 bg-[#070d19]/40 p-2.5 rounded-xl border border-white/[0.02]">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-cyan-400 shrink-0" />
          <span className="text-[13px] md:text-[1.1vw] font-bold text-slate-300 uppercase tracking-wider leading-snug">
            {t.instrucao}
          </span>
        </div>
      </div>

      {localStatus === 'IDLE' && !analisando && (
        <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 py-0.5">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between gap-4 bg-[#0c192e]/60 border px-4 rounded-xl transition-all h-full flex-1 min-h-0 max-h-[75px] py-2 border-white/[0.04] hover:border-white/[0.1]"
          >
            <p className="text-[14px] md:text-[1.1vw] lg:text-[1.15vw] text-slate-200 leading-relaxed font-semibold select-none break-words flex-1 line-clamp-2 md:line-clamp-3">
              {item.text}
            </p>

            <div className="flex flex-row gap-1.5 shrink-0 items-center justify-center">
              <button 
                type="button"
                onClick={() => moverItem(index, "UP")} 
                disabled={index === 0 || localStatus !== 'IDLE' || analisando} 
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-10 text-slate-300 rounded-lg cursor-pointer transition-all flex items-center justify-center w-[26px] h-[26px] md:w-[1.8vw] md:h-[1.8vw]"
              >
                <ArrowDown className="w-[12px] h-[12px] md:w-[0.9vw] md:h-[0.9vw] rotate-180" />
              </button>
              <button 
                type="button"
                onClick={() => moverItem(index, "DOWN")} 
                disabled={index === items.length - 1 || localStatus !== 'IDLE' || analisando} 
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-10 text-slate-300 rounded-lg cursor-pointer transition-all flex items-center justify-center w-[26px] h-[26px] md:w-[1.8vw] md:h-[1.8vw]"
              >
                <ArrowDown className="w-[12px] h-[12px] md:w-[0.9vw] md:h-[0.9vw]" />
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {exibirContainerInferior && (
        <div className="w-full flex-1 flex flex-col justify-center mt-0.5 animate-fade-in min-h-0 overflow-hidden">
          {analisando && (
            <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 bg-cyan-950/10 border border-cyan-500/15 rounded-xl animate-pulse p-8 min-h-0 overflow-hidden text-[13px] md:text-[1.2vw] text-cyan-400 font-bold tracking-widest uppercase">
              <Sparkles size={11} className="animate-spin text-cyan-400" /> <span>{t.validando}</span>
            </div>
          )}

          {localStatus === 'CORRECT' && feedbackIA && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center bg-emerald-950/20 border border-emerald-500/20 p-8 rounded-xl animate-fade-in min-h-0 overflow-hidden">
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] md:text-[1vw] font-black uppercase tracking-wider">
                <CheckCircle size={11} /> <span>Coerência Textual Perfeita!</span>
              </div>
              <p className="text-[11px] md:text-[1.1vw] text-slate-300 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 text-center bg-rose-950/20 border border-rose-500/20 p-8 rounded-xl animate-fade-in min-h-0 overflow-hidden">
              <div className="flex items-center gap-1 text-rose-400 text-[10px] md:text-[1vw] font-black uppercase tracking-wider">
                <XCircle size={11} /> <span>Análise de Coesão</span>
              </div>
              <p className="text-[11px] md:text-[1.1vw] text-slate-300 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
