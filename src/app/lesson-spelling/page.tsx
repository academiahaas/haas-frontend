/* =========================================================================
  MÓDULO ARCADE DE CARACTERES - HAAS EDUCACIONAL
  MECÂNICA: SOLETRANDO (SPELLING BEE) - NÍVEL B2
  
  ⚠️ TRAVA DE SEGURANÇA PÓS-SUBMISSÃO:
  APÓS O PREENCHIMENTO DOS SLOTS, O TECLADO É CONGELADOS, O BOTÃO DE RESET 
  É ELIMINADO E APENAS A OPÇÃO "CONTINUAR" FICA DISPONÍVEL JUNTO AO FEEDBACK.
  =========================================================================
*/

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Cpu, PartyPopper, Sparkles, Delete, Play, Square } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../globals.css';

const QUESTÃO_SPELLING = {
  id: 5,
  nome: 'VOCABULARY: SPELLING BEE ARCADE',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
  palavraCorreta: 'METRICS',
  significado: 'Dados ou medidas padronizadas usadas para avaliar o desempenho de um sistema ou processo corporativo.',
  dicaCoelho: 'Dica do Coelho: A palavra começa com M e possui 7 letras. Preste atenção no som de "TR" no meio!'
};

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function LessonSpellingPage() {
  const router = useRouter();
  const [letrasDigitadas, setLetrasDigitadas] = useState<string[]>([]);
  const [statusResposta, setStatusStatus] = useState<'idle' | 'correto' | 'errado'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(QUESTÃO_SPELLING.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.log(err));
      setIsPlaying(true);
    }
  };

  const handleCliqueLetra = (letra: string) => {
    if (statusResposta !== 'idle' || letrasDigitadas.length >= QUESTÃO_SPELLING.palavraCorreta.length) return;

    const novasLetras = [...letrasDigitadas, letra];
    setLetrasDigitadas(novasLetras);

    if (novasLetras.length === QUESTÃO_SPELLING.palavraCorreta.length) {
      const palavraMontada = novasLetras.join('');
      if (palavraMontada === QUESTÃO_SPELLING.palavraCorreta) {
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
    }
  };

  const handleBackspace = () => {
    if (statusResposta !== 'idle' || letrasDigitadas.length === 0) return;
    setLetrasDigitadas(letrasDigitadas.slice(0, -1));
  };

  const handleAvançar = () => {
    router.push('/lesson');
  };

  const jaRespondeu = statusResposta !== 'idle';
  const tamanhoPalavra = QUESTÃO_SPELLING.palavraCorreta.length;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#050b11] text-[#E8EDF2] flex flex-col font-sans antialiased overflow-hidden z-[9999]">
      
      <div className="absolute inset-0 bg-[radial-gradient(#101f30_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none z-0" />

      {/* RECIPIENTE CENTRAL ARCADE */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between p-6 pb-8 z-10 my-4 bg-[#09131f] border-2 border-slate-800 rounded-[36px] shadow-[0_40px_100px_rgba(0,0,0,0.95)] max-h-[92vh]">
        
        {/* HEADER: HUD de Competência */}
        <div className="flex justify-between items-center w-full bg-[#04090f] border border-slate-800/60 p-3.5 rounded-2xl shadow-md">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-slate-500 opacity-60" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">MÓDULO SOLETRANDO AUTOMÁTICO</span>
          </div>
          <span className="text-[12px] font-black text-[#00E5FF] uppercase tracking-widest font-sans bg-cyan-950/40 px-3 py-0.5 rounded-md border border-cyan-500/10">B2 ORTOGRAFIA</span>
        </div>

        {/* ÁREA CENTRAL: Player de Áudio + Slots Holográficos */}
        <div className="w-full flex flex-col items-center gap-6 my-auto">
          
          {/* Player Slim de Áudio */}
          <div className="flex items-center gap-4 bg-[#04090f] border border-slate-800 rounded-2xl py-3 px-6 shadow-inner">
            <button 
              type="button"
              onClick={toggleAudio}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isPlaying ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-[#00E5FF] hover:scale-105'
              }`}
            >
              {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">INPUT ACÚSTICO</span>
              <p className="text-xs font-bold text-slate-300">Ouvir termo corporativo ditado</p>
            </div>
          </div>

          {/* SLOTS DE CARACTERES HOLOGRÁFICOS */}
          <div className="flex justify-center items-center gap-2.5 max-w-full overflow-x-auto py-2">
            {Array.from({ length: tamanhoPalavra }).map((_, index) => {
              const letra = letrasDigitadas[index] || '';
              
              let slotStyle = "border-slate-700 bg-[#04090f] text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]";
              if (statusResposta === 'correto') {
                slotStyle = "bg-[#00FF66] text-black border-[#5eff99] shadow-[0_0_20px_rgba(0,255,102,0.3)] font-black";
              } else if (statusResposta === 'errado') {
                slotStyle = "bg-[#D85A74] text-white border-[#FF718F] shadow-[0_0_20px_rgba(216,90,116,0.25)] font-black";
              } else if (letra) {
                slotStyle = "border-cyan-500 text-[#00E5FF] bg-[#04090f] font-bold shadow-[0_0_10px_rgba(0,229,255,0.1)]";
              }

              return (
                <div 
                  key={index}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-mono uppercase tracking-wide transition-all ${slotStyle}`}
                >
                  {statusResposta === 'errado' ? QUESTÃO_SPELLING.palavraCorreta[index] : letra}
                </div>
              );
            })}
          </div>

          <p className="text-xs font-semibold text-slate-400 text-center max-w-xl bg-[#04090f] border border-slate-900 rounded-xl p-3">
            <span className="text-[#00E5FF] font-extrabold block text-[10px] font-mono tracking-widest mb-1">SIGNIFICADO DO TERMO:</span>
            {QUESTÃO_SPELLING.significado}
          </p>

        </div>

        {/* TECLADO VIRTUAL EMBUTIDO */}
        <div className="w-full bg-[#04090f] border-2 border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-inner select-none">
          <div className="flex flex-wrap justify-center gap-1.5 max-w-3xl mx-auto">
            {ALFABETO.map((letra) => (
              <button
                key={letra}
                disabled={jaRespondeu}
                onClick={() => handleCliqueLetra(letra)}
                className={`w-9 h-11 rounded-lg border font-mono text-xs font-black transition-all flex items-center justify-center ${
                  jaRespondeu
                    ? 'bg-slate-900/40 border-transparent text-slate-700 cursor-not-allowed opacity-10'
                    : 'bg-[#09131f] border-slate-800 text-slate-300 active:scale-90 hover:border-slate-600 hover:text-white'
                }`}
              >
                {letra}
              </button>
            ))}
            
            <button
              disabled={jaRespondeu || letrasDigitadas.length === 0}
              onClick={handleBackspace}
              className={`h-11 px-3 rounded-lg border font-mono text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                jaRespondeu || letrasDigitadas.length === 0
                  ? 'bg-slate-900/40 border-transparent text-slate-700 cursor-not-allowed opacity-10'
                  : 'bg-[#09131f] border-slate-800 text-amber-500 active:scale-90 hover:border-amber-600'
              }`}
            >
              <Delete size={14} />
            </button>
          </div>
        </div>

        {/* BOX INFERIOR DO COELHO + PAINEL DE COMANDO */}
        <div className="w-full flex flex-col gap-4 mt-2">
          
          <div className="w-full flex items-center gap-3.5 bg-[#04090f] border border-slate-800/80 p-3 rounded-xl shadow-sm">
            <div className="p-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/10 text-[#00E5FF] flex-shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">► INSTRUÇÃO E REVISÃO PEDAGÓGICA</span>
              <p className="text-[11px] font-semibold text-slate-400 leading-tight">
                {statusResposta === 'idle' && QUESTÃO_SPELLING.dicaCoelho}
                {statusResposta === 'correto' && 'Excelente trabalho ortográfico! A palavra "metrics" está soletrada perfeitamente.'}
                {statusResposta === 'errado' && 'A grafia ideal foi revelada nos blocos acima. "Metrics" utiliza o sufixo corporativo -ics, essencial em análise de performance.'}
              </p>
            </div>
          </div>

          {/* Painel Inferior Unificado com HAAS ACADEMY e Cores de Foco Visuais */}
          <div className="w-full flex items-center gap-3">
            <div className={`w-[35%] bg-[#04090f] border h-12 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 font-mono font-bold text-[9px] ${
              statusResposta === 'correto' 
                ? 'border-emerald-500/30 text-[#00FF66]' 
                : statusResposta === 'errado'
                ? 'border-cyan-500/30 bg-cyan-950/20 text-[#00E5FF]'
                : 'border-slate-800 text-slate-400'
            }`}>
              {statusResposta === 'correto' ? (
                <>
                  <PartyPopper size={14} className="animate-bounce" />
                  <span>+10p UN</span>
                </>
              ) : statusResposta === 'errado' ? (
                // Selo Ciano de Foco Ativo e Coisas Boas
                <span className="text-[#00E5FF] font-black tracking-widest uppercase text-[8px]">REVISÃO ATIVA</span>
              ) : (
                // HAAS ACADEMY sem engrenagem e limpo
                <div className="flex items-center justify-center text-[9px] font-black tracking-widest text-slate-300">
                  <span>HAAS ACADEMY</span>
                </div>
              )}
            </div>
            
            {/* O botão assume o papel único de CONTINUAR após responder, eliminando resets */}
            <button 
              onClick={handleAvançar}
              disabled={!jaRespondeu} 
              className={`py-3.5 rounded-xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 w-full ${
                jaRespondeu 
                  ? 'bg-gradient-to-b from-[#F8891D] to-[#E67212] text-white shadow-[0_6px_25px_rgba(248,137,29,0.5)] scale-[1.01] cursor-pointer hover:brightness-110 active:scale-95 opacity-100' 
                  : 'bg-[#131f2c] text-slate-600 cursor-not-allowed border border-slate-900 opacity-40'
              }`}
            >
              {jaRespondeu ? 'CONTINUAR' : 'AGUARDANDO INPUT'} <ArrowRight size={14} strokeWidth={3} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}