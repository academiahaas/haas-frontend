'use client';

import React, { useState } from 'react';
import { Settings, Flame, Home, MapPin, Gift, BookOpen, Trophy, Shield, Box, Globe, Video, Headset } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function DashboardLearnPage() {
  // Configuração exata dos 10 blocos de XP da Sidebar (8 ativos laranjas, 2 escuros)
  const blocosXP = Array.from({ length: 10 }, (_, i) => i < 8);

  const [dadosRadar] = useState([
    { competenca: 'Fala (Speaking)', nota: 7.5 },
    { competenca: 'Escuta (Listening)', nota: 8.8 },
    { competenca: 'Gramática (Grammar)', nota: 9.0 },
    { competenca: 'Escrita (Writing)', nota: 6.2 },
  ]);

  return (
    // Forçamos um container mestre absoluto que ignora margens e paddings de layouts superiores
    <div className="fixed inset-0 w-screen h-screen bg-[#0D1A24] text-slate-100 flex overflow-hidden font-sans antialiased z-[9999]">
      
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. SIDEBAR ESQUERDA - CONFIGURAÇÃO TÉCNICA SLATE & DEEP BLUE               */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <aside className="w-[20%] bg-[#0C1A24] border-r border-[#152238] p-5 flex flex-col justify-between shrink-0 min-w-[260px] h-full relative select-none overflow-visible">
        
        {/* Bloco Superior: Logo + Card do Aluno */}
        <div className="flex flex-col gap-6">
          
          {/* LOGOTIPO OFICIAL HAAS IDIOMAS */}
          <div className="flex items-center gap-3 px-1 pt-2">
            <div className="h-11 w-11 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
              <span className="text-xl font-black text-[#0C1A24]">🤖</span>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-black text-[#00E5FF] tracking-tight leading-none uppercase">Haas</h1>
              <span className="text-[10px] text-slate-400 font-bold tracking-[0.32em] uppercase mt-1 leading-none">Idiomas</span>
            </div>
          </div>

          {/* CARD DE PERFIL DO ALUNO */}
          <div className="bg-[#152238] border border-slate-800/40 rounded-3xl p-5 relative shadow-inner">
            {/* Ícone de Configurações Absoluto no Canto Superior Direito */}
            <button className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
              <Settings size={14} />
            </button>

            <div className="flex flex-col items-center text-center gap-2">
              {/* Avatar Circular com Nível B2 Sobreposto */}
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-cyan-200 border-2 border-[#0C1A24] flex items-center justify-center overflow-hidden shadow-md">
                  <span className="text-3xl">👦🏽</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#00E5FF] text-[#0C1A24] font-mono text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#152238] shadow-md">
                  B2
                </div>
              </div>

              <div className="flex flex-col mt-1">
                <h2 className="text-sm font-black text-white tracking-wide">Aluno Teste</h2>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">Nível B1 Intermediário</span>
              </div>
            </div>

            {/* BARRA DE PROGRESSO DE XP SEGMENTADA (10 BLOCOS) */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>XP: 2.450 / 3.000</span>
                <span className="text-[#F59E0B]">(81% para B2)</span>
              </div>
              
              {/* 10 divs com larguras idênticas e border-radius sutil */}
              <div className="flex items-center justify-between gap-1 w-full h-2">
                {blocosXP.map((ativo, index) => (
                  <div
                    key={index}
                    className={`h-full flex-1 rounded-sm transition-all duration-300 ${
                      ativo ? 'bg-[#F59E0B] shadow-sm shadow-orange-500/20' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* MASCOTE DA MARCA E PARTÍCULAS DE RETENÇÃO (MÉTODO GEOMÉTRICO HIGH-TECH)    */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="w-full relative flex flex-col items-center justify-end shrink-0 pt-20 pb-4 overflow-visible select-none">
          
          {/* 1. CAMADA INFERIOR (Z-0): FORMA DE FUNDO AMALERADA/LARANJA (#F59E0B) */}
          <div 
            className="absolute -bottom-10 -left-12 h-36 w-36 bg-[#F59E0B]/15 rounded-full blur-2xl z-0 pointer-events-none" 
            style={{ mixBlendMode: 'screen' }}
          />

          {/* 2. CAMADA INTERMEDIÁRIA (Z-10): ELEMENTOS FLUTUANTES / PARTÍCULAS */}
          <div className="absolute inset-x-0 -top-6 h-24 pointer-events-none z-10 overflow-visible">
            
            {/* Chama de Fogo Centralizada com animação */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#152238]/90 p-2 rounded-full border border-slate-800 shadow-lg shadow-orange-500/10 animate-bounce" style={{ animationDuration: '3s' }}>
              <Flame size={14} className="text-[#F59E0B]" fill="currentColor" />
            </div>

            {/* Esferas Coloridas com Estrelas internas */}
            <div className="absolute top-8 left-6 h-5 w-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center animate-pulse">
              <span className="text-[7px] text-indigo-300">⭐</span>
            </div>
            <div className="absolute top-0 right-10 h-4 w-4 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <span className="text-[6px] text-orange-300">⭐</span>
            </div>
            <div className="absolute top-10 right-4 h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-pulse" style={{ animationDuration: '2s' }}>
              <span className="text-[7px] text-amber-300">⭐</span>
            </div>
          </div>

          {/* 3. CAMADA SUPERIOR (Z-20): VISOR HOLO-MECH DE IA (ESTILO DARK TECH) */}
          <div className="w-full flex justify-end relative z-20 overflow-visible translate-x-2 pr-2">
            <div className="relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
              
              {/* CORPO DO CAPACETE CYBORG / DRONE DIGITAL */}
              <div className="h-28 w-28 bg-[#112240]/90 border-2 border-[#1e293b] rounded-2xl flex flex-col items-center justify-center relative p-3 shadow-2xl backdrop-blur-md group-hover:border-[#00E5FF]/40 transition-colors">
                
                {/* Antenas Superiores Geométricas (Efeito Orelhas Mech) */}
                <div className="absolute -top-3 left-4 h-4 w-1.5 bg-[#1e293b] rounded-t-sm group-hover:bg-[#00E5FF]/60 transition-colors" />
                <div className="absolute -top-3 right-4 h-4 w-1.5 bg-[#1e293b] rounded-t-sm group-hover:bg-[#00E5FF]/60 transition-colors" />

                {/* VISOR DIGITAL CIAN (HUD) */}
                <div className="w-full h-11 bg-[#07111e] border border-[#1b2b4a] rounded-xl flex items-center justify-between px-3 relative overflow-hidden shadow-inner">
                  {/* Linha de Scan Laser Flutuante */}
                  <div className="absolute inset-x-0 h-[1px] bg-[#00E5FF]/30 top-1/2 animate-pulse" />
                  
                  {/* Olhos Digitais de Led Matriz */}
                  <div className="h-2 w-4 bg-[#00E5FF] rounded-sm shadow-[0_0_8px_#00E5FF] animate-pulse" />
                  <div className="h-2 w-4 bg-[#00E5FF] rounded-sm shadow-[0_0_8px_#00E5FF] animate-pulse" />
                </div>

                {/* Grelha de Ventilação / Áudio Inferior */}
                <div className="flex gap-1 mt-3 justify-center w-full">
                  <div className="h-1.5 w-1 bg-slate-700 rounded-full" />
                  <div className="h-2 w-1 bg-[#00E5FF]/60 rounded-full animate-bounce" style={{ animationDuration: '1s' }} />
                  <div className="h-3 w-1 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDuration: '0.8s' }} />
                  <div className="h-2 w-1 bg-[#00E5FF]/60 rounded-full animate-bounce" style={{ animationDuration: '1.2s' }} />
                  <div className="h-1.5 w-1 bg-slate-700 rounded-full" />
                </div>

              </div>

              {/* Aura Glow Neon Cian Traseira */}
              <div className="absolute inset-0 bg-[#00E5FF]/5 rounded-2xl blur-xl pointer-events-none group-hover:bg-[#00E5FF]/10 transition-colors" />
            </div>
          </div>

          {/* Nome Identificador da Base */}
          <div className="w-full text-center mt-3 relative z-30 shrink-0">
            <span className="text-[10px] font-black text-[#00E5FF] tracking-[0.2em] uppercase bg-[#152238]/80 px-4 py-1.5 rounded-full border border-slate-800/80 shadow-md">
              HAAS BOT
            </span>
          </div>

        </div>

      </aside>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* ÁREA RESTANTE: HEADER SUPERIOR + CONTEÚDO CENTRAL                         */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        
        {/* HEADER SUPERIOR */}
        <header className="h-16 bg-[#0C1A24] border-b border-[#152238] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:text-white"><Home size={16} /></button>
            <button className="p-2 text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-400"><MapPin size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-white"><Gift size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-white"><BookOpen size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-white"><Trophy size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-white"><Shield size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-white"><Box size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-white"><Globe size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-white"><Video size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-white"><Headset size={16} /></button>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO (COLUNA 2 E COLUNA 3) */}
        <div className="flex flex-1 overflow-hidden h-full">
          
          {/* COLUNA 2: TRILHA CENTRAL (48%) */}
          <main className="w-[48%] h-full overflow-y-auto px-8 py-6 flex flex-col gap-6 border-r border-[#152238]">
            <h2 className="text-xl font-black text-white tracking-tight">Trilha de Competências</h2>
            <div className="p-6 bg-[#152238]/40 border border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">A renderizar as unidades de estudo...</p>
            </div>
          </main>

          {/* COLUNA 3: COCKPIT DIREITO (32%) */}
          <aside className="w-[32%] h-full overflow-y-auto px-6 py-6 flex flex-col gap-6 bg-[#0C1A24]">
            <h2 className="text-sm font-black text-slate-400 tracking-wider uppercase">Radar Proficiência Chart</h2>
            <div className="bg-[#152238] border border-slate-800/60 rounded-3xl p-4 h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dadosRadar}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="competenca" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis tick={false} domain={[0, 10]} />
                  <Radar name="Proficiência" dataKey="nota" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </aside>

        </div>

      </div>

    </div>
  );
}