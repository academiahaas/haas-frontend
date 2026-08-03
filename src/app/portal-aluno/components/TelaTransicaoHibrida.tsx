'use client';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import CoelhoRobot from './CoelhoRobot';

export default function TelaTransicaoHibrida({ modo, idioma = 'PT' }: { modo: 'entrada' | 'saida', idioma?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEntrada = modo === 'entrada';
  
  const textos = {
    entrada: { PT: 'CARREGANDO AMBIENTE...', EN: 'LOADING ENVIRONMENT...', ES: 'CARGANDO ENTORNO...' },
    saida: { PT: 'CALCULANDO PONTOS...', EN: 'CALCULATING POINTS...', ES: 'CALCULANDO PUNTOS...' }
  };

  const texto = textos[isEntrada ? 'entrada' : 'saida'][idioma as keyof typeof textos.entrada] || textos[isEntrada ? 'entrada' : 'saida'].PT;

  const content = (
    <div className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center bg-[#030712] overflow-hidden pointer-events-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#030712] to-[#030712]"></div>
      
      <div className="relative z-10 flex flex-col items-center animate-pulse">
        <CoelhoRobot devePiscar={isEntrada} />
        
        <h2 className="mt-8 text-xl md:text-2xl font-black font-mono text-cyan-400 tracking-[0.3em] uppercase text-center">
          {texto}
        </h2>
        
        <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  // Injeta diretamente no <body> evitando qualquer "vazamento" de layouts filhos
  return ReactDOM.createPortal(content, document.body);
}
