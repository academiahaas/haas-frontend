"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
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
  const [empresa, setEmpresa] = useState<{ id: string; company_name: string } | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [valorMensal, setValorMensal] = useState<number | null>(null);
  const [planos, setPlanos] = useState<any[]>([]);
  const [planoSelecionado, setPlanoSelecionado] = useState<any>(null);
  const [mostrarOpcoesPagamento, setMostrarOpcoesPagamento] = useState(false);
  const [criandoCobranca, setCriandoCobranca] = useState(false);
  const [cobrancaMsg, setCobrancaMsg] = useState("");
  const [mostrarPago, setMostrarPago] = useState(true);
  const [mostrarGrupos, setMostrarGrupos] = useState(true);
  const [mostrarDesempeno, setMostrarDesempeno] = useState(true);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

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
          .select("id, nome, frequencia, horario, dias_semana")
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

        if (planosReais) setPlanos(planosReais);
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
        <p className="text-sm font-medium">Cargando panel...</p>
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
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Panel Corporativo</span>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors">
          <LogOut size={14} /> Cerrar sesion
        </button>
      </header>

      <main className="p-4 md:p-6 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide min-h-0">

          <div className="bg-[#0a1424] border border-cyan-500/20 rounded-xl p-4 flex items-center gap-4 shrink-0">
            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Colaboradores activos</span>
              <span className="text-xl font-extrabold text-slate-100">{funcionarios.length}</span>
            </div>
          </div>

          <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-200">Pago mensual</h2>
              <button onClick={() => setMostrarPago(!mostrarPago)} className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded">
                {mostrarPago ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {mostrarPago && (
              <div className="mt-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {planos.map((p) => (
                    <button
                      key={p.plan_key}
                      onClick={() => { setPlanoSelecionado(p); setMostrarOpcoesPagamento(false); }}
                      className={`text-left p-2.5 rounded-lg border transition-all ${planoSelecionado?.plan_key === p.plan_key ? "bg-cyan-500/10 border-cyan-500/40" : "bg-white/[0.02] border-white/10 hover:border-white/20"}`}
                    >
                      <p className="text-[10px] font-bold text-slate-200">{p.plan_label}</p>
                      <p className="text-xs font-black text-cyan-400 mt-1">$ {Number(p.price).toLocaleString("es-CO")}</p>
                    </button>
                  ))}
                </div>

                {planoSelecionado && !mostrarOpcoesPagamento && (
                  <button onClick={() => setMostrarOpcoesPagamento(true)} className="w-full mt-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all">
                    Pagar ahora
                  </button>
                )}

                {planoSelecionado && mostrarOpcoesPagamento && (() => {
                  const valorPlano = Number(planoSelecionado.price);
                  const totalGatewayPlano = Math.round(valorPlano * 1.05) - centavos;
                  const totalBrebPlano = valorPlano - centavos;
                  return (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Tarjeta / Wompi
                        </div>
                        <p className="text-[8.5px] text-slate-500 mt-0.5">Pasarela segura Wompi / Nequi</p>
                        <div className="flex flex-col gap-1 text-[10px] bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 font-mono mt-2">
                          <div className="flex justify-between text-slate-400"><span>Base:</span><span>$ {valorPlano.toLocaleString("es-CO")}</span></div>
                          <div className="flex justify-between text-rose-400"><span>Fee pasarela (5%):</span><span>+ $ {Math.round(valorPlano * 0.05).toLocaleString("es-CO")}</span></div>
                          <div className="border-t border-slate-800/80 my-0.5"></div>
                          <div className="flex justify-between font-black text-white text-xs"><span>Total:</span><span>$ {totalGatewayPlano.toLocaleString("es-CO")}</span></div>
                        </div>
                        <button onClick={() => handlePagar("gateway", totalGatewayPlano)} disabled={criandoCobranca} className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-50 text-slate-950 font-black py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all">
                          Pagar via Wompi / Nequi
                        </button>
                      </div>

                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-between relative">
                        <div className="absolute top-0 right-0 bg-cyan-400 text-slate-950 text-[7px] font-black px-2 py-0.5 rounded-bl uppercase tracking-widest">
                          Ahorra Comision!
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-cyan-400 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          Llave Bre-B
                        </div>
                        <div className="mx-auto w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center border border-cyan-500/20 my-1">
                          <img
                            src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/Untitled%20folder/WhatsApp%20Image%202026-06-28%20at%2012.18.16.jpeg"
                            alt="QR Code Oficial Llave Bre-B"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                          <div className="flex justify-between text-slate-400"><span>Base:</span><span>$ {valorPlano.toLocaleString("es-CO")}</span></div>
                          <div className="flex justify-between text-emerald-400 font-bold"><span>Comision:</span><span>$0 (Gratis!)</span></div>
                          <div className="border-t border-slate-800/80 my-0.5"></div>
                          <div className="flex justify-between font-black text-cyan-400 text-xs"><span>A transferir:</span><span>$ {totalBrebPlano.toLocaleString("es-CO")}</span></div>
                        </div>
                        <button onClick={() => handlePagar("breb", totalBrebPlano)} disabled={criandoCobranca} className="w-full mt-2 bg-white/5 hover:bg-white/10 border border-cyan-500/30 disabled:opacity-50 text-cyan-300 font-black py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all">
                          Ya transferi
                        </button>
                      </div>

                      <p className="text-[8.5px] text-slate-500 sm:col-span-2 leading-tight">
                        <Shield className="inline-block w-3 h-3 mr-1 mb-0.5" />
                        Ingresa el valor exacto mostrado arriba; esto permite que el sistema valide tu pago automaticamente.
                      </p>
                      {cobrancaMsg && <p className="text-xs text-slate-400 sm:col-span-2">{cobrancaMsg}</p>}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-200">Grupos y horarios</h2>
              <button onClick={() => setMostrarGrupos(!mostrarGrupos)} className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded">
                {mostrarGrupos ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {mostrarGrupos && (
              grupos.length === 0 ? (
                <p className="text-xs text-slate-500 mt-2">No hay grupos registrados todavia.</p>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  {grupos.map((g) => (
                    <div key={g.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                      <p className="text-sm font-bold text-slate-200">
                        {g.dias_semana || g.frequencia || "Horario no definido"} {g.horario ? `- ${g.horario}` : ""}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{g.membros.length} {g.membros.length === 1 ? "persona" : "personas"}</p>
                      <p className="text-[11px] text-cyan-400 mt-1">{g.membros.map((m: any) => m.name || m.email).join(", ") || "Sin miembros"}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

        </div>
        <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="font-bold text-sm text-slate-200">Desempeno de los colaboradores</h2>
            <button onClick={() => setMostrarDesempeno(!mostrarDesempeno)} className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded">
              {mostrarDesempeno ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {mostrarDesempeno && (funcionarios.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl mt-2">
              No hay colaboradores registrados todavia.
            </div>
          ) : (
            <div className="overflow-auto mt-2 flex-1 min-h-0 scrollbar-hide">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500 uppercase text-[10px] border-b border-white/10 sticky top-0 bg-[#0a1424]">
                    <th className="pb-2 pr-4">Nombre</th>
                    <th className="pb-2 pr-4">Nivel</th>
                    <th className="pb-2 pr-4">Habla</th>
                    <th className="pb-2 pr-4">Escucha</th>
                    <th className="pb-2 pr-4">Lectura</th>
                    <th className="pb-2 pr-4">Escritura</th>
                    <th className="pb-2 pr-4">Gramatica</th>
                    <th className="pb-2 pr-4">Promedio</th>
                    <th className="pb-2">Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((f) => (
                    <tr key={f.id} className="border-b border-white/5">
                      <td className="py-2 pr-4 font-semibold text-slate-200">{f.name || f.email}</td>
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

      </main>
    </div>
  );
}
