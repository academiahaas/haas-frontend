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
  let baseLang = (idiomaAtivo || (typeof window !== 'undefined' ? localStorage.getItem('language') || localStorage.getItem('lang') || 'PT' : 'PT')).toUpperCase();
  if (baseLang.includes('PORTUGU')) baseLang = 'PT';
  const currentLang = baseLang;
  
  // Gatilho Automático Direto
  useEffect(() => {
    if (!userId || (globalThis as any).analiseJaFeita) return;
    (globalThis as any).analiseJaFeita = true;
    
    const timer = setTimeout(() => {
      if (typeof perguntarAoMentor === "function") {
        perguntarAoMentor(null, null, "feedback pedagógico atual");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [userId]);

  const [visualizacaoAtiva, setVisualizacaoAtiva] = useState<"EXERCICIO" | "TRILHA_VIDEOS" | "PLAYER_VIDEO" | "TRILHA_TEXTOS" | "TEXTO_PEDAGOGO">("EXERCICIO");
  const [videoSelecionado, setVideoSelecionado] = useState<any>(null);
  const [urlEmbedAtiva, setUrlEmbedAtiva] = useState<string>("");
  const [carregandoVideo, setCarregandoVideo] = useState(false);

  const obterEmbedYoutube = (url: string) => {
    if (!url) return "";
    try {
      let videoId = "";
      if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
      else if (url.includes("embed/")) videoId = url.split("embed/")[1].split("?")[0];
      else return url;
      return "https://www.youtube.com/embed/" + videoId;
    } catch (e) { return url; }
  };

  useEffect(() => {
    if (!videoSelecionado?.id) {
      setUrlEmbedAtiva("");
      return;
    }

    async function buscarVideoBanco() {
      try {
        setCarregandoVideo(true);
        console.log("🟦 [HAAS MOTOR] Buscando index correspondente para a etapa:", videoSelecionado.id);
        
        const { data, error } = await supabase
          .from("video_lessons")
          .select("video_url")
          .order("created_at", { ascending: true });

        if (error) throw error;

        const indexAlvo = videoSelecionado.id - 1;
        const videoCorrespondente = data && data[indexAlvo];

        if (videoCorrespondente?.video_url) {
          const urlConvertida = obterEmbedYoutube(videoCorrespondente.video_url);
          console.log("🟩 [HAAS MOTOR] URL vinculada:", urlConvertida);
          setUrlEmbedAtiva(urlConvertida);
        } else {
          console.warn("⚠️ [HAAS MOTOR] Nenhum vídeo para o index:", videoSelecionado.id);
          setUrlEmbedAtiva("");
        }
      } catch (err) {
        console.error("❌ [HAAS MOTOR] Erro:", err);
        setUrlEmbedAtiva("");
      } finally {
        setCarregandoVideo(false);
      }
    }

    buscarVideoBanco();
  }, [videoSelecionado]);

    const [dadosLicaoEscrita, setDadosLicaoEscrita] = useState<any>(null);
  const [carregandoTexto, setCarregandoTexto] = useState<boolean>(false);
  const [textoSelecionadoId, setTextoSelecionadoId] = useState<number | null>(null);

  useEffect(() => {
    async function carregarDadosLicao() {
      setCarregandoTexto(true);
      try {
        const { data: todasLicoes, error } = await supabase
          .from("reading_lesson")
          .select("title, body_content, level, module, unit")
          .order("id", { ascending: true });
        
        if (todasLicoes && todasLicoes.length > 0) {
          const numIdx = typeof subUnidadeIndex === "number" ? subUnidadeIndex : 0;
          const licaoSelecionada = todasLicoes[numIdx] || todasLicoes[0];
          setDadosLicaoEscrita(licaoSelecionada);
          console.log("🟩 [HAAS MOTOR - TEXTO] Texto carregado para o índice:", numIdx);
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
        const res = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=clinical_precision,name,native_language,course_language`, {
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
          if (dados[0].course_language) {
            (window as any).__supabaseCourseLanguage = dados[0].course_language;
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
        const res = await fetch(`${supabaseUrl}/rest/v1/user_unit_progress?user_id=eq.${userId}&unit_id=eq.${targetUnitId}&select=unit_xp`, {
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
        const userIdFixo = userId || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

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
        const userIdFixo = userId || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
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
  const [creditosPlano, setCreditosPlano] = useState(null);

  useEffect(() => {
    const buscarCreditosIniciais = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const userIdFixo = userId || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
        const cm = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
        const resUser = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userIdFixo}&select=chat_credits`, { 
          headers: { "apikey": cm, "Authorization": `Bearer ${cm}` } 
        });
        const dados = await resUser.json();
        if (dados && dados[0]) {
          setCreditosPlano(dados[0].chat_credits ?? 50);
        }
      } catch (err) { console.error("Erro ao buscar creditos:", err); }
    };
    buscarCreditosIniciais();
  }, [userId]);

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
       
       // INICIALIZAÇÃO DA TRANSCRIÇÃO NATIVA ATRÁS DAS CORTINAS
       if (typeof window !== "undefined") {
         (window as any).lastRecognizedText = "";
         const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
         if (SpeechClass) {
           const rec = new SpeechClass();
           rec.continuous = true;
           rec.interimResults = false;
           // Detecta o idioma da interface dinamicamente para maior precisão
                                   const mapearIdiomaPratica = () => {
              const cursoRaw = (window as any).__supabaseCourseLanguage || "";
              const curso = cursoRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
              
              if (curso.includes("portugues") || curso.includes("pt")) return "pt-BR";
              if (curso.includes("espanol") || curso.includes("es")) return "es-ES";
              if (curso.includes("ingles") || curso.includes("english") || curso.includes("en")) return "en-US";
              
              const tela = (typeof currentLang !== "undefined" ? currentLang : "PT").toUpperCase();
              if (tela.includes("ES")) return "es-ES";
              if (tela.includes("EN")) return "en-US";
              return "pt-BR";
            };
            rec.lang = mapearIdiomaPratica();
           
           rec.onresult = (event) => {
             let txt = "";
             for (let i = event.resultIndex; i < event.results.length; i++) {
               if (event.results[i].isFinal) txt += event.results[i][0].transcript;
             }
             if (txt) (window as any).lastRecognizedText = ((window as any).lastRecognizedText || "") + " " + txt;
           };
           
           (window as any).globalSpeechRecInstance = rec;
           rec.start();
         }
       }
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

       mediaRecorder.onstop = async () => {
         if (typeof window !== "undefined" && (window as any).globalSpeechRecInstance) {
           try { (window as any).globalSpeechRecInstance.stop(); } catch(e){}
         }
         stream.getTracks().forEach(track => track.stop());
         if (isCancelledRef.current) {
           audioChunksRef.current = [];
           return;
         }
         const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
         const urlCriada = URL.createObjectURL(audioBlob);
         (globalThis as any).lastAudioUrl = urlCriada;
         if (audioBlob.size < 1000) return;
         
         const reader = new FileReader();
         reader.readAsDataURL(audioBlob);
         reader.onloadend = async () => {
           const base64Audio = reader.result?.toString().split(",")[1];
           if (!base64Audio) return;
           perguntarAoMentor(null, base64Audio);
         };
       };
       // Linha limpa

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
    // isCancelledRef.current = true; (desativado cancelamento)
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
  const [chatHistory, setChatHistory] = useState<{tipo: 'user' | 'ai', texto: string, audioUrl?: string}[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arena_chat_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arena_chat_history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);
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
      let posicao = 1;
      if (respostaIA && respostaIA.startsWith("QUEUE:")) {
        posicao = parseInt(respostaIA.split(":")[1], 10) || 1;
      }
      const mensagens = {
        PT: `Organizando o seu atendimento com a Mentora... Você está na posição ${posicao} da fila.`,
        EN: `Arranging your session with the Mentor... You are at position ${posicao} in the queue.`,
        ES: `Organizando tu atención con la Mentora... Estás en la posición ${posicao} de la fila.`
      };
      let rawLang = (typeof idiomaNativoReal !== "undefined" ? idiomaNativoReal : (typeof currentLang !== "undefined" ? currentLang : "PT")).toLowerCase();
      let langKey = "PT";
      if (rawLang.includes("spanish") || rawLang.includes("es")) langKey = "ES";
      else if (rawLang.includes("english") || rawLang.includes("en")) langKey = "EN";
      return mensagens[langKey] || mensagens.PT;
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

  const dispararAnaliseInicialBackground = async (idioma, nivel, unidade) => {
    if (isThinking) return;
    setIsThinking(true);
    setRespostaIA('');

    try {
      const promptBoasVindas = `Gerar uma mensagem curta e objetiva de incentivo pedagógico e mentoria para o(a) aluno(a) ${nomeUsuarioReal || "Estudante"} que está no nível ${nivel} da unidade "${unidade}". Faça uma análise amigável incentivando-o a focar nos estudos práticos. Escreva a resposta estritamente no idioma ${idioma.includes("spanish") || idioma === "es" ? "Espanhol" : idioma.includes("english") || idioma === "en" ? "Inglês" : "Português"}.`;

      const response = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptBoasVindas, userId: userId, idiomaTela: currentLang })
      });

      if (!response.body) {
        setIsThinking(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let acumulado = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acumulado += chunk;
        setRespostaIA(acumulado);
      }
    } catch (err) {
      console.error("Erro na análise inicial:", err);
      setRespostaIA("Erro ao carregar mentoria.");
    } finally {
      setIsThinking(false);
    }
  };

  // NOVO MOTOR ULTRA VELOZ COM VOZ NATIVA E VALIDAÇÃO DE CRÉDITOS NO SUPABASE
  const perguntarAoMentor = async (e: any, audioBase64 = null, textoForcado = null) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    if (e) e.preventDefault();
    
    const textoParaEnviar = textoForcado ? textoForcado : (chatInput ? chatInput.trim() : (audioBase64 && typeof window !== "undefined" ? ((window as any).lastRecognizedText || "").trim() : ""));
     if (audioBase64 && !textoParaEnviar) {
       // Fallback se o motor nativo nao transcrever a tempo
       // Mantem o fluxo ativo sem quebrar as variaveis
     }
      console.log("=== DEBUG MENTORA AUDIO ===", { textoCapturado: textoParaEnviar, bufferGlobal: typeof window !== "undefined" ? (window as any).lastRecognizedText : "fora do window" });
     // Linha limpa
    if (!audioBase64 && !textoParaEnviar) return;

    if ((textoParaEnviar && textoParaEnviar !== "feedback pedagógico atual") || audioBase64) {
      setChatHistory(prev => [...prev, { tipo: "user", texto: textoParaEnviar || "", audioUrl: audioBase64 ? (audioBase64.startsWith("data:") ? audioBase64 : `data:audio/mp3;base64,${audioBase64}`) : ((globalThis as any).lastAudioUrl || undefined) }]);
    }
    setChatInput('');
    if (typeof window !== 'undefined') { 
      (window as any).lastRecognizedText = ''; 
    }
    setTimeout(() => {
      (globalThis as any).lastAudioUrl = undefined;
    }, 100);
    setTipoEnvio(audioBase64 ? "audio" : "texto");
    setIsThinking(true);
    setRespostaIA('');

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const userIdFixo = userId || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
      const cm = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";

      // 1. FASE DE VERIFICAÇÃO DE CRÉDITOS
      const resUser = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userIdFixo}&select=chat_credits`, { 
        headers: { "apikey": cm, "Authorization": `Bearer ${cm}` } 
      });
      const dadosUser = await resUser.json();
      const creditosAtuais = (dadosUser && dadosUser[0]) ? (dadosUser[0].chat_credits ?? 50) : 50;

      if (creditosAtuais <= 0) {
        setRespostaIA("Você atingiu o limite de consultas do seu plano atual.");
        setIsThinking(false);
        return;
      }

      // 2. FASE DE CONSUMO (ATUALIZA NO SUPABASE)
      const novosCreditos = creditosAtuais - 1;
      await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userIdFixo}`, {
        method: 'PATCH',
        headers: { 
          "apikey": cm, 
          "Authorization": `Bearer ${cm}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({ usage_credits: novosCreditos })
      });
      setCreditosPlano(novosCreditos);

      // 3. ENTRADA NA API DA MENTORA
      let respostaTexto = "";
      let promptFinal = audioBase64 ? (textoParaEnviar || "") : textoParaEnviar;
      if (audioBase64 && textoParaEnviar) {
        promptFinal = textoParaEnviar;
      }

      try {
        const resInterna = await fetch("/api/ai/mentor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptFinal, userId: userId, idiomaTela: (textoParaEnviar && (textoParaEnviar.toLowerCase().includes("bom dia") || textoParaEnviar.toLowerCase().includes("tudo bem") || textoParaEnviar.toLowerCase().includes("obrigado") || textoParaEnviar.length > 3)) ? "PT" : currentLang, chatHistory })
        });

        if (!resInterna.ok) {
          setRespostaIA("Erro ao obter resposta do motor local.");
          return;
        }

        setRespostaIA("");
        const reader = resInterna.body?.getReader();
        const decoder = new TextDecoder();
        let textoAcumulado = "";

        if (reader) {
          const lang = (typeof baseLang !== 'undefined' ? baseLang : 'PT').toUpperCase();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            
            if (chunk.startsWith("QUEUE:")) {
              continue;
            }
            
            if (textoAcumulado === "" && !chunk.startsWith("QUEUE:")) {
              setRespostaIA("");
            }
            
            if (!chunk.startsWith("QUEUE:")) {
              textoAcumulado += chunk;
              setRespostaIA(textoAcumulado);
              setChatHistory(prev => {
                const filtered = prev.filter(m => m.texto !== "...");
                const last = filtered[filtered.length - 1];
                if (last && last.tipo === 'ai') {
                  return [...filtered.slice(0, -1), { tipo: 'ai', texto: textoAcumulado, isAudioMode: !!audioBase64 }];
                } else {
                  return [...filtered, { tipo: 'ai', texto: textoAcumulado, isAudioMode: !!audioBase64 }];
                }
              });
            }
          }
        }
      } catch (err) {
        console.error(err);
        setRespostaIA("Falha na conexao com o motor: " + err.message);
      }

      // Remove do caminho o desconto forçado antes da confirmação ou falhas travadas
      try {
        const novosCreditos = Math.max(0, (creditosPlano || 1) - 1);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const userIdFixo = userId || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
        const cm = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
        
        await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userIdFixo}`, {
          method: "PATCH",
          headers: {
            "apikey": cm,
            "Authorization": `Bearer ${cm}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ chat_credits: novosCreditos })
        });
        setCreditosPlano(novosCreditos);
      } catch (e) {}

      // 5. GERAÇÃO ÚNICA E ARMAZENAMENTO PERMANENTE EM BASE64 NO HISTÓRICO
      if (audioBase64 && respostaTexto) {
        try {
          const ttsRes = await fetch("/api/ai/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: respostaTexto.replace(/QUEUE:\d+/g, "").trim() })
          });
          
          if (ttsRes.ok) {
            const audioBlob = await ttsRes.blob();
            const readerBase64 = new FileReader();
            readerBase64.readAsDataURL(audioBlob);
            readerBase64.onloadend = () => {
              const base64String = readerBase64.result;
              
              setChatHistory(prev => {
                const lastAiIdx = prev.map(m => m.tipo).lastIndexOf('ai');
                if (lastAiIdx !== -1) {
                  const novoHist = [...prev];
                  novoHist[lastAiIdx] = { 
                    ...novoHist[lastAiIdx], 
                    audioUrl: base64String as string,
                    isAudioMode: true 
                  } as any;
                  return novoHist;
                }
                return prev;
              });

              const somLocal = new Audio(base64String as string);
              somLocal.play().catch(e => console.log("Player automático aguardando interação:", e));
            };
          }
        } catch (errTts) {
          console.error("Erro ao gerar/salvar áudio Base64:", errTts);
        }
      }

    } catch (err) {
      console.error("Erro no novo motor de IA:", err);
      setRespostaIA("Desculpe, tive um problema ao processar seu pedido. Tente novamente.");
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
  const sincronizarXpUnidadeComBanco = async (novoXpTotalDaUnidade: number, activityType?: string, scoreObtido?: number, dynamicExerciseId?: string) => {
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
          activity_type: (activityType || jogoSelecionado) === 'paragrafos' ? '8' : ((activityType || jogoSelecionado) === 'shadowing' ? '10' : ((activityType || jogoSelecionado) === 'spelling' ? '11' : ((activityType || jogoSelecionado) === 'traducao' ? '12' : ((activityType || jogoSelecionado) === 'velocidade' ? '13' : ((activityType || jogoSelecionado) === 'escolha' ? '1' : (activityType || jogoSelecionado || 'geral')))))),
          exercise_id: (activityType || jogoSelecionado) === 'shadowing' || (activityType || jogoSelecionado) === 'spelling' || (activityType || jogoSelecionado) == 'traducao' || (activityType || jogoSelecionado) == 'velocidade' || (activityType || jogoSelecionado) == 'escolha' ? String(dynamicExerciseId || typeof subUnidadeIndex === 'string' ? subUnidadeIndex : '09adf4ff-71ed-4b2b-982e-07c22fcd2cf0') : (dynamicExerciseId ? String(dynamicExerciseId) : String(jogoSelecionado || '8')),
          score: scoreObtido ?? 0,
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

  const handleValidationResult = (isCorrect: boolean, feedbackTexto?: string, pontosCustom?: number, exerciseId?: string) => {
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
    }
    sincronizarXpUnidadeComBanco(xpUnidade + xpGanho, jogoSelecionado === "roleplay" ? "9" : jogoSelecionado, xpGanho, jogoSelecionado === "roleplay" ? (typeof subUnidadeIndex === "string" ? subUnidadeIndex : "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0") : (exerciseId && exerciseId !== "roleplay" ? exerciseId : "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0"));
    // Notifica conclusão do exercício no Supabase para Reordenação e outros módulos
    if (isCorrect) {
      console.log("🚀 [ARENA QUIZ] Notificando Supabase sobre conclusão do jogo:", jogoSelecionado);
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
    { id: 'traducao', label: 'TRADUÇÃO INVERSA', title: 'ENGENHARIA REVERSA', component: <MioloTraducaoInversa onValidateResult={handleValidationResult} unidadeAtiva={typeof subUnidadeIndex === 'number' ? String(subUnidadeIndex) : (subUnidadeIndex || '09adf4ff-71ed-4b2b-982e-07c22fcd2cf0')} /> },
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
              {visualizacaoAtiva === "EXERCICIO" && (
                <h2 className="text-sm font-bold text-white tracking-tight mt-0.5">{jogoAtual.label}</h2>
              )}
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
                      const desbloqueado = conteudo.id <= (unidadesConcluidas + 1);
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
                      const desbloqueado = conteudo.id <= (unidadesConcluidas + 1);
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
                <div className="flex-1 my-8 bg-[#030712] rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                  {carregandoVideo ? (
                    <div className="text-center p-4 flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#FF8A2B] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-400 font-mono">CARREGANDO TRANSMISSÃO...</p>
                    </div>
                  ) : urlEmbedAtiva ? (
                    <iframe
                      className="w-full h-full border-0 rounded-2xl"
                      src={urlEmbedAtiva}
                      title="Haas Streaming"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                        <AlertCircle size={24} />
                      </div>
                      <p className="text-xs text-slate-200 font-bold uppercase tracking-wider">MÍDIA NÃO DISPONÍVEL</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">NENHUM LINK VINCULADO AO ID {videoSelecionado?.id}</p>
                    </div>
                  )}
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
                      const desbloqueado = conteudo.id <= (unidadesConcluidas + 1);
                      
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

                <div className="flex-1 my-8 bg-[#030712] rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                  {carregandoVideo ? (
                    <div className="text-center p-4 flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#FF8A2B] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-400 font-mono">CARREGANDO TRANSMISSÃO...</p>
                    </div>
                  ) : urlEmbedAtiva ? (
                    <iframe
                      className="w-full h-full border-0 rounded-2xl"
                      src={urlEmbedAtiva}
                      title="Haas Streaming"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                        <AlertCircle size={24} />
                      </div>
                      <p className="text-xs text-slate-200 font-bold uppercase tracking-wider">MÍDIA NÃO DISPONÍVEL</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">NENHUM LINK VINCULADO AO ID {videoSelecionado?.id}</p>
                    </div>
                  )}
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
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1 text-amber-400 font-mono">
              <Zap size={12} className="fill-amber-400 stroke-amber-400" /> {creditosPlano !== null ? `${creditosPlano} REQS` : "..."}
            </span>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 py-4 min-h-0 relative">
            


            <div className="w-full flex-1 bg-[#070d19] border border-white/[0.04] p-4 rounded-2xl relative text-left shadow-xl flex flex-col justify-between z-10 overflow-hidden">
              
              <span className="w-full text-[9px] font-black text-[#38BDF8] tracking-widest uppercase block border-b border-white/5 pb-1 select-none shrink-0 mb-2">{tArena.mentorName}</span>
              
              <div className="flex flex-col flex-1 overflow-y-auto mb-3 pr-1 max-h-[460px] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <div className="text-[13px] font-sans font-medium leading-relaxed text-slate-100 mt-1">
                  {(chatHistory.length >= 0 || isThinking || respostaIA) ? (
                    <div className="text-slate-100 text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium flex flex-col gap-4 w-full">
                      
                      {/* Histórico Consolidado */}
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={msg.tipo === "user" ? "text-right" : "text-left text-slate-100"}>
                          <span className={msg.tipo === "user" ? ((msg as any).audioUrl ? "inline-block" : "inline-block bg-slate-800/60 rounded-xl px-4 py-2 border border-slate-700/30") : "block w-full"}>
                            {(msg as any).audioUrl ? (
                              <div className="py-1">
<div className="flex items-center gap-3 bg-violet-950/40 rounded-xl px-4 py-2.5 border border-violet-500/20">
                                  <button onClick={(e) => {
                                    const p = e.currentTarget.parentElement;
                                    if (p) {
                                      const tagAudio = p.querySelector('audio');
                                      if (tagAudio) {
                                        if (tagAudio.paused) {
                                          tagAudio.play().catch(err => console.log("Erro ao reproduzir áudio local:", err));
                                        } else {
                                          tagAudio.pause();
                                        }
                                      }
                                    }
                                  }} className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white transition-colors cursor-pointer shadow-md shadow-violet-900/30" title="Ouvir mensagem">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
                                  </button>
                                  <audio src={(msg as any).audioUrl} className="hidden" />
                                </div>
                              </div>
                              ) : 
<span className="block w-full">
  {msg.tipo !== "user" && (msg as any).isAudioMode ? (
    <div className="flex items-center gap-3 bg-amber-950/40 rounded-xl px-4 py-2.5 border border-amber-500/20 max-w-max my-1">
      
      <button onClick={(e) => {
        e.stopPropagation();
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); return; }
        const t = msg.texto.replace(/QUEUE:\d+/g, "").trim();
        if (!t) return;
        
        const blocos = t.split("\n").map(b => b.trim()).filter(Boolean);
        const mapearLang = (sigla) => {
          // Determina se estamos tentando mapear o idioma Alvo (Curso) ou Nativo do Aluno
          const isAlvo = sigla === (typeof currentLang !== "undefined" ? currentLang : "PT");
          
          if (isAlvo) {
            const cursoRaw = (window as any).__supabaseCourseLanguage || "";
            const curso = cursoRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            if (curso.includes("portugues") || curso.includes("pt")) return "pt-BR";
            if (curso.includes("espanol") || curso.includes("es")) return "es-ES";
            if (curso.includes("ingles") || curso.includes("english") || curso.includes("en")) return "en-US";
            return "pt-BR";
          } else {
            const nativoRaw = (typeof idiomaNativoReal !== "undefined" && idiomaNativoReal) ? idiomaNativoReal : "";
            const nativo = nativoRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            if (nativo.includes("portugues") || nativo.includes("pt")) return "pt-BR";
            if (nativo.includes("espanol") || nativo.includes("es")) return "es-ES";
            if (nativo.includes("ingles") || nativo.includes("english") || nativo.includes("en")) return "en-US";
            return "pt-BR";
          }
        };

        const langNativo = mapearLang(typeof idiomaNativoReal !== "undefined" ? idiomaNativoReal : "Portuguese");
        const langAlvo = mapearLang(typeof currentLang !== "undefined" ? currentLang : "Portuguese");

        let indexBloco = 0;
        const falarSequencial = async () => {
          if (indexBloco >= blocos.length) return;
          const textoBloco = blocos[indexBloco];
          try {
            const res = await fetch("/api/ai/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: textoBloco, voice: "nova" }),
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            audio.onended = () => { indexBloco++; falarSequencial(); };
            await audio.play();
          } catch (e) {
            indexBloco++;
            falarSequencial();
          }
        };
        falarSequencial();
      }} className="w-8 h-8 rounded-full bg-amber-600 hover:bg-amber-500 flex items-center justify-center text-white transition-colors cursor-pointer shadow-md shadow-amber-900/30" title="Ouvir mensagem">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  ) : (
    <>
      {msg.tipo !== "user" && (
        <button onClick={(e) => {
          e.stopPropagation();
          if (typeof window === "undefined" || !window.speechSynthesis) return;
          if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); return; }
          const t = msg.texto.replace(/QUEUE:\d+/g, "").trim();
          if (!t) return;
          
          const blocos = t.split("\n").map(b => b.trim()).filter(Boolean);
          const mapearLang = (sigla) => {
          // Determina se estamos tentando mapear o idioma Alvo (Curso) ou Nativo do Aluno
          const isAlvo = sigla === (typeof currentLang !== "undefined" ? currentLang : "PT");
          
          if (isAlvo) {
            const cursoRaw = (window as any).__supabaseCourseLanguage || "";
            const curso = cursoRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            if (curso.includes("portugues") || curso.includes("pt")) return "pt-BR";
            if (curso.includes("espanol") || curso.includes("es")) return "es-ES";
            if (curso.includes("ingles") || curso.includes("english") || curso.includes("en")) return "en-US";
            return "pt-BR";
          } else {
            const nativoRaw = (typeof idiomaNativoReal !== "undefined" && idiomaNativoReal) ? idiomaNativoReal : "";
            const nativo = nativoRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            if (nativo.includes("portugues") || nativo.includes("pt")) return "pt-BR";
            if (nativo.includes("espanol") || nativo.includes("es")) return "es-ES";
            if (nativo.includes("ingles") || nativo.includes("english") || nativo.includes("en")) return "en-US";
            return "pt-BR";
          }
        };

          const langNativo = mapearLang(typeof idiomaNativoReal !== "undefined" ? idiomaNativoReal : "Portuguese");
          const langAlvo = mapearLang(typeof currentLang !== "undefined" ? currentLang : "Portuguese");

          let indexBloco = 0;
          const falarSequencial = async () => {
          if (indexBloco >= blocos.length) return;
          const textoBloco = blocos[indexBloco];
          try {
            const res = await fetch("/api/ai/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: textoBloco, voice: "nova" }),
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            audio.onended = () => { indexBloco++; falarSequencial(); };
            await audio.play();
          } catch (e) {
            indexBloco++;
            falarSequencial();
          }
        };
          falarSequencial();
        }} className="hidden" title="Ouvir"></button>
      )}
      {msg.texto}
    </>
  )}
</span>}
                          </span>
                        </div>
                      ))}

                      {/* Stream de Resposta Ativa */}
                      {respostaIA && !chatHistory.some(m => m.texto === respostaIA) && (
                         <div style={{ display: "none" }}>{(() => { console.log("=== BASTIDORES RESPOSTA IA ===", respostaIA); return respostaIA; })()}</div>
                      )}

                      {/* Animação e feedback visual de digitação */}
                      {isThinking && (
                        <div className="flex flex-col gap-2 py-1 mt-1 w-max">
                          <span className="text-slate-400 text-xs italic">{getThinkingMessage()}</span>
                          <div className="flex items-center space-x-1.5 pl-0.5">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (isThinking && tipoEnvio === "audio") ? (
                                        <div className="flex flex-col gap-3 py-2 animate-pulse">
                      <div className="text-slate-300 font-sans text-sm font-medium tracking-wide opacity-90">
                        {getThinkingMessage()}
                      </div>
                      <div className="flex items-center gap-2 pl-1 h-6">
                        <div className="w-2.5 h-2.5 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '-0.3s' }}></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-tr from-cyan-400 to-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '-0.15s' }}></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-tr from-teal-300 to-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s' }}></div>
                      </div>
                    </div>
                  ) : respostaIA ? (
                    <div className="text-slate-100 text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                      {(() => {
                        const rawLang = (idiomaNativoReal || "Portuguese").toLowerCase();
                        const nivelTxt = alunoNivel || "A1";
                        const unidadeTxt = dadosLicaoEscrita?.title || dadosLicaoEscrita?.unit || subUnidadeIndex || "";
                        let textoBase = "";
                        if (rawLang.includes("spanish") || rawLang === "es") {
                          textoBase = `¡Hola, ${nomeUsuarioReal || "Estudante"}! Qué excelente tenerte aquí en tu nivel ${nivelTxt}. Estoy preparando un análisis de tus puntos clave en la unidad ${unidadeTxt} para guiarte ahora mismo...\n\n`;
                        } else if (rawLang.includes("english") || rawLang === "en") {
                          textoBase = `Hello, ${nomeUsuarioReal || "Estudante"}! Great to have you here at level ${nivelTxt}. I am mapping out your key focal points for unit ${unidadeTxt} to guide you right now...\n\n`;
                        } else {
                          textoBase = `Olá, ${nomeUsuarioReal || "Estudante"}! Que excelente ter você aqui no seu nível ${nivelTxt}. Estou mapeando os seus pontos de atenção na unidade ${unidadeTxt} para te guiar agora mesmo...\n\n`;
                        }
                        return (
                          <div className="text-slate-100 text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium flex flex-col gap-4">
                            <div>{textoBase}</div>
                            {chatHistory.map((msg, i) => (
                              <div key={i} className={msg.tipo === 'user' ? 'text-right' : 'text-left text-slate-100'}>
                                <span className={msg.tipo === 'user' ? 'inline-block bg-slate-800/60 rounded-xl px-4 py-2 border border-slate-700/30' : ''}>
                                  
<span className="block w-full">
  {msg.tipo !== "user" && (msg as any).isAudioMode ? (
    <div className="flex items-center gap-3 bg-amber-950/40 rounded-xl px-4 py-2.5 border border-amber-500/20 max-w-max my-1">
      
      <button onClick={(e) => {
        e.stopPropagation();
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); return; }
        const t = msg.texto.replace(/QUEUE:\d+/g, "").trim();
        if (!t) return;
        
        const blocos = t.split("\n").map(b => b.trim()).filter(Boolean);
        const mapearLang = (sigla) => {
          // Determina se estamos tentando mapear o idioma Alvo (Curso) ou Nativo do Aluno
          const isAlvo = sigla === (typeof currentLang !== "undefined" ? currentLang : "PT");
          
          if (isAlvo) {
            const cursoRaw = (window as any).__supabaseCourseLanguage || "";
            const curso = cursoRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            if (curso.includes("portugues") || curso.includes("pt")) return "pt-BR";
            if (curso.includes("espanol") || curso.includes("es")) return "es-ES";
            if (curso.includes("ingles") || curso.includes("english") || curso.includes("en")) return "en-US";
            return "pt-BR";
          } else {
            const nativoRaw = (typeof idiomaNativoReal !== "undefined" && idiomaNativoReal) ? idiomaNativoReal : "";
            const nativo = nativoRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            if (nativo.includes("portugues") || nativo.includes("pt")) return "pt-BR";
            if (nativo.includes("espanol") || nativo.includes("es")) return "es-ES";
            if (nativo.includes("ingles") || nativo.includes("english") || nativo.includes("en")) return "en-US";
            return "pt-BR";
          }
        };

        const langNativo = mapearLang(typeof idiomaNativoReal !== "undefined" ? idiomaNativoReal : "Portuguese");
        const langAlvo = mapearLang(typeof currentLang !== "undefined" ? currentLang : "Portuguese");

        let indexBloco = 0;
        const falarSequencial = async () => {
          if (indexBloco >= blocos.length) return;
          const textoBloco = blocos[indexBloco];
          try {
            const res = await fetch("/api/ai/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: textoBloco, voice: "nova" }),
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            audio.onended = () => { indexBloco++; falarSequencial(); };
            await audio.play();
          } catch (e) {
            indexBloco++;
            falarSequencial();
          }
        };
        falarSequencial();
      }} className="w-8 h-8 rounded-full bg-amber-600 hover:bg-amber-500 flex items-center justify-center text-white transition-colors cursor-pointer shadow-md shadow-amber-900/30" title="Ouvir mensagem">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  ) : (
    <>
      {msg.tipo !== "user" && (
        <button onClick={(e) => {
          e.stopPropagation();
          if (typeof window === "undefined" || !window.speechSynthesis) return;
          if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); return; }
          const t = msg.texto.replace(/QUEUE:\d+/g, "").trim();
          if (!t) return;
          
          const blocos = t.split("\n").map(b => b.trim()).filter(Boolean);
          const mapearLang = (sigla) => {
          // Determina se estamos tentando mapear o idioma Alvo (Curso) ou Nativo do Aluno
          const isAlvo = sigla === (typeof currentLang !== "undefined" ? currentLang : "PT");
          
          if (isAlvo) {
            const cursoRaw = (window as any).__supabaseCourseLanguage || "";
            const curso = cursoRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            if (curso.includes("portugues") || curso.includes("pt")) return "pt-BR";
            if (curso.includes("espanol") || curso.includes("es")) return "es-ES";
            if (curso.includes("ingles") || curso.includes("english") || curso.includes("en")) return "en-US";
            return "pt-BR";
          } else {
            const nativoRaw = (typeof idiomaNativoReal !== "undefined" && idiomaNativoReal) ? idiomaNativoReal : "";
            const nativo = nativoRaw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            if (nativo.includes("portugues") || nativo.includes("pt")) return "pt-BR";
            if (nativo.includes("espanol") || nativo.includes("es")) return "es-ES";
            if (nativo.includes("ingles") || nativo.includes("english") || nativo.includes("en")) return "en-US";
            return "pt-BR";
          }
        };

          const langNativo = mapearLang(typeof idiomaNativoReal !== "undefined" ? idiomaNativoReal : "Portuguese");
          const langAlvo = mapearLang(typeof currentLang !== "undefined" ? currentLang : "Portuguese");

          let indexBloco = 0;
          const falarSequencial = async () => {
          if (indexBloco >= blocos.length) return;
          const textoBloco = blocos[indexBloco];
          try {
            const res = await fetch("/api/ai/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: textoBloco, voice: "nova" }),
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            audio.onended = () => { indexBloco++; falarSequencial(); };
            await audio.play();
          } catch (e) {
            indexBloco++;
            falarSequencial();
          }
        };
          falarSequencial();
        }} className="hidden" title="Ouvir"></button>
      )}
      {msg.texto}
    </>
  )}
</span>
                                </span>
                              </div>
                            ))}
                            {isThinking && !respostaIA && (
                              <div className="text-left text-cyan-400 italic animate-pulse">Digitando...</div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div>
                      {(isThinking && tipoEnvio === "texto") ? (
                        <span className="text-slate-400 font-sans italic">{getThinkingMessage()}</span>
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
                              const nivelTxt = alunoNivel || "A1";
                              const unidadeTxt = dadosLicaoEscrita?.title || dadosLicaoEscrita?.unit || subUnidadeIndex || "";
                              
                              if (typeof window !== 'undefined' && userId && !respostaIA && !isThinking) {
                                globalThis._hasTriggeredInit = globalThis._hasTriggeredInit || false;
                                if (!globalThis._hasTriggeredInit) {
                                  globalThis._hasTriggeredInit = true;
                                  setTimeout(() => {
                                    // Monta o prompt dinâmico usando o nome real do aluno logado
                                    const promptBoasVindas = `Gerar uma mensagem curta de incentivo pedagógico para o aluno ${nomeUsuarioReal || "Estudante"} no nível ${nivelTxt}, unidade ${unidadeTxt}. Foque em motivá-lo a praticar e superar os pequenos desafios do aprendizado sem soar genérico. Responda estritamente no idioma ${rawLang.includes("spanish") ? "Espanhol" : rawLang.includes("english") ? "Inglês" : "Português"}.`;
                                    
                                    // Dispara o fetch local diretamente usando as credenciais e variáveis do escopo local
                                    setIsThinking(true);
                                    setRespostaIA('');
                                    
                                    fetch("/api/ai/mentor", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ prompt: promptBoasVindas, userId: userId, idiomaTela: currentLang })
                                    }).then(async (res) => {
                                      if (!res.body) return;
                                      const reader = res.body.getReader();
                                      const decoder = new TextDecoder("utf-8");
                                      let acumulado = "";
                                      while (true) {
                                        const { done, value } = await reader.read();
                                        if (done) break;
                                        acumulado += decoder.decode(value, { stream: true });
                                        setRespostaIA(acumulado);
                                      }
                                    }).catch(err => console.error(err))
                                      .finally(() => setIsThinking(false));
                                  }, 400);
                                }
                              }

                              let textoBase = "";
                              if (rawLang.includes("spanish") || rawLang === "es") {
                                textoBase = `¡Hola, ${nomeUsuarioReal || "Estudante"}! Qué excelente tenerte aquí en tu nivel ${nivelTxt}. Estoy preparando un análisis de tus puntos clave en la unidad ${unidadeTxt} para guiarte agora mesmo...`;
                              } else if (rawLang.includes("english") || rawLang === "en") {
                                textoBase = `Hello, ${nomeUsuarioReal || "Estudante"}! Great to have you here at level ${nivelTxt}. I am mapping out your key focal points for unit ${unidadeTxt} to guide you right now...`;
                              } else {
                                textoBase = `Olá, ${nomeUsuarioReal || "Estudante"}! Que excelente ter você aqui no seu nível ${nivelTxt}. Estou mapeando os seus pontos de atenção na unidade ${unidadeTxt} para te guiar agora mesmo...`;
                              }

                              return (
                                <div className="flex flex-col gap-2 w-full">
                                  <div className="text-slate-100 text-[13px] font-sans font-medium leading-relaxed">
                                    {textoBase}
                                  </div>
                                  {isThinking && (
                                    <div className="flex items-center gap-2 pl-1 h-6 mt-1">
                                      <div className="w-2.5 h-2.5 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '-0.3s' }}></div>
                                      <div className="w-2.5 h-2.5 bg-gradient-to-tr from-cyan-400 to-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '-0.15s' }}></div>
                                      <div className="w-2.5 h-2.5 bg-gradient-to-tr from-teal-300 to-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s' }}></div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={perguntarAoMentor} className="flex items-center bg-[#0c192e] border border-white/5 rounded-xl px-3 py-1.5 mt-auto w-full relative">
                 {isRecording ? (
                  <div className="flex-1 flex items-center justify-start gap-1.5 h-[32px] pl-2">
                    <div className="w-1.5 h-3 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full animate-[bounce_0.6s_infinite_alternate]" />
                    <div className="w-1.5 h-5 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full animate-[bounce_0.4s_infinite_alternate_0.1s]" />
                    <div className="w-1.5 h-6 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-full animate-[bounce_0.7s_infinite_alternate_0.2s]" />
                    <div className="w-1.5 h-4.5 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full animate-[bounce_0.5s_infinite_alternate_0.15s]" />
                    <div className="w-1.5 h-3 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-full animate-[bounce_0.35s_infinite_alternate_0.3s]" />
                    <div className="w-1.5 h-4 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full animate-[bounce_0.65s_infinite_alternate_0.05s]" />
                    <div className="w-1.5 h-5.5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full animate-[bounce_0.45s_infinite_alternate_0.2s]" />
                    <div className="w-1.5 h-4 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-full animate-[bounce_0.55s_infinite_alternate_0.4s]" />
                    <div className="w-1.5 h-3 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full animate-[bounce_0.5s_infinite_alternate_0.1s]" />
                    <div className="w-1.5 h-6 bg-gradient-to-t from-pink-600 to-purple-400 rounded-full animate-[bounce_0.4s_infinite_alternate_0.2s]" />
                    <div className="w-1.5 h-6.5 bg-gradient-to-t from-pink-500 to-purple-300 rounded-full animate-[bounce_0.75s_infinite_alternate_0.12s]" />
                    <div className="w-1.5 h-4 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full animate-[bounce_0.5s_infinite_alternate_0.3s]" />
                  </div>
                ) : (
                  <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={tArena.chatPlaceholder}
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono pr-16"
                  disabled={isRecording}
                />
                )}
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

      

    </div>
  );
}
