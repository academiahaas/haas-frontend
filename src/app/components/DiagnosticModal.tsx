'use client';

import React, { useState } from 'react';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiagnosticModal({ isOpen, onClose }: DiagnosticModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'ingles' | 'espanol' | 'portugues'>('ingles');
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingDone, setSpeakingDone] = useState(false);
  const [writtenAnswer, setWrittenAnswer] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setAudioPlayed(false);
    setIsRecording(false);
    setSpeakingDone(false);
    setWrittenAnswer('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090C15] border border-purple-500/30 text-white shadow-2xl shadow-purple-900/30 overflow-hidden animate-fadeIn">
        
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-purple-500 animate-ping" />
            <span className="text-xs font-mono tracking-wider uppercase text-purple-400 font-semibold">
              HAAS AI Diagnostic Core v2.4
            </span>
          </div>
          <button 
            onClick={handleReset} 
            className="text-slate-400 hover:text-white transition-colors text-lg font-bold px-2"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Indicador de Progresso Tecnológico */}
          <div className="mb-6 grid grid-cols-3 gap-2">
            {[
              { id: 1, label: '01. Audio & Speaking' },
              { id: 2, label: '02. Reading & Writing' },
              { id: 3, label: '03. Matrix Result' },
            ].map((s) => (
              <div
                key={s.id}
                className={`py-2 px-3 rounded-lg text-[11px] font-mono border transition-all ${
                  step === s.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold shadow-sm shadow-purple-500/20'
                    : step > s.id
                    ? 'bg-slate-900/80 border-slate-800 text-slate-400'
                    : 'bg-slate-950 border-slate-900 text-slate-600'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>

          {/* Seleção de Idioma */}
          {step === 1 && (
            <div className="mb-6 flex gap-2">
              {(['ingles', 'espanol', 'portugues'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    selectedLanguage === lang
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {lang === 'ingles' ? 'English' : lang === 'espanol' ? 'Español' : 'Português'}
                </button>
              ))}
            </div>
          )}

          {/* ETAPA 1: SPEAKING & LISTENING */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="rounded-xl bg-slate-900/60 p-5 border border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-purple-400 font-semibold">AI Voice Sample</span>
                  <span className="text-[10px] text-slate-500">Neural Synthesis</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAudioPlayed(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl transition-all text-xs shadow-md shadow-purple-600/20"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Reproducir Audio IA
                  </button>
                  
                  {/* Waveform Animation */}
                  <div className="flex items-center gap-1 h-6">
                    {[40, 70, 30, 90, 50, 80, 40, 60, 30].map((height, i) => (
                      <span
                        key={i}
                        style={{ height: audioPlayed ? `${height}%` : '20%' }}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          audioPlayed ? 'bg-purple-400 animate-pulse' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/60 p-5 border border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-cyan-400 font-semibold">Speech Recognition Matrix</span>
                  <span className="text-[10px] text-slate-500">Real-time Analysis</span>
                </div>
                <button
                  onClick={() => {
                    setIsRecording(true);
                    setTimeout(() => {
                      setIsRecording(false);
                      setSpeakingDone(true);
                    }, 2500);
                  }}
                  className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold transition-all text-xs border ${
                    isRecording
                      ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                      : speakingDone
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 hover:border-purple-500/50 text-slate-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  {isRecording ? 'Analizando Frecuencia Vocal...' : speakingDone ? 'Captura Finalizada Con Éxito' : 'Iniciar Grabación de Respuesta'}
                </button>
              </div>

              <button
                disabled={!speakingDone}
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 disabled:opacity-30 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 text-xs tracking-wider uppercase"
              >
                Avanzar a Fase 02 →
              </button>
            </div>
          )}

          {/* ETAPA 2: READING & WRITING */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-xl bg-slate-900/60 p-5 border border-slate-800/80">
                <span className="text-xs font-mono text-purple-400 font-semibold block mb-2">Contextual Prompt</span>
                <p className="text-xs text-slate-300 italic mb-4 p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                  "In global business environments, adaptability and digital communication are essential skills for career expansion."
                </p>
                <label className="block text-[11px] text-slate-400 font-mono mb-1.5">Respuesta Escrita del Candidato:</label>
                <textarea
                  rows={3}
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  placeholder="Escribe tu análisis breve aquí..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                disabled={writtenAnswer.trim().length < 5}
                onClick={() => setStep(3)}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 disabled:opacity-30 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 text-xs tracking-wider uppercase"
              >
                Procesar Nivel con IA ⚡
              </button>
            </div>
          )}

          {/* ETAPA 3: RESULTADO */}
          {step === 3 && (
            <div className="text-center space-y-5 py-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 font-black text-3xl border border-purple-400/30">
                B1
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Nivel Estimado: B1 Intermedio</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Tu arquitectura sintáctica es sólida. La Mentora HAAS IA se enfocará en acelerar tu soltura de conversación.
                </p>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-left text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-purple-400">
                  <span>Accuracy Score</span>
                  <span>84%</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span>Fluency Index</span>
                  <span>78%</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Recommended Path</span>
                  <span>Module B1 + AI Arena</span>
                </div>
              </div>

              <a
                href="/portal-aluno"
                className="inline-block w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-purple-600/30 text-xs tracking-wider uppercase"
              >
                Activar Mis 7 Días Gratis en Nivel B1
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
