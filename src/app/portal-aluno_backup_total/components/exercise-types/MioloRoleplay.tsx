'use client';
import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Disc, CheckCircle } from 'lucide-react';

interface MioloRoleplayProps {
  onSelectCorrect?: () => void;
  onSelectWrong?: () => void;
}

export default function MioloRoleplay({ onSelectCorrect, onSelectWrong }: MioloRoleplayProps) {
  const [flowState, setFlowState] = useState<'IA_SPEAKING' | 'USER_TURN' | 'RECORDING' | 'PROCESSING' | 'DONE'>('IA_SPEAKING');
  const phraseIA = "Wake up, engineer. We have a database shard to optimize before the deploy.";
  const phraseUser = "Give me two minutes. The replica cluster is already synchronizing.";

  useEffect(() => {
    if (flowState === 'IA_SPEAKING') {
      const timer = setTimeout(() => { setFlowState('USER_TURN'); }, 2500);
      return () => clearTimeout(timer);
    }
  }, [flowState]);

  const playAudioIA = () => {
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

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phraseIA);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSimularGravacao = () => {
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

    if (flowState !== 'USER_TURN') return;
    setFlowState('RECORDING');
    setTimeout(() => {
      setFlowState('PROCESSING');
      setTimeout(() => {
        setFlowState('DONE');
        onSelectCorrect?.();
      }, 1500);
    }, 2500);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-stretch text-left font-mono animate-fade-in min-h-0 flex-1 gap-4">
      
      {/* Balão da IA (Topo) */}
      <div className="w-full bg-[#0c192e] border border-white/[0.04] rounded-xl py-5 px-4 relative shadow-md shrink-0">
        <span className="text-[clamp(11px,3vw,13px)] font-black text-[#f59e0b] block mb-2 tracking-wider uppercase">🛰️ AI INTERVIEWER CO-PILOT:</span>
        <p className="text-[clamp(13px,3.8vw,15px)] font-bold text-slate-200 leading-relaxed font-sans pr-8">"{phraseIA}"</p>
        <button onClick={playAudioIA} className="absolute right-4 top-5 p-2 bg-[#070d19] border border-white/[0.04] text-[#f59e0b] hover:bg-[#f59e0b]/10 rounded-lg cursor-pointer transition-all">
          <Volume2 size={14} />
        </button>
      </div>

      {/* Turno do Aluno (Meio Expandido) */}
      <div className={`w-full border rounded-xl py-5 px-4 transition-all flex flex-col justify-between flex-1 min-h-0 gap-4 ${
        flowState === 'USER_TURN' ? 'border-[#f59e0b]/20 bg-[#0c192e] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'border-white/[0.02] bg-[#0c192e]/40 opacity-60'
      }`}>
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-[clamp(11px,3vw,13px)] font-black text-slate-400 block mb-2 uppercase tracking-wide">🎙️ SEU TURNO DE RESPONDER EM INGLÊS:</span>
          <p className="text-[clamp(13px,3.8vw,15px)] font-black text-[#f59e0b] font-sans leading-relaxed">"{phraseUser}"</p>
        </div>

        {/* Botão de Ação Integrado à Base do Container */}
        <button
          onClick={handleSimularGravacao}
          disabled={flowState !== 'USER_TURN'}
          className={`w-full py-4 rounded-xl font-black text-[clamp(12px,3.5vw,14px)] uppercase tracking-widest transition-all border-none flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
            flowState === 'RECORDING' ? 'bg-red-600 text-white animate-pulse' :
            flowState === 'PROCESSING' ? 'bg-amber-500 text-slate-950' :
            flowState === 'DONE' ? 'bg-[#00E676] text-slate-950' : 'bg-[#070d19] hover:bg-[#f59e0b]/10 text-slate-200 hover:text-[#f59e0b] border border-white/[0.04] hover:border-[#f59e0b]/40'
          }`}
        >
          {flowState === 'IA_SPEAKING' && 'Aguardando IA concluir...'}
          {flowState === 'USER_TURN' && <><Mic size={16} /> Clicar para Responder (Falar)</>}
          {flowState === 'RECORDING' && <><Disc size={16} className="animate-spin" /> Gravando sua Voz ao Vivo...</>}
          {flowState === 'PROCESSING' && 'IA Analisando sua Resposta...'}
          {flowState === 'DONE' && <><CheckCircle size={16} /> Resposta Processada</>}
        </button>
      </div>

      {/* FEEDBACK INFERIOR - SEM RESERVA DE PIXELS FIXOS, SURGE CONDICIONALMENTE PURA */}
      {flowState === 'DONE' && (
        <div className="w-full shrink-0 flex items-center justify-center pt-1">
          <div className="flex items-center gap-2 text-[#00E676] text-[12px] font-black uppercase tracking-wider animate-bounce text-center">
            <CheckCircle size={16} /> <span>Excelente conversação! Pronúncia e tempo de resposta aceitos.</span>
          </div>
        </div>
      )}
      
    </div>
  );
}
