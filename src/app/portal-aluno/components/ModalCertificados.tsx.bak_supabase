import React from 'react';
import { X, Shield } from 'lucide-react';

interface ModalCertificadosProps {
  isOpen: boolean;
  onClose: () => void;
  idioma: 'PT' | 'EN' | 'ES';
  userLevel?: string;
}

export const ModalCertificados: React.FC<ModalCertificadosProps> = ({
  isOpen,
  onClose,
  idioma = 'PT',
  userLevel = 'A1'
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    if (idioma === 'EN') return 'CERTIFICATION CENTER';
    if (idioma === 'ES') return 'CENTRO DE CERTIFICACIÓN';
    return 'CENTRAL DE CERTIFICADOS';
  };

  const getSubtitle = () => {
    if (idioma === 'EN') return 'SELECT LEVEL CERTIFICATE:';
    if (idioma === 'ES') return 'SELECCIONE EL CERTIFICADO DE NIVEL:';
    return 'SELECIONE O CERTIFICADO DE NÍVEL:';
  };

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#040a17] border border-amber-500/30 rounded-[24px] p-6 flex flex-col gap-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-xs font-mono font-black text-amber-500 uppercase tracking-wider">
              {getTitle()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Subtítulo Central */}
        <div className="text-center">
          <p className="text-xs font-mono font-bold text-white tracking-widest uppercase">
            {getSubtitle()}
          </p>
        </div>

        {/* Grid de Níveis */}
        <div className="grid grid-cols-5 gap-3 py-2">
          {levels.map((lvl) => {
            const isUnlocked = lvl === 'A1'; // Lógica de liberação
            return (
              <div
                key={lvl}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/10 to-amber-950/30 shadow-lg shadow-amber-500/10 cursor-pointer hover:scale-105'
                    : 'border-white/5 bg-white/[0.02] opacity-30 grayscale cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isUnlocked
                    ? 'border-amber-400 bg-amber-500/20 text-amber-400'
                    : 'border-slate-700 bg-slate-900 text-slate-500'
                }`}>
                  <Shield size={20} />
                </div>
                <span className={`text-xs font-mono font-black ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`}>
                  {lvl}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ModalCertificados;
