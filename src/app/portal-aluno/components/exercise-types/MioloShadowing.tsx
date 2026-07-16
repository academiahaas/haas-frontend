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
  },
  en: {
    conectando: "Connecting...",
    gravando: "Recording...",
    avaliando: "Evaluating...",
  },
  pt: {
    conectando: "Conectando...",
    gravando: "Gravando...",
    avaliando: "Avaliando...",
  }
};

export default function MioloShadowing({ onSelectCorrect, onSelectWrong, unidadeAtiva, onValidateResult }: MioloShadowingProps) {
  const [flowState, setFlowState] = useState<'IDLE' | 'RECORDING' | 'ANALYZING' | 'DONE'>('IDLE');
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

        if (!codigoUnidade) {
          setCarregando(false);
          return;
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codigoUnidade);
        let query = supabase.from("exercises").select("*").eq("activity_type", 10);

        if (isUUID) {
          query = query.eq("unit_id", codigoUnidade);
        } else {
          const { data: firstActive } = await supabase.from('exercises').select('unit_id').eq('activity_type', 10).limit(1);
          if (firstActive && firstActive.length > 0) {
            query = query.eq('unit_id', firstActive[0].unit_id);
          } else {
            query = query.eq("unit", "1.1");
          }
        }

        const { data: exeDados, error } = await query;
        if (error) throw error;

        if (exeDados && exeDados.length > 0) {
          const frase = exeDados[0].audio_transcript || "";
          setReferencePhrase(frase);
        } else {
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
    
    // Transiciona para analisando e executa processamento automático imediatamente
    setFlowState("ANALYZING");
    setTimeout(() => {
      enviarParaAnalise();
    }, 800);
  };

  const enviarParaAnalise = () => {
    const textOriginal = referencePhrase.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    const textAluno = transcricaoAluno.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    
    const coincidencia = textOriginal === textAluno || textOriginal.includes(textAluno) || textAluno.includes(textOriginal);
    
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
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4 text-slate-300">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
        <span className="text-[14px]">{t?.conectando || "Carregando..."}</span>
      </div>
    );
  }

  if (!referencePhrase) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <p>Nenhuma frase de pronúncia encontrada para esta unidade no banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-4 items-center">
      
      {/* Box do Alto-falante centralizado */}
      <div className="w-full h-48 bg-[#0a1324]/50 border border-white/[0.05] rounded-2xl flex items-center justify-center">
        <button 
          onClick={playNativo}
          disabled={flowState === "RECORDING"}
          className={`p-5 rounded-2xl border transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${
            flowState === "RECORDING" 
              ? "bg-[#081121] border-slate-800 text-slate-600 cursor-not-allowed" 
              : "bg-[#0e1e31] border-cyan-500/30 text-cyan-400 hover:bg-[#12273f]"
          }`}
          title="Escutar"
        >
          <Volume2 size={36} />
        </button>
      </div>

      {/* Botões Inferiores padronizados */}
      <div className="flex flex-col items-center gap-4 mt-2">
        {flowState === "IDLE" && (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-[#0e1e31] border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-[#12273f] hover:scale-105 active:scale-95 transition-all shadow-lg"
            title="Começar a Gravar"
          >
            <Mic size={28} />
          </button>
        )}

        {flowState === "RECORDING" && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-900 transition-all shadow-lg animate-pulse"
              title="Parar Gravação"
            >
              <Square size={24} />
            </button>
            <span className="text-xs text-red-400 animate-pulse">{t?.gravando || "Gravando..."}</span>
          </div>
        )}

        {flowState === "ANALYZING" && (
          <div className="flex flex-col items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="animate-spin text-cyan-500" size={28} />
            <span>{t?.avaliando || "Avaliando..."}</span>
          </div>
        )}

        {flowState === "DONE" && (
          <button
            onClick={() => setFlowState("IDLE")}
            className="px-6 py-2.5 bg-[#0e1e31] border border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-[#12273f] transition-all text-sm font-semibold"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
}
