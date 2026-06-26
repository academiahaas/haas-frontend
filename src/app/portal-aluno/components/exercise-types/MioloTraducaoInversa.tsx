'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface PieceItem {
  id: number;
  text: string;
}

interface MioloProps {
  onSelectionChange?: (hasItems: boolean) => void;
  onValidateResult?: (isCorrect: boolean) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
}

export default function MioloTraducaoInversa({
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

  const [bankPieces, setBankPieces] = useState<PieceItem[]>([]);
  const [depositPieces, setDepositPieces] = useState<PieceItem[]>([]);
  const [localStatus, setLocalStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');

  useEffect(() => {
    resetarJogo();
  }, []);

  useEffect(() => {
    if (status === 'IDLE') {
      resetarJogo();
    } else {
      setLocalStatus(status);
    }
  }, [status]);

  const resetarJogo = () => {
    setBankPieces(initialPieces.map((text, idx) => ({ id: idx, text })).sort(() => Math.random() - 0.5));
    setDepositPieces([]);
    setLocalStatus('IDLE');
  };

  const handlePushToDeposit = (piece: PieceItem) => {
    if (localStatus === 'CORRECT') return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(1020, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.03);
      }
    } catch (e) {}

    const novosDepositos = [...depositPieces, piece];
    setBankPieces(prev => prev.filter(p => p.id !== piece.id));
    setDepositPieces(novosDepositos);
    if (localStatus === 'WRONG') setLocalStatus('IDLE');
    
    if (onSelectionChange) onSelectionChange(novosDepositos.length > 0);
  };

  const handlePullToBank = (piece: PieceItem) => {
    if (localStatus === 'CORRECT') return;
    
    const novosDepositos = depositPieces.filter(p => p.id !== piece.id);
    setDepositPieces(novosDepositos);
    setBankPieces(prev => [...prev, piece]);
    if (localStatus === 'WRONG') setLocalStatus('IDLE');
    
    if (onSelectionChange) onSelectionChange(novosDepositos.length > 0);
  };

  const executarValidacaoInterna = () => {
    if (!onValidateResult) return;
    const fraseMontada = depositPieces.map(p => p.text).join(' ');
    const acertou = fraseMontada === stringAlvoCorreta;
    setLocalStatus(acertou ? 'CORRECT' : 'WRONG');
    onValidateResult(acertou);
  };

  return (
    <div className="w-full max-w-full min-w-0 flex flex-col justify-start gap-3 text-left font-mono animate-fade-in overflow-hidden box-border">
      <div className="bg-[#020B12] border border-slate-800 rounded-2xl p-4 shadow-sm select-text w-full max-w-full box-border shrink-0">
        <span className="text-[9px] font-black text-cyan-400 block mb-1 uppercase tracking-wide">Traduza o requisito corporativo nativo:</span>
        <p className="text-sm font-bold text-slate-200 leading-snug font-sans break-words">"{fraseMatrizPT}"</p>
      </div>

      {/* Linha de depósito com travas estritas de largura */}
      <div className="w-full max-w-full box-border bg-[#020B12]/80 border-2 border-dashed border-slate-800/60 rounded-xl p-2.5 min-h-[60px] flex flex-wrap gap-2 items-center justify-center shadow-inner overflow-hidden">
        {depositPieces.map((piece) => (
          <button
            key={piece.id}
            disabled={status !== 'IDLE'}
            onClick={() => handlePullToBank(piece)}
            className="px-3 py-2 bg-cyan-400 text-slate-950 font-black rounded-xl text-xs border-none cursor-pointer hover:bg-cyan-300 active:scale-95 transition-all shadow-sm max-w-full break-words text-center"
          >
            {piece.text}
          </button>
        ))}
      </div>

      {/* Banco de peças contido dentro dos limites do card do meio */}
      <div className="w-full max-w-full box-border flex flex-wrap gap-2 p-1.5 items-center justify-center overflow-hidden">
        {bankPieces.map((piece) => (
          <button
            key={piece.id}
            disabled={status !== 'IDLE'}
            onClick={() => handlePushToDeposit(piece)}
            className="px-3 py-2 bg-[#1C3B50]/80 hover:bg-[#1C3B50] text-slate-200 font-bold border border-slate-700/60 rounded-xl text-xs cursor-pointer active:scale-95 transition-all shadow-sm max-w-full break-words text-center"
          >
            {piece.text}
          </button>
        ))}
      </div>

      {localStatus === 'CORRECT' && (
        <div className="flex items-center gap-2 text-[#00E676] text-[11px] font-black uppercase tracking-wider animate-bounce mt-1">
          <CheckCircle size={14} /> <span className="break-words">Excelente! Terminologia técnica mapeada com precisão global.</span>
        </div>
      )}

      {localStatus === 'WRONG' && (
        <div className="flex items-center gap-2 text-red-500 text-[11px] font-black uppercase tracking-wider animate-pulse mt-1">
          <XCircle size={14} /> <span className="break-words">Tradução incorreta ou imprecisa. Escolha os blocos certos!</span>
        </div>
      )}

      <button id="hidden-paragraph-trigger" onClick={executarValidacaoInterna} className="hidden" />
    </div>
  );
}
