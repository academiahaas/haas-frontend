'use client';

import React, { useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import CoelhoRobot from './CoelhoRobot';

export default function TelaTransicaoHibrida({ modo, idioma = 'PT' }: { modo: 'entrada' | 'saida' | 'inicial', idioma?: string }) {
  const [mounted, setMounted] = useState(false);
  const [progresso, setProgresso] = useState(0);

  useLayoutEffect(() => {
    setMounted(true);
    const timeout = setTimeout(() => setProgresso(100), 50);
    return () => clearTimeout(timeout);
  }, []);

  const isEntrada = modo === 'entrada' || modo === 'inicial';
  
  const textos = {
    entrada: { PT: 'CARREGANDO AMBIENTE...', EN: 'LOADING ENVIRONMENT...', ES: 'CARGANDO ENTORNO...' },
    saida: { PT: 'CALCULANDO PONTOS...', EN: 'CALCULATING POINTS...', ES: 'CALCULANDO PUNTOS...' },
    inicial: { PT: 'PREPARANDO SEU ESPAÇO...', EN: 'PREPARING YOUR SPACE...', ES: 'PREPARANDO TU ESPACIO...' }
  };

  const texto = textos[modo] ? (textos[modo][idioma as keyof typeof textos.entrada] || textos[modo].PT) : textos.entrada.PT;

  const content = (
    <div className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center bg-[#030712] overflow-hidden pointer-events-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/30 via-[#030712] to-[#030712]"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <CoelhoRobot />
        
        <h2 className="mt-8 text-xl md:text-2xl font-black font-mono text-cyan-400 tracking-[0.3em] uppercase text-center">
          {texto}
        </h2>
        
        <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all ease-out"
            style={{ width: `${progresso}%`, transitionDuration: '1800ms' }}
          ></div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return ReactDOM.createPortal(content, document.body);
}
