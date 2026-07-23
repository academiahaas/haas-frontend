import React, { useState } from "react";

interface Unidade {
  id: number;
  titulo: {
    PT: string;
    ES: string;
    EN: string;
  };
  objetivo: {
    PT: string;
    ES: string;
    EN: string;
  };
}

interface ListaUnidadesMobileProps {
  idioma: "PT" | "ES" | "EN";
  onAbrirMaterial?: (id: number) => void;
  onAbrirVideo?: (id: number) => void;
}

const UNIDADES_DATA: Unidade[] = [
  {
    id: 1,
    titulo: {
      PT: "Unidade 1: Vocabulário Técnico",
      ES: "Unidad 1: Vocabulario Técnico",
      EN: "Unit 1: Technical Vocabulary",
    },
    objetivo: {
      PT: "Dominar termos essenciais e jargões do setor para comunicação clara em reuniões.",
      ES: "Dominar términos esenciales y jerga del sector para una comunicación clara en reuniones.",
      EN: "Master essential industry terms and jargon for clear communication in meetings.",
    },
  },
  {
    id: 2,
    titulo: {
      PT: "Unidade 2: Conversação Aplicada",
      ES: "Unidad 2: Conversación Aplicada",
      EN: "Unit 2: Applied Conversation",
    },
    objetivo: {
      PT: "Aplicar frases estruturadas em simulações reais de apresentações e negociações.",
      ES: "Aplicar frases estructuradas en simulaciones reales de presentaciones y negociaciones.",
      EN: "Apply structured phrases in real simulation of presentations and negotiations.",
    },
  },
  {
    id: 3,
    titulo: {
      PT: "Unidade 3: Prática de Fluência",
      ES: "Unidad 3: Práctica de Fluidez",
      EN: "Unit 3: Fluency Practice",
    },
    objetivo: {
      PT: "Desenvolver rapidez de raciocínio e pronúncia natural sem pausas excessivas.",
      ES: "Desarrollar rapidez de razonamiento y pronunciación natural sin pausas excesivas.",
      EN: "Develop quick thinking and natural pronunciation without excessive pauses.",
    },
  },
  {
    id: 4,
    titulo: {
      PT: "Unidade 4: Expressões Avançadas",
      ES: "Unidad 4: Expresiones Avanzadas",
      EN: "Unit 4: Advanced Expressions",
    },
    objetivo: {
      PT: "Utilizar idiomatismos e nuance linguística para negociações de alto nível.",
      ES: "Utilizar modismos y matices lingüísticos para negociaciones de alto nivel.",
      EN: "Use idioms and linguistic nuance for high-level negotiations.",
    },
  },
];

export const ListaUnidadesMobile: React.FC<ListaUnidadesMobileProps> = ({
  idioma = "PT",
  onAbrirMaterial,
  onAbrirVideo,
}) => {
  const [unidadeExpandida, setUnidadeExpandida] = useState<number | null>(null);

  const toggleGaveta = (id: number) => {
    setUnidadeExpandida((prev) => (prev === id ? null : id));
  };

  const labels = {
    objetivo: { PT: "Objetivo da Unidade", ES: "Objetivo de la Unidad", EN: "Unit Objective" },
    ler: { PT: "Ler", ES: "Leer", EN: "Read" },
    video: { PT: "Vídeo", ES: "Video", EN: "Video" },
  };

  return (
    <div className="flex flex-col gap-3 w-full mt-3">
      {UNIDADES_DATA.map((u) => {
        const isExpanded = unidadeExpandida === u.id;
        return (
          <div
            key={u.id}
            className={`flex flex-col bg-slate-900/40 px-4 py-3.5 rounded-xl border transition-all duration-200 shadow-sm ${
              isExpanded
                ? "border-cyan-500/30 bg-slate-900/80 shadow-cyan-950/20"
                : "border-white/[0.05] hover:border-white/10"
            }`}
          >
            {/* Header do Card (Clicável) */}
            <div
              onClick={() => toggleGaveta(u.id)}
              className="flex justify-between items-center w-full cursor-pointer select-none"
            >
              <span className="text-white font-mono text-[clamp(11px,3.2vw,14px)] uppercase tracking-wider font-bold flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                {u.titulo[idioma] || u.titulo["PT"]}
              </span>
              <span className="text-slate-400 text-xs font-bold px-1.5 py-0.5 rounded bg-white/5">
                {isExpanded ? "▲" : "▼"}
              </span>
            </div>

            {/* Gaveta Expandível */}
            {isExpanded && (
              <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-white/[0.08] animate-fadeIn">
                {/* Objetivos da Unidade */}
                <div className="bg-black/30 rounded-lg p-2.5 border border-white/[0.03]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-extrabold block mb-1">
                    {labels.objetivo[idioma] || labels.objetivo["PT"]}
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed font-sans">
                    {u.objetivo[idioma] || u.objetivo["PT"]}
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 w-full justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAbrirMaterial) onAbrirMaterial(u.id);
                      else alert(`Material - Unidade ${u.id}`);
                    }}
                    className="flex-1 py-2 bg-slate-950/80 hover:bg-slate-900 active:scale-95 border border-cyan-500/20 rounded-lg text-[11px] font-mono font-black uppercase text-cyan-300 tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    {labels.ler[idioma] || labels.ler["PT"]}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAbrirVideo) onAbrirVideo(u.id);
                      else alert(`Vídeo - Unidade ${u.id}`);
                    }}
                    className="flex-1 py-2 bg-slate-950/80 hover:bg-slate-900 active:scale-95 border border-white/10 rounded-lg text-[11px] font-mono font-black uppercase text-slate-300 tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    {labels.video[idioma] || labels.video["PT"]}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
