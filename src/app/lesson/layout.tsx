'use client';

import React from 'react';
import DashboardLearnPage from '../portal-aluno/page';

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0D1A24]">
      {/* 🖼️ CAMADA 1: O seu novo Dashboard Real com o Robô rodando nativamente no fundo */}
      <div className="absolute inset-0 z-0 blur-[3px] brightness-[0.35] pointer-events-none select-none">
        <DashboardLearnPage />
      </div>
      
      {/* 🕹️ CAMADA 2: O seu Jogo Original operando por cima */}
      <div className="relative z-10 w-full h-full bg-transparent pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
