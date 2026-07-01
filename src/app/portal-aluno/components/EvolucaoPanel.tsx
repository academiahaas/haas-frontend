// @ts-nocheck
'use client';

import React from 'react';
import { TrendingUp, Award, Link2 } from 'lucide-react';

interface EvolucaoPanelProps {
  idioma?: "PT" | "ES" | "EN";
}

export function EvolucaoPanel({ idioma = "PT" }: EvolucaoPanelProps) {
  return (
    <div className="space-y-4">
      <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl text-xs font-bold text-slate-300 space-y-3">
        <h3 className="text-white font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <TrendingUp size={14} className="text-indigo-400"/> 
          {idioma === "PT" ? "Painel de Evolução" : idioma === "ES" ? "Panel de Evolución" : "Evolution Panel"}
        </h3>
        <div className="font-mono space-y-1">
          <p>{idioma === "PT" ? "Nível Atual" : idioma === "ES" ? "Nivel Actual" : "Current Level"}: <span className="text-white font-black">B1</span></p>
          <p>{idioma === "PT" ? "Próximo Nível" : idioma === "ES" ? "Próximo Nivel" : "Next Level"}: <span className="text-indigo-400 font-black">B2</span></p>
          <p>{idioma === "PT" ? "Restante" : idioma === "ES" ? "Restante" : "Remaining"}: <span className="text-amber-400 font-black">--- PTS</span></p>
        </div>
      </div>
      <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl text-xs font-bold text-slate-300 space-y-2">
        <h3 className="text-white font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <Link2 size={14} className="text-indigo-400"/> 
          {idioma === "PT" ? "Recursos Úteis" : idioma === "ES" ? "Recursos Útiles" : "Useful Resources"}
        </h3>
        <ul className="space-y-2 pt-1 font-medium text-indigo-400">
          <li>
            <a href="#" className="hover:underline flex items-center gap-1">
              📝 {idioma === "PT" ? "Avaliação de Classe" : idioma === "ES" ? "Evaluación de Clase" : "Class Evaluation"} (Google Forms)
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline flex items-center gap-1">
              📅 {idioma === "PT" ? "Reprogramação de Classes" : idioma === "ES" ? "Reprogramación de Clases" : "Class Rescheduling"} (Calendar)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
