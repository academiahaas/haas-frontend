"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from "recharts";
import { supabase } from "@/lib/supabase";

interface RadarProps {
  idioma: string;
}

export default function RadarCompetenciasMobile({ idioma }: RadarProps) {
  const [competencias, setCompetencias] = useState({
    habla: 0,
    escucha: 0,
    lectura: 0,
    escritura: 0,
    gramatica: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function carregarCompetencias() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let userId = user?.id;

        if (!userId) {
          // Busca primeiro registro se auth não estiver ativo no cliente
          const { data: fallback } = await supabase.from("users").select("id").limit(1).maybeSingle();
          if (fallback) userId = fallback.id;
        }

        if (userId) {
          const { data, error } = await supabase
            .from("user_competencias")
            .select("habla, escucha, lectura, escritura, gramatica")
            .eq("user_id", userId)
            .maybeSingle();

          if (!error && data) {
            setCompetencias({
              habla: Number(data.habla || 0),
              escucha: Number(data.escucha || 0),
              lectura: Number(data.lectura || 0),
              escritura: Number(data.escritura || 0),
              gramatica: Number(data.gramatica || 0),
            });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar competencias:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarCompetencias();
  }, []);

  // Mapeamento de rótulos por idioma
  const labels = {
    PT: { fala: "FALA", escuta: "ESCUTA", leitura: "LEITURA", escrita: "ESCRITA", gramatica: "GRAMÁTICA" },
    ES: { fala: "HABLA", escuta: "ESCUCHA", leitura: "LECTURA", escrita: "ESCRITURA", gramatica: "GRAMÁTICA" },
    EN: { fala: "SPEAKING", escuta: "LISTENING", leitura: "READING", escrita: "WRITING", gramatica: "GRAMMAR" },
  }[idioma] || { fala: "FALA", escuta: "ESCUTA", leitura: "LEITURA", escrita: "ESCRITA", gramatica: "GRAMÁTICA" };

  const dataChart = [
    { subject: labels.fala, value: competencias.habla, fullMark: 100 },
    { subject: labels.escuta, value: competencias.escucha, fullMark: 100 },
    { subject: labels.leitura, value: competencias.lectura, fullMark: 100 },
    { subject: labels.escrita, value: competencias.escritura, fullMark: 100 },
    { subject: labels.gramatica, value: competencias.gramatica, fullMark: 100 },
  ];

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-slate-400 text-xs font-mono animate-pulse">
        Carregando gráfico...
      </div>
    );
  }

  return (
    <div className="w-full h-52 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={dataChart}>
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
          />
          <Radar
            name="Competências"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.45}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
