/* =========================================================================
  COMPONENTE SUPREMO: FINALIZAÇÃO DE NÍVEL (LEVEL COMPLETION SCREEN)
  HAAS ACADEMY - FOCO EM FORMATURA, CERTIFICAÇÃO E AVALIAÇÃO HUMANA
  =========================================================================
*/

'use client';

import React from 'react';
import { GraduationCap, FileText, Calendar, ArrowRight, Sparkles, Award, ShieldCheck } from 'lucide-react';

interface LevelCompletionScreenProps {
  mostrar: boolean;
  nivelNome: string;
  onLiberarExames: () => void;
}

export function LevelCompletionScreen({ mostrar, nivelNome, onLiberarExames }: LevelCompletionScreenProps) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-[#03070d]/98 backdrop-blur-lg z-[999999] flex flex-col items-center justify-center p-4 select-none animate-fadeIn">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes crownGlow {
          0% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.2); }
          50% { box-shadow: 0 0 50px rgba(0, 229, 255, 0.5); }
          100% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.2); }
        }
        .animate-crown-glow { animation: crownGlow 3s infinite ease-in-out; }
        
        @keyframes scaleUpGamer {
          0% { opacity: 0; transform: scale(0.9) translateY(40px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-up-gamer { animation: scaleUpGamer 0.5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}} />

      {/* CARD SUPREMO DE FORMATURA DO NÍVEL */}
      <div className="w-full max-w-xl bg-gradient-to-b from-[#0a1524] to-[#050b11] border-2 border-cyan-500/30 rounded-[40px] p-10 text-center flex flex-col items-center gap-8 shadow-[0_40px_90px_rgba(0,0,0,0.98)] animate-scale-up-gamer animate-crown-glow">
        
        {/* Emblema Supremo de Formatura */}
        <div className="p-5 rounded-full bg-cyan-500/10 border-2 border-cyan-500/40 text-[#00E5FF] relative">
          <GraduationCap size={56} strokeWidth={1.5} className="animate-pulse" />
          <div className="absolute -top-1 -right-1 text-yellow-400 animate-pulse"><Sparkles size={18} /></div>
          <div className="absolute -bottom-1 -right-1 bg-[#00FF66] text-black rounded-full p-1 border-2 border-[#0a1524]">
            <ShieldCheck size={14} strokeWidth={3} />
          </div>
        </div>

        {/* Textos Principais */}
        <div className="space-y-3">
          <span className="text-[11px] font-mono font-black text-cyan-400 uppercase tracking-[0.3em] block">CONGRESSO DE PROFICIÊNCIA CONCLUÍDO</span>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Nível {nivelNome} Completo!</h1>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto leading-relaxed">
            Seu passaporte de competências linguísticas atingiu a pontuação máxima exigida pela diretriz internacional CEFR.
          </p>
        </div>

        {/* Status da Auditoria */}
        <div className="w-full bg-[#04090f] border border-slate-800/80 rounded-2xl p-4 text-left flex flex-col gap-2.5 shadow-inner">
          <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block">STATUS DA AUDITORIA ACADÊMICA:</span>
          <div className="flex flex-col gap-2 text-xs font-bold text-slate-300">
            <div className="flex justify-between items-center bg-[#09131f] px-3 py-2 rounded-lg border border-slate-900">
              <span className="text-slate-400">Frentes Teóricas & Quiz</span>
              <span className="text-[#00FF66] font-black">100% VALIDADO</span>
            </div>
            <div className="flex justify-between items-center bg-[#09131f] px-3 py-2 rounded-lg border border-slate-900">
              <span className="text-slate-400">Loot de Requisitos Mínimos</span>
              <span className="text-[#00FF66] font-black">CONCLUÍDO</span>
            </div>
          </div>
        </div>

        {/* Alerta de Destravamento de Provas */}
        <p className="text-[11px] font-semibold text-amber-400/90 leading-relaxed max-w-md bg-amber-950/10 border border-amber-500/20 p-4 rounded-xl shadow-inner">
          ⚠️ <span className="text-white font-bold">PORTÃO DE EXAMES DESTRAVADO:</span> Você já está apto a realizar a sua prova escrita assistida por IA e agendar a sua banca oral humana.
        </p>

        {/* Botão de Direcionamento */}
        <button 
          onClick={onLiberarExames}
          className="w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 bg-gradient-to-b from-cyan-500 to-cyan-600 text-black shadow-[0_6px_25px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer scale-[1.01]"
        >
          LIBERAR PORTÃO DE PROVAS <ArrowRight size={14} strokeWidth={3} />
        </button>

      </div>
    </div>
  );
}