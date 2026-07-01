"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Unidad {
  id: string;
  title: string;
  duration_minutes: number;
  is_completed: boolean;
  needs_review_by_ai: boolean; // Se a IA marcou que ele precisa rever por estar falhando
}

interface Modulo {
  id: string;
  module_number: number;
  title: string;
  status: "completed" | "current" | "locked";
  unidades: Unidad[];
}

export default function CronogramaProgresso() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarCronograma() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Buscar os módulos do aluno ordenados por sequência
        const { data: modulosData, error: modulosError } = await supabase
          .from("student_modules")
          .select("id, module_number, title, status")
          .eq("student_id", user.id)
          .order("module_number", { ascending: true });

        if (modulosError) throw modulosError;

        if (modulosData) {
          // 2. Para cada módulo, buscar as unidades vinculadas e verificar progresso do aluno
          const cronogramaCompleto = await Promise.all(
            modulosData.map(async (mod) => {
              const { data: unidadesData } = await supabase
                .from("units")
                .select("id, title, duration_minutes")
                .eq("module_id", mod.id);

              // Buscar quais unidades deste aluno já possuem registro de conclusão
              const { data: progressoData } = await supabase
                .from("student_progress")
                .select("unit_id, score_points")
                .eq("student_id", user.id);

              const unidadesProcessadas: Unidad[] = (unidadesData || []).map((uni) => {
                const concluida = progressoData?.some((p) => p.unit_id === uni.id) || false;
                
                // Regra: Se o score foi muito baixo ou a IA injetar um alerta no futuro (mockado para teste)
                const precisaRever = concluida && (uni.title.includes("Phrasal Verbs") || uni.title.includes("Gaps"));

                return {
                  id: uni.id,
                  title: uni.title,
                  duration_minutes: uni.duration_minutes || 15,
                  is_completed: concluida,
                  needs_review_by_ai: precisaRever
                };
              });

              return {
                id: mod.id,
                module_number: mod.module_number,
                title: mod.title,
                status: mod.status as "completed" | "current" | "locked",
                unidades: unidadesProcessadas
              };
            })
          );

          setModulos(cronogramaCompleto);
        }
      } catch (error) {
        console.error("Erro ao carregar cronograma inteligente:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarCronograma();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-1">
      <div className="border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold tracking-wider uppercase text-slate-200">🗂️ Módulos do Programa</h3>
        <p className="text-[11px] text-slate-500 font-mono">Cronograma fluido gerado sob demanda para a sua carreira.</p>
      </div>

      <div className="space-y-4">
        {modulos.map((modulo) => {
          const isCurrent = modulo.status === "current";
          const isCompleted = modulo.status === "completed";
          const isLocked = modulo.status === "locked";

          return (
            <div 
              key={modulo.id} 
              className={`rounded-2xl border transition-all duration-300 ${
                isCurrent 
                  ? "bg-amber-500/[0.01] border-amber-500/20" 
                  : isCompleted 
                  ? "bg-black/20 border-emerald-500/10 opacity-80" 
                  : "bg-black/40 border-white/5 opacity-40"
              }`}
            >
              {/* Cabeçalho do Módulo */}
              <div className="p-4 flex items-center justify-between gap-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-amber-500 block uppercase font-bold">
                    MÓDULO {modulo.module_number}
                  </span>
                  <h4 className={`text-sm font-bold tracking-tight ${isLocked ? "text-slate-400" : "text-white"}`}>
                    {modulo.title}
                  </h4>
                </div>

                {/* Badge de Status Dinâmico */}
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  isCurrent 
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                    : isCompleted 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : "bg-zinc-800 text-zinc-500"
                }`}>
                  {isCurrent ? "● Módulo Atual" : isCompleted ? "✓ Concluído" : "🔒 Bloqueado"}
                </span>
              </div>

              {/* Lista de Unidades Internas (Oculta se estiver bloqueado para manter o design limpo) */}
              {!isLocked && modulo.unidades.length > 0 && (
                <div className="p-3 divide-y divide-white/[0.03]">
                  {modulo.unidades.map((uni) => (
                    <div key={uni.id} className="py-3 px-1 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-200">{uni.title}</p>
                        <span className="text-[10px] text-slate-500 font-mono">⏱️ {uni.duration_minutes} min para concluir</span>
                      </div>

                      {/* Botão de Ação Inteligente */}
                      <div>
                        {uni.is_completed ? (
                          uni.needs_review_by_ai ? (
                            <button className="text-[10px] font-mono font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-lg transition-all shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                              ⚠️ REVER (Ajuste de IA)
                            </button>
                          ) : (
                            <button className="text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-3 py-1 rounded-lg transition-all">
                              🔄 Rever (Sem XP)
                            </button>
                          )
                        ) : (
                          <button className="text-[10px] font-mono font-bold bg-amber-500 text-black px-3 py-1 rounded-lg hover:bg-amber-400 transition-all">
                            ⚡ Iniciar Arena
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
