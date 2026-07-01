"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface GraficoProps {
  dados: {
    skill: string;
    value: number;
  }[];
}

export default function GraficoCompetencias({ dados }: GraficoProps) {
  // Dados padrão caso o aluno não tenha feito nenhum exercício ainda
  const dadosDefinidos = dados && dados.length > 0 ? dados : [
    { skill: "Fala", value: 70 },
    { skill: "Escuta", value: 80 },
    { skill: "Gramática", value: 55 },
    { skill: "Escrita", value: 65 },
    { skill: "Leitura", value: 85 },
  ];

  return (
    <div className="w-full bg-black/20 border border-white/5 rounded-2xl p-6 max-w-xl mx-auto">
      <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-6">// Análise de Competências</h3>
      
      <div className="w-full h-64 flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dadosDefinidos}>
            {/* Grid interna do Radar */}
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            
            {/* Texto das Extremidades (Fala, Escuta, etc) */}
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: "bold" }} 
            />
            
            {/* Eixo de alcance de 0 a 100% */}
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            
            {/* A Linha e Preenchimento Laranja Executivo igual ao layout */}
            <Radar
              name="Competências"
              dataKey="value"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
