'use client';
import React, { useState, useEffect } from 'react';

interface PieceItem {
  id: number;
  text: string;
}

interface MioloProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
}

export default function MioloTraducaoInversaMobile({
  onSelectionChange,
  onValidateResult,
  status = 'IDLE'
}: MioloProps) {
  const fraseMatrizPT = "Eu preciso verificar os dados antes de enviar para a produção.";
  const stringAlvoCorreta = "I need to check the data before pushing to production.";
  
  const initialPieces = [
    "I need to", "check", "the data", "before pushing", "to production.",
    "I must", "verify", "the reports"
  ];

  const totalPecasNecessarias = 5; 

  const [bankPieces, setBankPieces] = useState<PieceItem[]>([]);
  const [depositPieces, setDepositPieces] = useState<PieceItem[]>([]);

  useEffect(() => { resetarJogo(); }, []);
  
  useEffect(() => { 
    if (status === 'IDLE') resetarJogo();
  }, [status]);

  useEffect(() => {
    if (depositPieces.length === totalPecasNecessarias && status === 'IDLE') {
      const fraseMontada = depositPieces.map(p => p.text).join(' ');
      if (onValidateResult) {
        onValidateResult(fraseMontada === stringAlvoCorreta);
      }
    }
  }, [depositPieces, status]);

  const resetarJogo = () => {
    setBankPieces(initialPieces.map((text, idx) => ({ id: idx, text })).sort(() => Math.random() - 0.5));
    setDepositPieces([]);
  };

  const handlePushToDeposit = (piece: PieceItem) => {
    if (status === 'CORRECT') return;
    const novosDepositos = [...depositPieces, piece];
    setBankPieces(prev => prev.filter(p => p.id !== piece.id));
    setDepositPieces(novosDepositos);
    if (onSelectionChange) onSelectionChange(novosDepositos.length > 0);
  };

  const handlePullToBank = (piece: PieceItem) => {
    if (status === 'CORRECT') return;
    const novosDepositos = depositPieces.filter(p => p.id !== piece.id);
    setDepositPieces(novosDepositos);
    setBankPieces(prev => [...prev, piece]);
    if (onSelectionChange) onSelectionChange(novosDepositos.length > 0);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-4 font-mono select-none items-stretch flex-1 min-h-0 mb-0 pb-0">
      
      {/* 1) ENUNCIADO MATRIZ (TOPO) */}
      <div className="text-left bg-[#020B12] border border-slate-800 rounded-xl p-4 shadow-sm w-full shrink-0">
        <span className="text-[clamp(11px,3vw,13px)] font-black text-cyan-400 block mb-1.5 uppercase tracking-wider">
          Traduza o requisito corporativo nativo:
        </span>
        <p className="text-[clamp(13px,3.8vw,15px)] font-bold text-slate-200 leading-relaxed font-sans break-words">
          "{fraseMatrizPT}"
        </p>
      </div>

      {/* 2) ZONA DE DEPÓSITO AMPLIADA (MEIO) */}
      <div className={`w-full rounded-xl p-4 min-h-[100px] flex-1 flex flex-wrap content-center justify-center gap-2.5 items-center transition-all duration-200 shadow-inner ${
        status === 'CORRECT' ? 'border-2 border-[#22C55E]/30 bg-[#042414]/20' :
        status === 'WRONG' ? 'border-2 border-red-500/30 bg-[#2E0B0E]/20 animate-shake' :
        'bg-[#020B12]/80 border-2 border-dashed border-slate-800/60 shadow-2xl'
      }`}>
        {depositPieces.length === 0 ? (
          <span className="text-[clamp(11px,3.2vw,13px)] font-black text-slate-500 uppercase tracking-widest select-none font-sans text-center">
            Toque nos blocos abaixo para traduzir
          </span>
        ) : (
          depositPieces.map((piece) => (
            <button 
              key={piece.id} 
              disabled={status === 'CORRECT'} 
              onClick={() => handlePullToBank(piece)} 
              className="px-3 py-2.5 bg-cyan-400 text-slate-950 font-black rounded-xl text-[clamp(13px,3.6vw,15px)] border-none shadow-md cursor-pointer active:scale-95 transition-all whitespace-nowrap"
            >
              {piece.text}
            </button>
          ))
        )}
      </div>

      {/* 3) BANCO DE PALAVRAS DISPONÍVEIS (BASE ABSOLUTA - MARGENS E PADDINGS INFERIORES ZERADOS) */}
      <div className="w-full flex flex-wrap gap-2.5 p-3 bg-[#070d19]/40 border border-white/[0.02] rounded-xl justify-center items-center shrink-0 min-h-[90px] mb-0 pb-3">
        {bankPieces.map((piece) => (
          <button 
            key={piece.id} 
            disabled={status === 'CORRECT'} 
            onClick={() => handlePushToDeposit(piece)} 
            className="px-3 py-2.5 bg-[#1C3B50]/80 active:bg-[#1C3B50] text-slate-200 font-black border border-slate-700/60 rounded-xl text-[clamp(13px,3.6vw,15px)] shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap"
          >
            {piece.text}
          </button>
        ))}
      </div>
    </div>
  );
}
