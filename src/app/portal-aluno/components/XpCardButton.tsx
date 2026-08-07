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
      className="bg-slate-900/80 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all duration-200 rounded-lg py-2 px-1 flex items-center justify-center gap-1 cursor-pointer text-purple-300 font-semibold text-[9px] group shadow-sm"
      title={idioma === 'PT' ? 'Pontos Totais - Abrir Arena' : idioma === 'ES' ? 'Puntos Totales - Abrir Arena' : 'Total Points - Open Arena'}
    >
      <Flame size={11} className="text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0 animate-pulse" />
      <span className="font-mono font-bold text-slate-100 truncate">{totalXp}</span>
      <span className="text-[8.5px] text-purple-300 font-bold uppercase ml-0.5">XP</span>
    </div>
  );
};

export default XpCardButton;
