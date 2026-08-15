"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Building2, Loader2, ArrowLeft, Shield } from "lucide-react";
import { supabase } from "../../lib/supabase";

const TEMPLATES_EMAIL: Record<string, Record<string, { asunto: string; html: (p: any) => string }>> = {
  fijo: {
    es: {
      asunto: "Bienvenido(a) a Haas Academia de Idiomas! Tu beneficio corporativo",
      html: (p) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;"><h2>Hola!</h2><p>Te damos la mas cordial bienvenida! Nos alegra comunicarte que <strong>${p.empresa}</strong> ha activado para ti un plan corporativo exclusivo de aprendizaje de idiomas con Haas Academia de Idiomas.</p><p>Tu proceso de aprendizaje sera dinamico, practico y 100% enfocado en tu desarrollo, con plataforma interactiva de juegos, clases en vivo y seguimiento en tu Dashboard.</p><h3>Tus dias y horarios de clase</h3><p>Dias: <strong>${p.dias}</strong><br/>Horario: <strong>${p.horario}</strong></p><h3>Como activar tu acceso</h3><ol><li>Haz clic en el boton de abajo para tu prueba de nivelacion</li><li>Ingresa este mismo correo</li><li>Crea tu contrasena</li><li>Empieza a jugar y aprender</li></ol><p style="text-align:center;margin:24px 0;"><a href="${p.link}" style="background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Realizar prueba de nivelacion</a></p><hr/><p style="color:#94a3b8;font-size:11px;">Equipo Haas Academia de Idiomas</p></div>`
    },
    pt: {
      asunto: "Bem-vindo(a) a Haas Academia de Idiomas! Seu beneficio corporativo",
      html: (p) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;"><h2>Ola!</h2><p>Seja muito bem-vindo(a)! E com grande satisfacao que anunciamos que <strong>${p.empresa}</strong> disponibilizou para voce um plano corporativo exclusivo de aprendizado de idiomas com a Haas Academia de Idiomas.</p><p>Seu processo de aprendizado sera dinamico, pratico e 100% focado no seu desenvolvimento, com plataforma interativa de jogos, aulas ao vivo e acompanhamento pelo seu Dashboard.</p><h3>Seus dias e horarios de aula</h3><p>Dias: <strong>${p.dias}</strong><br/>Horario: <strong>${p.horario}</strong></p><h3>Como ativar seu acesso</h3><ol><li>Clique no botao abaixo para sua prova de nivelamento</li><li>Insira este mesmo e-mail</li><li>Crie sua senha</li><li>Comece a jogar e praticar</li></ol><p style="text-align:center;margin:24px 0;"><a href="${p.link}" style="background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Fazer prova de nivelamento</a></p><hr/><p style="color:#94a3b8;font-size:11px;">Equipe Haas Academia de Idiomas</p></div>`
    },
    en: {
      asunto: "Welcome to Haas Language Academy! Your corporate benefit",
      html: (p) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;"><h2>Hello!</h2><p>Welcome aboard! We are excited to announce that <strong>${p.empresa}</strong> has provided you with an exclusive corporate language training benefit with Haas Language Academy.</p><p>Your learning will be dynamic, practical, and fully tailored to your growth, with an interactive games platform, live classes and full progress tracking on your Dashboard.</p><h3>Your class days and schedule</h3><p>Days: <strong>${p.dias}</strong><br/>Time: <strong>${p.horario}</strong></p><h3>How to activate your account</h3><ol><li>Click the button below to take your placement test</li><li>Enter this exact email</li><li>Create your password</li><li>Start playing and learning</li></ol><p style="text-align:center;margin:24px 0;"><a href="${p.link}" style="background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Take placement test</a></p><hr/><p style="color:#94a3b8;font-size:11px;">Haas Language Academy Team</p></div>`
    }
  },
  flexible: {
    es: {
      asunto: "Bienvenido(a) a Haas Academia de Idiomas! Programa tu agenda",
      html: (p) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;"><h2>Hola!</h2><p>Te damos la mas cordial bienvenida! Nos alegra comunicarte que <strong>${p.empresa}</strong> ha activado para ti un plan corporativo exclusivo con Haas Academia de Idiomas.</p><p>Tu aprendizaje sera dinamico y 100% adaptable a tu rutina, con total flexibilidad para elegir tus dias y horarios.</p><h3>Como activar tu cuenta</h3><ol><li>Haz clic en el boton para tu prueba de nivelacion</li><li>Ingresa este mismo correo</li><li>Crea tu contrasena</li><li>Empieza a jugar y agenda tus clases</li></ol><h3>Como agendar tus clases</h3><p>Ingresa a tu Dashboard, haz clic en <strong>AGENDA</strong> y elige los dias y horarios que mejor se adapten a tu semana.</p><p style="text-align:center;margin:24px 0;"><a href="${p.link}" style="background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Realizar prueba de nivelacion</a></p><hr/><p style="color:#94a3b8;font-size:11px;">Equipo Haas Academia de Idiomas</p></div>`
    },
    pt: {
      asunto: "Bem-vindo(a) a Haas Academia de Idiomas! Monte sua agenda",
      html: (p) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;"><h2>Ola!</h2><p>Seja bem-vindo(a)! <strong>${p.empresa}</strong> disponibilizou para voce um plano corporativo exclusivo com a Haas Academia de Idiomas.</p><p>Seu aprendizado sera dinamico e 100% adaptado a sua rotina, com total flexibilidade pra escolher seus dias e horarios.</p><h3>Como ativar sua conta</h3><ol><li>Clique no botao pra sua prova de nivelamento</li><li>Insira este mesmo e-mail</li><li>Crie sua senha</li><li>Comece a jogar e agende suas aulas</li></ol><h3>Como agendar suas aulas</h3><p>Acesse seu Dashboard, clique em <strong>AGENDA</strong> e escolha os dias e horarios que melhor encaixam na sua semana.</p><p style="text-align:center;margin:24px 0;"><a href="${p.link}" style="background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Fazer prova de nivelamento</a></p><hr/><p style="color:#94a3b8;font-size:11px;">Equipe Haas Academia de Idiomas</p></div>`
    },
    en: {
      asunto: "Welcome to Haas Language Academy! Schedule your classes",
      html: (p) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b;"><h2>Hello!</h2><p>Welcome aboard! <strong>${p.empresa}</strong> has provided you with an exclusive corporate plan with Haas Language Academy.</p><p>Your learning will be dynamic and fully adapted to your schedule, with total flexibility to choose when you study.</p><h3>How to activate your account</h3><ol><li>Click the button below for your placement test</li><li>Enter this exact email</li><li>Create your password</li><li>Start playing and book your classes</li></ol><h3>How to schedule your classes</h3><p>Log in to your Dashboard, click <strong>AGENDA</strong> and pick the days and times that best fit your week.</p><p style="text-align:center;margin:24px 0;"><a href="${p.link}" style="background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Take placement test</a></p><hr/><p style="color:#94a3b8;font-size:11px;">Haas Language Academy Team</p></div>`
    }
  }
};

export default function GestionarPlan() {
  const [empresa, setEmpresa] = useState<any>(null);
  const [planos, setPlanos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [descontoConfig, setDescontoConfig] = useState({ desconto_por_pessoa: 1.5, desconto_maximo: 25 });
  const [historicoPagos, setHistoricoPagos] = useState<any[]>([]);
  const [convitesPendentes, setConvitesPendentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [tipoHorario, setTipoHorario] = useState("fijo");
  const [simPlano, setSimPlano] = useState<any>(null);
  const [simPessoas, setSimPessoas] = useState(0);

  const [nomeNovo, setNomeNovo] = useState("");
  const [idiomaCursoNovo, setIdiomaCursoNovo] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [emailNovo, setEmailNovo] = useState("");
  const [diasClase, setDiasClase] = useState("");
  const [horarioClase, setHorarioClase] = useState("");
  const [idiomaEmail, setIdiomaEmail] = useState("es");
  const [idioma, setIdioma] = useState<"PT" | "ES" | "EN">("ES");

  const dictG = {
    PT: {
      voltarPainel: "Voltar ao painel",
      simuladorPlano: "Simulador de plano",
      escolhaTipo: "Escolha o tipo de horário e quantas pessoas deseja inscrever.",
      horarioFixo: "Horário fixo",
      horarioLivre: "Horário livre (Agenda)",
      colaboradores: "Colaboradores",
      desconto: "Desconto",
      totalMensal: "Total mensal",
      totalAtual: "Total atual (todos os planos)",
      planosAtivos: "plano(s) ativo(s)",
      semPlanos: "Nenhum plano ativo.",
      ultimoPago: "Último pagamento",
      semPagos: "Nenhum pagamento.",
      continuar: "Continuar",
      pagar: "Pagar",
      confirmarPago: "Confirmar pagamento",
      verOpcoes: "Ver opções de pagamento",
      cartaoCredito: "Cartão de Crédito / Débito",
      colaboradoresPlano: "Colaboradores neste plano",
      nenhumColaborador: "Nenhum ainda.",
      nomeCompleto: "Nome completo",
      selecioneIdioma: "Selecione o idioma do curso",
      selecioneDias: "Selecione",
      diasSelecionados: "selecionados",
      dias_label: "dias",
      horario_label: "Horário",
      revisarEnviar: "Revisar e enviar",
      diasSemana: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
    },
    ES: {
      voltarPainel: "Volver al panel",
      simuladorPlano: "Simulador de plan",
      escolhaTipo: "Elige el tipo de horario y cuántas personas quieres inscribir.",
      horarioFixo: "Horario fijo",
      horarioLivre: "Horario libre (Agenda)",
      colaboradores: "Colaboradores",
      desconto: "Descuento",
      totalMensal: "Total mensual",
      totalAtual: "Total actual (todos los planes)",
      planosAtivos: "plan(es) activo(s)",
      semPlanos: "Sin planes activos.",
      ultimoPago: "Último pago",
      semPagos: "Sin pagos.",
      continuar: "Continuar",
      pagar: "Pagar",
      confirmarPago: "Confirmar pago",
      verOpcoes: "Ver opciones de pago",
      cartaoCredito: "Tarjeta de Crédito / Débito",
      colaboradoresPlano: "Colaboradores en este plan",
      nenhumColaborador: "Ninguno todavía.",
      nomeCompleto: "Nombre completo",
      selecioneIdioma: "Selecciona el idioma del curso",
      selecioneDias: "Selecciona",
      diasSelecionados: "seleccionados",
      dias_label: "días",
      horario_label: "Horario",
      revisarEnviar: "Revisar y enviar",
      diasSemana: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    },
    EN: {
      voltarPainel: "Back to dashboard",
      simuladorPlano: "Plan simulator",
      escolhaTipo: "Choose the schedule type and how many people you want to enroll.",
      horarioFixo: "Fixed schedule",
      horarioLivre: "Flexible schedule (Calendar)",
      colaboradores: "Employees",
      desconto: "Discount",
      totalMensal: "Monthly total",
      totalAtual: "Current total (all plans)",
      planosAtivos: "active plan(s)",
      semPlanos: "No active plans.",
      ultimoPago: "Last payment",
      semPagos: "No payments.",
      continuar: "Continue",
      pagar: "Pay",
      confirmarPago: "Confirm payment",
      verOpcoes: "View payment options",
      cartaoCredito: "Credit / Debit Card",
      colaboradoresPlano: "Employees in this plan",
      nenhumColaborador: "None yet.",
      nomeCompleto: "Full name",
      selecioneIdioma: "Select the course language",
      selecioneDias: "Select",
      diasSelecionados: "selected",
      dias_label: "days",
      horario_label: "Schedule",
      revisarEnviar: "Review and submit",
      diasSemana: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
  };
  const tG = dictG[idioma];

  const traduzirPlano = (planKey: string, labelOriginal: string) => {
    const mapa: Record<string, { PT: string; ES: string; EN: string }> = {
      "3x_semana": { PT: "3x por semana", ES: "3x por semana", EN: "3x a week" },
      "5x_semana": { PT: "5x por semana", ES: "5x por semana", EN: "5x a week" },
      "particular": { PT: "Aulas Particulares", ES: "Clases Particulares", EN: "Private Lessons" },
      "3x_semana_flex": { PT: "3x semana - Horário livre", ES: "3x semana - Horario libre", EN: "3x week - Flexible schedule" },
      "5x_semana_flex": { PT: "5x semana - Horário livre", ES: "5x semana - Horario libre", EN: "5x week - Flexible schedule" },
      "particular_flex": { PT: "Particular - Horário livre", ES: "Particular - Horario libre", EN: "Private - Flexible schedule" }
    };
    return mapa[planKey] ? mapa[planKey][idioma] : labelOriginal;
  };
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [msgAccion, setMsgAccion] = useState("");

  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false);
  const [mostrarOpcoesPagamento, setMostrarOpcoesPagamento] = useState(false);
  const [criandoCobranca, setCriandoCobranca] = useState(false);
  const [cobrancaMsg, setCobrancaMsg] = useState("");
  const colDireitaRef = useRef<HTMLDivElement>(null);
  const [alturaColDireita, setAlturaColDireita] = useState<number | null>(null);

  useEffect(() => {
    if (!colDireitaRef.current) return;
    const elemento = colDireitaRef.current;
    const medir = () => setAlturaColDireita(elemento.getBoundingClientRect().height);
    const t1 = setTimeout(medir, 50);
    const t2 = setTimeout(medir, 300);
    const t3 = setTimeout(medir, 800);
    const observer = new ResizeObserver(medir);
    observer.observe(elemento);
    window.addEventListener("resize", medir);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [simPlano]);

  useEffect(() => {
    const carregar = async () => {
      const corporateId = localStorage.getItem("haas_corporate_id");
      const corporateName = localStorage.getItem("haas_corporate_name");
      if (!corporateId) {
        setErro("Sesion no encontrada.");
        setLoading(false);
        return;
      }
      setEmpresa({ id: corporateId, company_name: corporateName || "Empresa" });

      const { data: planosReais } = await supabase.from("corporate_plan_prices").select("plan_key, plan_label, price, tipo_horario").order("price");
      if (planosReais) setPlanos(planosReais);

      const { data: gruposReais } = await supabase.from("corporate_groups").select("id, plan_key").eq("corporate_account_id", corporateId);
      if (gruposReais) {
        const { data: funcionarios } = await supabase.from("users").select("id, name, email, corporate_group_id").eq("corporate_account_id", corporateId);
        setGrupos(gruposReais.map((g: any) => ({ ...g, membros: (funcionarios || []).filter((f: any) => f.corporate_group_id === g.id) })));
      }

      const { data: descontoReal } = await supabase.from("corporate_discount_config").select("desconto_por_pessoa, desconto_maximo").limit(1).maybeSingle();
      if (descontoReal) setDescontoConfig(descontoReal);

      const { data: pagos } = await supabase.from("corporate_payments").select("amount, status, created_at").eq("corporate_account_id", corporateId).order("created_at", { ascending: false }).limit(8);
      if (pagos) setHistoricoPagos(pagos);

      const { data: convites } = await supabase.from("corporate_pending_invites").select("id, plan_key, nombre, email").eq("corporate_account_id", corporateId);
      if (convites) setConvitesPendentes(convites);

      if (gruposReais && gruposReais.length > 0 && planosReais) {
        const { data: funcionarios2 } = await supabase.from("users").select("id, corporate_group_id").eq("corporate_account_id", corporateId);
        const gruposComMembros = gruposReais.map((g: any) => ({ ...g, qtd: (funcionarios2 || []).filter((f: any) => f.corporate_group_id === g.id).length }));
        const grupoAtivo = gruposComMembros.filter((g: any) => g.qtd > 0).sort((a: any, b: any) => b.qtd - a.qtd)[0];
        if (grupoAtivo) {
          const planoAtivo = planosReais.find((p: any) => p.plan_key === grupoAtivo.plan_key);
          if (planoAtivo) {
            setTipoHorario(planoAtivo.tipo_horario);
            setSimPlano(planoAtivo);
            setSimPessoas(Math.max(1, grupoAtivo.qtd));
          }
        }
      }

      setLoading(false);
    };
    carregar();
  }, []);

  const centavosUnicos = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
    return (hash % 95) + 1;
  };

  const planosFiltrados = planos.filter((p) => p.tipo_horario === tipoHorario && p.plan_key !== "particular" && p.plan_key !== "particular_flex");
  const grupoAtual = simPlano ? grupos.find((g) => g.plan_key === simPlano.plan_key) : null;
  const membrosAtuais = grupoAtual?.membros || [];

  const handleEscolherPlano = (p: any) => {
    setSimPlano(p);
    const grupo = grupos.find((g) => g.plan_key === p.plan_key);
    setSimPessoas(grupo?.membros.length || 0);
  };

  const handleAbrirModal = () => {
    if (!nomeNovo.trim() || !emailNovo.trim() || !emailNovo.includes("@")) {
      setMsgAccion("Completa el nombre y el correo antes de continuar.");
      return;
    }
    if (!idiomaCursoNovo) {
      setMsgAccion("Selecciona el idioma del curso antes de continuar.");
      return;
    }
    if (tipoHorario === "fijo") {
      const diasRequeridos = simPlano?.plan_key === "3x_semana" ? 3 : simPlano?.plan_key === "5x_semana" ? 5 : 0;
      if (diasRequeridos > 0 && diasSelecionados.length !== diasRequeridos) {
        setMsgAccion(`Selecciona exactamente ${diasRequeridos} dias para este plan.`);
        return;
      }
      if (!horarioClase) {
        setMsgAccion("Selecciona el horario antes de continuar.");
        return;
      }
    }
    setMsgAccion("");
    setModalAberto(true);
  };

  const handleConfirmarEnvio = async () => {
    setEnviando(true);
    setMsgAccion("");
    try {
      const resCadastro = await fetch("/api/portal-empresa/agregar-colaborador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corporate_account_id: empresa.id,
          plan_key: simPlano.plan_key,
          nombre: nomeNovo.trim(),
          idioma_curso: idiomaCursoNovo,
          email: emailNovo.trim(),
          dias: tipoHorario === "fijo" ? diasClase : null,
          horario: tipoHorario === "fijo" ? horarioClase : null
        })
      });
      const dadosCadastro = await resCadastro.json();
      if (!resCadastro.ok) throw new Error(dadosCadastro.error);

      const template = TEMPLATES_EMAIL[tipoHorario][idiomaEmail];
      const html = template.html({ empresa: empresa?.company_name, dias: diasClase || "-", horario: horarioClase || "-", link: "https://academiahaas.com/diagnostico" });
      await fetch("/api/email/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatario: emailNovo.trim(), assunto: template.asunto, corpoHtml: html })
      });

      setIdiomaCursoNovo("");
      setMsgAccion(`${nomeNovo.trim()} fue agregado e invitado.`);
      setModalAberto(false);
      setNomeNovo("");
      setEmailNovo("");
      setDiasClase("");
      setHorarioClase("");
      setMostrarFormAgregar(false);
      setMostrarPago(true);
      setMostrarOpcoesPagamento(true);
    } catch (e: any) {
      setMsgAccion("Error: " + e.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleRemoverColaborador = async (email: string) => {
    if (!empresa) return;
    setEnviando(true);
    setMsgAccion("");
    try {
      const res = await fetch("/api/portal-empresa/remover-colaborador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, corporate_account_id: empresa.id })
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.error);
      setMsgAccion(`${dados.removido.name || dados.removido.email} fue retirado.`);
      setGrupos((prev) => prev.map((g) => g.id === grupoAtual?.id ? { ...g, membros: g.membros.filter((m: any) => m.email !== email) } : g));
    } catch (e: any) {
      setMsgAccion("Error: " + e.message);
    } finally {
      setEnviando(false);
    }
  };

  const handlePagar = async (valorExacto: number, abrirWompi: boolean = true) => {
    if (!empresa) return;
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
      if (abrirWompi) {
        setCobrancaMsg("Cobranza registrada. Completa el pago en la ventana que se abrio.");
        window.open("https://checkout.nequi.wompi.co/l/Nhopn2", "_blank");
      } else {
        setCobrancaMsg("Transferencia registrada. El sistema validara tu pago automaticamente al recibirla.");
      }
    } catch (e: any) {
      setCobrancaMsg("Error: " + e.message);
    } finally {
      setCriandoCobranca(false);
    }
  };

  const handleGerarPDF = () => {
    if (!simPlano) return;
    const ventana = window.open("", "_blank");
    if (!ventana) return;
    ventana.document.write(`
      <html><head><title>Presupuesto - ${empresa?.company_name}</title>
      <style>body{font-family:Arial;padding:40px;color:#1e293b;} h1{color:#7c3aed;} table{width:100%;border-collapse:collapse;margin-top:20px;} td{padding:8px 0;border-bottom:1px solid #e2e8f0;}</style>
      </head><body>
      <h1>Presupuesto Haas Academia de Idiomas</h1>
      <p><strong>Empresa:</strong> ${empresa?.company_name}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CO")}</p>
      <table>
        <tr><td>Plan</td><td>${simPlano.plan_label}</td></tr>
        <tr><td>Tipo de horario</td><td>${tipoHorario === "fijo" ? "Fijo" : "Libre (Agenda)"}</td></tr>
        <tr><td>Colaboradores</td><td>${simPessoas}</td></tr>
        <tr><td>Descuento</td><td>${desconto.toFixed(1)}%</td></tr>
        <tr><td><strong>Total mensual</strong></td><td><strong>$ ${Math.round(total).toLocaleString("es-CO")} COP</strong></td></tr>
      </table>
      </body></html>
    `);
    ventana.document.close();
    setTimeout(() => ventana.print(), 300);
  };

  const desconto = simPlano ? Math.min(descontoConfig.desconto_maximo, (simPessoas - 1) * descontoConfig.desconto_por_pessoa) : 0;
  const subtotal = simPlano ? Number(simPlano.price) * simPessoas : 0;
  const total = subtotal * (1 - desconto / 100);
  const progresso = (desconto / descontoConfig.desconto_maximo) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-purple-400" size={32} />
        <p className="text-sm font-medium">Cargando...</p>
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
  const preview = TEMPLATES_EMAIL[tipoHorario][idiomaEmail].html({ empresa: empresa?.company_name, dias: diasClase || "___", horario: horarioClase || "___", link: "https://academiahaas.com/diagnostico" });

  return (
    <div className="h-screen overflow-hidden bg-[#030914] text-slate-100 flex flex-col">
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <header className="h-16 border-b border-white/10 bg-[#0a1424] px-6 md:px-10 flex items-center justify-between shrink-0">
        <Link href="/portal-empresa" className="flex items-center gap-2 text-xs text-slate-400 hover:text-purple-400 transition-colors">
          <ArrowLeft size={14} /> {tG.voltarPainel}
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(["PT", "ES", "EN"] as const).map((l) => (
              <button key={l} onClick={() => setIdioma(l)} className={`text-[10px] font-bold px-2 py-1 rounded ${idioma === l ? "bg-purple-500/20 text-purple-400" : "text-slate-500"}`}>{l}</button>
            ))}
          </div>
          <Building2 size={16} className="text-purple-400" />
          <span className="text-sm font-bold text-slate-200">{empresa?.company_name}</span>
        </div>
      </header>

      <main className="p-4 md:p-6 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ gridTemplateRows: "minmax(0, 1fr)" }}>

        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto scrollbar-hide" style={{ height: alturaColDireita ? `${alturaColDireita}px` : undefined }}>
          <div className="bg-[#0a1424] border border-purple-500/20 rounded-xl p-5 shrink-0">
            <h1 className="text-lg font-black text-slate-100 mb-1.5" style={{ lineHeight: 1.5 }}>{tG.simuladorPlano}</h1>
            <p className="text-sm text-slate-500 mb-4">{tG.escolhaTipo}</p>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <button onClick={() => { setTipoHorario("fijo"); const p = planos.find((pl) => pl.tipo_horario === "fijo"); if (p) handleEscolherPlano(p); }} className={`py-2 rounded-lg text-xs font-bold border transition-all ${tipoHorario === "fijo" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                {tG.horarioFixo}
              </button>
              <button onClick={() => { setTipoHorario("flexible"); const p = planos.find((pl) => pl.tipo_horario === "flexible"); if (p) handleEscolherPlano(p); }} className={`py-3 rounded-lg text-sm font-bold border transition-all ${tipoHorario === "flexible" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                {tG.horarioLivre}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {planosFiltrados.map((p) => (
                <button key={p.plan_key} onClick={() => handleEscolherPlano(p)} className={`text-left p-3 rounded-lg border transition-all ${simPlano?.plan_key === p.plan_key ? "bg-purple-500/10 border-purple-500/40" : "bg-white/[0.02] border-white/10 hover:border-white/20"}`}>
                  <p className="text-xs font-bold text-slate-200">{traduzirPlano(p.plan_key, p.plan_label)}</p>
                  <p className="text-sm font-black text-purple-400 mt-1">$ {Number(p.price).toLocaleString("es-CO")}</p>
                </button>
              ))}
            </div>

            {simPlano && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">{tG.colaboradores}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSimPessoas((n) => Math.max(0, n - 1))} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black text-sm">-</button>
                    <span className="text-base font-black text-slate-100 w-6 text-center">{simPessoas}</span>
                    <button onClick={() => { setSimPessoas((n) => n + 1); setMostrarFormAgregar(true); }} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black text-sm">+</button>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">{tG.desconto}</span>
                    <span className="text-base font-black text-purple-300">{desconto.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2.5">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">{tG.totalMensal}</span>
                    <span className="text-lg font-black text-purple-300">$ {Math.round(total).toLocaleString("es-CO")}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{tG.totalAtual}</p>
              {(() => {
                const totalGeral = grupos.reduce((soma, g) => {
                  const plano = planos.find((p) => p.plan_key === g.plan_key);
                  if (!plano || g.membros.length === 0) return soma;
                  const desc = Math.min(descontoConfig.desconto_maximo, (g.membros.length - 1) * descontoConfig.desconto_por_pessoa);
                  return soma + Number(plano.price) * g.membros.length * (1 - desc / 100);
                }, 0);
                return totalGeral > 0 ? (
                  <>
                    <p className="text-xs font-bold text-slate-200">{grupos.filter((g) => g.membros.length > 0).length} {tG.planosAtivos}</p>
                    <p className="text-base font-black text-purple-300 mt-0.5">$ {Math.round(totalGeral).toLocaleString("es-CO")}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">{tG.semPlanos}</p>
                );
              })()}
            </div>
            <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{tG.ultimoPago}</p>
              {historicoPagos.length > 0 ? (
                <>
                  <p className="text-xs text-slate-400">{new Date(historicoPagos[0].created_at).toLocaleDateString("es-CO")}</p>
                  <p className="text-base font-black text-amber-400 mt-0.5">$ {Number(historicoPagos[0].amount).toLocaleString("es-CO")}</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">{tG.semPagos}</p>
              )}
            </div>
          </div>

          <div className="flex-1"></div>

          {simPlano && (
            <div className="shrink-0" style={{ paddingBottom: "4px" }}>
              <button
                onClick={() => { if (emailNovo.trim()) { handleAbrirModal(); } else { setMostrarPago(true); setMostrarOpcoesPagamento(true); } }}
                className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 text-white font-black py-4 rounded-lg text-xs uppercase tracking-wider transition-all"
              >
                {emailNovo.trim() ? tG.continuar : tG.pagar}
              </button>
            </div>
          )}

          {mostrarPago && simPlano && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setMostrarPago(false)}>
            <div className="bg-[#0a1424] border border-purple-500/30 rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-black text-slate-100 mb-4">{tG.confirmarPago}</h2>
              {!mostrarOpcoesPagamento ? (
                <button onClick={() => setMostrarOpcoesPagamento(true)} className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 text-white font-black py-3 rounded-lg text-xs uppercase tracking-wider transition-all">
                  {tG.verOpcoes}
                </button>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden max-h-[340px]">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          {tG.cartaoCredito}
                        </div>
                        <p className="text-[8.5px] text-slate-500 text-left pl-3">Pasarela segura Wompi / Nequi</p>
                      </div>
                    </div>

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
                      <div className="flex justify-between text-slate-400"><span>Base:</span><span>$ {Math.round(total).toLocaleString("es-CO")}</span></div>
                      <div className="flex justify-between text-rose-400"><span>Fee pasarela:</span><span>+ $ {Math.round(total * 0.05).toLocaleString("es-CO")}</span></div>
                      <div className="border-t border-slate-800/80 my-0.5"></div>
                      <div className="flex justify-between font-black text-white text-xs"><span>Total:</span><span>$ {(Math.round(total * 1.05) - centavos).toLocaleString("es-CO")}</span></div>
                    </div>

                    <button
                      onClick={() => handlePagar(Math.round(total * 1.05) - centavos)}
                      disabled={criandoCobranca}
                      className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md text-center disabled:opacity-50"
                    >
                      Pagar via Wompi / Nequi
                    </button>
                    <p className="text-[8.5px] text-slate-500/90 font-medium text-center leading-tight mt-1.5 px-1">
                      Al procesar el valor exacto indicado, la pasarela gestionara la activacion de tu plan de forma automatica. Nota: la comision de procesamiento es cobrada por la plataforma y no es reembolsable en caso de cancelacion.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden max-h-[340px]">
                    <div className="absolute top-0 right-0 font-bold text-cyan-400 text-slate-950 text-[7px] font-black px-2 py-0.5 rounded-bl uppercase tracking-widest">
                      Ahorra Comision!
                    </div>

                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-wider text-left flex justify-start items-center">
                      <div className="flex items-center justify-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span><span>Llave Bre-B</span></div>
                    </div>

                    <div className="mx-auto w-24 h-24 bg-white p-1 rounded-xl flex items-center justify-center border border-cyan-500/20 my-1 shadow-lg relative overflow-hidden">
                      <img
                        src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/Untitled%20folder/WhatsApp%20Image%202026-06-28%20at%2012.18.16.jpeg"
                        alt="QR Code Oficial Llave Bre-B"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-[10px] bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 font-mono text-left">
                      <div className="flex justify-between text-slate-400"><span>Base:</span><span>$ {Math.round(total).toLocaleString("es-CO")}</span></div>
                      <div className="flex justify-between text-emerald-400 font-bold"><span>Comision:</span><span>$0 (Gratis!)</span></div>
                      <div className="border-t border-slate-800/80 my-0.5"></div>
                      <div className="flex justify-between font-black text-cyan-400 text-xs"><span>A transferir:</span><span>$ {(Math.round(total) - centavos).toLocaleString("es-CO")}</span></div>
                    </div>

                    <p className="text-[8.5px] text-slate-400/90 font-medium text-center leading-tight mt-1 px-1">
                      ATENCION: recuerda ingresar el valor exacto con descuento en tu banco; esto permite que el sistema valide tu pago digitalmente y gestione la activacion de forma automatica.
                    </p>
                    <button onClick={() => handlePagar(Math.round(total) - centavos, false)} disabled={criandoCobranca} className="w-full mt-2 bg-white/5 hover:bg-white/10 border border-cyan-500/30 disabled:opacity-50 text-cyan-300 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all">
                      Ya transferi
                    </button>
                  </div>

                  {cobrancaMsg && <p className="text-[10px] text-slate-400 md:col-span-2">{cobrancaMsg}</p>}
                </div>
              )}
            </div>
            </div>
          )}

        </div>

        <div ref={colDireitaRef} className="bg-[#0a1424] border border-white/10 border-l-2 border-l-cyan-400 rounded-xl p-4 flex flex-col h-full min-h-0">
          <h2 className="font-bold text-sm text-slate-200 mb-3 shrink-0">{tG.colaboradoresPlano}</h2>

          {!simPlano ? (
            <p className="text-xs text-slate-500">Elige un plan a la izquierda para ver sus colaboradores.</p>
          ) : (
            <>
              {membrosAtuais.length === 0 ? (
                <div className="flex-1 min-h-0">
                  <p className="text-xs text-slate-500 mb-3">{tG.nenhumColaborador}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 mb-3 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                  {membrosAtuais.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 shrink-0">
                      <span className="text-xs text-slate-300">{m.name || m.email}</span>
                      <button onClick={() => handleRemoverColaborador(m.email)} disabled={enviando} className="text-rose-400 hover:text-rose-300 text-xs font-bold disabled:opacity-40">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-white/10 pt-3 shrink-0">
                {mostrarFormAgregar && (
                  <div className="space-y-2">
                    <input value={nomeNovo} onChange={(e) => setNomeNovo(e.target.value)} placeholder={tG.nomeCompleto} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500" />
                    <select value={idiomaCursoNovo} onChange={(e) => setIdiomaCursoNovo(e.target.value)} className="w-full bg-[#0a1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200">
                      <option value="" className="bg-[#0a1424] text-slate-400">{tG.selecioneIdioma}</option>
                      <option value="portugues" className="bg-[#0a1424] text-slate-200">{idioma === "PT" ? "Português" : idioma === "EN" ? "Portuguese" : "Portugués"}</option>
                      <option value="ingles" className="bg-[#0a1424] text-slate-200">{idioma === "PT" ? "Inglês" : idioma === "EN" ? "English" : "Inglés"}</option>
                      <option value="espanol" className="bg-[#0a1424] text-slate-200">{idioma === "PT" ? "Espanhol" : idioma === "EN" ? "Spanish" : "Español"}</option>
                      <option value="frances" className="bg-[#0a1424] text-slate-200">{idioma === "PT" ? "Francês" : idioma === "EN" ? "French" : "Francés"}</option>
                    </select>
                    <input value={emailNovo} onChange={(e) => setEmailNovo(e.target.value)} placeholder="nuevo@empresa.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500" />
                    {tipoHorario === "fijo" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 space-y-1.5">
                          <p className="text-[10px] text-slate-500">
                            {tG.selecioneDias} {simPlano?.plan_key === "3x_semana" ? "3" : simPlano?.plan_key === "5x_semana" ? "5" : ""} {tG.dias_label} ({diasSelecionados.length} {tG.diasSelecionados})
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((dia, idxDia) => {
                              const ativo = diasSelecionados.includes(dia);
                              const diasRequeridos = simPlano?.plan_key === "3x_semana" ? 3 : simPlano?.plan_key === "5x_semana" ? 5 : 99;
                              const limiteAtingido = diasSelecionados.length >= diasRequeridos;
                              return (
                                <button
                                  key={dia}
                                  type="button"
                                  disabled={!ativo && limiteAtingido}
                                  onClick={() => {
                                    const novaLista = ativo ? diasSelecionados.filter((d) => d !== dia) : [...diasSelecionados, dia];
                                    setDiasSelecionados(novaLista);
                                    setDiasClase(novaLista.join(", "));
                                  }}
                                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${ativo ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : !ativo && limiteAtingido ? "bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed" : "bg-white/5 border-white/10 text-slate-400"}`}
                                >
                                  {tG.diasSemana[idxDia]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <select value={horarioClase} onChange={(e) => setHorarioClase(e.target.value)} className="col-span-2 w-full bg-[#0a1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200">
                          <option value="" className="bg-[#0a1424]">{tG.horario_label}</option>
                          <option value="7:00 AM - 8:00 AM" className="bg-[#0a1424]">7:00 AM - 8:00 AM</option>
                          <option value="8:00 AM - 9:00 AM" className="bg-[#0a1424]">8:00 AM - 9:00 AM</option>
                          <option value="9:00 AM - 10:00 AM" className="bg-[#0a1424]">9:00 AM - 10:00 AM</option>
                          <option value="5:00 PM - 6:00 PM" className="bg-[#0a1424]">5:00 PM - 6:00 PM</option>
                          <option value="6:00 PM - 7:00 PM" className="bg-[#0a1424]">6:00 PM - 7:00 PM</option>
                          <option value="7:00 PM - 8:00 PM" className="bg-[#0a1424]">7:00 PM - 8:00 PM</option>
                          <option value="8:00 PM - 9:00 PM" className="bg-[#0a1424]">8:00 PM - 9:00 PM</option>
                        </select>
                      </div>
                    )}
                    <button onClick={handleAbrirModal} className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold py-2 rounded-lg text-xs transition-all">
                      {tG.revisarEnviar}
                    </button>
                  </div>
                )}
                {msgAccion && <p className="text-[11px] text-slate-400 mt-2">{msgAccion}</p>}
              </div>
            </>
          )}
        </div>

      </main>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-[#0a1424] border border-purple-500/30 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-black text-slate-100 mb-1">{idioma === "PT" ? "Revisar convite" : idioma === "EN" ? "Review invitation" : "Revisar invitación"}</h2>
            <p className="text-xs text-slate-500 mb-4">{idioma === "PT" ? "Para" : idioma === "EN" ? "To" : "Para"}: {emailNovo}</p>

            <div className="flex gap-1.5 mb-4">
              {["es", "pt", "en"].map((l) => (
                <button key={l} onClick={() => setIdiomaEmail(l)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${idiomaEmail === l ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                  {l === "es" ? (idioma === "PT" ? "Espanhol" : idioma === "EN" ? "Spanish" : "Español") : l === "pt" ? (idioma === "PT" ? "Português" : idioma === "EN" ? "Portuguese" : "Portugués") : (idioma === "PT" ? "Inglês" : idioma === "EN" ? "English" : "Inglés")}
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-br from-slate-300/10 to-purple-500/10 rounded-2xl p-3 mb-4 shadow-inner">
              <div className="bg-white rounded-xl p-3 shadow-lg" dangerouslySetInnerHTML={{ __html: preview }} />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setModalAberto(false)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                {idioma === "PT" ? "Cancelar" : idioma === "EN" ? "Cancel" : "Cancelar"}
              </button>
              <button onClick={handleConfirmarEnvio} disabled={enviando} className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                {enviando ? (idioma === "PT" ? "Enviando..." : idioma === "EN" ? "Sending..." : "Enviando...") : (idioma === "PT" ? "Confirmar e enviar" : idioma === "EN" ? "Confirm and send" : "Confirmar y enviar")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
