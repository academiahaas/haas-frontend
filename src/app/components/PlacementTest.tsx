'use client';

import React, { useState } from 'react';

interface Question {
  id: number;
  skill: 'Listening' | 'Grammar' | 'Reading' | 'Speaking';
  prompt: string;
  context?: string;
  options?: string[];
  audioSample?: boolean;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    skill: 'Listening',
    prompt: 'Escuta o áudio da Mentora IA e seleciona a opção correta sobre o diálogo:',
    context: '"We need to reschedule the strategy meeting to next Tuesday at 10 AM due to a conflict in the room booking."',
    audioSample: true,
    options: [
      'The meeting is confirmed for today at 10 AM.',
      'The meeting was postponed to next Tuesday at 10 AM.',
      'The room is available for the meeting right now.',
      'The meeting was canceled completely.'
    ]
  },
  {
    id: 2,
    skill: 'Grammar',
    prompt: 'Escolha a opção que completa a frase corretamente:',
    context: 'If we _____ the project deadline, the client would have been fully satisfied.',
    options: [
      'had not missed',
      'didn\'t missed',
      'haven\'t missed',
      'would not miss'
    ]
  },
  {
    id: 3,
    skill: 'Speaking',
    prompt: 'Pressione o microfone e responda em voz alta (mínimo 5 segundos):',
    context: '"Describe your daily routine or your current professional goals in 2 sentences."'
  }
];

export default function PlacementTest({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedDone, setRecordedDone] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const currentQ = SAMPLE_QUESTIONS[currentIdx];
  const progressPercent = ((currentIdx + 1) / SAMPLE_QUESTIONS.length) * 100;

  const handleNext = () => {
    if (currentIdx < SAMPLE_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setRecordedDone(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsPlayingAudio(false);
    setIsRecording(false);
    setRecordedDone(false);
    setIsCompleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020408]/90 backdrop-blur-2xl p-4 font-sans">
      
      {/* GLOW DE FUNDO */}
      <div className="absolute w-[600px] h-[300px] bg-purple-600/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="relative w-full max-w-2xl rounded-3xl bg-[#080C16] border border-purple-500/30 text-slate-100 shadow-2xl shadow-purple-950/60 overflow-hidden">
        
        {/* HEADER DA PROVA */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
              HAAS AI Placement Test • CEFR Assessment
            </span>
          </div>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-white transition-colors text-sm font-bold px-2 py-1"
          >
            ✕ Salir
          </button>
        </div>

        {/* BARRA DE PROGRESSO FLUIDA */}
        <div className="w-full bg-slate-900 h-1.5 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${isCompleted ? 100 : progressPercent}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {!isCompleted ? (
            <div className="space-y-6">
              
              {/* BADGE DA HABILIDADE & ETAPA */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 uppercase tracking-widest">
                  {currentQ.skill === 'Listening' && '🎧 Listening Evaluation'}
                  {currentQ.skill === 'Grammar' && '⚡ Grammar & Structure'}
                  {currentQ.skill === 'Speaking' && '🎙️ Phonetics & Fluency'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Pregunta <strong className="text-white">{currentIdx + 1}</strong> de {SAMPLE_QUESTIONS.length}
                </span>
              </div>

              {/* ENUNCIADO */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {currentQ.prompt}
                </h3>
              </div>

              {/* PLAYER DE ÁUDIO REATIVO (SE LISTENING) */}
              {currentQ.audioSample && (
                <div className="rounded-2xl bg-slate-950/80 p-5 border border-purple-500/20 flex items-center justify-between">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-xs font-bold shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      {isPlayingAudio ? (
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      ) : (
                        <path d="M8 5v14l11-7z" />
                      )}
                    </svg>
                    {isPlayingAudio ? 'Pausar Áudio IA' : 'Escuchar Muestra Vocal'}
                  </button>

                  {/* EQUALIZADOR ANIMADO */}
                  <div className="flex items-center gap-1.5 h-6">
                    {[40, 80, 50, 100, 60, 90, 40].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: isPlayingAudio ? `${h}%` : '20%' }}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlayingAudio ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CONTEXTO DA QUESTÃO */}
              {currentQ.context && currentQ.skill !== 'Listening' && (
                <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800 text-slate-300 text-xs sm:text-sm font-mono leading-relaxed">
                  {currentQ.context}
                </div>
              )}

              {/* MÓDULO MULTIPLA ESCOLHA */}
              {currentQ.options && (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                            isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </span>
                        {isSelected && <span className="text-purple-400 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MÓDULO SPEAKING (MICROFONE) */}
              {currentQ.skill === 'Speaking' && (
                <div className="space-y-4 pt-2">
                  <button
                    onClick={() => {
                      setIsRecording(true);
                      setTimeout(() => {
                        setIsRecording(false);
                        setRecordedDone(true);
                      }, 4000);
                    }}
                    className={`w-full py-8 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                      isRecording
                        ? 'bg-red-950/30 border-red-500 text-red-300 animate-pulse'
                        : recordedDone
                        ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 hover:border-purple-500/50 text-slate-300'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg ${
                      isRecording ? 'bg-red-600 text-white' : recordedDone ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
                    }`}>
                      🎙️
                    </div>
                    <span className="text-xs font-mono font-bold">
                      {isRecording ? 'Analizando Tono y Pronunciación...' : recordedDone ? 'Voz Capturada con Éxito ✓' : 'Haz clic para Grabar Respuesta'}
                    </span>
                  </button>
                </div>
              )}

              {/* BOTÃO NAVEGAÇÃO */}
              <div className="pt-4">
                <button
                  disabled={selectedOption === null && !recordedDone && currentQ.skill !== 'Listening'}
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 disabled:opacity-30 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-600/30 hover:opacity-95 transition-all"
                >
                  {currentIdx < SAMPLE_QUESTIONS.length - 1 ? 'Siguiente Pregunta →' : 'Finalizar Diagnóstico IA'}
                </button>
              </div>

            </div>
          ) : (
            /* RESULTADO DA PROVA DE NIVELAMENTO */
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 text-white font-black text-4xl shadow-2xl shadow-purple-600/40 border border-white/20">
                B2
              </div>

              <div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block mb-1">
                  Resultado Diagnóstico
                </span>
                <h3 className="text-2xl font-black text-white">Nivel Estimado: B2 Intermedio Alto</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 font-light leading-relaxed">
                  Posees buena comprensión auditiva y estructura sintáctica. La Mentora HAAS se enfocará en pulir tu vocabulario corporativo.
                </p>
              </div>

              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 font-mono text-xs space-y-2 text-left">
                <div className="flex justify-between"><span className="text-slate-400">Comprensión Auditiva</span><span className="text-cyan-400 font-bold">88%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Gramática y Sintaxis</span><span className="text-purple-400 font-bold">82%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Fluidez Fonética</span><span className="text-emerald-400 font-bold">85%</span></div>
              </div>

              <a
                href="/portal-aluno"
                className="inline-block w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-600/30 hover:opacity-95 transition-all"
              >
                Iniciar Mis 7 Días Gratis en Nivel B2 →
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
