"use client";

import React from "react";

export type TipoConclusao = "UNIDADE" | "MODULO" | "NIVEL";
export type NivelCurso = "A1" | "A2" | "B1" | "B2" | "C1";
export type IdiomaPlataforma = "PT" | "EN" | "ES";

interface ModalConclusaoProps {
  isOpen: boolean;
  tipo: TipoConclusao;
  nivel?: NivelCurso;
  lang?: IdiomaPlataforma;
  unidadeNome?: string;
  moduloNome?: string;
  onIniciarProvaEscrita?: () => void;
  onContinuar?: () => void;
  onClose?: () => void;
}

const PALETA_NIVEIS: Record<NivelCurso, { border: string; bgGlow: string; badgeBg: string; badgeText: string; btnBg: string }> = {
  A1: {
    border: "border-cyan-500/40/40",
    bgGlow: "bg-cyan-400/15",
    badgeBg: "bg-cyan-400/20",
    badgeText: "text-purple-300",
    btnBg: "bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-purple-400 hover:to-cyan-400 text-black",
  },
  A2: {
    border: "border-emerald-500/40",
    bgGlow: "bg-emerald-500/15",
    badgeBg: "bg-emerald-500/20",
    badgeText: "text-emerald-400",
    btnBg: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black",
  },
  B1: {
    border: "border-cyan-500/40",
    bgGlow: "bg-cyan-500/15",
    badgeBg: "bg-cyan-500/20",
    badgeText: "text-cyan-400",
    btnBg: "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black",
  },
  B2: {
    border: "border-violet-500/40",
    bgGlow: "bg-violet-500/15",
    badgeBg: "bg-violet-500/20",
    badgeText: "text-violet-400",
    btnBg: "bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white",
  },
  C1: {
    border: "border-rose-500/40",
    bgGlow: "bg-rose-500/15",
    badgeBg: "bg-rose-500/20",
    badgeText: "text-rose-400",
    btnBg: "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white",
  },
};

const DADOS_IDIOMA = {
  PT: {
    UNIDADE: {
      titulo: "Parabéns!",
      subtitulo: "Você concluiu esta unidade com sucesso!",
      btn: "Continuar",
    },
    MODULO: {
      titulo: "Módulo Concluído!",
      subtitulo: "Parabéns por finalizar mais uma etapa da sua jornada!",
      btn: "Continuar",
    },
    NIVEL: {
      titulo: "Nível Concluído!",
      subtitulo: "Parabéns pela grande conquista! Você concluiu todas as etapas deste nível.",
      instrucaoAgenda: "Agora, faça a sua Prova Escrita e lembre-se de agendar a sua Prova Oral na agenda.",
      suporte: "Dúvidas? Entre em contato com o Atendimento ao Usuário.",
      btn: "Fazer Prova Escrita",
    },
  },
  EN: {
    UNIDADE: {
      titulo: "Congratulations!",
      subtitulo: "You have successfully completed this unit!",
      btn: "Continue",
    },
    MODULO: {
      titulo: "Module Completed!",
      subtitulo: "Congratulations on finishing another stage of your learning journey!",
      btn: "Continue",
    },
    NIVEL: {
      titulo: "Level Completed!",
      subtitulo: "Amazing achievement! You have completed all stages for this level.",
      instrucaoAgenda: "Next, take your Written Exam and remember to schedule your Oral Exam in the calendar.",
      suporte: "Questions? Contact Customer Support.",
      btn: "Take Written Exam",
    },
  },
  ES: {
    UNIDADE: {
      titulo: "¡Felicitaciones!",
      subtitulo: "¡Has completado esta unidad con éxito!",
      btn: "Continuar",
    },
    MODULO: {
      titulo: "¡Módulo Completado!",
      subtitulo: "¡Felicitaciones por finalizar otra etapa de tu aprendizaje!",
      btn: "Continuar",
    },
    NIVEL: {
      titulo: "¡Nivel Completado!",
      subtitulo: "¡Increíble logro! Has completado todas las etapas de este nivel.",
      instrucaoAgenda: "Ahora, realiza tu Prueba Escrita y recuerda agendar tu Prueba Oral en la agenda.",
      suporte: "¿Preguntas? Ponte en contacto con Atención al Usuario.",
      btn: "Realizar Prueba Escrita",
    },
  },
};

const IconeCheck = () => (
  <svg className="w-12 h-12 text-violet-400 mx-auto drop-shadow-[0_0_10px_rgba(167,139,250,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconeTrofeu = () => (
  <svg className="w-12 h-12 text-emerald-400 mx-auto drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2 0h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const IconeGraduacao = () => (
  <svg className="w-12 h-12 text-purple-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

export const ModalConclusao: React.FC<ModalConclusaoProps> = ({
  isOpen,
  tipo,
  nivel = "A1",
  lang = "PT",
  unidadeNome,
  moduloNome,
  onIniciarProvaEscrita,
  onContinuar,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = DADOS_IDIOMA[lang] || DADOS_IDIOMA.PT;
  const configNivel = PALETA_NIVEIS[nivel] || PALETA_NIVEIS.A1;

  const isNivel = tipo === "NIVEL";
  const isUnidade = tipo === "UNIDADE";
  const acaoBotao = isNivel ? onIniciarProvaEscrita : onContinuar;

  // Definições de Estilo:
  // - UNIDADE: Roxo Elétrico Deep
  // - MODULO: Verde Esmeralda Deep Gamer
  // - NIVEL: Dinâmico por nível (A1..C1)
  const borderClass = isNivel
    ? configNivel.border
    : isUnidade
    ? "border-violet-500/40 shadow-[0_0_25px_rgba(139,92,246,0.15)]"
    : "border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]";

  const glowClass = isNivel
    ? configNivel.bgGlow
    : isUnidade
    ? "bg-violet-500/15"
    : "bg-emerald-500/15";

  const btnClass = isNivel
    ? configNivel.btnBg
    : isUnidade
    ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
    : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div
        className={`bg-[#181b22] border ${borderClass} rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden transition-all duration-300`}
      >
        <div
          className={`absolute -top-16 -left-16 w-36 h-36 ${glowClass} rounded-full blur-3xl pointer-events-none`}
        />
        <div
          className={`absolute -bottom-16 -right-16 w-36 h-36 ${glowClass} rounded-full blur-3xl pointer-events-none`}
        />

        <div className="relative z-10 space-y-4">
          {isNivel && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1">
              <span className={`${configNivel.badgeBg} ${configNivel.badgeText} px-3 py-1 rounded-full border border-white/5`}>
                Nível {nivel}
              </span>
            </div>
          )}

          <div className="mb-2">
            {tipo === "UNIDADE" ? <IconeCheck /> : tipo === "MODULO" ? <IconeTrofeu /> : <IconeGraduacao />}
          </div>

          <h2 className="text-2xl font-black text-white tracking-wide">
            {t[tipo].titulo}
          </h2>

          <p className="text-gray-300 text-sm leading-relaxed">
            {t[tipo].subtitulo}
          </p>

          {!isNivel && (unidadeNome || moduloNome) && (
            <div className="bg-[#212530] border border-white/5 rounded-2xl p-3 text-xs font-medium text-center">
              {unidadeNome && <div className="text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.3)]">{unidadeNome}</div>}
              {moduloNome && <div className="text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{moduloNome}</div>}
            </div>
          )}

          {isNivel && (
            <div className="bg-[#212530] border border-white/10 rounded-2xl p-4 text-xs text-gray-200 text-left space-y-2 leading-relaxed">
              <p className="text-gray-200 font-medium">
                {t.NIVEL.instrucaoAgenda}
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] text-gray-400 text-center">
                {t.NIVEL.suporte}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={acaoBotao || onClose}
              className={`w-full py-4 px-6 font-black rounded-2xl shadow-xl transform transition active:scale-95 cursor-pointer text-sm tracking-wider uppercase ${btnClass}`}
            >
              {t[tipo].btn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConclusao;
