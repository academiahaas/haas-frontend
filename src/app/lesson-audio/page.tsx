/* =========================================================================
  MÓDULO AUDITIVO / INPUT RESILIENTE - SISTEMA EDUCACIONAL HAAS
  MECÂNICA: DITADO DE LACUNAS (GAP FILLING) - NÍVEL B2
  
  ⚠️ AVISO DE ENGENHARIA:
  LAYOUT ADAPTATIVO CONSTRUÍDO PARA COMPENSAR A SUBIDA DO TECLADO MOBILE.
  O PLAYER E O CABEÇALHO FICAM FIXOS NO TOPO ENQUANTO O INPUT É ELÁSTICO.
  =========================================================================
*/

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Cpu, PartyPopper, Settings, Play, Square, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../globals.css';

const QUESTÃO_AUDIO = {
  id: 3,
  nome: 'LISTENING: GAP FILLING CHALLENGE',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
  textoPre: 'The primary goal of the new framework is to minimize operational',
  textoPos: 'and enhance long-term student metrics.',
  respostaCorreta: 'friction',
  dicaCoelho: 'O texto aborda a redução de resistências internas ou gargalos em processos corporativos.'
};

export default function LessonAudioPage() {
  const router = useRouter();
  const [inputUsuario, setInputUsuario] = useState('');
  const [statusResposta, setStatusStatus] = useState<'idle' | 'correto' | 'errado'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(QUESTÃO_AUDIO.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.log('Erro ao tocar áudio:', err));
      setIsPlaying(true);
    }
  };

  const handleValidarResposta = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusResposta !== 'idle' || !inputUsuario.trim()) return;

    const respostaLimpa = inputUsuario.trim().toLowerCase();
    if (respostaLimpa === QUESTÃO_AUDIO.respostaCorreta.toLowerCase()) {
      setStatusStatus('correto');
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00FF66', '#FFD700', '#FFFFFF']
      });
    } else {
      setStatusStatus('errado');
    }
  };

  const handleAvançar = () => {
    router.push('/lesson');
  };

  const jaRespondeu = statusResposta !== 'idle';

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#050b11] text-[#E8EDF2] flex flex-col font-sans antialiased overflow-hidden z-[9999]">
      
      {/* BACKGROUND DE CÉLULAS MÍNIMO */}
      <div className="absolute inset-0 bg-[radial-gradient(#101f30_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none z-0" />

      {/* 1. SEÇÃO TOPO FIXA (IMUNE À SUBIDA DO TECLADO) */}
      <div className="w-full max-w-4xl mx-auto pt-6 px-4 flex flex-col gap-4 flex-shrink-0 z-10">
        
        {/* HUD de Competência */}
        <div className="flex justify-between items-center w-full bg-[#09131f] border border-slate-800/80 p-3.5 rounded-2xl shadow-md">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-slate-500 opacity-60" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">HUD COMPREENSÃO AUDITIVA</span>
          </div>
          <span className="text-[12px] font-black text-[#00E5FF] uppercase tracking-widest bg-cyan-950/40 px-3 py-0.5 rounded-md border border-cyan-500/10">
            B2 LISTENING
          </span>
        </div>

        {/* Player de Áudio Corrigido para Português */}
        <div className="w-full bg-[#09131f] border-2 border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-xl relative">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest tracking-[0.2em]">REPRODUTOR E VISUALIZADOR DE ÁUDIO</span>
          
          <button 
            type="button"
            onClick={toggleAudio}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPlaying 
                ? 'bg-cyan-500 text-black shadow-[0_0_25px_rgba(0,229,255,0.4)] scale-95' 
                : 'bg-gradient-to-b from-[#16293f] to-[#0b1420] border border-slate-700/60 text-[#00E5FF] hover:scale-105 active:scale-95 shadow-md'
            }`}
          >
            {isPlaying ? <Square size={22} fill="currentColor" /> : <Play size={22} className="ml-1" fill="currentColor" />}
          </button>

          <p className="text-xs font-bold text-slate-400 font-mono tracking-wide">
            {isPlaying ? 'Reproduzindo segmento de áudio...' : 'Clique para reproduzir o áudio vocacional'}
          </p>
        </div>

      </div>

      {/* 2. SEÇÃO INFERIOR ELÁSTICA ADAPTATIVA */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between p-4 pb-6 z-10 relative overflow-y-auto">
        
        {/* Bloco de Texto Corrigido para Evitar Linhas Órfãs */}
        <form onSubmit={handleValidarResposta} className="w-full bg-[#09131f] border-2 border-slate-800 rounded-[28px] p-6 mt-4 flex flex-col gap-6 shadow-2xl">
          
          <div className="text-slate-200 text-base font-bold leading-relaxed tracking-wide text-justify break-words max-w-full">
            {QUESTÃO_AUDIO.textoPre}{' '}
            {statusResposta === 'idle' ? (
              <input
                type="text"
                value={inputUsuario}
                onChange={(e) => setInputUsuario(e.target.value)}
                placeholder="digite aqui"
                disabled={jaRespondeu}
                className="inline-block mx-1 w-36 text-center bg-[#04090f] border-b-2 border-cyan-500 text-[#00E5FF] focus:outline-none focus:border-cyan-300 font-black font-mono uppercase text-sm px-2 py-0.5 rounded transition-all placeholder:text-slate-700"
                autoFocus
              />
            ) : statusResposta === 'correto' ? (
              <span className="inline-block mx-1.5 px-3 py-0.5 bg-[#00FF66] text-black rounded font-mono font-black uppercase text-sm shadow-[0_0_15px_rgba(0,255,102,0.4)] whitespace-nowrap">
                {QUESTÃO_AUDIO.respostaCorreta}
              </span>
            ) : (
              <span className="inline-block mx-1.5 px-3 py-0.5 bg-[#D85A74] text-white rounded font-mono font-black uppercase text-sm shadow-[0_0_15px_rgba(216,90,116,0.3)] line-through whitespace-nowrap">
                {inputUsuario}
              </span>
            )}
            {' '}{QUESTÃO_AUDIO.textoPos}
          </div>

          {/* Renderização Estilizada da Resposta Esperada */}
          {statusResposta === 'errado' && (
            <div className="w-full p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-[#00E5FF] text-xs font-black font-mono tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.05)]">
              <PartyPopper size={14} className="text-cyan-400" />
              <span>RESPOSTA ESPERADA: {QUESTÃO_AUDIO.respostaCorreta.toUpperCase()}</span>
            </div>
          )}

          {/* Caixa de Revisão do Coelho Traduzida para o Aluno */}
          <div className="w-full border-t border-slate-800/60 pt-4 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/10 text-[#00E5FF]">
              <Sparkles size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">► INSTRUÇÃO E REVISÃO PEDAGÓGICA</span>
              <p className="text-[11px] font-semibold text-slate-400 leading-tight">
                {statusResposta === 'idle' && QUESTÃO_AUDIO.dicaCoelho}
                {statusResposta === 'correto' && 'Excelente! Seu ouvido está perfeitamente calibrado para termos de processos corporativos avançados.'}
                {statusResposta === 'errado' && 'A palavra ditada foi "friction" (atrito/resistência). Esse termo é amplamente usado em gestão B2 para descrever gargalos organizacionais.'}
              </p>
            </div>
          </div>

          <button type="submit" className="hidden" disabled={jaRespondeu} />
        </form>

        {/* Rodapé de Ação */}
        <div className="w-full flex items-center gap-3 mt-4">
          <div className={`w-[30%] bg-[#04090f] border h-12 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 font-mono font-bold text-[9px] ${statusResposta === 'correto' ? 'border-emerald-500/30 text-[#00FF66]' : 'border-slate-800 text-slate-400'}`}>
            {statusResposta === 'correto' ? (
              <>
                <PartyPopper size={14} className="animate-bounce" />
                <span>+10p UN</span>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Settings size={12} className="text-slate-500" />
                <span>SISTEMA</span>
              </div>
            )}
          </div>
          
          {statusResposta === 'idle' ? (
            <button 
              onClick={handleValidarResposta}
              disabled={!inputUsuario.trim()} 
              className={`py-3.5 rounded-xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 w-full ${
                inputUsuario.trim() 
                  ? 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-black shadow-[0_6px_25px_rgba(0,229,255,0.35)] scale-[1.01] cursor-pointer' 
                  : 'bg-[#131f2c] text-slate-600 cursor-not-allowed border border-slate-900 opacity-40'
              }`}
            >
              VALIDAR RESPOSTA <ArrowRight size={14} strokeWidth={3} />
            </button>
          ) : (
            <button 
              onClick={handleAvançar}
              className="py-3.5 rounded-xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 w-full bg-gradient-to-b from-[#F8891D] to-[#E67212] text-white shadow-[0_6px_25px_rgba(248,137,29,0.5)] scale-[1.01] cursor-pointer hover:brightness-110 active:scale-95 opacity-100"
            >
              CONTINUAR <ArrowRight size={14} strokeWidth={3} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}