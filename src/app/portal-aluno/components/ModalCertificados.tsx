'use client';

import React from 'react';

interface ModalCertificadosProps {
  isOpen: boolean;
  onClose: () => void;
  idioma: string;
}

export default function ModalCertificados({ isOpen, onClose, idioma }: ModalCertificadosProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#040a17] border border-amber-500/30 rounded-[24px] p-6 flex flex-col gap-6 shadow-2xl">
        
        {/* Cabeçalho no padrão das modais do portal */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
            <h3 className="text-xs font-bold tracking-widest text-amber-500 uppercase">
              {idioma === 'EN' ? 'CENTRAL DE CERTIFICADOS' : idioma === 'PT' ? 'CENTRAL DE CERTIFICADOS' : 'CENTRAL DE CERTIFICACIÓN'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white transition-all p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Título interno */}
        <div className="text-center font-extrabold tracking-wider text-sm text-white uppercase">
          {idioma === 'EN' ? 'SELECT LEVEL CERTIFICATE:' : idioma === 'PT' ? 'SELECIONE O CERTIFICADO:' : 'SELECCIONE EL CERTIFICADO:'}
        </div>

        {/* Grid dos Escudos de Nível */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 py-2">
          {[
            { nivel: "A1", unlocked: true },
            { nivel: "A2", unlocked: false },
            { nivel: "B1", unlocked: false },
            { nivel: "B2", unlocked: false },
            { nivel: "C1", unlocked: false }
          ].map((item) => (
            <div 
              key={item.nivel}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                item.unlocked 
                  ? "border-amber-400 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10 cursor-pointer hover:scale-105" 
                  : "border-white/10 bg-white/[0.02] text-white/20 opacity-40 grayscale cursor-not-allowed"
              }`}
            >
              {/* Ícone Escudo SVG NATIVO */}
              <svg className={`w-8 h-8 mb-2 ${item.unlocked ? "text-amber-400" : "text-white/20"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              
              <span className="text-xs font-black tracking-wider uppercase">
                {item.nivel}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
