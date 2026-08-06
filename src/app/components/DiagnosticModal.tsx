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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0B0E14] border border-cyan-500/30 text-white shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-lg font-bold tracking-wide text-cyan-400">
              Diagnóstico Express de Nivelamento IA
            </h3>
          </div>
          <button 
            onClick={handleReset} 
            className="text-slate-400 hover:text-white transition-colors text-xl font-bold px-2"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Indicador de Progresso */}
          <div className="mb-6 flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className={step >= 1 ? "text-cyan-400 font-bold" : ""}>1. Audio & Speaking</span>
            <span className="text-slate-600">—</span>
            <span className={step >= 2 ? "text-cyan-400 font-bold" : ""}>2. Reading & Writing</span>
            <span className="text-slate-600">—</span>
            <span className={step === 3 ? "text-amber-400 font-bold" : ""}>3. Resultado IA</span>
          </div>

          {/* Seleção de Idioma (Se ainda no início) */}
          {step === 1 && (
            <div className="mb-6 flex gap-2">
              {(['ingles', 'espanol', 'portugues'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border ${
                    selectedLanguage === lang
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {lang === 'ingles' ? 'Inglés' : lang === 'espanol' ? 'Español' : 'Português'}
                </button>
              ))}
            </div>
          )}

          {/* ETAPA 1: SPEAKING / LISTENING */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800">
                <p className="text-xs text-cyan-400 font-semibold mb-2">Escucha la frase de la Mentora Haas IA:</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAudioPlayed(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all text-sm"
                  >
                    ▶ Reprodusir Áudio
                  </button>
                  <span className="text-xs text-slate-400">
                    {audioPlayed ? "✓ Audio reproducido" : "Haz clic para escuchar"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800">
                <p className="text-xs text-amber-400 font-semibold mb-2">Responde hablando (Mantén presionado para grabar):</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setIsRecording(true);
                      setTimeout(() => {
                        setIsRecording(false);
                        setSpeakingDone(true);
                      }, 2500);
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-2 font-bold rounded-lg transition-all text-sm ${
                      isRecording
                        ? 'bg-red-500 animate-pulse text-white'
                        : speakingDone
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {isRecording ? '🎙️ Analizando voz...' : speakingDone ? '✓ Respuesta Grabada' : '🎙️ Grabar Respuesta'}
                  </button>
                </div>
              </div>

              <button
                disabled={!speakingDone}
                onClick={() => setStep(2)}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
              >
                Continuar a la Parte 2 →
              </button>
            </div>
          )}

          {/* ETAPA 2: READING / WRITING */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800">
                <p className="text-xs text-cyan-400 font-semibold mb-2">Lee el texto y completa tu respuesta:</p>
                <p className="text-sm italic text-slate-300 mb-3">
                  "In global business settings, adaptability and communication are essential skills for professional growth."
                </p>
                <label className="block text-xs text-slate-400 mb-1">Escribe brevemente tu opinión en el idioma elegido:</label>
                <textarea
                  rows={3}
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <button
                disabled={writtenAnswer.trim().length < 5}
                onClick={() => setStep(3)}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all"
              >
                Analizar mi Nivel con IA ⚡
              </button>
            </div>
          )}

          {/* ETAPA 3: RESULTADO */}
          {step === 3 && (
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400 text-2xl font-bold">
                B1
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">¡Nivel Estimado: B1 Intermedio!</h4>
                <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
                  Tienes buena comprensión de lectura y fluidez básica. Tu precisión gramatical mejorará aceleradamente con la Mentora Haas IA.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 text-left text-xs space-y-2">
                <p className="text-cyan-400 font-semibold">Análisis de la Mentora IA:</p>
                <p className="text-slate-300">✓ Pronunciación y entonación: 82/100</p>
                <p className="text-slate-300">✓ Coherencia escrita: 88/100</p>
                <p className="text-slate-300">✓ Recomendación: Módulo B1 + Arena de Conversación</p>
              </div>

              <a
                href="/portal-aluno"
                className="inline-block w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/30"
              >
                🚀 Comenzar mis 7 Días Gratis en Nivel B1
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
