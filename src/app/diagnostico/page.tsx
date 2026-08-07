"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Volume2, Mic, Square, Sparkles, ArrowRight, ShieldCheck, LogIn, BookOpen } from "lucide-react";

function DiagnosticoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [idioma, setIdioma] = useState("");
  const [motivo, setMotivo] = useState("");
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);
  
  const [textoResposta, setTextoResposta] = useState("");
  const [resultadoIA, setResultadoIA] = useState<any>(null);
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    const langParam = searchParams.get("idioma");
    if (langParam && ["ingles", "espanhol", "portugues"].includes(langParam)) {
      setIdioma(langParam);
      setStep(2);
    }
  }, [searchParams]);

  const conteudoDiagnostico = {
    portugues: {
      audioTexto: "Embora o projeto tenha sido aprovado na reunião de ontem, a diretoria exigiu que nós refizéssemos o orçamento até o fim da tarde. Caso a equipe não consiga alinhar os prazos a tempo, haverá necessidade de adiar o lançamento, o que traria prejuízos financeiros significativos para a empresa.",
      audioUrl: "https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/audios_curso/Audios_nivelamento/listening_portuguese.mp3",
      speakingPrompt: "Resuma o principal problema mencionado no áudio e dê sua opinião: a equipe deve trabalhar até mais tarde para cumprir o prazo ou negociar o adiamento do lançamento? Justifique.",
      readingTexto: "A contratação do novo gerente gerou grande expectativa, pois seu currículo era tido como impecável. No entanto, ao assumir o departamento, ficou claro que sua conduta destoava do ambiente corporativo sobriedade. Ele costumava se desentender com a equipe por detalhes insignificantes, criando um clima de desconfiança. O ápice do impasse ocorreu quando ele contestou publicamente uma decisão da diretoria, levando a sua posterior exoneração.",
      writingPrompt: "Escreva um parágrafo (de 80 a 120 palavras) analisando por que a contratação do gerente não foi bem-sucedida. Diferencie a conduta do profissional das expectativas da empresa.",
      placeholder: "Analisando o caso do novo gerente, percebe-se que..."
    },
    espanhol: {
      audioTexto: "Todavía no hemos logrado acordar los términos del contrato con los proveedores. Aunque la propuesta inicial parecía bastante ventajosa, nos dimos cuenta de que los plazos de entrega no eran los adecuados. Por lo tanto, le pediremos al equipo legal que revise las cláusulas antes de tomar una decisión definitiva.",
      audioUrl: "https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/audios_curso/Audios_nivelamento/listening_spanish.mp3",
      speakingPrompt: "Explique brevemente por qué no se firmó el contrato todavía. Luego, hable sobre qué factores considera más importantes al negociar con un proveedor.",
      readingTexto: "El taller de formación técnica resultó ser muy distinto de lo que los empleados esperaban. Aunque el folleto anunciaba un evento dinámico, la jornada fue larga y pesada. Sin embargo, lo más llamativo no fue la falta de organización, sino el hecho de que el ponente lograra captar la atención de la audiencia en los últimos minutos con una propuesta sumamente novedosa sobre innovación digital.",
      writingPrompt: "Redacte un texto breve (entre 80 y 120 palabras) evaluando el evento mencionado. Explique qué aspectos negativos se presentaron y por qué no fue un fracaso absoluto.",
      placeholder: "En relación con el taller de formación..."
    },
    ingles: {
      audioTexto: "Despite the initial setback with the software update, the development team managed to resolve the critical bugs before the official release. Had we not extended the testing phase last week, several major issues would have gone unnoticed, potentially harming our reputation with key clients.",
      audioUrl: "https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/audios_curso/Audios_nivelamento/listening_english.mp3",
      speakingPrompt: "Summarize what saved the software launch according to the audio. Then speak about whether companies should prioritize speed or quality when launching products.",
      readingTexto: "The transition to a hybrid work model has required organizations to fundamentally rethink their management strategies. While flexibility is widely praised by employees, managers often struggle to maintain team cohesion and monitor productivity without resorting to micromanagement. Striking the right balance requires clear communication channels, outcome-based evaluation, and a high degree of mutual trust.",
      writingPrompt: "Write a response (80–120 words) explaining the main challenge of the hybrid work model described in the text and outlining at least two measures management can implement.",
      placeholder: "Regarding the hybrid work model, the primary challenge lies in..."
    }
  };

  const currentConteudo = conteudoDiagnostico[idioma as keyof typeof conteudoDiagnostico] || conteudoDiagnostico.ingles;

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);

    if (currentConteudo.audioUrl) {
      const audio = new Audio(currentConteudo.audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play().catch(() => setIsPlayingAudio(false));
    } else {
      const utterance = new SpeechSynthesisUtterance(currentConteudo.audioTexto);
      utterance.lang = idioma === 'espanhol' ? 'es-ES' : idioma === 'portugues' ? 'pt-BR' : 'en-US';
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setAudioRecorded(true);
    } else {
      setIsRecording(true);
    }
  };

  const handleFinalizarProva = async () => {
    setStep(5);
    try {
      const response = await fetch("/api/ai/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idioma,
          motivo,
          textoResposta
        })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setResultadoIA(resData.data);
      }
    } catch (err) {
      console.error("Erro ao processar diagnóstico via Gemini:", err);
    } finally {
      setStep(6);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl z-10 flex flex-col items-center">
        
        {/* CABECERA SUPERIOR */}
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
                  { id: 'ingles', label: '🇬🇧 Inglés', desc: 'Global & Professional Standard' },
                  { id: 'espanhol', label: '🇪🇸 Español', desc: 'Especial para Brasileiros' },
                  { id: 'portugues', label: '🇧🇷 Português', desc: 'Especial para Hispanofalantes' }
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
                  'Exámenes de Certificación (TOEFL, DELE, CELPE-Bras)',
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

          {/* PASO 3: ESCUCHA Y PRONUNCIACIÓN (FASE 1) */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                  Fase 1 • Escucha y Habla
                </span>
                <h2 className="text-xl font-bold text-slate-100 pt-2">Escucha el audio y responde</h2>
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
                    <p className="text-xs text-slate-400">Audio HD de Evaluación</p>
                    <p className="text-sm font-medium text-slate-200">Audio del Test de Nivelación</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40">
                <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Pregunta de Habla / Speaking Prompt:</p>
                <p className="text-xs text-slate-200 leading-relaxed">{currentConteudo.speakingPrompt}</p>
              </div>

              <div className="p-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 text-center space-y-4">
                <p className="text-xs text-slate-400">Presione para grabar su respuesta oral</p>
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
                Siguiente Etapa (Fase 2) <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASO 4: LEITURA E ESCRITA (FASE 2) */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
                  Fase 2 • Lectura y Escritura
                </span>
                <h2 className="text-xl font-bold text-slate-100 pt-1">Lee el texto y responde por escrito</h2>
              </div>

              {/* TEXTO DE LEITURA */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" /> Texto de Lectura
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{currentConteudo.readingTexto}"
                </p>
              </div>

              {/* QUESTÃO DE ESCRITA */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs font-semibold text-slate-200">{currentConteudo.writingPrompt}</p>
              </div>

              <textarea
                rows={4}
                value={textoResposta}
                onChange={(e) => setTextoResposta(e.target.value)}
                placeholder={currentConteudo.placeholder}
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-600 focus:outline-none transition-all resize-none text-xs leading-relaxed"
              />

              <button
                disabled={textoResposta.trim().length < 10}
                onClick={handleFinalizarProva}
                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                Finalizar Evaluación <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASO 5: CALCULANDO RESULTADO COM GEMINI */}
          {step === 5 && (
            <div className="py-12 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-slate-100">HAAS AI Engine evaluando prueba...</h3>
                <p className="text-xs text-slate-400 mt-1">Analizando criterios gramaticales, vocabulario y estándar CEFR.</p>
              </div>
            </div>
          )}

          {/* PASO 6: RESULTADO DINÂMICO DA IA E REGISTRO */}
          {step === 6 && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" /> ¡Análisis HAAS AI Completado!
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-white">
                  Nivel Estimado: {resultadoIA?.nivel_cefr || "B1"}
                </h2>
                {resultadoIA?.pontuacao_total !== undefined && (
                  <p className="text-sm font-semibold text-indigo-400 mt-1">
                    Puntuación Total: {resultadoIA.pontuacao_total} / 100
                  </p>
                )}
              </div>

              {resultadoIA?.justificativa_nivel && (
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left text-xs text-slate-300 leading-relaxed space-y-2">
                  <span className="font-bold text-slate-100 block">Análisis de la IA:</span>
                  <p>{resultadoIA.justificativa_nivel}</p>
                  
                  {resultadoIA?.erros_portunhol_detectados?.length > 0 && (
                    <div className="pt-2 border-t border-slate-700">
                      <span className="font-bold text-rose-400 block mb-1">Puntos de Atención Detectados:</span>
                      <ul className="list-disc list-inside text-rose-300 space-y-0.5">
                        {resultadoIA.erros_portunhol_detectados.map((e: string, idx: number) => (
                          <li key={idx}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-left space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Crea tu cuenta para reclamar tus 150 XP y activar tus 7 días gratis:
                </p>
                
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

export default function DiagnosticoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Cargando diagnóstico...</div>}>
      <DiagnosticoContent />
    </Suspense>
  );
}
