"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Plane, GraduationCap, Brain, ArrowRight, CheckCircle2, Sparkles, Lock, ArrowLeft } from "lucide-react";

export default function DiagnosticoExpressPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  // Estados dos dados coletados
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [studyReason, setStudyReason] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // Form de registro final
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const languages = [
    { id: "en", name: "Inglés", flag: "🇬🇧", desc: "Negocios, carrera e inmersión global" },
    { id: "pt", name: "Portugués", flag: "🇧🇷", desc: "Fluidez conversacional y profesional" },
    { id: "es", name: "Español", flag: "🇪🇸", desc: "Comunicación corporativa y cultural" },
  ];

  const reasons = [
    { id: "work", label: "Trabajo y Carrera", icon: Briefcase, desc: "Entrevistas, reuniones y ascenso laboral" },
    { id: "travel", label: "Viajes y Turismo", icon: Plane, desc: "Aeropuertos, hoteles y conversaciones reales" },
    { id: "study", label: "Estudios y Exámenes", icon: GraduationCap, desc: "Certificaciones e intercambios" },
    { id: "personal", label: "Desarrollo Personal", icon: Brain, desc: "Agilidad mental y superación personal" },
  ];

  // Preguntas de diagnóstico rápido
  const questions = [
    {
      q: "Selecciona la opción correcta para completar la frase: 'She ___ to the office every morning.'",
      options: ["go", "goes", "going", "gone"],
      correct: 1,
    },
    {
      q: "¿Cuál es la respuesta adecuada para: 'How long have you been working here?'",
      options: [
        "I work here since 2 years.",
        "I have been working here for 2 years.",
        "I am working here 2 years ago.",
        "I worked here since 2 years."
      ],
      correct: 1,
    },
    {
      q: "En un contexto profesional, ¿qué significa 'We need to reschedule the meeting'?",
      options: [
        "Debemos cancelar la reunión definitivamente.",
        "Debemos reprogramar la reunión para otra fecha/hora.",
        "Debemos resumir la reunión en un acta.",
        "Debemos iniciar la reunión de inmediato."
      ],
      correct: 1,
    },
  ];

  const handleSelectLanguage = (langId: string) => {
    setTargetLanguage(langId);
    setStep(2);
  };

  const handleSelectReason = (reasonId: string) => {
    setStudyReason(reasonId);
    setStep(3);
  };

  const handleAnswerQuestion = (index: number) => {
    if (index === questions[currentQuestion].correct) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setStep(4); // Pantalla de resultado
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Salva a intenção e redireciona para a Arena Gamificada
    try {
      localStorage.setItem("haas_target_lang", targetLanguage);
      localStorage.setItem("haas_study_reason", studyReason);
      localStorage.setItem("haas_diagnostic_score", score.toString());
      localStorage.setItem("haas_user_name", nombre);
    } catch (err) {}

    router.push("/portal-aluno");
  };

  const getNivelEstimado = () => {
    if (score === 3) return "B2 • Avanzado";
    if (score === 2) return "B1 • Intermedio";
    return "A2 • Elemental";
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Neon Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header com Logo / Botão de Voltar */}
      <div className="w-full max-w-xl flex items-center justify-between mb-6 z-10 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-purple-900/30">
            H
          </div>
          <span className="font-bold tracking-tight text-white text-sm">Academia Haas</span>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          ¿Ya tienes cuenta? <span className="font-semibold text-cyan-400 underline">Iniciar sesión</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-6 flex items-center justify-between px-1 z-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-500 ${
              i <= step ? "bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.4)]" : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-xl bg-[#0B0E17]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 shadow-purple-950/20">

        {/* PASO 1: SELECCIÓN DE IDIOMA */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">Paso 1 de 5</span>
              <h1 className="text-2xl md:text-3xl font-extrabold mt-1 text-white">¿Qué idioma deseas aprender?</h1>
              <p className="text-slate-400 text-sm mt-2">Selecciona tu objetivo principal para personalizar tu ruta.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleSelectLanguage(lang.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 transition-all text-left group cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{lang.name}</h3>
                    <p className="text-xs text-slate-400">{lang.desc}</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: MOTIVO DE ESTUDIO */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-semibold">Paso 2 de 5</span>
              <h1 className="text-2xl md:text-3xl font-extrabold mt-1 text-white">¿Cuál es tu motivo principal?</h1>
              <p className="text-slate-400 text-sm mt-2">Nuestra IA adaptará tus ejemplos e interacciones a este contexto.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reasons.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectReason(r.id)}
                    className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-800/80 transition-all text-left group cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">{r.label}</h3>
                      <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 3: DIAGNÓSTICO EXPRESS (3 PREGUNTAS) */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                  Diagnóstico • Pregunta {currentQuestion + 1} de {questions.length}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Prueba de Nivel Rápida</h2>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">
                {currentQuestion + 1}/3
              </div>
            </div>

            <p className="text-slate-200 text-base font-medium leading-relaxed bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              {questions[currentQuestion].q}
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerQuestion(idx)}
                  className="w-full text-left p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 transition-all text-slate-200 hover:text-white font-medium text-sm cursor-pointer"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 4: RESULTADO DE NIVEL + RECOMPENSA XP */}
        {step === 4 && (
          <div className="flex flex-col gap-6 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white mx-auto shadow-[0_0_25px_rgba(168,85,247,0.5)] animate-bounce">
              <Sparkles size={32} />
            </div>

            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">¡Diagnóstico Completado!</span>
              <h1 className="text-3xl font-black text-white mt-1">Tu nivel estimado es</h1>
              <div className="inline-block mt-3 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 text-purple-300 font-extrabold text-xl shadow-lg">
                {getNivelEstimado()}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between max-w-sm mx-auto w-full">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs text-slate-400 font-medium">Recompensa de Inicio</h4>
                  <p className="text-sm font-bold text-white">+150 XP Ganados</p>
                </div>
              </div>
              <CheckCircle2 size={20} className="text-emerald-400" />
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-base transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Reclamar mi Nivel y Mis 150 XP ➔
            </button>
          </div>
        )}

        {/* PASO 5: FORMULARIO DE REGISTRO */}
        {step === 5 && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="text-center">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">Paso Final</span>
              <h1 className="text-2xl font-extrabold text-white mt-1">Crea tu cuenta gratis</h1>
              <p className="text-slate-400 text-xs mt-1">Guarda tu progreso de {getNivelEstimado()} y activa tus 7 días sin costo.</p>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-base transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Crear Cuenta y Entrar a la Arena
            </button>

            <p className="text-[11px] text-slate-500 text-center mt-1">
              Al registrarte aceptas los Términos de Servicio y la Política de Privacidad de Academia Haas.
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
