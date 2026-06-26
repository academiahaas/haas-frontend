'use client';

import React from 'react';

interface ErrorPoint {
  id: string;
  topic: string;
  count: number;
  severity: 'alta' | 'media' | 'baixa';
}

export default function SkillMap() {
  // Simulação dos dados de desvios que foram injetados pela IA [cite: 153, 154]
  const criticalErrors: ErrorPoint[] = [
    { id: '1', topic: 'Uso do Present Perfect', count: 14, severity: 'alta' },
    { id: '2', topic: 'Preposições (In/On/At)', count: 8, severity: 'media' },
    { id: '3', topic: 'Concordância Verbal', count: 3, severity: 'baixa' },
  ];

  return (
    <div className="bg-[#121214] text-white p-6 rounded-xl border border-zinc-800 shadow-2xl"> [cite: 7]
      <div className="mb-6">
        <h3 className="text-xl font-bold text-zinc-100">Mapa de Erros & Destreza</h3> [cite: 154, 156]
        <p className="text-sm text-zinc-400 mt-1">
          Visualização clara dos pontos gramaticais que precisam de reforço imediato. [cite: 154]
        </p>
      </div>

      {/* Lista de Reforço Imediato [cite: 154] */}
      <div className="space-y-4 mb-8">
        {criticalErrors.map((error) => (
          <div 
            key={error.id} 
            className="flex items-center justify-between p-4 bg-[#1a1a1e] rounded-lg border border-zinc-800"
          >
            <div>
              <p className="font-semibold text-zinc-200">{error.topic}</p>
              <p className="text-xs text-zinc-500">{error.count} desvios identificados pela IA</p> [cite: 153]
            </div>
            
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              error.severity === 'alta' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              error.severity === 'media' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              Foco {error.severity.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Indicador da Curva de Proficiência [cite: 161] */}
      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-sm font-medium text-emerald-400">Impacto do Feedback da IA</p> [cite: 162]
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          A curva de proficiência mostra uma redução drástica de erros gramaticais após a aplicação dos módulos estratégicos. [cite: 149, 161]
        </p>
      </div>
    </div>
  );
}