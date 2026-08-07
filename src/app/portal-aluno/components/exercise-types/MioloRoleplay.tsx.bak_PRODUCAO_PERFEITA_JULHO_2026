'use client';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Volume2, HelpCircle } from "lucide-react";

interface MioloRoleplayProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string) => void;
}

interface FeedbackEstruturado {
  status: "EXCELENTE" | "REGULAR" | "INCOERENTE";
  mensagem: string;
  sugestao: string;
}

const traducoesInterface: Record<string, Record<string, string>> = {
  es: {
    calibrando: "Calibrando el nivel de la lección...",
    instrucao: "RESPONDA A LA PREGUNTA DE LA MENTORA HAAS:",
    falaCapturada: "Tu habla capturada:",
    dica: "Consejo",
    analisando: "Analizando..."
  },
  en: {
    calibrando: "Calibrating lesson level...",
    instrucao: "ANSWER THE QUESTION FROM THE ARTIFICIAL INTELLIGENCE:",
    falaCapturada: "Your captured speech:",
    dica: "Tip",
    analisando: "Analyzing..."
  },
  pt: {
    calibrando: "Calibrando o nível da lição...",
    instrucao: "RESPONDA À PERGUNTA DA MENTORA HAAS:",
    falaCapturada: "Sua fala capturada:",
    dica: "Dica",
    analisando: "Analisando..."
  }
};


function validarConversacaoLocal(pergunta: string, resposta: string, keywordsBanco: string[]): { score: number; status: "EXCELENTE" | "REGULAR" | "INCOERENTE"; msg: string; sugestao: string } {
  const normalizar = (t: string) => {
    const semAcentos = t.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    let limpo = "";
    for (let i = 0; i < semAcentos.length; i++) {
      const charCode = semAcentos.charCodeAt(i);
      if ((charCode >= 97 && charCode <= 122) || (charCode >= 48 && charCode <= 57) || charCode === 32) {
        limpo += semAcentos[i];
      }
    }
    return limpo.trim();
  };

  const r = normalizar(resposta);
  const palavrasBrutas = r.split(" ").filter(w => w.length > 1);

  // Lista de ruídos ignorados
  const ruidos = ["bla", "blabla", "lalala", "lelele", "bababa", "tata", "gugu", "dummy", "test", "la"];
  const palavrasResposta = palavrasBrutas.filter(w => !ruidos.includes(w));

  // Se não sobrarem palavras válidas suficientes
  if (palavrasResposta.length < 3) {
    return {
      score: 15,
      status: "INCOERENTE",
      msg: "Sua resposta parece muito curta ou contém palavras repetidas sem sentido em português.",
      sugestao: "Tente responder de forma simples e natural."
    };
  }

  // Contagem de repetições excessivas
  const contagemPalavras: Record<string, number> = {};
  let maxRepeticoes = 0;
  for (const p of palavrasResposta) {
    contagemPalavras[p] = (contagemPalavras[p] || 0) + 1;
    if (contagemPalavras[p] > maxRepeticoes) {
      maxRepeticoes = contagemPalavras[p];
    }
  }

  if (maxRepeticoes >= 2 && palavrasResposta.length <= 6) {
    return {
      score: 15,
      status: "INCOERENTE",
      msg: "Detectei repetição de palavras ou termos sem sentido na sua resposta.",
      sugestao: "Construa uma frase contínua em português para que eu possa avaliar sua fluidez."
    };
  }

  // VERIFICAÇÃO DINÂMICA DAS PALAVRAS-CHAVE DO BANCO
  let matchesDinamicos = 0;
  
  if (keywordsBanco && keywordsBanco.length > 0) {
    // Caso existam keywords cadastradas na coluna correct_answer
    palavrasResposta.forEach(p => {
      if (keywordsBanco.includes(p)) {
        matchesDinamicos++;
      }
    });

    // Se o aluno não falar pelo menos uma das palavras obrigatórias cadastradas, reprova na hora!
    if (matchesDinamicos === 0) {
      return {
        score: 15,
        status: "INCOERENTE",
        msg: "Sua resposta não parece conter as palavras fundamentais necessárias para este contexto.",
        sugestao: "Preste atenção na pergunta da mentora e certifique-se de responder ao assunto solicitado."
      };
    }
  } else {
    // FALLBACK GENÉRICO caso o administrador não tenha cadastrado keywords no correct_answer
    const verbosPassado = ["fui", "estive", "ia", "fomos", "trabalhei", "participei", "visitei", "estava", "fiquei", "cheguei"];
    const locaisContexto = ["escritorio", "reuniao", "casa", "trabalho", "empresa", "cliente", "projeto", "sala", "cozinha", "rua", "loja", "hotel", "restaurante", "almoco", "jantar"];

    let temVerbo = false;
    let temLocal = false;

    palavrasResposta.forEach(p => {
      if (verbosPassado.includes(p)) temVerbo = true;
      if (locaisContexto.includes(p)) temLocal = true;
    });

    if (!temVerbo || !temLocal) {
      return {
        score: 15,
        status: "INCOERENTE",
        msg: "Sua resposta não responde de forma lógica à pergunta da mentora.",
        sugestao: "Tente estruturar uma frase simples contendo uma ação (verbo) e um contexto ou lugar correspondente."
      };
    }
  }

  // Pontuação Base Justa
  let pontos = 40;
  if (palavrasResposta.length >= 4) pontos += 20;
  if (palavrasResposta.length >= 6) pontos += 20;
  if (palavrasResposta.length >= 10) pontos += 20;

  // Recompensa matches se tiver lista do banco
  if (keywordsBanco && keywordsBanco.length > 0) {
    pontos += Math.min(matchesDinamicos * 15, 20);
  }

  const scoreFinal = Math.min(Math.max(pontos, 15), 100);
  
  if (scoreFinal >= 80) {
    return {
      score: scoreFinal,
      status: "EXCELENTE",
      msg: "¡Excelente respuesta! Lograste formular una respuesta completa y muy coherente en português.",
      sugestao: "¡Gran fluidez! Sigue estruturando tus ideas con este nivel de detalhe."
    };
  } else {
    return {
      score: scoreFinal,
      status: "REGULAR",
      msg: "¡Buen intento! Tu respuesta es comprensible y responde lógicamente a la pregunta.",
      sugestao: "Para obtener la puntuación máxima, intenta añadir un poco más de detalle sobre tus actividades."
    };
  }
}

export default function MioloRoleplay({ onSelectCorrect, onSelectWrong, unidadeAtiva, onValidateResult }: MioloRoleplayProps) {
  const [flowState, setFlowState] = useState<"IA_SPEAKING" | "USER_TURN" | "RECORDING" | "ANALYZING" | "DONE">("IA_SPEAKING");
  const [phraseIA, setPhraseIA] = useState("...");
  const [transcricaoAluno, setTranscricaoAluno] = useState("");
  const [scoreFinal, setScoreFinal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackEstruturado | null>(null);
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [keywordsObrigatorias, setKeywordsObrigatorias] = useState<string[]>([]);
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");
  const [feedbackCorretoReal, setFeedbackCorretoReal] = useState("");
  const [feedbackIncorretoReal, setFeedbackIncorretoReal] = useState("");

  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
  const recognitionRef = useRef<any>(null);

  const obterLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const textInt = traducoesInterface[obterLangKey()];

  useEffect(() => {
    async function carregarCenarioHiperpersonalizado() {
      try {
        setCarregando(true);
        const codigoUnidade = unidadeAtiva || "1.1";
        const { data: exeDados, error } = await supabase
          .from("exercises")
          .select("*")
          .eq("unit", codigoUnidade)
          .eq("activity_type", 9);
        
        if (error) throw error;
        
        let falaPartida = "No seu trabalho, onde você foi ontem de manhã?";
        
        if (exeDados && exeDados.length > 0) {
          falaPartida = exeDados[0].audio_transcript || falaPartida;
          setIncentivoCorretoBanco(exeDados[0].correct_incentive || "");
          setIncentivoIncorretoBanco(exeDados[0].incorrect_incentive || "");
          setFeedbackCorretoReal(exeDados[0].correct_feedback || "");
          setFeedbackIncorretoReal(exeDados[0].incorrect_feedback || "");
          
          // Captura os termos obrigatórios cadastrados na coluna correct_answer
          const rawKeywords = exeDados[0].correct_answer || "";
          if (rawKeywords.trim().length > 0) {
            const listaSaneada = rawKeywords.split(",")
              .map((k: string) => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim())
              .filter((k: string) => k.length > 0);
            setKeywordsObrigatorias(listaSaneada);
            console.log("🎯 [CONVERSAÇÃO] Palavras-chave dinâmicas carregadas do banco:", listaSaneada);
          } else {
            setKeywordsObrigatorias([]);
            console.log("⚠️ [CONVERSAÇÃO] Nenhuma palavra-chave cadastrada em correct_answer. Usando validador flexível.");
          }
        }

        setPhraseIA(falaPartida);
        setFlowState("USER_TURN");
      } catch (err) {
        console.error("Erro geral na carga:", err);
        setPhraseIA("No seu trabalho, onde você foi ontem de manhã?");
      } finally {
        setCarregando(false);
      }
    }
    carregarCenarioHiperpersonalizado();

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "pt-BR";

        rec.onresult = (event: any) => {
          let textoAcumulado = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              textoAcumulado += event.results[i][0].transcript;
            }
          }
          if (textoAcumulado.length > 0) {
            setTranscricaoAluno((prev) => (prev ? prev + " " + textoAcumulado : textoAcumulado));
          }
        };

        rec.onerror = (e: any) => console.error("Erro no microfone nativo:", e);
        recognitionRef.current = rec;
      }
    }
  }, [unidadeAtiva]);

  const dispararAnaliseGemini = async (fraseParaAnálise: string) => {
    setFlowState("ANALYZING");
    
    if (!fraseParaAnálise || fraseParaAnálise.trim().split(" ").filter(w => w.length > 0).length < 2) {
      setFeedback({
        status: "INCOERENTE",
        mensagem: "No pude escuchar claramente tus palabras. ¿Podrías intentar responder de nuevo con una frase más larga?",
        sugestao: "Intenta hablar más cerca del micrófono elaborando una respuesta estruturada."
      });
      setScoreFinal(15);
      setFlowState("DONE");
      if (onSelectWrong) onSelectWrong();
      if (onValidateResult) onValidateResult(false, "No pude escuchar claramente tus palabras. Intenta de nuevo.");
      return;
    }

    try {
      // Força a tela a segurar o estado de analisando por 1.5 segundos antes de processar
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const resultado = validarConversacaoLocal(phraseIA, fraseParaAnálise, keywordsObrigatorias);
      
      setScoreFinal(resultado.score);
      
      const isCorrect = resultado.score >= 50;
      
      // Card Local usa a coluna correct_feedback / incorrect_feedback
      const fbTexto = isCorrect ? feedbackCorretoReal : feedbackIncorretoReal;
      const mensagemExibida = (fbTexto && fbTexto.trim().length > 0) ? fbTexto : resultado.msg;

      setFeedback({
        status: resultado.status,
        mensagem: mensagemExibida,
        sugestao: resultado.sugestao
      });

      setFlowState("DONE");
      
      // Mentora usa a coluna correct_incentive / incorrect_incentive
      if (onValidateResult) {
        const incTexto = isCorrect ? incentivoCorretoBanco : incentivoIncorretoBanco;
        const feedbackFinalMentora = (incTexto && incTexto.trim().length > 0) ? incTexto : resultado.msg;
        onValidateResult(isCorrect, feedbackFinalMentora);
      }
      
      if (isCorrect) {
        if (onSelectCorrect) onSelectCorrect();
      } else {
        if (onSelectWrong) onSelectWrong();
      }
    } catch (e) {
      console.error("Erro na validação local:", e);
      setScoreFinal(15);
      setFeedback({
        status: "INCOERENTE",
        mensagem: "No logré procesar tu respuesta correctamente. Por favor, inténtalo de nuevo.",
        sugestao: "Intenta vocalizar bien y falar de forma continua frente al micrófono."
      });
      setFlowState("DONE");
      if (onSelectWrong) onSelectWrong();
    }
  };;

  const alternarEstadoMicrofone = () => {
    if (flowState === "USER_TURN" || flowState === "DONE") {
      setTranscricaoAluno("");
      setFeedback(null);
      setFlowState("RECORDING");
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) {}
      }
    } else if (flowState === "RECORDING") {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setTimeout(() => {
        setTranscricaoAluno((fraseAtual) => {
          dispararAnaliseGemini(fraseAtual.trim());
          return fraseAtual;
        });
      }, 300);
    }
  };

  const escutarFraseMentora = () => {
    if (typeof window !== "undefined" && phraseIA) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phraseIA);
      utterance.lang = "pt-BR";
      utterance.rate = 1.08; 
      utterance.pitch = 1.02; 
      
      const vozes = window.speechSynthesis.getVoices();
      const vozHumanaLocal = 
        vozes.find(v => v.lang.includes("pt-BR") && v.name.includes("Google português do Brasil")) ||
        vozes.find(v => v.lang.includes("pt-BR") && v.name.includes("Luciana")) ||
        vozes.find(v => v.lang.includes("pt-BR") && v.name.includes("Francisca")) ||
        vozes.find(v => v.lang.includes("pt-BR") && v.name.includes("Maria")) ||
        vozes.find(v => v.lang.includes("pt-BR"));
                        
      if (vozHumanaLocal) utterance.voice = vozHumanaLocal;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (carregando) {
    return (
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[1.1vw] uppercase tracking-widest">
        {textInt?.calibrando || "..."}
      </div>
    );
  }

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-start items-stretch text-left font-sans flex-1 min-h-0 gap-4 overflow-hidden p-0.5">
      
      {/* Faixa de instrução padronizada com o (?) azul */}
      <div className="w-full bg-[#0a1424] border border-white/[0.05] rounded-xl py-3 px-4 flex items-center gap-2.5">
        <HelpCircle size={18} className="text-[#00e1ff] shrink-0" />
        <span className="text-[11px] md:text-[12px] font-bold text-slate-200 tracking-wider uppercase">
          {textInt.instrucao}
        </span>
      </div>

            {/* Frase da Mentora sempre visível para referência do estudante */}
      <div className="flex-1 bg-[#050b14]/40 border border-white/[0.04] p-4 md:p-6 rounded-xl flex items-center justify-between gap-4 animate-fade-in min-h-0 w-full mb-2">
        <div className="flex-1 flex items-center justify-center text-center py-2">
          <p className="text-[14px] md:text-[1.2vw] text-slate-100 font-bold leading-relaxed break-words max-w-[95%]">
            {phraseIA}
          </p>
        </div>
        
        <button 
          onClick={escutarFraseMentora}
          className="p-2.5 bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 rounded-xl hover:text-cyan-300 active:scale-95 transition-all cursor-pointer shrink-0 self-center"
          title="Escutar"
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* ÁREA DE INTERAÇÃO UNIFICADA (Substitui o microfone pelo feedback compacto) */}
      <div className="w-full shrink-0 flex flex-col items-stretch gap-2.5">
        
        {/* Caso 1: Aguardando Gravação / Turno do Usuário (Exibe o Microfone) */}
        {flowState === "USER_TURN" && (
          <div className="flex flex-col items-center justify-center py-2">
            <button
              onClick={alternarEstadoMicrofone}
              className="p-3.5 rounded-full border bg-[#0e1e31] border-cyan-500/30 text-cyan-400 hover:bg-[#12273f] transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Mic size={18} />
            </button>
          </div>
        )}

        {/* Caso 2: Gravando */}
        {flowState === "RECORDING" && (
          <div className="flex flex-col items-center justify-center py-2 gap-2 animate-pulse">
            <button
              onClick={alternarEstadoMicrofone}
              className="p-3.5 rounded-full border bg-rose-600 border-rose-500 text-white shadow-rose-950/40 transition-all cursor-pointer shadow-lg active:scale-95 animate-bounce"
            >
              <Mic size={18} />
            </button>
            {transcricaoAluno.trim() && (
              <p className="text-[11px] md:text-[0.9vw] text-cyan-300 italic max-w-full font-medium break-words px-2 text-center">
                "{transcricaoAluno}"
              </p>
            )}
          </div>
        )}

        {/* Caso 3: Analisando */}
                {/* Caso 3: Analisando */}
        {flowState === "ANALYZING" && (
          <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-xl p-6 flex flex-col items-center justify-center gap-3 animate-fade-in shadow-xl w-full min-h-[110px]">
            <Loader2 size={24} className="text-cyan-400 animate-spin" />
            <span className="text-[11px] md:text-[0.9vw] font-bold uppercase tracking-widest text-cyan-400 animate-pulse">
              {textInt.analisando}...
            </span>
          </div>
        )}

        {/* Caso 4: Análise Concluída (Exibe Feedback Compacto e Elegante no lugar do Microfone) */}
                {/* Caso 4: Análise Concluída (Exibe Feedback Compacto e Elegante no lugar do Microfone) */}
                {/* Caso 4: Análise Concluída (Exibe Feedback Compacto e Elegante no lugar do Microfone) */}
        {flowState === "DONE" && feedback && (
          <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-xl p-4 flex flex-col gap-3 animate-fade-in shadow-xl relative">
            <div className="flex justify-end w-full">
              <div className="text-amber-400 font-semibold text-[10px] md:text-[0.8vw] bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-800/30 tracking-wider">
                +{scoreFinal} PTS
              </div>
            </div>

            <p className="text-[12.5px] md:text-[1vw] text-slate-200 font-medium leading-relaxed break-words text-left">
              {feedback.mensagem}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}