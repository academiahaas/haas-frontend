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
  const [descontoConfig, setDescontoConfig] = useState({ desconto_por_pessoa: 1.5, desconto_maximo: 25 });
  const [simPlano, setSimPlano] = useState<any>(null);
  const [simPessoas, setSimPessoas] = useState(1);
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

        <div className="flex flex-col gap-4 min-h-0">

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-[#0a1424] border border-cyan-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Users size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Colaboradores</span>
                <span className="text-lg font-extrabold text-slate-100">{funcionarios.length}</span>
              </div>
            </div>
            <div className="bg-[#0a1424] border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Building2 size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Valor mensual actual</span>
                <span className="text-lg font-extrabold text-slate-100">{valorMensal ? `$${valorMensal.toLocaleString("es-CO")}` : "-"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a1424] border border-purple-500/20 rounded-xl p-4 shrink-0">
            <h2 className="font-bold text-sm text-slate-200 mb-3">Simulador de plan</h2>

            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {planos.map((p) => (
                <button
                  key={p.plan_key}
                  onClick={() => {
                    setSimPlano(p);
                    const alunosDoPlano = grupos.filter((g) => g.plan_key === p.plan_key).reduce((total, g) => total + g.membros.length, 0);
                    setSimPessoas(Math.max(1, alunosDoPlano));
                  }}
                  className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all ${simPlano?.plan_key === p.plan_key ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}
                >
                  {p.plan_label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">Colaboradores a simular</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setSimPessoas((n) => Math.max(1, n - 1))} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black">-</button>
                <span className="text-sm font-black text-slate-100 w-6 text-center">{simPessoas}</span>
                <button onClick={() => setSimPessoas((n) => n + 1)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black">+</button>
              </div>
            </div>

            {simPlano && (() => {
              const desconto = Math.min(descontoConfig.desconto_maximo, (simPessoas - 1) * descontoConfig.desconto_por_pessoa);
              const subtotal = Number(simPlano.price) * simPessoas;
              const total = subtotal * (1 - desconto / 100);
              const progresso = (desconto / descontoConfig.desconto_maximo) * 100;
              return (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">Descuento desbloqueado</span>
                    <span className="text-xs font-black text-purple-300">{desconto.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 rounded-full transition-all duration-500"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Subtotal</span>
                    <span>$ {subtotal.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Total estimado</span>
                    <span className="text-xl font-black text-cyan-400">$ {Math.round(total).toLocaleString("es-CO")}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="font-bold text-sm text-slate-200">Grupos y horarios</h2>
              <button onClick={() => setMostrarGrupos(!mostrarGrupos)} className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded">
                {mostrarGrupos ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {mostrarGrupos && (
              grupos.length === 0 ? (
                <p className="text-xs text-slate-500 mt-2">No hay grupos registrados todavia.</p>
              ) : (
                <div className="flex flex-col gap-2 mt-2 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                  {grupos.map((g) => (
                    <div key={g.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 shrink-0">
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
