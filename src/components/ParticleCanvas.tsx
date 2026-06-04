/* =========================================================================
  COMPONENTE: MOTOR GRÁFICO DE MOEDAS NATIVO (PARTICLE CANVAS)
  HAAS ACADEMY - SISTEMA ISOLADO DE LOOPING DE RENDERING ANIMAÇÃO
  =========================================================================
*/

'use client';

import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';

export interface MoedaParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  fase: 'subindo' | 'indo_caixa' | 'indo_topo' | 'concluida';
  targetX: number;
  targetY: number;
  tipo: 'moeda' | 'energia';
}

interface ParticleCanvasProps {
  onParticleFinish: (tipoHabilidade: 'escrita' | 'pronuncia' | 'geral') => void;
}

export interface ParticleCanvasRef {
  dispararMoedas: (
    rectBotao: DOMRect | undefined,
    rectTrofeu: DOMRect,
    rectEscrita: DOMRect | undefined,
    rectPronuncia: DOMRect | undefined
  ) => void;
}

export const ParticleCanvas = forwardRef<ParticleCanvasRef, ParticleCanvasProps>(({ onParticleFinish }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useImperativeHandle(ref, () => ({
    dispararMoedas(rectBotao, rectTrofeu, rectEscrita, rectPronuncia) {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const startX = rectBotao ? rectBotao.left + rectBotao.width / 2 : window.innerWidth * 0.88;
      const startY = rectBotao ? rectBotao.top + rectBotao.height / 2 : window.innerHeight * 0.75;

      const targetTopoX = rectTrofeu.left + rectTrofeu.width / 2;
      const targetTopoY = rectTrofeu.top + rectTrofeu.height / 2;

      const targetEscritaX = rectEscrita ? rectEscrita.left + rectEscrita.width / 2 : targetTopoX;
      const targetEscritaY = rectEscrita ? rectEscrita.top + rectEscrita.height / 2 : targetTopoY;

      const targetPronunciaX = rectPronuncia ? rectPronuncia.left + rectPronuncia.width / 2 : targetTopoX;
      const targetPronunciaY = rectPronuncia ? rectPronuncia.top + rectPronuncia.height / 2 : targetTopoY;

      const poolParticulas: MoedaParticle[] = [];
      let idCounter = 0;

      for (let i = 0; i < 20; i++) {
        const irParaEscrita = i % 2 === 0;
        poolParticulas.push({
          id: idCounter++,
          x: startX + (Math.random() * 30 - 15),
          y: startY + (Math.random() * 20 - 10),
          vx: Math.random() * 8 - 4,
          vy: -(Math.random() * 8 + 12),
          alpha: 1,
          fase: 'subindo',
          targetX: irParaEscrita ? targetEscritaX : targetPronunciaX,
          targetY: irParaEscrita ? targetEscritaY : targetPronunciaY,
          tipo: 'moeda'
        });
      }

      const rodarLoopFisico = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let ativas = 0;

        poolParticulas.forEach((p) => {
          if (p.fase === 'concluida') return;
          ativas++;

          if (p.fase === 'subindo' && p.vy >= -2) {
            p.fase = 'indo_caixa';
          }

          if (p.fase === 'subindo') {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.5;
          } else if (p.fase === 'indo_caixa') {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 15) {
              if (p.targetX === targetEscritaX) {
                onParticleFinish('escrita');
              } else {
                onParticleFinish('pronuncia');
              }

              p.fase = 'indo_topo';
              p.targetX = targetTopoX;
              p.targetY = targetTopoY;
              p.tipo = 'energia';
              p.vx = Math.random() * 4 - 2;
              p.vy = -6;
              return;
            }

            p.vx += (dx / dist) * 1.5;
            p.vy += (dy / dist) * 1.5;
            p.vx *= 0.82;
            p.vy *= 0.82;
            p.x += p.vx;
            p.y += p.vy;
          } else if (p.fase === 'indo_topo') {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 20) {
              p.fase = 'concluida';
              onParticleFinish('geral');
              return;
            }

            p.vx += (dx / dist) * 2.4;
            p.vy += (dy / dist) * 2.4;
            p.vx *= 0.78;
            p.vy *= 0.78;
            p.x += p.vx;
            p.y += p.vy;
          }

          ctx.save();
          if (p.tipo === 'moeda') {
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#FFD700';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6.5, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 1;
            ctx.stroke();
          } else {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00FF66';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#00FF66';
            ctx.fill();
          }
          ctx.restore();
        });

        if (ativas > 0) {
          requestAnimationFrame(rodarLoopFisico);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      requestAnimationFrame(rodarLoopFisico);
    }
  }));

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 w-full h-full z-[10000]" />;
});

ParticleCanvas.displayName = 'ParticleCanvas';