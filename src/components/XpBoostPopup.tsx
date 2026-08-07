/* =========================================================================
  COMPONENTE: POP-UP DE RECOMPENSA DE REVERBERAÇÃO (XP BOOST POPUP)
  HAAS ACADEMY - SISTEMA ISOLADO COM ESTILOS DE NEUROCIÊNCIA VISUAL
  =========================================================================
*/

'use client';

import React from 'react';

interface XpBoostPopupProps {
  mostrar: boolean;
}

export function XpBoostPopup({ mostrar }: XpBoostPopupProps) {
  if (!mostrar) return null;

  return (
    <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center select-none z-50 animate-boost-low-popup">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@900&family=Titan+One&display=swap');
        
        @keyframes lowFadeUpBounce {
          0% { opacity: 0; transform: translate(-50%, 30px) scale(0.7); }
          15% { opacity: 1; transform: translate(-50%, -15px) scale(1.05); }
          30% { transform: translate(-50%, 0) scale(1); }
          75% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -25px) scale(0.9); }
        }
        
        .animate-boost-low-popup { 
          animation: lowFadeUpBounce 2.2s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        }

        .texto-xp-gamer-isolated { 
          font-family: 'Poppins', sans-serif; 
          font-weight: 900; 
          color: #00FF66; 
          font-size: 32px; 
          line-height: 1; 
          text-shadow: -1.5px -1.5px 0 #050b10, 1.5px -1.5px 0 #050b10, -1.5px 1.5px 0 #050b10, 1.5px 1.5px 0 #050b10, 0 0 12px rgba(0, 255, 102, 0.5), 0 4px 0px #00a341; 
        }
        
        .texto-boost-gamer-isolated { 
          font-family: 'Titan One', display; 
          font-size: 20px; 
          line-height: 1;
          background: linear-gradient(to bottom, #FFD96A 0%, #FFB84D 50%, #FF8A3D 100%); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
          filter: drop-shadow(0 2.5px 0px #091724); 
          -webkit-text-stroke: 1.2px #091724; 
        }
      `}} />

      <h3 className="texto-xp-gamer-isolated uppercase">+10 XP</h3>
      <h4 className="texto-boost-gamer-isolated uppercase mt-0.5">BOOST</h4>
    </div>
  );
}