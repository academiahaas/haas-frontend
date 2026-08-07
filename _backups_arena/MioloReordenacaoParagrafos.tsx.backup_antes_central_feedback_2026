'use client';
import { resilienciaTextoCompleto } from '@/utils/motorResiliencia';
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

        let textoBrutoBanco = "";
        if (dados && dados.length > 0 && dados[0].correct_answer) {
          textoBrutoBanco = dados[0].correct_answer.trim();
        }

        // Validação de Emergência: Texto vazio ou insuficiente para fracionar em ordem lógica
        let frasesOriginais: string[] = [];
        if (textoBrutoBanco) {
          frasesOriginais = textoBrutoBanco.split(/(?<=[.!?])\s+/).map((f: string) => f.trim()).filter(Boolean);
        }

        if (frasesOriginais.length < 2) {
          console.warn("⚠️ [CONCURSO DE EMERGÊNCIA] Texto de Reordenação corrompido ou ausente. Acionando IA...");
          const textoRecuperado = await resilienciaTextoCompleto(textoBrutoBanco, nomeUnidade);
          textoBrutoBanco = textoRecuperado;
          frasesOriginais = textoRecuperado.split(/(?<=[.!?])\s+/).map((f: string) => f.trim()).filter(Boolean);
        }

        setTextoGabaritoInteiro(textoBrutoBanco);
        
        const itensMontados = frasesOriginais.map((txt, idx) => ({ id: idx + 1, text: txt }));
        setGabaritoIds(itensMontados.map(it => it.id));
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
    let msgFinal = "";

    const ordemAtualIds = items.map(it => it.id);
    const acertou = JSON.stringify(ordemAtualIds) === JSON.stringify(gabaritoIds);

    try {
      const prompt = `Você é um professor nativo de português especialista em coesão e coerência textual. No exercício de Reordenação de Parágrafos/Frases, a sequência organizada pelo aluno resultou em:
      "${items.map(it => it.text).join(" ")}"
      A ordem cronológica oficial correta (Gabarito) é:
      "${textoGabaritoInteiro}"
      Forneça uma análise pedagógica curta (máximo 12 palavras) apontando se a narrativa flui perfeitamente ou indicando qual parágrafo quebra o nexo lógico temporal.
      Responda estritamente no idioma nativo do aluno: ${idiomaNativoAluno}.
      Retorne obrigatoriamente um JSON limpo no formato exato: {"feedback": "mensagem aqui"}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (res.ok) {
        const data = await res.json();
        const textoBruto = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonLimpo = textoBruto.replace(/```json/g, "").replace(/```/g, "").trim();
        const resultadoIA = JSON.parse(jsonLimpo);
        msgFinal = resultadoIA.feedback || "";
        setFeedbackIA(msgFinal);
      } else {
        msgFinal = acertou ? "Sequência lógica textual validada com maestria!" : "A ordem cronológica das sentenças possui quebras de coesão.";
        setFeedbackIA(msgFinal);
      }
    } catch (e) {
      msgFinal = acertou ? "Excellent ordenação!" : "Ordem incorreta dos parágrafos.";
      setFeedbackIA(msgFinal);
    } finally {
      setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
      if (onValidateResult) onValidateResult(acertou, msgFinal);
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

  const exibirContainerInferior = localStatus !== 'IDLE' || items.length > 0 || analisando;

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
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 py-0.5">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className={`flex items-center justify-between gap-4 bg-[#0c192e]/60 border px-4 rounded-xl transition-all h-full flex-1 min-h-0 max-h-[75px] py-2 ${
              localStatus === 'CORRECT' ? 'border-emerald-500/20' :
              localStatus === 'WRONG' ? 'border-rose-500/20' : 'border-white/[0.04] hover:border-white/[0.1]'
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

      {/* CONTAINER DE VALIDAÇÃO E FEEDBACK DA IA NO RODAPÉ */}
      {exibirContainerInferior && (
        <div className="w-full shrink-0 flex flex-col justify-end mt-0.5 animate-fade-in">
          

          {analisando && (
            <div className="text-[10px] md:text-[1vw] text-cyan-400 font-bold tracking-widest text-center py-2 uppercase flex items-center justify-center gap-2 bg-cyan-950/10 border border-cyan-500/10 rounded-xl animate-pulse h-[38px]">
              <Sparkles size={11} className="animate-spin text-cyan-400" /> <span>{t.validando}</span>
            </div>
          )}

          {localStatus === 'CORRECT' && feedbackIA && (
            <div className="w-full flex flex-col items-center justify-center text-center bg-emerald-950/20 border border-emerald-500/20 py-1.5 px-3 rounded-xl animate-fade-in max-h-[85px] overflow-y-auto">
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] md:text-[1vw] font-black uppercase tracking-wider">
                <CheckCircle size={11} /> <span>Coerência Textual Perfeita!</span>
              </div>
              <p className="text-[11px] md:text-[1.1vw] text-slate-300 font-medium italic break-words w-full">"{feedbackIA}"</p>
            </div>
          )}

          {localStatus === 'WRONG' && feedbackIA && (
            <div className="w-full flex flex-col items-center justify-center gap-0.5 text-center bg-rose-950/20 border border-rose-500/20 py-1.5 px-3 rounded-xl animate-fade-in max-h-[75px] overflow-y-auto">
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
