"use client";

import React, { useState } from "react";

interface MobileMentorFocusCardProps {
  idiomaSelecionado?: string;
  primeiroNome?: string;
  totalXp?: number;
  streakDias?: number;
  xpPorcentagem?: number;
  dicaArena?: string;
  MascoteRoboAI: React.ComponentType<{ devePiscar?: boolean; idioma?: string; olharDireta?: boolean }>;
  roboDevePiscar?: boolean;
  olharDireta?: boolean;
}

export const MobileMentorFocusCard: React.FC<MobileMentorFocusCardProps> = ({
  idiomaSelecionado = "PT",
  primeiroNome = "",
  totalXp = 0,
  streakDias = 0,
  xpPorcentagem = 0,
  dicaArena = "",
  MascoteRoboAI,
  roboDevePiscar,
  olharDireta
}) => {
  const [botPhraseIndex, setBotPhraseIndex] = useState(0);

  const obterMensagemMentora = () => {
    const lang = (idiomaSelecionado || "PT").toUpperCase();
    const h = new Date().getHours();
    const saudacaoTime =
      h < 12
        ? lang === "ES" ? "¡Buenos días" : lang === "EN" ? "Good morning" : "Bom dia"
        : h < 18
        ? lang === "ES" ? "¡Buenas tardes" : lang === "EN" ? "Good afternoon" : "Boa tarde"
        : lang === "ES" ? "¡Buenas noches" : lang === "EN" ? "Good evening" : "Boa noite";

    const streakTexto =
      streakDias > 0
        ? lang === "ES"
          ? `¡Llevas ${streakDias} días seguidos!`
          : lang === "EN"
          ? `You're on a ${streakDias}-day streak!`
          : `Você está em uma sequência de ${streakDias} dias!`
        : "";

    const dicaArenaPadrao =
      dicaArena ||
      (lang === "ES"
        ? "¡Practica en la Arena de Quiz para ganar XP extra!"
        : lang === "EN"
        ? "Practice in the Quiz Arena to earn bonus XP!"
        : "Pratique na Arena de Quiz para ganhar XP extra!");

    const bancoConselhos: Record<string, string[]> = {
      PT: [
        `${saudacaoTime}, ${primeiroNome}! Pronto para avançar na sua jornada hoje?`,
        dicaArenaPadrao,
        `Você já domina ${xpPorcentagem}% desta unidade. Vamos buscar o próximo nível hoje?`,
        `Ótimo progresso, ${primeiroNome}! ${streakTexto} Não deixe sua sequência cair.`,
        `Dica da Mentora: Pratique 15 minutos por dia para acelerar sua fluência!`
      ],
      EN: [
        `${saudacaoTime}, ${primeiroNome}! Ready to level up your skills today?`,
        dicaArenaPadrao,
        `You have mastered ${xpPorcentagem}% of this unit. Let's aim for the next level today?`,
        `Great momentum, ${primeiroNome}! ${streakTexto} Keep your Retention Streak safe today.`,
        `Mentor's Tip: Practicing 15 minutes daily drastically improves long-term memory!`
      ],
      ES: [
        `${saudacaoTime}, ${primeiroNome}! ¿Listo para avanzar en tu nivel hoy?`,
        dicaArenaPadrao,
        `Ya dominas el ${xpPorcentagem}% de esta unidad. ¿Vamos por el siguiente nivel hoy?`,
        `¡Buen progreso, ${primeiroNome}! ${streakTexto} No dejes que tu racha caiga hoy.`,
        `Consejo de la Mentora: Practicar 15 minutos diarios acelera tu fluidez.`
      ]
    };

    const listaAtual = bancoConselhos[lang] || bancoConselhos["PT"];
    return listaAtual[botPhraseIndex % listaAtual.length];
  };

  return (
    <div className="bg-slate-950/40 border-[0.5px] border-white/[0.05] pt-3 pb-3 px-4 rounded-xl flex flex-col gap-[7px] w-full block clear-both backdrop-blur-md shadow-[0_0_20px_rgba(4,12,22,0.4)]">
      <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
        <span className="text-[clamp(11px,3vw,15px)] font-mono font-black uppercase text-white tracking-wider">
          {idiomaSelecionado === "PT" ? "Foco Estratégico" : idiomaSelecionado === "ES" ? "Enfoque Estratégico" : "Strategic Focus"}
        </span>
        <span className="text-[clamp(13px,3.5vw,18px)] font-mono font-black text-cyan-400">+{totalXp} PTS</span>
      </div>

      {/* Container do Balão + Robozinho Mobile Exclusivo */}
      <div className="flex flex-row items-center justify-between gap-3 mt-2">
        {/* Balão de Fala Dinâmico Estilo Mentora */}
        <div className="flex-1 bg-black/40 border-[0.5px] border-amber-500/10 p-3 rounded-xl flex items-center justify-center relative min-h-[64px]">
          <p className="text-[clamp(11px,3vw,15px)] text-white/90 font-medium leading-relaxed transition-all">
            {obterMensagemMentora()}
          </p>
          {/* Seta do Balão apontando para o robô */}
          <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-950 border-t border-r border-amber-500/10 rotate-45" />
        </div>

        {/* Box do Avatar da Mentora HAAS Clicável */}
        <div
          onClick={() => setBotPhraseIndex(prev => prev + 1)}
          className="cursor-pointer transition-all active:scale-95 hover:scale-105 shrink-0"
          title="Clique para alternar a dica no mobile"
        >
          <MascoteRoboAI devePiscar={roboDevePiscar} idioma={idiomaSelecionado} olharDireta={olharDireta} />
        </div>
      </div>
    </div>
  );
};
