"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Unit {
  id: string;
  unit_number: number;
  title: string;
  score_points: number;
  daily_goal_minutes: number;
  grammatical_structures: string[];
  lexicon_vocabulary: string[];
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  units: Unit[];
}

export default function PainelModulos({ onSelectUnit }: { onSelectUnit: (unit: Unit, moduleTitle: string) => void }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourseStructure() {
      try {
        const { data: modulesData, error: modError } = await supabase
          .from("modules")
          .select("*")
          .order("module_number", { ascending: true });

        if (modError) throw modError;

        if (modulesData) {
          const structuredModules = await Promise.all(
            modulesData.map(async (mod) => {
              const { data: unitsData, error: unitError } = await supabase
                .from("units")
                .select("*")
                .eq("module_id", mod.id)
                .order("unit_number", { ascending: true });

              if (unitError) throw unitError;

              return {
                id: mod.id,
                module_number: mod.module_number,
                title: mod.title,
                units: unitsData || [],
              };
            })
          );
          setModules(structuredModules);
          if (structuredModules.length > 0) setExpandedModule(structuredModules[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar estrutura do curso:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCourseStructure();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 max-w-5xl mx-auto px-4">
      <h2 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-2">
        // Estrutura de Treinamento Disponível
      </h2>

      {modules.map((mod) => {
        const isExpanded = expandedModule === mod.id;

        return (
          <div 
            key={mod.id} 
            className="border border-white/5 bg-black/20 rounded-xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
              className="w-full flex items-center justify-between p-5 text-left bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
            >
              <div>
                <span className="text-[10px] font-mono tracking-wider text-amber-500 uppercase block mb-1">
                  Módulo {String(mod.module_number).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {mod.title}
                </h3>
              </div>
              <div className="text-slate-500 font-mono text-sm">
                {isExpanded ? "▲" : "▼"}
              </div>
            </button>

            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isExpanded ? "max-h-[1000px] opacity-100 border-t border-white/5 p-5 space-y-4" : "max-h-0 opacity-0"
              }`}
            >
              {mod.units.map((unit) => (
                <div 
                  key={unit.id}
                  className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/30 transition-all duration-300"
                >
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400">
                      <span>UNIDADE {unit.unit_number}</span>
                      <span className="text-amber-500">• SCORE ATIVO: +{unit.score_points} PTS</span>
                      <span className="text-cyan-400">• META DIÁRIA: {unit.daily_goal_minutes} MIN</span>
                    </div>

                    <h4 className="text-base font-semibold text-slate-200">
                      {unit.title}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/5">
                      <div>
                        <h5 className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
                          Estruturas Gramaticais
                        </h5>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                          {unit.grammatical_structures.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
                          Léxico & Vocabulário
                        </h5>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                          {unit.lexicon_vocabulary.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => onSelectUnit(unit, mod.title)}
                      className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs tracking-wider px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    >
                      Avançar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
