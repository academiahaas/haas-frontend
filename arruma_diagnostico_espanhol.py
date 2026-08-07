code = ''''use client';

import React, { useState, useEffect } from 'react';
import { Play, Mic, CheckCircle, ArrowRight, Loader2, Sparkles, Volume2, BookOpen, ShieldCheck } from 'lucide-react';

export default function DiagnosticoPage() {
  const [idioma, setIdioma] = useState<'ES' | 'PT'>('ES');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    nivel: string;
    puntuacion: number;
    analisis: string;
  } | null>(null);

  // Formulário de Cadastro / Lead
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Detecta se há idioma preferencial ou padrão ES
    const savedLang = localStorage.getItem('haas_idioma');
    if (savedLang === 'PT' || savedLang === 'ES') {
      setIdioma(savedLang as 'ES' | 'PT');
    }
  }, []);

  // Dicionário de interface
  const t = {
    ES: {
      badgeFase1: "FASE 1 • ESCUCHA Y HABLA",
      tituloFase1: "Escucha el audio y responde",
      audioTag: "Audio HD de Evaluación (Supabase Storage)",
      audioTitle: "Audio del Test de Nivelación",
      speakingPromptTitle: "PREGUNTA DE HABLA / SPEAKING PROMPT:",
      micInstruction: "Presiona para grabar tu respuesta oral",
      micRecording: "Grabando respuesta oral...",
      micDone: "Respuesta grabada con éxito",
      btnFase1: "Siguiente Etapa (Fase 2)",

      badgeFase2: "FASE 2 • LECTURA Y ESCRITURA",
      tituloFase2: "Lee el texto y responde por escrito",
      readingTag: "TEXTO DE LECTURA",
      btnFase2: "Finalizar Evaluación",

      loadingTitle: "Gemini IA evaluando prueba...",
      loadingSub: "Analizando criterios gramaticales, vocabulario y estándar CEFR.",

      badgeResult: "¡Diagnóstico Gemini Completado!",
      nivelEstimado: "Nivel Estimado:",
      puntuacionTotal: "Puntuación Total:",
      analisisTitle: "Análisis de la IA:",
      formTitle: "CREA TU CUENTA PARA RECLAMAR TUS 150 XP Y ACTIVAR TUS 7 DÍAS GRATIS:",
      inputNombre: "Tu Nombre Completo",
      inputEmail: "Tu Correo Electrónico",
      inputPass: "Crea una Contraseña",
      btnSubmit: "Comenzar 7 Días Gratis en la Arena",
      alreadyAccount: "¿Ya tienes cuenta?",
      login: "Iniciar sesión"
    },
    PT: {
      badgeFase1: "FASE 1 • ESCUTA E FALA",
      tituloFase1: "Escute o áudio e responda",
      audioTag: "Áudio HD de Avaliação (Supabase Storage)",
      audioTitle: "Áudio do Teste de Nivelamento",
      speakingPromptTitle: "QUESTÃO DE FALA / SPEAKING PROMPT:",
      micInstruction: "Pressione para gravar sua resposta oral",
      micRecording: "Gravando resposta oral...",
      micDone: "Resposta gravada com sucesso",
      btnFase1: "Próxima Etapa (Fase 2)",

      badgeFase2: "FASE 2 • LEITURA E ESCRITA",
      tituloFase2: "Leia o texto e responda por escrito",
      readingTag: "TEXTO DE LEITURA",
      btnFase2: "Finalizar Avaliação",

      loadingTitle: "Gemini IA avaliando teste...",
      loadingSub: "Analisando critérios gramaticais, vocabulário e padrão CEFR.",

      badgeResult: "¡Diagnóstico Gemini Completado!",
      nivelEstimado: "Nível Estimado:",
      puntuacionTotal: "Pontuação Total:",
      analisisTitle: "Análise da IA:",
      formTitle: "CRIE SUA CONTA PARA RESGATAR SEUS 150 XP E ATIVAR SEUS 7 DIAS GRÁTIS:",
      inputNombre: "Seu Nome Completo",
      inputEmail: "Seu E-mail",
      inputPass: "Crie uma Senha",
      btnSubmit: "Começar 7 Dias Grátis na Arena",
      alreadyAccount: "Já tem uma conta?",
      login: "Fazer login"
    }
  }[idioma];

  const handleSimulateRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setRecordedAudio('audio_demo_recorded.wav');
    }, 3000);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setStep(3);

    // Simula chamada da IA do Gemini gerando resposta no idioma selecionado
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiResult({
        nivel: "B1",
        puntuacion: 78,
        analisis: idioma === 'ES' 
          ? "El candidato demuestra buena comprensión auditiva y estructura gramatical intermedia. Su fluidez verbal es clara con pequeños detalles de vocabulario a perfeccionar en el nivel B1."
          : "O candidato demonstra boa compreensão auditiva e estrutura gramatical intermediária. Sua fluência verbal é clara com pequenos detalhes de vocabulário a aprimorar no nível B1."
      });
      setStep(4);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      
      {/* Topbar Logo & Auth */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="font-black text-2xl tracking-wider bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            HAAS
          </span>
          <span className="text-[10px] font-mono uppercase bg-purple-950/80 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded-full tracking-widest">
            LANGUAGE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a href="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
            {t.alreadyAccount} <span className="text-indigo-400 font-semibold">{t.login} →</span>
          </a>
        </div>
      </div>

      {/* Card Principal da Prova */}
      <div className="w-full max-w-2xl bg-[#0B101D] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/20 relative overflow-hidden">
        
        {/* Barra de Progresso */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-500"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>

        {/* FASE 1: ESCUTA E FALA */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <span className="inline-block text-[11px] font-mono uppercase font-bold tracking-widest bg-purple-950/60 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full mb-3">
                {t.badgeFase1}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {t.tituloFase1}
              </h2>
            </div>

            {/* Audio Player Card */}
            <div className="bg-[#111728] border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <button 
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <div>
                <p className="text-[10px] font-mono text-slate-400">{t.audioTag}</p>
                <p className="text-sm font-bold text-slate-200">{t.audioTitle}</p>
              </div>
            </div>

            {/* Prompt de Fala em Inglês (Manter em Inglês por ser o teste) */}
            <div className="bg-[#111728] border border-slate-800/80 rounded-2xl p-5 space-y-2">
              <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
                {t.speakingPromptTitle}
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                Summarize what saved the software launch according to the audio. Then speak about whether companies should prioritize speed or quality when launching products.
              </p>
            </div>

            {/* Botão de Gravação de Voz */}
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-[#080D18]/50">
              <p className="text-xs text-slate-400 font-medium">
                {isRecording ? t.micRecording : recordedAudio ? t.micDone : t.micInstruction}
              </p>

              <button
                onClick={handleSimulateRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-400 animate-pulse'
                    : recordedAudio
                    ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30'
                }`}
              >
                <Mic className="w-7 h-7" />
              </button>
            </div>

            {/* Botão para Avançar */}
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wider"
            >
              {t.btnFase1} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* FASE 2: LEITURA E ESCRITA */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <span className="inline-block text-[11px] font-mono uppercase font-bold tracking-widest bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded-full mb-3">
                {t.badgeFase2}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {t.tituloFase2}
              </h2>
            </div>

            {/* Texto de Leitura em Inglês (Original da Prova) */}
            <div className="bg-[#111728] border border-slate-800/80 rounded-2xl p-5 space-y-2">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> {t.readingTag}
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic border-l-2 border-cyan-500/50 pl-3 my-2">
                "The transition to a hybrid work model has required organizations to fundamentally rethink their management strategies. While flexibility is widely praised by employees, managers often struggle to maintain team cohesion and monitor productivity without resorting to micromanagement. Striking the right balance requires clear communication channels, outcome-based evaluation, and a high degree of mutual trust."
              </p>
            </div>

            {/* Prompt da Pergunta de Escrita */}
            <div className="bg-[#111728] border border-slate-800/80 rounded-2xl p-4">
              <p className="text-xs text-slate-300 font-semibold mb-3">
                Write a response (80–120 words) explaining the main challenge of the hybrid work model described in the text and outlining at least two measures management can implement.
              </p>

              <textarea
                rows={4}
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="Regarding the hybrid work model, the primary challenge lies in..."
                className="w-full bg-[#080D18] border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* Botão Finalizar */}
            <button
              onClick={handleAnalyze}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wider"
            >
              {t.btnFase2} <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* FASE 3: CARREGAMENTO DA IA */}
        {step === 3 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            <h3 className="text-lg font-bold text-white tracking-wide">{t.loadingTitle}</h3>
            <p className="text-xs text-slate-400 max-w-sm">{t.loadingSub}</p>
          </div>
        )}

        {/* FASE 4: RESULTADO E FORMULÁRIO DE LEAD */}
        {step === 4 && aiResult && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold tracking-widest bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> {t.badgeResult}
              </span>

              <h2 className="text-3xl font-black text-white tracking-tight">
                {t.nivelEstimado} <span className="text-cyan-400">{aiResult.nivel}</span>
              </h2>

              <p className="text-xs font-mono text-purple-400">
                {t.puntuacionTotal} {aiResult.puntuacion} / 100
              </p>
            </div>

            {/* Análise da IA */}
            <div className="bg-[#111728] border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-purple-400 block mb-1">{t.analisisTitle}</span>
              {aiResult.analisis}
            </div>

            {/* Formulário de Cadastro */}
            <div className="bg-[#080D18] border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <p className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                {t.formTitle}
              </p>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={t.inputNombre}
                className="w-full bg-[#111728] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.inputEmail}
                className="w-full bg-[#111728] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.inputPass}
                className="w-full bg-[#111728] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
              />

              <a
                href="/portal-aluno"
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:opacity-95 text-white font-bold rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
              >
                <ShieldCheck className="w-4 h-4" /> {t.btnSubmit}
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
''''

with open('src/app/diagnostico/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("\n✅ Diagnóstico totalmente adaptado e traduzido para Espanhol com suporte dinâmico!\n")
