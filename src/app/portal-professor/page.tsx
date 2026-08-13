"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import { DollarSign, Calendar, Clock, Users, User, ShieldCheck, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Avaliacao {
  rating_stars: number;
  comment: string | null;
  class_date: string;
}

interface AulaSlot {
  id: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  tipo_aula: string;
  vagas_maximas: number;
  vagas_ocupadas: number;
  status: string;
  idioma: string;
}

interface DadosProfessor {
  id: string;
  name: string;
  email: string;
  monthly_rate: number | null;
  rate_per_class: number | null;
  meeting_link: string | null;
  payment_status: string | null;
  payment_method: string | null;
  bank_name: string | null;
  account_type: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  document_number: string | null;
  nequi_phone: string | null;
  punctuality_score: number | null;
  pedagogical_score: number | null;
}

type IdiomaInterface = "es" | "en" | "pt";

const TRADUCAO_IDIOMA_AULA: Record<IdiomaInterface, Record<string, string>> = {
  es: { portugues: "Portugués", ingles: "Inglés", espanol: "Español", frances: "Francés" },
  en: { portugues: "Portuguese", ingles: "English", espanol: "Spanish", frances: "French" },
  pt: { portugues: "Português", ingles: "Inglês", espanol: "Espanhol", frances: "Francês" }
};

const TRADUCAO_TIPO_AULA: Record<IdiomaInterface, Record<string, string>> = {
  es: { GRUPO: "Grupo", PARTICULAR: "Particular" },
  en: { GRUPO: "Group", PARTICULAR: "Private" },
  pt: { GRUPO: "Grupo", PARTICULAR: "Particular" }
};

const TEXTOS: Record<IdiomaInterface, Record<string, string>> = {
  es: {
    subtitulo: "Panel del Profesor",
    misClases: "Mis clases",
    datosPago: "Datos de pago",
    prepClase: "Preparacion de clase",
    sesionActiva: "Sesión segura activa",
    conexionActiva: "Conexión segura activa",
    tarifaClase: "Tarifa por clase",
    acumuladoMes: "Acumulado este mes",
    clasesProgramadas: "Clases programadas",
    pagado: "Pagado",
    pendiente: "Pendiente",
    tusClases: "Tus clases",
    horarioReal: "Horario real desde el calendario",
    sinClases: "No hay clases programadas todavía.",
    alumnos: "alumnos",
    entrarClase: "Entrar a la clase",
    cargando: "Cargando tu panel...",
    pesos: "pesos colombianos",
    soporte: "Soporte",
    cerrarSesion: "Cerrar sesión",
    calificacionProm: "Calificacion promedio",
    sinDatos: "Sin datos",
    resena: "resena",
    resenas: "resenas",
    comentariosAlumnos: "Comentarios de tus alumnos",
    puntualidad: "Puntualidad",
    evalPedagogica: "Evaluacion pedagogica"
  },
  en: {
    subtitulo: "Teacher Panel",
    misClases: "My classes",
    datosPago: "Payment data",
    prepClase: "Class preparation",
    sesionActiva: "Secure session active",
    conexionActiva: "Secure connection active",
    tarifaClase: "Rate per class",
    acumuladoMes: "Accrued this month",
    clasesProgramadas: "Scheduled classes",
    pagado: "Paid",
    pendiente: "Pending",
    tusClases: "Your classes",
    horarioReal: "Real schedule from calendar",
    sinClases: "No classes scheduled yet.",
    alumnos: "students",
    entrarClase: "Join class",
    cargando: "Loading your panel...",
    pesos: "Colombian pesos",
    soporte: "Support",
    cerrarSesion: "Log out",
    calificacionProm: "Average rating",
    sinDatos: "No data",
    resena: "review",
    resenas: "reviews",
    comentariosAlumnos: "Comments from your students",
    puntualidad: "Punctuality",
    evalPedagogica: "Pedagogical evaluation"
  },
  pt: {
    subtitulo: "Painel do Professor",
    misClases: "Minhas aulas",
    datosPago: "Dados de pagamento",
    prepClase: "Preparacao de aula",
    sesionActiva: "Sessão segura ativa",
    conexionActiva: "Conexão segura ativa",
    tarifaClase: "Tarifa por aula",
    acumuladoMes: "Acumulado este mês",
    clasesProgramadas: "Aulas programadas",
    pagado: "Pago",
    pendiente: "Pendente",
    tusClases: "Suas aulas",
    horarioReal: "Horário real do calendário",
    sinClases: "Nenhuma aula programada ainda.",
    alumnos: "alunos",
    entrarClase: "Entrar na aula",
    cargando: "Carregando seu painel...",
    pesos: "pesos colombianos",
    soporte: "Suporte",
    cerrarSesion: "Sair",
    calificacionProm: "Avaliacao media",
    sinDatos: "Sem dados",
    resena: "avaliacao",
    resenas: "avaliacoes",
    comentariosAlumnos: "Comentarios dos seus alunos",
    puntualidad: "Pontualidade",
    evalPedagogica: "Avaliacao pedagogica"
  }
};

const INSTRUCCIONES: Record<IdiomaInterface, { titulo: string; texto: string }[]> = {
  es: [
    { titulo: "1. Inicia sesion correctamente", texto: "Usa una ventana de incognito en tu navegador para entrar al Google Meet con el correo de la empresa: docentes.haas@academiahaas.com / contrasena: MeetHaas*2026. Asi evitas conflictos con tu cuenta personal de Gmail." },
    { titulo: "2. Las clases quedan grabadas", texto: "Esto no es para vigilar tu trabajo. Los alumnos piden las grabaciones con frecuencia para repasar la clase, por eso siempre se graba." },
    { titulo: "3. Ten 3 ventanas abiertas", texto: "Se recomienda trabajar con tres ventanas: (1) la ventana de diapositivas que compartes con el alumno, (2) tu propia ventana de diapositivas donde editas en privado, y (3) la ventana del Meet, que puede quedar suelta de fondo, sin necesitar tu atencion constante." },
    { titulo: "4. Comparte solo la ventana correcta", texto: "En Google Meet, al compartir pantalla elige 'Una ventana' y selecciona SOLO la ventana (1), la que el alumno debe ver. Nunca compartas toda tu pantalla ni tu ventana de edicion privada." },
    { titulo: "5. Cuidado al cambiar de diapositiva", texto: "Si editas o cambias de diapositiva en tu ventana privada (2), el alumno NO ve el cambio automaticamente. Debes hacer el mismo cambio en la ventana compartida (1) para que el alumno lo vea." },
    { titulo: "6. Como dividir la pantalla (vista dividida)", texto: "Haz clic en la barra superior de una ventana, mantenla presionada y arrastrala hacia el borde izquierdo o derecho de la pantalla hasta que se pegue. Suelta el clic y elige la otra ventana para el lado restante. En Windows tambien puedes mantener presionado el boton de maximizar para ver mas opciones, incluyendo divisiones en tres partes." },
    { titulo: "6. Abre las diapositivas antes de la clase", texto: "El boton para abrir las diapositivas de tu clase estara disponible aqui mismo, antes de que empiece la clase." }
  ],
  en: [
    { titulo: "1. Log in correctly", texto: "Use an incognito window in your browser to join Google Meet with the company email: docentes.haas@academiahaas.com / password: MeetHaas*2026. This avoids conflicts with your personal Gmail account." },
    { titulo: "2. Classes are recorded", texto: "This is not to monitor your work. Students frequently request recordings to review the class, so every class is recorded." },
    { titulo: "3. Keep 3 windows open", texto: "It is recommended to work with three windows: (1) the slides window you share with the student, (2) your own private slides window where you edit, and (3) the Meet window, which can stay loose in the background without needing your constant attention." },
    { titulo: "4. Share only the right window", texto: "In Google Meet, when sharing your screen choose 'A window' and select ONLY window (1), the one the student should see. Never share your whole screen or your private editing window." },
    { titulo: "5. Be careful when changing slides", texto: "If you edit or change slides in your private window (2), the student does NOT see the change automatically. You must make the same change in the shared window (1) so the student sees it." },
    { titulo: "6. How to split your screen", texto: "Click and hold the title bar of a window, then drag it to the left or right edge of the screen until it snaps. Release, then pick the other window for the remaining side. On Windows you can also hold the maximize button to see more options, including 3-way splits." },
    { titulo: "6. Open the slides before class", texto: "The button to open your class slides will be available right here, before class starts." }
  ],
  pt: [
    { titulo: "1. Faca login corretamente", texto: "Use uma janela anonima no seu navegador para entrar no Google Meet com o e-mail da empresa: docentes.haas@academiahaas.com / senha: MeetHaas*2026. Assim voce evita conflitos com sua conta pessoal do Gmail." },
    { titulo: "2. As aulas ficam gravadas", texto: "Isso nao e para vigiar seu trabalho. Os alunos pedem as gravacoes com frequencia para revisar a aula, por isso sempre gravamos." },
    { titulo: "3. Mantenha 3 janelas abertas", texto: "O recomendado e trabalhar com tres janelas: (1) a janela de slides que voce compartilha com o aluno, (2) sua propria janela de slides onde voce edita em privado, e (3) a janela do Meet, que pode ficar solta ao fundo, sem precisar da sua atencao constante." },
    { titulo: "4. Compartilhe so a janela certa", texto: "No Google Meet, ao compartilhar tela escolha 'Uma janela' e selecione SO a janela (1), a que o aluno deve ver. Nunca compartilhe a tela inteira nem sua janela de edicao privada." },
    { titulo: "5. Cuidado ao trocar de slide", texto: "Se voce editar ou trocar de slide na sua janela privada (2), o aluno NAO ve a mudanca automaticamente. Voce precisa fazer a mesma mudanca na janela compartilhada (1) pra que o aluno veja." },
    { titulo: "6. Como dividir a tela", texto: "Clique e segure na barra superior de uma janela, e arraste ate a borda esquerda ou direita da tela ate ela grudar. Solte o clique e escolha a outra janela pro lado restante. No Windows voce tambem pode segurar o botao de maximizar pra ver mais opcoes, incluindo divisao em tres partes." },
    { titulo: "6. Abra os slides antes da aula", texto: "O botao pra abrir os slides da sua aula vai estar disponivel aqui mesmo, antes de a aula comecar." }
  ]
};

export default function PortalProfessor() {
  const [professor, setProfessor] = useState<DadosProfessor | null>(null);
  const [aulas, setAulas] = useState<AulaSlot[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [fuso, setFuso] = useState<"colombia" | "brasilia">("colombia");
  const [idioma, setIdioma] = useState<IdiomaInterface>("es");

  useEffect(() => {
    const fusoSalvo = localStorage.getItem("haas_professor_fuso");
    const idiomaSalvo = localStorage.getItem("haas_professor_idioma");
    if (fusoSalvo === "colombia" || fusoSalvo === "brasilia") setFuso(fusoSalvo);
    if (idiomaSalvo === "es" || idiomaSalvo === "en" || idiomaSalvo === "pt") setIdioma(idiomaSalvo);
  }, []);

  useEffect(() => {
    localStorage.setItem("haas_professor_fuso", fuso);
  }, [fuso]);

  useEffect(() => {
    localStorage.setItem("haas_professor_idioma", idioma);
  }, [idioma]);

  const [vistaAtiva, setVistaAtiva] = useState<"aulas" | "pago" | "prep">("aulas");
  const [pagoAberto, setPagoAberto] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"banco" | "nequi">("banco");
  const [formPago, setFormPago] = useState({
    bank_name: "", account_type: "Ahorros", account_number: "", account_holder_name: "", document_number: "", nequi_phone: ""
  });
  const [salvandoPago, setSalvandoPago] = useState(false);
  const [pagoSalvoMsg, setPagoSalvoMsg] = useState("");

  useEffect(() => {
    if (professor) {
      setMetodoPago((professor.payment_method as "banco" | "nequi") || "banco");
      setFormPago({
        bank_name: professor.bank_name || "",
        account_type: professor.account_type || "Ahorros",
        account_number: professor.account_number || "",
        account_holder_name: professor.account_holder_name || "",
        document_number: professor.document_number || "",
        nequi_phone: professor.nequi_phone || ""
      });
    }
  }, [professor]);

  const salvarDadosPago = async () => {
    if (!professor) return;
    setSalvandoPago(true);
    setPagoSalvoMsg("");
    const { error } = await supabase
      .from("teachers")
      .update({
        payment_method: metodoPago,
        bank_name: formPago.bank_name,
        account_type: formPago.account_type,
        account_number: formPago.account_number,
        account_holder_name: formPago.account_holder_name,
        document_number: formPago.document_number,
        nequi_phone: formPago.nequi_phone
      })
      .eq("id", professor.id);
    setSalvandoPago(false);
    setPagoSalvoMsg(error ? "error" : "ok");
    if (!error) {
      setProfessor({
        ...professor,
        payment_method: metodoPago,
        bank_name: formPago.bank_name,
        account_type: formPago.account_type,
        account_number: formPago.account_number,
        account_holder_name: formPago.account_holder_name,
        document_number: formPago.document_number,
        nequi_phone: formPago.nequi_phone
      });
      setPagoAberto(false);
    }
  };
  const [perfilAberto, setPerfilAberto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("haas_teacher_id");
    localStorage.removeItem("haas_teacher_email");
    localStorage.removeItem("haas_teacher_name");
    window.location.href = "/login";
  };

  const t = TEXTOS[idioma];

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const teacherId = localStorage.getItem("haas_teacher_id");
        if (!teacherId) {
          setErro("Sesión no encontrada. Por favor inicia sesión de nuevo.");
          setLoading(false);
          return;
        }

        const { data: dadosProfessor, error: erroProfessor } = await supabase
          .from("teachers")
          .select("id, name, email, monthly_rate, rate_per_class, meeting_link, payment_status, payment_method, bank_name, account_type, account_number, account_holder_name, document_number, nequi_phone, punctuality_score, pedagogical_score")
          .eq("id", teacherId)
          .maybeSingle();

        if (erroProfessor || !dadosProfessor) {
          setErro("No se pudo cargar tu información. Contacta a soporte.");
          setLoading(false);
          return;
        }

        setProfessor(dadosProfessor);

        const { data: aulasReais, error: erroAulas } = await supabase
          .from("aulas_disponiveis")
          .select("id, data_hora_inicio, data_hora_fim, tipo_aula, vagas_maximas, vagas_ocupadas, status, idioma")
          .eq("teacher_id", teacherId)
          .order("data_hora_inicio", { ascending: true });

        if (!erroAulas && aulasReais) {
          setAulas(aulasReais);
        }

        const { data: avaliacoesReais } = await supabase
          .from("teacher_reviews")
          .select("rating_stars, comment, class_date")
          .eq("teacher_name", dadosProfessor.name)
          .order("class_date", { ascending: false });

        if (avaliacoesReais) {
          setAvaliacoes(avaliacoesReais);
        }
      } catch (err) {
        console.error("Error al cargar datos del profesor:", err);
        setErro("Ocurrió un error inesperado.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const formatarMoeda = (valor: number | null) => {
    if (valor === null || valor === undefined) return "N/D";
    const formatado = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
    return `${formatado} ${t.pesos}`;
  };

  const formatarHorario = (iso: string) => {
    const zona = fuso === "colombia" ? "America/Bogota" : "America/Sao_Paulo";
    const etiqueta = fuso === "colombia" ? "Bogotá" : "Brasilia";
    return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: zona }) + ` (${etiqueta})`;
  };

  const notaMedia = avaliacoes.length > 0
    ? (avaliacoes.reduce((soma, a) => soma + a.rating_stars, 0) / avaliacoes.length).toFixed(1)
    : null;

  const agora = new Date();
  const acumuladoMes = aulas
    .filter(a => {
      const dataFim = new Date(a.data_hora_fim);
      const jaAconteceu = dataFim < agora;
      const mesmoMes = dataFim.getMonth() === agora.getMonth() && dataFim.getFullYear() === agora.getFullYear();
      const naoCancelada = a.status !== "CANCELADO";
      return jaAconteceu && mesmoMes && naoCancelada;
    })
    .reduce((total) => total + (professor?.rate_per_class || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
        <p className="text-sm font-medium">{t.cargando}</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center">
        <p className="text-sm font-medium text-rose-400">{erro}</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#030914] text-slate-100 flex flex-col md:flex-row">
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <aside className="w-full md:w-64 bg-[#0a1424] border-r border-white/10 p-6 flex flex-col justify-between gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center font-black text-slate-950 text-lg">
              P
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-100">Haas Docente</h1>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{t.subtitulo}</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button onClick={() => setVistaAtiva("aulas")} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${vistaAtiva === "aulas" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}`}>
              <Calendar size={18} />
              <span>{t.misClases}</span>
            </button>
            <button onClick={() => setVistaAtiva("pago")} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${vistaAtiva === "pago" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}`}>
              <DollarSign size={18} />
              <span>{t.datosPago}</span>
            </button>
            <button onClick={() => setVistaAtiva("prep")} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${vistaAtiva === "prep" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}`}>
              <ExternalLink size={18} />
              <span>{t.prepClase}</span>
            </button>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4 flex flex-col gap-2 relative">
          <button onClick={() => setPerfilAberto(!perfilAberto)} className="flex items-center gap-3 text-left w-full">
            <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <User size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{professor?.name || "Profesor"}</span>
              <span className="text-[10px] text-slate-500">{t.sesionActiva}</span>
            </div>
          </button>
          {perfilAberto && (
            <div className="flex flex-col gap-1.5 bg-white/5 border border-white/10 rounded-lg p-2">
              <a href="https://api.whatsapp.com/send/?phone=5491168809228&text&type=phone_number&app_absent=0" target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-300 hover:text-cyan-400 px-2 py-1.5 rounded transition-colors text-left"
              >
                {t.soporte}
              </a>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1.5 rounded transition-colors text-left"
              >
                {t.cerrarSesion}
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        <header className="h-16 border-b border-white/10 bg-[#030914]/80 backdrop-blur-md px-6 md:px-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium truncate">{t.conexionActiva}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIdioma(idioma === "es" ? "en" : idioma === "en" ? "pt" : "es")}
              className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-all"
            >
              {idioma === "es" ? "Español" : idioma === "en" ? "English" : "Português"}
            </button>
            <button
              onClick={() => setFuso(fuso === "colombia" ? "brasilia" : "colombia")}
              className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-all"
            >
              {fuso === "colombia" ? "Bogotá" : "Brasilia"}
            </button>
          </div>
        </header>

        <main className="p-6 md:p-10 flex flex-col gap-8 flex-1 overflow-hidden max-w-6xl w-full mx-auto">

          {vistaAtiva === "aulas" && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0a1424] border border-cyan-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Calendar size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.clasesProgramadas}</span>
                    <span className="text-xl font-extrabold text-slate-100">{aulas.length}</span>
                  </div>
                </div>

                <div className="bg-[#0a1424] border border-amber-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
                    <Users size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.calificacionProm}</span>
                    <span className="text-xl font-extrabold text-slate-100">{notaMedia ? `${notaMedia} / 5` : t.sinDatos}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{avaliacoes.length} {avaliacoes.length === 1 ? t.resena : t.resenas}</span>
                  </div>
                </div>

                <div className="bg-[#0a1424] border border-emerald-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Clock size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.puntualidad}</span>
                    <span className="text-xl font-extrabold text-slate-100">{professor?.punctuality_score !== null && professor?.punctuality_score !== undefined ? `${professor.punctuality_score}%` : t.sinDatos}</span>
                  </div>
                </div>

                <div className="bg-[#0a1424] border border-purple-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.evalPedagogica}</span>
                    <span className="text-xl font-extrabold text-slate-100">{professor?.pedagogical_score !== null && professor?.pedagogical_score !== undefined ? `${professor.pedagogical_score} / 10` : t.sinDatos}</span>
                  </div>
                </div>
              </section>

              <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
                  <div>
                    <h2 className="font-bold text-base text-slate-200">{t.tusClases}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{t.horarioReal}</p>
                  </div>
                </div>

                {aulas.length === 0 ? (
                  <div className="text-center py-12 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl">
                    {t.sinClases}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-hide">
                    {aulas.map((aula) => (
                      <div key={aula.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-4 hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3">
                          <Users size={16} className="text-cyan-400" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-200">{TRADUCAO_TIPO_AULA[idioma][aula.tipo_aula] || aula.tipo_aula} - {TRADUCAO_IDIOMA_AULA[idioma][aula.idioma] || aula.idioma}</span>
                            <span className="text-xs text-slate-500 font-mono">{formatarHorario(aula.data_hora_inicio)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">{aula.vagas_ocupadas}/{aula.vagas_maximas} {t.alumnos}</span>
                          {professor?.meeting_link && (
                            <a href={professor.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold py-1.5 px-3 rounded-lg transition-all">
                              {t.entrarClase} <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {vistaAtiva === "pago" && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0a1424] border border-emerald-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <DollarSign size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.tarifaClase}</span>
                    <span className="text-xl font-extrabold text-slate-100">{formatarMoeda(professor?.rate_per_class ?? null)}</span>
                  </div>
                </div>

                <div className="bg-[#0a1424] border border-purple-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                    <DollarSign size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.acumuladoMes}</span>
                    <span className="text-xl font-extrabold text-slate-100">{formatarMoeda(acumuladoMes)}</span>
                    <span className={`text-[10px] font-semibold mt-0.5 ${professor?.payment_status === "pagado" ? "text-emerald-400" : "text-amber-400"}`}>
                      {professor?.payment_status === "pagado" ? t.pagado : t.pendiente}
                    </span>
                  </div>
                </div>
              </section>

              <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <h2 className="font-bold text-base text-slate-200">Datos de pago</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Completa tus datos para recibir el pago sin tener que contactarnos</p>
                  </div>
                  <button onClick={() => setPagoAberto(!pagoAberto)} className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-all">
                    {pagoAberto ? "Ocultar" : (professor?.payment_method ? "Editar" : "Completar")}
                  </button>
                </div>

                {professor?.payment_method && !pagoAberto && (
                  <div className="text-xs text-slate-400 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    {professor.payment_method === "banco" ? `Cuenta bancaria: ${professor.bank_name || ""} - ${professor.account_number || ""}` : `Nequi: ${professor.nequi_phone || ""}`}
                  </div>
                )}

                {pagoAberto && (
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <button onClick={() => setMetodoPago("banco")} className={`flex-1 text-xs py-2 rounded-lg font-semibold border transition-all ${metodoPago === "banco" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-slate-400 border-white/10"}`}>
                        Cuenta bancaria
                      </button>
                      <button onClick={() => setMetodoPago("nequi")} className={`flex-1 text-xs py-2 rounded-lg font-semibold border transition-all ${metodoPago === "nequi" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-slate-400 border-white/10"}`}>
                        Nequi
                      </button>
                    </div>

                    {metodoPago === "banco" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={formPago.bank_name} onChange={(e) => setFormPago({ ...formPago, bank_name: e.target.value })} placeholder="Nombre del banco" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                        <select value={formPago.account_type} onChange={(e) => setFormPago({ ...formPago, account_type: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/50">
                          <option value="Ahorros">Cuenta de ahorros</option>
                          <option value="Corriente">Cuenta corriente</option>
                        </select>
                        <input value={formPago.account_number} onChange={(e) => setFormPago({ ...formPago, account_number: e.target.value })} placeholder="Numero de cuenta" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                        <input value={formPago.account_holder_name} onChange={(e) => setFormPago({ ...formPago, account_holder_name: e.target.value })} placeholder="Nombre del titular" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                        <input value={formPago.document_number} onChange={(e) => setFormPago({ ...formPago, document_number: e.target.value })} placeholder="Numero de cedula" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50 sm:col-span-2" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={formPago.nequi_phone} onChange={(e) => setFormPago({ ...formPago, nequi_phone: e.target.value })} placeholder="Numero de celular con Nequi" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                        <input value={formPago.account_holder_name} onChange={(e) => setFormPago({ ...formPago, account_holder_name: e.target.value })} placeholder="Nombre del titular" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button onClick={salvarDadosPago} disabled={salvandoPago} className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold py-2 px-4 rounded-lg transition-all">
                        {salvandoPago ? "Guardando..." : "Guardar datos"}
                      </button>
                      {pagoSalvoMsg === "ok" && <span className="text-xs text-emerald-400 font-semibold">Guardado correctamente</span>}
                      {pagoSalvoMsg === "error" && <span className="text-xs text-rose-400 font-semibold">Error al guardar, intenta de nuevo</span>}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {vistaAtiva === "prep" && (
            <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6">
                <h2 className="font-bold text-base text-slate-200 mb-4">
                  {idioma === "es" ? "Como dar tu clase" : idioma === "en" ? "How to run your class" : "Como dar sua aula"}
                </h2>
                <div className="flex flex-col gap-3">
                  {INSTRUCCIONES[idioma].map((item, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                      <p className="text-sm font-semibold text-cyan-400 mb-1">{item.titulo}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.texto}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6">
                <h2 className="font-bold text-base text-slate-200 mb-1">
                  {idioma === "es" ? "Evaluar clase" : idioma === "en" ? "Evaluate class" : "Avaliar aula"}
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  {idioma === "es" ? "Al terminar la clase, califica brevemente como te fue" : idioma === "en" ? "After class, briefly rate how it went" : "Ao terminar a aula, avalie brevemente como foi"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/50">
                    <option value="">{idioma === "es" ? "Selecciona la clase" : idioma === "en" ? "Select the class" : "Selecione a aula"}</option>
                    {aulas.map((aula) => (
                      <option key={aula.id} value={aula.id}>{formatarHorario(aula.data_hora_inicio)}</option>
                    ))}
                  </select>
                  <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold py-2 px-4 rounded-lg transition-all">
                    {idioma === "es" ? "Guardar" : idioma === "en" ? "Save" : "Salvar"}
                  </button>
                </div>
              </section>
            </div>
          )}

        </main>      </div>
    </div>
  );
}
