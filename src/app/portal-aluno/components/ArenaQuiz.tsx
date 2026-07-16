"use client";
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../idiomas';
import { Mic, ArrowUp, Flame, Target, Award, Zap, Bot, Video, BookOpen, X, AlertCircle, Star, Trophy, CheckCircle2, TrendingUp, Gift, Sparkles } from 'lucide-react';

import MioloMultiplaEscolha from './exercise-types/MioloMultiplaEscolha';
import MioloCacaErro from './exercise-types/MioloCacaErro';
import MioloBlitzChallenge from './exercise-types/MioloBlitzChallenge';
import DitadoLacunas from './exercise-types/DitadoLacunas';
import MioloBlocos from './exercise-types/MioloBlocos';
import MioloLeituraRapida from './exercise-types/MioloLeituraRapida';
import MioloOrdenacao from './exercise-types/MioloOrdenacao';
import MioloReordenacaoParagrafos from './exercise-types/MioloReordenacaoParagrafos';
import MioloRoleplay from './exercise-types/MioloRoleplay';
import MioloShadowing from './exercise-types/MioloShadowing';
import MioloSpellingBee from './exercise-types/MioloSpellingBee';
import MioloTraducaoInversa from './exercise-types/MioloTraducaoInversa';
import MioloVelocidadeProgressiva from './exercise-types/MioloVelocidadeProgressiva';

interface ArenaProps {
  isOpen?: boolean;
  onClose?: () => void;
  userId?: string;
  idiomaAtivo?: string;
  subUnidadeTipo?: 'gramatica' | 'vocabulario' | null;
  subUnidadeIndex?: number | null;
}

export default function ArenaQuiz({ isOpen, onClose, userId, idiomaAtivo, onAbrirPedagogo, subUnidadeTipo, subUnidadeIndex }: ArenaProps & { onAbrirPedagogo?: (tipo: "TEXTO" | "VIDEO") => void }) {
  const currentLang = (idiomaAtivo || (typeof window !== 'undefined' ? localStorage.getItem('language') || localStorage.getItem('lang') || 'PT' : 'PT')).toUpperCase();
  const [visualizacaoAtiva, setVisualizacaoAtiva] = useState<"EXERCICIO" | "TRILHA_VIDEOS" | "PLAYER_VIDEO" | "TRILHA_TEXTOS" | "TEXTO_PEDAGOGO">("EXERCICIO");
  const [videoSelecionado, setVideoSelecionado] = useState<any>(null);
    const [dadosLicaoEscrita, setDadosLicaoEscrita] = useState<any>(null);
  const [carregandoTexto, setCarregandoTexto] = useState<boolean>(false);
  const [textoSelecionadoId, setTextoSelecionadoId] = useState<number | null>(null);

  useEffect(() => {
    async function carregarDadosLicao() {
      if (!subUnidadeIndex) return;
      setCarregandoTexto(true);
      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("title, body_content, level, module, unit")
          .eq("id", subUnidadeIndex)
          .single();
        
        if (data) {
          setDadosLicaoEscrita(data);
        }
      } catch (err) {
        console.error("Erro ao buscar licao escrita:", err);
      } finally {
        setCarregandoTexto(false);
      }
    }
    carregarDadosLicao();
  }, [subUnidadeIndex]);

  const totalConteudosTrilha = Array.from({ length: 105 }, (_, i) => ({
    id: i + 1,
    unidadePertencente: Math.floor(i / 5) + 1
  }));



  

  const arenaDict = {
    PT: {
      mentorName: "⚛︎ MENTORA HAAS",
      precisionLabel: "PRECISÃO",
      mentorFire: "Como posso te ajudar com este desafio hoje? Tire suas dúvidas comigo!",
      chatPlaceholder: "Tire suas dúvidas aqui...",
      unit: "UNIDADE",
      stage: "ETAPA",
      of: "DE",
      close: "✕ ENCERRAR SESSÃO",
      skip: "IGNORAR ETAPA ➔",
      validate: "SUBMETER",
      next: "PROSSEGUIR",
      ask: "Perguntar",
      guide: "Diretrizes Textuais",
      media: "Conteúdo Audiovisual"
    },
    EN: {
      mentorName: "⚛︎ HAAS MENTOR",
      precisionLabel: "PRECISION",
      mentorFire: "How can I help you with this challenge today? Ask me any questions!",
      chatPlaceholder: "Ask your questions here...",
      unit: "UNIT",
      stage: "STAGE",
      of: "OF",
      close: "✕ CLOSE ARENA",
      skip: "SKIP STEP ➔",
      validate: "SUBMIT",
      next: "PROCEED",
      ask: "Ask",
      guide: "Textual Rules Guide"
    },
    ES: {
      mentorName: "⚛︎ MENTORA HAAS",
      precisionLabel: "PRECISIÓN",
      mentorFire: "¿Cómo puedo ayudarte con este desafío hoy? ¡Resuelve tus dudas conmigo!",
      chatPlaceholder: "Resuelva sus dudas aquí...",
      unit: "UNIDAD",
      stage: "ETAPA",
      of: "DE",
      close: "✕ CERRAR ARENA",
      skip: "SALTAR ETAPA ➔",
      validate: "SUBMETER",
      next: "PRÓXIMA MISIÓN ➔",
      ask: "Preguntar",
      guide: "Guía de Norma Textual",
      media: "Contenido Audiovisual"
    }
  };

  const tArena = arenaDict[currentLang] || arenaDict.PT;

  const [jogoSelecionado, setJogoSelecionado] = useState('paragrafos');
  const [alunoNivel, setAlunoNivel] = useState("A1");
  const [proficienciaMedia, setProficienciaMedia] = useState(0);
  const [menuDevAberto, setMenuDevAberto] = useState(false);
  
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const carregarComboBanco = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!supabaseUrl) return;
        
        const res = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=current_combo`, {
          headers: {
            "apikey": supabaseAnonKey,
            "Authorization": `Bearer ${supabaseAnonKey}`
          }
        });
        const dados = await res.json();
        console.log("=== 📊 RETORNO SUPABASE XP UNIDADE ===>", dados);
        if (dados && dados[0] && dados[0].current_combo !== undefined) {
          setStreak(dados[0].current_combo);
        }
      } catch (err) {
        console.error("Erro ao carregar current_combo da Arena:", err);
      }
    };
    carregarComboBanco();
  }, [userId]);
  const [precision, setPrecision] = useState(94);
  const [nomeUsuarioReal, setNomeUsuarioReal] = useState("");
  const [idiomaNativoReal, setIdiomaNativoReal] = useState("Portuguese");

  useEffect(() => {
    if (!userId) return;
    const carregarPrecisaoBanco = async () => {
      try {
        const { createClient } = require("@supabase/supabase-js");
        // Captura a instância global do supabase se houver, ou usa a lógica de fallback estável
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!supabaseUrl) return;
        
        // Faz o fetch direto via fetch clássico para evitar quebras de importação de arquivos internos
        const res = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=clinical_precision,name,native_language`, {
          headers: {
            "apikey": supabaseAnonKey,
            "Authorization": `Bearer ${supabaseAnonKey}`
          }
        });
        const dados = await res.json();
        console.log("=== 📊 RETORNO SUPABASE XP UNIDADE ===>", dados);
        if (dados && dados[0] && dados[0].clinical_precision !== undefined) {
          setPrecision(dados[0].clinical_precision);
        }
        if (dados && dados[0]) {
          if (dados[0].name) {
            const primeiroNome = dados[0].name.split(" ")[0];
            setNomeUsuarioReal(primeiroNome);
          } else {
            setNomeUsuarioReal("Estudante");
          }
          if (dados[0].native_language) {
            setIdiomaNativoReal(dados[0].native_language);
          }
        }
      } catch (err) {
        console.error("Erro ao sincronizar precisão da Arena:", err);
      }
    };
    carregarPrecisaoBanco();
  }, [userId]);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  const [xpUnidade, setXpUnidade] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const carregarXpUnidade = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!supabaseUrl) return;
        
        // Puxa o progresso de unidade associado ao aluno ordenando pelo mais recente
        const targetUnitId = "e9b8fc2c-5d21-45d8-a86e-a21fc1bb4b79";
        const res = await fetch(`${supabaseUrl}/rest/v1/user_unit_progress?user_id=eq.b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1&unit_id=eq.${targetUnitId}&select=unit_xp`, {
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4"
          }
        });
        const dados = await res.json();
        console.log("=== 📊 RETORNO SUPABASE XP UNIDADE ===>", dados);
        if (dados && dados[0] && dados[0].unit_xp !== undefined) {
          setXpUnidade(dados[0].unit_xp);
        } else {
          setXpUnidade(0); // Fallback padrão caso seja a primeira unidade da trilha
        }
      } catch (err) {
        console.error("Erro ao carregar xpUnidade da Arena:", err);
        setXpUnidade(0);
      }
    };
    carregarXpUnidade();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const carregarXpBanco = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!supabaseUrl) return;
        
        const res = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=total_xp`, {
          headers: {
            "apikey": supabaseAnonKey,
            "Authorization": `Bearer ${supabaseAnonKey}`
          }
        });
        const dados = await res.json();
        console.log("=== 📊 RETORNO SUPABASE XP UNIDADE ===>", dados);
        if (dados && dados[0] && dados[0].total_xp !== undefined) {
          setXpAcumulado(dados[0].total_xp);
        }
      } catch (err) {
        console.error("Erro ao carregar total_xp da Arena:", err);
      }
    };
    carregarXpBanco();
  }, [userId]);

  // @ts-ignore
  const dispararSomCliqueSintetico = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {
      console.warn("Erro ao reproduzir clique sintetico:", e);
    }
  };

  const tocarSom = (tipo) => { if (typeof window !== 'undefined' && (window as any).tocarSomNativoPremium) { (window as any).tocarSomNativoPremium(tipo); } };
  const [unidadesConcluidas, setUnidadesConcluidas] = useState(0);
  const [totalUnidadesModulo, setTotalUnidadesModulo] = useState(0);
  const [numeroUnidadeReal, setNumeroUnidadeReal] = useState("");

  useEffect(() => {
    const puxarEstrelasDoBanco = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const currentUnitId = typeof subUnidadeIndex === "string" ? subUnidadeIndex : "e9b8fc2c-5d21-45d8-a86e-a21fc1bb4b79";
        const userIdFixo = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

        // 1. Pega as etiquetas da unidade atual na tabela cheia
        const resUnidade = await fetch(`${supabaseUrl}/rest/v1/units?id=eq.${currentUnitId}&select=module_number,level,unit_number`, {
          headers: { "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4" }
        });
        const dadosUnidade = await resUnidade.json();
        if (!dadosUnidade || dadosUnidade.length === 0) return;
        
        const modNum = dadosUnidade[0].module_number;
        const lvl = dadosUnidade[0].level;
        if (dadosUnidade[0].unit_number !== undefined && dadosUnidade[0].unit_number !== null) {
          setNumeroUnidadeReal(String(dadosUnidade[0].unit_number).padStart(2, "0"));
        }

        // 2. Filtra o tabelão gigante pegando apenas o bloco correspondente (Descobre o total Y)
        const resFiltrado = await fetch(`${supabaseUrl}/rest/v1/units?module_number=eq.${modNum}&level=eq.${lvl}&select=id`, {
          headers: { "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4" }
        });
        const unidadesDoBloco = await resFiltrado.json();
        setTotalUnidadesModulo(unidadesDoBloco.length || 0);

        // 3. Verifica quantas dessas o aluno já completou
        if (unidadesDoBloco.length > 0) {
          const idsString = unidadesDoBloco.map((u: any) => u.id).join(",");
          const resProgresso = await fetch(`${supabaseUrl}/rest/v1/user_unit_progress?user_id=eq.${userIdFixo}&unit_id=in.(${idsString})&select=unit_id`, {
            headers: { "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4" }
          });
          const progresso = await resProgresso.json();
          setUnidadesConcluidas(progresso.length || 0);
        }
      } catch (err) {
        console.error("Erro no motor de estrelas:", err);
      }
    };
    puxarEstrelasDoBanco();
  }, [userId, xpUnidade]);
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  useEffect(() => {
    const puxarProficienciaDoBanco = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const userIdFixo = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
        const cm = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
        const resUser = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userIdFixo}&select=current_level`, { headers: { "apikey": cm, "Authorization": `Bearer ${cm}` } });
        const dadosUser = await resUser.json();
        if (dadosUser && dadosUser[0] && dadosUser[0].current_level) setAlunoNivel(dadosUser[0].current_level);
        const resComp = await fetch(`${supabaseUrl}/rest/v1/user_competencias?user_id=eq.${userIdFixo}&select=habla,escucha,lectura,escritura,gramatica`, { headers: { "apikey": cm, "Authorization": `Bearer ${cm}` } });
        const dadosComp = await resComp.json();
        if (dadosComp && dadosComp[0]) {
          const { habla, escucha, lectura, escritura, gramatica } = dadosComp[0];
          setProficienciaMedia(Math.round(((habla||0)+(escucha||0)+(lectura||0)+(escritura||0)+(gramatica||0))/5));
        }
      } catch (err) { console.error(err); }
    };
    puxarProficienciaDoBanco();
  }, [userId, xpUnidade]);
  const [isCollectingReward, setIsCollectingReward] = useState(false);
  const [comboQuebrado, setComboQuebrado] = useState(false);
  const [caixaAberta, setCaixaAberta] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      cancelVoiceRecording();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      isCancelledRef.current = false;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (isCancelledRef.current) {
          audioChunksRef.current = [];
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) return;
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) return;
          perguntarAoMentor(null, base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkSilence = () => {
        if (!mediaRecorderRef.current || mediaRecorder.state !== 'recording') return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;

        if (average < 10) {
          if (!silenceTimeoutRef.current) {
            silenceTimeoutRef.current = setTimeout(() => {
              stopVoiceRecording();
            }, 1500);
          }
        } else {
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        }
        if (mediaRecorder.state === 'recording') {
          requestAnimationFrame(checkSilence);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      requestAnimationFrame(checkSilence);
    } catch (err) {
      console.error("Erro ao acessar microfone", err);
    }
  };

    const cancelVoiceRecording = () => {
    isCancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setIsRecording(false);
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setIsRecording(false);
  };
  
  const [respostaIA, setRespostaIA] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [msgEscritaAleatoria, setMsgEscritaAleatoria] = useState("");
  const [tipoEnvio, setTipoEnvio] = useState("");
  
  useEffect(() => {
    let interval: any;
    if (isThinking) {
      setThinkingTime(0);
            const frasesPT = [
        "Analisando sua mensagem...",
        "Processando o texto enviado...",
        "Buscando a melhor resposta pedagógica...",
        "Ajustando os tópicos da explicação...",
        "Validando a estrutura da sua dúvida..."
      ];

      const frasesEN = [
        "Analyzing your message...",
        "Processing the submitted text...",
        "Searching for the best pedagogical response...",
        "Adjusting the topics of the explanation...",
        "Validating the structure of your question..."
      ];

      const frasesES = [
        "Analizando tu mensaje...",
        "Procesando el texto enviado...",
        "Buscando la mejor respuesta pedagógica...",
        "Ajustando los temas de la explicación...",
        "Validando la estructura de tu duda..."
      ];

      const frasesEscrita = currentLang === "EN" ? frasesEN : currentLang === "ES" ? frasesES : frasesPT;
      
      const inicial = Math.floor(Math.random() * frasesEscrita.length);
      setMsgEscritaAleatoria(frasesEscrita[inicial]);
      
      interval = setInterval(() => {
        setThinkingTime(prev => {
          const nextTime = prev + 1;
          if (nextTime % 3 === 0) {
            const novoIndice = Math.floor(Math.random() * frasesEscrita.length);
            setMsgEscritaAleatoria(frasesEscrita[novoIndice]);
          }
          return nextTime;
        });
      }, 1000);
    } else {
      setThinkingTime(0);
    }
    return () => clearInterval(interval);
  }, [isThinking]);

        const getThinkingMessage = () => {
      if (tipoEnvio === "texto") {
        const frasesTexto = {
          PT: ["Analisando sua mensagem...", "Preparando uma explicação clara...", "Lapidando os detalhes da resposta..."],
          EN: ["Analyzing your message...", "Preparing a clear explanation...", "Polishing the response details..."],
          ES: ["Analizando tu mensaje...", "Preparando una explicación clara...", "Puliendo los detalles de la respuesta..."]
        };
        const lista = frasesTexto[currentLang as 'PT' | 'EN' | 'ES'] || frasesTexto.PT;
        return lista[thinkingTime % lista.length];
      }

      const blocosPT = [
        ["Recebi seu áudio! Já estou estruturando sua resposta...", "Excelente pergunta! Deixe-me organizar a melhor explicação para você."],
        ["Analisando sua pronúncia e o contexto linguístico de perto...", "Revisando a estrutura gramatical para trazer os melhores insights."],
        ["Buscando exemplos práticos e claros para ilustrar a regra...", "Formatando dicas exclusivas para facilitar seu aprendizado agora."],
        ["Aprofundando a análise teórica para blindar sua dúvida...", "Lapidando os detalhes finais do seu feedback de conversação."],
        ["Quase pronto! Gerando seu arquivo de áudio explicativo...", "Sintetizando nossa resposta em formato de voz nativa..."]
      ];

      const blocosEN = [
        ["Got your audio! Structuring your response now...", "Great question! Let me arrange the best explanation for you."],
        ["Analyzing your pronunciation and linguistic context closely...", "Reviewing the grammatical structure to bring you the best insights."],
        ["Finding clear, practical examples to illustrate the rule...", "Formatting exclusive tips to power up your learning right now."],
        ["Deepening theoretical analysis to clear up any doubts...", "Polishing the final details of your conversational feedback."],
        ["Almost ready! Generating your explanatory audio file...", "Synthesizing our response into native voice format..."]
      ];

      const blocosES = [
        ["¡Recibí tu audio! Ya estoy estructurando tu respuesta...", "¡Excelente pregunta! Déjame organizar la mejor explicación para ti."],
        ["Analizando tu pronunciación y contexto lingüístico de cerca...", "Revisando la estructura gramatical para darte los mejores insights."],
        ["Buscando ejemplos prácticos y claros para ilustrar la regla...", "Preparando consejos exclusivos para facilitar tu aprendizaje ahora."],
        ["Profundizando en el análisis teórico para resolver tu duda...", "Puliendo los detalles finales de tu feedback de conversación."],
        ["¡Casi listo! Generando tu archivo de audio explicativo...", "Sintetizando nuestra respuesta en formato de voz nativa..."]
      ];

      const blocos = currentLang === "EN" ? blocosEN : currentLang === "ES" ? blocosES : blocosPT;
      let indiceBloco = Math.floor(thinkingTime / 2);
      if (indiceBloco > 4) indiceBloco = 4;

      const blocoAtual = blocos[indiceBloco];
      const hash = (thinkingTime + 7) % blocoAtual.length;
      return blocoAtual[hash];
    };

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [desafioIniciado, setDesafioIniciado] = useState(false);
  const [contagem, setContagem] = useState(0);
  const currentAudioRef = typeof window !== 'undefined' ? (globalThis as any).currentAudioRef || { current: null } : { current: null };
  if (typeof window !== 'undefined') { (globalThis as any).currentAudioRef = currentAudioRef; }

  const interromperMentora = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      } catch (e) {}
    }
    setIsSpeaking(false);
    setIsThinking(false);
  };

  // EXECUÇÃO DO PLAYER DE ÁUDIO VIA BASE64 DIRETO DO JSON
  const perguntarAoMentor = async (e: any, audioBase64 = null) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    if (e) e.preventDefault();
    
    const textoParaEnviar = chatInput ? chatInput.trim() : "";
    if (!audioBase64 && !textoParaEnviar) return;

    setChatInput('');
    setTipoEnvio(audioBase64 ? "audio" : "texto");
    setIsThinking(true);
    setRespostaIA('');

    try {
      const response = await fetch('/api/mascote-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: audioBase64 ? "" : textoParaEnviar,
          audio: audioBase64,
        })
      });
      
      const data = await response.json();
      
      if (data && data.text) {
        setRespostaIA(data.text);
        
        // TOCAR O ÁUDIO EM BASE64 SE ELE EXISTIR NA RESPOSTA
        if (data.audio && audioBase64) {
          if (currentAudioRef.current) {
            try { currentAudioRef.current.pause(); } catch(e){}
          }
          const audioPlay = new Audio("data:audio/mp3;base64," + data.audio);
          currentAudioRef.current = audioPlay;
          setIsSpeaking(true);
          audioPlay.onended = () => setIsSpeaking(false);
          audioPlay.play().catch(err => {
            console.error("Erro ao rodar áudio Base64:", err);
            setIsSpeaking(false);
          });
        }
      } else if (data && data.error) {
        setRespostaIA("Tive um problema: " + data.error);
      } else {
        setRespostaIA("Desculpe, não consegui processar a resposta estruturada.");
      }

    } catch (err) {
      console.error("Erro ao conectar com a IA do Core:", err);
      setRespostaIA("Desculpe. Tive um problema de conexão. Pode tentar novamente?");
    } finally {
      setIsThinking(false);
    }
  };

  const [modalPedagogo, setModalPedagogo] = useState<{ aberto: boolean; tipo: 'VIDEO' | 'TEXTO' | null }>({
    aberto: false,
    tipo: null
  });

  const getMultiplicador = () => {
    if (streak >= 10) return 2.0;
    if (streak >= 5) return 1.5;
    if (streak >= 3) return 1.2;
    return 1.0;
  };

    // Sincroniza o ganho de XP da unidade com o Supabase usando UPSERT
  const sincronizarXpUnidadeComBanco = async (novoXpTotalDaUnidade: number) => {
    // Atualiza imediatamente o estado visual local para dar fluidez e não travar as próximas questões
    setXpUnidade(novoXpTotalDaUnidade);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const finalUserId = userId || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
      if (!supabaseUrl) return;

      const targetUnitId = "e9b8fc2c-5d21-45d8-a86e-a21fc1bb4b79";

      // Chamada HTTP via POST com a flag de ON CONFLICT do Supabase para fazer Upsert automático
      await fetch(`${supabaseUrl}/rest/v1/user_unit_progress?on_conflict=user_id,unit_id`, {
        method: "POST",
        headers: {
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4",
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({
          user_id: "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1",
          unit_id: targetUnitId,
          unit_xp: novoXpTotalDaUnidade,
          completed_at: new Date().toISOString()
        })
      });
      
      
    } catch (err) {
      console.error("Erro ao sincronizar XP com o Supabase:", err);
    }
  };

  const handleNextMission = () => {
    setDesafioIniciado(false);
    setContagem(0);
    setGameStatus('IDLE');
    setComboQuebrado(false);
    setCaixaAberta(false);
    const idx = todosOsJogos.findIndex(j => j.id === jogoSelecionado);
    const proximoIdx = idx === -1 || idx === todosOsJogos.length - 1 ? 0 : idx + 1;
    setJogoSelecionado('');
    setTimeout(() => setJogoSelecionado(todosOsJogos[proximoIdx].id), 10);
  };

  const handleValidationResult = (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number) => {
    // 1. Controle da fala da Mentora Haas para Shadowing e Roleplay
    if (jogoSelecionado === 'shadowing' || jogoSelecionado === 'roleplay') {
      if (feedbackTexto && feedbackTexto !== "MANTER_MENTORA_INTACTA") {
        setRespostaIA(feedbackTexto);
      }
    } else {
      // Comportamento padrão dos outros jogos
      if (feedbackTexto === "MANTER_MENTORA_INTACTA") {
        // Mantém intacto
      } else if (feedbackTexto) {
        setRespostaIA(feedbackTexto);
      } else {
        setRespostaIA("");
      }
    }

    // 2. Consolidação de Pontuação e Progresso (Comum para todos, incluindo Shadowing e Roleplay)
    const baseXP = pontosCustom || (isCorrect ? 25 : 0);
    const xpGanho = Math.round(baseXP * getMultiplicador());
    
    if (xpGanho > 0) {
      setXpAcumulado(prev => prev + xpGanho);
      sincronizarXpUnidadeComBanco(xpUnidade + xpGanho);
    }

    if (isCorrect) {
      setGameStatus('CORRECT');
      tocarSom('success');
      setStreak(prev => prev + 1);
      setIsCollectingReward(true);
    } else {
      setGameStatus('WRONG');
      tocarSom('error');
      setPrecision(prev => Math.max(prev - 4, 60));
      if (streak > 0) {
        setComboQuebrado(true);
        setStreak(0);
      }
    }
  };

  const todosOsJogos = [
    { id: 'escolha', label: 'MÚLTIPLA ESCOLHA', title: 'SELEÇÃO CONTEXTUAL', component: <MioloMultiplaEscolha status={gameStatus} onValidateResult={handleValidationResult} onSelectionChange={(hasItems) => setDesafioIniciado(hasItems)} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> },
    { id: 'caca_erro', label: 'CAÇA ERRO', title: 'CORREÇÃO SINTÁTICA', component: <MioloCacaErro onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> },
    { id: 'blitz', label: 'DESAFIO BLITZ', title: 'RECONHECIMENTO RÁPIDO', component: <MioloBlitzChallenge onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> },
    { id: 'ditado', label: 'PALAVRA OCULTA', title: 'FIXAÇÃO ACÚSTICA', component: <DitadoLacunas onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> },
    { id: 'blocos', label: 'BLOCOS DE GRAMÁTICA', title: 'CONSTRUÇÃO ESTRUTURAL', component: <MioloBlocos onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> },
    { id: 'leitura', label: 'LEITURA VELOZ', title: 'SPRINT FLUIDEZ', component: <MioloLeituraRapida onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> },
    { id: 'ordenacao', label: 'ORDENAÇÃO DE FRASES', title: 'SINTAXE DE ALTO PADRÃO', component: <MioloOrdenacao onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> },
    { id: 'paragrafos', label: 'REORDENAÇÃO DE PARÁGRAFOS', title: 'COESÃO TEXTUAL AVANÇADA', component: <MioloReordenacaoParagrafos status={gameStatus} onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "e9b8fc2c-5d21-45d8-a86e-a21fc1bb4b79")} /> },
    { id: 'roleplay', label: 'PRÁTICA DE CONVERSAÇÃO', title: 'ROLEPLAY COGNITIVO', component: <MioloRoleplay onValidateResult={handleValidationResult} /> },
    { id: 'shadowing', label: 'TREINO DE FALA', title: 'TREINO DE FALA', component: <MioloShadowing onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> },
    { id: 'spelling', label: 'SPELLING BEE', title: 'SOLETRANDO VOCABULÁRIO', component: <MioloSpellingBee status={gameStatus} onValidateResult={handleValidationResult} onSelectionChange={(hasItems) => setDesafioIniciado(hasItems)} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> },
    { id: 'traducao', label: 'TRADUÇÃO INVERSA', title: 'ENGENHARIA REVERSA', component: <MioloTraducaoInversa onValidateResult={handleValidationResult} /> },
    { id: 'velocidade', label: 'MARCHAS DE ÁUDIO', title: 'SPRINT DE COMPREENSÃO', component: <MioloVelocidadeProgressiva onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === "number" ? String(subUnidadeIndex) : (subUnidadeIndex || "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0")} /> }
  ];

  const jogoAtual = todosOsJogos.find(j => j.id === jogoSelecionado) || todosOsJogos[7];

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) { e.stopPropagation(); if (typeof interromperMentora === 'function') interromperMentora(); onClose(); } }} className={`fixed inset-0 z-[9999] bg-[#060e1a]/85 backdrop-blur-[12px] flex flex-col justify-between h-screen w-screen text-white transition-opacity duration-300 ease-in-out overflow-y-auto custom-scrollbar overflow-y-auto custom-scrollbar ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
      
        <div className={`top-4 left-4 z-[10001] ${(typeof window !== "undefined" && new URLSearchParams(window.location.search).get("admin") === "true") ? "absolute" : "hidden"}`}>
        <button 
          onClick={() => setMenuDevAberto(!menuDevAberto)}
          className="bg-[#1D2D44] border border-[#48627D]/40 text-[#94A3B8] text-[9px] font-black font-mono px-3 py-1.5 rounded-xl hover:text-white transition-colors"
        >
          {menuDevAberto ? '👉 CLOSE HUD' : '👈 AUDIT GAMES'}
        </button>
        {menuDevAberto && (
          <div className="bg-[#162235] border border-[#48627D]/40 p-3 rounded-bl-2xl w-56 shadow-2xl flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            {todosOsJogos.map((j) => (
              <button
                key={j.id}
                onClick={() => { tocarSom('click'); setJogoSelecionado(j.id); setGameStatus('IDLE'); setComboQuebrado(false); }}
                className={`w-full text-left text-[9px] font-bold font-mono px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all ${
                  jogoSelecionado === j.id ? 'bg-[#F97316] text-white font-black' : 'bg-[#1D2D44]/40 text-[#94A3B8] hover:bg-[#243B55]'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full px-8 py-4 flex justify-between items-center border-b border-amber-500/15 bg-[#0B1528] shadow-2xl flex-shrink-0 mt-0">
        <div className="flex items-center gap-6 text-[11px] font-bold text-[#94A3B8] tracking-wider">
          <span className={`flex items-center gap-1 font-black transition-all duration-200 ${
            comboQuebrado ? 'text-red-500 line-through opacity-60 scale-95' : 'text-[#FF8A2B]'
          } ${streak >= 3 ? 'text-amber-500 font-black' : ''}`}>
            <Flame size={13} fill="currentColor" /> 
            {comboQuebrado ? "COMBO QUEBRADO" : `${streak || 0}X STREAK ${streak >= 3 ? `(x${getMultiplicador()})` : ''}`}
          </span>
          <span className="flex items-center gap-1 text-[#38BDF8]"><Target size={13} /> {precision}% {tArena.precisionLabel}</span>
          <span className="flex items-center gap-1 text-[#22C55E]"><Award size={13} /> {xpAcumulado} PTS TOTAL</span>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden lg:block">
          <span className="text-[12px] font-black text-[#38BDF8] tracking-widest font-mono uppercase bg-[#38BDF8]/10 px-5 py-1.5 rounded-full border border-[#38BDF8]/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
            {jogoAtual.title}
          </span>
        </div>

        {onClose && (
          <button onClick={() => { tocarSom('click'); if (typeof cancelVoiceRecording === 'function') cancelVoiceRecording(); if (typeof interromperMentora === 'function') interromperMentora(); onClose(); }} className="text-[9.5px] font-black font-mono tracking-widest px-3 py-1.5 bg-transparent text-[#f59e0b] rounded-xl border border-[#f59e0b]/40 cursor-pointer hover:text-white hover:bg-[#f59e0b]/10 transition-all hover:border-[#f59e0b]/70">
            {tArena.close}
          </button>
        )}
      </div>

      <div onClick={(e) => { if (e.target === e.currentTarget) { if (typeof interromperMentora === 'function') interromperMentora(); onClose(); } }} className="w-full max-w-[97vw] flex-1 flex flex-col md:flex-row gap-6 text-left justify-center items-center mx-auto my-auto py-2 cursor-default">
        
        <div className="w-full md:w-[68%] h-auto min-h-0 md:h-[82vh] md:min-h-[580px] md:max-h-[850px] bg-[#0B1528] border border-white/[0.04] rounded-[24px] p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="w-full flex justify-between items-center select-none pb-3 border-b border-white/[0.03]">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase">{tArena.unit} {numeroUnidadeReal || (typeof subUnidadeIndex === "number" ? String(subUnidadeIndex + 1).padStart(2, "0") : "01")}</span>
              <h2 className="text-sm font-bold text-white tracking-tight mt-0.5">{jogoAtual.label}</h2>
            </div>
            {/* BADGE DE PERFORMANCE REMOVIDO */}
            
            <div className="flex items-center gap-2 ml-auto mr-1">
              <button 
                type="button"
                title={tArena.guide || "Diretrizes Textuais"}
                onClick={() => setVisualizacaoAtiva(visualizacaoAtiva === "TRILHA_TEXTOS" ? "EXERCICIO" : "TRILHA_TEXTOS")} 
                className="w-8 h-8 bg-[#1E2E48]/30 border border-white/[0.05] rounded-xl text-slate-300 hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 hover:border-[#38BDF8]/30 transition-all flex items-center justify-center shrink-0"
              >
                <BookOpen size={14} />
              </button>
              <button 
                type="button"
                title={tArena.media || "Conteúdo Audiovisual"}
                onClick={() => setVisualizacaoAtiva(visualizacaoAtiva === "TRILHA_VIDEOS" ? "EXERCICIO" : "TRILHA_VIDEOS")} 
                className="w-8 h-8 bg-[#1E2E48]/30 border border-white/[0.05] rounded-xl text-slate-300 hover:text-[#FF8A2B] hover:bg-[#FF8A2B]/10 hover:border-[#FF8A2B]/30 transition-all flex items-center justify-center shrink-0"
              >
                <Video size={14} />
              </button>
            </div>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 relative shrink-0 shadow-md border z-10 ${
              gameStatus === "CORRECT" ? "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40 scale-105" :
              gameStatus === "WRONG" ? "bg-red-500/20 text-red-500 border-red-500/40" :
              streak >= 3 ? "bg-amber-500/20 text-amber-400 border-amber-500/50 scale-102" :
              "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20"
            }`}>
              <Bot size={20} />
              {streak >= 3 && (
                <span className="absolute -top-1 -right-1 bg-[#F97316] text-[7px] text-white font-mono font-black px-1 rounded-sm">
                  STREAK
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 w-full overflow-y-auto py-4 flex flex-col justify-center min-h-0 relative">
            {/* TELA DA TRILHA HORIZONTAL GAMIFICADA DE VÍDEOS (LARANJA) */}
            {visualizacaoAtiva === "TRILHA_VIDEOS" && (
              <div className="absolute inset-0 bg-[#070D19] z-[99] p-5 flex flex-col justify-center rounded-2xl select-none">
                <button type="button" onClick={() => setVisualizacaoAtiva("EXERCICIO")} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-[101]">
                  <X size={18} />
                </button>
                <div className="w-full overflow-x-auto flex items-center py-24 px-12" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <div className="flex items-center gap-16 pr-24">
                    {totalConteudosTrilha.map((conteudo) => {
                      const unidadeAtualDoAluno = typeof subUnidadeIndex === "number" ? subUnidadeIndex + 1 : 1;
                      const desbloqueado = conteudo.unidadePertencente === unidadeAtualDoAluno;
                      const deslocamentoVertical = Math.sin(conteudo.id * 1.0) * 35;
                      return (
                        <div key={conteudo.id} style={{ transform: `translateY(${deslocamentoVertical}px)` }} className="transition-transform duration-300 shrink-0">
                          <button type="button" disabled={!desbloqueado} onClick={() => { setVideoSelecionado(conteudo); setVisualizacaoAtiva("PLAYER_VIDEO"); }} className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-mono text-sm font-black transition-all ${desbloqueado ? "bg-gradient-to-br from-[#FF8A2B] to-[#FF5E0A] text-white border-2 border-[#FF8A2B]/40 hover:scale-110 cursor-pointer shadow-[0_0_20px_rgba(255,138,43,0.5)] animate-pulse" : "bg-[#111927] text-slate-600 border border-white/5 cursor-not-allowed opacity-35"}`}>
                            {desbloqueado ? <span>{conteudo.id}</span> : <span className="text-xs">🔒</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TELA DA TRILHA HORIZONTAL GAMIFICADA DE TEXTOS (CIANO / AZUL-PISCINA) */}
            {visualizacaoAtiva === "TRILHA_TEXTOS" && (
              <div className="absolute inset-0 bg-[#070D19] z-[99] p-5 flex flex-col justify-center rounded-2xl select-none">
                <button type="button" onClick={() => setVisualizacaoAtiva("EXERCICIO")} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-[101]">
                  <X size={18} />
                </button>
                <div className="w-full overflow-x-auto flex items-center py-24 px-12" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <div className="flex items-center gap-16 pr-24">
                    {totalConteudosTrilha.map((conteudo) => {
                      const unidadeAtualDoAluno = typeof subUnidadeIndex === "number" ? subUnidadeIndex + 1 : 1;
                      const desbloqueado = conteudo.unidadePertencente === unidadeAtualDoAluno;
                      const deslocamentoVertical = Math.sin(conteudo.id * 1.0) * 35;
                      return (
                        <div key={conteudo.id} style={{ transform: `translateY(${deslocamentoVertical}px)` }} className="transition-transform duration-300 shrink-0">
                          <button type="button" disabled={!desbloqueado} onClick={() => { setTextoSelecionadoId(conteudo.id); setVisualizacaoAtiva("TEXTO_PEDAGOGO"); }} className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-mono text-sm font-black transition-all ${desbloqueado ? "bg-gradient-to-br from-[#00F0FF] to-[#00A3FF] text-white border-2 border-[#00F0FF]/40 hover:scale-110 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.5)] animate-pulse" : "bg-[#111927] text-slate-600 border border-white/5 cursor-not-allowed opacity-35"}`}>
                            {desbloqueado ? <span>{conteudo.id}</span> : <span className="text-xs">🔒</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MONITOR PLAYER DE VIDEO COM X MINIMALISTA */}
            {visualizacaoAtiva === "PLAYER_VIDEO" && (
              <div className="absolute inset-0 bg-[#070D19] z-[100] p-5 flex flex-col justify-between rounded-2xl select-none">
                <button type="button" onClick={() => setVisualizacaoAtiva("TRILHA_VIDEOS")} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-[101]">
                  <X size={18} />
                </button>
                <div className="flex-1 my-8 bg-black rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                  <div className="text-center p-4">
                    <div className="w-14 h-14 bg-[#FF8A2B]/10 border border-[#FF8A2B]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[#FF8A2B] animate-pulse">
                      <Video size={24} />
                    </div>
                    <p className="text-xs text-slate-200 font-bold uppercase tracking-wider">TELA DO MONITOR</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">STREAMING DO CONTEÚDO {videoSelecionado?.id}</p>
                  </div>
                </div>
                <div className="h-4 w-full bg-white/[0.02] border border-white/5 rounded px-2 flex items-center justify-between text-[8px] font-mono text-slate-500 shrink-0">
                  <span>STATUS: RUNNING</span>
                  <span>HAAS ENGINE</span>
                </div>
              </div>
            )}

            {/* INTERFACE DE CONTEÚDO ESCRITO PEDAGÓGICO */}
            {visualizacaoAtiva === "TEXTO_PEDAGOGO" && (
              <div className="absolute inset-0 bg-[#070D19] z-[98] p-8 flex flex-col justify-between rounded-2xl select-none overflow-y-auto custom-scrollbar">
                <button type="button" onClick={() => setVisualizacaoAtiva("TRILHA_TEXTOS")} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-[101]">
                  <X size={18} />
                </button>
                {dadosLicaoEscrita ? (
                  <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 py-4 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] font-mono text-[10px] font-bold uppercase tracking-wider">
                        {dadosLicaoEscrita.level || "A1"}
                      </span>
                      <span className="text-slate-500 text-[11px] font-medium font-mono uppercase tracking-wide">
                        {dadosLicaoEscrita.unit}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight leading-snug border-b border-white/5 pb-4">
                      {dadosLicaoEscrita.title} (Texto {textoSelecionadoId})
                    </h2>
                    <div className="text-slate-300 text-sm leading-relaxed font-normal bg-white/[0.02] border border-white/[0.04] p-6 rounded-xl shadow-inner whitespace-pre-line">
                      {dadosLicaoEscrita.body_content}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-mono">
                    {carregandoTexto ? "Carregando conteúdo..." : "Nenhum conteúdo pedagógico associado a esta lição."}
                  </div>
                )}
                <div className="h-4 w-full bg-white/[0.01] border border-white/5 rounded px-2 flex items-center justify-between text-[8px] font-mono text-slate-500 shrink-0 mt-6">
                  <span>TEXTO DE IMERSÃO ATIVO</span>
                  <span>HAAS ENGINE V2.5</span>
                </div>
              </div>
            )}
            {/* TELA DA TRILHA HORIZONTAL GAMIFICADA (ESTEIRA LIMPA) */}
            {visualizacaoAtiva === "TRILHA_VIDEOS" && (
              <div className="absolute inset-0 bg-[#070D19] z-[99] p-5 flex flex-col justify-center rounded-2xl select-none">
                
                {/* Botao Fechar minimalista com X */}
                <button 
                  type="button"
                  onClick={() => setVisualizacaoAtiva("EXERCICIO")}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-[101]"
                >
                  <X size={18} />
                </button>

                {/* Esteira de Rolagem Horizontal Pura sem barra de scroll visivel */}
                <div 
                  className="w-full overflow-x-auto flex items-center py-24 px-12" 
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {/* Sem linhas guia de fundo para manter o visual limpo */}
                  <div className="flex items-center gap-16 pr-24">
                    {totalConteudosTrilha.map((conteudo) => {
                      const unidadeAtualDoAluno = typeof subUnidadeIndex === "number" ? subUnidadeIndex + 1 : 1;
                      const desbloqueado = conteudo.unidadePertencente === unidadeAtualDoAluno;
                      
                      const deslocamentoVertical = Math.sin(conteudo.id * 1.0) * 35;

                      return (
                        <div 
                          key={conteudo.id} 
                          style={{ transform: `translateY(${deslocamentoVertical}px)` }}
                          className="transition-transform duration-300 shrink-0"
                        >
                          <button
                            type="button"
                            disabled={!desbloqueado}
                            onClick={() => {
                              setVideoSelecionado(conteudo);
                              setVisualizacaoAtiva("PLAYER_VIDEO");
                            }}
                            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-mono text-sm font-black transition-all ${
                              desbloqueado 
                                ? "bg-gradient-to-br from-[#FF8A2B] to-[#FF5E0A] text-white border-2 border-[#FF8A2B]/40 hover:scale-110 cursor-pointer shadow-[0_0_20px_rgba(255,138,43,0.5)] animate-pulse" 
                                : "bg-[#111927] text-slate-600 border border-white/5 cursor-not-allowed opacity-35"
                            }`}
                          >
                            {desbloqueado ? (
                              <span>{conteudo.id}</span>
                            ) : (
                              <span className="text-xs">🔒</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MONITOR PLAYER DE VIDEO COM X MINIMALISTA */}
            {visualizacaoAtiva === "PLAYER_VIDEO" && (
              <div className="absolute inset-0 bg-[#070D19] z-[100] p-5 flex flex-col justify-between rounded-2xl select-none">
                
                <button 
                  type="button"
                  onClick={() => setVisualizacaoAtiva("TRILHA_VIDEOS")}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-[101]"
                >
                  <X size={18} />
                </button>

                <div className="flex-1 my-8 bg-black rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                  <div className="text-center p-4">
                    <div className="w-14 h-14 bg-[#FF8A2B]/10 border border-[#FF8A2B]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[#FF8A2B] animate-pulse">
                      <Video size={24} />
                    </div>
                    <p className="text-xs text-slate-200 font-bold uppercase tracking-wider">TELA DO MONITOR</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">STREAMING DO CONTEÚDO {videoSelecionado?.id}</p>
                  </div>
                </div>

                <div className="h-4 w-full bg-white/[0.02] border border-white/5 rounded px-2 flex items-center justify-between text-[8px] font-mono text-slate-500 shrink-0">
                  <span>STATUS: RUNNING</span>
                  <span>HAAS ENGINE</span>
                </div>
              </div>
            )}
            {false ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 gap-4 select-none">
                {false ? (
                  <div 
                    onClick={() => { tocarSom('level_complete'); setCaixaAberta(true); }}
                    className="group cursor-pointer flex flex-col items-center justify-center gap-3 bg-[#1E2E48]/40 p-6 rounded-2xl border border-[#38BDF8]/20 hover:border-[#22C55E]/40 transition-all hover:scale-105 shadow-[0_0_30px_rgba(56,189,248,0.05)]"
                  >
                    <Gift size={50} className="text-[#FF8A2B] group-hover:text-[#22C55E] transition-colors duration-300" />
                    <span className="text-xs font-black tracking-widest text-[#38BDF8] uppercase group-hover:text-white">{currentLang === 'PT' ? 'MÉTRICAS ATUALIZADAS. CLIQUE PARA REVISAR.' : currentLang === 'ES' ? 'MÉTRICAS ACTUALIZADAS. CLIC PARA REVISAR.' : 'METRICS UPDATED. CLICK TO REVIEW.'}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 max-w-md px-2">
                    <div className="w-12 h-12 bg-[#22C55E]/20 rounded-full flex items-center justify-center text-[#22C55E] border border-[#22C55E]/30 shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="flex flex-col gap-1.5 text-center">
                      <h3 className="text-sm font-black text-emerald-400 uppercase tracking-tight">
                        {currentLang === 'ES' ? '¡ESTRUCTURA VALIDADA CON MAESTRIA!' : 'ESTRUTURA VALIDADA COM MAESTRIA!'}
                      </h3>
                      <p className="text-[12px] text-slate-200 leading-relaxed font-sans bg-white/[0.02] border border-white/5 p-3 rounded-xl italic">
                        {currentLang === 'ES' 
                          ? '"¡Excelente desempeño! Las estructuras y los conectores corporativos se aplicaron con perfecta fluidez."' 
                          : '"Excelente desempenho! As estruturas e conectores corporativos foram aplicados com perfeita fluidez nesta missão."'}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full justify-center mt-1 font-mono text-[10px] font-black">
                      <span className="bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] px-4 py-2 rounded-xl font-mono tracking-wider">
                        💎 +{streak >= 3 ? 38 : 25} PTS RECOMPENSA
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : false ? (
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-[#070d19]/60 backdrop-blur-md rounded-2xl border border-white/[0.02] relative overflow-hidden select-none animate-[fadeIn_0.5s_ease-out]">
                {false ? (
                  <div className="flex flex-col items-center justify-center gap-2 animate-[ping_1s_infinite]">
                    <span className="text-6xl font-black font-mono text-[#FF8A2B]">
                      {contagem === 1 ? 'GO!' : contagem - 1}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 max-w-sm">
                    <div className="px-3 py-1 bg-[#38BDF8]/10 text-[#00D4FF] border border-[#00D4FF]/20 text-[9px] font-mono font-black tracking-widest rounded-md uppercase">
                      {jogoAtual.title}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-black text-white tracking-tight uppercase">{jogoAtual.label}</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {currentLang === 'PT' ? 'Um desafio focado na sua evolução foi selecionado pela Mentora. Prepare-se antes de iniciar o tempo.' : 
                         currentLang === 'ES' ? 'El sistema ha seleccionado un desafío enfocado en tu evolución. Prepárate antes de iniciar.' : 
                         'A challenge tailored to your progress has been selected. Get ready before the timer starts.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        tocarSom('click');
                        let tempo = 0; // Contagem desativada
                        setContagem(tempo);
                        const timerContagem = setInterval(() => {
                          tempo--;
                          setContagem(tempo);
                          if (tempo === 0) {
                            clearInterval(timerContagem);
                            setDesafioIniciado(true);
                          } else if (tempo === 1) {
                            tocarSom('level_complete');
                          } else {
                            tocarSom('click');
                          }
                        }, 900);
                      }}
                      className="mt-2 px-8 py-3 bg-gradient-to-r from-[#FF8A2B] to-[#F97316] hover:from-[#F97316] hover:to-[#EA580C] text-white text-xs font-black tracking-widest rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.2)] hover:shadow-[0_4px_25px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase"
                    >
                      {currentLang === 'PT' ? 'Iniciar Desafio' : currentLang === 'ES' ? 'Iniciar Desafío' : 'Start Challenge'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              jogoAtual.component
            )}
          </div>

          <div className="w-full pt-4 border-t border-white/[0.03] flex justify-between items-center gap-4">
            <button 
              onClick={() => { tocarSom('click'); handleNextMission(); }}
              disabled={visualizacaoAtiva !== "EXERCICIO"} className="disabled:opacity-20 disabled:cursor-not-allowed px-5 py-2.5 bg-[#070d19] hover:bg-[#0B1528] text-slate-500 border border-[#0B1528] text-[10.5px] font-black tracking-wider rounded-xl cursor-pointer transition-all shadow-md uppercase"
            >
              {tArena.skip}
            </button>
            <button 
              onClick={() => {
                if (visualizacaoAtiva !== "EXERCICIO") return;
                // Se for o Spelling Bee validando, não toca o clique sintético para não atropelar o som premium
                if (jogoSelecionado !== 'spelling' || (gameStatus === 'CORRECT' || gameStatus === 'WRONG')) {
                  dispararSomCliqueSintetico();
                }
                if (gameStatus === 'CORRECT' || gameStatus === 'WRONG') {
                  setGameStatus('IDLE');
                  setRespostaIA("");
                  handleNextMission();
                } else {
                  window.dispatchEvent(new CustomEvent("haas:validate"));
                }
              }}
              disabled={visualizacaoAtiva !== "EXERCICIO"} className={`w-11 h-11 flex items-center justify-center text-sm font-black rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all border-none disabled:opacity-20 disabled:cursor-not-allowed disabled:pointer-events-none ${(desafioIniciado && gameStatus !== "CORRECT") || (jogoSelecionado === "blitz" && gameStatus === "CORRECT") ? "hover:-translate-y-0.5 cursor-pointer" : ""} ${
                gameStatus === 'CORRECT' && jogoSelecionado !== 'blitz'
                  ? 'bg-gradient-to-r from-[#22C55E] to-[#16a34a] text-white'
                  : 'bg-gradient-to-r from-[#FF8A2B] to-[#F97316] text-white pointer-events-auto opacity-100'
              }`}
            >
              ➔
            </button>
          </div>
        </div>

        <div className="flex w-full md:w-[32%] h-auto md:h-[82vh] md:min-h-[580px] md:max-h-[850px] bg-[#0B1528] border border-white/[0.03] rounded-[24px] backdrop-blur-md shadow-2xl p-5 flex flex-col justify-between relative overflow-hidden mt-4 md:mt-0">
          
          <div className="w-full bg-[#070d19] border border-[#38BDF8]/20 py-2 px-4 rounded-xl flex items-center justify-between font-mono text-[11px] font-black tracking-wider text-slate-200 shadow-lg shrink-0">
            <span className="flex items-center gap-1"><Target size={12} className="text-[#38BDF8]" /> {precision}%</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1"><Flame size={12} className={`text-[#FF8A2B] ${streak >= 3 ? 'text-amber-500 font-black' : ''}`} fill="currentColor" /> {streak}</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1"><Star size={12} className="text-[#22C55E]" /> {unidadesConcluidas}/{totalUnidadesModulo}</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1"><TrendingUp size={12} className="text-[#A855F7]" /> {alunoNivel} • {proficienciaMedia}%</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1 text-[#22C55E]"><Trophy size={12} /> +{xpUnidade} PTS</span>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 py-4 min-h-0 relative">
            


            <div className="w-full flex-1 bg-[#070d19] border border-white/[0.04] p-4 rounded-2xl relative text-left shadow-xl flex flex-col justify-between z-10 overflow-hidden">
              
              <span className="w-full text-[9px] font-black text-[#38BDF8] tracking-widest uppercase block border-b border-white/5 pb-1 select-none shrink-0 mb-2">{tArena.mentorName}</span>
              
              <div className="flex flex-col flex-1 overflow-y-auto mb-3 pr-1 max-h-[320px] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <div className="text-[13px] font-sans font-medium leading-relaxed text-slate-100 mt-1">
                  {(isThinking && tipoEnvio === "audio") ? (
                    <div className="text-cyan-400 font-sans italic text-xs leading-relaxed">
                      {getThinkingMessage()}
                    </div>
                  ) : respostaIA ? (
                    <div className="text-slate-100 text-[14px] leading-relaxed whitespace-pre-wrap break-words efeito-fumaca font-medium">
                      {respostaIA}
                    </div>
                  ) : (
                    <div>
                      {(isThinking && tipoEnvio === "texto") ? (
                        <span className="text-cyan-400 font-sans italic animate-pulse">{getThinkingMessage()}</span>
                      ) : (
                        <>
                          {gameStatus === 'CORRECT' && "Incrível! O loot da missão foi liberado. Clique na caixa de suprimentos para resgatar seus bônus de PTS multiplicados!"}
                          {gameStatus === 'WRONG' && (
                            (() => {
                              const rawLang = (idiomaNativoReal || "Portuguese").toLowerCase();
                              if (rawLang.includes("spanish") || rawLang === "es") {
                                return `¡Atención al desafío, ${nomeUsuarioReal || "Estudante"}! Analiza el ejercicio con calma, haz el ajuste necesario y vuelve a validar para sumar puntos.`;
                              } else if (rawLang.includes("english") || rawLang === "en") {
                                return `Attention to the challenge, ${nomeUsuarioReal || "Estudante"}! Analyze the exercise carefully, make the necessary adjustment, and validate again to score.`;
                              } else {
                                return `Atenção ao desafio, ${nomeUsuarioReal || "Estudante"}! Analise o exercício com calma, faça o ajuste necessário e valide novamente para pontuar.`;
                              }
                            })()
                          )}
                          {gameStatus === 'IDLE' && streak >= 3 && (
                          <span className="inline-block transition-all duration-1000 ease-out animate-[fadeIn_1s_ease-out] blur-none opacity-100 filter-none">
                            {tArena.mentorFire.replace("multiplicador", "multiplicador x" + getMultiplicador())}
                          </span>
                        )}
                          {gameStatus === 'IDLE' && streak < 3 && (
                            (() => {
                              const rawLang = (idiomaNativoReal || "Portuguese").toLowerCase();
                              if (rawLang.includes("spanish") || rawLang === "es") {
                                return `¡Hola, ${nomeUsuarioReal || "Estudante"}! Si tienes alguna duda sobre este ejercicio, no dudes en preguntarme por texto o audio aquí en el chat. (Ten en cuenta que el uso interactivo consume créditos de IA, en caso de que tu cuenta tenga un límite).`;
                              } else if (rawLang.includes("english") || rawLang === "en") {
                                return `Hello, ${nomeUsuarioReal || "Estudante"}! If you have any questions about this exercise, feel free to ask me via text or audio here in the chat. (Please note that interactive use consumes AI credits, if your account has a limit).`;
                              } else {
                                return `Olá, ${nomeUsuarioReal || "Estudante"}! Caso tenha alguma dúvida sobre este exercício, sinta-se à vontade para me perguntar por texto ou áudio aqui no chat. (Lembre-se de que o uso interativo consome créditos de IA, caso sua conta possua um limite).`;
                              }
                            })()
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={perguntarAoMentor} className="flex items-center bg-[#0c192e] border border-white/5 rounded-xl px-3 py-1.5 mt-auto w-full relative">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={tArena.chatPlaceholder}
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono pr-16"
                  disabled={isRecording}
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${isRecording ? 'text-cyan-400 bg-cyan-500/10 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Mic size={15} />
                  </button>
                  {isThinking || isSpeaking ? (
                    <button 
                      type="button"
                      disabled={isThinking}
                      onClick={interromperMentora}
                      className={`p-1.5 bg-transparent rounded-full transition-all flex items-center justify-center ${
                        isThinking 
                          ? 'text-slate-600 border border-slate-800 opacity-40 cursor-not-allowed pointer-events-none' 
                          : 'text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 active:scale-95 cursor-pointer'
                      }`}
                      title={isThinking ? "Processando..." : "Interromper Mentora"}
                    >
                      <span className={`w-2.5 h-2.5 rounded-sm block ${isThinking ? 'bg-slate-600' : 'bg-cyan-400'}`} />
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-1.5 bg-cyan-500 text-[#0b1528] rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-20 disabled:bg-transparent disabled:text-slate-600"
                    >
                      <ArrowUp size={14} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>


        </div>

      </div>

      <div className="w-full px-8 py-3 flex justify-between items-center border-t border-amber-500/15 bg-[#0B1528] text-[10px] font-mono text-slate-500 flex-shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
          <span>HAAS ENGINE V2.5.0 • SECURE REWARD SYSTEM GAMEPLAY</span>
        </div>
        <span>© 2026 HAAS LANGUAGE ACADEMY • PREMIUM GAMIFIED PLATFORM</span>
      </div>

    </div>
  );
}
