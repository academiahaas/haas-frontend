'use client';
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect } from 'react';
import { ArrowDown, CheckCircle, XCircle, Sparkles, Send, HelpCircle } from 'lucide-react';
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

        const nomeUnidade = unidadeAtiva || "O Primeiro Impacto e as Vogais Fracas";
        
        const { data: dados, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('unit', nomeUnidade)
          .eq('activity_type', 10);

        if (error) throw error;

        let frasesOriginais: string[] = [];
        let exe = dados && dados.length > 0 ? dados[0] : null;

        if (exe) {
          const altOpts = exe.alternative_options || exe.alternativas;
          if (altOpts) {
            if (Array.isArray(altOpts)) {
              frasesOriginais = altOpts.map(s => String(s).trim()).filter(Boolean);
            } else if (typeof altOpts === 'string') {
              try {
                const parsed = JSON.parse(altOpts);
                if (Array.isArray(parsed)) {
                  frasesOriginais = parsed.map(s => String(s).trim()).filter(Boolean);
                } else {
                  frasesOriginais = String(altOpts).split('|').map(s => s.trim()).filter(Boolean);
                }
              } catch (e) {
                // Fallback para separadores comuns caso seja string pura
                const separador = altOpts.includes('|') ? '|' : altOpts.includes(';') ? ';' : ',';
                frasesOriginais = altOpts.split(separador).map(s => s.trim()).filter(Boolean);
              }
            }
          }
        }

        // Validação de Emergência se a coluna estiver vazia ou mal formada
        if (frasesOriginais.length < 2) {
          console.warn("⚠️ [CONCURSO DE EMERGÊNCIA] alternative_options corrompido ou ausente. Injetando bloco resiliente...");
          frasesOriginais = [
            "Primeiramente, abrimos o terminal de comando.",
            "Em seguida, executamos o script de migração do banco.",
            "Por fim, validamos se os logs foram salvos com sucesso."
          ];
        }

        setTextoGabaritoInteiro(frasesOriginais.join(" "));
        
        // Mapeia a ordem original como o gabarito oficial (1, 2, 3...)
        const itensMontados = frasesOriginais.map((txt, idx) => ({ id: idx + 1, text: txt }));
        setGabaritoIds(itensMontados.map(it => it.id));
        
        // Embaralha as frases na interface para o aluno resolver
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

  const moverItem = (index: number, direcao: "UP" | "DOWN") => {
    if (localStatus !== 'IDLE' || analisando) return;
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
        enunciado: "Exercício de Reordenação de Parágrafos e Coerência Narrativa.",
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
      const msgFallback = acertou ? "Sequência lógica textual validada com maestria!" : "A ordem cronológica das sentenças possui quebras de coesão.";
      
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
      
      {/* BARRA SUPERIOR DE INSTRUÇÃO */}
      <div className="flex items-center justify-between shrink-0 bg-[#070d19]/40 p-2.5 rounded-xl border border-white/[0.02]">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-cyan-400 shrink-0" />
          <span className="text-[13px] md:text-[1.1vw] font-bold text-slate-300 uppercase tracking-wider leading-snug">
            {t.instrucao}
          </span>
        </div>
      </div>

      {/* CONTAINER DOS CARDS COM ALINHAMENTO HORIZONTAL DE CONTROLES ANTIVAZAMENTO */}
      {localStatus === 'IDLE' && !analisando && (
        <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 py-0.5">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className={`flex items-center justify-between gap-4 bg-[#0c192e]/60 border px-4 rounded-xl transition-all h-full flex-1 min-h-0 max-h-[75px] py-2 ${
              
              'border-white/[0.04] hover:border-white/[0.1]'
            }`}
          >
            {/* TEXTO DA FRASE IMPONENTE E RESGUARDADO À ESQUERDA */}
            <p className="text-[14px] md:text-[1.1vw] lg:text-[1.15vw] text-slate-200 leading-relaxed font-semibold select-none break-words flex-1 line-clamp-2 md:line-clamp-3">
              {item.text}
            </p>

            {/* BOTÕES DAS SETAS DISPOSTOS LADO A LADO NA HORIZONTAL PARA NUNCA EXCEDER A ALTURA DO CARD */}
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

      {/* CONTAINER DE VALIDAÇÃO E FEEDBACK DA IA NO RODAPÉ */}
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
