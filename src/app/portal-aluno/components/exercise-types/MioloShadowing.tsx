'use client';
import { supabase } from "@/lib/supabase";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, Volume2, Square } from 'lucide-react';

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

  useEffect(() => {
    async function carregarCenarioShadowing() {
      try {
        setCarregando(true);
        const codigoUnidade = unidadeAtiva;

        console.log("📣 [SHADOWING] Executando busca real para unidadeAtiva:", codigoUnidade);

        if (!codigoUnidade) {
          setCarregando(false);
          return;
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codigoUnidade);
        let query = supabase.from("exercises").select("*").eq("activity_type", 10);

        if (isUUID) {
          query = query.eq("unit_id", codigoUnidade);
        } else {
          const unitFallback = (codigoUnidade === "0" || codigoUnidade === "1") ? "1.1" : codigoUnidade;
          query = query.eq("unit", unitFallback);
        }

        const { data: exeDados, error } = await query;

        if (error) throw error;

        if (exeDados && exeDados.length > 0) {
          // Busca estritamente a coluna audio_transcript sem mascaras ou fallbacks inventados
          const frase = exeDados[0].audio_transcript || "";
          setReferencePhrase(frase);
          console.log("🟢 [SHADOWING] Sucesso! Frase real carregada do banco:", frase);
        } else {
          console.warn("⚠️ Sem exercícios do tipo 10 para o código:", codigoUnidade);
          setReferencePhrase("");
        }
      } catch (err) {
        console.error("❌ Erro ao buscar dados do Supabase:", err);
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
        vozes.find(v => v.lang.includes("pt-BR") && v.name.includes("Daniela")) ||
        vozes.find(v => v.lang.includes("pt-BR"));

      if (vozHumanaLocal) utterance.voice = vozHumanaLocal;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      setTranscricaoAluno("");
      setAudioUrl(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e){}
      }
      setFlowState("RECORDING");
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    setFlowState("PLAYBACK");
  };

  const enviarParaAnalise = async () => {
    setFlowState("ANALYZING");
    
    const textOriginal = referencePhrase.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    const textAluno = transcricaoAluno.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    
    const coincidencia = textOriginal === textAluno || textOriginal.includes(textAluno) || textAluno.includes(textOriginal);
    
    setTimeout(() => {
      if (coincidencia) {
        setScoreFinal(100);
        setFeedback({
          status: "EXCELENTE",
          mensagem: "Excelente pronúncia! Suas palavras coincidem perfeitamente com o modelo falado.",
          sugestao: "Continue praticando para manter a fluidez natural."
        });
        if (onSelectCorrect) onSelectCorrect();
        if (onValidateResult) onValidateResult(true, "Excelente pronúncia!");
      } else {
        setScoreFinal(50);
        setFeedback({
          status: "REGULAR",
          mensagem: `A transcrição obtida foi: "${transcricaoAluno || "áudio não reconhecido"}".`,
          sugestao: "Tente falar pausadamente e mais próximo ao microfone."
        });
        if (onSelectWrong) onSelectWrong();
        if (onValidateResult) onValidateResult(false, "Pronúncia precisa de ajustes.");
      }
      setFlowState("DONE");
    }, 1500);
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4 text-slate-300">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
        <span className="text-[14px]">{t?.conectando || "Carregando..."}</span>
      </div>
    );
  }

  // Se não houver frase carregada de verdade do banco, exibe um estado limpo sem inventar fallbacks falsos
  if (!referencePhrase) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <p>Nenhuma frase de pronúncia encontrada para esta unidade no banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-4">
      {flowState !== "DONE" ? (
        <div className="bg-[#0c192e]/60 border border-white/[0.04] p-6 rounded-xl flex flex-col md:flex-row items-center justify-center gap-4 flex-1 w-full text-center md:text-left">
          <p className="text-[16px] md:text-[1.1rem] text-slate-100 font-semibold leading-relaxed flex-1 break-words">
            {referencePhrase}
          </p>
          <button 
            onClick={playNativo}
            className="p-3 bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 rounded-xl hover:text-cyan-300 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Escutar"
          >
            <Volume2 size={24} />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-xl text-center">
          <h3 className="text-emerald-400 font-bold text-lg mb-2">Pontuação: {scoreFinal}/100</h3>
          <p className="text-slate-300 text-sm mb-4">{feedback?.mensagem}</p>
          <p className="text-slate-400 text-xs italic">{feedback?.sugestao}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 mt-4">
        {flowState === "IDLE" && (
          <button
            onClick={startRecording}
            className="p-6 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 transition-all shadow-lg hover:scale-105 active:scale-95"
            title="Começar a Gravar"
          >
            <Mic size={32} />
          </button>
        )}

        {flowState === "RECORDING" && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={stopRecording}
              className="p-6 bg-red-600 text-white rounded-full hover:bg-red-500 transition-all shadow-lg animate-pulse"
              title="Parar Gravação"
            >
              <Square size={32} />
            </button>
            <span className="text-xs text-red-400 animate-pulse">{t?.gravando || "Gravando..."}</span>
          </div>
        )}

        {flowState === "PLAYBACK" && (
          <div className="flex gap-4">
            <button
              onClick={startRecording}
              className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all text-sm font-semibold"
            >
              Gravar Novamente
            </button>
            <button
              onClick={enviarParaAnalise}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-all text-sm font-semibold shadow-md"
            >
              Analisar Pronúncia
            </button>
          </div>
        )}

        {flowState === "ANALYZING" && (
          <div className="flex flex-col items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="animate-spin text-cyan-500" size={24} />
            <span>{t?.avaliando || "Avaliando..."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
