"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import { Building2, Users, Loader2, LogOut } from "lucide-react";
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
}

export default function PortalEmpresa() {
  const [empresa, setEmpresa] = useState<{ id: string; company_name: string } | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
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

        const { data: funcionariosReais, error: erroFunc } = await supabase
          .from("users")
          .select("id, name, email, current_level, score_fala, score_escuta, score_leitura, score_escrita, score_gramatica")
          .eq("corporate_account_id", corporateId);

        if (!erroFunc && funcionariosReais) {
          setFuncionarios(funcionariosReais);
        }
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

  const mediaGeral = (f: Funcionario) => {
    const notas = [f.score_fala, f.score_escuta, f.score_leitura, f.score_escrita, f.score_gramatica].filter(
      (n) => n !== null && n !== undefined
    ) as number[];
    if (notas.length === 0) return null;
    return Math.round(notas.reduce((a, b) => a + b, 0) / notas.length);
  };

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100">
      <header className="h-16 border-b border-white/10 bg-[#0a1424] px-6 md:px-10 flex items-center justify-between">
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

      <main className="p-6 md:p-10 max-w-6xl mx-auto flex flex-col gap-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0a1424] border border-cyan-500/20 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Colaboradores activos</span>
              <span className="text-xl font-extrabold text-slate-100">{funcionarios.length}</span>
            </div>
          </div>
        </section>

        <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6">
          <h2 className="font-bold text-base text-slate-200 mb-4">Desempeno de los colaboradores</h2>

          {funcionarios.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl">
              No hay colaboradores registrados todavia.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500 uppercase text-[10px] border-b border-white/10">
                    <th className="pb-2 pr-4">Nombre</th>
                    <th className="pb-2 pr-4">Nivel</th>
                    <th className="pb-2 pr-4">Habla</th>
                    <th className="pb-2 pr-4">Escucha</th>
                    <th className="pb-2 pr-4">Lectura</th>
                    <th className="pb-2 pr-4">Escritura</th>
                    <th className="pb-2 pr-4">Gramatica</th>
                    <th className="pb-2">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((f) => (
                    <tr key={f.id} className="border-b border-white/5">
                      <td className="py-2 pr-4 font-semibold text-slate-200">{f.name || f.email}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.current_level || "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_fala ?? "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_escuta ?? "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_leitura ?? "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_escrita ?? "-"}</td>
                      <td className="py-2 pr-4 text-slate-400">{f.score_gramatica ?? "-"}</td>
                      <td className="py-2 font-bold text-cyan-400">{mediaGeral(f) ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
