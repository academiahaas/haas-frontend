/* =========================================================================
  COMPONENTE MODAL: COCKPIT DE EJERCICIOS PREMIUM (SOBRE CAPA DE FONDO)
  =========================================================================
*/

'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Zap, Target, HelpCircle } from 'lucide-react';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomeAluno: string;
}

export function ExerciseModal({ isOpen, onClose, nomeAluno }: ExerciseModalProps) {
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<'pendente' | 'correto' | 'erro'>('pendente');

  if (!isOpen) return null;

  const handleChecar = () => {
    if (respostaSelecionada === 'had secured') setStatusFeedback('correto');
    else if (respostaSelecionada) setStatusFeedback('erro');
  };

  return (
    // 🎭 FILTRO TRANSLÚCIDO + DESFOQUE CINEMATOGRÁFICO SOBRE EL DASHBOARD REAL
    <div className="fixed inset-0 w-screen h-screen bg-[#060b11]/80 backdrop-blur-[4px] z-[99999] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      
      {/* CARD INTERIOR DEL COCKPIT DEL DESAFÍO */}
      <div className="relative w-full max-w-5xl bg-[#0f1926]/95 border border-slate-800/80 rounded-[28px] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center overflow-hidden">
        
        {/* Efecto de luz decorativa interna */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Botón de Cierre Táctico para regresar al Dashboard */}
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer">
          <X size={16} />
        </button>

        {/* 🐰 COLUNA IZQUIERDA: EL CONEJO EN ACCIÓN */}
        <div className="md:col-span-5 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className={`absolute -inset-2 rounded-full blur-2xl opacity-40 transition-all duration-500 ${statusFeedback === 'correto' ? 'bg-emerald-500 animate-pulse' : statusFeedback === 'erro' ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'}`}></div>
            <div className="relative w-40 h-40 bg-[#132233] border-2 border-cyan-500/40 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-5xl animate-[bounce_3s_infinite]">🐰</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border text-xs font-bold max-w-xs leading-relaxed transition-all shadow-md ${statusFeedback === 'correto' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' : statusFeedback === 'erro' ? 'bg-rose-950/80 border-rose-500/30 text-rose-300' : 'bg-[#121F2E]/90 border-slate-700/60 text-slate-300'}`}>
            {statusFeedback === 'correto' && `¡Excelente, ${nomeAluno}! El Past Perfect mapea el escenario hipotético con precisión.`}
            {statusFeedback === 'erro' && `Atención, ${nomeAluno}. 'have secured' quiebra la correlación del pasado remoto.`}
            {statusFeedback === 'pendente' && `¡Hola, ${nomeAluno}! Vamos a evaluar este caso de negocio juntos. ¿Listo?`}
          </div>
        </div>

        {/* 🎴 COLUNA DERECHA: INTERFAZ DE LA TRIVIA CORPORATIVA */}
        <div className="md:col-span-7 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest bg-purple-950 text-purple-400 px-2.5 py-1 rounded-md border border-purple-900/40">If Clauses (B2)</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">LIÇÃO 3 / 5</span>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Caso de Estudio Legal:</span>
            <p className="text-sm font-semibold text-slate-200 leading-relaxed bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl">
              "If our M&A legal squad <span className="px-2 py-0.5 bg-slate-800 text-cyan-400 border border-slate-700 font-mono rounded text-xs mx-1">_______</span> the regulatory permits on time last quarter, the board <span className="text-purple-400 font-bold underline decoration-wavy">would have reached</span> the expansion goal."
            </p>
          </div>

          <div className="space-y-2">
            {[
              { id: 'secured', label: 'secured (Simple Past)' },
              { id: 'have secured', label: 'have secured (Present Perfect)' },
              { id: 'had secured', label: 'had secured (Past Perfect)' }
            ].map((opcao) => (
              <button
                key={opcao.id}
                disabled={statusFeedback !== 'pendente'}
                onClick={() => setRespostaSelecionada(opcao.id)}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex justify-between items-center ${respostaSelecionada === opcao.id ? 'bg-cyan-950/60 text-cyan-400 border-cyan-500 shadow-md shadow-cyan-950/50' : 'bg-[#152335]/40 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:bg-[#152335]/60'}`}
              >
                <span>{opcao.label}</span>
                {respostaSelecionada === opcao.id && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>}
              </button>
            ))}
          </div>

          <div className="pt-2">
            {statusFeedback === 'pendente' ? (
              <button
                disabled={!respostaSelecionada}
                onClick={handleChecar}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${respostaSelecionada ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                Verificar Respuesta
              </button>
            ) : (
              <button
                onClick={() => { setRespostaSelecionada(null); setStatusFeedback('pendente'); }}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                CONTINUAR <ArrowRight size={14} strokeWidth={3}/>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}