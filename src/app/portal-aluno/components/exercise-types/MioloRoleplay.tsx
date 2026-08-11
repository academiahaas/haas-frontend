'use client';
import { supabase } from '@/lib/supabase';
import { feedbackTraducoes, obterLangKeyCompartilhado } from "./feedbackTraducoes";
import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Volume2, HelpCircle , Sparkles} from 'lucide-react';;

interface MioloRoleplayProps {
  initialExerciseData?: any;
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  nivelAtivo?: string;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
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


function validarConversacaoLocal(pergunta: string, resposta: string, keywordsBanco: string[], idiomaKey: "en" | "pt" | "es" = "es"): { score: number; status: "EXCELENTE" | "REGULAR" | "INCOERENTE"; msg: string; sugestao: string } {
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
      msg: feedbackTraducoes.roleplay.curtaOuRepetida(idiomaKey),
      sugestao: feedbackTraducoes.roleplay.curtaOuRepetidaSugestao(idiomaKey)
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
      msg: feedbackTraducoes.roleplay.repeticao(idiomaKey),
      sugestao: feedbackTraducoes.roleplay.repeticaoSugestao(idiomaKey)
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
        msg: feedbackTraducoes.roleplay.semPalavraChave(idiomaKey),
        sugestao: feedbackTraducoes.roleplay.semPalavraChaveSugestao(idiomaKey)
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
        msg: feedbackTraducoes.roleplay.semLogica(idiomaKey),
        sugestao: feedbackTraducoes.roleplay.semLogicaSugestao(idiomaKey)
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
      msg: feedbackTraducoes.roleplay.excelente(idiomaKey),
      sugestao: feedbackTraducoes.roleplay.excelenteSugestao(idiomaKey)
    };
  } else {
    return {
      score: scoreFinal,
      status: "REGULAR",
      msg: feedbackTraducoes.roleplay.bomIntento(idiomaKey),
      sugestao: feedbackTraducoes.roleplay.bomIntentoSugestao(idiomaKey)
    };
  }
}

export default function MioloRoleplay({ onSelectCorrect, onSelectWrong, unidadeAtiva,
  nivelAtivo, onValidateResult , initialExerciseData}: MioloRoleplayProps) {

  

  const [flowState, setFlowState] = useState<"IA_SPEAKING" | "USER_TURN" | "RECORDING" | "ANALYZING" | "DONE">("IA_SPEAKING");
  const [phraseIA, setPhraseIA] = useState("...");
  const [transcricaoAluno, setTranscricaoAluno] = useState("");
  const [scoreFinal, setScoreFinal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackEstruturado | null>(null);
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  useEffect(() => {
    async function buscarIdioma() {
      try {
        const uid = typeof window !== "undefined" ? localStorage.getItem("haas_user_id") : null;
        if (!uid) return;
        const { data: userDados } = await supabase
          .from("users")
          .select("native_language")
          .eq("id", uid);
        if (userDados && userDados.length > 0) {
          setIdiomaNativoAluno(userDados[0].native_language || "Español");
        }
      } catch (e) {
        console.warn("Erro ao buscar idioma nativo:", e);
      }
    }
    buscarIdioma();
  }, []);
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
      if (!unidadeAtiva) {
        console.log("🔍 [ROLEPLAY] Aguardando UUID/UnidadeAtiva da Central...");
        return;
      }
      try {
        setCarregando(true);
        console.log("🔍 [ROLEPLAY] Buscando exercicio do tipo 9 para UUID/Unit:", unidadeAtiva);

        // Busca por unit_id (UUID da Central) ou fallback por unit
        let exeDados = [];
          let error = null;
          
          // --- BYPASS: USA DADOS DA ARENA SE EXISTIREM ---
          if (initialExerciseData && (initialExerciseData.id || initialExerciseData.audio_transcript)) {
            console.log("🔒 [ROLEPLAY] Usando dados da Arena:", initialExerciseData.id);
            exeDados = [initialExerciseData];
          } else {
            let query = supabase.from("exercises").select("*").eq("activity_type", 9);
            if (unidadeAtiva.includes("-")) {
              query = query.eq("unit_id", unidadeAtiva);
            } else {
              query = query.eq("unit", unidadeAtiva);
            }
            const res = await query;
            exeDados = res.data;
            error = res.error;
          }
          // ------------------------------------------------
        
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
      setScoreFinal(1.5);
      setFlowState("DONE");
      if (onSelectWrong) onSelectWrong();
      if (onValidateResult) onValidateResult(false, "No pude escuchar claramente tus palabras. Intenta de nuevo.", 1.5, initialExerciseData?.id);
      return;
    }

    try {
      // Força a tela a segurar o estado de analisando por 1.5 segundos antes de processar
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const resultado = validarConversacaoLocal(phraseIA, fraseParaAnálise, keywordsObrigatorias, obterLangKeyCompartilhado(idiomaNativoAluno));
      
      setScoreFinal(Number((resultado.score / 10).toFixed(1)));
      
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
        const notaFinal = Number((resultado.score / 10).toFixed(1));
          onValidateResult(isCorrect, feedbackFinalMentora, notaFinal, initialExerciseData?.id);
      }
      
      if (isCorrect) {
        if (onSelectCorrect) onSelectCorrect();
      } else {
        if (onSelectWrong) onSelectWrong();
      }
    } catch (e) {
      console.error("Erro na validação local:", e);
      setScoreFinal(1.5);
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
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[14px] uppercase tracking-widest">
        {textInt?.calibrando || "..."}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col font-sans select-none gap-5 p-2 overflow-hidden flex-1 min-h-0">
      
      {/* INSTRUÇÃO MINIMALISTA */}
      <div className="flex items-center gap-2 shrink-0 px-1">
        <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
        <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest">
          {textInt.instrucao}
        </span>
      </div>

      {/* CARD DA PERGUNTA DA MENTORA HAAS */}
      <div className="bg-[#080C16]/80 border border-slate-700/50 rounded-2xl p-6 shadow-sm flex-1 min-h-[140px] flex items-center justify-between gap-4 animate-fade-in w-full">
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-[clamp(16px,2vw,22px)] text-slate-100 font-bold leading-relaxed break-words max-w-[95%]">
            "{phraseIA}"
          </p>
        </div>
        
        <button 
          type="button"
          onClick={escutarFraseMentora}
          className="p-3 bg-[#0E1726] hover:bg-[#162238] border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 rounded-xl transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
          title="Escutar"
        >
          <Volume2 size={20} />
        </button>
      </div>

      {/* ÁREA DE INTERAÇÃO / GRAVAÇÃO DE VOZ / FEEDBACK */}
      <div className="w-full shrink-0 flex flex-col items-center justify-center gap-3 min-h-[120px]">
        
        {/* Caso 1: Turno do Usuário (Microfone Pronto) */}
        {flowState === "USER_TURN" && (
          <div className="flex flex-col items-center justify-center py-2">
            <button
              type="button"
              onClick={alternarEstadoMicrofone}
              className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-center active:scale-95"
              title="Clique para falar"
            >
              <Mic size={24} />
            </button>
          </div>
        )}

        {/* Caso 2: Gravando (Microfone Ativo em Pulso) */}
        {flowState === "RECORDING" && (
          <div className="flex flex-col items-center justify-center py-2 gap-3 w-full">
            <button
              type="button"
              onClick={alternarEstadoMicrofone}
              className="w-16 h-16 rounded-full bg-rose-600 border-2 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all cursor-pointer flex items-center justify-center active:scale-95 animate-pulse"
              title="Clique para parar"
            >
              <Mic size={24} />
            </button>
            {transcricaoAluno.trim() && (
              <p className="text-[14px] md:text-[15px] text-cyan-300 italic max-w-full font-medium break-words px-4 text-center">
                "{transcricaoAluno}"
              </p>
            )}
          </div>
        )}

        {/* Caso 3: Analisando */}
        {flowState === "ANALYZING" && (
          <div className="w-full max-w-2xl bg-[#080C16]/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 animate-fade-in shadow-[0_0_30px_rgba(6,182,212,0.12)] min-h-[110px]">
            <Loader2 size={24} className="text-cyan-400 animate-spin" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-cyan-400 animate-pulse">
              {textInt.analisando}...
            </span>
          </div>
        )}

        {/* Caso 4: Análise Concluída (Feedback em Camadas) */}
        {flowState === "DONE" && feedback && (
          <div className="w-full max-w-2xl bg-[#080C16]/90 border border-cyan-500/30 rounded-2xl p-6 md:p-8 flex flex-col gap-3 animate-fade-in shadow-[0_0_30px_rgba(6,182,212,0.12)] text-left">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[12px] uppercase tracking-widest">
                <Sparkles size={16} />
                <span>Feedback Mentora Haas</span>
              </div>
              <div className="text-purple-300 font-bold text-[12px] bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-500/40/30 tracking-wider shadow-sm">
                +{scoreFinal} XP
              </div>
            </div>

            <p className="text-[16px] text-slate-100 font-medium leading-relaxed break-words">
              {feedback.mensagem}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
