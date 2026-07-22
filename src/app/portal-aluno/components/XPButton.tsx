import React from 'react';
import { Award } from 'lucide-react';

interface XPButtonProps {
  totalXp: number;
  onClick: () => void;
  idioma: 'PT' | 'ES' | 'EN';
}

export const XPButton: React.FC<XPButtonProps> = ({ totalXp, onClick, idioma }) => {
  const label = idioma === 'PT' ? 'XP' : idioma === 'ES' ? 'XP' : 'XP';
  const title = idioma === 'PT' ? 'Pontos Totais - Abrir Arena' : idioma === 'ES' ? 'Puntos Totales - Abrir Arena' : 'Total Points - Open Arena';

  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-200 cursor-pointer text-xs font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98]"
    >
      <Award size={14} className="text-amber-400 flex-shrink-0 animate-pulse" />
      <span className="font-mono font-bold text-amber-300">{totalXp.toLocaleString()}</span>
      <span className="text-[10px] text-amber-500/80 uppercase tracking-wider font-extrabold">{label}</span>
    </button>
  );
};

export default XPButton;
