"use client";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackTraducoes, obterLangKeyCompartilhado } from "./feedbackTraducoes";
import { supabase } from "@/lib/supabase";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Disc, Loader2, Volume2, HelpCircle, Send, Square, Sparkles, RotateCcw } from 'lucide-react';

interface MioloShadowingProps {
  initialExerciseData?: any;
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  nivelAtivo?: string;
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

export default function MioloShadowing({onSelectCorrect, onSelectWrong, unidadeAtiva,
  nivelAtivo, onValidateResult , initialExerciseData}: MioloShadowingProps) {

  

  const { user: authUser } = useAuth();
  const USER_ID_ALVO = authUser?.id;
  const userIdToQuery = authUser?.id;
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
  const GEMINI_API_KEY = "CHAVE_REVOGADA_NAO_USAR";
  // USER_ID_ALVO dinamico via useAuth

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
          

          
          
        if (!unidadeAtiva) {
        console.log("🔍 [SHADOWING] Aguardando UUID/UnidadeAtiva da Central...");
        return;
      }
      let codigoUnidade = unidadeAtiva;

        let exeDados = [];
          let error = null;
          
          // --- BYPASS: USA DADOS DA ARENA SE EXISTIREM ---
          if (typeof initialExerciseData !== 'undefined' && initialExerciseData && (initialExerciseData.id || initialExerciseData.audio_transcript || initialExerciseData.correct_answer)) {
            console.log("🔒 [SHADOWING] Usando dados da Arena:", initialExerciseData.id);
            exeDados = [initialExerciseData];
          } else {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codigoUnidade);
            let query = supabase.from("exercises").select("*").eq("activity_type", 10);
            
            if (isUUID) {
              query = query.eq("unit_id", codigoUnidade);
            } else {
              query = query.eq("unit", codigoUnidade);
            }
            
            const res = await query.limit(1);
            exeDados = res.data;
            error = res.error;
          }
          // ------------------------------------------------
        if (error) throw error;

        if (exeDados && exeDados.length > 0) {
          const frase = exeDados[0].audio_transcript || exeDados[0].correct_answer || "";
          setReferencePhrase(frase);
          audioUrlShadowingRef.current = exeDados[0].audio_url || "";
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

  const audioUrlShadowingRef = useRef<string>("");

  const playNativo = () => {
    if (audioUrlShadowingRef.current) {
      const audio = new Audio(audioUrlShadowingRef.current);
      audio.play();
      return;
    }
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
        mensagem: feedbackTraducoes.shadowing.naoOuvi(obterLangKeyCompartilhado(idiomaNativoAluno)),
        sugestao: "Intenta hablar de forma fluida frente al micrófono."
      });
      setScoreFinal(1.5);
      setFlowState("DONE");
      if (onSelectWrong) onSelectWrong();
      if (onValidateResult) {
        onValidateResult(false, incentivoIncorretoBanco || feedbackTraducoes.shadowing.naoOuvi(obterLangKeyCompartilhado(idiomaNativoAluno)), 1.5, initialExerciseData?.id);
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

      const langKeyShadow = obterLangKeyCompartilhado(idiomaNativoAluno);
      const pick3 = (pt: string, es: string, en: string) => langKeyShadow === "pt" ? pt : langKeyShadow === "en" ? en : es;

      if (notaCalculada >= 80) {
        statusResult = "EXCELENTE";
        msgPersonalizada = pick3(
          "Fantástico! Sua pronúncia está incrivelmente clara e muito próxima da frase original.",
          "¡Fantástico! Tu pronunciación es increíblemente clara y muy cercana a la frase original.",
          "Fantastic! Your pronunciation is incredibly clear and very close to the target sentence."
        );
        sugestaoPersonalizada = pick3(
          "Excelente ritmo e cadência. Continue assim!",
          "Excelente ritmo y fluidez. ¡Sigue practicando así!",
          "Excellent rhythm and cadency. Keep up the great work!"
        );
      } else if (notaCalculada >= 50) {
        statusResult = "REGULAR";
        msgPersonalizada = pick3(
          "Bom esforço! Consigo entender o que você disse, mas podemos aprimorar alguns sons.",
          "¡Buen esfuerzo! Logro entender tu frase, pero podemos pulir algunos sonidos para sonar más natural.",
          "Good effort! I can understand what you said, but we can polish some sounds."
        );
        sugestaoPersonalizada = pick3(
          "Preste atenção nas ligações entre palavras e nas sílabas silenciosas.",
          "Presta atención a cómo se unen las palabras y al ritmo natural de la frase.",
          "Pay close attention to word connections and silent syllables."
        );
      } else {
        statusResult = "INCOERENTE";
        msgPersonalizada = pick3(
          "Continue praticando! Parece que algumas palavras não foram capturadas corretamente.",
          "¡Sigue practicando! Parece que algunas palabras no fueron pronunciadas o capturadas de forma inteligible.",
          "Keep practicing! It seems some words weren't captured correctly."
        );
        sugestaoPersonalizada = pick3(
          "Tente falar um pouco mais devagar e diretamente no microfone.",
          "Intenta hablar un poco más despacio, vocalizando bien frente al micrófono.",
          "Try speaking a bit slower and directly into the microphone."
        );
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
          onValidateResult(aprovado, feedbackFinalMentora, notaFinal, initialExerciseData?.id);
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
      <div className="w-full text-center py-12 text-cyan-400 font-bold animate-pulse text-[13px] md:text-[14px] uppercase tracking-widest">
        {t?.conectando || "..."}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col font-sans select-none gap-5 p-2 overflow-hidden flex-1 min-h-0">
      
      {/* BARRA SUPERIOR DE INSTRUÇÃO MINIMALISTA */}
      <div className="flex items-center gap-2 shrink-0 px-1">
        <HelpCircle size={16} className="text-cyan-500 shrink-0 opacity-80" />
        <span className="text-[12px] md:text-[14px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
          {t?.instrucao || "Haz clic en el altavoz para escuchar la frase y luego presiona el micrófono para repetirla"}
        </span>
      </div>

      {/* CARD CENTRAL DE REPRODUÇÃO DA PRONÚNCIA DE REFERÊNCIA */}
      <div className="bg-[#080C16]/80 border border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center gap-4 flex-1 w-full animate-fade-in text-center min-h-[160px] shadow-sm">
        <button 
          type="button"
          onClick={playNativo}
          className="w-20 h-20 bg-cyan-500/10 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 rounded-full transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center active:scale-95 group"
          title="Escutar áudio"
        >
          <Volume2 size={32} className="group-hover:scale-110 transition-transform" />
        </button>
        <span className="text-[11px] md:text-[12px] text-cyan-400/80 uppercase tracking-widest font-semibold">
          Escuchar Pronunciación
        </span>
      </div>

      {/* ÁREA DE INTERAÇÃO E CONTROLES NO RODAPÉ */}
      <div className="w-full shrink-0 flex flex-col items-center justify-center gap-3 min-h-[110px]">
        
        {/* Caso: Analisando / Processando Áudio */}
        {flowState === "ANALYZING" && (
          <div className="w-full max-w-2xl bg-[#080C16]/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.12)] gap-3">
            <Sparkles size={22} className="animate-spin text-cyan-400" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-cyan-400">
              {t?.avaliando || "Avaliando"}...
            </span>
          </div>
        )}

        {/* Caso: Análise Concluída (Exibe Card de Feedback em Camadas) */}
        {flowState === "DONE" && feedback && (
          <div className="w-full max-w-2xl bg-[#080C16]/90 border border-cyan-500/30 rounded-2xl p-6 md:p-8 flex flex-col gap-3 animate-fade-in shadow-[0_0_30px_rgba(6,182,212,0.12)] text-left">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[12px] uppercase tracking-widest">
                <Sparkles size={16} />
                <span>Avaliação de Pronúncia</span>
              </div>
              <div className="text-purple-300 font-bold text-[12px] bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-500/40/30 tracking-wider shadow-sm">
                +{scoreFinal} NOTA
              </div>
            </div>

            <p className="text-[16px] text-slate-100 font-medium leading-relaxed break-words">
              {feedback.mensagem}
            </p>
          </div>
        )}

        {/* Controles de Gravação (Inativo / Gravando / Playback) */}
        {flowState !== "ANALYZING" && flowState !== "DONE" && (
          <div className="flex flex-col items-center justify-center py-1 gap-2 w-full">
            {flowState === "RECORDING" && (
              <span className="text-[12px] font-bold uppercase tracking-widest text-rose-400 animate-pulse">
                {t?.gravando || "GRAVANDO"}
              </span>
            )}
            
            <div className="flex justify-center items-center shrink-0 gap-4 min-h-[56px] w-full">
              
              {/* Microfone Pronto para Iniciar */}
              {flowState === "IDLE" && (
                <button
                  type="button"
                  onClick={iniciarGravacao}
                  className="w-14 h-14 rounded-full bg-cyan-500/10 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-center active:scale-95"
                  title="Iniciar gravação"
                >
                  <Mic size={22} />
                </button>
              )}

              {/* Botão de Parar durante Gravação */}
              {flowState === "RECORDING" && (
                <button
                  type="button"
                  onClick={pararGravacao}
                  className="w-14 h-14 rounded-full bg-rose-600 border-2 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all cursor-pointer flex items-center justify-center active:scale-95 animate-pulse"
                  title="Parar gravação"
                >
                  <Square size={20} />
                </button>
              )}

              {/* Controles de Playback / Revisão */}
              {flowState === "PLAYBACK" && (
                <div className="flex items-center gap-4 animate-fade-in shrink-0">
                  <button 
                    type="button"
                    onClick={() => { if (audioUrl) new Audio(audioUrl).play(); }}
                    className="p-3 bg-[#0E1726] hover:bg-[#162238] border border-cyan-500/30 text-cyan-400 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
                    title="Escutar gravação"
                  >
                    <Volume2 size={18} />
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setFlowState("IDLE");
                      setAudioUrl(null);
                      setTranscricaoAluno("");
                    }}
                    className="p-3 bg-purple-950/40 hover:bg-purple-950/80 border border-cyan-500/40/40 text-purple-300 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
                    title="Gravar novamente"
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button 
                    type="button"
                    onClick={processarAvaliacaoFinaMeteora}
                    className="p-3 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white rounded-full transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
                    title="Enviar para análise"
                  >
                    <Send size={18} />
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
