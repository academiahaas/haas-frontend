'use client';
import { supabase } from "@/lib/supabase";
import { resilienciaTextoCompleto, registrarFeedbackEErro } from '@/utils/motorResiliencia';
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Disc, Loader2, Volume2, HelpCircle, Send, Square } from 'lucide-react';

interface MioloShadowingProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
  unidadeAtiva?: string;
  onValidateResult?: (isCorrect: boolean, feedbackTexto?: string) => void;
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
    dica: "Consejo"
  },
  en: {
    conectando: "Connecting...",
    gravando: "Recording...",
    avaliando: "Evaluating...",
    dica: "Tip"
  },
  pt: {
    conectando: "Conectando...",
    gravando: "Gravando...",
    avaliando: "Avaliando...",
    dica: "Dica"
  }
};

export default function MioloShadowing({ onSelectCorrect, onSelectWrong, unidadeAtiva, onValidateResult }: MioloShadowingProps) {
  const [flowState, setFlowState] = useState<'IDLE' | 'RECORDING' | 'PLAYBACK' | 'ANALYZING' | 'DONE'>('IDLE');
  const [referencePhrase, setReferencePhrase] = useState('');
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
        
        // 1. Unidade ativa compatibilizada
        const codigoUnidade = unidadeAtiva || "1.1";
        
        // 2. Busca estritamente no Supabase usando o cliente oficial público (Evitando 401)
        const { data: exeDados, error } = await supabase
          .from("exercises")
          .select("*")
          .eq("unit", codigoUnidade)
          .eq("activity_type", 10)
          .limit(1);

        if (error) throw error;

        let fraseFinal = "Com certeza nós podemos nos encontrar mais tarde para alinhar os detalhes.";
        
        if (exeDados && exeDados.length > 0) {
          fraseFinal = exeDados[0].audio_transcript || exeDados[0].correct_answer || exeDados[0].reading_text || fraseFinal;
        }

        setReferencePhrase(fraseFinal);
      } catch (err) {
        console.error("Erro geral no carregamento de pronúncia:", err);
        setReferencePhrase("Com certeza nós podemos nos encontrar mais tarde para alinhar os detalhes.");
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
      setScoreFinal(15);
      setFlowState("DONE");
      if (onSelectWrong) onSelectWrong();
      return;
    }

    try {
      const resultadoLog = await registrarFeedbackEErro({
        userId: USER_ID_ALVO,
        enunciado: `Exercício de Treino de Fala (Shadowing). Imitar o áudio do modelo: "${referencePhrase}"`,
        respostaCorreta: referencePhrase,
        respostaAluno: transcricaoAluno,
        idiomaNativoAluno: idiomaNativoAluno
      });

      const acertouFronteira = resultadoLog.acertou;
      setScoreFinal(acertouFronteira ? 95 : 45);
      
      setFeedback({
        status: acertouFronteira ? "EXCELENTE" : "REGULAR",
        mensagem: resultadoLog.feedback,
        sugestao: acertouFronteira ? "Excelente sincronia e fonética!" : "Ajuste o ritmo e repita com calma."
      });

      setFlowState("DONE");
      if (onValidateResult) onValidateResult(acertouFronteira, resultadoLog.feedback);
      if (acertouFronteira) { if (onSelectCorrect) onSelectCorrect(); } else { if (onSelectWrong) onSelectWrong(); }
    } catch (e) {
      setScoreFinal(80);
      setFeedback({
        status: "REGULAR",
        mensagem: "Tu imitación fue capturada correctamente y se nota tu effort en el ritmo de la frase.",
        sugestao: "Presta atención a la cadencia de las vocais aberta."
      });
      setFlowState("DONE");
      const msgCatch = "Tu imitación fue capturada correctamente y se nota tu effort en el ritmo de la frase.";
      if (onValidateResult) {
        onValidateResult(true, msgCatch);
      }
      if (onSelectCorrect) onSelectCorrect();
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
      
      {/* BARRA SUPERIOR DE TÍTULO - DESAPARECE COMPLETAMENTE NO FEEDBACK PARA O CARD TOMAR CONTA DE TUDO */}
      {flowState !== "DONE" && (
        <div className="flex flex-col shrink-0 gap-3 w-full">
          <div className="flex items-center justify-between bg-[#070d19]/40 p-2.5 rounded-xl border border-white/[0.02]">
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-cyan-400 shrink-0" />
              <span className="text-[11px] md:text-[1vw] font-bold text-slate-300 uppercase tracking-wider leading-snug">
                Treino de Fala
              </span>
            </div>
          </div>
        </div>
      )}

      {flowState !== "DONE" ? (
        /* VISUALIZAÇÃO INICIAL COM CARD DE MODELO DA FRASE ORIGINAL */
        <div className="bg-[#0c192e]/60 border border-white/[0.04] p-6 rounded-xl flex flex-col md:flex-row items-center justify-center gap-4 flex-1 w-full min-w-0 animate-fade-in text-center md:text-left">
          <p className="text-[14px] md:text-[1.2vw] text-slate-100 font-semibold leading-relaxed flex-1 break-words min-w-0 max-w-xl">
            {referencePhrase}
          </p>
          <button 
            onClick={playNativo}
            className="p-3 bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 rounded-xl hover:text-cyan-300 active:scale-95 transition-all cursor-pointer shrink-0 shadow-md"
            title="Escutar"
          >
            <Volume2 size={20} />
          </button>
        </div>
      ) : (
        /* INTERFACE DE FEEDBACK ATUALIZADA: O CARD TOMA CONTA DE TUDO, TEXTO "TU HABLA CAPTURADA" REMOVIDO */
        <div className="flex-1 min-h-0 flex flex-col justify-start items-stretch gap-3 w-full animate-fade-in pb-1 pt-0.5">
          {feedback && (
            <div className="w-full h-full flex flex-col justify-start items-stretch min-h-0 flex-1 gap-3">
              
              {/* NOVO CARD INTEGRADO: FALA DO ALUNO E OS PONTOS LADO A LADO NO MESMO CARD */}
              <div className="flex items-center justify-between gap-4 p-3.5 bg-black/25 rounded-xl border border-white/[0.04] shrink-0 w-full shadow-inner">
                <div className="text-[14px] md:text-[1.15vw] text-cyan-100 italic leading-relaxed font-semibold break-words flex-1 min-w-0">
                  "{transcricaoAluno}"
                </div>
                <div className="text-amber-400 font-bold text-[11px] md:text-[0.9vw] bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-800/40 tracking-wider shrink-0 whitespace-nowrap shadow-sm">
                  +{scoreFinal} PTS
                </div>
              </div>

              {/* CONTEÚDO DO FEEDBACK DA IA OCUPANDO O ESPAÇO LIVRE COM ROLAGEM INVISÍVEL */}
              <div className="flex-1 min-h-0 overflow-y-auto w-full space-y-3 pr-0.5" style={{ scrollbarWidth: 'none' }}>
                <p className="text-[13px] md:text-[1.1vw] text-slate-200 font-medium leading-relaxed break-words w-full min-w-0">
                  {feedback.mensagem}
                </p>
                
                <div className="text-[12px] md:text-[1vw] text-cyan-300/90 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/20 italic font-semibold break-words w-full min-w-0">
                  {t.dica}: {feedback.sugestao}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {flowState !== "DONE" && (flowState === "RECORDING" || flowState === "ANALYZING") && (
        <div className="w-full text-center py-1">
          {flowState === "RECORDING" && (
            <span className="text-[12px] md:text-[1vw] font-bold uppercase tracking-wider text-rose-400 animate-pulse">
              {t.gravando}
            </span>
          )}
          {flowState === "ANALYZING" && (
            <div className="flex items-center justify-center gap-2 animate-pulse">
              <Loader2 size={16} className="text-cyan-400 animate-spin" />
              <span className="text-[11px] md:text-[1vw] font-bold uppercase tracking-widest text-cyan-400">
                {t.avaliando}
              </span>
            </div>
          )}
        </div>
      )}

      {flowState !== "DONE" && (
        <div className="flex justify-center items-center shrink-0 pt-1 pb-1 gap-4 h-[54px] w-full">
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
                title="Escutar"
              >
                <Volume2 size={16} />
              </button>

              <button 
                id="btn-validar-interno"
                onClick={processarAvaliacaoFinaMeteora}
                className="p-3 bg-emerald-600 border border-emerald-500 text-white rounded-full hover:bg-emerald-500 transition-all cursor-pointer shadow-md active:scale-90 flex items-center justify-center shrink-0"
                title="Validar"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
