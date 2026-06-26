"use client";

export const dynamic = 'force-dynamic';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Shield, Lock, Mail, Loader2, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginUnifiedSSO() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Autenticação na camada de infraestrutura do Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Se a API ou o Middleware de borda barrar por Rate Limiting (HTTP 429)
      if (error) {
        if (error.status === 429) {
          throw new Error("Ataque de força bruta detectado. Seu IP foi bloqueado temporariamente.");
        }
        throw error;
      }

      if (data?.user) {
        // 2. Busca do papel administrativo, docente ou estudantil na tabela_usuarios
        const { data: usuario, error: userError } = await supabase
          .from("tabela_usuarios")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (userError) throw userError;

        if (!usuario) {
          setLoading(false);
          setErrorMsg("Usuário autenticado, mas perfil não localizado na tabela_usuarios.");
          return;
        }

        // 3. Roteamento Premium Automatizado por privilégios no ecossistema
        if (usuario.role === "student" || usuario.role === "aluno") {
          router.push("/portal-aluno");
        } else if (usuario.role === "faculty" || usuario.role === "professor") {
          router.push("/portal-professor");
        } else if (usuario.role === "admin") {
          router.push("/portal-admin");
        } else {
          setErrorMsg("Nível de acesso não parametrizado no sistema.");
        }
      }
    } catch (err: any) {
      if (err.message === "Invalid login credentials") {
        setErrorMsg("E-mail corporativo ou senha incorretos.");
      } else {
        setErrorMsg(err.message || "Falha crítica ao conectar com o gateway de segurança.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Detalhe estético de fundo premium da Academia Haas */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Identidade Visual do Portal de Acesso Unificado */}
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20 mb-4">
            H
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Academia Haas</h1>
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-1">Acesso Unificado SSO</p>
        </div>

        {/* Notificação Reativa de Erro / Rate Limit */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-medium text-rose-400 flex items-center gap-2.5 transition-all">
            <AlertCircle size={16} className="shrink-0" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {/* Formulário de Login Seguro */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@academiahaas.com"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Sua Senha</label>
              <a href="#" className="text-[11px] text-emerald-400 hover:underline font-medium">Esqueceu?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-center text-sm shadow-lg shadow-emerald-500/10 transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Validando privilégios...</span>
              </>
            ) : (
              <>
                <span>Entrar na Plataforma</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé do Gateway Baseado em Next.js */}
        <footer className="pt-2 border-t border-slate-800/60 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <Shield size={12} className="text-emerald-500/60" />
          <span>Next.js Premium Gateway Protegido contra Força Bruta</span>
        </footer>

      </div>
    </div>
  );
}