'use client';
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from 'react';
import { ArrowDown, CheckCircle, XCircle, Sparkles, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ParagrafoItem {
  id: number;
  text: string;
}

interface MioloReordenacaoProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
  unidadeAtiva?: string;
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
}: MioloReordenacaoProps) {
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [items, setItems] = useState<ParagrafoItem[]>([]);
  const [gabaritoIds, setGabaritoIds] = useState<number[]>([]);
  const [textoGabaritoInteiro, setTextoGabaritoInteiro] = useState("");
  
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [feedbackIA, setFeedbackIA] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const USER_ID_ALVO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

  const obtenerLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoesAbas[obtenerLangKey()] || traducoesAbas.es;

  useEffect(() => {
    if (propStatus === 'IDLE') {
      setLocalStatus('IDLE');
      setFeedbackIA('');
    } else {
      setLocalStatus(propStatus);
    }
  }, [propStatus]);

  useEffect(() => {
    async function carregarEFracionarTexto() {
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

        // Usa o código real da unidade (ex: "1.1") para cruzar com a coluna 'unit' do banco
        const codigoUnidade = unidadeAtiva;
        if (!codigoUnidade) {
          setCarregando(false);
          return;
        }
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codigoUnidade);
        
        let query = supabase.from('exercises').select('*').eq('activity_type', 8);
        
        if (isUUID) {
          query = query.eq('unit_id', codigoUnidade);
        } else {
          // Se for "0" ou "1" (valores de inicializacao temporarios), busca pela primeira unidade
          const unitFallback = (codigoUnidade === "0" || codigoUnidade === "1") ? "1.1" : codigoUnidade;
          query = query.eq('unit', unitFallback);
        }
        
        const { data: dados, error } = await query;

        if (error) throw error;

        let frasesOriginais: string[] = [];
        let exe = dados && dados.length > 0 ? dados[0] : null;

        // Tenta puxar de alternative_options ou correct_answer
        if (exe) {
          const altOpts = exe.alternative_options || exe.alternativas;
          const corrAns = exe.correct_answer;

          if (altOpts && Array.isArray(altOpts) && altOpts.length > 0) {
            frasesOriginais = altOpts.map(s => String(s).trim()).filter(Boolean);
          } else if (corrAns && typeof corrAns === 'string' && corrAns.includes('|')) {
            frasesOriginais = corrAns.split('|').map(s => s.trim()).filter(Boolean);
          }
        }

        // Validação de Emergência Dinâmica em Espanhol (nunca deixa a tela em branco se o registro no banco estiver nulo/vazio)
        if (frasesOriginais.length < 2) {
          console.warn("⚠️ [CONCURSO DE EMERGENCIA] Usando frases de segurança em espanhol.");
          frasesOriginais = [
            "Primero, abrimos la terminal de comandos para iniciar el sistema.",
            "Luego, ejecutamos el script de migración para sincronizar la base de datos.",
            "Finalmente, validamos si todos los registros fueron guardados con éxito."
          ];
        }

        setTextoGabaritoInteiro(frasesOriginais.join(" "));
        
        // Mapeia a ordem correta baseada no array original
        const itensMontados = frasesOriginais.map((txt, idx) => ({ id: idx + 1, text: txt }));
        setGabaritoIds(itensMontados.map(it => it.id));
        
        // Embaralha dinamicamente para o aluno ordenar
        setItems([...itensMontados].sort(() => Math.random() - 0.5));
        
        if (onSelectionChange) onSelectionChange(true);
      } catch (err) {
        console.error("Erro ao processar quebra do tipo 10:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarEFracionarTexto();
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

  const hackerValidarIA = async () => {
    if (localStatus !== 'IDLE' || items.length === 0 || analisando) return;
    setAnalisando(true);
    setFeedbackIA("");

    const sequenciaAluno = items.map(it => it.text).join(" ");

    try {
      const resultado = await registrarFeedbackEErro({
        userId: USER_ID_ALVO,
        enunciado: `Ejercicio de Reordenación - Unidad ${unidadeAtiva || "1.1"}`,
        respostaCorreta: textoGabaritoInteiro,
        respostaAluno: sequenciaAluno,
        idiomaNativoAluno: idiomaNativoAluno
      });

      setLocalStatus(resultado.acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(resultado.feedback);
      if (onValidateResult) onValidateResult(resultado.acertou, resultado.feedback);
    } catch (e) {
      const ordemAtualIds = items.map(it => it.id);
      const acertou = JSON.stringify(ordemAtualIds) === JSON.stringify(gabaritoIds);
      const msgFallback = acertou ? "¡Orden lógico validado con éxito!" : "La secuencia lógica posee detalles de cohesión por corregir.";
      
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      setFeedbackIA(msgFallback);
      if (onValidateResult) onValidateResult(acertou, msgFallback);
    } finally {
      setAnalisando(false);
    }
  };

  useEffect(() => {
    const escutarSubmitGlobal = () => {
      hackerValidarIA();
    };
    window.addEventListener("haas:validate", escutarSubmitGlobal);
    return () => window.removeEventListener("haas:validate", escutarSubmitGlobal);
  }, [items, localStatus, analisando, gabaritoIds, textoGabaritoInteiro]);

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
