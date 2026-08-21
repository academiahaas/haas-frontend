"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Users, Loader2, LogOut, Shield } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Funcionario {
  id: string;
  name: string;
  email: string;
  current_level: string | null;
  score_fala: number | null;
  score_escuta: number | null;
  score_leitura: number | null;
  score_escrita: number | null;
  score_gramatica: number | null;
  attendance_percentage: number | null;
  corporate_group_id: string | null;
}

export default function PortalEmpresa() {
  const [modalPresenca, setModalPresenca] = useState<{ userId: string; nome: string } | null>(null);
  const [diasPresenca, setDiasPresenca] = useState<any[]>([]);
  const [carregandoPresenca, setCarregandoPresenca] = useState(false);

  const abrirPresenca = async (userId: string, nome: string) => {
    setModalPresenca({ userId, nome });
    setCarregandoPresenca(true);
    const { data: matriculas } = await supabase
      .from("aula_matriculas")
      .select("aula_id, aulas_disponiveis!inner(data_hora_fim)")
      .eq("user_id", userId)
      .lt("aulas_disponiveis.data_hora_fim", new Date().toISOString())
      .order("aulas_disponiveis(data_hora_fim)", { ascending: false })
      .limit(60);
    const { data: avaliacoes } = await supabase
      .from("class_evaluations")
      .select("aula_id, presente")
      .eq("user_id", userId);
    const mapaPresenca = new Map((avaliacoes || []).map((a: any) => [a.aula_id, a.presente]));
    const lista = (matriculas || []).map((m: any) => ({
      data: m.aulas_disponiveis?.data_hora_fim,
      presente: mapaPresenca.has(m.aula_id) ? mapaPresenca.get(m.aula_id) : null,
    }));
    setDiasPresenca(lista);
    setCarregandoPresenca(false);
  };

  const [empresa, setEmpresa] = useState<{ id: string; company_name: string } | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [valorMensal, setValorMensal] = useState<number | null>(null);
  const [planos, setPlanos] = useState<any[]>([]);
  const [planoSelecionado, setPlanoSelecionado] = useState<any>(null);
  const [mostrarOpcoesPagamento, setMostrarOpcoesPagamento] = useState(false);
  const [descontoConfig, setDescontoConfig] = useState({ desconto_por_pessoa: 1.5, desconto_maximo: 25 });
  const [simPlano, setSimPlano] = useState<any>(null);
  const [simPessoas, setSimPessoas] = useState(1);
  const [criandoCobranca, setCriandoCobranca] = useState(false);
  const [cobrancaMsg, setCobrancaMsg] = useState("");
  const [mostrarPago, setMostrarPago] = useState(true);
  const [mostrarGrupos, setMostrarGrupos] = useState(true);
  const [mostrarSimulador, setMostrarSimulador] = useState(false);
  const [etapaCompra, setEtapaCompra] = useState("simulando");
  const [emailsColaboradores, setEmailsColaboradores] = useState("");
  const [enviandoEmails, setEnviandoEmails] = useState(false);
  const [emailsEnviadosMsg, setEmailsEnviadosMsg] = useState("");
  const [mostrarDesempeno, setMostrarDesempeno] = useState(true);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [idioma, setIdiomaState] = useState<"PT" | "ES" | "EN">(() => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem("haas_corporate_idioma");
      if (salvo === "PT" || salvo === "ES" || salvo === "EN") return salvo;
    }
    return "ES";
  });
  const setIdioma = (l: "PT" | "ES" | "EN") => {
    setIdiomaState(l);
    if (typeof window !== "undefined") localStorage.setItem("haas_corporate_idioma", l);
  };

  const dict = {
    PT: {
      painelCorporativo: "Painel Corporativo",
      sairSessao: "Sair da sessão",
      colaboradores: "Colaboradores",
      valorMensalAtual: "Valor mensal atual",
      gerenciarPlano: "Gerenciar plano",
      gerenciarPlanoDesc: "Simule, convide colaboradores e pague",
      gruposHorarios: "Grupos e horários",
      ocultar: "Ocultar",
      mostrar: "Mostrar",
      semGrupos: "Nenhum grupo cadastrado ainda.",
      horarioNaoDefinido: "Horário não definido",
      pessoa: "pessoa",
      pessoas: "pessoas",
      semMembros: "Sem membros",
      desempenhoColaboradores: "Desempenho dos colaboradores",
      semColaboradores: "Nenhum colaborador cadastrado ainda.",
      nome: "Nome",
      nivel: "Nível",
      fala: "Fala",
      escuta: "Escuta",
      leitura: "Leitura",
      escrita: "Escrita",
      gramatica: "Gramática",
      media: "Média",
      frequencia: "Frequência",
      carregandoPainel: "Carregando painel...",
      convidarColaboradores: "Convidar colaboradores",
      convidarDesc: "Insira os emails das pessoas que vão estudar. Vamos enviar um email de boas-vindas com o link pra fazer a prova de nivelamento.",
      emailsLabel: "Emails (um por linha)",
      previaEmail: "Prévia do email que eles vão receber:",
      bemVindoTitulo: "Bem-vindo à Haas Language",
      empresaInscreveu: "te inscreveu no nosso programa de idiomas.",
      provaNivelamentoDesc: "Para começar, é necessário fazer uma breve prova de nivelamento. Isso nos permite te colocar no nível certo desde o primeiro dia.",
      fazerProva: "Fazer prova de nivelamento",
      enviando: "Enviando...",
      aprovarEnviar: "Aprovar e enviar emails"
    },
    ES: {
      painelCorporativo: "Panel Corporativo",
      sairSessao: "Cerrar sesión",
      colaboradores: "Colaboradores",
      valorMensalAtual: "Valor mensual actual",
      gerenciarPlano: "Gestionar plan",
      gerenciarPlanoDesc: "Simula, invita colaboradores y paga",
      gruposHorarios: "Grupos y horarios",
      ocultar: "Ocultar",
      mostrar: "Mostrar",
      semGrupos: "No hay grupos registrados todavía.",
      horarioNaoDefinido: "Horario no definido",
      pessoa: "persona",
      pessoas: "personas",
      semMembros: "Sin miembros",
      desempenhoColaboradores: "Desempeño de los colaboradores",
      semColaboradores: "No hay colaboradores registrados todavía.",
      nome: "Nombre",
      nivel: "Nivel",
      fala: "Habla",
      escuta: "Escucha",
      leitura: "Lectura",
      escrita: "Escritura",
      gramatica: "Gramática",
      media: "Promedio",
      frequencia: "Asistencia",
      carregandoPainel: "Cargando panel...",
      convidarColaboradores: "Invitar colaboradores",
      convidarDesc: "Ingresa los correos de las personas que van a estudiar. Les enviaremos un correo de bienvenida con el enlace para hacer la prueba de nivelación.",
      emailsLabel: "Correos electrónicos (uno por línea)",
      previaEmail: "Vista previa del correo que van a recibir:",
      bemVindoTitulo: "Bienvenido a Haas Language",
      empresaInscreveu: "te ha inscrito en nuestro programa de idiomas.",
      provaNivelamentoDesc: "Para comenzar, es necesario que realices una breve prueba de nivelación. Esto nos permite ubicarte en el nivel correcto desde el primer día.",
      fazerProva: "Hacer prueba de nivelación",
      enviando: "Enviando...",
      aprovarEnviar: "Aprobar y enviar correos"
    },
    EN: {
      painelCorporativo: "Corporate Panel",
      sairSessao: "Log out",
      colaboradores: "Employees",
      valorMensalAtual: "Current monthly fee",
      gerenciarPlano: "Manage plan",
      gerenciarPlanoDesc: "Simulate, invite employees and pay",
      gruposHorarios: "Groups and schedules",
      ocultar: "Hide",
      mostrar: "Show",
      semGrupos: "No groups registered yet.",
      horarioNaoDefinido: "Schedule not set",
      pessoa: "person",
      pessoas: "people",
      semMembros: "No members",
      desempenhoColaboradores: "Employee performance",
      semColaboradores: "No employees registered yet.",
      nome: "Name",
      nivel: "Level",
      fala: "Speaking",
      escuta: "Listening",
      leitura: "Reading",
      escrita: "Writing",
      gramatica: "Grammar",
      media: "Average",
      frequencia: "Attendance",
      carregandoPainel: "Loading panel...",
      convidarColaboradores: "Invite employees",
      convidarDesc: "Enter the emails of the people who will study. We will send a welcome email with the link to take the placement test.",
      emailsLabel: "Emails (one per line)",
      previaEmail: "Preview of the email they will receive:",
      bemVindoTitulo: "Welcome to Haas Language",
      empresaInscreveu: "enrolled you in our language program.",
      provaNivelamentoDesc: "To get started, you need to take a short placement test. This lets us place you at the right level from day one.",
      fazerProva: "Take placement test",
      enviando: "Sending...",
      aprovarEnviar: "Approve and send emails"
    }
  };
  const t = dict[idioma];

  const traduzirDias = (texto: string) => {
    if (!texto) return texto;
    const mapa: Record<string, { PT: string; EN: string }> = {
      lunes: { PT: "Segunda", EN: "Monday" },
      martes: { PT: "Terça", EN: "Tuesday" },
      miercoles: { PT: "Quarta", EN: "Wednesday" },
      jueves: { PT: "Quinta", EN: "Thursday" },
      viernes: { PT: "Sexta", EN: "Friday" },
      sabado: { PT: "Sábado", EN: "Saturday" },
      domingo: { PT: "Domingo", EN: "Sunday" },
      y: { PT: "e", EN: "and" }
    };
    if (idioma === "ES") {
      const mapaAcentos: Record<string, string> = { miercoles: "Miércoles", sabado: "Sábado" };
      return texto.split(" ").map((p) => {
        const chave = p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return mapaAcentos[chave] || p;
      }).join(" ");
    }
    return texto.split(" ").map((p) => {
      const chave = p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return mapa[chave] ? mapa[chave][idioma] : p;
    }).join(" ");
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const corporateId = localStorage.getItem("haas_corporate_id");
        const corporateName = localStorage.getItem("haas_corporate_name");
        if (!corporateId) {
          setErro("Sesion no encontrada. Por favor inicia sesion de nuevo.");
          setLoading(false);
          return;
        }

        setEmpresa({ id: corporateId, company_name: corporateName || "Empresa" });

        const { data: funcionariosReais } = await supabase
          .from("users")
          .select("id, name, email, current_level, score_fala, score_escuta, score_leitura, score_escrita, score_gramatica, attendance_percentage, corporate_group_id")
          .eq("corporate_account_id", corporateId);

        if (funcionariosReais) setFuncionarios(funcionariosReais);

        const { data: gruposReais } = await supabase
          .from("corporate_groups")
          .select("id, nome, frequencia, horario, dias_semana, plan_key")
          .eq("corporate_account_id", corporateId);

        if (gruposReais) {
          setGrupos(gruposReais.map((g) => ({
            ...g,
            membros: (funcionariosReais || []).filter((f: any) => f.corporate_group_id === g.id)
          })));
        }

        const { data: dadosEmpresa } = await supabase
          .from("corporate_accounts")
          .select("valor_mensal, moeda")
          .eq("id", corporateId)
          .maybeSingle();

        if (dadosEmpresa?.valor_mensal) setValorMensal(dadosEmpresa.valor_mensal);

        const { data: planosReais } = await supabase
          .from("corporate_plan_prices")
          .select("plan_key, plan_label, price")
          .order("price");

        if (planosReais && planosReais.length > 0) {
          setPlanos(planosReais);
          setSimPlano(planosReais[0]);
          const gruposDoPrimeiroPlano = (gruposReais || []).filter((g: any) => g.plan_key === planosReais[0].plan_key);
          const alunosIniciais = gruposDoPrimeiroPlano.reduce((total: number, g: any) => {
            const membros = (funcionariosReais || []).filter((f: any) => f.corporate_group_id === g.id);
            return total + membros.length;
          }, 0);
          setSimPessoas(Math.max(1, alunosIniciais));
        }

        const { data: descontoReal } = await supabase
          .from("corporate_discount_config")
          .select("desconto_por_pessoa, desconto_maximo")
          .limit(1)
          .maybeSingle();

        if (descontoReal) setDescontoConfig(descontoReal);
      } catch (err) {
        console.error("Error al cargar datos de la empresa:", err);
        setErro("Ocurrio un error inesperado.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("haas_corporate_id");
    localStorage.removeItem("haas_corporate_email");
    localStorage.removeItem("haas_corporate_name");
    window.location.href = "/login";
  };

  const centavosUnicos = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
    return (hash % 95) + 1;
  };

  const handlePagar = async (metodo: string, valorExacto: number) => {
    if (!empresa || !valorMensal) return;
    setCriandoCobranca(true);
    setCobrancaMsg("");
    try {
      const email = localStorage.getItem("haas_corporate_email") || "";
      const res = await fetch("/api/portal-empresa/criar-cobranca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ corporate_account_id: empresa.id, boss_email: email, amount: valorExacto })
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.error);
      setCobrancaMsg("Cobranza registrada. Completa el pago en la ventana que se abrio.");
      window.open("https://checkout.nequi.wompi.co/l/Nhopn2", "_blank");
    } catch (e: any) {
      setCobrancaMsg("Error: " + e.message);
    } finally {
      setCriandoCobranca(false);
    }
  };

  const handleEnviarOnboarding = async () => {
    const lista = emailsColaboradores.split(/[\n,]/).map((e) => e.trim()).filter((e) => e.includes("@"));
    if (lista.length === 0) return;
    setEnviandoEmails(true);
    setEmailsEnviadosMsg("");
    try {
      const linkNivelamento = "https://campus.academiahaas.com/diagnostico";
      const corpoHtml = `<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;"><h2>Bienvenido a Haas Language</h2><p>Tu empresa te ha inscrito en nuestro programa de idiomas. Para comenzar, realiza tu prueba de nivelacion aqui:</p><p><a href="${linkNivelamento}" style="background:#06b6d4;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Hacer prueba de nivelacion</a></p><hr/><p style="color:#999;font-size:11px;">Haas Language</p></div>`;

      for (const email of lista) {
        await fetch("/api/email/enviar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinatario: email, assunto: "Bienvenido a Haas Language - Prueba de nivelacion", corpoHtml })
        });
      }
      setEmailsEnviadosMsg(`${lista.length} correo(s) enviado(s) con exito.`);
      setEtapaCompra("pago");
    } catch (e) {
      setEmailsEnviadosMsg("Error al enviar los correos.");
    } finally {
      setEnviandoEmails(false);
    }
  };

  const calcularValorMensalReal = () => {
    let totalGeral = 0;
    grupos.forEach((g) => {
      const plano = planos.find((p) => p.plan_key === g.plan_key);
      if (!plano) return;
      const pessoas = g.membros.length;
      if (pessoas === 0) return;
      const desconto = Math.min(descontoConfig.desconto_maximo, (pessoas - 1) * descontoConfig.desconto_por_pessoa);
      totalGeral += Number(plano.price) * pessoas * (1 - desconto / 100);
    });
    return Math.round(totalGeral);
  };

  const mediaGeral = (f: Funcionario) => {
    const notas = [f.score_fala, f.score_escuta, f.score_leitura, f.score_escrita, f.score_gramatica].filter(
      (n) => n !== null && n !== undefined
    ) as number[];
    if (notas.length === 0) return null;
    return Math.round(notas.reduce((a, b) => a + b, 0) / notas.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
        <p className="text-sm font-medium">{t.carregandoPainel}</p>
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

  const bossEmail = typeof window !== "undefined" ? (localStorage.getItem("haas_corporate_email") || "haas") : "haas";
  const centavos = centavosUnicos(bossEmail);
  const totalGateway = valorMensal ? Math.round(valorMensal * 1.05) - centavos : 0;
  const totalBreB = valorMensal ? valorMensal - centavos : 0;

  return (
    <div className="h-screen overflow-hidden bg-[#030914] text-slate-100 flex flex-col">
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <header className="h-16 border-b border-white/10 bg-[#0a1424] px-6 md:px-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center font-black text-slate-950">
            <Building2 size={18} />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100">{empresa?.company_name}</h1>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{t.painelCorporativo}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(["PT", "ES", "EN"] as const).map((l) => (
              <button key={l} onClick={() => setIdioma(l)} className={`text-[10px] font-bold px-2 py-1 rounded ${idioma === l ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500"}`}>{l}</button>
            ))}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors">
            <LogOut size={14} /> {t.sairSessao}
          </button>
        </div>
      </header>

      <main className="p-4 md:p-6 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="flex flex-col gap-4 min-h-0">

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-[#0a1424] border border-cyan-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Users size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t.colaboradores}</span>
                <span className="text-lg font-extrabold text-slate-100">{funcionarios.length}</span>
              </div>
            </div>
            <div className="bg-[#0a1424] border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Building2 size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t.valorMensalAtual}</span>
                <span className="text-lg font-extrabold text-slate-100">{calcularValorMensalReal() > 0 ? `$${calcularValorMensalReal().toLocaleString("es-CO")}` : "-"}</span>
              </div>
            </div>
          </div>

          <Link href="/portal-empresa/gestionar" className="block bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/30 hover:border-purple-500/50 rounded-xl p-4 shrink-0 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-100">{t.gerenciarPlano}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{t.gerenciarPlanoDesc}</p>
              </div>
              <span className="text-purple-400 text-lg">&rarr;</span>
            </div>
          </Link>

          <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="font-bold text-sm text-slate-200">{t.gruposHorarios}</h2>
              <button onClick={() => setMostrarGrupos(!mostrarGrupos)} className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded">
                {mostrarGrupos ? t.ocultar : t.mostrar}
              </button>
            </div>
            {mostrarGrupos && (
              grupos.length === 0 ? (
                <p className="text-xs text-slate-500 mt-2">{t.semGrupos}</p>
              ) : (
                <div className="flex flex-col gap-2 mt-2 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                  {grupos.map((g) => (
                    <div key={g.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 shrink-0">
                      <p className="text-sm font-bold text-slate-200">
                        {traduzirDias(g.dias_semana || g.frequencia) || t.horarioNaoDefinido} {g.horario ? `- ${g.horario}` : ""}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{g.membros.length} {g.membros.length === 1 ? t.pessoa : t.pessoas}</p>
                      <p className="text-[11px] text-cyan-400 mt-1">{g.membros.map((m: any) => m.name || m.email).join(", ") || t.semMembros}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

        </div>
        {etapaCompra === "emails" ? (
          <div className="bg-[#0a1424] border border-purple-500/30 rounded-xl p-6 flex flex-col min-h-0 overflow-y-auto scrollbar-hide">
            <h2 className="font-bold text-xl text-slate-100 mb-2">{t.convidarColaboradores}</h2>
            <p className="text-sm text-slate-400 mb-6">{t.convidarDesc}</p>

            <label className="text-sm font-bold text-slate-300 mb-2">{t.emailsLabel}</label>
            <textarea
              rows={6}
              value={emailsColaboradores}
              onChange={(e) => setEmailsColaboradores(e.target.value)}
              placeholder={"juan@empresa.com\nmaria@empresa.com\ncarlos@empresa.com"}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-slate-200 placeholder-slate-500 mb-6"
            />

            <p className="text-sm font-bold text-slate-300 mb-2">{t.previaEmail}</p>
            <div className="bg-white rounded-xl p-6 mb-6 text-slate-900">
              <p className="text-lg font-bold mb-3">{t.bemVindoTitulo}</p>
              <p className="text-sm leading-relaxed mb-3">
                <strong>{empresa?.company_name}</strong> {t.empresaInscreveu}
              </p>
              <p className="text-sm leading-relaxed mb-4">
                {t.provaNivelamentoDesc}
              </p>
              <div className="bg-cyan-500 text-slate-950 font-bold text-sm text-center py-3 rounded-lg">
                {t.fazerProva}
              </div>
            </div>

            <button onClick={handleEnviarOnboarding} disabled={enviandoEmails} className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm uppercase tracking-wider transition-all">
              {enviandoEmails ? t.enviando : t.aprovarEnviar}
            </button>
            {emailsEnviadosMsg && <p className="text-sm text-emerald-400 mt-3 text-center">{emailsEnviadosMsg}</p>}
          </div>
        ) : (
        <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="font-bold text-sm text-slate-200">{t.desempenhoColaboradores}</h2>
            <button onClick={() => setMostrarDesempeno(!mostrarDesempeno)} className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded">
              {mostrarDesempeno ? t.ocultar : t.mostrar}
            </button>
          </div>
          {mostrarDesempeno && (funcionarios.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl mt-2">
              {t.semColaboradores}
            </div>
          ) : (
            <div className="overflow-auto mt-2 flex-1 min-h-0 scrollbar-hide">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500 uppercase text-[10px] border-b border-white/10 sticky top-0 bg-[#0a1424]">
                    <th className="pb-2 pr-4">{t.nome}</th>
                    <th className="pb-2 pr-4">{t.nivel}</th>
                    <th className="pb-2 pr-4">{t.fala}</th>
                    <th className="pb-2 pr-4">{t.escuta}</th>
                    <th className="pb-2 pr-4">{t.leitura}</th>
                    <th className="pb-2 pr-4">{t.escrita}</th>
                    <th className="pb-2 pr-4">{t.gramatica}</th>
                    <th className="pb-2 pr-4">{t.media}</th>
                    <th className="pb-2">{t.frequencia}</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((f) => (
                    <tr key={f.id} className="border-b border-white/5">
                      <td className="py-2 pr-4 font-semibold text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span>{f.name || f.email}</span>
                          <button onClick={() => abrirPresenca(f.id, f.name || f.email)} className="text-cyan-400 hover:text-cyan-300 text-xs" title="Ver presença">📅</button>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-slate-400">{f.current_level || "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_fala !== null && f.score_fala !== undefined ? `${f.score_fala}%` : "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_escuta !== null && f.score_escuta !== undefined ? `${f.score_escuta}%` : "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_leitura !== null && f.score_leitura !== undefined ? `${f.score_leitura}%` : "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_escrita !== null && f.score_escrita !== undefined ? `${f.score_escrita}%` : "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_gramatica !== null && f.score_gramatica !== undefined ? `${f.score_gramatica}%` : "-"}</td>
                      <td className="py-2 pr-4 font-bold text-cyan-400">{mediaGeral(f) !== null ? `${mediaGeral(f)}%` : "-"}</td>
                      <td className="py-2 font-bold text-emerald-400">{f.attendance_percentage !== null && f.attendance_percentage !== undefined ? `${f.attendance_percentage}%` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        )}

      </main>
      {modalPresenca && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setModalPresenca(null)}>
          <div className="bg-[#0a1424] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-black text-slate-100 mb-4">{modalPresenca.nome}</h2>
            {carregandoPresenca ? (
              <p className="text-xs text-slate-500">Cargando...</p>
            ) : diasPresenca.length === 0 ? (
              <p className="text-xs text-slate-500">Aún no hay clases registradas.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {diasPresenca.map((d, i) => {
                  const data = d.data ? new Date(d.data) : null;
                  const cor = d.presente === true ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : d.presente === false ? "bg-rose-500/15 border-rose-500/40 text-rose-400" : "bg-slate-700/20 border-slate-600/40 text-slate-400";
                  const texto = d.presente === true ? "Presente" : d.presente === false ? "Ausente" : "Sin registro";
                  return (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cor}`}>
                      <span className="text-xs text-slate-300">{data ? data.toLocaleDateString("es-CO") : "-"}</span>
                      <span className="text-[10px] font-bold">{texto}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={() => setModalPresenca(null)} className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
