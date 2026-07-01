/* =========================================================================
  MÓDULO DE LEITURA COMPLEXA / INTERPRETAÇÃO AVANÇADA - HAAS EDUCACIONAL
  SISTEMA GAMIFICADO EXPANDIDO - SPLIT-SCREEN LAYOUT
  
  ⚠️ PROTEÇÃO DE ROTAS:
  ESTE ARQUIVO GERENCIA EXCLUSIVAMENTE A INTERFACE DE LEITURA LONGA B2.
  COMPLETAMENTE ISOLADO DO COCKPIT PADRÃO PARA EVITAR CONFLITOS DE LAYOUT.
  =========================================================================
*/

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Cpu, PartyPopper, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../globals.css';

const QUESTÃO_LEITURA = {
  id: 2,
  nome: 'READING COMPREHENSION: ADVANCED TOPICS',
  // Texto com coerência pedagógica B2 reajustada
  pergunta_base: 'The technological acceleration of the 21st century has drastically transformed inter-institutional relations. Recent corporate research suggests that the management _______ about advanced frameworks to minimize operational friction and restructure long-term engagement metrics.',
  // Segmento com o encaixe gramatical exato destacado no box holográfico
  pergunta_highlighted: (
    <>
      The technological acceleration of the 21st century has drastically transformed inter-institutional relations. Recent corporate research suggests that the management{' '}
      <span className="inline-block border-2 border-cyan-500 bg-cyan-950/40 rounded px-1.5 py-0.5 shadow-[0_0_15px_rgba(0,229,255,0.25)] font-black text-[#00E5FF]">
        is talking
      </span>{' '}
      about advanced frameworks to minimize operational friction and restructure long-term engagement metrics.
    </>
  ),
  opcoes: [
    { id: 'A', texto: 'TALKS' },
    { id: 'B', texto: 'IS TALKING' },
    { id: 'C', texto: 'HAS TALKED' },
    { id: 'D', texto: 'TALKING' },
  ],
  respostaCorreta: 'B'
};

export default function LessonReadingPage() {
  const router = useRouter();
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | null>(null);
  const [statusResposta, setStatusStatus] = useState<'idle' | 'correto' | 'errado'>('idle');

  const handleSelecionar = (id: string) => {
    if (statusResposta !== 'idle') {
      handleAvançar();
      return;
    }

    setRespostaSelecionada(id);
    if (id === QUESTÃO_LEITURA.respostaCorreta) {
      setStatusStatus('correto');
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00FF66', '#FFD700', '#FFFFFF']
      });
    } else {
      setStatusStatus('errado');
    }
  };

  const handleAvançar = () => {
    router.push('/lesson'); 
  };

  const jaRespondeu = statusResposta !== 'idle';

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#050b11] text-[#E8EDF2] flex items-center justify-center p-6 font-sans antialiased overflow-hidden z-[9999]">
      
      <div className="absolute inset-0 bg-[radial-gradient(#101f30_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none z-0" />

      {/* RECIPIENTE PRINCIPAL DO SPLIT-SCREEN */}
      <div className="w-full max-w-6xl bg-[#09131f] border-2 border-slate-800 rounded-[36px] p-8 flex justify-between gap-6 shadow-[0_40px_100px_rgba(0,0,0,0.95)] h-[76vh] relative z-10">
        
        {/* COLUNA ESQUERDA (TEXTO REAJUSTADO + DIÁLOGO EXPLICATIVO) */}
        <div className="w-[52%] flex flex-col gap-5 justify-between h-full border-r border-slate-800/40 pr-6">
          <div className="w-full bg-[#04090f] border-2 border-cyan-500/20 rounded-[24px] p-6 shadow-2xl h-[64%] overflow-y-auto pr-3 border-l-4 border-l-[#00E5FF] relative shadow-[inset_0_0_25px_rgba(0,229,255,0.04)] scrollbar-thin">
            <div className="absolute top-2 right-4 text-[8px] font-mono text-cyan-400/40 tracking-[0.3em] uppercase select-none">HAAS MATRIX SCANNER</div>
            <div className="text-[15.5px] font-[800] text-slate-100 leading-[1.65] text-justify tracking-wide font-sans">
              {statusResposta === 'idle' ? QUESTÃO_LEITURA.pergunta_base : QUESTÃO_LEITURA.pergunta_highlighted}
            </div>
          </div>

          {/* CAIXA PEDAGÓGICA DO COELHO */}
          <div className="w-full flex items-center gap-4 bg-[#04090f] border border-slate-800/80 p-3.5 rounded-2xl h-[30%] shadow-lg">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-b from-[#16293f] to-[#0b1420] border border-slate-700/40 p-1 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Sparkles size={40} className={`text-[#00E5FF] ${statusResposta === 'idle' ? 'animate-spin-slow' : ''}`} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">► INSTRUÇÃO E REVISÃO ACADÊMICA</span>
              <p className="text-[11px] font-semibold text-slate-300 leading-tight">
                {statusResposta === 'idle' && 'Analise o sujeito "the management" e determine a ação progressiva em andamento.'}
                {statusResposta === 'correto' && 'Perfeito! O aspecto contínuo "is talking" descreve com precisão os debates em andamento sobre a infraestrutura da empresa.'}
                {statusResposta === 'errado' && 'Atenção: A alternativa correta é a B ("is talking"). O Present Continuous é necessário aqui para conectar o sujeito à discussão ativa descrita no relatório.'}
              </p>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (HUD DE ALTERNATIVAS COM CONTRASTE CALIBRADO) */}
        <div className="w-[45%] flex flex-col justify-between h-full py-1 pl-2">
          <div className="flex justify-between items-center w-full bg-[#04090f] border border-slate-800/60 p-3.5 rounded-2xl shadow-md">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-slate-500 opacity-60" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">HUD COMPETÊNCIA</span>
            </div>
            <span className="text-[12px] font-black text-[#00E5FF] uppercase tracking-widest font-sans bg-cyan-950/40 px-3 py-0.5 rounded-md border border-cyan-500/10">B2 LEITURA</span>
          </div>

          <div className="flex flex-col gap-3 w-full my-auto py-2">
            {statusResposta === 'idle' && (
              <p className="text-[13px] font-extrabold text-slate-100 mb-2 leading-tight">
                Choose the best verbal form to complete the matrix segment outlined on the left:
              </p>
            )}

            {QUESTÃO_LEITURA.opcoes.map((op) => {
              const isSelected = respostaSelecionada === op.id;
              const isCorrect = op.id === QUESTÃO_LEITURA.respostaCorreta;
              
              let btnStyle = "bg-[#04090f] text-slate-400 border-slate-800/80 hover:border-slate-600 hover:bg-[#0c1622] transition-all";
              if (statusResposta !== 'idle') {
                if (isCorrect) {
                  btnStyle = "bg-[#00FF66] text-black border-[#5eff99] shadow-[0_0_30px_rgba(0,255,102,0.45)] font-black scale-[1.01]";
                } else if (isSelected) {
                  btnStyle = "bg-[#D85A74] text-white border-[#FF718F] shadow-[0_0_25px_rgba(216,90,116,0.25)] font-bold";
                } else {
                  // Contraste reajustado (slate-500 com opacidade estável) para leitura confortável das desativadas
                  btnStyle = "bg-[#020508]/80 text-slate-500/90 border-transparent pointer-events-none";
                }
              }
              
              return (
                <button 
                  disabled={statusResposta !== 'idle'} 
                  key={op.id} 
                  onClick={() => handleSelecionar(op.id)} 
                  className={`py-2.5 px-4 rounded-xl border-2 text-left text-xs tracking-wide flex items-center gap-4 min-h-[46px] ${btnStyle}`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[10px] shadow-sm transition-colors ${isSelected ? 'bg-white text-black' : 'bg-slate-800 text-slate-500'}`}>
                    {op.id}
                  </div>
                  <span className="font-extrabold uppercase tracking-tight text-[11px]">{op.texto}</span>
                </button>
              );
            })}
          </div>

          <div className="w-full flex items-center gap-3">
            <div className={`w-[35%] bg-[#04090f] border h-12 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 font-mono font-bold text-[9px] ${statusResposta === 'correto' ? 'border-emerald-500/30 text-[#00FF66]' : 'border-slate-800 text-slate-400'}`}>
              {statusResposta === 'correto' ? (
                <>
                  <PartyPopper size={14} className="animate-bounce" />
                  <span>+10p UN</span>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <Settings size={12} className="text-slate-500 animate-spin-slow" />
                  <span>SISTEMA</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleAvançar}
              disabled={!jaRespondeu} 
              className={`py-3.5 rounded-xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 w-full ${
                jaRespondeu 
                  ? 'bg-gradient-to-b from-[#F8891D] to-[#E67212] text-white shadow-[0_6px_25px_rgba(248,137,29,0.5)] scale-[1.01] cursor-pointer hover:brightness-110 active:scale-95 opacity-100' 
                  : 'bg-[#131f2c] text-slate-600 cursor-not-allowed border border-slate-900 opacity-40'
              }`}
            >
              {jaRespondeu ? 'CONTINUAR' : 'LOCKED'} <ArrowRight size={14} strokeWidth={3} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}