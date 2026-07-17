'use client';
import InjetorSomPremium from './components/InjetorSomPremium';
import ModalAvaliacaoFidelidade from "./components/ModalAvaliacaoFidelidade";
import ModalEntregaAtividade from "./components/ModalEntregaAtividade";
import ModalAgendaAluno from "./components/ModalAgendaAluno";
import GavetaBadges from './GavetaBadges';
import { translations } from './idiomas';
import BotaoAula from "./BotaoAula";
import PremiumStyle from "./PremiumStyle";
import React, { useState, useEffect } from 'react';
import ProgramaTrilha from './components/ProgramaTrilha';
import ArenaQuiz from './components/ArenaQuiz';
import { supabase } from '@/lib/supabase';
import { fetchCentralPortalData } from "@/services/centralService";
import { Home, MapPin, Gift, BookOpen, Trophy, ChevronDown, Crown, User, X, Shield, Box, Target, Globe, Flame, Clock, Award, Star, Zap, Terminal, TrendingUp, AlertTriangle, Calendar, ChevronLeft, ArrowRight, Hourglass, Users, Briefcase, Ticket } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

function MascoteRoboAI({ devePiscar = false, idioma = 'PT', olharDireta = false }) {
  const dicionarioMascote = {
    PT: 'MENTORA HAAS',
    EN: 'HAAS MENTOR',
    ES: 'MENTORA HAAS'
  };
  return (
    <div className="relative flex flex-col items-center justify-center p-2 rounded-2xl shadow-lg w-16 h-16 xl:w-20 xl:h-20 shrink-0 border border-cyan-500/30 bg-[#070d19]/80 backdrop-blur-md hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all duration-300 cursor-pointer select-none">
      <svg viewBox="0 0 64 64" className="w-10 h-10 xl:w-12 xl:h-12 drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path style={{ transform: devePiscar ? "rotate(-3deg) translateY(1px)" : "none", transformOrigin: "22px 22px", transition: "transform 0.15s ease-in-out" }} d="M18 22C18 12 22 6 22 6C22 6 26 12 26 22" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path style={{ transform: devePiscar ? "rotate(3deg) translateY(1px)" : "none", transformOrigin: "42px 22px", transition: "transform 0.15s ease-in-out" }} d="M38 22C38 12 42 6 42 6C42 6 46 12 46 22" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 18C22 14 23 10 23 10" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
        <path d="M42 18C42 14 43 10 43 10" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="14" y="22" width="36" height="30" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2"/>
        <rect x="18" y="26" width="28" height="22" rx="8" fill="#0F172A" />
        {/* Olhos piscando juntos */}
        {devePiscar ? (
          <>
            <path d="M19 35H25" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M34 35H40" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={olharDireta ? "25" : "22"} cy="35" r="3" fill="#A855F7" style={{ transition: "all 0.4s ease-in-out" }} />
            <circle cx={olharDireta ? "40" : "37"} cy="35" r="3" fill="#00D4FF" style={{ transition: "all 0.4s ease-in-out" }} />
          </>
        )}
        <circle cx="21" cy="42" r="1" fill="#A855F7" opacity="0.6"/>
        <circle cx="40" cy="42" r="1" fill="#00D4FF" opacity="0.6"/>
        <path d="M11 30V40C11 41.5 12 43 13.5 43" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"/>
        <path d="M53 30V40C53 41.5 52 43 50.5 43" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"/>
        <path d={(devePiscar) ? "M28 42.5H33" : "M28 41C28 42.5 29 43.5 30.5 43.5C32 43.5 33 42.5 33 41"} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="hidden"></span>
    </div>
  );
}

export default function DashboardDesktop() {
  const [modalPedagogoPage, setModalPedagogoPage] = React.useState({ aberto: false, tipo: null });
          const [scoreAtivo, setScoreAtivo] = useState(50);
  const [tempoModulo, setTempoModulo] = useState(15);
  const [nomeModulo, setNomeModulo] = useState("Carregando módulo...");
  const [listaUnidades, setListaUnidades] = useState([]);
  const [xpTotalUnidade, setXpTotalUnidade] = useState(4250);
  const [patenteBruta, setPatenteBruta] = useState("Explorador");

  useEffect(() => {
    const carregarMetricasDashboard = async () => {
      try {
        const urlBase = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
        const headers = { "apikey": token, "Authorization": "Bearer " + token };
        const uid = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

        const rUser = await fetch(urlBase + "/rest/v1/users?id=eq." + uid + "&select=current_level", { headers });
        const dUser = await rUser.json();
        if (dUser && dUser[0]) {
          const nivelSigla = dUser[0].current_level || "A1";
          const rLevel = await fetch(urlBase + "/rest/v1/levels?level_tag=eq." + nivelSigla + "&select=level_name", { headers });
          const dLevel = await rLevel.json();
          if (dLevel && dLevel[0]) {
            const nomeBase = dLevel[0].level_name || "Explorador";
            const traducoes = {
              "Explorador": { PT: "Explorador", ES: "Explorador", EN: "Explorer" },
              "Pioneiro": { PT: "Pioneiro", ES: "Pionero", EN: "Pioneer" },
              "Conquistador": { PT: "Conquistador", ES: "Conquistador", EN: "Conqueror" },
              "Estrategista": { PT: "Estrategista", ES: "Estratega", EN: "Strategist" },
              "Embaixador": { PT: "Embaixador", ES: "Embajador", EN: "Ambassador" }
            };
            const lang = (typeof idioma !== "undefined" ? idioma : "PT").toUpperCase();
            if (traducoes[nomeBase]) {
              setPatenteBruta(traducoes[nomeBase][lang] || traducoes[nomeBase]["PT"]);
            } else {
              setPatenteBruta(nomeBase);
            }
          }
        }

        const rProg = await fetch(urlBase + "/rest/v1/user_unit_progress?user_id=eq." + uid + "&select=unit_xp&order=completed_at.desc&limit=1", { headers });
        const dProg = await rProg.json();
        if (dProg && dProg[0]) setScoreAtivo(dProg[0].unit_xp || 50);

        // Fetch Conectado à Central: Busca as unidades usando o nível dinâmico resolvido com escopo seguro
        try {
          const nivelResolvido = (dUser && dUser[0]) ? (dUser[0].current_level || "A1") : "A1";
          const moduloAlvo = (dUser && dUser[0]) ? (dUser[0].current_module_number || 1) : 1;
          
          const rUnit = await fetch(urlBase + "/rest/v1/units?select=id,unit_title,module_number,level,required_xp&module_number=eq." + moduloAlvo + "&level=eq." + nivelResolvido + "&order=unit_number.asc&limit=5", { headers });
          const dUnit = await rUnit.json();
          if (dUnit && dUnit.length > 0) {
            setListaUnidades(dUnit);
            setXpTotalUnidade(dUnit[0].required_xp || 4250);
          }
        } catch (errUnit) { console.error("Erro ao ler unidades dinâmicas da central:", errUnit); }

        const rMod = await fetch(urlBase + "/rest/v1/modules_content?select=estimated_hours,module_title&limit=1", { headers });
        const dMod = await rMod.json();
        if (dMod && dMod[0]) {
          setTempoModulo(Math.round((dMod[0].estimated_hours || 2) * 60));
          if (dMod[0].module_title) setNomeModulo(dMod[0].module_title);
        }
      } catch (e) { console.error("Erro ao carregar métricas:", e); }

        // FETCH ISOLADO: Ranking Global com credenciais diretas do ambiente
        try {
          const sUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
          const sKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
          if (sUrl && sKey) {
            const rRanking = await fetch(sUrl + "/rest/v1/users?select=id,nickname,total_xp&order=total_xp.desc&limit=10", {
              headers: {
                "apikey": sKey,
                "Authorization": "Bearer " + sKey,
                "Content-Type": "application/json"
              }
            });
            const dRanking = await rRanking.json();
            if (dRanking && Array.isArray(dRanking)) {
              setTopTen(dRanking);
            }
          }
        } catch (errRank) { console.error("Erro ao carregar Ranking Global:", errRank); }
    };
    carregarMetricasDashboard();
  }, []);

  const [isTrilhaOpen, setIsTrilhaOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isEntregaOpen, setIsEntregaOpen] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [abaProgAtiva, setAbaProgAtiva] = useState(false);
  const tocarSom = (tipo) => { if (typeof window !== 'undefined' && (window as any).tocarSomNativoPremium) { (window as any).tocarSomNativoPremium(tipo); } };
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [arenaModo, setArenaModo] = useState({ tipo: null, idx: null });

  // <Shield className="inline-block w-3 h-3 mr-1 mb-0.5 text-slate-500" />TRAVA DE SCROLL AUTOMÁTICA DA ARENA
  useEffect(() => {
    async function obterDadosDoBanco() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase.from('usuarios').select('nome, nivel_atual, tipo_aluno').eq('id', user.id).maybeSingle();
          if (data && !error) {
            setAluno1(data.nome || "Alpha_Leader");
            if (data.nivel_atual) setNivelAtual(data.nivel_atual.toUpperCase());
            if (data.tipo_aluno) setTipoAluno(data.tipo_aluno.toLowerCase());
          } else {
            setAluno1(user.user_metadata?.nome || user.email?.split('@')[0] || "Aluno");
          }
        }
      } catch (err) {
        console.error("Erro Supabase:", err);
      }
    }
    obterDadosDoBanco();
    if (isArenaOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isArenaOpen]);
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [trainMon, setTrainMon] = useState(false);
  const [trainTue, setTrainTue] = useState(false);
  const [trainWed, setTrainWed] = useState(false);
  const [trainThu, setTrainThu] = useState(false);
  const [trainFri, setTrainFri] = useState(false);
  const [trainSat, setTrainSat] = useState(false);
  const [trainSun, setTrainSun] = useState(false);

  const consistenciaSemanal = [
    { dia: "1", treinou: trainMon }, { dia: "2", treinou: trainTue }, { dia: "3", treinou: trainWed },
    { dia: "4", treinou: trainThu }, { dia: "5", treinou: trainFri }, { dia: "6", treinou: trainSat }, { dia: "7", treinou: trainSun }
  ];
  const [mounted, setMounted] = useState(false);
  // Inicializa buscando do localStorage, se não existir, define 'ES' como padrão absoluto no Desktop
  const [idioma, setIdioma] = useState<'PT' | 'EN' | 'ES'>(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem('haas_idioma');
      if (salvo && ['PT', 'EN', 'ES'].includes(salvo)) return salvo as 'PT' | 'EN' | 'ES';
    }
    return 'ES';
  });

  // Grava as alterações de idioma no mesmo local compartilhado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('haas_idioma', idioma);
    }
  }, [idioma]);
  const [activeTab, setActiveTab] = useState<string>('inicio');

  useEffect(() => {
    const intercepterClique = (e) => {
      const target = e.target;
      if (!target) return;
      const classNameStr = target.className && typeof target.className === 'string' 
        ? target.className 
        : (target.className && typeof target.className === 'object' ? String(target.className.baseVal || '') : '');

      if (target.classList && (target.classList.contains('fixed') || classNameStr.includes('backdrop-blur') || classNameStr.includes('inset-0'))) {
        return;
      }
      const elementoClicavel = target.closest('button, [onClick], .cursor-pointer, [role="button"]');
      if (!elementoClicavel) return; if (elementoClicavel.classList.contains('silenciar-som') && !elementoClicavel.innerText.match(/(PROSSEGUIR|NEXT|AVANÇAR|Avançar|Prosseguir)/i)) return;
      const paiClassNameStr = elementoClicavel.className && typeof elementoClicavel.className === 'string' ? elementoClicavel.className : '';
      if (paiClassNameStr.includes('backdrop-blur') || paiClassNameStr.includes('fixed inset-0')) {
        return;
      }
      tocarSom('click');
    };
    window.addEventListener('click', intercepterClique, { capture: true });
    return () => window.removeEventListener('click', intercepterClique, { capture: true });
  }, []);

  const t = translations[idioma];
  const [botPhraseIndex, setBotPhraseIndex] = useState(0);
  const [isBotWinking, setIsBotWinking] = useState(false);

  // Loop automático para dar vida ao mascote no Desktop (Piscar, orelhas e boca)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBotWinking(true);
      setTimeout(() => setIsBotWinking(false), 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [olharDiretaDesk, setOlharDiretaDesk] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setOlharDiretaDesk(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBotClick = () => {
    if (isBotWinking) return;
    setIsBotWinking(true);
    setBotPhraseIndex(prev => prev + 1);
    setTimeout(() => setIsBotWinking(false), 300);
  };

  const obterConselhoIA = () => {
    const traduzirErro = (err) => {
      if (err === 'Prepositions') return { PT: 'Preposições', EN: 'Prepositions', ES: 'Preposiciones' }[idioma];
      if (err === 'Phrasal Verbs') return { PT: 'Phrasal Verbs', EN: 'Phrasal Verbs', ES: 'Phrasal Verbs' }[idioma];
      return err;
    };
    const erroTraduzido = typeof erro1 !== 'undefined' ? traduzirErro(erro1) : 'Preposições';
    const xpPorcentagem = typeof porcentagemXp !== 'undefined' ? porcentagemXp : '65';
    const nomeAluno = typeof aluno1 !== 'undefined' ? aluno1 : 'Alpha';

    const bancoConselhos = {
      PT: [
        `⚡ Notei que o seu ponto fraco atual é ${erroTraduzido}. Clique para reforçar esse conteúdo!`,
        `🎯 Você já domina ${xpPorcentagem}% desta unidade. Vamos buscar o próximo badge hoje?`,
        `🔥 Ótimo progresso, ${nomeAluno}! Não deixe seu Racha de Retenção cair hoje.`
      ],
      EN: [
        `⚡ I noticed your current weak spot is ${erroTraduzido}. Click to reinforce this content!`,
        `🎯 You have mastered ${xpPorcentagem}% of this unit. Let's aim for the next badge today?`,
        `🚀 Great momentum, ${nomeAluno}! Keep your Retention Streak safe today.`
      ],
      ES: [
        `⚡ Noté que tu punto débil actual es ${erroTraduzido}. ¡Haz clic para reservar este conteúdo!`,
        `🎯 Ya dominas el ${xpPorcentagem}% de esta unidad. ¿Vamos por la seguinte insignia hoy?`,
        `🔥 ¡Buen progreso, ${nomeAluno}! No dejes que tu racha de retención caiga hoy.`
      ]
    };
    const listaAtual = bancoConselhos[idioma] || bancoConselhos['PT'];
    return listaAtual[botPhraseIndex % listaAtual.length];
  };
  
  const [aluno1, setAluno1] = useState("Alpha_Leader");
  const [nicknameAluno, setNicknameAluno] = useState("Alpha_Leader");
  const [userIdBanco, setUserIdBanco] = useState("");
  const [streakDays, setStreakDays] = useState(0);
  const [tipoAluno, setTipoAluno] = useState("particular");
  const [idiomaCurso, setIdiomaCurso] = useState("SEM IDIOMA");
  const [nivelObjetivo, setNivelObjetivo] = useState("SEM NÍVEL");
  const [listaEntregas, setListaEntregas] = useState([]);

    useEffect(() => {
    async function carregarDadosCentralizados() {
      try {
        const dadosPortal = await fetchCentralPortalData();
        if (dadosPortal && dadosPortal.user) {
          const dbUser = dadosPortal.user;
          if (dbUser && dbUser.id) setUserIdBanco(dbUser.id);
          console.log("=== CONTEUDO REAL DE TRAINED_DAYS NO BANCO ===>", dbUser.trained_days);
          setAluno1(dbUser.name || "Alpha_Leader");
          if (dbUser.current_level) setNivelAtual(dbUser.current_level.toUpperCase());
          if (dbUser.student_type) setTipoAluno(dbUser.student_type.toLowerCase());
          if (dbUser.clinical_precision !== undefined) setPrecisaoClinica(dbUser.clinical_precision);
          if (dbUser.total_immersion_es !== undefined && dbUser.total_immersion_es !== null) setImersaoTotal(String(dbUser.total_immersion_es) + "h");
          if (dbUser.active_vocabulary !== undefined) setVocabularioAtivo(dbUser.active_vocabulary);
          
          if (dadosPortal && dadosPortal.error_logs) {
            setErrorLogs(dadosPortal.error_logs || []);
          }

          if (dbUser && dbUser.clinical_precision !== undefined) {
            setPrecisaoClinica(dbUser.clinical_precision);
          }
          if (dadosPortal && dadosPortal.competencias) {
            const comp = dadosPortal.competencias;
            if (comp.habla !== undefined) setCHabla(Number(comp.habla));
            if (comp.escucha !== undefined) setCEscucha(Number(comp.escucha));
            if (comp.gramatica !== undefined) setCGramatica(Number(comp.gramatica));
            if (comp.escritura !== undefined) setCEscritura(Number(comp.escritura));
            if (comp.lectura !== undefined) setCLectura(Number(comp.lectura));
          }
          if (dbUser.next_expiration_es) {
            const dateStr = String(dbUser.next_expiration_es);
            if (dateStr.includes("-")) {
              const [ano, mes, dia] = dateStr.split("T")[0].split("-");
              setProximoVencimento(`${dia}/${mes}/${ano}`);
            } else {
              setProximoVencimento(dateStr);
            }
          }
          if (dbUser.total_xp) setXpTotal(String(dbUser.total_xp));
          setNicknameAluno(dbUser.nickname || dbUser.name || "Alpha_Leader");
          if (dbUser.streak_days !== undefined && dbUser.streak_days !== null) setStreakDays(Number(dbUser.streak_days));
          if (dbUser.trained_days && Array.isArray(dbUser.trained_days)) {
            setTrainMon(!!dbUser.trained_days[0]);
            setTrainTue(!!dbUser.trained_days[1]);
            setTrainWed(!!dbUser.trained_days[2]);
            setTrainThu(!!dbUser.trained_days[3]);
            setTrainFri(!!dbUser.trained_days[4]);
            setTrainSat(!!dbUser.trained_days[5]);
            setTrainSun(!!dbUser.trained_days[6]);
          }
          const idiomaReal = dbUser.course_language ? dbUser.course_language.toUpperCase() : "INGLÉS";
          const nivelReal = dbUser.target_level ? dbUser.target_level.toUpperCase() : "B1";
          setIdiomaCurso(idiomaReal);
          setNivelObjetivo(nivelReal);
          if (dadosPortal.submissions) setListaEntregas(dadosPortal.submissions);
          if (typeof window !== "undefined") {
            (window as any).__dadosBanco = {
              nome: dbUser.name,
              idioma_curso: dbUser.course_language,
              nivel_objetivo: dbUser.target_level,
              nivel_atual: dbUser.current_level,
              tipo_aluno: dbUser.student_type,
              nickname_cru: dbUser.nickname,
              objeto_user_inteiro: dbUser
            };
          }
        }
      } catch (err) { console.error(err); }
    }
    carregarDadosCentralizados();
  }, []);

  const carregarNomeUsuarioDesativado = async () => {};
  // Funcao antiga removida com sucesso para centralizacao
  const [nivelAtual, setNivelAtual] = useState("A1");
  const [precisaoClinica, setPrecisaoClinica] = useState(94);
  const [imersaoTotal, setImersaoTotal] = useState("14h");
  const [cHabla, setCHabla] = useState(70);
  const [errorLogs, setErrorLogs] = useState([]);
  const [isDepurarOpen, setIsDepurarOpen] = useState(false);
  const [cEscucha, setCEscucha] = useState(70);
  const [cGramatica, setCGramatica] = useState(70);
  const [cEscritura, setCEscritura] = useState(70);
  const [cLectura, setCLectura] = useState(70);
  const [vocabularioAtivo, setVocabularioAtivo] = useState(450);
  const [proximoVencimento, setProximoVencimento] = useState("10/07/2026");
  const [isMatriculadoSimulado, setIsMatriculadoSimulado] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        setIsAdminMode(true);
      }
    }
  }, []);
  const [isVencidoSimulado, setIsVencidoSimulado] = useState(false);
  const [isSimuladorLiberado, setIsSimuladorLiberado] = useState(false);
  const [xpAtual, setXpAtual] = useState("120"), [xpTotal, setXpTotal] = useState("500"), [porcentagemXp, setPorcentagemXp] = useState("65");
  const [topTen, setTopTen] = useState([]);
  const [erro1, setErro1] = useState("Prepositions"), [erro2, setErro2] = useState("Phrasal Verbs");
  const [peso1, setPeso1] = useState("High"), [peso2, setPeso2] = useState("Medium");
  const [isLigaOpen, setIsLigaOpen] = useState(false);
  const mockupLigas = [
    { rank: 1, nome: "Alpha_Leader 👑", xp: "2.450 PTS", badge: "Vanguard" },
    { rank: 2, nome: "Bruna_Haas", xp: "1.920 PTS", badge: "Expert" },
    { rank: 3, nome: "Rodrigo_M", xp: "1.850 PTS", badge: "Expert" },
    { rank: 4, nome: "Elena_Rostova", xp: "1.620 PTS", badge: "Navigator" },
    { rank: 5, nome: "Marcus_Tech", xp: "1.400 PTS", badge: "Navigator" },
    { rank: 6, nome: "Aline_P", xp: "1.150 PTS", badge: "Explorer" },
    { rank: 7, nome: "Thomas_K", xp: "980 PTS", badge: "Explorer" },
    { rank: 8, nome: "Zoe_Mendes", xp: "850 PTS", badge: "Scout" },
    { rank: 9, nome: "Lucas_V", xp: "720 PTS", badge: "Scout" },
    { rank: 10, nome: "Sofia_Data", xp: "600 PTS", badge: "Rookie" }
  ];

  useEffect(() => { setMounted(true); }, []);

  const dadosRadar = [
    { competenca: idioma === 'PT' ? 'Fala' : idioma === 'ES' ? 'Habla' : 'Speaking', nota: cHabla },
    { competenca: idioma === 'PT' ? 'Escuta' : idioma === 'ES' ? 'Escucha' : 'Listening', nota: cEscucha },
    { competenca: idioma === 'PT' ? 'Gramática' : idioma === 'ES' ? 'Gramática' : 'Grammar', nota: cGramatica },
    { competenca: idioma === 'PT' ? 'Escrita' : idioma === 'ES' ? 'Escritura' : 'Writing', nota: cEscritura },
    { competenca: idioma === 'PT' ? 'Leitura' : idioma === 'ES' ? 'Lectura' : 'Reading', nota: cLectura }
  ];

  return (
    <div className="w-full min-h-screen xl:h-screen text-white/90 select-none flex flex-col overflow-y-auto xl:overflow-hidden bg-[#030914] relative font-sans isolate custom-scrollbar">
      
      {/* 🛠️ PAINEL GLOBAL DE SIMULAÇÃO (FLUTUANDO NO TOPO - VISÍVEL EM TODAS AS TELAS) */}
      <div className={`${isAdminMode ? "fixed" : "hidden"} top-2 left-1/2 -translate-x-1/2 z-[300] bg-slate-950/95 border border-amber-500/30 p-2 rounded-xl flex items-center gap-3 text-[10px] text-white shadow-2xl`}>
        <span className="text-slate-400 font-bold tracking-wider">SIMULAR VISTA:</span>
        <div className="flex gap-1.5">
          <button 
            onClick={() => { (window as any)._simulaMatriculado = false; (window as any)._simulaVencido = false; (window as any).dispatchEvent(new Event("resize")); }}
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              !(window as any)._simulaMatriculado ? "bg-amber-500 text-slate-950 shadow-sm" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            🆕 {idioma === 'PT' ? 'Aluno Novo' : idioma === 'EN' ? 'New Student' : 'Aluno Nuevo'}
          </button>
          <button 
            onClick={() => { (window as any)._simulaMatriculado = true; (window as any)._simulaVencido = false; (window as any).dispatchEvent(new Event("resize")); }}
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              (window as any)._simulaMatriculado && !(window as any)._simulaVencido ? "bg-emerald-500 text-slate-950 shadow-sm" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            🔄 {idioma === 'PT' ? 'Matriculado' : idioma === 'EN' ? 'Enrolled' : 'Aluno Matriculado'}
          </button>
          <button 
            onClick={() => { (window as any)._simulaMatriculado = true; (window as any)._simulaVencido = true; (window as any).dispatchEvent(new Event("resize")); }}
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              (window as any)._simulaMatriculado && (window as any)._simulaVencido ? "bg-rose-500 text-white shadow-sm" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            ⚠️ {idioma === 'PT' ? 'Vencido' : idioma === 'EN' ? 'Expired' : 'Vencido'}
          </button>
        </div>
      </div>
      <InjetorSomPremium />
      
      <div className="absolute top-0 left-[130px] w-[800px] h-[600px] pointer-events-none z-[-10] opacity-90 overflow-visible">
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
          <defs>
            <radialGradient id="funilLanterna3D" cx="40%" cy="10%" r="65%" fx="40%" fy="10%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="15%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#030914" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="nevoaComplementar" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="12%" stopColor="#f59e0b" stopOpacity="0.24" />
              <stop offset="42%" stopColor="#f59e0b" stopOpacity="0.11" />
              <stop offset="78%" stopColor="#f59e0b" stopOpacity="0.06" />
              <stop offset="82%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
            <filter id="blurNeonFunil" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="40" />
            </filter>
          </defs>
          <ellipse cx="220" cy="150" rx="380" ry="240" fill="url(#funilLanterna3D)" filter="url(#blurNeonFunil)" />
          <rect x="-200" y="180" width="1400" height="400" fill="url(#nevoaComplementar)" filter="url(#blurNeonFunil)" opacity="0.85" />
        </svg>
      </div>
      
      <style>{`
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(0,212,255,0.3)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 12px rgba(0,212,255,0.6)); transform: scale(1.01); }
        }
        .btn-3d-supreme-orange { background: linear-gradient(90deg, #7C3AED, #EC4899) !important; box-shadow: 0 8px 20px rgba(236,72,153,0.3) !important; transition: all 0.2s; }
        .btn-3d-supreme-orange:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 25px rgba(236,72,153,0.45) !important; }
        .card-3d-streak { background: linear-gradient(135deg, #FB923C 0%, #F97316 100%) !important; box-shadow: 0 10px 30px rgba(249,115,22,0.15) !important; color: #ffffff !important; transition: all 0.3s ease; }
        .card-3d-streak:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249,115,22,0.25) !important; }
        .animate-ai-mascot-pulse { animation: glowPulse 2.5s ease-in-out infinite; }
      `}</style>

      <div className="w-full bg-[#061324] px-4 xl:px-10 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0 rounded-b-[36px] shadow-md z-10 border-b border-[#f59e0b]/40 relative">
        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-4">
            <a href="https://academiahaas.com/" target="_blank" rel="noopener noreferrer" title="Voltar para a Academia Haas" className="bg-slate-900/60 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-indigo-600 h-10 w-10 rounded-2xl text-slate-400 hover:text-white border border-slate-800 hover:border-transparent font-black flex items-center justify-center text-lg shadow-inner transition-all duration-300 transform hover:scale-[1.03] cursor-pointer">H</a>
            <div>
              <h1 className="text-white font-extrabold text-xl xl:text-2xl tracking-tight leading-none flex items-center gap-2">
                {t.greeting} {aluno1}
                
                {isAdminMode && !isSimuladorLiberado ? (
                  <button 
                    onClick={() => {
                      const senha = prompt(idioma === 'PT' ? 'Digite a senha admin:' : idioma === 'ES' ? 'Ingrese la contraseña admin:' : 'Enter admin password:');
                      if (senha === 'haasadmin123') {
                        setIsSimuladorLiberado(true);
                      } else if (senha !== null) {
                        alert(idioma === 'PT' ? 'Senha incorreta!' : idioma === 'ES' ? '¡Contraseña incorrecta!' : 'Incorrect password!');
                      }
                    }}
                    className="ml-2 text-xs opacity-40 hover:opacity-100 transition-all cursor-pointer select-none"
                    title="Admin Simulation"
                  >
                    ⚙️
                  </button>
                ) : (
                  <div className={`${isAdminMode ? "inline-flex" : "hidden"} items-center gap-1.5 ml-3 bg-slate-950/60 p-1 border border-white/5 rounded-xl text-[10px] font-mono font-black select-none`}>
                    <span className="text-slate-500 uppercase tracking-wider px-1">🛠️ ADMIN:</span>
                    <button 
                      onClick={() => { setIsMatriculadoSimulado(false); setIsVencidoSimulado(false); }} 
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer \${!isMatriculadoSimulado ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 opacity-50 hover:opacity-80'}`}
                    >
                      🆕 {idioma === 'PT' ? 'Novo' : idioma === 'EN' ? 'New' : 'Nuevo'}
                    </button>
                    <button 
                      onClick={() => { setIsMatriculadoSimulado(true); setIsVencidoSimulado(false); }} 
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer \${isMatriculadoSimulado && !isVencidoSimulado ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 opacity-50 hover:opacity-80'}`}
                    >
                      🔄 {idioma === 'PT' ? 'Ativo' : idioma === 'EN' ? 'Active' : 'Activo'}
                    </button>
                    <button 
                      onClick={() => { setIsMatriculadoSimulado(true); setIsVencidoSimulado(true); }} 
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer \${isMatriculadoSimulado && isVencidoSimulado ? 'bg-rose-500 text-white font-black shadow-md' : 'text-slate-400 opacity-50 hover:opacity-80'}`}
                    >
                      ⚠️ {idioma === 'PT' ? 'Vencido' : idioma === 'EN' ? 'Expired' : 'Vencido'}
                    </button>
                  </div>
                )}
                <div className={`${isAdminMode ? "inline-flex" : "hidden"} items-center gap-1.5 ml-3 bg-slate-950/60 p-1 border border-white/5 rounded-xl text-[10px] font-mono font-black select-none`}>
                  <span className="text-slate-500 uppercase tracking-wider px-1">⚙️ SIMULAR:</span>
                  <button 
                    onClick={() => setIsMatriculadoSimulado(false)} 
                    className={`px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer ${!isMatriculadoSimulado ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 opacity-50 hover:opacity-80'}`}
                  >
                    🆕 {idioma === 'PT' ? 'Novo' : idioma === 'EN' ? 'New' : 'Nuevo'}
                  </button>
                  <button 
                    onClick={() => setIsMatriculadoSimulado(true)} 
                    className={`px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer ${isMatriculadoSimulado ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 opacity-50 hover:opacity-80'}`}
                  >
                    🔄 {idioma === 'PT' ? 'Matriculado' : idioma === 'EN' ? 'Enrolled' : 'Matriculado'}
                  </button>
                </div>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest font-black">{t.journey}</p>
                <span className="bg-[#f59e0b] text-white text-[10px] px-3.5 py-0.5 rounded font-bold font-mono shadow-sm whitespace-nowrap">{idiomaCurso} {idioma === "PT" ? "FLUÊNCIA" : idioma === "EN" ? "FLUENCY" : "FLUIDEZ"} {nivelObjetivo}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          <div className="bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 text-[9px] font-black text-white/80 flex gap-1 items-center">
            <Globe size={11} className="text-slate-400" />
            <button onClick={() => setIdioma('PT')} className={`px-1 py-0.5 rounded font-bold ${idioma === 'PT' ? 'bg-slate-950/60 text-amber-500 border border-amber-500/20 shadow-inner' : 'opacity-40 text-slate-400'}`}>PT</button>
            <button onClick={() => setIdioma('EN')} className={`px-1 py-0.5 font-bold ${idioma === 'EN' ? 'bg-slate-950/60 text-amber-500 rounded border border-amber-500/20 shadow-inner' : 'opacity-40 text-slate-400'}`}>EN</button>
            <button onClick={() => setIdioma('ES')} className={`px-1 py-0.5 font-bold ${idioma === 'ES' ? 'bg-slate-950/60 text-amber-500 rounded border border-amber-500/20 shadow-inner' : 'opacity-40 text-slate-400'}`}>ES</button>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl gap-0.5 border border-white/5">
            <button onClick={() => { setAbaProgAtiva(false); setIsPerfilOpen(true); }} className={`px-3 xl:px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 ${isPerfilOpen || !abaProgAtiva ? "text-amber-500 bg-white/[0.02] border border border-amber-500/20" : "text-slate-400 hover:text-slate-200"}`}>{idioma === "PT" ? "INÍCIO" : idioma === "ES" ? "INICIO" : "HOME"}</button>
            <button onClick={() => { setAbaProgAtiva(true); setIsPerfilOpen(false); setIsTrilhaOpen(true); }} className={`px-3 xl:px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 ${isTrilhaOpen || abaProgAtiva ? "text-amber-500 bg-white/[0.02] border border border-amber-500/20" : "text-slate-400 hover:text-slate-200"}`}>{idioma === "PT" ? "PROGRAMA" : idioma === "ES" ? "PROGRAMA" : "PROGRAM"}</button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 xl:px-6 pt-3 pb-4 flex flex-col xl:grid xl:grid-cols-[1fr_360px] gap-5 w-full xl:items-stretch xl:min-h-0 relative">

        <div className="flex flex-col gap-4 w-full xl:h-full xl:min-h-0 flex-1">
          <div className="bg-[#061324] pt-5 pb-5 px-5 xl:px-6 rounded-[36px] shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col justify-between border border-white/5 relative overflow-hidden xl:flex-1 min-h-0">
            <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none z-10 overflow-visible">
              <svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                <defs>
                  <linearGradient id="eclipseAgulhaFina" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#061324" stopOpacity="1" />
                    <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="1" />
                    <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#061324" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path d="M 450,0 L 36.5,0 A 36.5,36.5 0 0 0 0,36.5 L 0,260" stroke="url(#eclipseAgulhaFina)" strokeWidth="0.7" strokeLinecap="round"/>
              </svg>
            </div>
            
            <div className="w-full xl:flex-1 flex flex-col min-h-0">
              <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/10 pb-3 gap-4 shrink-0">
                <div>
                  <span className="text-[10px] font-black text-slate-100/80 uppercase font-mono tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block shrink-0" /> {t.missionTag}
                  </span>
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black text-amber-500 font-mono tracking-widest uppercase">
                        {idioma === 'ES' ? 'MÓDULO' : idioma === 'EN' ? 'MODULE' : 'MÓDULO'} {String(listaUnidades[0]?.module_number || 1).padStart(2, '0')}
                      </span>
                      <span className="px-2 py-0.5 font-mono font-bold text-[8.5px] tracking-wider rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase">
                        {idioma === 'EN' ? 'LEVEL' : 'NÍVEL'} {listaUnidades[0]?.level || 'A1'}
                      </span>
                    </div>
                    <h2 className="font-black text-2xl xl:text-3xl text-slate-100 tracking-tight leading-tight mt-0.5">{nomeModulo}</h2>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                  <div onClick={handleBotClick} className="flex items-center gap-2 xl:gap-3 cursor-pointer select-none active:scale-98" title="Clique para falar com o Co-Pilot">
                    <div className="relative bg-slate-900 text-[#fbbf24] font-mono text-[10px] font-bold p-4 xl:p-4.5 rounded-2xl border border-[#fbbf24]/30 shadow-lg max-w-[160px] xs:max-w-[200px] xl:max-w-[240px] leading-relaxed animate-fade-in">
                      {obterConselhoIA()}
                      <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900"></div>
                    </div>
                    <MascoteRoboAI devePiscar={isBotWinking} idioma={idioma} olharDireta={olharDiretaDesk} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 xl:gap-4 mt-4 bg-[#040e1b] p-3 rounded-xl border border-white/5 text-white/90 font-mono text-[9px] xl:text-[10px] font-black shadow-inner shrink-0">
                <div className="flex items-center gap-1.5 text-slate-200"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block shrink-0" /> <span className="truncate">{({ EN: "ACTIVE SCORE", ES: "SCORE ACTIVO", PT: "SCORE ATIVO" }[(idioma || "PT").toUpperCase()] || "SCORE ATIVO")}: +{scoreAtivo} PTS</span></div>
                <div className="flex items-center gap-1.5 text-slate-200"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block shrink-0" /> <span className="truncate">{(t.time || "TEMPO:").split(":")[0].toUpperCase()}: {tempoModulo} MIN</span></div>
                <div className="flex items-center gap-1.5 text-white"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block shrink-0" /> <span className="truncate">{({ PT: "NÍVEL", ES: "NIVEL", EN: "LEVEL" }[(idioma || "PT").toUpperCase()] || "NÍVEL")}: {(() => { const d = { "Explorador": { PT: "EXPLORADOR", ES: "EXPLORADOR", EN: "EXPLORER" }, "Pioneiro": { PT: "PIONEIRO", ES: "PIONERO", EN: "PIONEER" }, "Conquistador": { PT: "CONQUISTADOR", ES: "CONQUISTADOR", EN: "CONQUEROR" }, "Estrategista": { PT: "ESTRATEGISTA", ES: "ESTRATEGA", EN: "STRATEGIST" }, "Embaixador": { PT: "EMBAIXADOR", ES: "EMBAJADOR", EN: "AMBASSADOR" } }; return (d[patenteBruta] ? (d[patenteBruta][(idioma || "PT").toUpperCase()] || patenteBruta) : patenteBruta).toUpperCase(); })()}</span></div>
              </div>

              <div className="mt-5 mb-2 w-full flex flex-col gap-2 select-none xl:flex-1 min-h-0">


                <div className="flex flex-col xl:flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-1 text-[12.5px] xl:text-[13.5px] mt-1">
                  <div className="flex flex-col font-sans font-medium text-slate-300 divide-y divide-white/[0.04]">
                    {(listaUnidades.length > 0 ? listaUnidades : [
                      { unit_title: 'O Primeiro Impacto e as Vogais Fracas' },
                      { unit_title: 'Identidade e os Sons' },
                      { unit_title: 'De Onde Você É? O Labirinto do R e do J' },
                      { unit_title: 'Educação e Sobrevivência' },
                      { unit_title: 'Despedidas Corporativas/Sociais e as Nasais' }
                    ]).map((unit, idx) => {
                      const currentTitle = unit.unit_title;
                      const currentId = unit.id || null;
                      
                      return (
                        <div 
                          key={idx} 
                          onClick={() => { 
                            setArenaModo({ tipo: 'unidade', idx: currentId || idx }); 
                            setIsArenaOpen(true); 
                          }} 
                          className="group h-[38px] flex items-center justify-between cursor-pointer transition-all duration-150 select-none hover:bg-white/[0.015] px-2 rounded-lg"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <span className="font-mono text-[9px] text-amber-500/80 font-black bg-amber-500/10 px-2 py-0.5 rounded tracking-wider shrink-0">0{idx + 1}</span>
                            <span className="group-hover:text-amber-400 group-hover:translate-x-1 transition-transform duration-150 tracking-wide font-medium text-white/90 whitespace-nowrap">
                              {currentTitle}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-150 group-hover:text-amber-400">
                              {idioma === 'ES' ? 'Acceder a la Arena' : idioma === 'EN' ? 'Access Arena' : 'Acessar Arena'}
                            </span>
                            <span className="text-slate-600 group-hover:text-amber-400 transition-colors duration-150 font-sans text-sm font-light">➔</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full mt-auto shrink-0 pt-4">
              <button 
                onClick={() => { setArenaModo({ tipo: null, idx: null }); setIsArenaOpen(true); }} 
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono font-black py-4 rounded-2xl text-base uppercase tracking-[0.25em] border border-white/10 shadow-lg hover:shadow-[0_0_25px_rgba(237,108,2,0.25)] active:scale-[0.99] transition-all duration-300 cursor-pointer text-center"
              >
                {t.trainBtn}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full shrink-0 xl:h-[110px]">
            <div className="w-full border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15),inset_0_0_15px_rgba(245,158,11,0.08)] rounded-[24px] p-4 flex flex-col justify-between min-h-[95px] sm:h-full select-none relative overflow-hidden text-white" style={{ background: "radial-gradient(circle at 5% 50%, rgba(217,119,6,0.22) 0%, transparent 55%), radial-gradient(circle at 95% 50%, rgba(217,119,6,0.18) 0%, transparent 50%), #0d1520" }}>
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest font-mono">{t.streakTitle}</span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-3"><span className="text-2xl xl:text-3xl font-black text-white tracking-wide font-sans">{streakDays} {idioma === 'PT' ? 'DIAS' : idioma === 'ES' ? 'DÍAS' : 'DAYS'}</span><Flame size={26} className="text-amber-500 shrink-0 stroke-[1.5]" /></div>
                <span className="text-[9px] font-black text-slate-400 font-mono uppercase tracking-wider text-left block">{t.streakSub}</span>
              </div>
            </div>

            <div className="p-4 rounded-[24px] border border-white/5 bg-[#061324] flex flex-col justify-between min-h-[95px] sm:h-full">
              <span className="text-[9px] font-black uppercase text-amber-500 font-mono tracking-wider">{({ PT: "PROGRESSO DA UNIDADE", ES: "PROGRESO DE LA UNIDAD", EN: "UNIT PROGRESS" }[(idioma || "PT").toUpperCase()] || "PROGRESSO DA UNIDADE")}</span>
              <div className="space-y-1.5">
                <span className="text-xl xl:text-2xl font-black text-white tracking-tight font-mono">{scoreAtivo} <span className="text-[11px] font-bold text-slate-400">/ {xpTotalUnidade} PTS</span></span>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-[1px]"><div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${Math.min(Math.round((Number(xpAtual) / Number(xpTotal)) * 100), 100)}%` }} /></div>
              </div>
            </div>

            <div className="p-4 rounded-[24px] border border-white/5 bg-[#061324] flex flex-col justify-between min-h-[95px] sm:h-full">
              <span className="text-[9px] font-black uppercase text-amber-500 font-mono tracking-wider">{t.nextReward}</span>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black text-slate-200 font-sans"><span className="text-white font-bold">{({ PT: "NÍVEL", ES: "NIVEL", EN: "LEVEL" }[(idioma || "PT").toUpperCase()] || "NÍVEL")} {(() => {
                    const dic = {
                      "Explorador": { PT: "EXPLORADOR", ES: "EXPLORADOR", EN: "EXPLORER" },
                      "Pioneiro": { PT: "PIONEIRO", ES: "PIONERO", EN: "PIONEER" },
                      "Conquistador": { PT: "CONQUISTADOR", ES: "CONQUISTADOR", EN: "CONQUEROR" },
                      "Estrategista": { PT: "ESTRATEGISTA", ES: "ESTRATEGA", EN: "STRATEGIST" },
                      "Embaixador": { PT: "EMBAIXADOR", ES: "EMBAJADOR", EN: "AMBASSADOR" }
                    };
                    return (dic[patenteBruta] ? (dic[patenteBruta][(idioma || "PT").toUpperCase()] || patenteBruta) : patenteBruta).toUpperCase();
                  })()}</span><span className="text-amber-500 font-mono font-bold">-{Math.max(0, Number(xpTotal) - Number(xpAtual))} PTS</span></div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-[1px]"><div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${Math.min(Math.round((scoreAtivo / xpTotalUnidade) * 100), 100)}%` }} /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-auto bg-[#061324] pt-5 pb-5 px-5 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.015)] flex flex-col justify-between xl:h-full border border-white/5 relative min-h-[580px] xl:min-h-0 overflow-hidden shrink-0">
          <div className="w-full flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">{t.radarTitle}</span>
            <div className="w-full h-[165px] shrink-0 bg-[#04101e] rounded-2xl flex items-center justify-center overflow-hidden p-1 border border-white/5 shadow-inner">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="54%" outerRadius="75%" data={dadosRadar} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <defs>
                      <linearGradient id="radarPremiumGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#d97706" stopOpacity="0.02"/>
                      </linearGradient>
                    </defs>
                    <PolarGrid stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                    <PolarAngleAxis dataKey="competenca" tick={{ fill: "#94A3B8", fontSize: 9, fontWeight: "800", letterSpacing: "0.03em" }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    <Radar 
                      name="Proficiência" 
                      dataKey="nota" 
                      stroke="#f59e0b" 
                      strokeWidth={1.5}
                      strokeOpacity={0.5}
                      fill="url(#radarPremiumGlow)" 
                      fillOpacity={0.12} 
                      className="transition-all duration-300"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : <div className="text-[10px] font-mono text-slate-400 animate-pulse">Sync...</div>}
            </div>

            {(() => {
              const lista = [
                { id: "habla", pt: "Fala", es: "Habla", en: "Speaking", nota: cHabla },
                { id: "escucha", pt: "Escuta", es: "Escucha", en: "Listening", nota: cEscucha },
                { id: "gramatica", pt: "Gramática", es: "Gramática", en: "Grammar", nota: cGramatica },
                { id: "escritura", pt: "Escrita", es: "Escritura", en: "Writing", nota: cEscritura },
                { id: "lectura", pt: "Leitura", es: "Lectura", en: "Reading", nota: cLectura }
              ].sort((a, b) => b.nota - a.nota);

              const top1 = lista[0];
              const top2 = lista[1];
              const bottom = lista[4];

              const tLabel = (item: any) => idioma === "PT" ? item.pt : idioma === "ES" ? item.es : item.en;

              return (
                <div className="grid grid-cols-3 gap-1.5 text-[7.2px] font-black uppercase font-mono mt-0.5 text-center shrink-0">
                  <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 py-1 rounded-lg flex items-center justify-center gap-1">
                    <TrendingUp size={9}/> {tLabel(top1)} +{top1.nota}%
                  </span>
                  <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 py-1 rounded-lg flex items-center justify-center gap-1">
                    <TrendingUp size={9}/> {tLabel(top2)} +{top2.nota}%
                  </span>
                  <span className="bg-rose-950/40 text-rose-400 border border-rose-500/10 py-1 rounded-lg flex items-center justify-center gap-1">
                    <AlertTriangle size={9}/> {idioma === "PT" ? "Prática de" : idioma === "ES" ? "Prática de" : "Practice"} {tLabel(bottom)}
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="w-full flex flex-col gap-1 shrink-0 relative z-20 mt-2">
            <div 
              onClick={() => setIsLigaOpen(!isLigaOpen)}
              className="flex flex-row justify-between items-center bg-[#04101e] hover:bg-[#07172b] p-2.5 rounded-xl border border-white/5 cursor-pointer select-none transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 font-mono uppercase tracking-wider group-hover:text-slate-200 transition-colors">{t.leaderboard}</span>
                <ChevronDown size={12} className={`text-slate-500 transition-transform duration-300 ${isLigaOpen ? 'rotate-180 text-amber-500' : ''}`} />
              </div>
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/50 text-[#f59e0b] px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm tracking-wide flex items-center">
                <span>{nicknameAluno}</span>
              </div>
            </div>

            <div className={`absolute top-full left-0 right-0 z-[999999] mt-1 overflow-visible transition-all duration-200 ease-in-out bg-[#04101e] border border-white/10 rounded-xl flex flex-col gap-1 shadow-[0_20px_40px_rgba(0,0,0,0.8)] ${isLigaOpen ? 'max-h-[180px] p-2 opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none border-transparent'}`}>
              <div className="w-full flex justify-between px-2 text-[8px] font-mono font-black text-slate-500 uppercase tracking-wider select-none border-b border-white/5 pb-1">
                <span>{idioma === "PT" ? "RANK & USUÁRIO" : idioma === "ES" ? "PUESTO & USUARIO" : "RANK & USER"}</span>
                <span>{(t as any).rankPts || "PTS"}</span>
              </div>
              <div className="w-full flex flex-col gap-1 overflow-y-auto max-h-[120px] pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                {topTen.map((user, index) => {
                  const rank = index + 1;
                  const ptsFormatados = (user.total_xp || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                  return (
                    <div key={user.id} className={`flex items-center justify-between px-2 py-0.5 rounded-lg text-[10px] font-sans ${rank === 1 ? 'bg-gradient-to-r from-amber-500/20 to-yellow-600/10 border border-amber-500/30 text-amber-400 font-bold' : 'bg-slate-900/40 text-slate-300'}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] font-black w-4 text-center">{rank}</span>
                        <span className="truncate">{user.nickname || "Aluno Anônimo"}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{ptsFormatados} PTS</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2 font-sans shrink-0 mt-2">
            <button className="flex-1 bg-[#1c2735] hover:bg-[#253346] text-white font-mono text-[9px] font-black py-2.5 rounded-xl uppercase border border-amber-500/40 tracking-wider" onClick={() => setIsFeedbackOpen(true)}>{t.evalBtn}</button>
            <button className="flex-1 bg-[#1c2735] hover:bg-[#253346] text-white font-mono text-[9px] font-black py-2.5 rounded-xl uppercase border border-amber-500/40 tracking-wider" onClick={() => setIsEntregaOpen(true)}>{t.submitBtn}</button>
            <button className="flex-1 bg-[#1c2735] hover:bg-[#253346] text-white font-mono text-[9px] font-black py-2.5 rounded-xl uppercase border border-amber-500/40 tracking-wider" onClick={() => setIsAgendaOpen(true)}>{t.calBtn}</button>
          </div>

          <div className="border-t border-white/5 pt-2 flex flex-col gap-1.5 shrink-0 mt-2">
            <span className="text-[9px] font-black text-[#f59e0b] font-mono uppercase tracking-wider">{t.chestTitle}</span>
            <div className="flex justify-between items-center text-[10px] font-mono font-bold bg-[#09192f] py-1.5 px-3 rounded-xl text-white/90 border border-white/5">
              {(() => {
                const peso = { "Alto": 3, "Módulo": 2, "Médio": 2, "Baixo": 1 };
                const ordenados = [...errorLogs].sort((a, b) => {
                  const pesoA = peso[a.frequencia] || 0;
                  const pesoB = peso[b.frequencia] || 0;
                  return pesoB - pesoA;
                });
                
                const erro1 = ordenados[0] ? `${ordenados[0].conteudo} (${ordenados[0].frequencia})` : (idioma === "PT" ? "Nenhum Erro" : idioma === "ES" ? "Sin Errores" : "No Errors");
                const erro2 = ordenados[1] ? `${ordenados[1].conteudo} (${ordenados[1].frequencia})` : "---";
                
                return (
                  <>
                    <span className="truncate max-w-[45%]">{erro1}</span>
                    <span className="opacity-20">•</span>
                    <span className="truncate max-w-[45%]">{erro2}</span>
                  </>
                );
              })()}
            </div>
            <button onClick={() => setIsDepurarOpen(true)} className="w-full bg-[#04101e] hover:bg-[#0c2545] text-white font-mono text-[9px] font-black py-2 uppercase tracking-widest rounded-xl border border-amber-500/60 shadow-sm transition-all">
              <span className="text-[#f59e0b]">{t.clearBtn}</span>
            </button>
          </div>

          <div className="w-full flex flex-col shrink-0 mt-2">
            <button 
              onClick={() => window.open("https://meet.google.com/mnk-jcqh-yuz?authuser=1", "_blank")}
              className="w-full py-3 bg-transparent hover:bg-orange-500/5 border border-orange-500/40 text-orange-400 font-mono font-black text-[11px] uppercase tracking-[0.2em] rounded-xl active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-orange-400 shrink-0"><path d="M8 5v14l11-7z"/></svg>
              {idioma === "PT" ? "Entrar na Aula" : idioma === "ES" ? "Entrar a la Clase" : "Enter Class"}
            </button>
          </div>
        </div>

      </div>

      <PremiumStyle />
            <ArenaQuiz 
        key={arenaModo?.tipo === 'unidade' ? String(arenaModo.idx) : 'arena-fechada'}
        isOpen={isArenaOpen} 
        onClose={() => { setIsArenaOpen(false); setArenaModo(null); }} 
        userId={userIdBanco} 
        idiomaAtivo={idioma}
        subUnidadeIndex={arenaModo?.tipo === 'unidade' ? arenaModo.idx : 0} 
        onAbrirPedagogo={(tipo) => setModalPedagogoPage({ aberto: true, tipo })} 
      />

      {/* 🚀 MODAL COM BACKDROP BLUR GLOBAL DA VIEWPORT */}
      {modalPedagogoPage.aberto && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setModalPedagogoPage({ aberto: false, tipo: null }); }} 
          className="fixed inset-0 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4"
          style={{ zIndex: 9999999 }}
        >
          <div className="bg-[#162235] border border-[#48627D]/40 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl text-left cursor-default">
            <button 
              onClick={() => setModalPedagogoPage({ aberto: false, tipo: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#1D2D44] p-1.5 rounded-full border border-white/5 cursor-pointer"
            >
              <X size={14} />
            </button>
            
            {modalPedagogoPage.tipo === 'VIDEO' ? (
              <div className="w-full flex flex-col gap-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Media & Practice Content
                </h3>
                <div className="w-full aspect-video bg-[#0B1528] rounded-xl border border-white/5 flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
                  [ PLAYER DE VÍDEO HAAS ]
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3">
                <span className="text-[10px] font-black text-[#FF8A2B] tracking-widest uppercase flex items-center gap-1.5">
                  CONTEÚDO ESCRITO DE FIXAÇÃO
                </span>
                <h3 className="text-base font-bold text-white">A Regra dos Clusters de Réplica</h3>
                <p className="text-xs text-slate-300 leading-relaxed select-text bg-[#0B1528]/50 p-3 rounded-xl border border-white/[0.02]">
                  Em arquiteturas de banco de dados, as alterações de esquema estrutural (schema migrations) devem ser executadas com validações prévias nos clusters secundários (réplicas) antes de impactarem a tabela master de produção.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <ModalAvaliacaoFidelidade isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} idioma={idioma} />
      <ModalEntregaAtividade isOpen={isEntregaOpen} onClose={() => setIsEntregaOpen(false)} idioma={idioma} entregas={listaEntregas} />
      <ModalAgendaAluno 
        isOpen={isAgendaOpen} 
        onClose={() => setIsAgendaOpen(false)} 
        idioma={idioma} 
        userId={userIdBanco} 
      />

      {/* 🔍 MODAL DE DEPURAÇÃO DE LOGS COMPLETO */}
      {isDepurarOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center animate-fadeIn">
          <div onClick={() => setIsDepurarOpen(false)} className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#040c16] border border-amber-500/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[80vh] z-10 text-white font-sans">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-black uppercase font-mono tracking-wider text-[#f59e0b]">
                {idioma === "PT" ? "Depuração de Logs" : idioma === "ES" ? "Depuración de Logs" : "Logs Debugger"}
              </h3>
              <button onClick={() => setIsDepurarOpen(false)} className="text-slate-400 hover:text-white font-black font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded-md transition-colors">X</button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
              {(() => {
                const peso = { "Alto": 3, "Módulo": 2, "Médio": 2, "Baixo": 1 };
                const ordenados = [...errorLogs].sort((a, b) => (peso[b.frequencia] || 0) - (peso[a.frequencia] || 0));

                if (ordenados.length === 0) {
                  return <p className="text-[10px] font-mono text-slate-400 py-4 text-center">{idioma === "PT" ? "Nenhum log de erro registrado." : idioma === "ES" ? "No hay logs de errores registrados." : "No error logs registered."}</p>;
                }

                return ordenados.map((item: any, idx: number) => {
                  const isCritico = item.frequencia === "Alto";
                  return (
                    <div key={item.id || idx} className="flex justify-between items-center bg-[#09192f] p-2.5 rounded-xl border border-white/5 text-[10px] font-mono font-bold">
                      <span className="text-white/90 truncate max-w-[70%]">{item.conteudo}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wide ${
                        isCritico ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {item.frequencia}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 🗂️ GAVETA LUXO PERFIL 100% COMPLETA, COM IDIOMAS E BOTÃO DE PAGAMENTO */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 flex justify-start ${isPerfilOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'}`}>
        <div onClick={() => setIsPerfilOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
        <div className={`relative w-[340px] h-screen max-h-screen bg-[#040c16] border-r border-white/5 py-4 px-5 flex flex-col justify-between gap-[1.5vh] shadow-2xl transition-transform duration-300 overflow-y-hidden ${isPerfilOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          <div className="flex justify-between items-center border-b border-white/5 pb-2 shrink-0">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[9px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{idioma === 'PT' ? 'Painel de Controle' : idioma === 'ES' ? 'Panel de Control' : 'Control Panel'}</span>
            </div>
            <button onClick={() => setIsPerfilOpen(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
          </div>

          <div className="flex flex-col gap-2 bg-[#071324]/60 p-2.5 rounded-2xl border border-white/[0.03] w-full min-h-0">
            <div className="flex items-center gap-3.5">
              <div className="relative w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center font-mono font-black text-amber-500 text-base select-none">AL<div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#040c16]"></div></div>
              <div className="flex flex-col">
              <span className="text-white font-black text-sm tracking-wide">{aluno1}</span>
              <div className="flex justify-between items-center gap-2 text-[9px] font-mono font-black text-amber-500 uppercase tracking-widest mt-0.5 w-full min-w-0">
                <span>
                  {idioma === 'PT' ? `Nível Atual: ${nivelAtual}` : idioma === 'ES' ? `Nivel Actual: ${nivelAtual}` : `Current Level: ${nivelAtual}`}
                </span>
                
                <div></div>
              </div>
              <div className="mt-1 flex gap-1 flex-wrap">
                {(() => {
                  const tipoCurso = tipoAluno; 
                  let textoBadge = '';
                  if (tipoCurso === 'particular') { textoBadge = idioma === 'PT' ? 'Particular' : idioma === 'ES' ? 'Particular' : 'Private'; }
                  else if (tipoCurso === 'grupo') { textoBadge = idioma === 'PT' ? 'Em Grupo' : idioma === 'ES' ? 'En Grupo' : 'Group Class'; }
                  else if (tipoCurso === 'corporativo') { textoBadge = idioma === 'PT' ? 'Corporativo' : idioma === 'ES' ? 'Corporativo' : 'Corporate'; }
                  else if (tipoCurso === 'particular_corporativo') { textoBadge = idioma === 'PT' ? 'Particular Corporativo' : idioma === 'ES' ? 'Particular Corporativo' : 'Private Corporate'; }
                  else { textoBadge = idioma === 'PT' ? 'Regular' : idioma === 'ES' ? 'Regular' : 'Regular'; }
                  return (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[#00E5FF] font-mono text-[8px] font-black uppercase tracking-wider shadow-sm">
                      {textoBadge}
                    </span>
                  );
                })()}
              </div>
            </div>
            </div>
            <div className="flex flex-col gap-1.5 border-t border-white/[0.04] pt-2.5 relative">
              <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-wider">{idioma === 'PT' ? 'CENTRO DE CERTIFICAÇÕES' : idioma === 'ES' ? 'CENTRO DE CERTIFICACIÓN' : 'CERTIFICATION CENTER'}</span>
              <div className="absolute top-2 right-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded cursor-pointer transition-all" onClick={() => setIsBadgesOpen(true)}>{idioma === 'PT' ? 'Ver Detalhes' : idioma === 'ES' ? 'Ver Todo' : 'View All'}</div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-slate-900/80 border border-white/5 py-1.5 px-1 rounded-lg text-[9px] font-mono font-bold text-slate-300"><Target size={11} className="text-amber-500 inline-block mr-1" /> {idioma === 'PT' ? 'Coesão' : idioma === 'ES' ? 'Cohesión' : 'Cohesion'}</div>
                <div className="bg-slate-900/80 border border-white/5 py-1.5 px-1 rounded-lg text-[9px] font-mono font-bold text-slate-300"><Flame size={11} className="text-orange-500 inline-block mr-1" /> {idioma === 'PT' ? '12 Dias' : idioma === 'ES' ? '12 Días' : '12 Days'}</div>
                <div className="bg-slate-900/80 border border-white/5 py-1.5 px-1 rounded-lg text-[9px] font-mono font-bold text-slate-300"><Shield size={11} className="text-sky-400 inline-block mr-1" /> {idioma === 'PT' ? 'Auditorias' : idioma === 'ES' ? 'Auditorías' : 'Audits'}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh] w-full min-h-0 flex-grow justify-between py-[1vh]">
            <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-wider">{idioma === 'PT' ? 'DIAGNÓSTICO GERAL' : idioma === 'ES' ? 'DIAGNÓSTICO GENERAL' : 'GENERAL DIAGNOSTIC'}</span>
            <div className="bg-[#071324] border border-white/[0.02] py-[1vh] px-3 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">{precisaoClinica}%</div>
                <div className="flex flex-col"><span className="text-[11px] text-slate-200 font-bold">{idioma === 'PT' ? 'Eficiência Clínica' : idioma === 'ES' ? 'Precisión Clínica' : 'Clinical Accuracy'}</span><span className="text-[9px] text-slate-500 font-medium">{idioma === 'PT' ? 'Precisão Geral' : idioma === 'ES' ? 'Precisión General' : 'Overall Precision'}</span></div>
              </div>
            </div>
            
            <div className="bg-[#071324] border border-white/[0.02] py-[1vh] px-3 rounded-xl flex flex-col gap-1.5 shadow-sm">
              <div className="flex justify-between items-center"><span className="text-[10px] text-slate-400 font-bold">{idioma === 'PT' ? 'Consistência Semanal' : idioma === 'ES' ? 'Consistencia Semanal' : 'Weekly Consistency'}</span><span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{streakDays}d</span></div>
              <div className="grid grid-cols-7 gap-1.5 bg-slate-950/40 p-2 rounded-xl border border-white/[0.02]">
                {consistenciaSemanal.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className={`w-full aspect-square rounded border transition-all duration-300 ${item.treinou ? 'bg-amber-500 border-amber-400/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : 'bg-slate-900 border-white/5 opacity-40'}`} />
                    <span className="text-[7.5px] font-mono font-black text-slate-500 uppercase">{idioma === "EN" ? ["M","T","W","T","F","S","S"][idx] : idioma === "ES" ? ["L","M","X","J","V","S","D"][idx] : ["S","T","Q","Q","S","S","D"][idx]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GRID DOS 4 CARDS RESTAURADOS COM ACESSO DIRETO AO PAGAMENTO */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="bg-[#071324] border border-white/[0.02] py-2 px-2 rounded-xl text-center flex flex-col justify-center items-center">
                <span className="text-[14px] font-mono font-black text-sky-400 block leading-none">{imersaoTotal}</span>
                <span className="font-sans text-[8px] font-bold tracking-tight text-slate-400 block uppercase mt-1">{idioma === 'PT' ? 'Horas de Imersão' : idioma === 'ES' ? 'Horas de Inmersión' : 'Immersion Hours'}</span>
              </div>
              <div className="bg-[#071324] border border-white/[0.02] py-2 px-2 rounded-xl text-center flex flex-col justify-center items-center">
                <span className="text-[14px] font-mono font-black text-indigo-400 block leading-none">{vocabularioAtivo}</span>
                <span className="font-sans text-[8px] font-bold tracking-tight text-slate-400 block uppercase mt-1">{idioma === 'PT' ? 'Dias Ativos' : idioma === 'ES' ? 'Días Activos' : 'Active Days'}</span>
              </div>
              <div className="bg-[#071324] border border-white/[0.02] py-2 px-2 rounded-xl text-center flex flex-col justify-center items-center">
                <span className="text-[11px] font-mono font-bold text-emerald-400 block leading-none">{proximoVencimento}</span>
                <span className="font-sans text-[7.5px] font-bold tracking-tight text-slate-500 block uppercase mt-1">{idioma === 'PT' ? 'Próximo Vencimento' : idioma === 'ES' ? 'Próximo Vencimiento' : 'Next Due Date'}</span>
              </div>
              
              {/* Card de Pagamento Premium Reativo */}
              <div onClick={() => (window as any).setIsPagamentoOpen ? (window as any).setIsPagamentoOpen(true) : alert('System Loading...')} className="bg-gradient-to-br from-amber-600/20 via-amber-500/10 to-transparent border border-amber-500/40 hover:border-amber-400 py-3 px-2 rounded-xl text-center flex flex-col justify-center items-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_12px_rgba(245,158,11,0.05)] group" title="Clique para abrir">
                <span className="font-sans text-[9px] font-black tracking-wider text-amber-500/90 block uppercase animate-pulse">{idioma === 'PT' ? '⚡ PLANOS E CRÉDITOS' : idioma === 'ES' ? '⚡ PLANES Y CRÉDITOS' : '⚡ PLANS & CREDITS'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-[1.5vh] w-full flex flex-col gap-2 shrink-0">
            <button 
              onClick={() => window.open("https://api.whatsapp.com/send/?phone=573239421071&text=Hello%21+I%27m+interested+in+learning+more+about+Escuela+Haas.&type=phone_number&app_absent=0", "_blank")}
              className="w-full py-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 flex items-center justify-between text-emerald-400 font-mono font-bold text-[10px] md:text-xs cursor-pointer transition-colors min-h-[38px]"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="uppercase tracking-wider font-black">
                  {idioma === "PT" ? "Atendimento ao Cliente" : idioma === "ES" ? "Atención al Cliente" : "Customer Service"}
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-black">
                {idioma === "PT" ? "CONTATO" : idioma === "ES" ? "CONTACTO" : "CONTACT"}
              </span>
            </button>
            <button onClick={() => { if(confirm(idioma === 'PT' ? 'Deseja realmente sair da conta?' : idioma === 'ES' ? '¿Realmente deseja salir de la cuenta?' : 'Are you sure you want to log out?')) { window.location.href = '/'; } }} className="w-full bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-mono text-[9px] font-black py-2.5 uppercase tracking-widest rounded-xl border border-red-500/10 text-center transition-all">{idioma === 'PT' ? 'Sair da Conta' : idioma === 'ES' ? 'Cerrar Sesión' : 'Log Out'}</button>
          </div>

        </div>
        <GavetaBadges isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} idioma={idioma} />
      </div>

      {/* 🎯 MODAL PROGRAMA TOTALMENTE RESTAURADO E MULTILÍNGUE */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 flex items-center justify-center p-4 ${isTrilhaOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'}`}>
        <div onClick={() => setIsTrilhaOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
        <div className="relative w-full max-w-3xl h-[75vh] bg-[#030914] border border-white/[0.06] rounded-[24px] p-6 flex flex-col gap-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {idioma === 'PT' ? 'MÓDULOS DO PROGRAMA' : idioma === 'ES' ? 'MÓDULOS DEL PROGRAMA' : 'PROGRAM MODULES'}
            </h2>
            <button onClick={() => setIsTrilhaOpen(false)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-black font-mono border-none cursor-pointer">
              {idioma === 'PT' ? 'FECHAR' : idioma === 'ES' ? 'CERRAR' : 'CLOSE'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <ProgramaTrilha idiomaAtivo={idioma} aoAbrirArena={() => { setIsArenaOpen(true); setIsTrilhaOpen(false); }} />
          </div>
        </div>
      </div>

      {/* 💳 NOVO QUADRINHO PREMIUM DE PAGAMENTO RECONECTADO */}
      <QuadrinhoPagamentoInteligente idioma={idioma} />
    </div>
  );
}

function QuadrinhoPagamentoInteligente({ idioma }) {
  const [isOpen, setIsOpen] = React.useState(false);
  (window as any).setIsPagamentoOpen = setIsOpen;

  // Escucha nativa global conectada directamente a los estados del Padre
  React.useEffect(() => {
    const dispararCentralHAAS = () => {
      setIsOpen(true);
      setPasso(1);
      setModalidade(null);
    };
    window.addEventListener('HAAS_ABRIR_MATRICULAS', dispararCentralHAAS);
    return () => window.removeEventListener('HAAS_ABRIR_MATRICULAS', dispararCentralHAAS);
  }, []);
  const [passo, setPasso] = React.useState(1); // 1 = Seleção, 2 = Checkout
  
  // Estados de Compra
  const [modalidade, setModalidade] = React.useState(null); // 'grupo', 'vip_std', 'vip_pro', 'avulsa'
  const [creditosMensais, setCreditosMensais] = React.useState(null); // 8, 12, 20
  const [qtdAvulsas, setQtdAvulsas] = React.useState(0);
  const [masterPlans, setMasterPlans] = React.useState([]);

  React.useEffect(() => {
    if (!isOpen) return;
    const carregarBanco = async () => {
      const { data } = await supabase.from("master_plans").select("*");
      if (data) setMasterPlans(data);
    };
    carregarBanco();
  }, [isOpen]);

  useEffect(() => {
    
    return () => { /* mantem a funcao viva na memoria global */ };
  }, []);

  if (!isOpen) return null;

  // Lógica da Tabela Única Regressiva para Aulas em Grupo / Avulsas
  const calcularPrecoGrupo = (aulas) => {
    if (aulas >= 20) return 650000;
    if (aulas >= 12) return 420000;
    if (aulas >= 8) return 300000;
    if (aulas >= 5) return 180000;
    if (aulas >= 1) return aulas * 40000;
    return 0;
  };

  // Calcular valor total selecionado
  let valorTotal = 0;
  let descricaoItem = "";

  if (modalidade === "grupo" && creditosMensais) {
    // Procura o registro correspondente na coluna plan_category
    const planoGrupo = masterPlans.find(p => p.plan_category === "Group");
    
    // Pega o objeto JSON puro da coluna pricing_matrix
    const matriz = planoGrupo ? (typeof planoGrupo.pricing_matrix === "string" ? JSON.parse(planoGrupo.pricing_matrix) : planoGrupo.pricing_matrix) : {};
    
    // Atribui o valor total lido da chave correspondente (8, 12, 20) de dentro da matriz do banco
    valorTotal = matriz[String(creditosMensais)] || 0;
    
    if (creditosMensais === 8) { descricaoItem = idioma === "PT" ? "Plano Coletivo: 8 Créditos Mensais" : idioma === "EN" ? "Group Plan: 8 Monthly Credits" : "Plan Colectivo: 8 Créditos Mensuales"; }
    if (creditosMensais === 12) { descricaoItem = idioma === "PT" ? "Plano Coletivo: 12 Créditos Mensais" : idioma === "EN" ? "Group Plan: 12 Monthly Credits" : "Plan Colectivo: 12 Créditos Mensuales"; }
    if (creditosMensais === 20) { descricaoItem = idioma === "PT" ? "Plano Coletivo: 20 Créditos Mensais (Imersão)" : idioma === "EN" ? "Group Plan: 20 Monthly Credits (Immersion)" : "Plan Colectivo: 20 Créditos Mensuales (Inmersión)"; }
  } else if (modalidade === "vip_std" && creditosMensais) {
    if (creditosMensais === 8) { valorTotal = 400000; descricaoItem = idioma === "PT" ? "VIP Standard: 8 Aulas Mensais" : idioma === "EN" ? "VIP Standard: 8 Monthly Classes" : "VIP Standard: 8 Clases Mensuales"; }
    if (creditosMensais === 12) { valorTotal = 540000; descricaoItem = idioma === "PT" ? "VIP Standard: 12 Aulas Mensais" : idioma === "EN" ? "VIP Standard: 12 Monthly Classes" : "VIP Standard: 12 Clases Mensuales"; }
    if (creditosMensais === 20) { valorTotal = 800000; descricaoItem = idioma === "PT" ? "VIP Standard: 20 Aulas Mensais" : idioma === "EN" ? "VIP Standard: 20 Monthly Classes" : "VIP Standard: 20 Clases Mensuales"; }
  } else if (modalidade === "vip_pro" && creditosMensais) {
    if (creditosMensais === 8) { valorTotal = 560000; descricaoItem = idioma === "PT" ? "VIP Pro Corporativo: 8 Aulas Mensais" : idioma === "EN" ? "VIP Pro Corporativo: 8 Monthly Classes" : "VIP Pro Corporativo: 8 Clases Mensuales"; }
    if (creditosMensais === 12) { valorTotal = 780000; descricaoItem = idioma === "PT" ? "VIP Pro Corporativo: 12 Aulas Mensais" : idioma === "EN" ? "VIP Pro Corporativo: 12 Monthly Classes" : "VIP Pro Corporativo: 12 Clases Mensuales"; }
    if (creditosMensais === 20) { valorTotal = 1200000; descricaoItem = idioma === "PT" ? "VIP Pro Corporativo: 20 Aulas Mensais" : idioma === "EN" ? "VIP Pro Corporativo: 20 Monthly Classes" : "VIP Pro Corporativo: 20 Clases Mensuales"; }
  } else if (modalidade === "avulsa") {
    // Tabela Flex / Corporativa - Inicia em 75k e rebate nos marcos de 8 (560k), 12 (780k) e 20 (1.2M)
    const tabelaFlex = { 1: 75000, 2: 145000, 3: 215000, 4: 285000, 5: 355000, 6: 425000, 7: 495000, 8: 560000, 9: 615000, 10: 670000, 11: 725000, 12: 780000, 13: 835000, 14: 890000, 15: 945000, 16: 1000000, 17: 1055000, 18: 1110000, 19: 1155000, 20: 1200000 };
    valorTotal = tabelaFlex[qtdAvulsas] || (qtdAvulsas * 75000);
    descricaoItem = idioma === "PT" ? `Pack VIP Pro: ${qtdAvulsas} Créditos` : idioma === "EN" ? `VIP Pro Pack: ${qtdAvulsas} Credits` : `Pack VIP Pro: ${qtdAvulsas} Créditos`;
  } else if (modalidade === "acumulador_grupo") {
    const tabela = { 1: 40000, 2: 75000, 3: 110000, 4: 145000, 5: 180000, 6: 220000, 7: 260000, 8: 300000, 9: 330000, 10: 360000, 11: 390000, 12: 420000, 13: 450000, 14: 480000, 15: 510000, 16: 540000, 17: 570000, 18: 600000, 19: 625000, 20: 650000 };
    valorTotal = tabela[qtdAvulsas] || (qtdAvulsas * 40000);
    descricaoItem = idioma === "PT" ? `Pack Acumulativo: ${qtdAvulsas} Aulas em Grupo` : idioma === "EN" ? `Accumulative Pack: ${qtdAvulsas} Group Classes` : `Pack Acumulativo: ${qtdAvulsas} Aulas en Grupo`;
  } else if (modalidade === "acumulador_vip_std") {
    // Tabela VIP Standard - Inicia em 55k e rebate nos marcos de 8 (400k), 12 (540k) e 20 (800k)
    const tabelaStd = { 1: 55000, 2: 105000, 3: 155000, 4: 205000, 5: 255000, 6: 305000, 7: 355000, 8: 400000, 9: 435000, 10: 470000, 11: 505000, 12: 540000, 13: 575000, 14: 610000, 15: 645000, 16: 680000, 17: 715000, 18: 750000, 19: 775000, 20: 800000 };
    valorTotal = tabelaStd[qtdAvulsas] || (qtdAvulsas * 55000);
    descricaoItem = idioma === "PT" ? `Pack VIP Standard Acumulativo: ${qtdAvulsas} Aulas` : idioma === "EN" ? `Accumulative VIP Standard Pack: ${qtdAvulsas} Classes` : `Pack VIP Standard Acumulativo: ${qtdAvulsas} Clases`;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className={`relative w-full transition-all duration-300 bg-[#061324] border border-amber-500/30 rounded-[28px] p-6 flex flex-col gap-4 shadow-2xl overflow-y-auto max-h-[90vh] text-white ${passo === 1 ? "max-w-lg" : "max-w-3xl"}`}>
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <span className="text-[#f59e0b] font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {passo === 1 ? (
              idioma === "PT" ? "CENTRAL DE CRÉDITOS & MATRÍCULAS" : 
              idioma === "EN" ? "CREDITS & ENROLLMENT CENTER" : 
              "CENTRAL DE CRÉDITOS & MATRÍCULAS"
            ) : (
              idioma === "PT" ? "VERIFICAÇÃO DE SEGURANÇA" : 
              idioma === "EN" ? "SECURITY VERIFICATION" : 
              "VERIFICACIÓN DE SEGURIDAD"
            )}
          </span>
          <button onClick={() => { setIsOpen(false); setPasso(1); setModalidade(null); }} className="text-slate-500 hover:text-white">✕</button>
        </div>



        {/* Banner Condicional de Renovación Activa */}
        {typeof window !== "undefined" && (window as any)._simulaMatriculado && !(window as any)._simulaVencido && passo === 1 && (
          <div onClick={() => { setModalidade("grupo"); setCreditosMensais(8); setPasso(2); }} className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-left relative overflow-hidden animate-fadeIn cursor-pointer hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all group" title="Clique para pagar">
            <div className="absolute right-2 top-2 text-xl opacity-20"></div>
            <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">🟢 {idioma === "PT" ? "Seu Plano está Ativo" : idioma === "EN" ? "Your Plan is Active" : "Tu Plan está Activo"}</div>
            <div className="text-[10px] text-slate-300 mt-0.5">{idioma === "PT" ? "Mensalidade Atual: " : idioma === "EN" ? "Current Fee: " : "Mensualidad Actual: "}<span className="text-white font-bold font-mono">$ 300.000 COP</span>. {idioma === "PT" ? "Próxima renovação automática: 05/Próx Mes. Clique aqui para pagar" : idioma === "EN" ? "Next automatic renewal: 05/Next Month. Click here to pay" : "Próxima renovación automática: 05/Próx Mes. Clique aquí para pagar"}</div>
          </div>
        )}

        {/* Banner de Alerta de Vencimiento */}
        {typeof window !== "undefined" && (window as any)._simulaMatriculado && (window as any)._simulaVencido && passo === 1 && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl text-left relative overflow-hidden animate-fadeIn select-none">
            <div className="text-[11px] font-black text-rose-400 uppercase tracking-wider">⚠️ {idioma === "PT" ? "Sua data de renovação expirou" : idioma === "EN" ? "Your renewal date has expired" : "Tu fecha de renovación expiró"}</div>
            <div className="text-[10px] text-rose-300 mt-0.5">
              {idioma === "PT" ? (
                <>Conforme os termos da plataforma, as condições anteriores e descontos de fidelidade foram desativados automaticamente. <strong className="text-white">Selecione um plano abaixo para reativar seu acesso.</strong></>
              ) : idioma === "EN" ? (
                <>In accordance with platform terms, previous conditions and loyalty discounts have been automatically deactivated. <strong className="text-white">Select a new plan below to reactivate your access.</strong></>
              ) : (
                <>Conforme a los términos de la plataforma, las condiciones anteriores y descuentos de fidelidad se han desactivado automáticamente. <strong className="text-white">Selecciona un plan abajo para reactivar tu acceso.</strong></>
              )}
            </div>
          </div>
        )}

        {passo === 1 ? (
          <>
            {/* Opções de Modalidades */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{idioma === "PT" ? "Selecione a Modalidade:" : idioma === "EN" ? "Select the Modality:" : "Seleccione la Modalidad:"}</span>
              
              <div className="grid grid-cols-3 gap-2 mt-1">
                {/* Linha 1: Planos Padrão Fechados */}
                <button onClick={() => { setModalidade("grupo"); setCreditosMensais(8); }} className={`p-2 rounded-xl border text-center transition-all ${modalidade === "grupo" ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-slate-950/40 hover:border-white/10"}`}>
                  <div className="text-[11px] font-bold text-amber-400"><Users className="inline-block w-3.5 h-3.5 mr-1 mb-0.5 text-amber-400" />{idioma === "PT" ? "Grupo" : idioma === "EN" ? "Group" : "Grupo"}</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 leading-tight">
                    {idioma === "PT" ? "30 Dias | IA Ilimitada" : idioma === "EN" ? "30 Days | Unlimited AI" : "30 Días | IA Ilimitada"}
                  </div>
                </button>
                <button onClick={() => { setModalidade("vip_std"); setCreditosMensais(8); }} className={`p-2 rounded-xl border text-center transition-all  Pacote${modalidade === "vip_std" ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-slate-950/40 hover:border-white/10"}`}>
                  <div className="text-[11px] font-bold text-amber-400"><User className="inline-block w-3.5 h-3.5 mr-1 mb-0.5 text-amber-400" />{idioma === "PT" ? "VIP Standard" : idioma === "EN" ? "VIP Standard" : "VIP Standard"}</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 leading-tight">
                    {idioma === "PT" ? "30 Dias | IA Ilimitada" : idioma === "EN" ? "30 Days | Unlimited AI" : "30 Días | IA Ilimitada"}
                  </div>
                </button>
                <button onClick={() => { setModalidade("vip_pro"); setCreditosMensais(8); }} className={`p-2 rounded-xl border text-center transition-all ${modalidade === "vip_pro" ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-slate-950/40 hover:border-white/10"}`}>
                  <div className="text-[11px] font-bold text-amber-400"><Briefcase className="inline-block w-3.5 h-3.5 mr-1 mb-0.5 text-amber-400" />{idioma === "PT" ? "VIP Pro" : idioma === "EN" ? "VIP Pro" : "VIP Pro"}</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 leading-tight">
                    {idioma === "PT" ? "30 Dias | IA Ilimitada" : idioma === "EN" ? "30 Days | Unlimited AI" : "30 Días | IA Ilimitada"}
                  </div>
                </button>

                {/* Linha 2: Aulas Avulsas / Packs Progressivos */}
                <button onClick={() => { setModalidade("acumulador_grupo"); setQtdAvulsas(1); }} className={`p-2 rounded-xl border text-center transition-all ${modalidade === "acumulador_grupo" ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-slate-950/40 hover:border-white/10"}`}>
                  <div className="text-[11px] font-bold text-amber-400"><TrendingUp className="inline-block w-3.5 h-3.5 mr-1 mb-0.5 text-amber-400" />{idioma === "PT" ? "Pack Grupo" : idioma === "EN" ? "Group Pack" : "Pack Grupo"}</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 leading-tight">
                    {idioma === "PT" ? "+7d Acesso | +10 IA /cr" : idioma === "EN" ? "+7d Access | +10 AI /cr" : "+7d Acceso | +10 IA /cr"}
                  </div>
                </button>
                <button onClick={() => { setModalidade("acumulador_vip_std"); setQtdAvulsas(1); }} className={`p-2 rounded-xl border text-center transition-all ${modalidade === "acumulador_vip_std" ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-slate-950/40 hover:border-white/10"}`}>
                  <div className="text-[11px] font-bold text-amber-400"><Box className="inline-block w-3.5 h-3.5 mr-1 mb-0.5 text-amber-400" />{idioma === "PT" ? "Pack VIP Std" : idioma === "EN" ? "VIP Std Pack" : "Pack VIP Std"}</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 leading-tight">
                    {idioma === "PT" ? "+7d Acesso | +25 IA /cr" : idioma === "EN" ? "+7d Access | +25 AI /cr" : "+7d Acceso | +25 IA /cr"}
                  </div>
                </button>
                <button onClick={() => { setModalidade("avulsa"); setQtdAvulsas(1); }} className={`p-2 rounded-xl border text-center transition-all ${modalidade === "avulsa" ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-slate-950/40 hover:border-white/10"}`}>
                  <div className="text-[11px] font-bold text-amber-400"><Ticket className="inline-block w-3.5 h-3.5 mr-1 mb-0.5 text-amber-400" />{idioma === "PT" ? "Pack VIP Pro" : idioma === "EN" ? "VIP Pro Pack" : "Pack VIP Pro"}</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 leading-tight">
                    {idioma === "PT" ? "+7d Acesso | +25 IA /cr" : idioma === "EN" ? "+7d Access | +25 AI /cr" : "+7d Acceso | +25 IA /cr"}
                  </div>
                </button>
              </div>
            </div>
            
            {/* Sub-configurações baseadas na escolha */}
            {["grupo", "vip_std", "vip_pro"].includes(modalidade) && (
              <div className="flex flex-col gap-2 bg-slate-950/30 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 font-bold uppercase">{idioma === "PT" ? "Selecione a Intensidade Mensal:" : idioma === "EN" ? "Select Monthly Intensity:" : "Seleccione la Intensidad Mensual:"}</span>
                <div className="flex gap-2">
                  {[8, 12, 20].map((num) => (
                    <button key={num} onClick={() => setCreditosMensais(num)} className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold border transition-all ${creditosMensais === num ? "bg-amber-500 text-black border-amber-500" : "bg-slate-900 border-white/5 hover:border-white/10"}`}>
                      {num} {idioma === "EN" ? "Credits" : "Créditos"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {modalidade === "avulsa" && (
              <div className="flex flex-col gap-2 bg-slate-950/30 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 font-bold uppercase">{idioma === "PT" ? "Quantidade de Aulas VIP Pro:" : idioma === "EN" ? "Amount of VIP Pro Classes:" : "Cantidad de Clases VIP Pro:"}</span>
                <div className="flex items-center gap-4 justify-center py-1">
                  <button onClick={() => setQtdAvulsas(Math.max(1, qtdAvulsas - 1))} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold hover:bg-slate-800">-</button>
                  <span className="text-lg font-mono font-black text-amber-400">{qtdAvulsas}</span>
                  <button onClick={() => setQtdAvulsas(Math.min(20, qtdAvulsas + 1))} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold hover:bg-slate-800">+</button>
                </div>
              </div>
            )}

            {["acumulador_grupo", "acumulador_vip_std", "acumulador_vip_pro"].includes(modalidade) && (
              <div className="flex flex-col gap-2 bg-slate-950/30 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 font-bold uppercase">
                  {modalidade === "acumulador_grupo" ? (
                    idioma === "PT" ? "Quantidade de Aulas em Grupo:" : idioma === "EN" ? "Amount of Group Classes:" : "Cantidad de Clases en Grupo:"
                  ) : (
                    idioma === "PT" ? "Quantidade de Aulas VIP Std:" : idioma === "EN" ? "Amount of VIP Std Classes:" : "Cantidad de Clases VIP Std:"
                  )}
                </span>
                <div className="flex items-center gap-4 justify-center py-1">
                  <button onClick={() => setQtdAvulsas(Math.max(1, qtdAvulsas - 1))} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold hover:bg-slate-800">-</button>
                  <span className="text-lg font-mono font-black text-amber-400">{qtdAvulsas}</span>
                  <button onClick={() => setQtdAvulsas(Math.min(20, qtdAvulsas + 1))} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold hover:bg-slate-800">+</button>
                </div>
                {qtdAvulsas === 20 && (
                  <p className="text-yellow-500 text-xs text-center font-medium mt-2 animate-pulse">
                    ⚠️ Limite máximo de 20 créditos extras atingido.
                  </p>
                )}
              </div>
            )}

            {/* Resumo e Botão Avançar Original Restaurado */}
            {valorTotal > 0 && (
              <div className="mt-2 flex flex-col gap-3">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    $ {valorTotal.toLocaleString("es-CO")} COP
                  </span>

                  {/* Linha de Status de IA Dinâmica e Minimalista para o Desktop */}
                  <div className="text-[10px] font-medium text-center text-slate-400 border-t border-white/[0.05] w-full pt-2 mt-2 leading-relaxed">
                    {["grupo", "vip_std", "vip_pro"].includes(modalidade) ? (
                      idioma === "PT" ? "Vigência Integral: 30 Dias | Acesso IA: Ilimitado" :
                      idioma === "EN" ? "Full Validity: 30 Days | AI Access: Unlimited" :
                      "Vigencia Integral: 30 Días | Acceso IA: Ilimitado"
                    ) : (
                      idioma === "PT" ? `Vigência Base: +${Math.min(qtdAvulsas * 7, 30)} Dias (Teto 30) | Crédito IA: +${modalidade === 'acumulador_grupo' ? qtdAvulsas * 10 : qtdAvulsas * 25} Consultas` :
                      idioma === "EN" ? `Base Term: +${Math.min(qtdAvulsas * 7, 30)} Days (Max 30) | AI Credit: +${modalidade === 'acumulador_grupo' ? qtdAvulsas * 10 : qtdAvulsas * 25} Queries` :
                      `Vigencia Base: +${Math.min(qtdAvulsas * 7, 30)} Días (Techo 30) | Crédito IA: +${modalidade === 'acumulador_grupo' ? qtdAvulsas * 10 : qtdAvulsas * 25} Consultas`
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    if (typeof window !== "undefined" && (window as any)._simulaMatriculado) {
                      // Se for matriculado, abre a tela flutuante de verificação por cima
                      (window as any)._showPopUpHAAS = true;
                      (window as any).dispatchEvent(new Event("resize"));
                    } else {
                      setPasso(2);
                    }
                  }} 
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-md hover:brightness-110 transition-all cursor-pointer text-center"
                >
                  {idioma === "PT" ? "CONTINUAR PARA O PAGAMENTO" : idioma === "EN" ? "PROCEED TO PAYMENT" : "CONTINUAR AL PAGO"}
                </button>
              </div>
            )}

            {/* 🖥️ POP-UPS DE REGRAS PREMIUM */}
            {typeof window !== "undefined" && (window as any)._showPopUpHAAS && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
                <div className="w-full max-w-sm bg-[#061324] border border-amber-500/30 rounded-[28px] p-6 text-center flex flex-col gap-4 shadow-2xl text-white">
                  {["grupo", "vip_std", "vip_pro"].includes(modalidade) ? (
                    <>
                      <div className="flex justify-center"><Calendar className="w-8 h-8 text-amber-400" /></div>
                      <div>
                        <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">{idioma === "PT" ? "Assegurar Próximo Ciclo?" : idioma === "EN" ? "Secure Next Cycle?" : "¿Asegurar Próximo Ciclo?"}</h4>
                        <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                          {idioma === "PT" ? "Detectamos que você já possui um plano ativo de horários fixos. Esta compra irá congelar a sua tarifa para o próximo mês. Os créditos serão carregados automaticamente ao iniciar o seu novo período." : idioma === "EN" ? "We detected that you already have an active fixed schedule plan. This purchase will freeze your rate for the next month. Credits will be automatically loaded at the start of your new period." : "Detectamos que ya tienes un plan activo de horarios fijos. Esta compra congelará tu tarifa para el próximo mes. Los créditos se cargarán automáticamente al iniciar tu nuevo periodo."}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <button 
                          onClick={() => { (window as any)._showPopUpHAAS = false; setPasso(2); (window as any).dispatchEvent(new Event("resize")); }} 
                          className="w-full bg-emerald-500 text-slate-950 font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:brightness-110 transition-all font-mono"
                        >
                          ✔ {idioma === "PT" ? "Sim, pagar adiantado" : idioma === "EN" ? "Yes, pay in advance" : "Sí, pagar por adelantado"}
                        </button>
                        <button 
                          onClick={() => { (window as any)._showPopUpHAAS = false; setModalidade(null); (window as any).dispatchEvent(new Event("resize")); }} 
                          className="w-full bg-slate-900 border border-white/10 text-slate-400 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:text-white transition-all font-mono"
                        >
                          {idioma === "PT" ? "Cancelar" : idioma === "EN" ? "Cancel" : "Cancelar"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center"><AlertTriangle className="w-8 h-8 text-rose-500" /></div>
                      <div>
                        <h4 className="text-sm font-black text-rose-400 uppercase tracking-wider">{idioma === 'PT' ? 'Regras de Agendamento' : idioma === 'EN' ? 'Scheduling Rules' : 'Reglas de Agendamiento'}</h4>
                        <div className="text-[11px] text-slate-300 text-left leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-white/5 mt-3 flex flex-col gap-1.5">
                          <div>{idioma === 'PT' ? '• Todo agendamento requer um mínimo de 24 horas de antecedência.' : idioma === 'EN' ? '• All scheduling requires a minimum of 24 hours notice.' : '• Todo agendamiento requiere un mínimo de 24 horas de anticipación.'}</div>
                          <div>{idioma === 'PT' ? '• Cancelamentos permitidos até 12 horas antes (caso contrário o crédito será descontado).' : idioma === 'EN' ? '• Cancellations allowed up to 12 hours before (otherwise the credit will be deducted).' : '• Cancelaciones permitidas hasta 12 horas antes (de lo contrario el crédito se descontará).'}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <button 
                          onClick={() => { (window as any)._showPopUpHAAS = false; setPasso(2); (window as any).dispatchEvent(new Event("resize")); }} 
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:brightness-110 transition-all font-mono"
                        >
                          {idioma === 'PT' ? 'Aceito Regras e Continuar' : idioma === 'EN' ? 'Accept Rules & Proceed' : 'Acepto Reglas y Continuar'}
                        </button>
                        <button 
                          onClick={() => { (window as any)._showPopUpHAAS = false; setModalidade(null); (window as any).dispatchEvent(new Event("resize")); }} 
                          className="w-full bg-slate-900 border border-white/10 text-slate-400 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:text-white transition-all font-mono"
                        >
                          {idioma === "PT" ? "Cancelar" : idioma === "EN" ? "Cancel" : "Cancelar"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* 💳 INTERFACE PREMIUM LADO A LADO EXPANDIDA */
          (() => {
            const taxaPercentual = valorTotal * 0.05; 
            const taxaFixa = 0; 

            // Criar uma semente de rotação única de 1 a 95 estável baseada no contexto do usuário logado
            const userSeed = typeof window !== "undefined" ? localStorage.getItem("user_email") || "haas" : "haas";
            let hashMod = 0;
            for (let i = 0; i < userSeed.length; i++) { hashMod += userSeed.charCodeAt(i); }
            const diferencaCentavos = (hashMod % 95) + 1; // Gera um número fixo de centavos/pesos de 1 a 95 para diferenciar alunos

            // Aplica a variação milimétrica nos totais para o robô ler
            const valorComTaxa = Math.round(valorTotal + taxaPercentual) - diferencaCentavos;
            const valorDescontoBreve = valorTotal - diferencaCentavos;
            const exibindoInternacional = (window as any)._verInternacional || false;

            // Gancho dinâmico para pegar a cotação no cliente sem travar o servidor
            const [cotacaoDolar, setCotacaoDolar] = (typeof window !== "undefined") ? (window as any).React?.useState(4100) || [4100, () => {}] : [4100, () => {}];
            if (typeof window !== "undefined" && !(window as any)._buscouCambio) {
              (window as any)._buscouCambio = true;
              fetch("https://open.er-api.com/v6/latest/USD")
                .then(res => res.json())
                .then(data => {
                  if (data && data.rates && data.rates.COP) {
                    (window as any)._taxaCop = data.rates.COP;
                    if (typeof window !== "undefined") (window as any).dispatchEvent(new Event("resize"));
                  }
                }).catch(() => {});
            }
            const taxaAtual = (window as any)._taxaCop || 4100;
            
            // Regra de Ouro em COP: Adiciona 5% da taxa do gateway e subtrai o rastro fino de pesos do robô
            const valorCopComTaxa = Math.round(valorTotal * 1.05);
            const valorCopFinalComDescontoRobo = valorCopComTaxa - diferencaCentavos;
            
            // O Dólar acompanha a taxa real da internet dinamicamente para referência do gringo
            const valorEmDolarFinal = valorCopFinalComDescontoRobo / taxaAtual;

            return (
              <div className="flex flex-col gap-4 text-white animate-fadeIn w-full">
                
                {/* BLOCO DE CUPOM REAL SIMULADO 3001 - TOPO DO MODAL */}
                <div className="w-full bg-[#0a1324] border border-white/[0.05] p-3.5 rounded-xl flex flex-col gap-2 shadow-inner text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    {idioma === "PT" ? "Possui um cupom de desconto?" : idioma === "EN" ? "Have a discount coupon?" : "¿Tienes un cupón de descuento?"}
                  </span>
                  <div className="flex gap-2 w-full">
                    <input 
                      type="text" 
                      placeholder="HAAS10" 
                      className="flex-1 bg-[#060c16] border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-orange-500/50 transition-all" 
                    />
                    <button className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/30 text-orange-400 hover:text-white px-5 py-2 rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider cursor-pointer active:scale-95 transition-all">
                      {idioma === "PT" ? "Aplicar" : idioma === "EN" ? "Apply" : "Aplicar"}
                    </button>
                  </div>
                </div>
                
                {/* Seletor de Localização Simples */}
                <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold tracking-wider">{idioma === "PT" ? "ONDE VOCÊ ESTÁ?" : idioma === "EN" ? "WHERE ARE YOU LOCATED?" : "¿DÓNDE TE ENCUENTRAS?"}</span>
                  <button 
                    onClick={() => { (window as any)._verInternacional = !(window as any)._verInternacional; (window as any).dispatchEvent(new Event("resize")); }}
                    className="text-amber-400 font-black hover:underline tracking-wider uppercase transition-all"
                  >
                    {exibindoInternacional ? (idioma === "PT" ? "🇨🇴 Mudar para Colômbia" : idioma === "EN" ? "🇨🇴 Switch to Colombia" : "🇨🇴 Cambiar a Colombia") : (idioma === "PT" ? <><Globe className="inline-block w-3.5 h-3.5 mr-1 mb-0.5 text-amber-400" />Fora da Colômbia</> : idioma === "EN" ? <><Globe className="inline-block w-3.5 h-3.5 mr-1 mb-0.5 text-amber-400" />Outside Colombia</> : <><Globe className="inline-block w-3.5 h-3.5 mr-1 mb-0.5 text-amber-400" />Fuera de Colombia</>)}
                  </button>
                </div>

                {exibindoInternacional ? (
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden max-h-[340px] w-full">
                    <div className="grid grid-cols-2 gap-4 items-stretch my-auto">
                      
                      {/* COLUNA ESQUERDA: TEXTO COMPACTO */}
                      <div className="flex flex-col justify-between gap-2 text-left">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 uppercase tracking-wider">
                            <Globe className="w-3.5 h-3.5 text-amber-400 inline-block mr-1 mb-0.5" />
                            {idioma === "PT" ? "Pagamentos Internacionais HAAS" : idioma === "EN" ? "HAAS International Payments" : "Pagamentos Internacionais HAAS"}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-2 font-medium">
                            {idioma === "PT" ? "Para transferências ou cartões do exterior, processe sua matrícula diretamente através do nosso módulo global integrado de alta segurança." : idioma === "EN" ? "For international bank transfers or cards, process your enrollment directly through our highly secure integrated global module." : "Para transferencias o tarjetas desde el exterior, procese su matrícula de manera directa a través de nuestro módulo global integrado de alta seguridad."}
                          </p>
                        </div>
                        <div className="text-[8px] text-slate-500 bg-slate-900/20 p-2 rounded-lg border border-slate-800/40">
                          <Shield className="inline-block w-3 h-3 mr-1 mb-0.5 text-slate-500" />{idioma === "PT" ? "Conexão criptografada de ponta a ponta. Compatível com cartões internacionais." : idioma === "EN" ? "End-to-end encrypted connection. Compatible with international cards." : "Conexión cifrada de extremo a extremo. Compatible con tarjetas internacionales."}
                        </div>
                      </div>

                      {/* COLUNA DIREITA: TABELA EM USD DETALHADA COM TAXA E DESCONTO DO ROBÔ */}
                      <div className="flex flex-col justify-between gap-1.5 bg-slate-900/40 p-2 rounded-xl border border-slate-800/60 max-h-[300px] overflow-hidden">
                        {(() => {
                          // Força a taxa do cartão da Colômbia para 5% e gera a rotação fina estável por aluno
                          (window as any)._taxaCartaoCol = 0.05;
                          const userSeed = typeof window !== "undefined" ? localStorage.getItem("user_email") || "haas" : "haas";
                          let hashMod = 0;
                          for (let i = 0; i < userSeed.length; i++) { hashMod += userSeed.charCodeAt(i); }
                          const diferencaCentavos = (hashMod % 95) + 1;
                          
                          const tAtual = (window as any)._taxaCop || 4100;
                          const usdBaseOriginal = Math.round(valorTotal / tAtual);
                          const usdFeeInternacional = Math.round(usdBaseOriginal * 0.05);
                          const valorEmDolarFinal = usdBaseOriginal + usdFeeInternacional - (diferencaCentavos / 100);

                          return (
                            <div className="flex flex-col gap-0.5 text-[9px] bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 font-mono text-left w-full">
                              <div className="flex justify-between text-slate-400"><span>{idioma === "PT" ? "Base do Plano:" : idioma === "EN" ? "Plan Base:" : "Base del Plan:"}</span><span>$ {valorTotal.toLocaleString("es-CO")} COP</span></div>
                              <div className="flex justify-between text-rose-400"><span>{idioma === "PT" ? "Taxa de Processamento (5%):" : idioma === "EN" ? "Processing Fee (5%):" : "Fee de Procesamiento (5%):"}</span><span>+ $ {Math.round(valorTotal * 0.05).toLocaleString("es-CO")} COP</span></div>
                              <div className="flex justify-between text-slate-500 text-[8px]"><span>{idioma === "PT" ? "Desconto de Identificação do Robô:" : idioma === "EN" ? "Robot Identification Discount:" : "Descuento de Identificación del Robot:"}</span><span>- $ {diferencaCentavos} COP</span></div>
                              <div className="border-t border-slate-800/80 my-1"></div>
                              <div className="flex flex-col gap-0.5 text-left">
                                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">{idioma === "PT" ? "VALOR EXATO PARA DIGITAR NA PASSARELA (COP):" : idioma === "EN" ? "EXACT VALUE TO ENTER IN THE GATEWAY (COP):" : "VALOR EXACTO PARA INGRESAR EN LA PASARELA (COP):"}</span>
                                <div className="flex justify-between font-black text-emerald-400 text-sm"><span>Total COP:</span><span>$ {(Math.round(valorTotal * 1.05) - diferencaCentavos).toLocaleString("es-CO")} COP</span></div>
                              </div>
                              <div className="border-t border-slate-800/40 my-0.5 opacity-30"></div>
                              <div className="flex justify-between text-slate-400 text-[9px]"><span>{idioma === "PT" ? "Equivalente comercial aproximado:" : idioma === "EN" ? "Approximate commercial equivalent:" : "Equivalente comercial aproximado:"}</span><span className="font-bold font-mono text-slate-300">$ {((Math.round(valorTotal * 1.05) - diferencaCentavos) / taxaAtual).toFixed(2)} USD</span></div>
                            </div>
                          );
                        })()}
                          

                        <button 
                          onClick={() => { if (typeof window !== "undefined") window.open("https://checkout.nequi.wompi.co/l/Nhopn2", "_blank"); }} 
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md text-center"
                        >
                          {idioma === "PT" ? "Ir para o Gateway de Pagamento" : idioma === "EN" ? "Go to Payment Gateway" : "Ir a la Pasarela de Pago"}
                        </button>
                      </div>

                    </div>
                    <div className="text-[8px] text-slate-400 text-center mt-2">
                      ⚠️ {idioma === "PT" ? (<><b>ATENÇÃO:</b> HAAS processa suas inscrições em moeda local (COP). A taxa bancária de processamento global não é reembolsável em caso de cancelamento. Certifique-se de digitar o valor em COP exato indicado na tabela acima para garantir a ativação automática pelo nosso robô.</>) : idioma === "EN" ? (<><b>ATTENTION:</b> HAAS processes enrollments in local currency (COP). The global processing bank fee is non-refundable in case of cancellation. Please make sure to enter the exact COP value shown in the table above to ensure automatic activation by our system.</>) : (<><b>ATENCIÓN:</b> HAAS procesa las inscripciones en moneda local (COP). La comisión bancaria de procesamiento global no es reembolsable en caso de cancelación. Asegúrese de ingresar el valor exacto en COP indicado en la tabla de arriba para garantizar la activación automática por nuestro robot.</>)}
                    </div>
                  </div>
                
            ) : (
                  <div className="grid grid-cols-2 gap-4 items-stretch">
                    
                    {/* COLUNA ESQUERDA: CARTÃO (CONFIÁVEL & ATIVO) */}
                    {/* COLUNA ESQUERDA: CARTÃO DESIGN PREMIUM METALIZADO */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group max-h-[340px]">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider text-left">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {idioma === "PT" ? "Cartão de Crédito / Débito" : idioma === "EN" ? "Credit / Debit Card" : "Tarjeta de Crédito / Débito"}
                          </div>
                          <p className="text-[8px] text-slate-500 text-left pl-3">{idioma === "PT" ? "Gateway seguro Wompi / Nequi" : idioma === "EN" ? "Secure gateway Wompi / Nequi" : "Pasarela segura Wompi / Nequi"}</p>
                        </div>
                      </div>

                      {/* Chip do Cartão Metalizado/Prateado Brilhoso */}
                      <div className="my-2 relative w-10 h-7 rounded-md bg-gradient-to-br from-slate-200 via-slate-400 to-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_2px_4px_rgba(0,0,0,0.4)] overflow-hidden">
                        <div className="absolute inset-1 border border-slate-500/30 rounded grid grid-cols-3 grid-rows-2 opacity-60">
                          <div className="border-r border-b border-slate-600/40"></div>
                          <div className="border-r border-b border-slate-600/40"></div>
                          <div className="border-b border-slate-600/40"></div>
                          <div className="border-r border-slate-600/40"></div>
                          <div className="border-r border-slate-600/40"></div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-[10px] bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 font-mono text-left">
                        <div className="flex justify-between text-slate-400"><span>Base:</span><span>$ {valorTotal.toLocaleString("es-CO")}</span></div>
                        <div className="flex justify-between text-rose-400"><span>{idioma === "PT" ? "Taxa do gateway:" : idioma === "EN" ? "Gateway fee:" : "Fee pasarela:"}</span><span>+ $ {Math.round(taxaPercentual + taxaFixa).toLocaleString("es-CO")}</span></div>
                        <div className="border-t border-slate-800/80 my-0.5"></div>
                        <div className="flex justify-between font-black text-white text-xs"><span>Total:</span><span>$ {valorComTaxa.toLocaleString("es-CO")}</span></div>
                      </div>

                      <button 
                        onClick={() => { if (typeof window !== "undefined") window.open("https://checkout.nequi.wompi.co/l/Nhopn2", "_blank"); }} 
                        className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md text-center"
                      >
                        {idioma === "PT" ? "Pagar via Wompi / Nequi" : idioma === "EN" ? "Pay via Wompi / Nequi" : "Pagar vía Wompi / Nequi"}
                      </button>
                      <p className="text-[7.5px] text-slate-500/90 font-medium text-center leading-tight mt-1.5 px-1">
                        <Shield className="inline-block w-3 h-3 mr-1 mb-0.5 text-slate-500" />{idioma === "PT" ? (
                          <>Ao processar o valor exato indicado, o gateway gerenciará a ativação da sua assinatura <b>de forma automática</b>. <i>Nota: A taxa de processamento é cobrada pela plataforma e não é reembolsável em caso de cancelamento.</i></>
                        ) : idioma === "EN" ? (
                          <>By processing the exact amount indicated, the payment gateway will handle your subscription activation <b>automatically</b>. <i>Note: The processing fee is charged by the platform and is non-refundable in case of cancellation.</i></>
                        ) : (
                          <>Al procesar el valor exacto indicado, la pasarela de pago gestionará la activación de tu suscripción <b>de forma automática</b>. <i>Nota: La comisión de procesamiento es cobrada por la plataforma y no es reembolsable en caso de cancelación.</i></>
                        )}
                      </p>
                    </div>

                    {/* COLUNA DIREITA: LLAVE BRE-B (QR CODE PURIFICADO E SEM NOMES) */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden max-h-[340px]">
                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[7px] font-black px-2 py-0.5 rounded-bl uppercase tracking-widest">
                        {idioma === "PT" ? "Economize a Comissão!" : idioma === "EN" ? "Save Commission!" : "¡Ahorra Comisión!"}
                      </div>
                      
                      <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider text-left flex justify-start items-center"><div className="flex items-center justify-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span><span>{idioma === "PT" ? "Chave Bre-B" : idioma === "EN" ? "Bre-B Key" : "Llave Bre-B"}</span></div></div>
                      
                                            <div className="mx-auto w-24 h-24 bg-white p-1 rounded-xl flex items-center justify-center border border-amber-500/20 my-1 shadow-lg relative overflow-hidden">
                        <img 
                          src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/Untitled%20folder/WhatsApp%20Image%202026-06-28%20at%2012.18.16.jpeg" 
                          alt="QR Code Oficial Llave Bre-B"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-[10px] bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 font-mono text-left">
                        <div className="flex justify-between text-slate-400"><span>Base:</span><span>$ {valorTotal.toLocaleString("es-CO")}</span></div>
                        <div className="flex justify-between text-emerald-400 font-bold"><span>{idioma === "PT" ? "Comissão:" : idioma === "EN" ? "Commission:" : "Comisión:"}</span><span>$0 ({idioma === "PT" ? "Grátis!" : idioma === "EN" ? "Free!" : "¡Gratis!"})</span></div>
                        <div className="border-t border-slate-800/80 my-0.5"></div>
                        <div className="flex justify-between font-black text-amber-400 text-xs"><span>{idioma === "PT" ? "A transferir:" : idioma === "EN" ? "Amount to transfer:" : "A transferir:"}</span><span>$ {valorDescontoBreve.toLocaleString("es-CO")}</span></div>
                      </div>
                      
                      <p className="text-[7.5px] text-slate-400/90 font-medium text-center leading-tight mt-1 px-1">
                        ⚠️ <span className="font-bold text-amber-400">{idioma === "PT" ? "ATENÇÃO:" : idioma === "EN" ? "ATTENTION:" : "ATENCIÓN:"}</span> {idioma === "PT" ? "Lembre-se de inserir o valor exato com desconto no seu banco; isso permite que nosso sistema valide seu pagamento digitalmente e gerencie a ativação do seu plano de forma automática." : idioma === "EN" ? "Remember to enter the exact discounted value in your bank; this allows our system to digitally validate your payment and manage the activation of your plan automatically." : "Recuerda ingresar el valor exacto con descuento en tu banco; esto permite que nuestro sistema valide tu pago digitalmente y gestione la activación de tu plan de forma automática."}
                      </p>
                    </div>
                  </div>
                )}

                {/* RODAPÉ UNIFICADO COM BOTÃO GERAL E ALINHAMENTO ORIGINAL */}
                <div className="flex flex-col gap-2.5 border-t border-white/5 pt-3 mt-1">
                  {(() => {
                    
                    const [_, forceUpdate] = (typeof window !== "undefined") ? (window as any).React?.useState(0) || [0, () => {}] : [0, () => {}];
                    const estadoNotificado = (typeof window !== "undefined") ? (window as any)._pagoNotificado || false : false;
                    if (estadoNotificado) {
                      return (
                        <div className="fixed inset-0 z-[110] bg-[#061324] flex flex-col justify-center items-center p-6 text-center font-mono animate-fadeIn">
                          <div className="max-w-md bg-slate-950/60 border border-amber-500/20 p-6 rounded-2xl flex flex-col gap-4 shadow-2xl">
                            <div className="flex justify-center my-2"><Hourglass className="w-8 h-8 text-amber-400 animate-pulse" /></div>
                            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider"><Hourglass className="inline-block w-4 h-4 mr-1 mb-0.5 text-amber-400 animate-pulse" />{idioma === "PT" ? "NOTIFICAÇÃO DE PAGAMENTO ENVIADA" : idioma === "EN" ? "PAYMENT NOTIFICATION SENT" : "NOTIFICACIÓN DE PAGO ENVIADA"}</h3>
                            <p className="text-[10px] text-slate-300 leading-relaxed text-left bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                              {idioma === "PT" ? "Registramos o seu aviso de pagamento. O sistema iniciará a verificação dos valores com o desconto de identificação aplicado para validar a transação com o seu registro." : idioma === "EN" ? "We have registered your payment notice. The system will begin verifying the values with the identification discount applied to validate the transaction with your registration." : "Hemos registrado tu aviso de pago. El sistema iniciará la verificación de los valores con el descuento de identificación aplicado para validar la transacción con tu registro."}
                            </p>
                            <div className="text-[9px] text-slate-400 text-left flex flex-col gap-2 bg-slate-900/20 p-3 rounded-xl border border-slate-800/40">
                              <p>• <b className="text-white">{idioma === "PT" ? "O que acontece agora?" : idioma === "EN" ? "What happens now?" : "¿Qué pasa ahora?"}</b> {idioma === "PT" ? "Assim que o sistema validar o recebimento do valor, procederemos com a ativação automática da sua matrícula." : idioma === "EN" ? "Once the system validates the receipt of the amount, it will proceed with the automatic activation of your enrollment." : "Una vez que el sistema valide el ingreso del valor, se procederá con la activación automática de tu matrícula."}</p>
                              <p>• <b className="text-white">Acceso Completo:</b> Tras la confirmation exitosa, recibirás un e-mail de notificación y se habilitará tu acceso a la plataforma para que disfrutes de toda la experiencia.</p>
                            </div>
                            <button
                              onClick={() => {
                                (window as any)._pagoNotificado = false; if(typeof forceUpdate === "function") forceUpdate(Math.random());
                                setPasso(1); setModalidade(null); setIsOpen(false);
                              }}
                              className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-[11px] uppercase tracking-widest shadow-md transition-all cursor-pointer text-center font-mono"
                            >
                              {idioma === "PT" ? "ENTENDIDO" : idioma === "EN" ? "UNDERSTOOD" : "ENTENDIDO"}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button 
                        onClick={() => { 
                          // 1. Fecha o modal de trás na mesma hora
                          setIsOpen(false);
                          if (typeof window !== "undefined") {
                            (window as any)._showPopUpHAAS = false;
                          }
                          
                          // 2. Cria a telinha isolada com o blur por cima de tudo
                          const containerAviso = document.createElement("div");
                          containerAviso.id = "modal-notificacion-pago";
                          containerAviso.className = "fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn text-white font-mono";
                          
                          containerAviso.innerHTML = `
                            <div class="w-full max-w-sm bg-[#061324] border border-amber-500/30 rounded-[28px] p-6 text-center flex flex-col gap-4 shadow-2xl">
                              <div className="flex justify-center my-2"><Hourglass className="w-8 h-8 text-amber-400 animate-pulse" /></div>
                              <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider"><Hourglass className="inline-block w-4 h-4 mr-1 mb-0.5 text-amber-400 animate-pulse" />${idioma === "PT" ? "NOTIFICAÇÃO DE PAGAMENTO ENVIADA" : idioma === "EN" ? "PAYMENT NOTIFICATION SENT" : "NOTIFICACIÓN DE PAGO ENVIADA"}</h4>
                              <p class="text-[10px] text-slate-300 text-left bg-slate-950/50 p-3 rounded-xl border border-white/5" style="line-height: 1.5rem;">
                                ${idioma === "PT" ? "Registramos o seu aviso de pagamento. O sistema iniciará a verificação dos valores com o desconto de identificação aplicado para validar a transação com o seu registro." : idioma === "EN" ? "We have registered your payment notice. The system will begin verifying the values with the identification discount applied to validate the transaction with your registration." : "Hemos registrado tu aviso de pago. El sistema iniciará la verificación de los valores con el desconto de identificación aplicado para validar a transação com o seu registro."}
                              </p>
                              <div class="text-[9px] text-slate-400 text-left flex flex-col gap-1.5 bg-slate-950/20 p-3 rounded-xl border border-white/5">
                                <p>• <b class="text-white">${idioma === "PT" ? "O que acontece agora?" : idioma === "EN" ? "What happens now?" : "¿Qué pasa agora?"}</b> ${idioma === "PT" ? "Assim que o sistema validar o recebimento do valor, procederemos com a ativação automática da sua matrícula." : idioma === "EN" ? "Once the system validates the receipt of the amount, it will proceed with the automatic activation of your enrollment." : "Una vez que el sistema valide el ingreso del valor, se procederá con la activación automática de tu matrícula."}</p>
                                <p>• <b class="text-white">${idioma === "PT" ? "Acesso Completo:" : idioma === "EN" ? "Full Access:" : "Acceso Completo:"}</b> ${idioma === "PT" ? "Após a confirmação bem-sucedida, você receberá um e-mail de notificação e seu acesso será liberado." : idioma === "EN" ? "Upon successful confirmation, you will receive a notification email and your access will be enabled." : "Tras la confirmación exitosa, recibirás un e-mail de notificación y se habilitará tu acesso a la plataforma."}</p>
                              </div>
                              <button id="btn-entendido-aviso" class="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-[11px] uppercase tracking-widest shadow-md transition-all cursor-pointer text-center font-mono">
                                ${idioma === "PT" ? "ENTENDIDO" : idioma === "EN" ? "UNDERSTOOD" : "ENTENDIDO"}
                              </button>
                            </div>
                          `;
                          document.body.appendChild(containerAviso);
                          
                          // 3. Ação do botão ENTENDIDO para limpar tudo e zerar o fluxo
                          document.getElementById("btn-entendido-aviso")?.addEventListener("click", () => {
                            containerAviso.remove();
                            setPasso(1);
                            setModalidade(null);
                          });
                        }}
                        className="w-full bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl text-[11px] uppercase tracking-widest shadow-md hover:brightness-110 transition-all cursor-pointer text-center font-mono"
                      >
                        {idioma === "PT" ? "Já realizei o pagamento, voltar ao portal" : idioma === "EN" ? "I already paid, return to portal" : "Ya realicé el pago, volver al portal"}
                      </button>
                    );
                  })()}
                  
                  <div className="flex justify-start text-xs mt-0.5">
                    <button onClick={() => { setPasso(1); (window as any).dispatchEvent(new Event("resize")); }} className="text-slate-500 hover:text-white font-medium flex items-center gap-1">
                      <ChevronLeft className="inline-block w-4 h-4 mr-1 mb-0.5" />{idioma === "PT" ? "Voltar aos planos" : idioma === "EN" ? "Back to plans" : "Volver a planes"}
                    </button>
                  </div>
                </div>

              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}