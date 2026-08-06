"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Volume2, Mic, Square, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, LogIn } from "lucide-react";

export default function DiagnosticoPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [idioma, setIdioma] = useState("");
  const [motivo, setMotivo] = useState("");
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);
  
  const [textoResposta, setTextoResposta] = useState("");
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const frasesTeste = {
    ingles: {
      audioTexto: "Hello! Could you introduce yourself and tell me what you like to do in your free time?",
      escritaPrompt: "Describe en 1 o 2 frases en inglés cuál es tu mayor objetivo profesional hoy.",
      exemploPlaceholder: "I want to improve my English because..."
    },
    espanhol: {
      audioTexto: "¡Hola! ¿Podrías presentarte y decirme qué te gusta hacer en tu tiempo libre?",
      escritaPrompt: "Describe en 1 o 2 frases en español cuál es tu mayor objetivo profesional hoy.",
      exemploPlaceholder: "Quiero mejorar mi español porque..."
    },
    portugues: {
      audioTexto: "Olá! Você poderia se apresentar e me contar o que gosta de fazer no seu tempo livre?",
      escritaPrompt: "Describe en 1 o 2 frases cuál es tu mayor objetivo profesional hoy.",
      exemploPlaceholder: "Mi objetivo es..."
    }
  };

  const currentFrase = frasesTeste[idioma as keyof typeof frasesTeste] || frasesTeste.ingles;

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    const utterance = new SpeechSynthesisUtterance(currentFrase.audioTexto);
    utterance.lang = idioma === 'espanhol' ? 'es-ES' : idioma === 'portugues' ? 'pt-BR' : 'en-US';
    utterance.onend = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setAudioRecorded(true);
    } else {
      setIsRecording(true);
    }
  };

  const handleFinalizarProva = () => {
    setStep(5);
    setTimeout(() => {
      setStep(6);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl z-10 flex flex-col items-center">
        
        {/* CABECERA SUPERIOR - MARCA HAAS LANGUAGE */}
        <div className="w-full flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="font-extrabold text-xl tracking-wider text-white">HAAS</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold uppercase tracking-widest">
              LANGUAGE
            </span>
          </div>

          <button 
            onClick={() => router.push('/login')}
            className="text-xs text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5 font-medium bg-slate-900/60 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-full"
          >
            <span>¿Ya tienes cuenta?</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1">
              Iniciar sesión <LogIn className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        {/* TARJETA PRINCIPAL */}
        <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
          
          <div className="w-full bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-500"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>

          {/* PASO 1: IDIOMA */}
          {step === 1 && (
            <div className="space-y-6 text-center animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                ¿Qué idioma deseas dominar?
              </h1>
              <p className="text-slate-400 text-sm">Selecciona un idioma para personalizar tu diagnóstico.</p>
              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { id: 'ingles', label: '🇬🇧 Inglés', desc: 'Fluidez global y negocios' },
                  { id: 'espanhol', label: '🇪🇸 Español', desc: 'Comunicación y mercado hispánico' },
                  { id: 'portugues', label: '🇧🇷 Portugués', desc: 'Para extranjeros y negocios' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setIdioma(item.id); setStep(2); }}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-lg text-slate-100 group-hover:text-indigo-400">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 2: MOTIVO */}
          {step === 2 && (
            <div className="space-y-6 text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-100">¿Cuál es tu objetivo principal?</h2>
              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  'Crecimiento Profesional / Carrera',
                  'Viajes e Inmersión Cultural',
                  'Exámenes de Certificación (TOEFL, DELE, etc.)',
                  'Práctica General y Conversación'
                ].map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setMotivo(m); setStep(3); }}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all text-left text-sm font-medium text-slate-200 hover:text-white"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 3: PARTE 1 - ESCUCHA Y PRONUNCIACIÓN */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                  Parte 1 de 2 • Escucha y Pronunciación
                </span>
                <h2 className="text-xl font-bold text-slate-100 pt-2">Escucha el audio y responde hablando</h2>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayAudio}
                    className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                  </button>
                  <div>
                    <p className="text-xs text-slate-400">Haz clic para escuchar el audio de la IA</p>
                    <p className="text-sm font-medium text-slate-200">Mensaje de Evaluación</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 text-center space-y-4">
                <p className="text-xs text-slate-400">Presiona para grabar tu respuesta oral</p>
                <button
                  onClick={handleToggleRecord}
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all shadow-xl ${
                    isRecording 
                      ? 'bg-rose-600 hover:bg-rose-500 animate-bounce shadow-rose-600/40' 
                      : audioRecorded 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' 
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  }`}
                >
                  {isRecording ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                </button>
                {isRecording && <p className="text-xs text-rose-400 font-semibold animate-pulse">Grabando... Habla con claridad</p>}
              </div>

              <button
                onClick={() => setStep(4)}
                className="w-full py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                Siguiente Etapa (Gramática) <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASO 4: PARTE 2 - GRAMÁTICA Y REDACCIÓN */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
                  Parte 2 de 2 • Gramática y Redacción
                </span>
                <h2 className="text-xl font-bold text-slate-100 pt-2">Responde por escrito</h2>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <p className="text-sm text-slate-300 font-medium">{currentFrase.escritaPrompt}</p>
              </div>

              <textarea
                rows={4}
                value={textoResposta}
                onChange={(e) => setTextoResposta(e.target.value)}
                placeholder={currentFrase.exemploPlaceholder}
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-600 focus:outline-none transition-all resize-none text-sm"
              />

              <button
                disabled={textoResposta.trim().length < 5}
                onClick={handleFinalizarProva}
                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                Finalizar Evaluación <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASO 5: CALCULANDO RESULTADO */}
          {step === 5 && (
            <div className="py-12 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-slate-100">Analizando pronunciación y gramática...</h3>
                <p className="text-xs text-slate-400 mt-1">La IA de Haas está estimando tu nivel de entrada.</p>
              </div>
            </div>
          )}

          {/* PASO 6: RESULTADO Y REGISTRO */}
          {step === 6 && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" /> ¡Diagnóstico Completado!
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-white">Nivel Estimado: B1 Intermedio</h2>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-left space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Crea tu cuenta para reclamar tus 150 XP y activar tus 7 días gratis:</p>
                
                <input 
                  type="text" 
                  placeholder="Tu Nombre Completo" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 outline-none"
                />
                <input 
                  type="email" 
                  placeholder="Tu Correo Electrónico" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 outline-none"
                />
                <input 
                  type="password" 
                  placeholder="Crea una Contraseña" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 outline-none"
                />

                <button 
                  onClick={() => router.push('/portal-aluno')}
                  className="w-full py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center gap-2 mt-2"
                >
                  <ShieldCheck className="w-5 h-5" /> Comenzar 7 Días Gratis en la Arena
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
