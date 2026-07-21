"use client";
import { supabase } from "@/lib/supabase";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Disc, Loader2, Volume2, HelpCircle, Send, Square, Sparkles, RotateCcw } from 'lucide-react';

interface MioloShadowingProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => void;
}

interface FeedbackEstruturado {
  status: 'EXCELENTE' | 'REGULAR' | 'INCOERENTE';
  mensagem: string;
  sugestao: string;
}

const traducoes: Record<string, Record<string, string>> = {
  es: {
    conectando: "Conectando...",
    gravando: "Grabando...",
    avaliando: "Evaluando...",
    dica: "Consejo",
    instrucao: "Haz clic en el altavoz para escuchar la frase y luego presiona el micrófono para repetirla"
  },
  en: {
    conectando: "Connecting...",
    gravando: "Recording...",
    avaliando: "Evaluating...",
    dica: "Tip",
    instrucao: "Click on the loudspeaker to listen to the sentence, then press the microphone to repeat it"
  },
  pt: {
    conectando: "Conectando...",
    gravando: "Gravando...",
    avaliando: "Avaliando...",
    dica: "Dica"
  }
};


function calcularSimilaridadeShadowing(target: string, spoken: string): number {
  const limparTexto = (text: string) => {
    const semAcentos = text.toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    
    let limpo = "";
    for (let i = 0; i < semAcentos.length; i++) {
      const code = semAcentos.charCodeAt(i);
      if ((code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code === 32) {
        limpo += semAcentos[i];
      }
    }
    return limpo.split(" ").filter(palavra => palavra.length > 0);
  };

  const palavrasAlvo = limparTexto(target);
  const palavrasAluno = limparTexto(spoken);

  if (palavrasAlvo.length === 0) return 0;
  if (palavrasAluno.length === 0) return 0;

  let acertos = 0;
  const copiaPalavrasAluno = [...palavrasAluno];

  for (const palavra of palavrasAlvo) {
    const idx = copiaPalavrasAluno.indexOf(palavra);
    if (idx !== -1) {
      acertos++;
      copiaPalavrasAluno.splice(idx, 1);
    }
  }

  return Math.round((acertos / palavrasAlvo.length) * 100);
}

export default function MioloShadowing({ onSelectCorrect, onSelectWrong, unidadeAtiva, onValidateResult }: MioloShadowingProps) {
  const [flowState, setFlowState] = useState<'IDLE' | 'RECORDING' | 'PLAYBACK' | 'ANALYZING' | 'DONE'>('IDLE');
  const [referencePhrase, setReferencePhrase] = useState('');
  const [feedbackCorretoBanco, setFeedbackCorretoBanco] = useState('');
  const [feedbackIncorretoBanco, setFeedbackIncorretoBanco] = useState('');
  const [incentivoCorretoBanco, setIncentivoCorretoBanco] = useState('');
  const [incentivoIncorretoBanco, setIncentivoIncorretoBanco] = useState('');
  const [transcricaoAluno, setTranscricaoAluno] = useState('');
  const [scoreFinal, setScoreFinal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackEstruturado | null>(null);
  const [idiomaNativoAluno, setIdiomaNativoAluno] = useState('Español');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
  const GEMINI_API_KEY = "AQ.Ab8RN6KKu4ManOw3IOPNh9Ls34APH0N-BrWxsNBRlmUI4pFBAw";
  const USER_ID_ALVO = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const obterLangKey = () => {
    const lang = idiomaNativoAluno?.toLowerCase() || "";
    if (lang.includes("eng") || lang.includes("ing")) return "en";
    if (lang.includes("por") || lang.includes("bra")) return "pt";
    return "es";
  };

  const t = traducoes[obterLangKey()];

  const salvarNovaFraseNoCacheBanco = async (fraseInedita: string, nivel: string) => {
    try {
      const nomeUnidade = unidadeAtiva || "O Labirinto dos Passados Irregulares";
      await fetch(`${SUPABASE_URL}/exercises`, {
        method: "POST",
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          unit: nomeUnidade,
          activity_type: 10,
          level: nivel,
          correct_answer: fraseInedita,
          reading_text: fraseInedita
        })
      });
    } catch (e) {
      console.warn("Erro ao registrar frase gerada no cache do banco:", e);
    }
  };

  const gerarFraseIneditaIA = async (nivelDaLicao: string) => {
    try {
      const prompt = `Você é um coordenador pedagógico sênior de português. Gere uma única frase média e fluida em português para treinamento de imitação e pronúncia (Shadowing).
Restrição de Nível: Nível ${nivelDaLicao}. 
Regras Estritas:
- Retorne apenas a frase direta.
- Não utilize aspas, pontos de exclamação exagerados, jargões complexos ou formatação markdown.
- A frase deve ter ritmo natural e excelente sonoridade para o aluno escutar e imitar.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (res.ok) {
        const data = await res.json();
        const frase = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        if (frase.length > 5) {
          salvarNovaFraseNoCacheBanco(frase, nivelDaLicao);
          return frase;
        }
      }
    } catch (e) {
      console.warn("Falha no gerador de frase resiliente:", e);
    }
    return "Com certeza nós podemos nos encontrar mais tarde para alinhar os detalhes.";
  };

  useEffect(() => {
        async function carregarCenarioShadowing() {
      try {
        setCarregando(true);
        let codigoUnidade = unidadeAtiva;

        // Se a unidade não vier definida ou for inválida, busca a primeira ativa do banco
        if (!codigoUnidade || codigoUnidade === "0" || codigoUnidade === "undefined") {
          const { data: primeiraAtiva } = await supabase
            .from("exercises")
            .select("unit")
            .eq("activity_type", 10)
            .limit(1);
          codigoUnidade = primeiraAtiva && primeiraAtiva.length > 0 ? primeiraAtiva[0].unit : "1.1";
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codigoUnidade);
        let query = supabase.from("exercises").select("*").eq("activity_type", 10);

        if (isUUID) {
          query = query.eq("unit_id", codigoUnidade);
        } else {
          query = query.eq("unit", codigoUnidade);
        }

        const { data: exeDados, error } = await query.limit(1);
        if (error) throw error;

        if (exeDados && exeDados.length > 0) {
          const frase = exeDados[0].audio_transcript || exeDados[0].correct_answer || "";
          setReferencePhrase(frase);
          setFeedbackCorretoBanco(exeDados[0].correct_feedback || "");
          setFeedbackIncorretoBanco(exeDados[0].incorrect_feedback || "");
          setIncentivoCorretoBanco(exeDados[0].correct_incentive || "");
          setIncentivoIncorretoBanco(exeDados[0].incorrect_incentive || "");
          console.log("📡 [CONEXÃO ATIVA] Shadowing carregado dinamicamente:", frase, "da unidade:", codigoUnidade);
        } else {
          // Fallback seguro de recuperação caso a linha esteja temporariamente vazia
          console.warn("⚠️ Sem registros de Shadowing para a unidade:", codigoUnidade);
          setReferencePhrase("Não se preocupe, vamos praticar juntos.");
        }
      } catch (err) {
        console.error("❌ Erro na sincronização dinâmica de Shadowing:", err);
        setReferencePhrase("Não se preocupe, vamos praticar juntos.");
      } finally {
        setCarregando(false);
      }
    }
    carregarCenarioShadowing();

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "pt-BR";

        rec.onresult = (event: any) => {
          let acumulado = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) acumulado += event.results[i][0].transcript + " ";
          }
          if (acumulado) setTranscricaoAluno((prev) => (prev + " " + acumulado).trim());
        };
        recognitionRef.current = rec;
      }
    }
  }, [unidadeAtiva]);

  const playNativo = () => {
    if (referencePhrase && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(referencePhrase);
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

  const iniciarGravacao = async () => {
    setTranscricaoAluno("");
    setFeedback(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioUrl(URL.createObjectURL(audioBlob));
        setFlowState("PLAYBACK");
      };

      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) {}
      }

      recorder.start();
      setFlowState("RECORDING");
    } catch (err) {
      console.error(err);
    }
  };

  const pararGravacao = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
  };

  const processarAvaliacaoFinaMeteora = async () => {
    setFlowState("ANALYZING");
    
    if (!transcricaoAluno || transcricaoAluno.trim().length < 2) {
      setFeedback({
        status: "INCOERENTE",
        mensagem: idiomaNativoAluno.toLowerCase().includes("ing")
          ? "I couldn't hear any words clearly. Could you please click the button and repeat the sentence?"
          : "No pude escuchar tus palabras con claridad. ¿Podrías presionar el botón y repetir la frase?",
        sugestao: "Intenta hablar de forma fluida frente al micrófono."
      });
      setScoreFinal(1.5);
      setFlowState("DONE");
      if (onSelectWrong) onSelectWrong();
      if (onValidateResult) {
        onValidateResult(false, incentivoIncorretoBanco || "No pude escuchar tus palabras con claridad. ¿Podrías presionar el botón y repetir la frase?", 1.5, unidadeAtiva);
      }
      return;
    }

    try {
      setFlowState("ANALYZING");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const notaCalculada = calcularSimilaridadeShadowing(referencePhrase, transcricaoAluno);
      setScoreFinal(Number((notaCalculada / 10).toFixed(1)));

      let statusResult: "EXCELENTE" | "REGULAR" | "INCOERENTE" = "REGULAR";
      let msgPersonalizada = "";
      let sugestaoPersonalizada = "";

      const isEnglish = idiomaNativoAluno.toLowerCase().includes("ing");

      if (notaCalculada >= 80) {
        statusResult = "EXCELENTE";
        msgPersonalizada = isEnglish 
          ? "Fantastic! Your pronunciation is incredibly clear and very close to the target sentence." 
          : "¡Fantástico! Tu pronunciación es increíblemente clara y muy cercana a la frase original.";
        sugestaoPersonalizada = isEnglish 
          ? "Excellent rhythm and cadency. Keep up the great work!" 
          : "Excelente ritmo y fluidez. ¡Sigue practicando así!";
      } else if (notaCalculada >= 50) {
        statusResult = "REGULAR";
        msgPersonalizada = isEnglish 
          ? "Good effort! I can understand what you said, but we can polish some sounds." 
          : "¡Buen esfuerzo! Logro entender tu frase, pero podemos pulir algunos sonidos para sonar más natural.";
        sugestaoPersonalizada = isEnglish 
          ? "Pay close attention to word connections and silent syllables." 
          : "Presta atención a cómo se unen las palabras y al ritmo natural de la frase.";
      } else {
        statusResult = "INCOERENTE";
        msgPersonalizada = isEnglish 
          ? "Keep practicing! It seems some words weren't captured correctly in Portuguese." 
          : "¡Sigue practicando! Parece que algunas palabras no foram pronunciadas o capturadas de forma inteligible en portugués.";
        sugestaoPersonalizada = isEnglish 
          ? "Try speaking a bit slower and directly into the microphone." 
          : "Intenta hablar un poco más despacio, vocalizando bien frente al micrófono.";
      }

      const aprovado = notaCalculada >= 50;
      const msgDoBanco = aprovado ? feedbackCorretoBanco : feedbackIncorretoBanco;
      const textoMensagemFinal = msgDoBanco || msgPersonalizada;

      setFeedback({
        status: statusResult,
        mensagem: textoMensagemFinal,
        sugestao: sugestaoPersonalizada
      });

      setFlowState("DONE");

      if (onValidateResult) {
        const incTexto = aprovado ? incentivoCorretoBanco : incentivoIncorretoBanco;
        const feedbackFinalMentora = (incTexto && incTexto.trim().length > 0) ? incTexto : msgPersonalizada;
        const notaFinal = Number((notaCalculada / 10).toFixed(1));
          onValidateResult(aprovado, feedbackFinalMentora, notaFinal, unidadeAtiva);
      }

      if (aprovado) {
        if (onSelectCorrect) onSelectCorrect();
      } else {
        if (onSelectWrong) onSelectWrong();
      }

    } catch (err) {
      console.error("Erro na validação do exercício de fala:", err);
      setFlowState("IDLE");
    }
  };

  if (carregando) {
    return (
      <div className="w-full text-center py-6 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[1.1vw] uppercase tracking-widest">
        {t?.conectando || "..."}
      </div>
    );
  }

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-start items-stretch text-left font-sans flex-1 min-h-0 gap-3 overflow-hidden p-0.5">
      
      {/* Instrução Padronizada no Topo */}
      <div className="flex flex-col shrink-0 gap-3 w-full">
        <div className="flex items-center justify-between bg-[#070d19]/40 p-3 rounded-xl border border-white/[0.02]">
          <div className="flex items-start gap-2.5">
            <HelpCircle size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <span className="text-[12px] md:text-[0.9vw] font-medium text-slate-200 leading-relaxed text-left uppercase tracking-wider">
              {t?.instrucao || "Haz clic en el altavoz para escuchar la frase y luego presiona el micrófono para repetirla"}
            </span>
          </div>
        </div>
      </div>

      {/* Interface Pura de Áudio (Shadowing) - Sempre Visível */}
      <div className="bg-[#0c192e]/40 border border-white/[0.03] p-8 rounded-2xl flex flex-col items-center justify-center gap-6 flex-1 w-full animate-fade-in text-center">
        <div className="flex flex-col items-center gap-3">
          <button 
            onClick={playNativo}
            className="p-6 bg-cyan-950/80 border-2 border-cyan-500/30 text-cyan-400 rounded-full hover:text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-950 active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10"
            title="Escutar áudio"
          >
            <Volume2 size={32} className="animate-pulse" />
          </button>
          <span className="text-xs md:text-[0.75vw] text-cyan-400/60 uppercase tracking-widest font-mono mt-1">
            Escuchar Pronunciación
          </span>
        </div>
      </div>

      {/* AREA DE RESULTADOS/ANALISANDO E INTERAÇÃO UNIFICADA NO RODAPÉ */}
      <div className="w-full shrink-0 flex flex-col items-stretch gap-2.5">
        
        {/* Caso Analisando / Carregando */}
        {flowState === "ANALYZING" && (
          <div className="w-full flex flex-col items-center justify-center gap-4 bg-cyan-950/10 border border-cyan-500/15 rounded-xl animate-pulse p-6 min-h-[110px] overflow-hidden text-[13px] md:text-[1.2vw] text-cyan-400 font-bold tracking-widest uppercase">
            <Sparkles size={18} className="animate-spin text-cyan-400" />
            <span>{t?.avaliando || "Avaliando"}...</span>
          </div>
        )}

        {/* Caso Concluído (O Card de Feedback abre no mesmo lugar do "Analisando") */}
        {flowState === "DONE" && feedback && (
          <div className="bg-[#0c192e]/60 border border-cyan-800/30 rounded-xl p-4 flex flex-col gap-2.5 animate-fade-in shadow-xl w-full min-h-[110px]">
            <div className="flex justify-end w-full shrink-0">
              <div className="text-amber-400 font-bold text-[11px] md:text-[0.9vw] bg-amber-950/50 px-3 py-1 rounded-lg border border-amber-800/40 tracking-wider whitespace-nowrap shadow-sm">
                +{scoreFinal} NOTA
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full pr-0.5" style={{ scrollbarWidth: 'none' }}>
              <p className="text-[13px] md:text-[1.1vw] text-slate-200 font-medium leading-relaxed break-words w-full min-w-0 text-left">
                {feedback.mensagem}
              </p>
            </div>
          </div>
        )}

        {/* Controles de Gravação (Se não estiver analisando ou concluído) */}
        {flowState !== "ANALYZING" && flowState !== "DONE" && (
          <div className="flex flex-col items-center justify-center py-1 gap-1">
            {flowState === "RECORDING" && (
              <span className="text-[12px] md:text-[1vw] font-bold uppercase tracking-wider text-rose-400 animate-pulse mb-1">
                {t?.gravando || "GRABANDO"}
              </span>
            )}
            
            <div className="flex justify-center items-center shrink-0 gap-4 h-[54px] w-full">
              {flowState === "IDLE" && (
                <button
                  onClick={iniciarGravacao}
                  className="p-3.5 bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 rounded-full hover:border-cyan-400 hover:bg-cyan-950 transition-all cursor-pointer shadow-lg active:scale-95 shrink-0"
                >
                  <Mic size={18} />
                </button>
              )}

              {flowState === "RECORDING" && (
                <button
                  onClick={pararGravacao}
                  className="p-3.5 bg-rose-600 border border-rose-500 text-white rounded-full transition-all cursor-pointer shadow-lg active:scale-95 shadow-rose-950/40 shrink-0"
                >
                  <Square size={18} />
                </button>
              )}

              {flowState === "PLAYBACK" && (
                <div className="flex items-center gap-4 animate-fade-in shrink-0">
                  <button 
                    onClick={() => { if (audioUrl) new Audio(audioUrl).play(); }}
                    className="p-3 bg-cyan-950 border border-cyan-500/40 text-cyan-400 rounded-full hover:bg-cyan-900 transition-all cursor-pointer shadow-md active:scale-90 flex items-center justify-center shrink-0"
                    title="Escutar áudio gravado"
                  >
                    <Volume2 size={16} />
                  </button>

                  <button 
                    onClick={() => {
                      setFlowState("IDLE");
                      setAudioUrl(null);
                      setTranscricaoAluno("");
                    }}
                    className="p-3 bg-amber-950/40 border border-amber-500/40 text-amber-400 rounded-full hover:bg-amber-950 transition-all cursor-pointer shadow-md active:scale-90 flex items-center justify-center shrink-0"
                    title="Grabar de nuevo"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button 
                    onClick={processarAvaliacaoFinaMeteora}
                    className="p-3 bg-emerald-600 border border-emerald-500 text-white rounded-full hover:bg-emerald-500 transition-all cursor-pointer shadow-md active:scale-90 flex items-center justify-center shrink-0"
                    title="Enviar para análise"
                  >
                    <Send size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
