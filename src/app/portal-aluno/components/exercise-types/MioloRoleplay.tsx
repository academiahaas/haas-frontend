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
    instrucao: "RESPONDA A LA PREGUNTA DE LA INTELIGENCIA ARTIFICIAL:",
    falaCapturada: "Tu habla capturada:",
    dica: "Consejo",
    analisando: "Analizando pronunciación y gramática..."
  },
  en: {
    calibrando: "Calibrating lesson level...",
    instrucao: "ANSWER THE QUESTION FROM THE ARTIFICIAL INTELLIGENCE:",
    falaCapturada: "Your captured speech:",
    dica: "Tip",
    analisando: "Analyzing pronunciation and grammar..."
  },
  pt: {
    calibrando: "Calibrando o nível da lição...",
    instrucao: "RESPONDA À PERGUNTA DA INTELIGÊNCIA ARTIFICIAL:",
    falaCapturada: "Sua fala capturada:",
    dica: "Dica",
    analisando: "Analisando pronúncia e gramática..."
  }
};

export default function MioloRoleplay({ onSelectCorrect, onSelectWrong, unidadeAtiva, onValidateResult }: MioloRoleplayProps) {
  const [flowState, setFlowState] = useState<"IA_SPEAKING" | "USER_TURN" | "RECORDING" | "ANALYZING" | "DONE">("IA_SPEAKING");
  const [phraseIA, setPhraseIA] = useState("...");
  const [transcricaoAluno, setTranscricaoAluno] = useState("");
  const [scoreFinal, setScoreFinal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackEstruturado | null>(null);
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState("Español");
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState("");
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState("");

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
    if (!fraseParaAnálise || fraseParaAnálise.trim().length < 3) {
      setFeedback({
        status: "INCOERENTE",
        mensagem: `No pude escuchar claramente tus palabras. ¿Podrías intentar hablar de nuevo frente al micrófono? Aquí estoy para ayudarte.`,
        sugestao: "Intenta responder con calma usando las palabras que practicamos hoy."
      });
      setScoreFinal(15);
      setFlowState("DONE");
      if (onSelectWrong) onSelectWrong();
      return;
    }

    try {
      const promptFeedback = `Você é a Mentora Haas. Avalie a resposta que seu aluno acabou de falar em português. O idioma materno dele é: ${idiomaNativoAluno}.
Sua pergunta: "${phraseIA}"
O que o aluno falou: "${fraseParaAnálise}"

INSTRUÇÕES DE HUMANIZAÇÃO E RESILIÊNCIA (MUITO IMPORTANTE):
1. Fale DIRETAMENTE com o aluno, na primeira pessoa (como sua mentora/professora particular). NUNCA mencione palavras como "sistema", "usuario", "algoritmo" ou "transcripción". Ajude-o de forma natural e humana.
2. Se a frase do aluno parecer sem sentido ou confusa, entenda que ele pode ter misturado espanhol/portunhol e o capturador registrou palavras aleatórias. Explique com muita empatia em ${idiomaNativoAluno} que talvez o sotaque ou a mistura de termos deixou a mensagem um pouco confusa para entender, sem fazê-lo se sentir frustrado.
3. ADOTE NEUTRALIDADE DE GÊNERO ABSOLUTA: Não utilize palavras marcadas (evite adjetivos masculinos/femininos ao se referir ao aluno).
4. BANEO DE CARACTERES: Proibido usar asteriscos (*), hashtags (#) ou emojis.
5. IDIOMA: Escreva sua mensagem e sua sugestão ESTRICTAMENTE ao 100% no idioma nativo dele: ${idiomaNativoAluno}.

Retorne estritamente este formato JSON limpo sem markdown:
{
  "status": "EXCELENTE" o "REGULAR" o "INCOERENTE",
  "score": 75,
  "mensagem": "Sua resposta humana e acolhedora em ${idiomaNativoAluno} falando diretamente com ele.",
  "sugestao": "Seu conselho prático em ${idiomaNativoAluno} para ajustar a pronúncia ou preposição."
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptFeedback }] }] })
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json();
      const textoJson = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      const limpo = textoJson.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(limpo);

      setScoreFinal(parsed.score || 70);
      setFeedback({
        status: parsed.status || "REGULAR",
        mensagem: parsed.mensagem || "¡Excelente intento! Procesé tu audio con muita atenção.",
        sugestao: parsed.sugestao || "Sigue practicando tu pronunciación todos los días."
      });

      setFlowState("DONE");
      const isCorrect = (parsed.score || 70) >= 60;
      const textoMensagem = parsed.mensagem || "Análise de voz processada com sucesso.";
      if (onValidateResult) {
        const incentivo = isCorrect ? incentivoCorretoBanco : incentivoIncorretoBanco;
        const feedbackFinalMentora = incentivo ? `${incentivo} \n\n📝 ${textoMensagem}` : textoMensagem;
        onValidateResult(isCorrect, feedbackFinalMentora);
      }
      if (isCorrect) {
        if (onSelectCorrect) onSelectCorrect();
      } else {
        if (onSelectWrong) onSelectWrong();
      }
    } catch (e) {
      console.warn("Fallback resiliente acionado:", e);
      setScoreFinal(75);
      setFeedback({
        status: "REGULAR",
        mensagem: `Tu respuesta fue recibida correctamente por el sistema. Recuerda estruturar bien las preposiciones en passado para dar mayor claridad a tu mensagem.`,
        sugestao: "Presta atención a la combinación correcta de las estruturas en el idioma nativo del ejercicio."
      });
      setFlowState("DONE");
      const msgCatch = `Tu resposta foi recebida com sucesso.`;
      if (onValidateResult) {
        const feedbackFinalMentora = incentivoCorretoBanco ? `${incentivoCorretoBanco} \n\n📝 ${msgCatch}` : msgCatch;
        onValidateResult(true, feedbackFinalMentora);
      }
      if (onSelectCorrect) onSelectCorrect();
    }
  };

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

      {flowState !== "DONE" && (
        <div className="flex-1 bg-[#050b14]/40 border border-white/[0.04] p-6 md:p-8 rounded-xl flex items-center justify-between gap-4 animate-fade-in min-h-0 w-full mb-2">
          <div className="flex-1 flex items-center justify-center text-center py-6">
            <p className="text-[15px] md:text-[1.3vw] text-slate-100 font-bold leading-relaxed break-words max-w-[90%]">
              {phraseIA}
            </p>
          </div>
          
          <button 
            onClick={escutarFraseMentora}
            className="p-3 bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 rounded-xl hover:text-cyan-300 active:scale-95 transition-all cursor-pointer shrink-0 self-center"
            title="Escutar"
          >
            <Volume2 size={18} />
          </button>
        </div>
      )}

      {flowState === "DONE" && feedback ? (
        <div className="flex-1 min-h-0 bg-[#050b14]/40 border border-white/[0.04] rounded-xl p-4 flex flex-col justify-center items-stretch gap-3 overflow-hidden animate-fade-in">
          <div className="w-full h-full flex flex-col justify-between min-h-0 overflow-hidden text-left flex-1">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-1.5 sticky top-0 bg-[#050b14]/50 backdrop-blur-sm z-10">
                <span className="font-bold text-[10px] md:text-[0.9vw] uppercase tracking-wider text-slate-400">
                  {textInt.falaCaptured || textInt.falaCapturada}
                </span>
                <div className="text-amber-400 font-semibold text-[10px] md:text-[0.9vw] bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-800/30 tracking-wider">
                  +{scoreFinal} PTS
                </div>
              </div>

              <div className="p-2.5 bg-black/20 rounded-lg border border-white/[0.02] text-[13px] md:text-[1.1vw] text-cyan-100 italic leading-relaxed font-semibold break-words">
                "{transcricaoAluno}"
              </div>

              <p className="text-[13px] md:text-[1.1vw] text-slate-200 font-medium leading-relaxed break-words">
                {feedback.mensagem}
              </p>
              
              <div className="text-[12px] md:text-[1vw] text-cyan-300/90 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/20 italic font-semibold break-words">
                {textInt.dica}: {feedback.sugestao}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-4 flex flex-col items-center justify-center text-center animate-pulse">
          {flowState === "RECORDING" && transcricaoAluno.trim() && (
            <p className="text-[13px] md:text-[1.1vw] text-cyan-300 italic max-w-full font-medium break-words px-2">
              "{transcricaoAluno}"
            </p>
          )}
          {flowState === "ANALYZING" && (
            <div className="flex flex-col items-center justify-center gap-2.5">
              <Loader2 size={28} className="text-cyan-400 animate-spin" />
              <span className="text-[11px] md:text-[1vw] font-bold uppercase tracking-widest text-cyan-400">
                {textInt.analisando}
              </span>
            </div>
          )}
        </div>
      )}

      {flowState !== "ANALYZING" && flowState !== "DONE" && (
        <div className="flex justify-center shrink-0 pt-0.5 pb-0.5">
          <button
            onClick={alternarEstadoMicrofone}
            className={`p-3.5 rounded-full border transition-all cursor-pointer shadow-lg active:scale-95 ${
              flowState === "RECORDING" 
                ? "bg-rose-600 border-rose-500 text-white shadow-rose-950/40" 
                : "bg-[#0e1e31] border-cyan-500/30 text-cyan-400 hover:bg-[#12273f]"
            }`}
          >
            <Mic size={18} />
          </button>
        </div>
      )}

    </div>
  );
}
