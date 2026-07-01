'use client';

import React, { useState, useEffect } from 'react';

interface MissionLiveProps {
  lessonTime: string; // Formato ISO (ex: "2026-05-30T15:00:00Z")
  meetLink: string;
}

export default function MissionLive({ lessonTime, meetLink }: MissionLiveProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  useEffect(() => {
    const targetTime = new Date(lessonTime).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;
      
      // 15 minutos em milissegundos (15 * 60 * 1000 = 900.000ms)
      const fifteenMinutes = 15 * 60 * 1000;

      // O link fica disponível se faltarem 15 minutos ou menos para a aula, 
      // e continua disponível até o término estimado (ex: 1 hora de aula)
      if (difference <= fifteenMinutes && difference > -(60 * 60 * 1000)) {
        setIsAvailable(true);
        setTimeLeft(0);
      } else {
        setIsAvailable(false);
        setTimeLeft(difference);
      }
    };

    // Executa imediatamente no mount e define o intervalo de 1 segundo
    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [lessonTime]);

  // Função para formatar o cronômetro regressivo de forma amigável
  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div className="bg-[#121214] text-white p-6 rounded-xl border border-zinc-800 shadow-2xl max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <h3 className="text-lg font-bold text-zinc-100">Próxima Missão</h3>
        </div>
        <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md font-mono">
          {new Date(lessonTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {!isAvailable ? (
        <div>
          <p className="text-sm text-zinc-400 mb-4">
            O link de acesso premium do Google Meet será liberado automaticamente **15 minutos antes** do início.
          </p>
          <div className="bg-[#1a1a1e] p-4 rounded-lg border border-zinc-800 text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Liberação em</p>
            {/* Subtrai os 15 minutos do tempo restante para o cronômetro indicar o momento exato da liberação */}
            <p className="text-2xl font-mono font-bold text-amber-400 mt-1">
              {formatCountdown(timeLeft - (15 * 60 * 1000))}
            </p>
          </div>
          <button 
            disabled 
            className="w-full mt-4 py-3 bg-zinc-800 text-zinc-500 rounded-lg font-semibold cursor-not-allowed border border-zinc-700/50 transition-all"
          >
            Bloqueado (Aguarde o Timer)
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-emerald-400/90 mb-4 font-medium">
            Sua missão está ao vivo! O ecossistema preparou sua sala com foco em pontualidade.
          </p>
          <a 
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all border border-emerald-500/20 animate-pulse"
          >
            Acessar Missão Live (Google Meet)
          </a>
        </div>
      )}
    </div>
  );
}