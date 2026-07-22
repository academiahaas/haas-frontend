"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Unit {
  id: string;
  unit_number: string;
  unit_title: string;
  estimated_hours?: string | number;
}

interface ModuleContent {
  id: string;
  level_tag: string;
  module_number: number;
  module_title: string;
  units: Unit[];
}

interface ModalTrilhaMobileProps {
  isOpen: boolean;
  onClose: () => void;
  idiomaSelecionado: "PT" | "EN" | "ES";
  nivelAluno?: string;
  moduloAtualNumero?: number;
}

export const ModalTrilhaMobile: React.FC<ModalTrilhaMobileProps> = ({
  isOpen,
  onClose,
  idiomaSelecionado,
  nivelAluno = "A1",
  moduloAtualNumero = 1,
}) => {
  const [modulos, setModulos] = useState<ModuleContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [moduloExpandido, setModuloExpandido] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchTrilha = async () => {
      setLoading(true);
      try {
        const { data: dataModulos, error: errMod } = await supabase
          .from("modules_content")
          .select("id, level_tag, module_number, module_title")
          .eq("level_tag", nivelAluno)
          .order("module_number", { ascending: true });

        if (errMod || !dataModulos) {
          console.error("Erro ao buscar módulos:", errMod);
          setLoading(false);
          return;
        }

        const moduleIds = dataModulos.map((m) => m.id);

        const { data: dataUnits, error: errUnits } = await supabase
          .from("units")
          .select("id, module_content_id, module_id, unit_number, unit_title, estimated_hours")
          .or(`module_content_id.in.(${moduleIds.join(",")}),module_id.in.(${moduleIds.join(",")})`)
          .order("unit_number", { ascending: true });

        if (errUnits) console.error("Erro ao buscar unidades:", errUnits);

        const modulosFormatados: ModuleContent[] = dataModulos.map((mod) => {
          const unidadesDoModulo = (dataUnits || []).filter(
            (u) => u.module_content_id === mod.id || u.module_id === mod.id
          );
          return { ...mod, units: unidadesDoModulo };
        });

        setModulos(modulosFormatados);
        setModuloExpandido(moduloAtualNumero);
      } catch (err) {
        console.error("Erro no processamento da trilha:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrilha();
  }, [isOpen, nivelAluno, moduloAtualNumero]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full bg-[#070d19] border-t border-white/[0.08] rounded-t-2xl max-h-[80vh] min-h-[50vh] flex flex-col relative z-10 animate-slide-up">
        <div className="p-4 border-b border-white/[0.04] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <h3 className="font-mono font-black uppercase text-sm md:text-lg tracking-wider text-slate-200">
              {idiomaSelecionado === "PT" ? "Módulos do Programa" : idiomaSelecionado === "ES" ? "Módulos del Programa" : "Program Modules"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="py-1 px-3 bg-slate-900 text-slate-400 border border-white/[0.03] rounded-lg font-mono font-black text-[10px] md:text-sm uppercase tracking-wider active:scale-[0.97] md:px-5 md:py-2"
          >
            {idiomaSelecionado === "PT" ? "Fechar" : idiomaSelecionado === "ES" ? "Cerrar" : "Close"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-none pb-8 text-left">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-cyan-400 font-mono text-xs">
              <span className="animate-pulse">
                {idiomaSelecionado === "PT" ? "CARREGANDO TRILHA..." : idiomaSelecionado === "ES" ? "CARGANDO RUTA..." : "LOADING PATH..."}
              </span>
            </div>
          ) : modulos.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-mono text-xs">
              {idiomaSelecionado === "PT" ? "Nenhum módulo encontrado para este nível." : idiomaSelecionado === "ES" ? "No se encontraron módulos para este nivel." : "No modules found for this level."}
            </div>
          ) : (
            modulos.map((mod) => {
              const isConcluido = mod.module_number < moduloAtualNumero;
              const isAtual = mod.module_number === moduloAtualNumero;
              const isBloqueado = mod.module_number > moduloAtualNumero;
              const isExpanded = moduloExpandido === mod.module_number;

              const borderClass = isAtual
                ? "border-orange-500/30 bg-orange-500/[0.02] shadow-lg shadow-orange-500/5"
                : isConcluido
                ? "border-emerald-500/10 bg-emerald-500/[0.01]"
                : "border-slate-800 bg-slate-900/20 opacity-60";

              const tagColorClass = isAtual ? "text-orange-400 animate-pulse" : isConcluido ? "text-emerald-400" : "text-slate-500";

              const statusLabel = isConcluido
                ? idiomaSelecionado === "PT" ? "CONCLUÍDO" : idiomaSelecionado === "ES" ? "COMPLETADO" : "COMPLETED"
                : isAtual
                ? idiomaSelecionado === "PT" ? "ATUAL" : idiomaSelecionado === "ES" ? "ACTUAL" : "CURRENT"
                : idiomaSelecionado === "PT" ? "BLOQUEADO" : idiomaSelecionado === "ES" ? "BLOQUEADO" : "LOCKED";

              return (
                <div key={mod.id} className={`border rounded-xl overflow-hidden transition-all ${borderClass}`}>
                  <div onClick={() => setModuloExpandido(isExpanded ? null : mod.module_number)} className="p-3 flex justify-between items-center cursor-pointer active:bg-white/[0.01]">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[9px] md:text-xs font-mono font-black uppercase tracking-wider ${tagColorClass}`}>
                        MODULE {String(mod.module_number).padStart(2, "0")} • {statusLabel}
                      </span>
                      <h4 className="text-sm md:text-xl text-slate-200 font-bold leading-tight">{mod.module_title}</h4>
                    </div>
                    <span className={`${tagColorClass} font-mono text-xs`}>{isExpanded ? "▲" : "▼"}</span>
                  </div>

                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-white/[0.04] flex flex-col gap-2 bg-[#040912]">
                      {mod.units.length === 0 ? (
                        <p className="text-[11px] text-slate-600 font-mono italic py-2">
                          {idiomaSelecionado === "PT" ? "Nenhuma unidade cadastrada." : "No units found."}
                        </p>
                      ) : (
                        mod.units.map((unit) => (
                          <div key={unit.id} className="flex justify-between items-center p-2.5 bg-slate-900/50 rounded-lg border border-white/[0.02] mt-1.5">
                            <div className="flex flex-col">
                              <p className="text-[11px] md:text-sm text-slate-300 font-mono font-medium">
                                {unit.unit_number} - {unit.unit_title}
                              </p>
                              {unit.estimated_hours && (
                                <span className="text-[9px] text-slate-500 font-mono">{unit.estimated_hours} min</span>
                              )}
                            </div>
                            <button
                              disabled={isBloqueado}
                              className={`text-[10px] md:text-xs font-mono font-black uppercase px-3 py-1 rounded border transition-all ${
                                isConcluido ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10" : isAtual ? "text-slate-950 border-orange-500 bg-orange-500 hover:brightness-110 shadow-md shadow-orange-500/20" : "text-slate-600 border-slate-800 bg-slate-900/50 cursor-not-allowed"
                              }`}
                            >
                              {isConcluido ? (idiomaSelecionado === "PT" ? "REVISAR" : "REVIEW") : isAtual ? (idiomaSelecionado === "PT" ? "INICIAR" : idiomaSelecionado === "ES" ? "INICIAR" : "START") : (idiomaSelecionado === "PT" ? "TRAVADO" : "LOCKED")}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};