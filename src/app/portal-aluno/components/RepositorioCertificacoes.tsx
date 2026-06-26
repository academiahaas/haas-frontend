"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface BadgeItem {
  id: string;
  badge_name: string;
  badge_description: string;
  status: "active" | "inactive";
  earned_at: string;
}

export default function RepositorioCertificacoes() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarRepositorio() {
      try {
        const { data, error } = await supabase
          .from("student_badges")
          .select("id, badge_name, badge_description, status, earned_at")
          .order("earned_at", { ascending: false });

        if (error) throw error;
        if (data) setBadges(data);
      } catch (error) {
        console.error("Erro ao carregar repositório de insígnias:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarRepositorio();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-black/10 border border-white/5 rounded-2xl mt-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <h4 className="text-xs font-mono tracking-widest text-slate-400 uppercase">// Centro de Certificações Coletadas</h4>
        <span className="text-[10px] text-slate-500 font-mono">Total: {badges.length}</span>
      </div>

      {badges.length === 0 ? (
        <p className="text-xs text-slate-500 font-mono text-center py-4">Nenhuma insígnia conquistada ainda nesta temporada.</p>
      ) : (
        <div className="space-y-3">
          {badges.map((item) => {
            const isActive = item.status === "active";

            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? "bg-amber-500/[0.02] border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.02)]" 
                    : "bg-black/40 border-white/5 opacity-50 select-none"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  {/* Nome da Insígnia */}
                  <h5 className={`text-sm font-bold tracking-tight ${isActive ? "text-amber-400" : "text-slate-500 line-through"}`}>
                    🏅 {item.badge_name}
                  </h5>
                  
                  {/* Status Fluido (Ativo / Inativo) */}
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                  }`}>
                    {isActive ? "● Activa" : "○ Inactiva (Requere Prática)"}
                  </span>
                </div>

                {/* Elogio / Descrição da IA abaixo */}
                <p className={`text-xs leading-relaxed ${isActive ? "text-slate-300" : "text-slate-600"}`}>
                  {item.badge_description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
