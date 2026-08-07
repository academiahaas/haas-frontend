"use client";

import React from "react";
import { X, Video, BookOpen } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tipo: "VIDEO" | "TEXTO" | null;
}

export default function ModalPedagogo({ isOpen, onClose, tipo }: Props) {
  if (!isOpen || !tipo) return null;

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-[200000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-default"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-xl bg-[#162235] border border-[#48627D]/40 rounded-[24px] p-6 flex flex-col shadow-2xl text-left"
      >
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#1D2D44] p-1.5 rounded-full border border-white/5 cursor-pointer"
        >
          <X size={14} />
        </button>
        
        {tipo === 'VIDEO' ? (
          <div className="w-full flex flex-col gap-3">
            <span className="text-[10px] font-black text-[#00D4FF] tracking-widest uppercase flex items-center gap-1.5">
              <Video size={12} /> CONTEÚDO AUDIOVISUAL
            </span>
            <h3 className="text-base font-bold text-white font-sans">Data Schema & Production Integrity</h3>
            <div className="w-full aspect-video bg-[#0B1528] rounded-xl border border-white/5 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
              [ PLAYER DE VÍDEO HAAS ]
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            <span className="text-[10px] font-black text-[#FF8A2B] tracking-widest uppercase flex items-center gap-1.5">
              <BookOpen size={12} /> CONTEÚDO ESCRITO DE FIXAÇÃO
            </span>
            <h3 className="text-base font-bold text-white font-sans">A Regra dos Clusters de Réplica</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">
              Em arquiteturas de banco de dados, as alterações de esquema estrutural (schema migrations) devem ser executadas com validações prévias nos clusters secundários (réplicas) antes de impactarem a tabela master de produção.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}