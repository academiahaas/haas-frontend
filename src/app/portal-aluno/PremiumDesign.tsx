"use client";
import { useEffect } from 'react';

export default function PremiumDesign() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("design") === "premium") {
        // Cria uma tag de estilo para esmagar as cores antigas e injetar o visual de jogo premium
        const style = document.createElement('style');
        style.innerHTML = `
          /* 1. Fundo do site profundo e escuro */
          body, __next, main, div[style*="backgroundColor: '#0a1120'"], div[style*="background: '#0a1120'"] {
            background-color: #0B1220 !important;
            background: #0B1220 !important;
          }
          /* 2. Cards com contornos fortes, profundidade e fundo escurecido */
          div[style*="backgroundColor: '#111c31'"], div[style*="background: '#111c31'"],
          div[style*="backgroundColor: '#16223f'"], div[style*="background: '#16223f'"] {
            background-color: #132235 !important;
            background: #132235 !important;
            border: 2px solid #48627D !important;
            box-shadow: 0 12px 32px rgba(0,0,0,0.5) !important;
          }
          /* 3. Brilho Neon (Glow) no botão laranja de Treinar */
          button[style*="#f97316"], button {
            box-shadow: 0 0 20px rgba(249,115,22,0.45) !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return null;
}
