"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import { DollarSign, Calendar, Clock, Users, User, ShieldCheck, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

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
    cerrarSesion: "Cerrar sesión"
  },
  en: {
    subtitulo: "Teacher Panel",
    misClases: "My classes",
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
    cerrarSesion: "Log out"
  },
  pt: {
    subtitulo: "Painel do Professor",
    misClases: "Minhas aulas",
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
    cerrarSesion: "Sair"
  }
};

export default function PortalProfessor() {
  const [professor, setProfessor] = useState<DadosProfessor | null>(null);
  const [aulas, setAulas] = useState<AulaSlot[]>([]);
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
          .select("id, name, email, monthly_rate, rate_per_class, meeting_link, payment_status")
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
    <div className="min-h-screen bg-[#030914] text-slate-100 flex flex-col md:flex-row">

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
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-semibold transition-all text-left">
              <Calendar size={18} />
              <span>{t.misClases}</span>
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

        <main className="p-6 md:p-10 flex flex-col gap-8 flex-1 overflow-y-auto max-w-6xl w-full mx-auto">

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div className="bg-[#0a1424] border border-cyan-500/20 rounded-xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Clock size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.clasesProgramadas}</span>
                <span className="text-xl font-extrabold text-slate-100">{aulas.length}</span>
              </div>
            </div>
          </section>

          <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
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
              <div className="flex flex-col gap-2">
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

        </main>
      </div>
    </div>
  );
}
