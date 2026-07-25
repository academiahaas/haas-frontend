"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  dia: number;
  mes: number;
  ano: number;
  modalidadeAluno: string;
  tipoFluxo: "REGULAR" | "REPOSICAO";
  alunoId: string;
  onSuccess: () => void;
}

export default function ModalHorariosDisponiveis({
  isOpen,
  onClose,
  dia,
  mes,
  ano,
  modalidadeAluno,
  tipoFluxo,
  alunoId,
  onSuccess,
}: ModalProps) {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [agendando, setAgendando] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && dia && mes && ano) {
      carregarHorarios();
    }
  }, [isOpen, dia, mes, ano]);

  const carregarHorarios = async () => {
    setLoading(true);
    try {
      // Monta a janela do dia em UTC para cobrir todo o dia na Colômbia (UTC-5)
      const dataInicioFiltro = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0)).toISOString();
      const dataFimFiltro = new Date(Date.UTC(ano, mes - 1, dia + 1, 12, 0, 0)).toISOString();

      const { data, error } = await supabase
        .from("aulas_disponiveis")
        .select("*")
        .gte("data_hora_inicio", dataInicioFiltro)
        .lte("data_hora_inicio", dataFimFiltro)
        .eq("status", "DISPONIVEL")
        .order("data_hora_inicio", { ascending: true });

      if (error) throw error;

      // Converte e filtra estritamente entre 08:00 e 20:00 na Colômbia (America/Bogota)
      const filtrados = (data || [])
        .map((item) => {
          const utcDate = new Date(item.data_hora_inicio);

          // Extrai a hora exata no fuso de Bogotá
          const horaBogotaStr = utcDate.toLocaleTimeString("en-US", {
            timeZone: "America/Bogota",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });

          const [hStr] = horaBogotaStr.split(":");
          const horaBogota = parseInt(hStr, 10);

          // Extrai o dia exato no fuso de Bogotá
          const diaBogotaStr = utcDate.toLocaleDateString("en-US", {
            timeZone: "America/Bogota",
            day: "numeric",
          });

          return {
            ...item,
            horaBogota,
            horaFormatted: `${horaBogotaStr}`,
            pertenceAoDia: parseInt(diaBogotaStr, 10) === dia,
          };
        })
        .filter((item) => {
          // Regra de Ouro: Apenas o dia selecionado + Janela 08:00 às 20:00 (COT)
          return item.pertenceAoDia && item.horaBogota >= 8 && item.horaBogota <= 20;
        });

      setHorarios(filtrados);
    } catch (err) {
      console.error("Erro ao carregar horários:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgendar = async (horario: any) => {
    setAgendando(horario.id);
    try {
      // 1. Atualiza o status na tabela aulas_disponiveis
      const { error: updateErr } = await supabase
        .from("aulas_disponiveis")
        .update({ status: "AGENDADO" })
        .eq("id", horario.id);

      if (updateErr) throw updateErr;

      // 2. Registra na tabela agendamentos_alunos
      const { error: insertErr } = await supabase
        .from("agendamentos_alunos")
        .insert({
          aluno_id: alunoId,
          aula_disponivel_id: horario.id,
          tipo: tipoFluxo,
          created_at: new Date().toISOString(),
        });

      if (insertErr) throw insertErr;

      onSuccess();
    } catch (err) {
      console.error("Erro ao realizar agendamento:", err);
      alert("Não foi possível concluir o agendamento. Tente novamente.");
    } finally {
      setAgendando(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex flex-col justify-end md:justify-center items-center p-0 md:p-4 animate-fade-in">
      <div className="bg-[#0b1528] border-t md:border border-white/10 rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-5 max-h-[85vh]">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              Horários Disponíveis
            </h3>
            <p className="text-xs text-slate-400">
              {dia}/{mes}/{ano} • Horário da Colômbia (COT)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-2"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-sm">
            Buscando horários disponíveis...
          </div>
        ) : horarios.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono text-sm">
            Nenhum horário disponível para esta data (08:00 às 20:00).
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1">
            {horarios.map((h) => (
              <button
                key={h.id}
                disabled={agendando === h.id}
                onClick={() => handleAgendar(h)}
                className="py-3 px-4 bg-slate-900/80 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/50 rounded-xl text-white font-mono text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span>{h.horaFormatted}</span>
                <span className="text-[10px] text-slate-400 uppercase font-sans">
                  {h.tipo_aula}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
