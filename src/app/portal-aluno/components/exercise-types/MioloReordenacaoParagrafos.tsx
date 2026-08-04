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
    <div className="w-full h-full flex flex-col font-sans flex-1 min-h-0 gap-5 p-2 overflow-hidden select-none">
      
      {/* INSTRUÇÃO MINIMALISTA */}
      <div className="flex items-center gap-2 shrink-0 px-1">
        <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
        <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest">
          {t.instrucao}
        </span>
      </div>

      {/* LISTA DE PARÁGRAFOS INTERATIVA */}
      {!exibirContainerInferior && (
        <div className="flex-1 min-h-0 flex flex-col gap-3 py-1 overflow-y-auto pr-2">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="group flex items-center justify-between gap-4 bg-[#0a1120]/80 hover:bg-[#13233f] border border-slate-700/50 hover:border-cyan-500/30 p-3 rounded-xl transition-all shadow-sm"
            >
              {/* INDICADOR NUMÉRICO DE ORDEM */}
              <div className="flex items-center justify-center w-11 h-11 shrink-0 bg-[#070d19] border border-slate-800 rounded-lg text-cyan-500 font-black text-[15px] tracking-wider shadow-inner group-hover:border-cyan-900/50 group-hover:bg-cyan-950/20 transition-all select-none">
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* TEXTO DO PARÁGRAFO */}
              <p className="text-[clamp(14px,1.4vw,16px)] text-slate-200 leading-relaxed font-medium select-none flex-1">
                {item.text}
              </p>

              {/* CONTROLES DE DIREÇÃO APRIMORADOS */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => moverItem(index, "UP")} 
                  disabled={index === 0 || localStatus !== 'IDLE' || analisando} 
                  className="p-2.5 bg-[#070d19] hover:bg-cyan-700 disabled:opacity-20 disabled:hover:bg-[#070d19] border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-all flex items-center justify-center shadow-sm active:scale-95"
                  title="Mover para cima"
                >
                  <ArrowDown size={16} className="rotate-180" />
                </button>
                <button 
                  type="button"
                  onClick={() => moverItem(index, "DOWN")} 
                  disabled={index === items.length - 1 || localStatus !== 'IDLE' || analisando} 
                  className="p-2.5 bg-[#070d19] hover:bg-cyan-700 disabled:opacity-20 disabled:hover:bg-[#070d19] border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-all flex items-center justify-center shadow-sm active:scale-95"
                  title="Mover para baixo"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <CheckCircle size={16} /> <span>Coerência Textual Perfeita!</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full max-w-2xl bg-[#070d19]/90 border border-rose-500/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in shadow-[0_0_30px_rgba(244,63,94,0.12)] gap-3">
              <div className="flex items-center gap-2 text-rose-400 text-[13px] font-bold uppercase tracking-widest">
                <XCircle size={16} /> <span>Análise de Coesão</span>
              </div>
              <p className="text-[16px] text-slate-100 font-medium italic break-words leading-relaxed">"{feedbackIA}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
