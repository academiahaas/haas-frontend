// Tabela de bloqueios adicionada com segurança no escopo global
const agendaBloqueiosHaas2026 = {
  1: [1, 12], 2: [], 3: [23], 4: [2, 3], 5: [1, 18],
  6: [8, 15, 29],
  7: [6, 20],
  8: [7, 17],
  9: [], 10: [12], 11: [2, 16], 12: [8, 25]
};
import ArenaQuizMobile from './ArenaQuizMobile';
import React, { useState, useRef } from 'react';
import { Gift, Swords, BookOpen, LayoutDashboard, Calendar, Camera, User, Star, MessageSquare, Flame, Award, CheckCircle, TrendingUp, Globe, X, FileText, AlertTriangle, Zap, Timer, Lock } from 'lucide-react';
import MioloMultiplaEscolhaMobile from './exercise-types/MioloMultiplaEscolhaMobile';
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
import MioloTraducaoInversaMobile from './exercise-types/MioloTraducaoInversaMobile';
import MioloVelocidadeProgressiva from './exercise-types/MioloVelocidadeProgressiva';

interface PortalMobileProps {
  alunoData?: any;
  moduloActual?: string;
  onIniciarQuiz?: () => void;
  idioma?: string;
  t?: any;
}

const titulosJogos: Record<string, { label: Record<string, string>; title: Record<string, string> }> = {
  escolha: { 
    label: { PT: "ANÁLISE DE CONTEXTO", ES: "ANÁLISIS DE CONTEXTO", EN: "CONTEXT ANALYSIS" }, 
    title: { PT: "DECISÃO RÁPIDA", ES: "DECISIÓN RÁPIDA", EN: "QUICK DECISION" } 
  },
  caca_erro: { 
    label: { PT: "CAÇA ERRO", ES: "CORRECCIÓN SINTÁTICA", EN: "ERROR HUNT" }, 
    title: { PT: "CORREÇÃO SINTÁTICA", ES: "CORRECCIÓN SINTÁTICA", EN: "SYNTAX CORRECTION" } 
  },
  blitz: { 
    label: { PT: "DESAFIO BLITZ", ES: "DESAFÍO BLITZ", EN: "BLITZ CHALLENGE" }, 
    title: { PT: "RECONHECIMENTO RÁPIDO", ES: "RECONOCIMIENTO RÁPIDO", EN: "RAPID RECOGNITION" } 
  },
  ditado: { 
    label: { PT: "DITADO PRÁTICO", ES: "DICTADO PRÁCTICO", EN: "PRACTICE DICTATION" }, 
    title: { PT: "FIXAÇÃO ACÚSTICA", ES: "FIJACIÓN ACÚSTICA", EN: "ACOUSTIC FIXATION" } 
  },
  blocos: { 
    label: { PT: "BLOCOS DE GRAMÁTICA", ES: "BLOQUES DE GRAMÁTICA", EN: "GRAMMAR BLOCKS" }, 
    title: { PT: "CONSTRUÇÃO ESTRUTURAL", ES: "CONSTRUCCIÓN ESTRUCTURAL", EN: "STRUCTURAL CONSTRUCTION" } 
  },
  leitura: { 
    label: { PT: "LEITURA VELOZ", ES: "LECTURA VELOZ", EN: "SPEED READING" }, 
    title: { PT: "SPRINT FLUIDEZ", ES: "SPRINT FLUIDEZ", EN: "FLUENCY SPRINT" } 
  },
  ordenacao: { 
    label: { PT: "ORDENAÇÃO DE FRASES", ES: "ORDENACIÓN DE FRASES", EN: "SENTENCE ORDERING" }, 
    title: { PT: "SINTAXE DE ALTO PADRÃO", ES: "SINTAXIS DE ALTO NIVEL", EN: "HIGH-LEVEL SYNTAX" } 
  },
  paragrafos: { 
    label: { PT: "REORDENAÇÃO DE PARÁGRAFOS", ES: "REORDENACIÓN DE PÁRRAFOS", EN: "PARAGRAPH REORDERING" }, 
    title: { PT: "COESÃO TEXTUAL AVANÇADA", ES: "COHESIÓN TEXTUAL AVANZADA", EN: "ADVANCED TEXT COHESION" } 
  },
  roleplay: { 
    label: { PT: "CONVERSAÇÃO IA", ES: "CONVERSACIÓN IA", EN: "AI CONVERSATION" }, 
    title: { PT: "ROLEPLAY COGNITIVO", ES: "ROLEPLAY COGNITIVO", EN: "COGNITIVE ROLEPLAY" } 
  },
  shadowing: { 
    label: { PT: "LABORATÓRIO DE PRONÚNCIA", ES: "LABORATORIO DE PRONUNCIACIÓN", EN: "PRONUNCIATION LAB" }, 
    title: { PT: "SHADOWING EM TEMPO REAL", ES: "SHADOWING EN TIEMPO REAL", EN: "REAL-TIME SHADOWING" } 
  },
  spelling: { 
    label: { PT: "SPELLING BEE", ES: "SPELLING BEE", EN: "SPELLING BEE" }, 
    title: { PT: "SOLETRANDO VOCABULÁRIO", ES: "DELETREO DE VOCABULARIO", EN: "VOCABULARY SPELLING" } 
  },
  traducao: { 
    label: { PT: "TRADUÇÃO INVERSA", ES: "TRADUCCIÓN INVERSA", EN: "REVERSE TRANSLATION" }, 
    title: { PT: "ENGENHARIA REVERSA", ES: "INGENIERÍA REVERSA", EN: "REVERSE ENGINEERING" } 
  },
  velocidade: { 
    label: { PT: "LEITURA PROGRESSIVA", ES: "LECTURA PROGRESSIVA", EN: "PROGRESSIVE READING" }, 
    title: { PT: "SPRINT DE COMPREENSÃO", ES: "SPRINT DE COMPRENSIÓN", EN: "COMPREHENSION SPRINT" } 
  }
};


function MiniCalendarioSemanal({ setAbaAtiva, idiomaSelecionado }: any) {
  // Dias da semana simplificados
  const diasDaSemana = [
    { id: 1, label: 'S' },
    { id: 2, label: 'T' },
    { id: 3, label: 'Q' },
    { id: 4, label: 'Q' },
    { id: 5, label: 'S' },
    { id: 6, label: 'S' },
    { id: 7, label: 'D' }
  ];

  // Mock seguro ou mapeamento de dias com aula marcado (Ex: Terça e Quinta = dias 2 e 4)
  const diasComAula = [2, 4]; 

  // Pega os dias do mês de forma sequencial sutil para a semana corrente
  const hoje = new Date();
  const diaSemanaAtual = hoje.getDay() === 0 ? 7 : hoje.getDay();
  
  return (
    <div className="w-full py-4 bg-[#070d19]/40 border border-white/[0.03] rounded-xl flex flex-col gap-2 shrink-0 px-4">
      <span className="text-[clamp(10px,2.8vw,12px)] font-mono font-black uppercase text-white tracking-wider">📅 {idiomaSelecionado === "PT" ? "Cronograma da Semana" : idiomaSelecionado === "ES" ? "Cronograma Semanal" : "Weekly Schedule"}</span>
      <div className="flex justify-between items-center gap-1.5">
        {diasDaSemana.map((dia) => {
          const temAula = diasComAula.includes(dia.id);
          const diferenca = dia.id - diaSemanaAtual;
          const dataAlvo = new Date(hoje);
          dataAlvo.setDate(hoje.getDate() + diferenca);
          const numeroDia = dataAlvo.getDate();

          return (
            <div key={dia.id} onClick={() => setAbaAtiva("agenda")} className="flex flex-col items-center flex-1 min-w-0 cursor-pointer active:scale-95 select-none">
              <span className="text-[7px] font-bold text-slate-500 mb-0.5">{dia.label}</span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-mono font-black transition-all ${
                temAula 
                  ? 'bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.1)]' 
                  : 'bg-black/20 border border-white/[0.02] text-slate-400'
              }`}>
                {numeroDia}
              </div>
              {temAula && <div className="w-1 h-1 bg-cyan-400 rounded-full mt-0.5 opacity-80" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MascoteRoboAI({ devePiscar = false, idioma = "PT", olharDireta = false }) {
  const dicionarioMascote = { PT: "MENTORA HAAS", EN: "HAAS MENTOR", ES: "MENTORA HAAS" };
  return (
    <div className="relative flex flex-col items-center justify-center p-1.5 rounded-xl border border-white/[0.08] bg-[#070d19]/80 backdrop-blur-md w-16 h-16 shrink-0 select-none">
      <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-16 sm:h-16 drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)]" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <path d={devePiscar ? "M28 42.5H33" : "M28 41C28 42.5 29 43.5 30.5 43.5C32 43.5 33 42.5 33 41"} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="hidden"></span>
    </div>
  );
}


  // Matrizes de Preço Oficiais (HAAS Academy)
  const obterPrecoPacote = (modalidade, aulas) => {
    if (modalidade === 'pack_grupo') {
      const tabela = { 1: 40000, 2: 75000, 3: 110000, 4: 145000, 5: 180000, 6: 220000, 7: 260000, 8: 300000 };
      return tabela[aulas] || 300000;
    }
    if (modalidade === 'pack_vip') {
      const tabela = {
        1: 55000, 2: 105000, 3: 155000, 4: 205000, 5: 255000, 6: 305000, 7: 355000, 8: 400000,
        9: 435000, 10: 470000, 11: 505000, 12: 540000, 13: 575000, 14: 610000, 15: 645000,
        16: 680000, 17: 715000, 18: 750000
      };
      return tabela[aulas] || 750000;
    }
    if (modalidade === 'flex') {
      const tabela = {
        1: 75000, 2: 145000, 3: 215000, 4: 285000, 5: 355000, 6: 425000, 7: 495000, 8: 560000,
        9: 615000, 10: 670000, 11: 725000, 12: 780000, 13: 835000, 14: 890000, 15: 945000,
        16: 1000000, 17: 1055000, 18: 1110000, 19: 1155000, 20: 1200000
      };
      return tabela[aulas] || 1200000;
    }
    if (modalidade === 'grupo') {
      return Number(aulas) === 8 ? 300000 : Number(aulas) === 12 ? 420000 : 650000;
    }
    if (modalidade === 'particular') {
      return Number(aulas) === 8 ? 400000 : Number(aulas) === 12 ? 540000 : 800000;
    }
    if (modalidade === 'business') {
      return Number(aulas) === 8 ? 560000 : Number(aulas) === 12 ? 780000 : 1200000;
    }
    return 0;
  };

export default function PortalMobile({ alunoData, moduloActual, onIniciarQuiz, idioma: idiomaInicial, t }: PortalMobileProps) {
  const [roboDevePiscar, setRoboDevePiscar] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRoboDevePiscar(true);
      setTimeout(() => setRoboDevePiscar(false), 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Timer para olhar para a direita (frente -> direita -> frente)
  const [olharDireta, setOlharDireta] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setOlharDireta(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const [abaAtiva, setAbaAtiva] = useState<'inicio' | 'agenda' | 'tarefas' | 'perfil'>('dashboard' as any);
      const [modalAgenda, setModalAgenda] = React.useState('CLOSED');
  const [modalCreditosAberto, setModalCreditosAberto] = React.useState(false);
  const [isMatriculadoSimulado, setIsMatriculadoSimulado] = React.useState(false);
  const [isVencidoSimulado, setIsVencidoSimulado] = React.useState(false);
  const [etapaPagamento, setEtapaPagamento] = React.useState(0);
  const [modalidadeSelecionada, setModalidadeSelecionada] = React.useState('');
  
  // OBJETO DINÂMICO CONECTADO AO BANCO DE DADOS (Simulação de créditos ativos)
  const saldosDoAluno = alunoData?.saldos || {
    grupo: 0,
    acumulador_grupo: 4,      // Seu plano acumulador ativo da foto
    vip_std: 5,               // LIBERADO: Créditos ativos para você testar o VIP Standard sem travar!
    acumulador_vip_std: 0,
    vip_pro: 0,
    avulsa: 0
  };
  const [gavetaAvisoCompraAberta, setGavetaAvisoCompraAberta] = React.useState(false);
  const [gavetaErro24hAberta, setGavetaErro24hAberta] = React.useState(false);
  const [creditosSelecionados, setCreditosSelecionados] = React.useState(8);
  const [localizacaoAluno, setLocalizacaoAluno] = React.useState('');
  const [cupomTexto, setCupomTexto] = React.useState('');
  const [descontoCupom, setDescontoCupom] = React.useState(0);
  const [cupomAplicado, setCupomAplicado] = React.useState(false);
      const [unidadeExpandida, setUnidadeExpandida] = useState<number | null>(null);
  const [mentoraMobileAberta, setMentoraMobileAberta] = React.useState(false);
  const [textoDuda, setTextoDuda] = React.useState('');
  const [gravando, setGravando] = React.useState(false);
  const recognitionRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);

  // 🎙️ Função para fazer a Haas falar no idioma correto
  const falarTexto = (texto, langConfig, audioBase64 = null, podeFalar = true) => {
    if (!podeFalar) return;
    if (audioBase64) {
      try {
        const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
        const audioPlay = new Audio(audioUrl);
        audioPlay.play().catch(err => console.error("Erro ao reproduzir voz Nova da OpenAI:", err));
        return;
      } catch (e) {
        console.error("Falha ao tocar áudio premium, usando fallback nativo...", e);
      }
    }

    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const textoLimpo = texto.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(textoLimpo);
    const langLower = String(langConfig || idiomaSelecionado || 'PT').toUpperCase();
    if (langLower === 'ES') utterance.lang = 'es-ES';
    else if (langLower === 'EN') utterance.lang = 'en-US';
    else utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

    const alternarMicrofone = async () => {
    if (gravando) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setGravando(false);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Gravação de áudio não suportada neste navegador.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Converte o arquivo de áudio bruto para Base64 de forma limpa
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          setDigitandoHaas(true);
          
          try {
            // Adiciona uma mensagem temporária indicando que a IA está processando o áudio
            setMensagensMentora(prev => [...prev, { id: Date.now(), sender: 'user', text: "🎙️ Áudio enviado..." }]);
            
            const response = await fetch('/api/portal-aluno', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pergunta: "", audio: base64Audio, moduloActual, idioma: idiomaInicial })
            });
            
            const data = await response.json();
            setDigitandoHaas(false);
            const textoFinal = data.reply || data.response || data.resposta || data.content || data.text;
            if (textoFinal) {
              setMensagensMentora(prev => [...prev, { id: Date.now() + 1, sender: 'mentora', text: textoFinal }]);
              falarTexto(textoFinal, idiomaSelecionado, data.audio, true);
            }
          } catch (err) {
            console.error("Erro ao enviar áudio bruto:", err);
            setDigitandoHaas(false);
          }
        };

        // Fecha o microfone do hardware do aparelho para poupar bateria
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setGravando(true);
      console.log("🎙️ Gravador de áudio bruto (Modo Desktop Fluido) iniciado com sucesso!");
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const enviarDudaDirect = async (textoDireto) => {
    if (!textoDireto.trim()) return;
    setMensagensMentora(prev => [...prev, { id: Date.now(), sender: 'user', text: textoDireto }]);
    setTextoDuda('');
    setDigitandoHaas(true);
    try {
      const response = await fetch('/api/portal-aluno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: textoDireto, moduloActual, idioma: idiomaInicial })
      });
      const data = await response.json();
      setDigitandoHaas(false);
      const textoFinal = data.reply || data.response || data.resposta || data.content || data.text;
      if (textoFinal) {
        setMensagensMentora(prev => [...prev, { id: Date.now() + 1, sender: 'mentora', text: textoFinal }]);
        falarTexto(textoFinal, idiomaSelecionado, data.audio, false);
      }
    } catch (err) {
      console.error(err);
      setDigitandoHaas(false);
    }
  };
  const [digitandoHaas, setDigitandoHaas] = React.useState(false);
  
    const enviarDuda = async () => {
    if (!textoDuda.trim()) return;
    const textoPergunta = textoDuda;
    const novaMsg = { id: Date.now(), sender: "user", text: textoPergunta };
    
    setMensagensMentora(prev => [...prev, novaMsg]);
    setTextoDuda("");
    setDigitandoHaas(true);

    try {
      const response = await fetch("/api/portal-aluno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: textoPergunta, idioma: idiomaSelecionado })
      });
      
      const data = await response.json();
      setDigitandoHaas(false);
      
      const textoFinal = data.reply || data.response || data.resposta || data.content || data.text;

      if (textoFinal) {
        setMensagensMentora(prev => [...prev, { id: Date.now() + 1, sender: "mentora", text: textoFinal }]);
        falarTexto(textoFinal, idiomaSelecionado, data.audio, false);
      }
    } catch (err) {
      console.error("Erro ao chamar IA Haas:", err);
      setDigitandoHaas(false);
    }
  };
  const [mensagensMentora, setMensagensMentora] = React.useState([
    {
      id: 1,
      sender: "mentora",
      text: "" // Será preenchido dinamicamente no render para evitar quebra de escopo
    }
  ]);

  const [etapaAgendamento, setEtapaAgendamento] = React.useState(0);
  const [sucessoAgendamento, setSucessoAgendamento] = useState<'CLOSED' | 'REGULAR' | 'REPOSICAO'>('CLOSED');
  const [mesAgendamento, setMesAgendamento] = React.useState(() => new Date().getMonth() + 1); // Dinâmico baseado no mês real
  const [tipoAgendamento, setTipoAgendamento] = React.useState('REGULAR');
  const [diaSelecionado, setDiaSelecionado] = React.useState(() => String(new Date().getDate())); // Dinâmico baseado no dia real
  const [horarioSelecionado, setHorarioSelecionado] = React.useState('');
  const [votoProf, setVotoProf] = React.useState(0);
  const [votoMetod, setVotoMetod] = React.useState(0);
  
  // Estado de Idioma Global e Controle do Modal de Seleção
  // Inicializa buscando do localStorage, se não existir, define 'ES' como padrão absoluto
  const [idiomaSelecionado, setIdiomaSelecionado] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem('haas_idioma');
      if (salvo) return salvo;
    }
    return 'ES';
  });

  // Salva no localStorage sempre que o aluno mudar o idioma
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('haas_idioma', idiomaSelecionado);
    }
  }, [idiomaSelecionado]);
  const [modalIdiomaAberto, setModalIdiomaAberto] = useState<boolean>(false);

  // Estados para fluxo real de arquivos (Máximo 3)
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [erroMaxArquivos, setErroMaxArquivos] = React.useState(false);
  const [arenaAtiva, setArenaAtiva] = React.useState(false);
  const [jogoSelecionadoMobile, setJogoSelecionadoMobile] = React.useState('escolha');
  const [gavetaExerciciosAberta, setGavetaExerciciosAberta] = React.useState(false);
  const [gavetaTipoAulaAberta, setGavetaTipoAulaAberta] = React.useState(false);
  const [gavetaCalendarioAberta, setGavetaCalendarioAberta] = React.useState(false);
  const [gavetaHorariosAberta, setGavetaHorariosAberta] = React.useState(false);
  const [statusRespostaMobile, setStatusRespostaMobile] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [opcaoSelecionadaMobile, setOpcaoSelecionadaMobile] = React.useState(false);

  const mockQuizzes = [
    {
      id: "1",
      tema_tag: "GRAMMAR",
      nivel: "B1",
      enunciado: "The executive matrix ________ updated before the core system syncs tomorrow morning.",
      opcoes: ["must be", "should to", "has been", "was going"],
      opcao_correta: "must be",
      feedback_gps: "Correct. 'Must be' indicates a professional corporate requirement."
    },
    {
      id: "2",
      tema_tag: "VOCABULARY",
      nivel: "B1",
      enunciado: "We need to ensure data ________ checks are passing to avoid corruption.",
      opcoes: ["integrity", "falsity", "breakage", "elasticity"],
      opcao_correta: "integrity",
      feedback_gps: "Excellent. 'Data integrity' is the accurate technical standard terminology."
    }
  ];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const nomeModulo = moduloActual || "Data Schema Integrity Checks";
  const nomeAluno = alunoData?.nome || alunoData?.name || "Alpha";
  const instrutor = "Dr. Alex Harrison";
  const dataAula = "22/06/2026";
  const horarioAula = "19:30 BRT";

  const insignias = [
    { id: 1, nome: "First Code", ganha: true, color: "from-amber-400 to-orange-500" },
    { id: 2, nome: "10d Streak", ganha: true, color: "from-red-500 to-pink-500" },
    { id: 3, nome: "Data Master", ganha: true, color: "from-cyan-400 to-blue-600" },
  ];

  // DICIONÁRIO DE TRADUÇÃO ATUALIZADO
  const traducoes: Record<string, Record<string, string>> = {
    EN: {
      portalTitle: "Student Portal",
      viewProgram: "View Full Program",
      tabLearn: "Learn",
      tabSchedule: "Schedule",
      tabTasks: "Tasks",
      tabProfile: "Profile",
      taskTitle: "ASSIGNMENTS PORTFOLIO",
      taskDesc: "Take a picture of your notebook page or upload up to 3 files directly for instructor feedback.",
      btnPhoto: "Take Photo / Select Files",
      btnUploading: "Uploading to Supabase...",
      btnSubmit: "Submit Assignments",
      uploadOk: "All files uploaded successfully! Instructor notified.",
      errorMax: "Maximum 3 files allowed at once.",
      selectedFiles: "Selected Files",
      radarTitle: "LANGUAGE PERFORMANCE INDEX",
      radarLive: "LIVE",
      radarDesc: "Updates in real-time.",
      pFala: "Speaking",
      pEscuta: "Listening",
      pGramatica: "Grammar",
      pEscrita: "Writing",
      pLeitura: "Reading"
    },
    PT: {
      portalTitle: "Portal do Aluno",
      viewProgram: "Ver Programa Completo",
      tabLearn: "Estudar",
      tabSchedule: "Agenda",
      tabTasks: "Entregas",
      tabProfile: "Perfil",
      taskTitle: "PORTFÓLIO DE ENTREGAS",
      taskDesc: "Tire uma foto da página do seu caderno para enviar diretamente para a avaliação do instrutor.",
      btnPhoto: "TIRAR FOTO / SELECIONAR ARQUIVOS",
      btnUploading: "Enviando para o Supabase...",
      btnSubmit: "Concluir Envio",
      uploadOk: "Todos os arquivos enviados com sucesso! Professor notificado.",
      errorMax: "Permitido no máximo 3 arquivos por vez.",
      selectedFiles: "Arquivos Selecionados",
      radarTitle: "ÍNDICE DE DESEMPENHO LINGUÍSTICO",
      radarLive: "AO VIVO",
      radarDesc: "Atualizado em tempo real.",
      pFala: "FALA",
      pEscuta: "ESCUTA",
      pGramatica: "GRAMÁTICA",
      pEscrita: "ESCRITA",
      pLeitura: "LEITURA"
    },
    ES: {
      portalTitle: "Portal del Alumno",
      viewProgram: "Ver Programa Completo",
      tabLearn: "Estudiar",
      tabSchedule: "Agenda",
      tabTasks: "Tareas",
      tabProfile: "Perfil",
      taskTitle: "PORTAFOLIO DE TAREAS",
      taskDesc: "Toma una foto de tu cuaderno o sube hasta 3 archivos directamente para la revisión del instructor.",
      btnPhoto: "Tomar Foto / Seleccionar Archivos",
      btnUploading: "Subiendo a Supabase...",
      btnSubmit: "Enviar Tareas",
      uploadOk: "¡Todos los archivos se subieron con éxito! Profesor notificado.",
      errorMax: "Se permite un máximo de 3 archivos a la vez.",
      selectedFiles: "Archivos Seleccionados",
      radarTitle: "ÍNDICE DE RENDIMIENTO LINGÜÍSTICO",
      radarLive: "EN VIVO",
      radarDesc: "Actualizado en tiempo real.",
      pFala: "Habla",
      pEscuta: "Escucha",
      pGramatica: "Gramática",
      pEscrita: "Escritura",
      pLeitura: "Lectura"
    }
  };

  const txt = traducoes[idiomaSelecionado] || traducoes['EN'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedList = Array.from(e.target.files);
      if (selectedList.length > 3) {
        setErroMaxArquivos(true);
        setArquivosSelecionados([]);
        setTimeout(() => setErroMaxArquivos(false), 4000);
        return;
      }
      setErroMaxArquivos(false);
      setUploadSuccess(false);
      setArquivosSelecionados(selectedList);
    }
  };

  const acionarInputNativo = () => {
    fileInputRef.current?.click();
  };

  const [modalProgramaAberto, setModalProgramaAberto] = React.useState(false);

  const handleEnviarFila = () => {
    if (arquivosSelecionados.length === 0) return;
    setUploading(true);
    setUploadSuccess(false);
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      setArquivosSelecionados([]);
      setTimeout(() => setUploadSuccess(false), 5000);
    }, 3000);
  };

  return (
    <div className="w-full h-[100svh] bg-[#030914] text-white select-none flex flex-col overflow-hidden max-w-[100vw] font-sans fixed inset-0">
      
      {/* HEADER FIXO */}
      <div className="w-full bg-[#070d19]/90 backdrop-blur-md border-b border-white/[0.05] px-4 h-14 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-mono font-black text-xs sm:text-base text-white">HA</div>
          <div className="flex flex-col">
            <span className="text-[clamp(14px,4vw,22px)] font-black text-white tracking-wide block">{idiomaSelecionado === "PT" ? `Oi, ${nomeAluno}!` : idiomaSelecionado === "ES" ? `¡Hola, ${nomeAluno}!` : `Hi, ${nomeAluno}!`}</span>
            <div className="flex gap-1 mt-1 bg-slate-950/40 p-0.5 rounded-lg border border-white/[0.03] w-max select-none text-[8px] font-mono font-black">
              <button 
                onClick={() => { setIsMatriculadoSimulado(false); setIsVencidoSimulado(false); }} 
                className={`px-1.5 py-0.5 rounded transition-all ${!isMatriculadoSimulado ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 opacity-60'}`}
              >
                🆕 {idiomaSelecionado === 'PT' ? 'Novo' : idiomaSelecionado === 'EN' ? 'New' : 'Nuevo'}
              </button>
              <button 
                onClick={() => { setIsMatriculadoSimulado(true); setIsVencidoSimulado(false); }} 
                className={`px-1.5 py-0.5 rounded transition-all ${isMatriculadoSimulado && !isVencidoSimulado ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 opacity-60'}`}
              >
                🔄 {idiomaSelecionado === 'PT' ? 'Ativo' : idiomaSelecionado === 'EN' ? 'Active' : 'Activo'}
              </button>
              <button 
                onClick={() => { setIsMatriculadoSimulado(true); setIsVencidoSimulado(true); }} 
                className={`px-1.5 py-0.5 rounded transition-all ${isMatriculadoSimulado && isVencidoSimulado ? 'bg-rose-500 text-white font-black' : 'text-slate-400 opacity-60'}`}
              >
                ⚠️ {idiomaSelecionado === 'PT' ? 'Vencido' : idiomaSelecionado === 'EN' ? 'Expired' : 'Vencido'}
              </button>
            </div>

          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setGavetaExerciciosAberta(true)}
              className="bg-slate-800 border border-white/[0.08] active:scale-95 transition-all text-orange-500 p-1 rounded flex items-center justify-center cursor-pointer"
            >
              <AlertTriangle size={12} className="animate-pulse" />
            </button>
            <span className="text-[clamp(11px,3.2vw,15px)] bg-amber-500/10 text-amber-400 font-black px-2.5 py-1 rounded-lg border border-amber-500/20 uppercase font-mono tracking-wide">B1</span>
          </div>
          <span className="text-[clamp(13px,3.8vw,18px)] font-black font-mono text-[#FF8A2B] flex items-center gap-1"><Flame size={15} className="sm:w-[20px] sm:h-[20px]" /> 12d</span>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL - DISTRIBUIÇÃO VERTICAL COMPLETA */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden z-10 justify-between">
        
        {/* ABA 1: ESTUDAR */}
        {(abaAtiva as string) === 'inicio' && (
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-gradient-to-br from-[#091527] to-[#050b14] border border-white/[0.05] p-5 rounded-2xl shadow-xl flex-1 relative">
              {/* 📦 PAINEL INTERNO DA MENTORA HAAS - PARTE 2/20 */}
              {mentoraMobileAberta && (
                <div className="absolute inset-0 bg-[#050b14] border border-white/[0.08] p-5 rounded-2xl flex flex-col justify-between z-30 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-2">
                    <span className="text-[clamp(14px,3.5vw,22px)] font-mono font-black tracking-widest text-slate-400 uppercase">MENTORA HAAS</span>
                    <button 
                      onClick={() => setMentoraMobileAberta(false)}
                      className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg px-2.5 py-1 sm:px-4 sm:py-1.5 text-[clamp(10px,2.5vw,13px)] font-mono font-bold border-none cursor-pointer transition-all"
                    >
                      ✕ {idiomaSelecionado === "PT" ? "FECHAR" : idiomaSelecionado === "ES" ? "CERRAR" : "CLOSE"}
                    </button>
                  </div>
                  
                  {/* 💬 HISTÓRICO DE MENSAGENS RESPONSIVO - PARTE 10/20 */}
                  <div className="flex-1 overflow-y-auto my-2 pr-1 flex flex-col gap-3 scrollbar-thin">
                    {mensagensMentora.map((msg) => {
                      const textoExibido = msg.id === 1 && msg.text === "" 
                        ? (idiomaSelecionado === "PT" ? "Oi, tudo bem? Meu nome é Haas e eu vou ser a sua mentora. Qual é a sua dúvida sobre o conteúdo de hoje?" : idiomaSelecionado === "ES" ? "¿Hola, todo bien? Mi nombre es Haas y voy a ser tu mentora. ¿Cuál es tu duda sobre el contenido de hoy?" : "Hi, how are you? My name is Haas and I'll be your mentor. What is your question about today's content?")
                        : msg.text;

                      const isMentora = msg.sender === "mentora";
                      
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex w-full ${isMentora ? "justify-start" : "justify-end"}`}
                        >
                          <div className={`max-w-[85%] rounded-2xl p-3.5 text-[clamp(12px,2.8vw,15px)] font-sans leading-relaxed shadow-md ${
                            isMentora 
                              ? "bg-white/5 border border-white/[0.04] text-slate-200 rounded-tl-sm" 
                              : "bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-tr-sm font-medium"
                          }`}>
                            {textoExibido}
                          </div>
                        </div>
                      );
                    })}

                    {/* ⏳ INDICADOR VISUAL "HAAS ESTÁ DIGITANDO..." */}
                    {digitandoHaas && (
                      <div className="flex w-full justify-start animate-fadeIn">
                        <div className="bg-white/5 border border-white/[0.04] text-slate-400 rounded-2xl rounded-tl-sm p-3.5 flex items-center gap-1.5 shadow-md">
                          <span className="text-[11px] font-mono uppercase tracking-wider mr-1 text-slate-500">
                            {idiomaSelecionado === "PT" ? "Haas está digitando" : idiomaSelecionado === "ES" ? "Haas está escribiendo" : "Haas is typing"}
                          </span>
                          <div className="flex gap-1 items-center h-2 mb-0.5">
                            <span className="w-1.5 h-1.5 bg-amber-500/80 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-amber-500/80 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-amber-500/80 rounded-full animate-bounce"></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <span className="text-[clamp(9px,2.5vw,13px)] font-mono font-black text-cyan-400 uppercase tracking-widest block mb-1">{idiomaSelecionado === "PT" ? "MÓDULO ATUAL" : idiomaSelecionado === "ES" ? "MÓDULO ACTUAL" : "CURRENT MODULE"}</span>
              <h2 className="text-[clamp(14px,4.2vw,22px)] font-black text-white uppercase tracking-wide mb-3">{nomeModulo}</h2>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/[0.05] mb-2">
                <div className="h-full w-[45%] bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
              </div>
              <span className="text-[clamp(10px,2.8vw,14px)] text-slate-400 font-bold block mt-1.5 mb-1">{idiomaSelecionado === "PT" ? "Progresso da Unidade:" : idiomaSelecionado === "ES" ? "Progreso de la Unidad:" : "Unit Progress:"} 45%</span>
              <div className="flex flex-col gap-3 mt-2 w-full">
                {/* UNIDADE 1 */}
                <div 
                  onClick={() => setUnidadeExpandida(unidadeExpandida === 1 ? null : 1)}
                  className="flex flex-col bg-black/30 p-3 rounded-xl border border-white/[0.03] cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-white font-mono text-[clamp(10px,3vw,15px)] uppercase tracking-wider font-bold">
                      • {idiomaSelecionado === "PT" ? "Unidade 1: Gramática Estrutural" : idiomaSelecionado === "ES" ? "Unidad 1: Gramática Estructural" : "Unit 1: Structural Grammar"}
                    </span>
                    <span className="text-slate-500 text-[clamp(10px,2.8vw,14px)]">{unidadeExpandida === 1 ? "▲" : "▼"}</span>
                  </div>
                  
                  {unidadeExpandida === 1 && (
                    <div className="flex gap-2 mt-3 w-full justify-between pt-2 border-t border-white/[0.05] animate-fadeIn">
                      <button onClick={(e) => { e.stopPropagation(); alert("Abrir Material"); }} className="flex-1 py-2 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-lg text-[clamp(9px,3.2vw,14px)] font-mono font-black uppercase text-slate-300 tracking-wider flex items-center justify-center gap-1">Ler</button>
                      <button onClick={(e) => { e.stopPropagation(); alert("Abrir Vídeo"); }} className="flex-1 py-2 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-lg text-[clamp(9px,3.2vw,14px)] font-mono font-black uppercase text-slate-300 tracking-wider flex items-center justify-center gap-1">Vídeo</button>
                      
                    </div>
                  )}
                </div>

                {/* UNIDADE 2 */}
                <div 
                  onClick={() => setUnidadeExpandida(unidadeExpandida === 2 ? null : 2)}
                  className="flex flex-col bg-black/30 p-3 rounded-xl border border-white/[0.03] cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-white font-mono text-[clamp(10px,3vw,15px)] uppercase tracking-wider font-bold">
                      • {idiomaSelecionado === "PT" ? "Unidade 2: Vocabulário Técnico" : idiomaSelecionado === "ES" ? "Unidad 2: Vocabulario Técnico" : "Unit 2: Technical Vocabulary"}
                    </span>
                    <span className="text-slate-500 text-[clamp(10px,2.8vw,14px)]">{unidadeExpandida === 2 ? "▲" : "▼"}</span>
                  </div>

                  {unidadeExpandida === 2 && (
                    <div className="flex gap-2 mt-3 w-full justify-between pt-2 border-t border-white/[0.05] animate-fadeIn">
                      <button onClick={(e) => { e.stopPropagation(); alert("Abrir Material"); }} className="flex-1 py-2 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-lg text-[clamp(9px,3.2vw,14px)] font-mono font-black uppercase text-slate-300 tracking-wider flex items-center justify-center gap-1">Ler</button>
                      <button onClick={(e) => { e.stopPropagation(); alert("Abrir Vídeo"); }} className="flex-1 py-2 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-lg text-[clamp(9px,3.2vw,14px)] font-mono font-black uppercase text-slate-300 tracking-wider flex items-center justify-center gap-1">Vídeo</button>
                      
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 🏁 TRANSIÇÃO DINÂMICA DE BOTÕES - PARTE 3/20 */}
            {!mentoraMobileAberta ? (
              <div className="flex items-center gap-2 w-full shrink-0">
                <button 
                  onClick={() => setArenaAtiva(true)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-4 px-3 rounded-xl text-[clamp(11px,3.5vw,16px)] uppercase tracking-widest flex items-center justify-center gap-2 border-none active:scale-[0.98] transition-all shadow-lg shadow-orange-500/10 cursor-pointer shrink-0"
                >
                  <BookOpen size={18} className="sm:w-[22px] sm:h-[22px]" /> {idiomaSelecionado === "PT" ? "INICIAR TREINO PRÁTICO" : idiomaSelecionado === "ES" ? "INICIAR ENTRENAMIENTO" : "START TRAINING"}
                </button>
                <button
                  onClick={() => setMentoraMobileAberta(true)}
                  className="bg-[#0b1426] hover:bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-white p-4 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-[0.95] h-[54px] w-[54px] shrink-0 shadow-lg"
                >
                  <MessageSquare size={22} />
                </button>
              </div>
            ) : (
              /* 🎨 1. O CARDZINHO DE ENTRADA STANDALONE (QUANDO ABERTO) */
              <div className="w-full bg-[#070d19] border border-white/[0.08] p-2 rounded-xl flex items-center gap-2 shrink-0 shadow-2xl animate-fadeIn">
                <input 
                  type="text"
                  placeholder={idiomaSelecionado === "PT" ? "Digite sua dúvida aqui..." : idiomaSelecionado === "ES" ? "Escribe tu duda aquí..." : "Type your question here..."}
                  className="flex-1 bg-black/40 border border-white/[0.05] rounded-lg px-3 py-3 sm:py-4 text-[clamp(12px,2.8vw,15px)] text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition-all"
                  value={textoDuda}
                  onChange={(e) => setTextoDuda(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviarDuda()}
                />
                
                {/* Botão do Microfone Estilizado Neon */}
                <button onClick={alternarMicrofone} className={`h-10 w-10 border rounded-full flex items-center justify-center transition-all cursor-pointer ${gravando ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-white/5 border-white/[0.08] text-slate-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </button>

                {/* Botão de Envio Seta (>) */}
                <button onClick={enviarDuda} className="h-10 w-10 sm:h-12 sm:w-12 bg-amber-600 text-white rounded-lg flex items-center justify-center border-none font-bold text-sm sm:text-base cursor-pointer shrink-0 active:scale-[0.95] transition-all">
                  ➔
                </button>
              </div>
            )}

            {etapaPagamento === 1 && (
              <div className="flex flex-col gap-4 my-2 text-slate-100">
                {/* BOTÃO VOLTAR DISCRETO */}
                <button onClick={() => setEtapaPagamento(0)} className="text-xs font-bold uppercase tracking-wider text-left text-orange-400 bg-transparent border-none cursor-pointer flex items-center gap-1 hover:text-orange-500 w-fit">
                  ← Voltar
                </button>

                {/* SELETOR PLANO RECORRENTE (8, 12, 20 CRÉDITOS) */}
                {['grupo', 'particular', 'business'].includes(modalidadeSelecionada) && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {idiomaSelecionado === 'PT' ? 'Selecione a Intensidade Mensal:' : 'Seleccione la Intensidad Mensual:'}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[8, 12, 20].map((cr) => (
                        <button key={cr} onClick={() => setCreditosSelecionados(cr)} className={`p-3.5 rounded-xl border text-xs font-black uppercase cursor-pointer transition-all ${creditosSelecionados === cr ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-500 text-slate-950 shadow-lg shadow-orange-500/20' : 'bg-[#0a1324] border-white/10 text-slate-200'}`}>
                          {cr} CLASES
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SELETOR PACKS EXTRAS (CONTADOR + E -) */}
                {['pack_grupo', 'pack_vip', 'flex'].includes(modalidadeSelecionada) && (
                  <div className="flex flex-col gap-3 bg-[#0a1324] p-4 rounded-xl border border-white/5 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {idiomaSelecionado === 'PT' ? 'Quantidade de Aulas:' : 'Cantidad de Clases:'}
                    </span>
                    <div className="flex items-center gap-6 my-1">
                      <button onClick={() => setCreditosSelecionados(Math.max(1, creditosSelecionados - 1))} className="w-10 h-10 bg-[#070d19] border border-orange-500/30 rounded-xl flex items-center justify-center font-black text-lg text-orange-500 cursor-pointer active:bg-orange-500/10">-</button>
                      <span className="text-2xl font-mono font-black text-white">{creditosSelecionados}</span>
                      <button onClick={() => setCreditosSelecionados(Math.min(modalidadeSelecionada === 'pack_grupo' ? 8 : modalidadeSelecionada === 'pack_vip' ? 18 : 20, creditosSelecionados + 1))} className="w-10 h-10 bg-[#070d19] border border-orange-500/30 rounded-xl flex items-center justify-center font-black text-lg text-orange-500 cursor-pointer active:bg-orange-500/10">+</button>
                    </div>
                  </div>
                )}

                {/* DISPLAY DE VALOR PREMIUM HAAS ACADEMY */}
                <div className="w-full p-4 bg-gradient-to-b from-[#0a1324] to-[#070d19] border border-orange-500/20 rounded-2xl flex flex-col items-center justify-center gap-0.5 my-1 shadow-inner">
                  <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest font-mono">
                    {modalidadeSelecionada.toUpperCase()} // {creditosSelecionados} CLASES
                  </span>
                  <div className="text-2xl font-mono font-black text-white flex items-center gap-1.5 tracking-wide mt-1">
                    <span className="text-orange-500">$</span>
                    <span>{obterPrecoPacote(modalidadeSelecionada, creditosSelecionados).toLocaleString('de-DE')}</span>
                    <span className="text-xs text-slate-400 font-bold ml-1 uppercase">COP</span>
                  </div>
                </div>

                {/* BOTÃO FINAL: CONTINUAR AO PAGO */}
                <button onClick={() => setEtapaPagamento(2)} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] border-none cursor-pointer shadow-lg shadow-orange-500/10 hover:brightness-110">
                  {idiomaSelecionado === "PT" ? "Continuar para o Pagamento" : "Continuar al Pago"}
                </button>
              </div>
            )}

{/* CONTAINER DOS MIOLOS COM CABEÇALHO E RODAPÉ DE VALIDAÇÃO */}
            {arenaAtiva && (
              <div className="fixed inset-0 z-[9999] bg-[#060e1a] flex flex-col p-4 overflow-hidden text-white w-full h-full">
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.05] shrink-0 mb-4">
                  <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">AUDITORIA DE EXERCÍCIOS</span>
                  <button 
                    onClick={() => { setArenaAtiva(false); setStatusRespostaMobile('IDLE'); }}
                    className="bg-white/10 text-white rounded-lg px-3 py-1 text-xs font-bold border-none cursor-pointer"
                  >
                    ✕ FECHAR
                  </button>
                </div>

                {/* CABEÇALHO DO EXERCÍCIO COMPACTO */}
                <div className="mb-2 bg-slate-900/60 border border-white/[0.04] p-2.5 rounded-xl shrink-0">
                  <span className="text-[clamp(9px,2.5vw,13px)] font-mono font-black text-cyan-400 block tracking-widest uppercase">
                    {titulosJogos[jogoSelecionadoMobile]?.label[idiomaSelecionado as string] || 'CONTEÚDO'}
                  </span>
                  <h2 className="text-[clamp(12px,3.5vw,16px)] font-black text-white mt-0.5 uppercase tracking-tight">
                    {titulosJogos[jogoSelecionadoMobile]?.title[idiomaSelecionado as string] || 'PRÁTICA ATIVA'}
                  </h2>
                </div>

                {/* CORPO DO EXERCÍCIO COM ADAPTAÇÃO NATIVA DE FILHOS FORÇADA */}
                <div className="bg-slate-900/20 border border-white/[0.02] p-3 rounded-xl w-full flex flex-col flex-1 items-stretch overflow-hidden  mb-0 min-h-0">
                  <div className="w-full flex-1 flex flex-col items-stretch justify-between min-h-0 h-full overflow-hidden">
                    {jogoSelecionadoMobile === 'escolha' && <MioloMultiplaEscolhaMobile />}
                    {jogoSelecionadoMobile === 'caca_erro' && <MioloCacaErro />}
                    {jogoSelecionadoMobile === 'blitz' && <MioloBlitzChallenge />}
                    {jogoSelecionadoMobile === 'ditado' && <DitadoLacunas />}
                    {jogoSelecionadoMobile === 'blocos' && <MioloBlocos />}
                    {jogoSelecionadoMobile === 'leitura' && <MioloLeituraRapida />}
                    {jogoSelecionadoMobile === 'ordenacao' && <MioloOrdenacao />}
                    {jogoSelecionadoMobile === 'paragrafos' && <MioloReordenacaoParagrafos />}
                    {jogoSelecionadoMobile === 'roleplay' && <MioloRoleplay />}
                    {jogoSelecionadoMobile === 'shadowing' && <MioloShadowing />}
                    {jogoSelecionadoMobile === 'spelling' && <MioloSpellingBee />}
                    {jogoSelecionadoMobile === 'traducao' && <MioloTraducaoInversaMobile />}
                    {jogoSelecionadoMobile === 'velocidade' && <MioloVelocidadeProgressiva />}
                  </div>

                  {/* BARRA DE VALIDAÇÃO ACOPLADA SEM ESPAÇAMENTO REBENTADO */}
                  <div className="w-full pt-0 mt-auto pt-2 border-t border-white/[0.02] flex flex-col gap-2 shrink-0">
                    {statusRespostaMobile === 'CORRECT' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide text-center">
                        🎉 Resposta Correta! Muito bom!
                      </div>
                    )}
                    {statusRespostaMobile === 'WRONG' && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide text-center mb-2">
                        ❌ Algo deu errado. Tente novamente!
                      </div>
                    )}

                    {/* BOTÃO DE AVANÇO TOTALMENTE LIVRE E SEM TRAVAS FIXAS NA BASE */}
                    {statusRespostaMobile !== 'IDLE' && (
                      <button
                        onClick={() => {
                          setStatusRespostaMobile('IDLE');
                          setOpcaoSelecionadaMobile(false);
                        }}
                        className={`w-full py-3.5 px-4 mt-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-none cursor-pointer text-center ${
                          statusRespostaMobile === 'CORRECT' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        PROSSEGUIR ➔
                      </button>
                    )}
                  </div>
                  
                  {/* ESPAÇADOR DE SEGURANÇA PARA LIMITE DO RODAPÉ REAL */}
                  <div className="w-full h-10 shrink-0 pointer-events-none" />

                </div>
              </div>
            )}

            {/* GAVETA SUSPENSA LATERAL DE SELEÇÃO */}
            {gavetaExerciciosAberta && (
              <div 
                className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex justify-end"
                onClick={() => setGavetaExerciciosAberta(false)}
              >
                <div 
                  className="w-64 h-full bg-[#091527] border-l border-white/[0.05] p-4 flex flex-col gap-4 justify-start shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <div className="flex justify-between items-center pb-2 border-b border-white/[0.05] mb-4">
                      <span className="text-[10px] font-black tracking-widest text-orange-500 uppercase">SELECIONAR EXERCÍCIO</span>
                      <button 
                        onClick={() => setGavetaExerciciosAberta(false)}
                        className="text-slate-400 bg-transparent text-xs font-bold border-none cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-[85vh] overflow-y-auto">
                      {[
                        { id: 'escolha', label: 'Múltipla Escolha' },
                        { id: 'caca_erro', label: 'Caça Erro' },
                        { id: 'blitz', label: 'Blitz' },
                        { id: 'ditado', label: 'Ditado' },
                        { id: 'blocos', label: 'Blocos' },
                        { id: 'leitura', label: 'Leitura Veloz' },
                        { id: 'ordenacao', label: 'Ordenação' },
                        { id: 'paragrafos', label: 'Parágrafos' },
                        { id: 'roleplay', label: 'Conversação' },
                        { id: 'shadowing', label: 'Pronúncia' },
                        { id: 'spelling', label: 'Spelling' },
                        { id: 'traducao', label: 'Tradução' },
                        { id: 'velocidade', label: 'Progressiva' }
                      ].map((j) => (
                        <button
                          key={j.id}
                          onClick={() => {
                            setJogoSelecionadoMobile(j.id);
                            setGavetaExerciciosAberta(false);
                            setArenaAtiva(true);
                            setStatusRespostaMobile('IDLE');
                          }}
                          className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-xl border-none cursor-pointer transition-all ${jogoSelecionadoMobile === j.id ? 'bg-orange-500 text-white' : 'bg-slate-900/60 text-slate-400'}`}
                        >
                          {j.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* ESPAÇADOR DE SEGURANÇA PARA LIMITE DO RODAPÉ REAL */}
                  <div className="w-full h-10 shrink-0 pointer-events-none" />

                </div>
              </div>
            )}

            {etapaPagamento === 1 && (
              <div className="flex flex-col gap-4 my-1 text-slate-100">
                {/* BOTÃO VOLTAR */}
                <button onClick={() => setEtapaPagamento(0)} className="text-xs font-bold uppercase tracking-wider text-left text-orange-400 bg-transparent border-none cursor-pointer flex items-center gap-1 hover:text-orange-500 w-fit">
                  ← Voltar
                </button>

                {/* SELETOR PLANO RECORRENTE (8, 12, 20) */}


                {/* SELETOR PACKS (CONTADOR) */}
                {['pack_grupo', 'pack_vip', 'flex'].includes(modalidadeSelecionada) && (
                  <div className="flex flex-col gap-3 bg-[#0a1324] p-4 rounded-xl border border-white/5 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Cantidad de Clases:
                    </span>
                    <div className="flex items-center gap-6 my-1">
                      <button onClick={() => setCreditosSelecionados(Math.max(1, creditosSelecionados - 1))} className="w-10 h-10 bg-[#070d19] border border-orange-500/30 rounded-xl flex items-center justify-center font-black text-lg text-orange-500 cursor-pointer active:bg-orange-500/10">-</button>
                      <span className="text-2xl font-mono font-black text-white">{creditosSelecionados}</span>
                      <button onClick={() => setCreditosSelecionados(Math.min(modalidadeSelecionada === 'pack_grupo' ? 8 : 20, creditosSelecionados + 1))} className="w-10 h-10 bg-[#070d19] border border-orange-500/30 rounded-xl flex items-center justify-center font-black text-lg text-orange-500 cursor-pointer active:bg-orange-500/10">+</button>
                    </div>
                  </div>
                )}

                {/* CAIXA DE VALOR PREMIUM */}
                <div className="w-full p-4 bg-gradient-to-b from-[#0a1324] to-[#070d19] border border-orange-500/20 rounded-2xl flex flex-col items-center justify-center gap-0.5 my-1 shadow-inner">
                  <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest font-mono">
                    {modalidadeSelecionada.toUpperCase()} // {creditosSelecionados} CLASES
                  </span>
                  <div className="text-2xl font-mono font-black text-white flex items-center gap-1.5 tracking-wide mt-1">
                    <span className="text-orange-500">$</span>
                    <span>{obterPrecoPacote(modalidadeSelecionada, creditosSelecionados).toLocaleString('de-DE')}</span>
                    <span className="text-xs text-slate-400 font-bold ml-1 uppercase">COP</span>
                  </div>
                </div>

                {/* BOTÃO DE AÇÃO */}
                <button onClick={() => setEtapaPagamento(2)} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] border-none cursor-pointer shadow-lg shadow-orange-500/10 hover:brightness-110">
                  Continuar al Pago
                </button>
              </div>
            )}
          </div>
        )}




        {/* ABA 2: AGENDA - SISTEMA DE FLUXO SEGURO */}
        {(abaAtiva as string) === 'agenda' && (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden relative text-slate-200">
            
            {/* CABEÇALHO DA ABA DA AGENDA COM MAPEAMENTO COMERCIAL TRILINGUE */}
            <div className="px-4 py-3 bg-slate-950/50 border-b border-white/[0.03] flex justify-between items-center gap-2 shrink-0 w-full text-left">
              <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider font-mono truncate max-w-[65%]">
                {(() => {
                  const mod = modalidadeSelecionada || 'vip_std';
                  if (mod === 'grupo') return idiomaSelecionado === "PT" ? "GRUPO MENSAL" : idiomaSelecionado === "ES" ? "GRUPO MENSAL" : "MONTHLY GROUP";
                  if (mod === 'acumulador_grupo') return idiomaSelecionado === "PT" ? "PACK GRUPO" : idiomaSelecionado === "ES" ? "PACK GRUPO" : "GROUP PACK";
                  if (mod === 'vip_std') return "VIP STANDARD";
                  if (mod === 'acumulador_vip_std') return "PACK VIP STD";
                  if (mod === 'vip_pro') return "VIP PRO";
                  if (mod === 'avulsa') return idiomaSelecionado === "PT" ? "PARTICULARES FLEX" : idiomaSelecionado === "ES" ? "PARTICULARES FLEX" : "FLEX INDIVIDUAL";
                  return "HAAS PREMIUM PLAN";
                })()}
              </span>
              <span className="text-[9.5px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-md font-mono shrink-0 whitespace-nowrap tracking-wider">
                {idiomaSelecionado === "PT" ? "VENCE EM 12 DIAS" : idiomaSelecionado === "ES" ? "VENCE EN 12 DÍAS" : "EXPIRES IN 12 DAYS"}
              </span>
            </div>

            {/* STAGE 0: HOME DA AGENDA (LISTAGEM PADRÃO) */}
            {etapaAgendamento === 0 && (
              <div className="flex-1 w-full h-full flex flex-col gap-3 overflow-hidden justify-between p-3">
                <div className="flex flex-col gap-3 overflow-y-auto scrollbar-none">
                  
                  {/* BOTÕES DE FILTRO DINÂMICO DE CRÉDITOS */}
                  <div className="grid grid-cols-2 gap-2 shrink-0">
                    <button 
                      onClick={() => { (window as any)._filtroAgenda = 'regular'; if (typeof window !== "undefined") (window as any).dispatchEvent(new Event("resize")); }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${((window as any)._filtroAgenda || 'regular') === 'regular' ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/40 shadow-md shadow-orange-500/5' : 'bg-slate-900/40 border-white/[0.05] opacity-60'}`}
                    >
                      <span className="text-[clamp(10px,2.8vw,12px)] font-mono font-bold text-white uppercase tracking-wider block mb-0.5">{idiomaSelecionado === "PT" ? "Sessões Regulares" : idiomaSelecionado === "ES" ? "Sesiones Regulares" : "Regular Sessions"}</span>
                      <p className="text-[clamp(16px,4.5vw,20px)] font-black text-slate-300 flex items-baseline gap-1">4<span className="text-[clamp(11px,3.2vw,13px)] font-medium text-white">{idiomaSelecionado === "PT" ? "disp." : idiomaSelecionado === "ES" ? "disp." : "avail."}</span></p>
                    </button>

                    <button 
                      onClick={() => { (window as any)._filtroAgenda = 'reposicao'; if (typeof window !== "undefined") (window as any).dispatchEvent(new Event("resize")); }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${((window as any)._filtroAgenda || 'regular') === 'reposicao' ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/40 shadow-md shadow-orange-500/5' : 'bg-slate-900/40 border-white/[0.05] opacity-60'}`}
                    >
                      <span className="text-[clamp(10px,2.8vw,12px)] font-mono font-bold text-white uppercase tracking-wider block mb-0.5">{idiomaSelecionado === "PT" ? "Sessões de Reposição" : idiomaSelecionado === "ES" ? "Sesiones de Reposición" : "Makeup Sessions"}</span>
                      <p className="text-[clamp(16px,4.5vw,20px)] font-black text-slate-300 flex items-baseline gap-1">1<span className="text-[clamp(11px,3.2vw,13px)] font-medium text-white">{idiomaSelecionado === "PT" ? "ativa" : idiomaSelecionado === "ES" ? "activa" : "active"}</span></p>
                    </button>
                  </div>

                  {/* BLOCO ATENÇÃO EXPANDIDO COM AS 3 REGRAS DE NEGÓCIO DA ACADEMIA HAAS */}
                  <div className="bg-slate-900/30 border border-white/[0.04] rounded-xl p-3 flex items-start gap-2.5 shrink-0 text-left">
                    <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1 text-[11px] text-slate-300 font-medium leading-relaxed font-mono">
                      <span className="font-bold text-orange-400 uppercase tracking-wider block text-[10px] mb-0.5">
                        {idiomaSelecionado === "PT" ? "Regulamento de Sessões:" : idiomaSelecionado === "ES" ? "Reglamento de Sesiones:" : "Session Rules:"}
                      </span>
                      <p>• {idiomaSelecionado === "PT" ? "Reposição: Agendar em até 5 dias após a aula cancelada." : idiomaSelecionado === "ES" ? "Reposición: Programar dentro de los 5 días posteriores a la sesión cancelada." : "Makeup: Schedule within 5 days of the canceled session."}</p>
                      <p>• {idiomaSelecionado === "PT" ? "Cancelamento: Realizar com no mínimo 12 horas de antecedência." : idiomaSelecionado === "ES" ? "Cancelación: Realizar con un mínimo de 12 horas de anticipación." : "Cancellation: Must be done at least 12 hours in advance."}</p>
                      <p>• {idiomaSelecionado === "PT" ? "Agendamento: Reservar novas aulas com pelo menos 24 horas de antecedência." : idiomaSelecionado === "ES" ? "Reserva: Programar clases con al menos 24 horas de anticipación." : "Booking: Reserve classes at least 24 hours in advance."}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-h-0">
                    <span className="text-[clamp(11px,3vw,13px)] font-mono font-black text-slate-600 uppercase tracking-widest block px-1 shrink-0">{idiomaSelecionado === "PT" ? "Próximos Agendamentos" : idiomaSelecionado === "ES" ? "Próximos Agendamientos" : "Upcoming Sessions"}</span>
                    <div className="flex flex-col gap-3 overflow-y-auto pr-0.5 scrollbar-none">
                      {/* 1º CARD CRONOLÓGICO: HOJE (REPOSIÇÃO RETIDA - MENOS DE 12H) */}
                      <div className="bg-orange-500/[0.02] border border-orange-500/10 p-3 rounded-xl flex flex-col gap-2 shrink-0">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[clamp(10px,2.8vw,11px)] font-black uppercase rounded-md tracking-wider border border-orange-500/20">{idiomaSelecionado === "PT" ? "Reposição" : idiomaSelecionado === "ES" ? "Reposición" : "Makeup"}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 border-l-2 border-orange-500 pl-2 py-0.5">
                          <p className="text-[clamp(13px,3.6vw,15px)] text-white font-bold">{idiomaSelecionado === "PT" ? "Hoje às 18:30" : idiomaSelecionado === "ES" ? "Hoy a las 18:30" : "Today at 18:30"}</p>
                        </div>
                        <button 
                          onClick={() => setModalAgenda('LOCK_12H')}
                          className="w-full py-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white text-[clamp(12px,3.5vw,16px)] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none min-w-0"
                        >
                          {idiomaSelecionado === "PT" ? "Cancelar Sessão" : idiomaSelecionado === "ES" ? "Cancelar Sesión" : "Cancel Session"}
                        </button>
                      </div>

                      {/* 2º CARD CRONOLÓGICO: DATA SEGUINTE (REGULAR VÁLIDO) */}
                      <div className="bg-cyan-500/[0.02] border border-cyan-500/10 p-3 rounded-xl flex flex-col gap-2 shrink-0">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[clamp(10px,2.8vw,11px)] font-black uppercase rounded-md tracking-wider border border-cyan-500/20">{idiomaSelecionado === "PT" ? "Regular" : idiomaSelecionado === "ES" ? "Regular" : "Regular"}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 border-l-2 border-cyan-500 pl-2 py-0.5">
                          <p className="text-[clamp(13px,3.6vw,15px)] text-white font-bold">{idiomaSelecionado === "PT" ? "22/06/2026 às 19:30" : idiomaSelecionado === "ES" ? "22/06/2026 a las 19:30" : "06/22/2026 at 19:30"}</p>
                        </div>
                        <button 
                          onClick={() => setModalAgenda('SUCCESS_REGULAR')}
                          className="w-full py-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white text-[clamp(12px,3.5vw,16px)] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none min-w-0"
                        >
                          {idiomaSelecionado === "PT" ? "Cancelar Sessão" : idiomaSelecionado === "ES" ? "Cancelar Sesión" : "Cancel Session"}
                        </button>
                      </div>

                      {/* 3º CARD CRONOLÓGICO: DATA FUTURA (REPOSIÇÃO NO PRAZO / GAMEFICADO) */}
                      <div className="bg-orange-500/[0.02] border border-orange-500/10 p-3 rounded-xl flex flex-col gap-2 shrink-0">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[clamp(10px,2.8vw,11px)] font-black uppercase rounded-md tracking-wider border border-orange-500/20">{idiomaSelecionado === "PT" ? "Reposição" : idiomaSelecionado === "ES" ? "Reposición" : "Makeup"}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 border-l-2 border-orange-500 pl-2 py-0.5">
                          <p className="text-[clamp(13px,3.6vw,15px)] text-white font-bold">{idiomaSelecionado === "PT" ? "26/06/2026 às 15:00" : idiomaSelecionado === "ES" ? "26/06/2026 a las 15:00" : "06/26/2026 at 15:00"}</p>
                        </div>
                        <button 
                          onClick={() => setModalAgenda('ALERT_REPOSICAO_LOSS')}
                          className="w-full py-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white text-[clamp(12px,3.5vw,16px)] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none min-w-0"
                        >
                          {idiomaSelecionado === "PT" ? "Cancelar Sessão" : idiomaSelecionado === "ES" ? "Cancelar Sesión" : "Cancel Session"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-0 bg-transparent shrink-0">
                  <button 
                    onClick={() => { setGavetaTipoAulaAberta(true); }}
                    className="w-full py-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white font-mono font-black rounded-xl text-[clamp(14px,4vw,22px)] uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xl shadow-slate-950/20 min-h-[48px]"
                  >
                    {idiomaSelecionado === "PT" ? "Agendar Nova Sessão" : idiomaSelecionado === "ES" ? "Programar Nueva Sesión" : "Book New Session"}
                  </button>
                </div>
              </div>
            )}

            {/* GAVETA SELETORA DE TIPO DE AULA (REGULAR VS REPOSIÇÃO) */}
            {gavetaTipoAulaAberta && (
              <div 
                onClick={() => setGavetaTipoAulaAberta(false)} 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col justify-end transition-all duration-200 cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-[#070d19] border-t border-white/[0.06] rounded-t-2xl p-5 w-full shadow-2xl flex flex-col gap-4 cursor-default animate-slide-up"
                >
                  <div onClick={() => setGavetaTipoAulaAberta(false)} className="w-full py-1 -mt-2 flex justify-center items-center cursor-pointer">
                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                  </div>

                  <div className="flex flex-col text-center gap-1">
                    <h3 className="text-[clamp(13px,4vw,15px)] font-mono font-black uppercase tracking-wider text-white">
                      {idiomaSelecionado === "PT" ? "Selecione o Tipo de Sessão" : idiomaSelecionado === "ES" ? "Seleccione el Tipo de Sesión" : "Select Session Type"}
                    </h3>
                    <p className="text-[clamp(11px,3.2vw,13px)] text-slate-400">
                      {idiomaSelecionado === "PT" ? "Escolha como deseja consumir seus créditos de agendamento" : idiomaSelecionado === "ES" ? "Elija cómo desea consumir sus créditos de programación" : "Choose how you want to use your scheduling credits"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-1">
                    {((window as any)._filtroAgenda || 'regular') === 'reposicao' ? (
                      /* FLUXO FILTRADO PARA REPOSIÇÃO DIRETA */
                      <button 
                        onClick={() => { setTipoAgendamento('REPOSICAO'); setGavetaTipoAulaAberta(false); setGavetaCalendarioAberta(true); }}
                        className="w-full p-3 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
                      >
                        <div className="w-4 h-4 bg-transparent border-2 border-orange-400 rounded-full flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /></div>
                        <div className="flex flex-col font-mono text-left">
                          <span className="text-xs font-black text-white uppercase tracking-wider">{idiomaSelecionado === "PT" ? "Consumir Crédito de Reposição" : idiomaSelecionado === "ES" ? "Consumir Crédito de Reposición" : "Use Makeup Credit"}</span>
                          <span className="text-[10px] text-slate-400">{idiomaSelecionado === "PT" ? "Agendar aula extra gerada por cancelamento prévio" : idiomaSelecionado === "ES" ? "Programar clase extra generada por cancelación previa" : "Schedule extra class from previous cancellation"}</span>
                        </div>
                      </button>
                    ) : (
                      /* FLUXO COM LISTAGEM COMERCIAL EXPANDIDA SEM ROLAGEM */
                      <div className="flex flex-col gap-2 w-full text-left">
                        
                        {/* PLANO 1: COLETIVO GRUPO */}
                        <button 
                          onClick={() => { setTipoAgendamento('REGULAR'); setModalidadeSelecionada('grupo'); setGavetaTipoAulaAberta(false); setGavetaCalendarioAberta(true); }}
                          className="w-full p-2.5 bg-slate-900/60 border border-white/[0.03] rounded-xl flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
                        >
                          <div className="w-3.5 h-3.5 bg-transparent border-2 border-emerald-500/40 rounded-full flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /></div>
                          <div className="flex flex-col font-mono text-left">
                            <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider">{idiomaSelecionado === "PT" ? "Plano Coletivo em Grupo" : idiomaSelecionado === "ES" ? "Plan Colectivo en Grupo" : "Colective Group Plan"}</span>
                            <span className="text-[9.5px] text-slate-400 leading-tight">{idiomaSelecionado === "PT" ? "Aulas dinâmicas e interativas com a comunidade" : idiomaSelecionado === "ES" ? "Clases dinámicas e interactivas con la comunidad" : "Dynamic and interactive community classes"}</span>
                          </div>
                        </button>

                        {/* PLANO 2: PACK ACUMULATIVO GRUPO */}
                        <button 
                          onClick={() => { setTipoAgendamento('REGULAR'); const padraoComSaldo = Object.keys(saldosDoAluno).find(key => saldosDoAluno[key] > 0) || 'vip_std'; setModalidadeSelecionada(padraoComSaldo); setGavetaTipoAulaAberta(false); setGavetaCalendarioAberta(true); }}
                          className="w-full p-2.5 bg-slate-900/60 border border-white/[0.03] rounded-xl flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
                        >
                          <div className="w-3.5 h-3.5 bg-transparent border-2 border-teal-500/40 rounded-full flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" /></div>
                          <div className="flex flex-col font-mono text-left">
                            <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider">{idiomaSelecionado === "PT" ? "Pack Acumulativo Grupo" : idiomaSelecionado === "ES" ? "Pack Acumulativo Grupo" : "Accumulative Group Pack"}</span>
                            <span className="text-[9.5px] text-slate-400 leading-tight">{idiomaSelecionado === "PT" ? "Aulas avulsas em grupo sob demanda" : idiomaSelecionado === "ES" ? "Clases sueltas en grupo bajo demanda" : "On-demand single group classes"}</span>
                          </div>
                        </button>

                        {/* PLANO 3: VIP STANDARD */}
                        <button 
                          onClick={() => { setTipoAgendamento('REGULAR'); setModalidadeSelecionada('vip_std'); setGavetaTipoAulaAberta(false); setGavetaCalendarioAberta(true); }}
                          className="w-full p-2.5 bg-slate-900/60 border border-white/[0.03] rounded-xl flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
                        >
                          <div className="w-3.5 h-3.5 bg-transparent border-2 border-amber-500/40 rounded-full flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /></div>
                          <div className="flex flex-col font-mono text-left">
                            <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider">VIP Standard</span>
                            <span className="text-[9.5px] text-slate-400 leading-tight">{idiomaSelecionado === "PT" ? "Foco individualizado com professor exclusivo" : idiomaSelecionado === "ES" ? "Enfoque individualizado con profesor exclusivo" : "One-on-one focus with an exclusive teacher"}</span>
                          </div>
                        </button>

                        {/* PLANO 4: PACK VIP STANDARD */}
                        <button 
                          onClick={() => { setTipoAgendamento('REGULAR'); setModalidadeSelecionada('acumulador_vip_std'); setGavetaTipoAulaAberta(false); setGavetaCalendarioAberta(true); }}
                          className="w-full p-2.5 bg-slate-900/60 border border-white/[0.03] rounded-xl flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
                        >
                          <div className="w-3.5 h-3.5 bg-transparent border-2 border-orange-500/40 rounded-full flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /></div>
                          <div className="flex flex-col font-mono text-left">
                            <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider">{idiomaSelecionado === "PT" ? "Pack VIP Standard" : idiomaSelecionado === "ES" ? "Pack VIP Standard" : "VIP Standard Pack"}</span>
                            <span className="text-[9.5px] text-slate-400 leading-tight">{idiomaSelecionado === "PT" ? "Créditos avulsos premium acumuláveis" : idiomaSelecionado === "ES" ? "Créditos sueltos premium acumulables" : "Premium cumulative single credits"}</span>
                          </div>
                        </button>

                        {/* PLANO 5: VIP PRO CORPORATIVO */}
                        <button 
                          onClick={() => { setTipoAgendamento('REGULAR'); setModalidadeSelecionada('vip_pro'); setGavetaTipoAulaAberta(false); setGavetaCalendarioAberta(true); }}
                          className="w-full p-2.5 bg-slate-900/60 border border-white/[0.03] rounded-xl flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
                        >
                          <div className="w-3.5 h-3.5 bg-transparent border-2 border-cyan-500/40 rounded-full flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /></div>
                          <div className="flex flex-col font-mono text-left">
                            <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider">VIP Pro</span>
                            <span className="text-[9.5px] text-slate-400 leading-tight">{idiomaSelecionado === "PT" ? "Imersão executiva de alta performance de negócios" : idiomaSelecionado === "ES" ? "Inmersión ejecutiva de alto rendimiento de negocios" : "High-performance executive business immersion"}</span>
                          </div>
                        </button>

                        {/* PLANO 6: PARTICULAR FLEX */}
                        <button 
                          onClick={() => { setTipoAgendamento('REGULAR'); setModalidadeSelecionada('avulsa'); setGavetaTipoAulaAberta(false); setGavetaCalendarioAberta(true); }}
                          className="w-full p-2.5 bg-slate-900/60 border border-white/[0.03] rounded-xl flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform"
                        >
                          <div className="w-3.5 h-3.5 bg-transparent border-2 border-indigo-500/40 rounded-full flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /></div>
                          <div className="flex flex-col font-mono text-left">
                            <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider">{idiomaSelecionado === "PT" ? "Aulas Individuais Flex" : idiomaSelecionado === "ES" ? "Clases Individuales Flex" : "Individual Flex Classes"}</span>
                            <span className="text-[9.5px] text-slate-400 leading-tight">{idiomaSelecionado === "PT" ? "Packs acumulativos sob demanda para sua rotina" : idiomaSelecionado === "ES" ? "Packs acumulativos bajo demanda para su rutina" : "On-demand cumulative packs for your routine"}</span>
                          </div>
                        </button>

                      </div>
                    )}
                  </div>
                  
                  {/* ESPAÇADOR DE SEGURANÇA PARA LIMITE DO RODAPÉ REAL */}
                  <div className="w-full h-10 shrink-0 pointer-events-none" />

                </div>
              </div>
            )}

            {/* GAVETAS INTERATIVAS DE SUCESSO NO AGENDAMENTO PREMIUM */}
            {sucessoAgendamento !== 'CLOSED' && (
              <div 
                onClick={() => { setSucessoAgendamento('CLOSED'); setEtapaAgendamento(0); setAbaAtiva('agenda'); }} 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col justify-end transition-all duration-200 cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-[#070d19] border-t border-white/[0.06] rounded-t-2xl p-6 w-full shadow-2xl flex flex-col gap-5 cursor-default animate-slide-up"
                >
                  <div onClick={() => { setSucessoAgendamento('CLOSED'); setEtapaAgendamento(0); setAbaAtiva('agenda'); }} className="w-full py-1 -mt-3 flex justify-center items-center cursor-pointer">
                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                  </div>

                  {sucessoAgendamento === 'REGULAR' && (
                    <div className="flex flex-col items-center text-center gap-3 py-2">
                      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full shadow-xl shadow-emerald-500/5">
                        <CheckCircle size={26} />
                      </div>
                      <h3 className="text-[clamp(15px,4.5vw,17px)] font-mono font-black uppercase tracking-wide text-white mt-1">
                        {idiomaSelecionado === "PT" ? "Sessão Regular Confirmada!" : idiomaSelecionado === "ES" ? "¡Sesión Regular Confirmada!" : "Regular Session Confirmed!"}
                      </h3>
                      <p className="text-[clamp(12px,3.5vw,13.5px)] text-slate-400 leading-relaxed max-w-[90%]">
                        {idiomaSelecionado === "PT" ? "Seu compromisso com o próximo nível foi selado. Nos vemos na sala de alta performance!" :
                         idiomaSelecionado === "ES" ? "Su compromiso con el siguiente nivel ha sido sellado. ¡Nos vemos na sala de alta performance!" :
                         "Your commitment to the next level has been sealed. See you in the high-performance room!"}
                      </p>
                      
                      <div className="w-full bg-slate-900/60 border border-white/[0.03] rounded-xl p-3.5 mt-2 flex flex-col gap-1 font-mono">
                        <div className="flex justify-between text-[clamp(11px,3.2vw,15px)] text-orange-400 uppercase font-bold tracking-wider">
                          <span>{idiomaSelecionado === "PT" ? "Categoria" : idiomaSelecionado === "ES" ? "Categoría" : "Category"}</span>
                          <span className="text-orange-400 font-black">{idiomaSelecionado === "PT" ? "Sessão Regular" : idiomaSelecionado === "ES" ? "Sesión Regular" : "Regular Session"}</span>
                        </div>
                        <div className="flex justify-between text-[clamp(13px,3.8vw,18px)] text-white font-black mt-1">
                          <span>{idiomaSelecionado === "PT" ? "Data & Horário" : idiomaSelecionado === "ES" ? "Fecha y Hora" : "Date & Time"}</span>
                          <span>
                            {idiomaSelecionado === "EN" 
                              ? `${mesAgendamento === 6 ? '06' : '07'}/${diaSelecionado}/2026 at ${horarioSelecionado}` 
                              : `${diaSelecionado}/${mesAgendamento === 6 ? '06' : '07'}/2026 ${idiomaSelecionado === "ES" ? "a las" : "às"} ${horarioSelecionado}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {sucessoAgendamento === 'REPOSICAO' && (
                    <div className="flex flex-col items-center text-center gap-3 py-2">
                      <div className="p-3.5 bg-purple-500/10 border border-orange-500/20 text-purple-400 rounded-full shadow-xl shadow-purple-500/5">
                        <CheckCircle size={26} />
                      </div>
                      <h3 className="text-[clamp(15px,4.5vw,17px)] font-mono font-black uppercase tracking-wide text-white mt-1">
                        {idiomaSelecionado === "PT" ? "Reposição Agendada!" : idiomaSelecionado === "ES" ? "¡Reposición Programada!" : "Makeup Scheduled!"}
                      </h3>
                      <p className="text-[clamp(12px,3.5vw,13.5px)] text-slate-400 leading-relaxed max-w-[90%]">
                        {idiomaSelecionado === "PT" ? "Excelente! Você salvou o seu crédito dentro do prazo e garantiu o seu ritmo de evolução intacto." :
                         idiomaSelecionado === "ES" ? "¡Excelente! Guardó su crédito dentro del plazo y aseguró que su ritmo de evolución se mantenga intacto." :
                         "Excellent! You saved your credit on time and kept your evolution momentum intact."}
                      </p>
                      
                      <div className="w-full bg-slate-900/60 border border-white/[0.03] rounded-xl p-3.5 mt-2 flex flex-col gap-1 font-mono">
                        <div className="flex justify-between text-[clamp(11px,3.2vw,15px)] text-orange-400 uppercase font-bold tracking-wider">
                          <span>{idiomaSelecionado === "PT" ? "Categoria" : idiomaSelecionado === "ES" ? "Categoría" : "Category"}</span>
                          <span className="text-orange-400 font-black">{idiomaSelecionado === "PT" ? "Reposição Ativa" : idiomaSelecionado === "ES" ? "Reposición Activa" : "Active Makeup"}</span>
                        </div>
                        <div className="flex justify-between text-[clamp(13px,3.8vw,18px)] text-white font-black mt-1">
                          <span>{idiomaSelecionado === "PT" ? "Data & Horário" : idiomaSelecionado === "ES" ? "Fecha y Hora" : "Date & Time"}</span>
                          <span>
                            {idiomaSelecionado === "EN" 
                              ? `${mesAgendamento === 6 ? '06' : '07'}/${diaSelecionado}/2026 at ${horarioSelecionado}` 
                              : `${diaSelecionado}/${mesAgendamento === 6 ? '06' : '07'}/2026 ${idiomaSelecionado === "ES" ? "a las" : "às"} ${horarioSelecionado}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => { setSucessoAgendamento('CLOSED'); setEtapaAgendamento(0); setAbaAtiva('inicio'); }} 
                    className="w-full py-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white font-mono font-black rounded-xl text-[clamp(14px,4vw,22px)] uppercase tracking-wider cursor-pointer transition-colors shadow-xl shadow-slate-950/20 min-h-[48px] flex items-center justify-center"
                  >
                    {idiomaSelecionado === "PT" ? "Bora Praticar" : idiomaSelecionado === "ES" ? "Vamos a Practicar" : "Start Practice"}
                  </button>
                </div>
              </div>
            )}

            {/* GAVETAS INTERATIVAS DE CANCELAMENTO PREMIUM - DOIS MOMENTOS */}
            {modalAgenda !== 'CLOSED' && etapaAgendamento === 0 && (
              <div 
                onClick={() => setModalAgenda('CLOSED')} 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-end transition-all duration-200 cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-[#070d19] border-t border-white/[0.06] rounded-t-2xl p-5 w-full shadow-2xl flex flex-col gap-4 cursor-default animate-slide-up"
                >
                  <div onClick={() => setModalAgenda('CLOSED')} className="w-full py-1 -mt-2 flex justify-center items-center cursor-pointer">
                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                  </div>
                  
                  {/* MOMENTO DE CHECAGEM DO CARD REGULAR (CONFIRMAÇÃO EM DOIS PASSOS) */}
                  {modalAgenda === 'SUCCESS_REGULAR' && (
                    <div className="flex flex-col items-center text-center gap-2 py-1">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full">
                        <AlertTriangle size={20} />
                      </div>
                      <h3 className="text-[clamp(13px,3.8vw,18px)] font-mono font-black uppercase tracking-wider text-white mt-1">
                        {idiomaSelecionado === "PT" ? "Confirmar Cancelamento?" : idiomaSelecionado === "ES" ? "¿Confirmar Cancelación?" : "Confirm CANCELLATION?"}
                      </h3>
                      <p className="text-[clamp(12px,3.4vw,15px)] text-white font-medium leading-relaxed max-w-[95%]">
                        {idiomaSelecionado === "PT" ? (
                          <>Você está solicitando o cancelamento desta <span className="text-orange-400 font-black">Sessão Regular</span>. Se prosseguir, este crédito se transformará em uma <span className="text-orange-400 font-black">Reposição</span> e você terá até 5 dias para reagendá-la.</>
                        ) : idiomaSelecionado === "ES" ? (
                          <>Está solicitando la cancelación de esta <span className="text-orange-400 font-black">Sesión Regular</span>. Si continúa, este crédito se convertirá en una <span className="text-orange-400 font-black">Reposición</span> y tendrá hasta 5 días para programarla de nuevo.</>
                        ) : (
                          <>You are requesting to cancel this <span className="text-orange-400 font-black">Regular Session</span>. If you proceed, this credit will become a <span className="text-orange-400 font-black">Makeup Session</span> and you will have up to 5 days to reschedule it.</>
                        )}
                      </p>
                      <div className="w-full flex flex-col gap-2 mt-3">
                        <button 
                          onClick={() => {
                            const msg = idiomaSelecionado === "PT" ? "Sessão Regular cancelada com sucesso!" : idiomaSelecionado === "ES" ? "¡Sesión Regular cancelada con éxito!" : "Regular Session canceled successfully!";
                            alert(msg);
                            setModalAgenda('CLOSED');
                          }} 
                          className="w-full py-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white text-[clamp(12px,3.5vw,16px)] font-mono font-black uppercase tracking-wider rounded-xl transition-all select-none min-h-[48px]"
                        >
                          {idiomaSelecionado === "PT" ? "Sim, Cancelar Sessão" : idiomaSelecionado === "ES" ? "Sí, Cancelar Sesión" : "Yes, Cancel Session"}
                        </button>
                        <button 
                          onClick={() => setModalAgenda('CLOSED')} 
                          className="w-full py-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white text-[clamp(12px,3.5vw,16px)] font-mono font-black uppercase tracking-wider cursor-pointer transition-all select-none min-h-[48px]"
                        >
                          {idiomaSelecionado === "PT" ? "Desistir e Manter o Ritmo" : idiomaSelecionado === "ES" ? "Desistir y Mantener el Ritmo" : "Never mind, Keep the Momentum"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MOMENTO DE CHECAGEM DO CARD DE REPOSIÇÃO NO PRAZO (CONFIRMAÇÃO EM DOIS PASSOS) */}
                  {modalAgenda === 'ALERT_REPOSICAO_LOSS' && (
                    <div className="flex flex-col items-center text-center gap-2 py-1">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full">
                        <AlertTriangle size={20} />
                      </div>
                      <h3 className="text-[clamp(13px,3.8vw,18px)] font-mono font-black uppercase tracking-wider text-white mt-1">
                        {idiomaSelecionado === "PT" ? "Remarcar Reposição?" : idiomaSelecionado === "ES" ? "¿Reprogramar Reposición?" : "Reschedule Makeup?"}
                      </h3>
                      <p className="text-[clamp(12px,3.4vw,15px)] text-white font-medium leading-relaxed max-w-[95%]">
                        {idiomaSelecionado === "PT" ? (
                          <>Atenção: Esta sessão <span className="text-orange-400 font-black">já é uma reposição</span>. Para não quebrar o ritmo da sua evolução, evite remarcações consecutivas. O prazo limite para uso deste crédito continua correndo a partir da data original.</>
                        ) : idiomaSelecionado === "ES" ? (
                          <>Atención: Esta sesión <span className="text-orange-400 font-black">ya es una reposición</span>. Para no interrumpir el ritmo de su evolución, evite reprogramaciones consecutivas. El plazo límite para el uso de este crédito sigue corriendo a partir de la fecha original.</>
                        ) : (
                          <>Notice: This session <span className="text-orange-400 font-black">is already a makeup</span>. To maintain your momentum and progress, avoid consecutive rescheduling. The deadline to use this credit continues running from the original date.</>
                        )}
                      </p>
                      <div className="w-full flex flex-col gap-2 mt-3">
                        <button 
                          onClick={() => {
                            const msg = idiomaSelecionado === "PT" ? "Cancelamento confirmado. O prazo original desta reposição continua ativo." : idiomaSelecionado === "ES" ? "Cancelación confirmada. El plazo original de esta reposición sigue activo." : "Cancellation confirmed. The original deadline for this makeup remains active.";
                            alert(msg);
                            setModalAgenda('CLOSED');
                          }} 
                          className="w-full py-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white text-[clamp(12px,3.5vw,16px)] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none min-h-[48px]"
                        >
                          {idiomaSelecionado === "PT" ? "Sim, Confirmar e Liberar Vaga" : idiomaSelecionado === "ES" ? "Sí, Confirmar y Liberar Cupo" : "Yes, Confirm and Release Slot"}
                        </button>
                        <button 
                          onClick={() => setModalAgenda('CLOSED')} 
                          className="w-full py-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white text-[clamp(12px,3.5vw,16px)] font-mono font-black uppercase tracking-wider cursor-pointer transition-all select-none min-h-[48px]"
                        >
                          {idiomaSelecionado === "PT" ? "Manter meu Cronograma" : idiomaSelecionado === "ES" ? "Mantener mi Cronograma" : "Keep my Schedule"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MOMENTO DE BLOQUEIO OPERACIONAL - MENOS DE 12H (AÇÃO ÚNICA INFORMATIVA) */}
                  {modalAgenda === 'LOCK_12H' && (
                    <div className="flex flex-col items-center text-center gap-2 py-1">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full">
                        <AlertTriangle size={20} />
                      </div>
                      <h3 className="text-[clamp(13px,3.8vw,18px)] font-mono font-black uppercase tracking-wider text-white mt-1">
                        {idiomaSelecionado === "PT" ? "Cancelamento Retido" : idiomaSelecionado === "ES" ? "Cancelación Retenida" : "Cancellation Locked"}
                      </h3>
                      <p className="text-[clamp(12px,3.4vw,15px)] text-white font-medium leading-relaxed max-w-[95%]">
                        {idiomaSelecionado === "PT" ? (
                          <>As diretrizes operacionais exigem o mínimo de <span className="text-orange-400 font-black">12 horas de antecedência</span> para cancelamentos. O prazo limite expirou e esta vaga não pode mais ser alterada.</>
                        ) : idiomaSelecionado === "ES" ? (
                          <>Las directrizes operativas exigen un mínimo de <span className="text-orange-400 font-black">12 horas de anticipación</span> para cancelaciones. El plazo límite ha expirado y este cupo ya no se puede modificar.</>
                        ) : (
                          <>Operational guidelines require a minimum of <span className="text-orange-400 font-black">12 hours notice</span> for cancellations. The deadline has expired and this slot can no longer be changed.</>
                        )}
                      </p>
                      <button onClick={() => setModalAgenda('CLOSED')} className="w-full py-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white text-[clamp(13px,3.6vw,17px)] font-mono font-black uppercase tracking-wider rounded-xl transition-all select-none min-h-[48px]">
                        {idiomaSelecionado === "PT" ? "Entendido" : idiomaSelecionado === "ES" ? "Entendido" : "Got it"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 1: SELEÇÃO DE CATEGORIA */}
            {etapaAgendamento === 1 && (
              <div className="flex flex-col justify-between h-full py-1 animate-fade-in overflow-hidden">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <button onClick={() => setEtapaAgendamento(0)} className="text-slate-400 font-mono text-[clamp(11px,3.2vw,15px)] uppercase tracking-wider bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/[0.04] cursor-pointer">← Voltar</button>
                    <span className="text-[clamp(11px,3vw,12px)] font-mono font-bold text-slate-500 uppercase tracking-wider">Etapa 1 de 3</span>
                  </div>
                  <div className="px-1">
                    <h2 className="text-[clamp(15px,4.5vw,17px)] font-mono font-black uppercase text-white tracking-wide">Categoria da Aula</h2>
                    <p className="text-[clamp(12px,3.4vw,13px)] text-slate-400 mt-0.5">Escolha qual tipo de crédito deseja utilizar.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div 
                      onClick={() => { setTipoAgendamento('REGULAR'); setEtapaAgendamento(2); }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[clamp(12px,3.5vw,14px)] font-mono font-black uppercase tracking-wider text-slate-300`}>Sessão Regular</span>
                        <span className="px-2 py-0.5 font-mono text-[clamp(10px,2.8vw,11px)] rounded-md font-bold bg-slate-800 text-slate-400">4 Restantes</span>
                      </div>
                      <p className="text-[clamp(11px,3.2vw,13px)] text-slate-400 leading-relaxed">Utilize seus créditos de recorrência mensal padrão do ciclo vigente.</p>
                    </div>
                    <div 
                      onClick={() => { setTipoAgendamento('REPOSICAO'); setEtapaAgendamento(2); }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[clamp(12px,3.5vw,14px)] font-mono font-black uppercase tracking-wider text-slate-300`}>Sessão de Reposição</span>
                        <span className="px-2 py-0.5 font-mono text-[clamp(10px,2.8vw,11px)] rounded-md font-bold bg-slate-800 text-slate-400">1 Disponível</span>
                      </div>
                      <p className="text-[clamp(11px,3.2vw,13px)] text-slate-400 leading-relaxed">Compense ausências justificadas (Permitido ultrapassar a data de renovação).</p>
                    </div>
                  </div>
                  
                  {/* ESPAÇADOR DE SEGURANÇA PARA LIMITE DO RODAPÉ REAL */}
                  <div className="w-full h-10 shrink-0 pointer-events-none" />

                </div>
              </div>
            )}

            {/* GAVETA DO CALENDÁRIO (ESCOLHA O DIA) EM BOTTOMSHEET */} 
            {gavetaCalendarioAberta && (
              <div 
                onClick={() => setGavetaCalendarioAberta(false)} 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col justify-end transition-all duration-200 cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-[#070d19] border-t border-white/[0.06] rounded-t-2xl p-5 w-full shadow-2xl flex flex-col gap-4 cursor-default max-h-[85vh] overflow-y-auto animate-slide-up"
                >
                  <div onClick={() => setGavetaCalendarioAberta(false)} className="w-full py-1 -mt-2 flex justify-center items-center cursor-pointer">
                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                  </div>
              <div className="flex flex-col justify-between h-full py-1 animate-fade-in overflow-hidden">
                <div className="flex-1 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <button onClick={() => { setGavetaCalendarioAberta(false); setGavetaTipoAulaAberta(true); }} className="text-slate-400 font-mono text-[clamp(11px,3.2vw,15px)] uppercase tracking-wider bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/[0.04] cursor-pointer">
                      {idiomaSelecionado === "PT" ? "← Voltar" : idiomaSelecionado === "ES" ? "← Volver" : "← Back"}
                    </button>
                    <span className="text-[clamp(11px,3vw,12px)] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      {idiomaSelecionado === "PT" ? "Passo 2 de 3" : idiomaSelecionado === "ES" ? "Paso 2 de 3" : "Step 2 of 3"}
                    </span>
                  </div>
                  
                  <div className="px-1 flex justify-between items-end">
                    <div>
                      <h2 className="text-[clamp(15px,4.5vw,17px)] font-mono font-black uppercase text-white tracking-wide">
                        {idiomaSelecionado === "PT" ? "Selecione a Data" : idiomaSelecionado === "ES" ? "Seleccione la Fecha" : "Select the Date"}
                      </h2>
                      <p className="text-[clamp(12px,3.4vw,13px)] text-orange-400 mt-0.5">
                        {idiomaSelecionado === "PT" ? "Limite do ciclo atual: " : idiomaSelecionado === "ES" ? "Límite del ciclo actual: " : "Current cycle deadline: "}
                        <span className="text-orange-400 font-bold">{idiomaSelecionado === "EN" ? "06/25" : "25/06"}</span>
                      </p>
                    </div>
                    {/* NAVEGAÇÃO INTELEGENTE POR SETAS SEM ESTADOS ENGESSADOS */}
                    <div className="flex items-center gap-1 bg-slate-900/80 border border-white/[0.05] p-1 rounded-xl shrink-0">
                      <button 
                        type="button"
                        onClick={() => {
                          setDiaSelecionado('');
                          if (mesAgendamento === 1) { setMesAgendamento(12); }
                          else { setMesAgendamento(mesAgendamento - 1); }
                        }}
                        className="px-3 py-1 text-slate-400 hover:text-cyan-400 cursor-pointer active:scale-90 transition-all font-black text-sm bg-transparent border-none"
                      >
                        ←
                      </button>
                      <div className="w-[1px] h-4 bg-white/[0.05]" />
                      <button 
                        type="button"
                        onClick={() => {
                          setDiaSelecionado('');
                          if (mesAgendamento === 12) { setMesAgendamento(1); }
                          else { setMesAgendamento(mesAgendamento + 1); }
                        }}
                        className="px-3 py-1 text-slate-400 hover:text-cyan-400 cursor-pointer active:scale-90 transition-all font-black text-sm bg-transparent border-none"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* GRADE MENSAL DINÂMICA */} 
                  <div className="bg-gradient-to-br from-[#091527] to-[#050b14] border border-white/[0.05] p-3 rounded-2xl shadow-xl flex flex-col gap-1 mt-0.5">
                    <div className="grid grid-cols-7 gap-2 text-center border-b border-white/[0.02] pb-2">
                      {(idiomaSelecionado === "PT" ? ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'] : idiomaSelecionado === "ES" ? ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'] : ['SUN','MON','TUE','WED','THU','FRI','SAT']).map((day, idx) => (
                        <span key={idx} className="text-[clamp(11px,3vw,12px)] font-mono font-bold text-slate-500">{day}</span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-x-1.5 gap-y-2 text-center">
                      {/* RENDERIZA JUNHO OU JULHO COM BASE NO ESTADO */}
                      {mesAgendamento === 6 ? (
                        /* Junho 2026 */
                        ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'].map((d, i) => {
                          if (!d) return <div key={i} />;
                          const numDay = parseInt(d);
                          const isPast = numDay < 18;
                          const isSelected = diaSelecionado === d;
                          return (
                            <button key={i} disabled={isPast} onClick={() => setDiaSelecionado(d)} className={`aspect-square h-auto w-full flex items-center justify-center rounded-xl text-[clamp(13px,3.8vw,15px)] font-mono font-bold transition-all ${isPast ? 'text-slate-800 font-normal bg-transparent cursor-not-allowed' : isSelected ? 'bg-cyan-500 text-black font-black' : 'bg-[#0a1220] text-slate-300 cursor-pointer'}`}>
                              {d}
                            </button>
                          );
                        })
                      ) : (
                        /* Julho 2026 Protegido Dinamicamente e Trilingue */
                        ['', '', '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'].map((d, i) => {
                          if (!d) return <div key={i} />;
                          
                          const numDay = parseInt(d);
                          const hojeDiaReal = 2; // Hoje é dia 02 de Julho de 2026
                          
                          // 1. Identifica dias no passado e feriados colombianos oficiais de Julho (6 e 20)
                          const ehPassado = numDay < hojeDiaReal;
                          const ehFeriadocolombia = [6, 20].includes(numDay);
                          const isBlocked = ehPassado || ehFeriadocolombia;
                          
                          const isSelected = diaSelecionado === d;
                          
                          return (
                            <button 
                              key={i} 
                              disabled={isBlocked} 
                              onClick={() => setDiaSelecionado(d)} 
                              title={ehFeriadocolombia ? "Festivo en Colombia" : ""}
                              className={`aspect-square h-auto w-full flex items-center justify-center rounded-xl text-[clamp(13px,3.8vw,15px)] font-mono font-bold transition-all ${
                                isBlocked 
                                  ? 'text-slate-800 font-normal bg-transparent cursor-not-allowed opacity-25 line-through' 
                                  : isSelected 
                                    ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20 scale-105' 
                                    : 'bg-[#0a1220] text-slate-300 cursor-pointer active:scale-95'
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* CRITÉRIO DE TRAVA DINÂMICA FINANCEIRA NO BOTÃO AVANÇAR */}
                <div className="w-full pt-0">
                  {(() => {
                    const foraDoCiclo = (mesAgendamento === 6 && parseInt(diaSelecionado) >= 26) || mesAgendamento === 7;
                    const travaAtiva = tipoAgendamento === 'REGULAR' && foraDoCiclo;
                    
                    if (travaAtiva) {
                      return (
null
                      );
                    }
                    
                    const temDia = diaSelecionado !== '';
                    return (
                      <button 
                        disabled={!temDia}
                        onClick={() => { setGavetaCalendarioAberta(false); setGavetaHorariosAberta(true); }}
                        className={`w-full py-3.5 font-mono font-black rounded-xl text-[clamp(14px,4vw,22px)] uppercase tracking-wider transition-all flex items-center justify-center min-h-[48px] ${
                          temDia 
                                                        ? 'bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white cursor-pointer shadow-xl shadow-slate-950/20' 
                            : 'bg-slate-800/50 border-white/[0.04] text-slate-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {idiomaSelecionado === "PT" ? "Avançar para Horários" : idiomaSelecionado === "ES" ? "Continuar a Horarios" : "Proceed to Times"}
                      </button>
                    );
                  })()}
                </div>
                </div>
                </div>
              </div>
            )}

            {/* GAVETA DE HORÁRIOS EM BOTTOMSHEET (ETAPA 3) */}
            {gavetaHorariosAberta && (
              <div 
                onClick={() => setGavetaHorariosAberta(false)} 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col justify-end transition-all duration-200 cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-[#070d19] border-t border-white/[0.06] rounded-t-2xl p-5 w-full shadow-2xl flex flex-col gap-4 cursor-default max-h-[80vh] overflow-y-auto animate-slide-up"
                >
                  <div onClick={() => setGavetaHorariosAberta(false)} className="w-full py-1 -mt-2 flex justify-center items-center cursor-pointer">
                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                  </div>
              <div className="flex flex-col gap-4 justify-start h-full py-1 animate-fade-in overflow-hidden">
                <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 shrink-0">
                    <button onClick={() => { setGavetaHorariosAberta(false); setGavetaCalendarioAberta(true); }} className="text-slate-400 font-mono text-[clamp(11px,3.2vw,15px)] uppercase tracking-wider bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/[0.04] cursor-pointer">
                      {idiomaSelecionado === "PT" ? "← Voltar" : idiomaSelecionado === "ES" ? "← Volver" : "← Back"}
                    </button>
                    <span className="text-[clamp(11px,3vw,12px)] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      {idiomaSelecionado === "PT" ? "Passo 3 de 3" : idiomaSelecionado === "ES" ? "Paso 3 de 3" : "Step 3 of 3"}
                    </span>
                  </div>
                  
                  <div className="px-1 shrink-0">
                    <h2 className="text-[clamp(15px,4.5vw,17px)] font-mono font-black uppercase text-white tracking-wide">
                      {idiomaSelecionado === "PT" ? `Horários para o Dia ${diaSelecionado}/${mesAgendamento === 6 ? '06' : '07'}` : 
                       idiomaSelecionado === "ES" ? `Horarios para el Día ${diaSelecionado}/${mesAgendamento === 6 ? '06' : '07'}` : 
                       `Available Times for ${mesAgendamento === 6 ? '06' : '07'}/${diaSelecionado}`}
                    </h2>
                    <p className="text-[clamp(12px,3.4vw,13px)] text-orange-400 mt-0.5">
                      {idiomaSelecionado === "PT" ? "Arraste para ver todas as janelas disponíveis." : 
                       idiomaSelecionado === "ES" ? "Deslice para ver todas las ventanas disponibles." : 
                       "Swipe to view all available slots."}
                    </p>
                  </div>

                  {/* CONTAINER DE ROLAGEM VERTICAL DO POLEGAR - SEM ESTOURAR O BOTÃO DE BAIXO */}
                  <div className="flex-1 overflow-y-auto pb-2 scrollbar-none flex flex-col gap-2 min-h-0 px-0.5">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {[
                        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
                        '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', 
                        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
                        '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
                      ].map((h) => {
                        const isSelected = horarioSelecionado === h;
                        return (
                          <button
                            key={h}
                            onClick={() => setHorarioSelecionado(h)}
                            /* USANDO ring-2 EM VEZ DE border PARA NÃO MELECAR O LAYOUT HORIZONTAL */
                            className={`py-2.5 rounded-xl text-center font-mono text-[clamp(13px,3.8vw,15px)] font-bold transition-all cursor-pointer border border-transparent ${
                              isSelected 
                                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/10' 
                                : 'bg-slate-900/40 border-white/[0.03] text-slate-300'
                            }`}
                          >
                            {h}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SEÇÃO INFERIOR FIXA - NÃO SOFRE IMPACTO DA ROLAGEM */}
                <div className="w-full pt-0 bg-transparent shrink-0">
                  <button 
                    disabled={!horarioSelecionado}
                    onClick={() => {
                      const ehReposicao = String(tipoAgendamento).toLowerCase().includes('reposi') || String(tipoAgendamento).toLowerCase().includes('rep');
                      
                      // 🔄 VALIDAÇÃO DINÂMICA DO SUPABASE: Verifica se o aluno tem saldo real para esta modalidade
                      const saldoDisponivel = saldosDoAluno[modalidadeSelecionada || 'vip_std'] || 0;
                      
                      if (!ehReposicao && saldoDisponivel <= 0) {
                        setGavetaHorariosAberta(false); // Fecha o calendário
                        setGavetaAvisoCompraAberta(true); // Abre o Upsell Comercial
                        return;
                      }

                      // 🇨🇴 VALIDAÇÃO DE FERIADOS COLOMBIANOS OFICIAIS 2026
                      const feriadosColombia2026 = {
                        6: [15, 29],      // Junho (Corpus Christi, San Pedro)
                        7: [6, 20],       // Julho (San Pedro y San Pablo, Independencia)
                        8: [7, 17]        // Agosto (Batalla de Boyacá, Asunción de la Virgen)
                      };
                      const diasFeriadosDoMes = feriadosColombia2026[mesAgendamento] || [];
                      if (diasFeriadosDoMes.includes(Number(diaSelecionado))) {
                        alert(idiomaSelecionado === "PT" ? "Feriado na Colômbia! A HAAS Academy não opera nesta data." : idiomaSelecionado === "ES" ? "¡Festivo en Colombia! HAAS Academy no opera en esta fecha." : "Holiday in Colombia! HAAS Academy is closed on this date.");
                        return;
                      }

                      // 🕒 VALIDAÇÃO CRÍTICA DE ANTECEDÊNCIA DE 24 HORAS
                      if (horarioSelecionado) {
                        const [horasStr, minutosStr] = horarioSelecionado.split(':');
                        const dataAula = new Date(2026, mesAgendamento, Number(diaSelecionado), Number(horasStr), Number(minutosStr));
                        const agora = new Date();
                        const diferencaEmHoras = (dataAula.getTime() - agora.getTime()) / (1000 * 60 * 60);

                        if (diferencaEmHoras < 24) {
                          setGavetaHorariosAberta(false);
                          setGavetaErro24hAberta(true); // Abre o alerta de 24h igual à foto
                          return;
                        }
                      }

                      // 🕒 VALIDAÇÃO CRÍTICA DE ANTECEDÊNCIA DE 24 HORAS
                      if (horarioSelecionado) {
                        const [horasStr, minutosStr] = horarioSelecionado.split(':');
                        const dataAula = new Date(2026, mesAgendamento, Number(diaSelecionado), Number(horasStr), Number(minutosStr));
                        const agora = new Date();
                        const diferencaEmHoras = (dataAula.getTime() - agora.getTime()) / (1000 * 60 * 60);

                        if (diferencaEmHoras < 24) {
                          setGavetaHorariosAberta(false); // Fecha o calendário
                          setGavetaErro24hAberta(true);   // Abre a gaveta de erro idêntica à foto
                          return;
                        }
                      }
                      setGavetaHorariosAberta(false);
                      if (ehReposicao) {
                        setSucessoAgendamento('REPOSICAO');
                      } else {
                        setSucessoAgendamento('REGULAR');
                      }
                    }}
                    className={`w-full py-3.5 font-mono font-black rounded-xl text-[clamp(14px,4vw,22px)] uppercase tracking-wider transition-all flex items-center justify-center min-h-[48px] border ${
                      horarioSelecionado 
                                                    ? 'bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.03] text-slate-300 hover:text-white cursor-pointer shadow-xl shadow-slate-950/20' 
                        : 'bg-slate-800/50 border-white/[0.04] text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {!horarioSelecionado ? (
                      idiomaSelecionado === "PT" ? "Selecione um Horário" : idiomaSelecionado === "ES" ? "Seleccione un Horario" : "Select a Time Slot"
                    ) : (
                      idiomaSelecionado === "PT" ? "Finalizar Agendamento" : idiomaSelecionado === "ES" ? "Finalizar Programación" : "Complete Scheduling"
                    )}
                  </button>
                </div>
              </div>
                </div>
              </div>
            )}
          </div>
        )}



        {(abaAtiva as string) === 'tarefas' && (
          <div className="flex flex-col gap-4 h-full flex-1 overflow-hidden">
            
            {/* CARD DE ENVIO DE ATIVIDADE */}
            <div className="bg-gradient-to-br from-[#091527] to-[#050b14] border border-white/[0.05] p-4 rounded-2xl shadow-xl flex flex-col shrink-0">
              <span className="text-[clamp(11px,3.2vw,15px)] font-mono font-black text-white uppercase tracking-wider block mb-1">{txt.taskTitle}</span>
              <p className="text-[clamp(12px,3.5vw,13.5px)] text-slate-300 mb-3 leading-relaxed">{txt.taskDesc}</p>
              
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*,application/pdf"
                className="hidden"
              />

              <button 
                onClick={acionarInputNativo}
                disabled={uploading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-xl text-[clamp(13px,3.8vw,15px)] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shrink-0 min-h-[44px] border-none shadow-lg shadow-orange-950/20"
              >
                                {txt.btnPhoto}
              </button>

              {/* FILA DE ARQUIVOS */}
              {arquivosSelecionados.length > 0 && (
                <div className="mt-3 bg-slate-950/60 border border-white/[0.05] rounded-xl p-3 flex flex-col gap-2 animate-fadeIn max-h-[110px] overflow-y-auto">
                  <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">{txt.selectedFiles} ({arquivosSelecionados.length}/3):</span>
                  <div className="flex flex-col gap-1.5">
                    {arquivosSelecionados.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 font-mono bg-white/[0.02] p-1.5 rounded border border-white/[0.03]">
                        <FileText size={12} className="text-emerald-400" />
                        <span className="truncate flex-1 font-bold">{file.name}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleEnviarFila}
                    disabled={uploading}
                    className="w-full py-2.5 mt-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-xl text-[clamp(12px,3.5vw,14px)] uppercase tracking-wider border-none cursor-pointer min-h-[38px]"
                  >
                    {uploading ? txt.btnUploading : txt.btnSubmit}
                  </button>
                </div>
              )}

              {erroMaxArquivos && (
                <div className="mt-2 flex items-center gap-1.5 text-red-400 text-[10px] font-black bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20 animate-fadeIn">
                  <AlertTriangle size={12} /> {txt.errorMax}
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-2 flex items-center gap-1.5 w-full justify-center text-emerald-400 text-[10px] font-bold bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20 animate-fadeIn">
                  <CheckCircle size={12} /> {txt.uploadOk}
                </div>
              )}
            </div>

            {/* RADAR CARD EXPANSIVO (FLEX-1 FORCE ELE A PREENCHER TODO O ESPAÇO ATÉ O RODAPÉ) */}
            <div className="bg-gradient-to-br from-[#091527] to-[#050b14] border border-white/[0.05] p-4 rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
              <div className="w-full flex items-center justify-between mb-2 shrink-0">
                <span className="text-[clamp(11px,3.2vw,15px)] font-mono font-black text-white uppercase tracking-wider block">{txt.radarTitle}</span>
                <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-black flex items-center gap-1"><TrendingUp size={10} /> {txt.radarLive}</span>
              </div>
              
              {/* O container interno do pentágono agora cresce ocupando o espaço central da teia */}
              <div className="flex-1 flex items-center justify-center relative w-full">
                <div className="w-28 h-28 rounded-full border-4 border-dashed border-purple-500/20 flex items-center justify-center relative scale-110">
                  <div className="absolute inset-3 rounded-full bg-purple-500/10 border border-purple-500/30" />
                  <span className="text-[9px] font-mono font-black text-purple-400/40">HAAS</span>
                  
                  {/* AS 5 PONTAS DO PENTÁGONO RIGIDAMENTE ACOPLADAS */}
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap">{txt.pFala}</span>
                  <span className="absolute top-3 -right-12 text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap">{txt.pEscuta}</span>
                  <span className="absolute -bottom-4 -right-4 text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap">{txt.pGramatica}</span>
                  <span className="absolute -bottom-4 -left-4 text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap">{txt.pEscrita}</span>
                  <span className="absolute top-3 -left-12 text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap">{txt.pLeitura}</span>
                </div>
              </div>

              <p className="text-[clamp(11px,3.2vw,15px)] text-slate-400 font-medium text-center mt-2 shrink-0">{txt.radarDesc}</p>
            </div>
          </div>
        )}




        {/* ABA 0: DASHBOARD PRINCIPAL */} 
        {((abaAtiva as string) === "dashboard") && ( 
          <div className="flex flex-col flex-1 gap-4 px-0 pb-0 pt-0 overflow-y-auto scrollbar-none [&>*]:flex-1">
            {/* 1. Entrar na Aula */} 
            <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-mono font-black text-[clamp(14px,4vw,22px)] uppercase tracking-wider shadow-[0_0_25px_rgba(249,115,22,0.3)] border-[0.5px] border-orange-400/30 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"> {idiomaSelecionado === "PT" ? "Entrar na Aula" : idiomaSelecionado === "ES" ? "Entrar a la Clase" : "Enter Class"} 
            </button> 
 
            {/* 2. Foco Estratégico - Hub Mentora HAAS */} 
            <div className="bg-slate-950/40 border-[0.5px] border-white/[0.05] pt-3 pb-3 px-4 rounded-xl flex flex-col gap-[7px] w-full block clear-both backdrop-blur-md shadow-[0_0_20px_rgba(4,12,22,0.4)]"> 
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-2"> 
                <span className="text-[clamp(11px,3vw,15px)] font-mono font-black uppercase text-white tracking-wider">{idiomaSelecionado === "PT" ? "Foco Estratégico" : idiomaSelecionado === "ES" ? "Enfoque Estratégico" : "Strategic Focus"}</span> 
                <span className="text-[clamp(13px,3.5vw,18px)] font-mono font-black text-cyan-400">+150 PTS</span> 
              </div> 
              
              {/* Container do Balão + Robozinho */}
              <div className="flex flex-row items-center justify-between gap-3 mt-2">
                {/* Balão de Fala Dinâmico Estilo Mentora */}
                <div className="flex-1 bg-black/20 border-[0.5px] border-amber-500/10 p-3 rounded-xl flex items-center justify-center relative bg-black/40">
                  <p className="text-[clamp(12px,3.2vw,16px)] text-white/90 font-medium leading-relaxed">
                    {idiomaSelecionado === "PT" ? <><span className="font-bold text-amber-400">Notei que o seu ponto fraco atual é Preposições.</span> Clique para reforçar esse conteúdo!</> : idiomaSelecionado === "ES" ? <><span className="font-bold text-amber-400">Noté que tu punto débil actual são as Preposiciones.</span> ¡Haz clic para reforzar este contenido!</> : <><span className="font-bold text-amber-400">I noticed your current weak point is Prepositions.</span> Click to reinforce this content!</>}
                  </p>
                  {/* Seta do Balão apontando para o robô */}
                  <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-950 border-t border-r border-amber-500/10 rotate-45" />
                </div>

                {/* Box do Avatar da Mentora HAAS Clicável */}
                <div onClick={() => alert("Abrir Tela de Diálogo com a IA Mentora")} className="cursor-pointer transition-all active:scale-95 hover:scale-105 shrink-0">
                  <MascoteRoboAI devePiscar={roboDevePiscar} idioma={idiomaSelecionado} olharDireta={olharDireta} />
                </div>
              </div>
            </div>

 
            {/* 3. Sequência de Dias & Próxima Recompensa */} 
            <div className="grid grid-cols-2 gap-2 w-full"> 
              <button onClick={() => setAbaAtiva("perfil")} className="bg-slate-950/40 border-[0.5px] border-amber-500/10 p-5 rounded-2xl shadow-[0_0_20px_rgba(4,12,22,0.4)] backdrop-blur-md flex items-center gap-2 text-left w-full cursor-pointer active:scale-[0.98] transition-transform select-none min-w-0"> 
                <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0"><Flame className="w-5 h-5 text-amber-500" /></div> 
                <div className="flex flex-col min-w-0 truncate"> 
                  <span className="text-[clamp(13px,3.8vw,19px)] font-mono font-black text-white truncate">{idiomaSelecionado === "PT" ? "12 Dias" : idiomaSelecionado === "ES" ? "12 Días" : "12 Days"}</span> 
                  <span className="text-[clamp(9px,2.5vw,13px)] uppercase font-bold tracking-wider text-slate-300 font-black truncate">{idiomaSelecionado === "PT" ? "Consistência" : idiomaSelecionado === "ES" ? "Consistencia" : "Streak"}</span> 
                </div> 
              </button> 
              <button onClick={() => { setAbaAtiva("inicio"); setArenaAtiva(true); if(typeof setStatusRespostaMobile === "function") setStatusRespostaMobile("IDLE"); }} className="bg-slate-950/40 border-[0.5px] border-amber-500/10 p-5 rounded-2xl shadow-[0_0_20px_rgba(4,12,22,0.4)] backdrop-blur-md flex items-center gap-2 text-left w-full cursor-pointer active:scale-[0.98] transition-transform select-none min-w-0"> 
                <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0"><Gift className="w-5 h-5 text-emerald-400" /></div> 
                <div className="flex flex-col min-w-0 truncate"> 
                  <span className="text-[clamp(13px,3.8vw,19px)] font-mono font-black text-white truncate">{idiomaSelecionado === "PT" ? "Faltam 40 UT" : idiomaSelecionado === "ES" ? "Faltan 40 UT" : "40 UT Remaining"}</span> 
                  <span className="text-[clamp(9px,2.5vw,13px)] uppercase font-bold tracking-wider text-slate-300 font-black truncate">{idiomaSelecionado === "PT" ? "Aula Bônus" : idiomaSelecionado === "ES" ? "Clase de Bono" : "Bonus Class"}</span> 
                </div> 
              </button> 
            </div> 
 
            {/* Mini Calendário Semanal Acoplado */}
            <div className="w-full max-w-full overflow-hidden flex flex-col !flex-none"><MiniCalendarioSemanal setAbaAtiva={setAbaAtiva} idiomaSelecionado={idiomaSelecionado} /></div>
 
            

            {/* 4. Campo de Prática */} 
            <button onClick={() => { setAbaAtiva("inicio"); setArenaAtiva(false); }} className="w-full p-4 bg-slate-950/40 border-[0.5px] border-amber-500/10 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer active:scale-[0.98] group min-w-0 max-w-full overflow-hidden shadow-[0_0_20px_rgba(4,12,22,0.4)] backdrop-blur-md"> 
              <div className="flex items-center gap-3 min-w-0 flex-1"> 
                 
                <div className="flex flex-col text-left min-w-0 flex-1"> 
                  <span className="text-[clamp(12px,3.5vw,16px)] font-mono font-black text-white uppercase tracking-wide truncate">{idiomaSelecionado === "PT" ? "Espaço de Prática" : idiomaSelecionado === "ES" ? "Espacio de Práctica" : "Practice Space"}</span> 
                  <span className="text-[clamp(10px,2.8vw,13px)] text-cyan-100/80 font-medium whitespace-normal break-words leading-tight">{idiomaSelecionado === "PT" ? "Simulações em tempo real e desafios analíticos" : idiomaSelecionado === "ES" ? "Simulaciones en tiempo real y desafíos analíticos" : "Real-time simulations and analytical challenges"}</span> 
                </div> 
              </div> 
               
            </button> 
          </div> 
        )} 

        {/* ABA 4: PERFIL */}
        {((abaAtiva as string) === "perfil") && (
          <div className="flex-1 w-full min-h-[calc(100vh-80px)] justify-between overflow-y-auto px-0 pb-10 pt-0 flex flex-col gap-4 scrollbar-none" >
            
            {/* 1. BLOCO SUPERIOR: IDENTIDADE & RANK - CORRIGIDO NATÍVAMENTE */}
            <div className="w-full sticky top-0 z-20 bg-[#030914] bg-gradient-to-b from-[#070d19]/90 to-[#030914]/95 border-b border-white/[0.05] p-5 flex flex-col items-center text-center relative h-auto shrink-0">
              <div className="relative w-20 h-20">
                <div className="w-full h-full rounded-full border border-white/[0.08] bg-slate-900 flex items-center justify-center text-xl font-mono font-black text-white">
                  BR
                </div>
                {/* O quadradinho do idioma encostado na foto que obedece ao clique */}
                <button 
                  onClick={() => setModalIdiomaAberto(true)}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center text-[10px] font-mono font-black text-slate-300 shadow-md cursor-pointer uppercase"
                >
                  {idiomaSelecionado === "PT" ? "PT" : idiomaSelecionado === "ES" ? "ES" : "US"}
                </button>
              </div>
              
              <h2 className="text-[clamp(15px,4.5vw,17px)] font-black text-white mt-1.5 uppercase tracking-tight">Bruna Haas</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[clamp(11px,3.2vw,15px)] font-mono font-black rounded uppercase">Nível B2</span>
                <span className="text-[clamp(11px,3.2vw,15px)] font-mono font-black text-purple-400 uppercase tracking-wider font-bold">{idiomaSelecionado === 'es' ? 'Explorador' : 'Explorador'}</span>
              </div>

              <div className="w-full mt-4">
                <div className="flex justify-between items-center text-[clamp(11px,3.2vw,15px)] font-mono text-slate-500 mb-1">
                  <span>{idiomaSelecionado === "PT" ? "Progresso do Módulo" : idiomaSelecionado === "ES" ? "Progreso del Módulo" : "Module Progress"}</span>
                  <span className="text-cyan-400 font-bold">65%</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-white/[0.02]">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>

            {/* 2. BLOCO CENTRAL: STATS (XP, HORAS, DIAS, SEQUÊNCIA) */}
            <div className="grid grid-cols-2 gap-2 w-full px-0 m-0 h-auto">
              <div className="bg-slate-900/40 border border-white/[0.02] p-3 rounded-xl flex items-center gap-2.5">
                <div className="text-amber-400 shrink-0"><Zap size={16} className="text-amber-400" /></div>
                <div className="flex flex-col">
                  <span className="text-[clamp(14px,4vw,22px)] font-mono font-black text-white">8.450</span>
                  <span className="text-[clamp(11px,3.2vw,15px)] uppercase font-bold tracking-wider text-slate-500">Total PTS</span>
                </div>
              </div>
              <div className="bg-slate-900/40 border border-white/[0.02] p-3 rounded-xl flex items-center gap-2.5">
                <div className="text-cyan-400 shrink-0"><Timer size={16} className="text-cyan-400" /></div>
                <div className="flex flex-col">
                  <span className="text-[clamp(14px,4vw,22px)] font-mono font-black text-white">124h</span>
                  <span className="text-[clamp(11px,3.2vw,15px)] uppercase font-bold tracking-wider text-slate-500">
                    {idiomaSelecionado === "PT" ? "Horas Ativas" : idiomaSelecionado === "ES" ? "Horas Activas" : "Active Hours"}
                  </span>
                </div>
              </div>
              
              {/* Card de Dias de Jornada Customizado com Consistência Semanal Embutida */}
              <div className="bg-slate-900/40 border border-white/[0.02] p-2.5 rounded-xl flex flex-col gap-1.5 justify-center">
                <div className="flex items-center gap-2.5">
                  <div className="text-cyan-400 shrink-0"><Calendar size={14} className="text-cyan-400" /></div>
                  <div className="flex flex-col">
                    <span className="text-[clamp(14px,4vw,22px)] font-mono font-black text-white">187</span>
                    <span className="text-[clamp(10px,3vw,11px)] uppercase font-bold tracking-wider text-slate-500">
                      {idiomaSelecionado === "PT" ? "Dias de Jornada" : idiomaSelecionado === "ES" ? "Días de Sesión" : "Journey Days"}
                    </span>
                  </div>
                </div>
                {/* Linha das pílulas da consistência semanal */}
                <div className="flex justify-between items-center gap-0.5 mt-0.5 border-t border-white/[0.03] pt-1">
                  {(idiomaSelecionado === "PT" ? ["S", "T", "Q", "Q", "S", "S", "D"] : idiomaSelecionado === "ES" ? ["L", "M", "M", "J", "V", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"]).map((dia, idx) => {
                    const ativo = idx < 4; // Simulação: seg a qui feito
                    return (
                      <span key={idx} className={`text-[10px] w-4 h-4 rounded-sm flex items-center justify-center font-bold font-mono ${ativo ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-slate-950/50 text-slate-600 border border-white/5"}`}>
                        {dia}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-white/[0.02] p-3 rounded-xl flex items-center gap-2.5">
                <div className="text-amber-500 shrink-0"><Flame size={16} className="text-amber-500" /></div>
                <div className="flex flex-col">
                  <span className="text-[clamp(14px,4vw,22px)] font-mono font-black text-white">23</span>
                  <span className="text-[clamp(11px,3.2vw,15px)] uppercase font-bold tracking-wider text-slate-500">
                    {idiomaSelecionado === "PT" ? "Sequência Ativa" : idiomaSelecionado === "ES" ? "Racha Activa" : "Active Streak"}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD FINANCEIRO INTEGRADO E ORGANIZADO */}
            <div className="w-full px-0 mt-2 flex-initial">
              <div className="bg-gradient-to-r from-slate-950 via-[#070d19]/80 to-slate-950 border border-amber-500/10 p-3 rounded-xl flex items-center justify-between gap-3 shadow-md">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[clamp(11px,3.2vw,15px)] font-mono font-black text-slate-400 uppercase tracking-wider">
                    {idiomaSelecionado === "PT" ? "STATUS DO PLANO" : idiomaSelecionado === "ES" ? "ESTADO DEL PLANO" : "PLAN STATUS"}
                  </span>
                  <span className="text-[clamp(12px,3.4vw,13px)] text-slate-300 font-medium">
                    {idiomaSelecionado === "PT" ? "Vence em: " : idiomaSelecionado === "ES" ? "Vence el: " : "Expires on: "}
                    <span className="text-white font-mono font-bold">{idiomaSelecionado === "EN" ? "07/22/2026" : "22/07/2026"}</span>
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setModalCreditosAberto(true);
                    setEtapaPagamento(0);
                  }}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3.5 py-2.5 rounded-xl text-[clamp(11px,3.2vw,15px)] font-mono font-black uppercase text-cyan-400 tracking-wider active:scale-95 transition-all cursor-pointer whitespace-nowrap min-h-[38px]"
                >
                  {idiomaSelecionado === "PT" ? "Pagar / Renovar" : idiomaSelecionado === "ES" ? "Pagar / Renovar" : "Pay / Renew"}
                </button>
              </div>
            </div>

            {/* 3. BLOCO DE CONQUISTAS */}
            <div className="w-full bg-[#070d19]/40 border border-white/[0.03] p-4 rounded-xl flex flex-col gap-2.5">
              <h3 className="text-[clamp(11px,3.2vw,15px)] font-mono font-black uppercase tracking-wider text-slate-400">
                {idiomaSelecionado === "PT" ? "Insígnias e Conquistas" : idiomaSelecionado === "ES" ? "Insignias y Logros" : "Badges & Achievements"}
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center text-base"><Award size={16} className="text-emerald-400" /></div>
                  <span className="text-[clamp(10px,3vw,11px)] font-bold text-slate-400">
                    {idiomaSelecionado === "PT" ? "1ª Sessão" : idiomaSelecionado === "ES" ? "1ª Sesión" : "1st Session"}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl flex items-center justify-center text-base"><Flame size={16} className="text-amber-400" /></div>
                  <span className="text-[clamp(10px,3vw,11px)] font-bold text-slate-400">7 Days</span>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0 opacity-40 grayscale">
                  <div className="w-11 h-11 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center text-base relative">
                    <Lock size={14} className="text-slate-500" />
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-purple-500/40 rounded-b-xl" style={{ width: '72%' }} />
                  </div>
                  <span className="text-[clamp(10px,3vw,11px)] font-bold text-slate-500 uppercase mt-0.5">
                    {idiomaSelecionado === "PT" ? "Conversação" : idiomaSelecionado === "ES" ? "Conversación" : "Speaking"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. BLOCO DE APRENDIZAGEM */}
            <div className="w-full bg-[#070d19]/40 border border-white/[0.03] p-4 rounded-xl flex flex-col gap-2">
              <h3 className="text-[clamp(11px,3.2vw,15px)] font-mono font-black uppercase tracking-wider text-slate-400">
                {idiomaSelecionado === "PT" ? "Desempenho por Área" : idiomaSelecionado === "ES" ? "Desempeño por Área" : "Performance by Area"}
              </h3>
              <div className="flex flex-col gap-2 font-mono text-[clamp(12px,3.5vw,13.5px)]">
                <div className="flex justify-between text-white">
                  <span>{idiomaSelecionado === "PT" ? "Vocabulário" : idiomaSelecionado === "ES" ? "Vocabulario" : "Vocabulary"} (1.250 p.)</span>
                  <span className="text-slate-400">45h</span>
                </div>
                <div className="flex justify-between text-white border-t border-white/[0.02] pt-2">
                  <span>{idiomaSelecionado === "PT" ? "Conversação" : idiomaSelecionado === "ES" ? "Conversación" : "Speaking"}</span>
                  <span className="text-slate-400">32h</span>
                </div>
              </div>
            </div>

            {/* 5. BLOCO DE EVOLUÇÃO */}
            <div className="w-full bg-[#070d19]/40 border border-white/[0.03] p-4 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-[clamp(11px,3.2vw,15px)] font-black uppercase tracking-wider text-emerald-400">
                  {idiomaSelecionado === "PT" ? "Progresso do Módulo" : idiomaSelecionado === "ES" ? "Progreso del Módulo" : "Module Progress"}
                </span>
                <span className="text-sm font-black text-white">78%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.03] p-0.5">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
              </div>
              <p className="text-[clamp(12px,3.5vw,13.5px)] text-slate-400 mt-1 font-mono text-center">
                {idiomaSelecionado === "PT" ? "Faltam 550 PTS para alcançar Mestre Linguístico." : 
                 idiomaSelecionado === "ES" ? "Faltan 550 PTS para alcanzar Maestro Lingüístico." : 
                 "550 PTS remaining to reach Linguistic Master."}
              </p>
            </div>

            {/* 6. BLOCO DE FERRAMENTAS & CONTA */}
            <div className="flex flex-col gap-1.5 mt-1">
              {/* BOTÃO NATIVO DA PROGRAMAÇÃO COMPLETA */}
              <button 
                onClick={() => setModalProgramaAberto(true)} 
                className="w-full py-3.5 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/15 rounded-xl px-4 flex items-center justify-between text-cyan-400 font-mono font-bold text-[clamp(13px,3.8vw,18px)] cursor-pointer transition-colors min-h-[48px]"
              >
                <div className="flex items-center gap-2">
                  
                  <span>
                    {idiomaSelecionado === "PT" ? "Cronograma Completo" : idiomaSelecionado === "ES" ? "Programa Completo" : "Full Schedule"}
                  </span>
                </div>
                <span className="text-[clamp(11px,3vw,12px)] uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                  {idiomaSelecionado === "PT" ? "Ver Trilha" : idiomaSelecionado === "ES" ? "Ver Ruta" : "View Path"}
                </span>
              </button>
              <button 
                onClick={() => alert(idiomaSelecionado === "PT" ? "Abrindo Cofre de Erros..." : idiomaSelecionado === "ES" ? "Abriendo Cofre de Errores..." : "Opening Error Vault...")} 
                className="w-full py-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 flex items-center justify-between text-amber-400 font-mono font-bold text-[clamp(13px,3.8vw,18px)] cursor-pointer hover:bg-amber-500/10 transition-colors min-h-[48px]"
              >
                <div className="flex items-center gap-2">
                  
                  <span>
                    {idiomaSelecionado === "PT" ? "Cofre de Erros" : idiomaSelecionado === "ES" ? "Cofre de Errores" : "Error Vault"}
                  </span>
                </div>
                <span className="text-[clamp(11px,3vw,12px)] uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  {idiomaSelecionado === "PT" ? "Revisar" : idiomaSelecionado === "ES" ? "Revisar" : "Review"}
                </span>
              </button>

              <button 
                onClick={() => setAbaAtiva('inicio')}
                className="w-full py-3.5 bg-rose-950/10 text-rose-400 font-mono font-black text-[clamp(13px,3.8vw,18px)] uppercase tracking-wider rounded-xl mt-5 mb-2 border border-rose-500/10 cursor-pointer hover:bg-rose-500/10 transition-all min-h-[48px] flex items-center justify-center"
              >
                {idiomaSelecionado === "PT" ? "Sair da Conta" : idiomaSelecionado === "ES" ? "Cerrar Sesión" : "Log Out"}
              </button>
            </div>

          </div>
        )}




      </div>

      {/* MODAL BOTTOM SHEET IDIOMAS */}
      {modalIdiomaAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex flex-col justify-end animate-fadeIn">
          <div className="absolute inset-0 -z-10" onClick={() => setModalIdiomaAberto(false)} />
          <div className="bg-[#070d19] border-t border-white/10 rounded-t-3xl p-5 w-full max-w-[100vw] flex flex-col gap-4 shadow-2xl animate-slideUp">
            <div className="w-full flex items-center justify-between border-b border-white/[0.05] pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Globe size={16} />
                <h3 className="text-xs font-black uppercase tracking-wider">Select Dashboard Language</h3>
              </div>
              <button onClick={() => setModalIdiomaAberto(false)} className="bg-slate-950/60 border border-white/10 text-slate-400 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer">
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2.5 my-2">
              {[
                { code: 'EN', label: 'English (US/UK)' },
                { code: 'PT', label: 'Português (BR)' },
                { code: 'ES', label: 'Español (ES/LATAM)' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setIdiomaSelecionado(lang.code);
                    setModalIdiomaAberto(false);
                  }}
                  className={`w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-between px-5 cursor-pointer ${
                    idiomaSelecionado === lang.code ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950/40 border-white/5 text-slate-400'
                  }`}
                >
                  <span>{lang.label}</span>
                  {idiomaSelecionado === lang.code && <CheckCircle size={16} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO FLUTUANTE DA MENTORA HAAS */}


      {/* TAB BAR INFERIOR */}
      <div className="w-full h-16 bg-[#070d19]/95 backdrop-blur-md border-t border-white/[0.05] mt-auto pb-safe flex items-center justify-around px-2 shrink-0 z-50">
        
        <button onClick={() => { setAbaAtiva("dashboard" as any); setArenaAtiva(false); }} className={`flex flex-col items-center justify-center gap-0.5 flex-1 border-none bg-transparent cursor-pointer ${((abaAtiva as string) === "dashboard") ? "text-emerald-500 font-black" : "text-slate-500 font-bold"}`}>
          <LayoutDashboard size={18} className="sm:w-[22px] sm:h-[22px]" />
          <span className="text-[clamp(10px,2.8vw,14px)] uppercase tracking-wider font-medium mt-0.5">Painel</span>
        </button>
<button onClick={() => { setAbaAtiva('inicio'); setArenaAtiva(false); setStatusRespostaMobile('IDLE'); }} className={`flex flex-col items-center justify-center gap-0.5 flex-1 border-none bg-transparent cursor-pointer ${(abaAtiva as string) === 'inicio' ? 'text-orange-500 font-black' : 'text-slate-500 font-bold'}`}>
          <BookOpen size={18} className="sm:w-[22px] sm:h-[22px]" />
          <span className="text-[clamp(10px,2.8vw,14px)] uppercase tracking-wider font-medium mt-0.5">{txt.tabLearn}</span>
        </button>
        
        <button onClick={() => { setAbaAtiva('agenda'); setEtapaAgendamento(0); }} className={`flex flex-col items-center justify-center gap-0.5 flex-1 border-none bg-transparent cursor-pointer ${(abaAtiva as string) === 'agenda' ? 'text-cyan-400 font-black' : 'text-slate-500 font-bold'}`}>
          <Calendar size={18} className="sm:w-[22px] sm:h-[22px]" />
          <span className="text-[clamp(10px,2.8vw,14px)] uppercase tracking-wider font-medium mt-0.5">{txt.tabSchedule}</span>
        </button>
        
        <button onClick={() => setAbaAtiva('tarefas')} className={`flex flex-col items-center justify-center gap-0.5 flex-1 border-none bg-transparent cursor-pointer ${(abaAtiva as string) === 'tarefas' ? 'text-amber-500 font-black' : 'text-slate-500 font-bold'}`}>
          <Camera size={18} className="sm:w-[22px] sm:h-[22px]" />
          <span className="text-[clamp(10px,2.8vw,14px)] uppercase tracking-wider font-medium mt-0.5">{txt.tabTasks}</span>
        </button>

        <button onClick={() => setAbaAtiva('perfil')} className={`flex flex-col items-center justify-center gap-0.5 flex-1 border-none bg-transparent cursor-pointer ${((abaAtiva as string) === "perfil") ? 'text-indigo-400 font-black' : 'text-slate-500 font-bold'}`}>
          <User size={18} className="sm:w-[22px] sm:h-[22px]" />
          <span className="text-[clamp(10px,2.8vw,14px)] uppercase tracking-wider font-medium mt-0.5">{txt.tabProfile}</span>
        </button>
      </div>

      {/* GAVETA DE COMPRAS PURE MOBILE */}
      {modalCreditosAberto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999999 }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: -1 }} onClick={() => setModalCreditosAberto(false)} />
          <div className="bg-[#070d19] border-t border-orange-500/30 rounded-t-3xl p-6 w-full max-w-[100vw] max-h-[80vh] overflow-y-auto shadow-2xl" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999999, display: 'flex', flexDirection: 'column' }}>
            <div className="w-full flex items-center justify-between border-b border-white/[0.05] pb-3 mb-2">
              <span className="text-orange-500 font-mono font-black tracking-wider text-sm">HAAS ACADEMY</span>
              <button onClick={() => { setModalCreditosAberto(false); setEtapaPagamento(0); }} className="text-slate-400 font-bold bg-transparent border-none cursor-pointer hover:text-white text-lg">✕</button>
            </div>

            {isMatriculadoSimulado && !isVencidoSimulado && (
              <div 
                onClick={() => setEtapaPagamento(3)}
                className="mb-3 p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-xl text-[10px] text-emerald-300 font-medium leading-relaxed shadow-sm cursor-pointer active:scale-[0.99] hover:bg-emerald-900/40 transition-all select-none animate-fadeIn"
                title="Renovação Expressa"
              >
                {idiomaSelecionado === "PT" ? (
                  <>🟢 <strong className="text-emerald-400 font-black">SEU PLANO ESTÁ ATIVO.</strong> Mensalidade Atual: <strong className="text-white font-black">$ 300.000 COP</strong>. Próxima renovação automática: 05/Próx Mês. <span className="text-emerald-400 underline font-bold block mt-1">👉 Clique aqui para pagar</span></>
                ) : idiomaSelecionado === "ES" ? (
                  <>🟢 <strong className="text-emerald-400 font-black">TU PLAN ESTÁ ACTIVO.</strong> Mensualidad Actual: <strong className="text-white font-black">$ 300.000 COP</strong>. Próxima renovación automática: 05/Próx Mes. <span className="text-emerald-400 underline font-bold block mt-1">👉 Clique aquí para pagar</span></>
                ) : (
                  <>🟢 <strong className="text-emerald-400 font-black">YOUR PLAN IS ACTIVE.</strong> Current Monthly Fee: <strong className="text-white font-black">$ 300.000 COP</strong>. Next automatic renewal: 05/Next Month. <span className="text-emerald-400 underline font-bold block mt-1">👉 Click here to pay</span></>
                )}
              </div>
            )}

            {isMatriculadoSimulado && isVencidoSimulado && (
              <div className="mb-3 p-3 bg-rose-950/80 border border-rose-500/30 rounded-xl text-[10px] text-rose-300 font-medium leading-relaxed shadow-sm">
                {idiomaSelecionado === "PT" ? (
                  <>⚠️ <strong className="text-rose-400 font-black">SUA DATA DE RENOVAÇÃO EXPIROU.</strong> Conforme os termos da plataforma, as condições anteriores e descontos de fidelidade foram desativados automaticamente. Selecione um plano abaixo para reativar seu acesso.</>
                ) : idiomaSelecionado === "ES" ? (
                  <>⚠️ <strong className="text-rose-400 font-black">TU FECHA DE RENOVACIÓN EXPIRÓ.</strong> Conforme a los términos de la plataforma, las condiciones anteriores y descuentos de fidelidad se han desactivado automáticamente. Selecciona un plan abajo para reactivar tu acceso.</>
                ) : (
                  <>⚠️ <strong className="text-rose-400 font-black">YOUR RENEWAL DATE HAS EXPIRED.</strong> In accordance with platform terms, previous conditions and loyalty discounts have been automatically deactivated. Select a new plan below to reactivate your access.</>
                )}
              </div>
            )}

            {etapaPagamento === 0 && (
              <div className="flex flex-col gap-3 my-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  {idiomaSelecionado === "PT" ? "Selecione a Modalidade:" : idiomaSelecionado === "EN" ? "Select Modality:" : "Seleccione la Modalidad:"}
                </span>

                {/* 1. GRUPO MENSAL */}
                <button onClick={() => { setModalidadeSelecionada('grupo'); setEtapaPagamento(1); setCreditosSelecionados(8); }} className="w-full p-4 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/30 rounded-xl flex flex-col gap-0.5 text-left cursor-pointer active:from-orange-500/20">
                  <span className="text-sm font-black text-white uppercase tracking-wide">{idiomaSelecionado === "PT" ? "Grupo Mensal" : idiomaSelecionado === "EN" ? "Monthly Group" : "Grupo Mensal"}</span>
                  <span className="text-[10px] text-orange-400 font-medium leading-normal">
                    {idiomaSelecionado === "PT" ? "Vigência: 30 Dias | IA (Gemini): Ilimitada" : 
                     idiomaSelecionado === "EN" ? "Term: 30 Days | AI (Gemini): Unlimited" : 
                     "Vigencia: 30 Días | IA (Gemini): Ilimitada"}
                  </span>
                </button>

                {/* 2. VIP STANDARD */}
                <button onClick={() => { setModalidadeSelecionada('particular'); setEtapaPagamento(1); setCreditosSelecionados(8); }} className="w-full p-4 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/30 rounded-xl flex flex-col gap-0.5 text-left cursor-pointer active:from-orange-500/20">
                  <span className="text-sm font-black text-white uppercase tracking-wide">VIP Standard</span>
                  <span className="text-[10px] text-orange-400 font-medium leading-normal">
                    {idiomaSelecionado === "PT" ? "Particular 1 a 1 | Vigência: 30 Dias | IA: Ilimitada" : 
                     idiomaSelecionado === "EN" ? "1-on-1 Private | Term: 30 Days | AI: Unlimited" : 
                     "Particular 1 a 1 | Vigencia: 30 Días | IA: Ilimitada"}
                  </span>
                </button>

                {/* 3. VIP PRO */}
                <button onClick={() => { setModalidadeSelecionada('business'); setEtapaPagamento(1); setCreditosSelecionados(8); }} className="w-full p-4 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/30 rounded-xl flex flex-col gap-0.5 text-left cursor-pointer active:from-orange-500/20">
                  <span className="text-sm font-black text-white uppercase tracking-wide">VIP Pro</span>
                  <span className="text-[10px] text-orange-400 font-medium leading-normal">
                    {idiomaSelecionado === "PT" ? "Corporativo | Vigência: 30 Dias | IA: Ilimitada" : 
                     idiomaSelecionado === "EN" ? "Corporate | Term: 30 Days | AI: Unlimited" : 
                     "Corporativo | Vigencia: 30 Días | IA: Ilimitada"}
                  </span>
                </button>

                {/* 4. PACK GRUPO */}
                <button onClick={() => { setModalidadeSelecionada('pack_grupo'); setEtapaPagamento(1); setCreditosSelecionados(1); }} className="w-full p-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl flex flex-col gap-0.5 text-left cursor-pointer active:from-amber-500/20">
                  <span className="text-sm font-black text-white uppercase tracking-wide">Pack Grupo</span>
                  <span className="text-[10px] text-amber-400 font-medium leading-normal">
                    {idiomaSelecionado === "PT" ? "Pack Avulso | +10 Consultas IA e +7 Dias por crédito (Teto 30)" : 
                     idiomaSelecionado === "EN" ? "Extra Pack | +10 AI Queries and +7 Days per credit (Max 30)" : 
                     "Paquete Extra | +10 Consultas IA y +7 Días por crédito (Techo 30)"}
                  </span>
                </button>

                {/* 5. PACK VIP STD */}
                <button onClick={() => { setModalidadeSelecionada('pack_vip'); setEtapaPagamento(1); setCreditosSelecionados(1); }} className="w-full p-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl flex flex-col gap-0.5 text-left cursor-pointer active:from-amber-500/20">
                  <span className="text-sm font-black text-white uppercase tracking-wide">Pack VIP Std</span>
                  <span className="text-[10px] text-amber-400 font-medium leading-normal">
                    {idiomaSelecionado === "PT" ? "Pack VIP | +25 Consultas IA e +7 Dias por crédito (Teto 30)" : 
                     idiomaSelecionado === "EN" ? "VIP Extra Pack | +25 AI Queries and +7 Days per credit (Max 30)" : 
                     "Paquete VIP Extra | +25 Consultas IA y +7 Días por crédito (Techo 30)"}
                  </span>
                </button>

                {/* 6. PARTICULARES FLEX */}
                <button onClick={() => { setModalidadeSelecionada('flex'); setEtapaPagamento(1); setCreditosSelecionados(1); }} className="w-full p-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl flex flex-col gap-0.5 text-left cursor-pointer active:from-amber-500/20">
                  <span className="text-sm font-black text-white uppercase tracking-wide">Particulares Flex</span>
                  <span className="text-[10px] text-amber-400 font-medium leading-normal">
                    {idiomaSelecionado === "PT" ? "Pack Flex | +25 Consultas IA e +7 Dias por crédito (Teto 30)" : 
                     idiomaSelecionado === "EN" ? "Pro Flex Pack | +25 AI Queries and +7 Days per credit (Max 30)" : 
                     "Paquete Flex Extra | +25 Consultas IA y +7 Días por crédito (Techo 30)"}
                  </span>
                </button>
              </div>
            )}

            {etapaPagamento === 1 && (
              <div className="flex flex-col gap-4 my-1 text-slate-100">
                {/* BOTÃO VOLTAR */}
                <button onClick={() => setEtapaPagamento(0)} className="text-xs font-bold uppercase tracking-wider text-left text-orange-400 bg-transparent border-none cursor-pointer flex items-center gap-1 hover:text-orange-500 w-fit">
                  {idiomaSelecionado === "PT" ? "← Voltar" : idiomaSelecionado === "EN" ? "← Back" : "← Volver"}
                </button>

                {/* SELETOR PLANO RECORRENTE (8, 12, 20) */}
                {['grupo', 'particular', 'business'].includes(modalidadeSelecionada) && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {idiomaSelecionado === "PT" ? "Selecione a Intensidade Mensal:" : idiomaSelecionado === "EN" ? "Select Monthly Intensity:" : "Seleccione la Intensidad Mensual:"}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[8, 12, 20].map((cr) => (
                        <button key={cr} onClick={() => setCreditosSelecionados(cr)} className={`p-3.5 rounded-xl border text-xs font-black uppercase cursor-pointer transition-all ${creditosSelecionados === cr ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-500 text-slate-950 shadow-lg shadow-orange-500/20' : 'bg-[#0a1324] border-white/10 text-slate-200'}`}>
                          {cr} {idiomaSelecionado === "PT" ? "AULAS" : idiomaSelecionado === "EN" ? "CLASSES" : "CLASES"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SELETOR PACKS (CONTADOR) */}
                {['pack_grupo', 'pack_vip', 'flex'].includes(modalidadeSelecionada) && (
                  <div className="flex flex-col gap-3 bg-[#0a1324] p-4 rounded-xl border border-white/5 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {idiomaSelecionado === "PT" ? "Quantidade de Aulas:" : idiomaSelecionado === "EN" ? "Amount of Classes:" : "Cantidad de Clases:"}
                    </span>
                    <div className="flex items-center gap-6 my-1">
                      <button onClick={() => setCreditosSelecionados(Math.max(1, creditosSelecionados - 1))} className="w-10 h-10 bg-[#070d19] border border-orange-500/30 rounded-xl flex items-center justify-center font-black text-lg text-orange-500 cursor-pointer active:bg-orange-500/10">-</button>
                      <span className="text-2xl font-mono font-black text-white">{creditosSelecionados}</span>
                      <button onClick={() => setCreditosSelecionados(Math.min(modalidadeSelecionada === 'pack_grupo' ? 8 : 20, creditosSelecionados + 1))} className="w-10 h-10 bg-[#070d19] border border-orange-500/30 rounded-xl flex items-center justify-center font-black text-lg text-orange-500 cursor-pointer active:bg-orange-500/10">+</button>
                    </div>
                  </div>
                )}

                {/* DISPLAY DE VALOR PREMIUM */}
                <div className="w-full p-4 bg-gradient-to-b from-[#0a1324] to-[#070d19] border border-orange-500/20 rounded-2xl flex flex-col items-center justify-center gap-0.5 my-1 shadow-inner">
                  <div className="text-2xl font-mono font-black text-white flex items-center gap-1.5 tracking-wide mt-0.5">
                    <span className="text-orange-500">$</span>
                    <span>{obterPrecoPacote(modalidadeSelecionada, creditosSelecionados).toLocaleString('de-DE')}</span>
                    <span className="text-xs text-slate-400 font-bold ml-1 uppercase">COP</span>
                  </div>

                  {/* Detalhamento dinâmico de vigência e IA de acordo com o plano ou pack acumulável */}
                  <div className="text-[9px] font-medium text-center text-slate-400 border-t border-white/[0.05] w-full pt-2 mt-2 leading-relaxed">
                    {['grupo', 'particular', 'business'].includes(modalidadeSelecionada) ? (
                      idiomaSelecionado === "PT" ? "Vigência Integral: 30 Dias | Acesso IA: Ilimitado" :
                      idiomaSelecionado === "EN" ? "Full Validity: 30 Days | AI Access: Unlimited" :
                      "Vigencia Integral: 30 Días | Acceso IA: Ilimitado"
                    ) : (
                      idiomaSelecionado === "PT" ? `Vigência Base: +${Math.min(creditosSelecionados * 7, 30)} Dias (Teto 30) | Crédito IA: +${modalidadeSelecionada === 'pack_grupo' ? creditosSelecionados * 10 : creditosSelecionados * 25} Consultas` :
                      idiomaSelecionado === "EN" ? `Base Term: +${Math.min(creditosSelecionados * 7, 30)} Days (Max 30) | AI Credit: +${modalidadeSelecionada === 'pack_grupo' ? creditosSelecionados * 10 : creditosSelecionados * 25} Queries` :
                      `Vigencia Base: +${Math.min(creditosSelecionados * 7, 30)} Días (Techo 30) | Crédito IA: +${modalidadeSelecionada === 'pack_grupo' ? creditosSelecionados * 10 : creditosSelecionados * 25} Consultas`
                    )}
                  </div>
                </div>

                {/* BOTÃO CONTINUAR */}
                <button onClick={() => setEtapaPagamento(2)} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] border-none cursor-pointer shadow-lg shadow-orange-500/10 hover:brightness-110">
                  {idiomaSelecionado === "PT" ? "Continuar para o Pagamento" : idiomaSelecionado === "EN" ? "Continue to Payment" : "Continuar al Pago"}
                </button>
              </div>
            )}

            {etapaPagamento === 2 && (
              <div className="flex flex-col gap-4 my-1 text-slate-100">
                {/* BOTÃO VOLTAR */}
                <button onClick={() => setEtapaPagamento(1)} className="text-xs font-bold uppercase tracking-wider text-left text-orange-400 bg-transparent border-none cursor-pointer flex items-center gap-1 hover:text-orange-500 w-fit">
                  {idiomaSelecionado === "PT" ? "← Voltar" : idiomaSelecionado === "EN" ? "← Back" : "← Volver"}
                </button>

                {/* TÍTULO DA TELA */}
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mt-1">
                  {idiomaSelecionado === "PT" ? "Resumo do Pedido:" : idiomaSelecionado === "EN" ? "Order Summary:" : "Resumen del Pedido:"}
                </span>

                {/* CAIXA DE DETALHES DO PLANO */}
                <div className="w-full p-4 bg-[#0a1324] border border-white/[0.05] rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                    <span className="text-xs text-slate-400 font-medium">
                      {idiomaSelecionado === "PT" ? "Plano Selecionado:" : idiomaSelecionado === "EN" ? "Selected Plan:" : "Plan Seleccionado:"}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wide text-white font-mono">
                      {modalidadeSelecionada.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                    <span className="text-xs text-slate-400 font-medium">
                      {idiomaSelecionado === "PT" ? "Quantidade:" : idiomaSelecionado === "EN" ? "Amount:" : "Cantidad:"}
                    </span>
                    <span className="text-xs font-black text-white font-mono">
                      {creditosSelecionados} {idiomaSelecionado === "PT" ? "Aulas" : idiomaSelecionado === "EN" ? "Classes" : "Clases"}
                    </span>
                  </div>

                  {/* Linha de Vigência Discriminada */}
                  <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                    <span className="text-xs text-slate-400 font-medium">
                      {idiomaSelecionado === "PT" ? "Vigência do Plano:" : idiomaSelecionado === "EN" ? "Plan Validity:" : "Vigencia del Plan:"}
                    </span>
                    <span className="text-xs font-black text-amber-400 font-mono">
                      {['grupo', 'particular', 'business'].includes(modalidadeSelecionada) ? "30 " + (idiomaSelecionado === "PT" ? "Dias" : idiomaSelecionado === "EN" ? "Days" : "Días") : `+${Math.min(creditosSelecionados * 7, 30)} ` + (idiomaSelecionado === "PT" ? "Dias (Teto 30)" : idiomaSelecionado === "EN" ? "Days (Max 30)" : "Días (Techo 30)")}
                    </span>
                  </div>

                  {/* Linha de Benefício de Inteligência Artificial Discriminado */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">
                      {idiomaSelecionado === "PT" ? "Créditos de IA:" : idiomaSelecionado === "EN" ? "AI Credits:" : "Créditos de IA:"}
                    </span>
                    <span className="text-xs font-black text-orange-400 font-mono">
                      {['grupo', 'particular', 'business'].includes(modalidadeSelecionada) ? (idiomaSelecionado === "PT" ? "ILIMITADO" : idiomaSelecionado === "EN" ? "UNLIMITED" : "ILIMITADO") : `+${modalidadeSelecionada === 'pack_grupo' ? creditosSelecionados * 10 : creditosSelecionados * 25} ` + (idiomaSelecionado === "PT" ? "Consultas" : idiomaSelecionado === "EN" ? "Queries" : "Consultas")}
                    </span>
                  </div>
                </div>

                {/* VISUALIZAÇÃO DO PREÇO FINAL */}
                <div className="w-full p-4 bg-gradient-to-b from-[#0a1324] to-[#070d19] border border-orange-500/20 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-inner">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    {idiomaSelecionado === "PT" ? "Total a pagar" : idiomaSelecionado === "EN" ? "Total to pay" : "Total a pagar"}
                  </span>
                  <div className="text-2xl font-mono font-black text-white flex items-center gap-1.5 tracking-wide mt-1">
                    <span className="text-orange-500">$</span>
                    <span>{obterPrecoPacote(modalidadeSelecionada, creditosSelecionados).toLocaleString('de-DE')}</span>
                    <span className="text-xs text-slate-400 font-bold ml-1 uppercase">COP</span>
                  </div>
                </div>

                {/* BOTÃO PRINCIPAL DE PAGAMENTO */}
                <button onClick={() => setEtapaPagamento(3)} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] border-none cursor-pointer shadow-lg shadow-orange-500/10 hover:brightness-110">
                  {idiomaSelecionado === "PT" ? "Ir para o Pagamento Seguro" : idiomaSelecionado === "EN" ? "Proceed to Secure Payment" : "Ir al Pago Seguro"}
                </button>
              </div>
            )}

            {/* ETAPA 3: GATEWAY COLÔMBIA (CARDS EMPILHADOS) */}
            {etapaPagamento === 3 && (
              <div className="flex flex-col gap-3.5 my-1 text-slate-100 w-full">
                {/* SELETOR LOCALIZAÇÃO */}
                <div className="w-full flex justify-between items-center bg-[#0a1324] p-3 rounded-xl border border-white/[0.05]">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {idiomaSelecionado === "PT" ? "Onde você está?" : idiomaSelecionado === "EN" ? "Where are you?" : "¿Dónde te encuentras?"}
                  </span>
                  <button onClick={() => setEtapaPagamento(4)} className="bg-transparent border border-amber-500/40 px-3 py-1.5 rounded-lg text-[10px] font-black text-amber-500 tracking-wider uppercase cursor-pointer hover:bg-amber-500/10">
                    🌐 {idiomaSelecionado === "PT" ? "Fora da Colômbia" : idiomaSelecionado === "EN" ? "Outside Colombia" : "Fuera de Colombia"}
                  </button>
                </div>

                {/* CAIXA DE VALIDAÇÃO DE CUPONS METICULOSA E NATIVA */}

                {/* CAMPO DE CUPOM DE DESCONTO */}
                <div className="w-full bg-[#0a1324] p-3 rounded-xl border border-white/[0.05] flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {idiomaSelecionado === "PT" ? "Cupom de Desconto:" : idiomaSelecionado === "EN" ? "Coupon Code:" : "Cupón de Descuento:"}
                  </span>
                  <div className="flex gap-2">
                    <input type="text" value={cupomTexto} onChange={(e) => setCupomTexto(e.target.value)} placeholder="HAAS10" className="flex-1 bg-[#070d19] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-orange-500" />
                    <button onClick={() => { if(cupomTexto.toUpperCase() === "HAAS10") { setDescontoCupom(0.10); setCupomAplicado(true); } }} className="bg-orange-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer">
                      {cupomAplicado ? "✓" : (idiomaSelecionado === "PT" ? "Aplicar" : idiomaSelecionado === "EN" ? "Apply" : "Aplicar")}
                    </button>
                  </div>
                </div>

                {/* CARD 1: TARJETA WOMPI (+5%) */}
                <div className="w-full p-4 bg-[#0a1324] border border-white/[0.05] rounded-xl flex flex-col gap-2.5">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">● {idiomaSelecionado === "PT" ? "Cartão de Crédito / Débito" : idiomaSelecionado === "EN" ? "Credit / Debit Card" : "Tarjeta de Crédito / Débito"}</span>
                  <span className="text-[10px] text-slate-400 font-medium -mt-1 block">Pasarela segura Wompi / Nequi</span>
                  <div className="bg-[#070d19] p-3 rounded-lg text-xs font-mono flex flex-col gap-1.5 text-slate-300">
                    <div className="flex justify-between"><span>Base:</span><span>$ {Math.round(obterPrecoPacote(modalidadeSelecionada, creditosSelecionados) * (1 - descontoCupom)).toLocaleString('de-DE')}</span></div>
                    <div className="flex justify-between text-rose-400"><span>Fee pasarela:</span><span>+ $ {Math.round(obterPrecoPacote(modalidadeSelecionada, creditosSelecionados) * (1 - descontoCupom) * 0.05).toLocaleString('de-DE')}</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5 font-black text-white text-sm"><span>Total:</span><span>$ {Math.round(obterPrecoPacote(modalidadeSelecionada, creditosSelecionados) * (1 - descontoCupom) * 1.05).toLocaleString('de-DE')}</span></div>
                  </div>
                  <a href="https://checkout.nequi.wompi.co/l/Nhopn2" target="_blank" rel="noreferrer" className="w-full py-3 bg-[#10b981] hover:bg-[#0ea5e9] text-slate-950 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all block no-underline shadow-md shadow-emerald-500/10">
                    {idiomaSelecionado === "PT" ? "PAGAR VIA WOMPI / NEQUI" : idiomaSelecionado === "EN" ? "PAY VIA WOMPI / NEQUI" : "PAGAR VÍA WOMPI / NEQUI"}
                  </a>
                  <span className="text-[9px] text-slate-500 font-medium leading-relaxed block text-center">
                    {idiomaSelecionado === "PT" ? "Nota: A comissão de processamento é cobrada pela plataforma e não é reembolsável em caso de cancelamento." : idiomaSelecionado === "EN" ? "Note: The processing fee is charged by the platform and is non-refundable in case of cancellation." : "Nota: La comisión de procesamiento es cobrada por la plataforma y no es reembolsable en caso de cancelación."}
                  </span>
                </div>

                {/* CARD 2: LLAVE BRE-B (QR CODE - DESCONTO DO ROBÔ) */}
                <div className="w-full p-4 bg-[#0a1324] border border-orange-500/20 rounded-xl flex flex-col gap-2.5 relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-md font-mono tracking-wider">¡AHORRA COMISIÓN!</div>
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">● LLAVE BRE-B</span>
                  <div className="w-full flex justify-center my-1 bg-white p-2 rounded-xl max-w-[140px] mx-auto">
                    <img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/Untitled%20folder/WhatsApp%20Image%202026-06-28%20at%2012.18.16.jpeg" alt="QR Llave Bre-B" className="w-32 h-32 object-contain" />
                  </div>
                  <div className="bg-[#070d19] p-3 rounded-lg text-xs font-mono flex flex-col gap-1.5 text-slate-300">
                    <div className="flex justify-between"><span>Base:</span><span>$ {Math.round(obterPrecoPacote(modalidadeSelecionada, creditosSelecionados) * (1 - descontoCupom)).toLocaleString('de-DE')}</span></div>
                    <div className="flex justify-between text-emerald-400"><span>Comisión:</span><span>$ 0 (¡Gratis!)</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5 font-black text-amber-400 text-sm"><span>A transferir:</span><span>$ {(Math.round(obterPrecoPacote(modalidadeSelecionada, creditosSelecionados) * (1 - descontoCupom)) - 34).toLocaleString('de-DE')}</span></div>
                  </div>
                  <span className="text-[9px] text-amber-500/90 font-bold leading-relaxed block text-center bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                    {idiomaSelecionado === "PT" ? "▲ ATENÇÃO: Lembre-se de transferir o valor exato com o desconto no seu aplicativo bancário; isso permite que nosso sistema valide seu pagamento automaticamente." : idiomaSelecionado === "EN" ? "▲ ATTENTION: Remember to transfer the exact amount with the discount in your banking app; this allows our system to validate your payment automatically." : "▲ ATENCIÓN: Recuerda ingresar el valor exacto con descuento en tu banco; esto permite que nuestro sistema valide tu pago digitalmente y gestione la activación de tu plan."}
                  </span>
                </div>

                {/* BOTÃO FIXO DE FEEDBACK COMPRA */}
                <button onClick={() => setEtapaPagamento(5)} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer mt-1 font-mono">
                  {idiomaSelecionado === "PT" ? "YA REALICÉ EL PAGO, VOLVER AL PORTAL" : idiomaSelecionado === "EN" ? "YA REALICÉ EL PAGO, VOLVER AL PORTAL" : "YA REALICÉ EL PAGO, VOLVER AL PORTAL"}
                </button>
              </div>
            )}

            {/* ETAPA 4: GATEWAY INTERNACIONAL (USD + 5%) */}
            {etapaPagamento === 4 && (
              <div className="flex flex-col gap-3.5 my-1 text-slate-100">
                <div className="w-full flex justify-between items-center bg-[#0a1324] p-3 rounded-xl border border-white/[0.05]">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {idiomaSelecionado === "PT" ? "¿Onde você está?" : idiomaSelecionado === "EN" ? "Where are you?" : "¿Dónde te encuentras?"}
                  </span>
                  <button onClick={() => setEtapaPagamento(3)} className="bg-transparent border border-orange-500/40 px-3 py-1.5 rounded-lg text-[10px] font-black text-orange-500 tracking-wider uppercase cursor-pointer hover:bg-orange-500/10">
                    🇨🇴 {idiomaSelecionado === "PT" ? "Mudar para Colômbia" : idiomaSelecionado === "EN" ? "Change to Colombia" : "Cambiar a Colombia"}
                  </button>
                </div>

                <div className="w-full p-4 bg-[#0a1324] border border-white/[0.05] rounded-xl flex flex-col gap-2.5">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">🌐 {idiomaSelecionado === "PT" ? "PAGAMENTOS INTERNACIONAIS HAAS" : idiomaSelecionado === "EN" ? "HAAS INTERNATIONAL PAYMENTS" : "PAGAMENTOS INTERNACIONAIS HAAS"}</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-relaxed block">
                    {idiomaSelecionado === "PT" ? "Para transferências ou cartões do exterior, processe sua matrícula diretamente através do nosso módulo global integrado de alta segurança." : idiomaSelecionado === "EN" ? "For transfers or cards from abroad, process your enrollment directly through our high-security integrated global module." : "Para transferencias o tarjetas desde el exterior, procese su matrícula de manera directa a través de nuestro módulo global integrado de alta seguridad."}
                  </span>
                  {(() => {
                    const valorBaseCop = Math.round(obterPrecoPacote(modalidadeSelecionada, creditosSelecionados) * (1 - descontoCupom));
                    const userSeed = typeof window !== "undefined" ? localStorage.getItem("user_email") || "haas" : "haas";
                    let hashMod = 0;
                    for (let i = 0; i < userSeed.length; i++) { hashMod += userSeed.charCodeAt(i); }
                    const rastroPesos = (hashMod % 95) + 1;

                    const valorCopFinalComTaxaERobor = Math.round(valorBaseCop * 1.05) - rastroPesos;
                    const taxaInternet = (window as any)._taxaCop || 4100;
                    const usdEquivalente = valorCopFinalComTaxaERobor / taxaInternet;

                    return (
                      <div className="bg-[#070d19] p-2.5 rounded-lg text-[9px] font-mono flex flex-col gap-0.5 border border-white/5 w-full">
                        <div className="flex justify-between text-slate-400"><span>{idiomaSelecionado === "PT" ? "Base do Plano:" : idiomaSelecionado === "EN" ? "Plan Base:" : "Base del Plan:"}</span><span>$ {valorBaseCop.toLocaleString("es-CO")} COP</span></div>
                        <div className="flex justify-between text-rose-400"><span>{idiomaSelecionado === "PT" ? "Taxa do Gateway (5%):" : idiomaSelecionado === "EN" ? "Processing Fee (5%):" : "Fee de Procesamiento (5%):"}</span><span>+ $ {Math.round(valorBaseCop * 0.05).toLocaleString("es-CO")} COP</span></div>
                        <div className="flex justify-between text-slate-500 text-[8px]"><span>{idiomaSelecionado === "PT" ? "Desconto do Robô:" : idiomaSelecionado === "EN" ? "Robot Discount:" : "Descuento del Robot:"}</span><span>- $ {rastroPesos} COP</span></div>
                        <div className="border-t border-white/10 my-0.5"></div>
                        <div className="flex flex-col text-left">
                          <span className="text-[7.5px] font-bold text-emerald-400 uppercase tracking-wider">{idiomaSelecionado === "PT" ? "DIGITE ESSE VALOR EXATO NA WOMPI (COP):" : idiomaSelecionado === "EN" ? "ENTER THIS EXACT VALUE IN WOMPI (COP):" : "VALOR EXACTO A INGRESAR EN WOMPI (COP):"}</span>
                          <div className="flex justify-between font-black text-emerald-400 text-xs mt-0.5"><span>Total COP:</span><span>$ {valorCopFinalComTaxaERobor.toLocaleString("es-CO")} COP</span></div>
                        </div>
                        <div className="border-t border-white/5 my-0.5 opacity-30"></div>
                        <div className="flex justify-between text-slate-400 text-[8px]"><span>{idiomaSelecionado === "PT" ? "Aproximado em USD:" : idiomaSelecionado === "EN" ? "Approximate USD:" : "Aproximado en USD:"}</span><span className="font-bold">$ {usdEquivalente.toFixed(2)} USD</span></div>
                      </div>
                    );
                  })()}
                  <a href="https://checkout.nequi.wompi.co/l/Nhopn2" target="_blank" rel="noreferrer" className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all block no-underline shadow-md shadow-orange-500/10 hover:brightness-110">
                    {idiomaSelecionado === "PT" ? "Ir para o Gateway (COP)" : idiomaSelecionado === "EN" ? "PAY WITH INTERNATIONAL CARD" : "PAGAR CON TARJETA INTERNACIONAL"}
                  </a>
                  <span className="text-[9px] text-slate-500 font-medium leading-relaxed block text-center mt-1">
                    {idiomaSelecionado === "PT" ? "⚠️ ATENÇÃO: HAAS processa inscrições em COP. A taxa bancária não é reembolsável. Digite o valor em COP exato acima para a ativação automática pelo nosso robô." : idiomaSelecionado === "EN" ? "⚠️ ATTENTION: HAAS processes enrollments in COP. The processing bank fee is non-refundable. Enter the exact COP value above to ensure automatic activation." : "▲ ATENCIÓN: Procesa el valor exacto en dólares (USD) indicado para asegurar que la validación global sea exitosa y seu plano se active de forma automática."}
                  </span>
                </div>

                <button onClick={() => setEtapaPagamento(5)} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer font-mono">
                  {idiomaSelecionado === "PT" ? "YA REALICÉ EL PAGO, VOLVER AL PORTAL" : idiomaSelecionado === "EN" ? "YA REALICÉ EL PAGO, VOLVER AL PORTAL" : "YA REALICÉ EL PAGO, VOLVER AL PORTAL"}
                </button>
              </div>
            )}

            {/* ETAPA 5: TELA DE NOTIFICAÇÃO ENVIADA (FEEDBACK SUCESSO) */}
            {etapaPagamento === 5 && (
              <div className="flex flex-col gap-4 my-2 text-slate-100 text-center py-2">
                <span className="text-sm font-black uppercase tracking-wider text-white font-mono block mb-1">NOTIFICACIÓN DE PAGO ENVIADA</span>
                <div className="bg-[#0a1324] p-4 rounded-xl border border-white/[0.05] text-xs text-slate-300 text-left leading-relaxed flex flex-col gap-3 shadow-inner">
                  <p>{idiomaSelecionado === "PT" ? "Registramos seu aviso de pagamento. O sistema iniciará a verificação dos valores com o desconto de identificação aplicado para validar a transação com o seu registro." : idiomaSelecionado === "EN" ? "We have registered your payment notice. The system will initiate verification of the values with the applied identification discount to validate the transaction with your record." : "Hemos registrado tu aviso de pago. El sistema iniciará la verificación de los valores con el descuento de identificación aplicado para validar a transación com o seu registro."}</p>
                </div>
                <div className="bg-[#0a1324] p-4 rounded-xl border border-white/[0.05] text-xs text-left leading-relaxed flex flex-col gap-2 text-slate-400">
                  <p><strong className="text-white">¿Qué pasa ahora?</strong> {idiomaSelecionado === "PT" ? "Assim que o sistema validar o recebimento do valor, prosseguiremos com a ativação automática de sua matrícula." : idiomaSelecionado === "EN" ? "Once the system validates the receipt of the amount, we will proceed with the automatic activation of your enrollment." : "Una vez que el sistema valide el ingreso del valor, se procederá con la activación automática de tu matrícula."}</p>
                  <p><strong className="text-white">Acceso Completo:</strong> {idiomaSelecionado === "PT" ? "Após a confirmação bem-sucedida, você receberá um e-mail de notificação e seu acesso à plataforma será liberado." : idiomaSelecionado === "EN" ? "Upon successful confirmation, you will receive a notification email and your access to the platform will be enabled." : "Tras la confirmación exitosa, recibirás un e-mail de notificación y se habilitará tu acceso a la plataforma."}</p>
                </div>
                <button onClick={() => { setModalCreditosAberto(false); setEtapaPagamento(0); }} className="w-full py-3.5 bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer font-mono shadow-md shadow-orange-500/10 hover:brightness-110">
                  {idiomaSelecionado === "PT" ? "ENTENDIDO" : idiomaSelecionado === "EN" ? "UNDERSTOOD" : "ENTENDIDO"}
                </button>
              </div>
            )}
          </div>
        </div>
       )}

      {/* GAVETINHA NOVA DE AVISO COMERCIAL - UPSELL TRILINGUE */}
      <div className={`fixed inset-x-0 bottom-0 z-[100] bg-[#0b1528] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl transition-transform duration-300 flex flex-col gap-4 font-sans ${gavetaAvisoCompraAberta ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-2 opacity-40 cursor-pointer" onClick={() => setGavetaAvisoCompraAberta(false)} />
        <div className="flex flex-col gap-1 text-center">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            {idiomaSelecionado === "PT" ? "Plano Inativo" : idiomaSelecionado === "ES" ? "Plan Inactivo" : "Inactive Plan"}
          </h3>
          <p className="text-xs text-slate-400 max-w-[290px] mx-auto leading-relaxed">
            {idiomaSelecionado === "PT" ? "Você não possui créditos ativos para este plano. Gostaria de adquirir um pacote?" : idiomaSelecionado === "ES" ? "No tienes créditos activos para este plan. ¿Te gustaría adquirir un paquete?" : "You do not have active credits for this plan. Would you like to purchase a package?"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button type="button" onClick={() => { setGavetaAvisoCompraAberta(false); setModalidadeSelecionada('acumulador_grupo'); }} className="py-3 bg-slate-900 border border-white/5 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer">
            {idiomaSelecionado === "PT" ? "Não" : "No"}
          </button>
          <button type="button" onClick={() => { setGavetaAvisoCompraAberta(false); setModalCreditosAberto(true); setEtapaPagamento(0); }} className="py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 border-none rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer">
            {idiomaSelecionado === "PT" ? "Sim" : idiomaSelecionado === "ES" ? "Sí" : "Yes"}
          </button>
        </div>
      </div>

    </div>
  );
}
