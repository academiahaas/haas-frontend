"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [tipoHorario, setTipoHorario] = useState("fijo");
  const [simPlano, setSimPlano] = useState<any>(null);
  const [simPessoas, setSimPessoas] = useState(1);

  const [emailNovo, setEmailNovo] = useState("");
  const [diasClase, setDiasClase] = useState("");
  const [horarioClase, setHorarioClase] = useState("");
  const [idiomaEmail, setIdiomaEmail] = useState("es");
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [msgAccion, setMsgAccion] = useState("");

  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false);
  const [mostrarOpcoesPagamento, setMostrarOpcoesPagamento] = useState(false);
  const [criandoCobranca, setCriandoCobranca] = useState(false);
  const [cobrancaMsg, setCobrancaMsg] = useState("");

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

  const planosFiltrados = planos.filter((p) => p.tipo_horario === tipoHorario);
  const grupoAtual = simPlano ? grupos.find((g) => g.plan_key === simPlano.plan_key) : null;
  const membrosAtuais = grupoAtual?.membros || [];

  const handleEscolherPlano = (p: any) => {
    setSimPlano(p);
    const grupo = grupos.find((g) => g.plan_key === p.plan_key);
    setSimPessoas(Math.max(1, grupo?.membros.length || 1));
  };

  const handleAbrirModal = () => {
    if (!emailNovo.trim() || !emailNovo.includes("@") || !diasClase.trim() || !horarioClase.trim()) {
      setMsgAccion("Completa el correo, los dias y el horario antes de continuar.");
      return;
    }
    setMsgAccion("");
    setModalAberto(true);
  };

  const handleConfirmarEnvio = async () => {
    setEnviando(true);
    try {
      const template = TEMPLATES_EMAIL[tipoHorario][idiomaEmail];
      const html = template.html({ empresa: empresa?.company_name, dias: diasClase, horario: horarioClase, link: "https://academiahaas.com/diagnostico" });
      await fetch("/api/email/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatario: emailNovo.trim(), assunto: template.asunto, corpoHtml: html })
      });
      setMsgAccion(`Invitacion enviada a ${emailNovo.trim()}.`);
      setEmailNovo("");
      setModalAberto(false);
    } catch (e) {
      setMsgAccion("Error al enviar la invitacion.");
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

  const handlePagar = async (valorExacto: number) => {
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
      setCobrancaMsg("Cobranza registrada. Completa el pago en la ventana que se abrio.");
      window.open("https://checkout.nequi.wompi.co/l/Nhopn2", "_blank");
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
          <ArrowLeft size={14} /> Volver al panel
        </Link>
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-purple-400" />
          <span className="text-sm font-bold text-slate-200">{empresa?.company_name}</span>
        </div>
      </header>

      <main className="p-4 md:p-6 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

        <div className="flex flex-col gap-3 min-h-0 h-full justify-between">

          <div className="bg-[#0a1424] border border-purple-500/20 rounded-xl p-4 shrink-0">
            <h1 className="text-base font-black text-slate-100 mb-1">Simulador de plan</h1>
            <p className="text-[11px] text-slate-500 mb-3">Elige el tipo de horario y cuantas personas quieres inscribir.</p>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => { setTipoHorario("fijo"); const p = planos.find((pl) => pl.tipo_horario === "fijo"); if (p) handleEscolherPlano(p); }} className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${tipoHorario === "fijo" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                Horario fijo
              </button>
              <button onClick={() => { setTipoHorario("flexible"); const p = planos.find((pl) => pl.tipo_horario === "flexible"); if (p) handleEscolherPlano(p); }} className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${tipoHorario === "flexible" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                Horario libre (Agenda)
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {planosFiltrados.map((p) => (
                <button key={p.plan_key} onClick={() => handleEscolherPlano(p)} className={`text-left p-2 rounded-lg border transition-all ${simPlano?.plan_key === p.plan_key ? "bg-purple-500/10 border-purple-500/40" : "bg-white/[0.02] border-white/10 hover:border-white/20"}`}>
                  <p className="text-[9px] font-bold text-slate-200">{p.plan_label}</p>
                  <p className="text-[11px] font-black text-purple-400 mt-0.5">$ {Number(p.price).toLocaleString("es-CO")}</p>
                </button>
              ))}
            </div>

            {simPlano && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Colaboradores</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSimPessoas((n) => Math.max(1, n - 1))} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black text-xs">-</button>
                    <span className="text-sm font-black text-slate-100 w-5 text-center">{simPessoas}</span>
                    <button onClick={() => setSimPessoas((n) => n + 1)} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black text-xs">+</button>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">Descuento</span>
                    <span className="text-xs font-black text-purple-300">{desconto.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-slate-400">Total mensual</span>
                    <span className="text-base font-black text-purple-300">$ {Math.round(total).toLocaleString("es-CO")}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-[#0a1424] border border-white/10 rounded-xl p-3">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total actual (todos los planes)</p>
              {(() => {
                const totalGeral = grupos.reduce((soma, g) => {
                  const plano = planos.find((p) => p.plan_key === g.plan_key);
                  if (!plano || g.membros.length === 0) return soma;
                  const desc = Math.min(descontoConfig.desconto_maximo, (g.membros.length - 1) * descontoConfig.desconto_por_pessoa);
                  return soma + Number(plano.price) * g.membros.length * (1 - desc / 100);
                }, 0);
                return totalGeral > 0 ? (
                  <>
                    <p className="text-xs font-bold text-slate-200">{grupos.filter((g) => g.membros.length > 0).length} plan(es) activo(s)</p>
                    <p className="text-sm font-black text-purple-300 mt-1">$ {Math.round(totalGeral).toLocaleString("es-CO")}</p>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-500">Sin planes activos.</p>
                );
              })()}
            </div>
            <div className="bg-[#0a1424] border border-white/10 rounded-xl p-3">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ultimo pago</p>
              {historicoPagos.length > 0 ? (
                <>
                  <p className="text-xs text-slate-400">{new Date(historicoPagos[0].created_at).toLocaleDateString("es-CO")}</p>
                  <p className="text-sm font-black text-amber-400 mt-1">$ {Number(historicoPagos[0].amount).toLocaleString("es-CO")}</p>
                </>
              ) : (
                <p className="text-[11px] text-slate-500">Sin pagos.</p>
              )}
            </div>
          </div>

          {simPlano && (
            <div className="flex gap-2 shrink-0">
              <button onClick={handleGerarPDF} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-2 rounded-lg text-[11px] uppercase tracking-wider transition-all">
                Generar PDF
              </button>
              <button onClick={() => setMostrarPago(!mostrarPago)} className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 text-white font-black py-2 rounded-lg text-[11px] uppercase tracking-wider transition-all">
                {mostrarPago ? "Ocultar pago" : "Pagar ahora"}
              </button>
            </div>
          )}

          {mostrarPago && simPlano && (
            <div className="bg-[#0a1424] border border-purple-500/20 rounded-xl p-3 shrink-0">
              {!mostrarOpcoesPagamento ? (
                <button onClick={() => setMostrarOpcoesPagamento(true)} className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 text-white font-black py-2 rounded-lg text-[11px] uppercase tracking-wider transition-all">
                  Ver opciones de pago
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
                    <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Wompi</p>
                    <p className="text-[10px] text-slate-400 font-mono mb-1.5">$ {(Math.round(total * 1.05) - centavos).toLocaleString("es-CO")}</p>
                    <button onClick={() => handlePagar(Math.round(total * 1.05) - centavos)} disabled={criandoCobranca} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-50 text-slate-950 font-black py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all">
                      Pagar
                    </button>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
                    <p className="text-[9px] font-black text-purple-400 uppercase mb-1">Bre-B</p>
                    <p className="text-[10px] text-slate-400 font-mono mb-1.5">$ {(Math.round(total) - centavos).toLocaleString("es-CO")}</p>
                    <button onClick={() => handlePagar(Math.round(total) - centavos)} disabled={criandoCobranca} className="w-full bg-white/5 hover:bg-white/10 border border-purple-500/30 disabled:opacity-50 text-purple-300 font-black py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all">
                      Ya transferi
                    </button>
                  </div>
                  {cobrancaMsg && <p className="text-[10px] text-slate-400 col-span-2">{cobrancaMsg}</p>}
                </div>
              )}
            </div>
          )}

        </div>

        <div className="bg-[#0a1424] border border-white/10 border-l-2 border-l-cyan-400 rounded-xl p-4 flex flex-col h-full min-h-0">
          <h2 className="font-bold text-sm text-slate-200 mb-3 shrink-0">Colaboradores en este plan</h2>

          {!simPlano ? (
            <p className="text-xs text-slate-500">Elige un plan a la izquierda para ver sus colaboradores.</p>
          ) : (
            <>
              {membrosAtuais.length === 0 ? (
                <p className="text-xs text-slate-500 mb-3">Ninguno todavia.</p>
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
                {!mostrarFormAgregar ? (
                  <button onClick={() => setMostrarFormAgregar(true)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-2 rounded-lg text-xs transition-all">
                    + Agregar colaborador
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={diasClase} onChange={(e) => setDiasClase(e.target.value)} placeholder="Dias" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500" />
                      <input value={horarioClase} onChange={(e) => setHorarioClase(e.target.value)} placeholder="Horario" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500" />
                    </div>
                    <input value={emailNovo} onChange={(e) => setEmailNovo(e.target.value)} placeholder="nuevo@empresa.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500" />
                    <button onClick={handleAbrirModal} className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold py-2 rounded-lg text-xs transition-all">
                      Revisar y enviar
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
            <h2 className="text-lg font-black text-slate-100 mb-1">Revisar invitacion</h2>
            <p className="text-xs text-slate-500 mb-4">Para: {emailNovo}</p>

            <div className="flex gap-1.5 mb-4">
              {["es", "pt", "en"].map((l) => (
                <button key={l} onClick={() => setIdiomaEmail(l)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${idiomaEmail === l ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                  {l === "es" ? "Espanol" : l === "pt" ? "Portugues" : "English"}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl p-1 mb-4" dangerouslySetInnerHTML={{ __html: preview }} />

            <div className="flex gap-2">
              <button onClick={() => setModalAberto(false)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                Cancelar
              </button>
              <button onClick={handleConfirmarEnvio} disabled={enviando} className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                {enviando ? "Enviando..." : "Confirmar y enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
