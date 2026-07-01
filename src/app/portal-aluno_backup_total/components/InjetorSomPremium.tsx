"use client";
import { useEffect } from "react";

export default function InjetorSomPremium() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 🔒 GERENCIADOR GLOBAL: APENAS ACERTO, ERRO E PRESENTINHO. ZERO CLIQUES!
    (window as any).tocarSomNativoPremium = (tipo: string) => {
      try {
        if (tipo === 'click') return; // Bloqueio total e absoluto de cliques aqui!

        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (tipo === 'success') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(580, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
        } else if (tipo === 'error') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(135, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.1);
        } else if (tipo === 'level_complete') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.07);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.22);
        }
      } catch (e) {
        console.log(e);
      }
    };
  }, []);

  return null;
}
