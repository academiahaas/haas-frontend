"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Autentica de verdade contra o Supabase Auth (confere e-mail + senha)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: senha,
      });

      if (authError || !authData.user) {
        console.error("Erro ao autenticar:", authError);
        setErro("Correo o contraseña incorrectos. Verifica tus datos.");
        setLoading(false);
        return;
      }

      const { data: dadosProfessor } = await supabase
        .from("teachers")
        .select("id, name, email")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (dadosProfessor) {
        localStorage.removeItem("haas_aluno_cache");
        localStorage.setItem("haas_teacher_id", dadosProfessor.id);
        localStorage.setItem("haas_teacher_email", dadosProfessor.email);
        localStorage.setItem("haas_teacher_name", dadosProfessor.name || "");
        window.location.href = "/portal-professor";
        return;
      }

      const { data: dadosEmpresa } = await supabase
        .from("corporate_accounts")
        .select("id, company_name, boss_email")
        .eq("boss_email", cleanEmail)
        .maybeSingle();

      if (dadosEmpresa) {
        localStorage.removeItem("haas_aluno_cache");
        localStorage.setItem("haas_corporate_id", dadosEmpresa.id);
        localStorage.setItem("haas_corporate_email", dadosEmpresa.boss_email);
        localStorage.setItem("haas_corporate_name", dadosEmpresa.company_name || "");
        window.location.href = "/portal-empresa";
        return;
      }



      const { data } = await supabase
        .from("user_subscriptions")
        .select("id, user_id, email, first_name, last_name, course_language")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (!data) {
        setErro("Usuario no encontrado. Por favor verifica tu correo o realiza el diagnóstico.");
        setLoading(false);
        return;
      }

      // Limpa dados de sessões anteriores do navegador
      localStorage.removeItem("haas_aluno_cache");
      localStorage.removeItem("haas_uid");
      localStorage.removeItem("supabase_uid");
      localStorage.removeItem("user_id");

      // Grava o ID do usuario (users.id) e dados no localStorage para o Portal
      localStorage.setItem("haas_user_id", authData.user.id);
      localStorage.setItem("haas_user_email", authData.user.email || cleanEmail);
      localStorage.setItem("haas_user_name", `${data.first_name || ""} ${data.last_name || ""}`.trim());

      window.location.href = "/portal-aluno";
    } catch (err) {
      console.error("Erro no login:", err);
      setErro("Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        
        {/* LOGO HAAS LANGUAGE */}
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => router.push("/")}>
          <span className="font-extrabold text-2xl tracking-wider text-white">HAAS</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold uppercase tracking-widest">
            LANGUAGE
          </span>
        </div>

        <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-extrabold text-white">Iniciar Sesión</h1>
            <p className="text-xs text-slate-400">Bienvenido de nuevo a tu campus de aprendizaje.</p>
          </div>

          {erro && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium animate-fadeIn">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Contraseña</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="text-right">
              <a href="#" className="text-xs text-indigo-400 hover:underline">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Ingresar a la Arena
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <p className="text-xs text-slate-400">¿Aún no tienes cuenta?</p>
            <button 
              onClick={() => router.push("/diagnostico")}
              className="text-xs text-indigo-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Haz tu Diagnóstico Gratis <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
