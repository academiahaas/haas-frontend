'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Settings, Home, MapPin, Gift, BookOpen, Trophy, Shield, Box, Globe, GraduationCap, Headset, Flame, Zap, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function PortalAluno() {
  const blocosXP = Array.from({ length: 10 }, (_, i) => i < 8);
  const [dadosRadar] = useState([
    { competenca: 'Fala (Speaking)', nota: 95 },
    { competenca: 'Escuta (Listening)', nota: 88 },
    { competenca: 'Gramática (Grammar)', nota: 90 },
    { competenca: 'Escrita (Writing)', nota: 62 },
    { competenca: 'Leitura (Reading)', nota: 78 },
  ]);

  return (
    /* I.1 CAMADA BASE: Azul-petróleo escuro universal (100vw x 100vh) com gaps calibrados */
    <div className="fixed inset-0 w-screen h-screen bg-[#0D1921] text-slate-100 flex flex-col overflow-hidden font-sans antialiased p-[1.5%] gap-[1.6vh] z-[9999]">
      
      {/* HEADER SUPERIOR UNIFICADO - 8% Height */}
      <header className="w-full bg-[#162630] border border-[#233744] h-[8vh] rounded-2xl px-6 flex items-center justify-between shrink-0 shadow-md select-none">
        <nav className="flex items-center gap-1.5">
          <button className="flex flex-col items-center justify-center w-[72px] h-[60px] rounded-xl text-slate-400 gap-0.5"><Home size={20} className="text-orange-400" /><span className="text-[10px] font-bold">Início</span></button>
          <button className="flex flex-col items-center justify-center w-[72px] h-[60px] rounded-xl text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 gap-0.5"><MapPin size={20} className="text-emerald-400" /><span className="text-[10px] font-black">Trilha</span></button>
          <button className="flex flex-col items-center justify-center w-[80px] h-[60px] rounded-xl text-slate-400 gap-0.5"><Gift size={20} className="text-rose-400" /><span className="text-[10px] font-bold">Recompensas</span></button>
          <button className="flex flex-col items-center justify-center w-[72px] h-[60px] rounded-xl text-slate-400 gap-0.5"><BookOpen size={20} className="text-purple-400" /><span className="text-[10px] font-bold">Recursos</span></button>
          <button className="flex flex-col items-center justify-center w-[72px] h-[60px] rounded-xl text-slate-400 gap-0.5"><Trophy size={20} className="text-amber-400" /><span className="text-[10px] font-bold">Desafios</span></button>
          <button className="flex flex-col items-center justify-center w-[72px] h-[60px] rounded-xl text-slate-400 gap-0.5"><Shield size={20} className="text-blue-400" /><span className="text-[10px] font-bold">Ligas</span></button>
          <button className="flex flex-col items-center justify-center w-[72px] h-[60px] rounded-xl text-slate-400 gap-0.5"><Box size={20} className="text-amber-600" /><span className="text-[10px] font-bold">Baú</span></button>
          <button className="flex flex-col items-center justify-center w-[72px] h-[60px] rounded-xl text-slate-400 gap-0.5"><Globe size={20} className="text-cyan-400" /><span className="text-[10px] font-bold">Online</span></button>
          <button className="flex flex-col items-center justify-center w-[72px] h-[60px] rounded-xl text-slate-400 gap-0.5"><GraduationCap size={20} className="text-indigo-400" /><span className="text-[10px] font-bold">Classroom</span></button>
          <button className="flex flex-col items-center justify-center w-[72px] h-[60px] rounded-xl text-slate-400 gap-0.5"><Headset size={20} className="text-fuchsia-400" /><span className="text-[10px] font-bold">Praticar</span></button>
        </nav>
        <div className="flex items-center gap-3 bg-[#112240]/40 border border-[#233744]/60 rounded-xl px-4 py-1.5 shadow-inner">
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Sequência Atual</span>
            <span className="text-base font-black text-amber-500 font-mono mt-0.5">12 dias</span>
          </div>
          <Flame size={24} className="text-orange-500 fill-orange-500 animate-pulse" />
        </div>
      </header>

      {/* PAINEL GRID MATEMÁTICO BASEADO NA SUA EQUAÇÃO DE FECHAMENTO (99.8% do Eixo X) */}
      <div className="flex-1 grid grid-cols-12 gap-[1.6%] overflow-hidden w-full h-full pb-2">
        
        {/* ========================================================================= */}
        {/* II.1 COLUNA 1 + 2 UNIFICADAS VERTICALMENTE (70% DA TELA ALVO)               */}
        {/* Permite o encaixe nativo da Trilha (55%) e do Módulo Financial (70%) na base */}
        {/* ========================================================================= */}
        <div className="col-span-9 flex flex-col justify-between h-full gap-[1.6vh] overflow-visible">
          
          {/* Sub-grid superior pareando Coluna 1 (Perfil) e Coluna 2 (Trilha) */}
          <div className="flex-1 flex gap-[2.2%] w-full h-[65vh] overflow-hidden">
            
            {/* COLUNA 1 (15% Reais do Layout): Perfil e Mascote */}
            <div className="w-[21.5%] flex flex-col justify-between h-full shrink-0 overflow-visible">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 px-1 select-none">
                  <div className="h-9 w-9 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-base font-black text-[#00E5FF] tracking-tight leading-none uppercase">Haas</h1>
                    <span className="text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-0.5 leading-none">Idiomas</span>
                  </div>
                </div>

                {/* CARD ALUNO: Ajustado perfeitamente para Altura Alvo de 28% */}
                <div className="bg-[#162630] border border-[#233744] rounded-3xl p-4 flex flex-col items-center relative text-center shadow-md h-[28vh] justify-center">
                  <button className="absolute top-3 right-3 text-slate-500"><Settings size={13} /></button>
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-cyan-200 border-2 border-[#0D1921] flex items-center justify-center overflow-hidden">
                      <span className="text-2xl">👦🏽</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[#00E5FF] text-[#0C1A24] font-mono text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-[#162630]">
                      B2
                    </div>
                  </div>
                  <h2 className="text-xs font-black text-white mt-2 tracking-wide">Aluno Teste</h2>
                  <p className="text-[10px] text-slate-400">Nível B1 Intermediário</p>
                  <div className="w-full mt-3 space-y-1">
                    <div className="flex justify-between text-[8px] font-mono text-slate-400 font-bold">
                      <span>XP: 2.450 / 3.000</span>
                      <span className="text-amber-500">81%</span>
                    </div>
                    <div className="flex gap-0.5 h-1.5 w-full">
                      {blocosXP.map((ativo, index) => (
                        <div key={index} className={`h-full flex-1 rounded-sm ${ativo ? 'bg-orange-500' : 'bg-slate-800'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ÁREA DO MASCOTE: Expandida para 52% de altura livre sobre a Camada Base */}
              <div className="w-full h-[52vh] relative flex flex-col items-center justify-end overflow-visible select-none pb-1 mt-auto">
                <div className="flex flex-col items-center gap-1 mb-2 relative z-30 animate-bounce" style={{ animationDuration: '4s' }}>
                  <Flame size={18} className="text-orange-500 fill-orange-500" />
                  <div className="flex gap-1.5 justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#eab308]" />
                  </div>
                </div>
                <div className="w-full flex justify-center relative z-20 overflow-visible translate-y-1">
                  <Image 
                    src="https://qeiinzggtrzckvcqpygs.supabase.co/storage/v1/object/public/assets/pastas/mascotes/60769c45-0c32-4d3a-9494-929e904f8da9-removebg-preview.png"
                    alt="Mascote Haas Oficial"
                    width={195} 
                    height={195}
                    className="object-contain block"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* COLUNA 2: Trilha de Competências Expandida (55% de largura e 65% de altura útil) */}
            <main className="flex-1 h-full bg-[#162630] border border-[#233744] rounded-3xl p-5 overflow-y-hidden flex flex-col shadow-md">
              <h2 className="text-base font-black text-white tracking-tight mb-4">Trilha de Competências</h2>
              <div className="space-y-4 relative border-l-2 border-slate-700/30 ml-4 pl-6 text-xs flex-1">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 bg-amber-500 border border-amber-600 p-0.5 rounded-full flex items-center justify-center h-4 w-4 text-[9px] font-black text-[#162630]">1</span>
                  <div className="border border-[#233744]/60 rounded-xl p-3 bg-[#0D1921]/30 opacity-75">
                    <span className="font-bold text-slate-300 block">Módulo 1: Estruturação Básica</span>
                    <span className="text-[10px] text-amber-500 mt-0.5 block font-bold">✓ Concluído</span>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 bg-amber-500 border border-amber-600 p-0.5 rounded-full flex items-center justify-center h-4 w-4 text-[9px] font-black text-[#162630]">2</span>
                  <div className="border border-[#233744]/60 rounded-xl p-3 bg-[#0D1921]/30 opacity-75">
                    <span className="font-bold text-slate-300 block">Módulo 2: Fluência Conectiva</span>
                    <span className="text-[10px] text-amber-500 mt-0.5 block font-bold">✓ Concluído</span>
                  </div>
                </div>
                
                {/* Módulo Ativo Premium com Alto Contraste */}
                <div className="relative">
                  <span className="absolute -left-[32px] top-1 bg-orange-500 p-0.5 rounded-full h-4 w-4 flex items-center justify-center border border-orange-600 text-[9px] font-black text-white">3</span>
                  <div className="bg-gradient-to-br from-[#EAB308] to-[#CA8A04] border border-[#FFE79A]/40 rounded-2xl p-4 shadow-lg text-[#231502]">
                    <span className="font-black block text-sm tracking-wide">Módulo 3: If Clauses (CEFR B2)</span>
                    <p className="text-xs font-bold mt-1 text-[#4A370C]">Módulo ativo da trilha. Domine as regras condicionais avançadas geradas pela IA.</p>
                    <div className="w-full flex justify-center mt-3">
                      <button className="bg-[#231502] text-[#EAB308] font-black text-[10px] px-6 py-2.5 rounded shadow hover:bg-black transition-all uppercase tracking-wider flex items-center gap-1">
                        <Zap size={10} className="fill-current" /> TREINAR / REATIVE AGORA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </main>

          </div>

          {/* MÓDULO FINANCIAL CALIBRADO: Ocupa os 70% de largura horizontal e 15% de altura útil */}
          <section className="w-full h-[15vh] bg-[#162630] border border-[#233744] rounded-3xl p-4 flex flex-col justify-between shadow-md relative z-40">
            <div className="flex justify-between items-center w-full px-2">
              <div className="flex flex-col">
                <h3 className="text-sm font-black text-slate-300">Módulo Financial Haas</h3>
                <span className="text-[11px] text-slate-500 mt-0.5">Histórico de Faturamento e Mensalidades Center</span>
              </div>
              <div className="flex gap-6 text-[10px] font-mono text-slate-400 font-bold">
                <span>História de Transações</span>
                <span className="text-emerald-400">Ativo</span>
              </div>
            </div>
            <div className="w-full flex justify-center mb-0.5">
              <button className="bg-white text-[#0D1921] font-black text-xs px-12 py-2.5 rounded-full shadow-md hover:bg-slate-100 transition-colors uppercase tracking-wider">
                BAIXAR RECIBOS
              </button>
            </div>
          </section>

        </div>

        {/* ========================================================================= */}
        {/* COLUNA 3 (15%): Gamification & Radar Unificados (Alinhamento de 65% h)     */}
        {/* ========================================================================= */}
        <div className="col-span-2 h-[65vh] bg-[#162630] border border-[#233744] rounded-3xl p-4 flex flex-col justify-between shadow-md shrink-0">
          <div className="space-y-2.5">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">Gamification Center</h2>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-white">
                <span>Próximo nível: B2</span>
                <span className="text-amber-500 font-mono text-[10px]">(550 XP restantes)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '81%' }} />
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 space-y-1 border-b border-[#233744]/40 pb-2">
              <div className="flex justify-between"><span>XP Atual:</span><span className="text-white font-bold">2.450 / 3.000</span></div>
              <div className="flex justify-between"><span>XP Tips:</span><span className="text-white">82</span></div>
            </div>
          </div>

          <div className="flex-1 flex flex-col mt-2 overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Radar de Proficiência</h3>
            <div className="flex-1 bg-[#0D1921]/20 rounded-xl p-1 flex items-center justify-center overflow-visible">
              <ResponsiveContainer width="100%" height="95%">
                <RadarChart cx="50%" cy="50%" outerRadius="38%" data={dadosRadar}>
                  <PolarGrid stroke="#233744" />
                  <PolarAngleAxis dataKey="competenca" tick={{ fill: '#64748b', fontSize: 7, fontWeight: 'bold' }} />
                  <PolarRadiusAxis tick={false} domain={[0, 100]} />
                  <Radar name="Proficiência" dataKey="nota" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUNA 4 (15%): Ligas, Recursos e Baú Extrema Direita (Altura útil de 85%) */}
        {/* ========================================================================= */}
        <aside className="col-span-1 h-full bg-[#162630] border border-[#233744] rounded-3xl p-4 flex flex-col shadow-md shrink-0 justify-between select-none">
          <div className="flex flex-col gap-2 relative">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-[#233744]/50 pb-1.5">Ligas Populares B2C</h2>
            <div className="absolute top-7 left-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[8px] px-2 py-0.5 rounded font-black tracking-wider uppercase animate-pulse z-40">
              Demotion
            </div>
            <div className="space-y-2 text-xs pt-4">
              {[
                { pos: '1', avatar: '👦🏽', nome: 'Aluno Teste', status: 'safe' },
                { pos: '2', avatar: '👩🏼', nome: 'Bruna M.', status: 'safe' },
                { pos: '3', avatar: '👨🏽', nome: 'Lucas H.', status: 'demotion' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-400 text-[11px] w-3">{item.pos}</span>
                    <span className="text-base leading-none">{item.avatar}</span>
                    <span className="font-bold text-slate-300 text-[11px] tracking-wide">{item.nome}</span>
                  </div>
                  {item.status === 'demotion' && (
                    <TrendingDown size={12} className="text-rose-500 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-[#233744]/50 pb-1.5">Recursos</h2>
            <div className="flex flex-col gap-1 text-[11px] text-cyan-400 underline font-medium">
              <a href="#" className="hover:text-cyan-300">Links Google Forms</a>
              <a href="#" className="hover:text-cyan-300">Agenda Oficial</a>
              <a href="#" className="hover:text-cyan-300">Google Sala de Aula</a>
            </div>
          </div>

          <div className="flex flex-col justify-end gap-2.5 pt-2 border-t border-[#233744]/30">
            <div className="flex flex-col gap-1">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">Baú de Erros Recorrentes</h2>
              <div className="text-[10px] font-mono text-slate-400 space-y-1 max-h-[65px] overflow-y-auto mt-1 pr-1">
                <div className="flex justify-between"><span>• Oficina / Office</span><span className="text-rose-400 font-bold">0.8</span></div>
                <div className="flex justify-between"><span>• Actual / Currently</span><span className="text-amber-500 font-bold">0.6</span></div>
                <div className="flex justify-between"><span>• Pretend / Intend</span><span className="text-slate-500 font-bold">0.4</span></div>
              </div>
            </div>
            <button className="w-full bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#162630] font-black text-[10px] py-3 rounded-none transition-colors uppercase tracking-widest border-none">
              LIMPAR BAÚ
            </button>
          </div>
        </aside>

      </div>

    </div>
  );
}