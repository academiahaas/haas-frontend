"use client";

import React, { useEffect, useState } from "react";
import { buscarAulaAoVivoCentral } from "@/services/centralService";

export default function BotaoEntrarAula({ userId, idioma = "PT", variant = "desktop" }: any) {
  const [aulaAtiva, setAulaAtiva] = useState(false);
  const [linkMeet, setLinkMeet] = useState<string | null>(null);

  const t = {
    PT: { entrar: "Entrar na Aula", aguardando: "Aguardando Aula" },
    ES: { entrar: "Entrar a la Clase", aguardando: "Esperando Clase" },
    EN: { entrar: "Enter Class", aguardando: "Waiting for Class" },
  }[idioma as "PT"|"ES"|"EN"] || { entrar: "Entrar na Aula", aguardando: "Aguardando Aula" };

  useEffect(() => {
    const verificar = async () => {
      console.log(`[BotaoAula - ${variant}] Teste do fetch disparado para userId:`, userId);
      const res = await buscarAulaAoVivoCentral(userId);
      console.log(`[BotaoAula - ${variant}] Retorno da central:`, res);
      setAulaAtiva(res.notificationSent);
      setLinkMeet(res.meetingLink);
    };

    verificar();
    const timer = setInterval(verificar, 3000);
    return () => clearInterval(timer);
  }, [userId, variant]);

  const handleClick = () => {
    if (aulaAtiva && linkMeet) window.open(linkMeet, "_blank", "noopener,noreferrer");
  };

  if (variant === "mobile") {
    return (
      <button
        onClick={handleClick}
        disabled={!aulaAtiva}
        className={`w-full py-3 rounded-xl font-mono font-black text-[clamp(13px,3.8vw,18px)] md:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
          aulaAtiva
            ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-black border border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.8)] animate-pulse cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            : "bg-gradient-to-r from-orange-600/10 via-amber-600/5 to-transparent border border-orange-500/20 text-gray-500 cursor-not-allowed opacity-50"
        }`}
      >
        <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 shrink-0 ${aulaAtiva ? "fill-black" : "fill-gray-500"}`}><path d="M8 5v14l11-7z"/></svg>
        {aulaAtiva ? t.entrar : t.aguardando}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!aulaAtiva}
      className={`w-full py-3 font-mono font-black text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 ${
        aulaAtiva
          ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-black border border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.8)] animate-pulse cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          : "bg-transparent border border-gray-700/50 text-gray-500 cursor-not-allowed opacity-50"
      }`}
    >
      <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 shrink-0 ${aulaAtiva ? "fill-black" : "fill-gray-500"}`}><path d="M8 5v14l11-7z"/></svg>
      {aulaAtiva ? t.entrar : t.aguardando}
    </button>
  );
}
