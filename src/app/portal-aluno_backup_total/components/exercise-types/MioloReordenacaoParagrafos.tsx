"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Timer } from 'lucide-react';

interface ParagrafoItem {
  id: number;
  text: string;
}

interface MioloReordenacaoProps {
  onValidateResult?: (isCorrect: boolean) => void;
  status?: 'IDLE' | 'CORRECT' | 'WRONG';
}

export default function MioloReordenacaoParagrafos({ onValidateResult, status = 'IDLE' }: MioloReordenacaoProps) {

  // Detecção dinâmica e resiliente do idioma ativo compartilhada com o ecossistema
  const idioma = typeof window !== 'undefined' ? (localStorage.getItem('haas_idioma') || 'ES') : 'ES';
  const [items, setItems] = useState<ParagrafoItem[]>([
    { id: 1, text: "Subsequently, pushing unstaged production changes triggered critical database locks." },
    { id: 2, text: "As a result of high latency blocks, our main gateway experienced a major slowdown." },
    { id: 3, text: "First, the development team initiated a schema migration on the core replica clusters." }
  ]);

  const [timeLeft, setTimeLeft] = useState<number>(20); // 20 Segundos de limite ativo
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const timerRef = useRef<any>(null);

  const dispararValidacaoParaCardPai = () => {
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const isCorrect = items[0].id === 3 && items[1].id === 2 && items[2].id === 1;
    onValidateResult?.(isCorrect);
  };

  // Efeito do Cronômetro Regressivo
  useEffect(() => {
    if (status !== 'IDLE') {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            // ZEROU: Força a validação imediata da ordem atual
            setTimeout(() => {
              dispararValidacaoParaCardPai();
            }, 10);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, items, status]);

  // Reseta o timer se o exercício resetar para IDLE
  useEffect(() => {
    if (status === 'IDLE') {
      setTimeLeft(20);
      setTimerActive(true);
    }
  }, [status]);

  const moverElemento = (index: number, direcao: 'UP' | 'DOWN') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(1020, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.03);
      }
    } catch (e) {}

    if (status === 'CORRECT' || timeLeft === 0) return;
    const novoIndex = direcao === 'UP' ? index - 1 : index + 1;
    if (novoIndex < 0 || novoIndex >= items.length) return;

    const listaEditada = [...items];
    const temporario = listaEditada[index];
    listaEditada[index] = listaEditada[novoIndex];
    listaEditada[novoIndex] = temporario;
    setItems(listaEditada);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-4 font-mono text-left animate-fade-in min-h-0 flex-1">
      
      {/* BARRA DO CRONÔMETRO AUTOMÁTICO INDEPENDENTE */}
      <div className="flex items-center justify-between bg-[#070d19] border border-white/[0.04] rounded-xl px-3 py-2 w-full select-none shrink-0">
        <span className="text-[clamp(11px,3vw,13px)] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Timer size={13} className={timerActive ? 'animate-pulse text-orange-400' : 'text-slate-500'} />
          {timerActive ? (
            idioma === "PT" ? "Ordene antes do envio automático" : 
            idioma === "ES" ? "Ordene antes del envío automático" : 
            "Arrange before automatic submission"
          ) : (
            idioma === "PT" ? "Validação finalizada" : 
            idioma === "ES" ? "Validación finalizada" : 
            "Validation completed"
          )}
        </span>
        <span className={`text-xs font-mono font-black ${timeLeft <= 5 && timerActive ? 'text-red-500 animate-bounce' : 'text-orange-400'}`}>
          00:{timeLeft < 10 ? '0' : ''}{timeLeft}
        </span>
      </div>

      {/* BLOCO DE PARÁGRAFOS DISTRIBUÍDOS */}
      <div className="flex flex-col justify-center gap-3 w-full flex-1 min-h-0">
        {items.map((item, index) => (
          <div 
            key={item.id}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border bg-[#0c192e] shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200 flex-1 min-h-0 ${
              status === 'CORRECT' ? 'border-[#22C55E]/40 bg-[#042414]/20' : 
              status === 'WRONG' ? 'border-red-500/30 bg-[#2E0B0E]/20 animate-shake' :
              'border-white/[0.04] hover:border-[#f59e0b]/30'
            }`}
          >
            {/* Controles de movimentação mais parrudos */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                disabled={index === 0 || status === 'CORRECT' || timeLeft === 0}
                onClick={() => moverElemento(index, 'UP')}
                className="p-1.5 bg-[#070d19] text-slate-300 disabled:opacity-10 rounded-md border border-white/[0.04] transition-all"
              >
                <ArrowUp size={13} />
              </button>
              <button
                disabled={index === items.length - 1 || status === 'CORRECT' || timeLeft === 0}
                onClick={() => moverElemento(index, 'DOWN')}
                className="p-1.5 bg-[#070d19] text-slate-300 disabled:opacity-10 rounded-md border border-white/[0.04] transition-all"
              >
                <ArrowDown size={13} />
              </button>
            </div>
            
            {/* Texto Ampliado */}
            <p className="flex-1 text-[clamp(13px,3.8vw,15px)] font-bold leading-relaxed text-[#F8FAFC] font-sans select-none">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      {/* Mantém o ID original injetado para compatibilidade do trigger de fora se houver */}
      <button id="hidden-paragraph-trigger" onClick={dispararValidacaoParaCardPai} className="hidden" />
    </div>
  );
}
