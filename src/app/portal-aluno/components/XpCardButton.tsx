import React from 'react';
import { Flame } from 'lucide-react';

interface XpCardButtonProps {
  totalXp: number;
  onClick: () => void;
  idioma: string;
}

export const XpCardButton: React.FC<XpCardButtonProps> = ({ totalXp, onClick, idioma }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-slate-900/80 border border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/10 transition-all duration-200 rounded-lg p-2 flex items-center justify-center gap-1.5 cursor-pointer text-amber-400 font-semibold text-xs group shadow-sm"
      title={idioma === 'PT' ? 'Pontos Totais - Abrir Arena' : idioma === 'ES' ? 'Puntos Totales - Abrir Arena' : 'Total Points - Open Arena'}
    >
      <Flame size={14} className="text-amber-500 group-hover:scale-110 transition-transform flex-shrink-0 animate-pulse" />
      <span className="font-mono font-bold text-slate-100 truncate">{totalXp}</span>
      <span className="text-[10px] text-amber-400 font-bold uppercase ml-0.5">XP</span>
    </div>
  );
};

export default XpCardButton;
