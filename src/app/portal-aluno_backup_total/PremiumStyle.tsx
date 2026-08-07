"use client";
import { useEffect } from 'react';

export default function PremiumStyle() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("design=premium")) {
      
      const style = document.createElement('style');
      style.id = 'premium-mindzy-dream-override';
      style.innerHTML = `
        /* 1. FUNDO GRAFITE ULTRA-ESCURO (PSICOLOGIA COMPORTAMENTAL) */
        html, body, main, #__next, div[style*="#0a1120"] {
          background-color: #1D1F23 !important;
          background: #1D1F23 !important;
        }

        /* 2. SUPERFÍCIES: INJETANDO AS CORES PASTÉIS NEON */
        /* Cards Gerais: Fundo Liso com Sombras Suaves */
        div[style*="#111c31"], div[style*="rgb(17, 28, 49)"], .bg-surface-1 {
          background-color: #CBF86A !important; /* Verde Limão Pastél */
          color: #000000 !important;
          border: none !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4) !important;
          border-radius: 24px !important;
        }
        div[style*="#111c31"] span, div[style*="rgb(17, 28, 49)"] span,
        div[style*="#111c31"] h1, div[style*="#111c31"] h2, div[style*="#111c31"] h3,
        div[style*="#111c31"] p {
          color: #000000 !important;
        }

        /* Card Herói (Data Schema/Módulo Principal) */
        div[style*="#16223f"], div[style*="rgb(22, 34, 63)"], .bg-hero {
          background-color: #FF9F6A !important; /* Laranja Pastél/Coral */
          border: 1px solid #FF814A !important;
          box-shadow: 0 0 35px rgba(255, 129, 74, 0.3) !important;
          border-radius: 24px !important;
        }
        div[style*="#16223f"] h1, div[style*="#16223f"] h2, div[style*="#16223f"] p {
          color: #000000 !important;
        }
        div[style*="#16223f"] div {
          color: #000000 !important;
        }

        /* Card Perfil (Top) */
        main > div:first-child > div:first-child {
          background-color: #B185F8 !important; /* Púrpura Vibrante */
          color: #000000 !important;
          border-radius: 24px !important;
        }
        main > div:first-child > div:first-child span, main > div:first-child > div:first-child h2 {
          color: #000000 !important;
        }

        /* 3. CTA: BOTÃO DE TREINAR (MANTER O FOCO) */
        button {
          background-color: #F87729 !important;
          background: #F87729 !important;
          color: #FFFFFF !important;
          box-shadow: 0 0 20px rgba(248, 119, 41, 0.5) !important;
          font-weight: 700 !important;
          border-radius: 16px !important;
          transition: all 0.2s ease-in-out !important;
        }
        button:hover {
          box-shadow: 0 0 35px rgba(248, 119, 41, 0.8) !important;
          transform: translateY(-1px);
        }

        /* 4. TEXTOS E GRÁFICOS (REVISÃO DE CONTRASTE) */
        /* Gráfico Radar Chart: Texto Preto */
        .recharts-legend-item-text, .recharts-polar-grid-concentric-path, .recharts-polar-angle-axis-tick-text {
          fill: #000000 !important;
          stroke: #000000 !important;
        }
        /* Métrica em Cyan no Radar: Manter o Cyan */
        span[style*="color: rgb(0, 240, 255)"], span[style*="#00f0ff"] {
          color: #38BDF8 !important; /* Cyan Elétrico Elitista */
        }
      `;
      
      const oldStyle = document.getElementById('premium-mindzy-dream-override');
      if (oldStyle) oldStyle.remove();
      document.head.appendChild(style);

      const aplicarSonhoMindzy = () => {
        const todasAsDivs = document.querySelectorAll('div');
        todasAsDivs.forEach(div => {
          const estiloInline = div.getAttribute('style') || '';
          
          if (estiloInline.includes('#0a1120') || estiloInline.includes('rgb(10, 17, 32)')) {
            div.style.setProperty('background-color', '#1D1F23', 'important');
          }
          if (estiloInline.includes('#111c31') || estiloInline.includes('rgb(17, 28, 49)')) {
            div.style.setProperty('background-color', '#CBF86A', 'important');
          }
          if (estiloInline.includes('#16223f') || estiloInline.includes('rgb(22, 34, 63)')) {
            div.style.setProperty('background-color', '#FF9F6A', 'important');
          }
        });
      };

      aplicarSonhoMindzy();
      const interval = setInterval(aplicarSonhoMindzy, 300);
      return () => clearInterval(interval);
    }
  }, []);

  return null;
}
