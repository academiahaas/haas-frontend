/* =========================================================================
  PÁGINA DE CERTIFICAÇÃO E AUDITORIA - HAAS ACADEMY
  MECÂNICA: DETECÇÃO DINÂMICA DE GÊNERO (APTO / APTA) & LAYOUT COMPACTO
  =========================================================================
*/

'use client';

import React, { useState } from 'react';
import { GraduationCap, FileText, Calendar, ArrowLeft, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import '../globals.css';

export default function LessonCertifyPage() {
  const router = useRouter();

  // 👤 CONTROLE DE GÊNERO: Em produção, isto virá do seu Contexto de Autenticação (ex: user.gender)
  // Valores possíveis: 'feminino' ou 'masculino'
  const [usuarioGenero] = useState<'feminino' | 'masculino'>('feminino');
  const [usuarioNome] = useState<string>('Bruna');

  // Helper simples para resolver as flexões gramaticais na tela
  const resolverArtigo = usuarioGenero === 'feminino' ? 'A' : 'O';
  const resolverFlexao = usuarioGenero === 'feminino' ? 'APTA' : 'APTO';
  const resolverAvaliadorHumano = usuarioGenero === 'feminino' ? 'AVALIADORA HUMANA' : 'AVALIADOR HUMANO';

  const handleIrParaProvaEscrita = () => {
    alert('Iniciando ambiente seguro da Prova Escrita B2...');
  };

  const handleAgendarProvaOral = () => {
    alert('Redirecionando para o calendário de avaliadores humanos...');
  };

  return (
    <div className="min-h-screen w-full bg-[#050b11] text-[#E8EDF2] flex items-center justify-center py-6 px-4 font-sans antialiased relative">
      
      {/* Grid de fundo tático sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(#101f30_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none z-0" />

      {/* CONTAINER CENTRAL CARD - COMPACTO E FLUIDO */}
      <div className="w-full max-w-[920px] bg-[#09131f] border-2 border-slate-800/60 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-6 md:p-8 flex flex-col justify-between gap-6 z-10 relative">
        
        {/* HEADER: NAVEGAÇÃO E STATUS */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3">
          <button 
            onClick={() => router.push('/lesson')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800 text-[10px] font-black text-slate-300 hover:text-white hover:border-slate-700 transition-all uppercase tracking-widest"
          >
            <ArrowLeft size={12} strokeWidth={3} /> RETORNAR AO COCKPIT
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.05)]">
            <span className="text-[9px] font-black text-[#00E5FF] uppercase tracking-[0.15em]">
              STATUS: {resolverFlexao} PARA CERTIFICAÇÃO
            </span>
          </div>
        </div>

        {/* ÁREA CENTRAL: CELEBRAÇÃO */}
        <div className="flex flex-col items-center text-center gap-4">
          
          {/* Emblema Central Reduzido */}
          <div className="relative">
            <div className="p-4 rounded-full bg-cyan-500/5 border-2 border-cyan-500/20 text-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.1)]">
              <GraduationCap size={44} strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#00FF66] text-black rounded-full p-1 border-2 border-[#09131f] shadow-md">
              <ShieldCheck size={14} strokeWidth={3} />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">
              NÍVEL B2 COMPLETO!
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-[#00FF66] font-mono text-[10px] font-black uppercase tracking-widest mt-1">
              <CheckCircle2 size={12} strokeWidth={3} /> 
              Todos os pré-requisitos de proficiência foram validados.
            </div>
          </div>

          <p className="text-xs md:text-sm font-medium text-slate-400 leading-relaxed max-w-xl">
            Parabéns, {usuarioNome}! As tuas frentes de estudo em gramática, escrita, pronúncia e interações foram consolidadas. Vens oficialmente <span className="text-white font-black underline decoration-cyan-500">{resolverFlexao}</span> a realizar as avaliações finais para a emissão do teu certificado internacional padrão CEFR.
          </p>

          {/* GRID DE PROVAS - CARD REDUZIDO E ALINHADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[800px] mt-2">
            
            {/* CARD AZUL - ESCRITA */}
            <div className="bg-[#050b11] border-2 border-slate-800/80 rounded-[24px] p-5 md:p-6 flex flex-col items-center justify-between gap-4 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_15px_30px_rgba(0,229,255,0.03)] group">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-[#00E5FF] group-hover:scale-105 transition-transform">
                  <FileText size={24} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">AVALIADOR ESCRITO</h3>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">TEMPO: 45 MIN | IA CONTROL</p>
                </div>
                <p className="text-[11px] font-bold text-slate-500 leading-snug max-w-[280px]">
                  Exame tático de múltipla escolha e redação corporativa com correção instantânea.
                </p>
              </div>
              <button 
                onClick={handleIrParaProvaEscrita}
                className="w-full py-3 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase bg-cyan-500 text-black shadow-[0_8px_20px_rgba(0,229,255,0.2)] hover:bg-[#00E5FF] transition-all active:scale-95 mt-2"
              >
                INICIAR EXAME AGORA
              </button>
            </div>

            {/* CARD LARANJA - ORAL */}
            <div className="bg-[#050b11] border-2 border-slate-800/80 rounded-[24px] p-5 md:p-6 flex flex-col items-center justify-between gap-4 transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_15px_30px_rgba(248,137,29,0.03)] group">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-500/10 text-[#F8891D] group-hover:scale-105 transition-transform">
                  <Calendar size={24} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{resolverAvaliadorHumano}</h3>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">TEMPO: 15 MIN | LIVE NATIVE</p>
                </div>
                <p className="text-[11px] font-bold text-slate-500 leading-snug max-w-[280px]">
                  Sabatina oral ao vivo com professor nativo focado em tomada de decisão.
                </p>
              </div>
              <button 
                onClick={handleAgendarProvaOral}
                className="w-full py-3 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase bg-gradient-to-b from-[#F8891D] to-[#E67212] text-white shadow-[0_8px_20px_rgba(248,137,29,0.2)] hover:brightness-110 transition-all active:scale-95 mt-2"
              >
                AGENDAR BANCA ORAL
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER AUDITORIA ANCORADO */}
        <div className="w-full flex items-center justify-center gap-2 border-t border-slate-800/40 pt-4 text-[8px] font-mono font-bold text-slate-600 tracking-[0.15em] uppercase text-center">
          <Award size={12} className="text-cyan-600 shrink-0" />
          <span>HAAS SECURITY SYSTEM v2.4 — CERTIFICADOS REGISTRADOS EM BLOCKCHAIN</span>
        </div>

      </div>
    </div>
  );
}