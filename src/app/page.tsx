'use client';

import React, { useState } from 'react';
import DiagnosticModal from './components/DiagnosticModal';

export default function LandingPage() {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. HEADER INSTITUCIONAL (GLASSMORPHISM) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 font-black text-white text-xl">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              HAAS <span className="text-orange-600">Escuela</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#metodo" className="hover:text-orange-600 transition-colors">Método</a>
            <a href="#programas" className="hover:text-orange-600 transition-colors">Programas</a>
            <a href="#plataforma" className="hover:text-orange-600 transition-colors">Plataforma IA</a>
            <a href="#testimonios" className="hover:text-orange-600 transition-colors">Testimonios</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/portal-aluno"
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors"
            >
              Acceso Estudiantes
            </a>
            <a
              href="/portal-aluno"
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-600/20 hover:bg-orange-500 transition-all"
            >
              7 Días Gratis
            </a>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION HÍBRIDA */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Coluna Esquerda: Texto + CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 border border-orange-200 px-4 py-1.5 text-xs font-bold text-orange-700">
                <span>✨ Plataforma EdTech de Idiomas</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Aprende <span className="text-orange-600">inglés, español y portugués</span> con IA y Profesores en Vivo
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Combina la empatía y guía de profesores certificados con la potencia de la Mentora Haas IA disponible las 24 horas para practicar sin límites.
              </p>

              {/* Botões Duplos */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href="/portal-aluno"
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-all"
                >
                  🚀 Probar 7 Días Gratis
                </a>

                <button
                  onClick={() => setIsDiagnosticOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-base font-bold text-cyan-400 border border-slate-800 hover:border-cyan-500 transition-all shadow-md"
                >
                  ⚡ Diagnóstico Express (2 min)
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">✓ Sin tarjeta de crédito</span>
                <span className="flex items-center gap-1.5">✓ Mentora IA 24/7</span>
                <span className="flex items-center gap-1.5">✓ Clases personalizadas</span>
              </div>
            </div>

            {/* Coluna Direita: Mockup Escuro do Dashboard/Arena */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-[#0B0E14] border border-slate-800 p-4 shadow-2xl shadow-slate-900/50">
                
                {/* Header do Mockup */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">campus.academiahaas.com</span>
                </div>

                {/* Conteúdo Simulado da Plataforma */}
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Bienvenido de vuelta,</p>
                      <p className="text-base font-bold text-white">Bruna Haas ✨</p>
                    </div>
                    <span className="rounded-lg bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-400 border border-orange-500/30">
                      5 DAYS STREAK 🔥
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-900/90 p-4 border border-cyan-500/30">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs">🤖</span>
                      <div>
                        <p className="text-xs font-bold text-cyan-400">Mentora Haas IA</p>
                        <p className="text-[11px] text-slate-300">"Good morning! Ready to level up your speaking skills today?"</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400">NIVEL TARGET</p>
                      <p className="text-sm font-bold text-white">Fluency C1</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400">ARENA DE PRÁCTICA</p>
                      <p className="text-sm font-bold text-emerald-400">24/7 Ilimitado</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. OS DOIS PILARES DO MÉTODO */}
      <section id="metodo" className="py-16 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">
              El Equilibrio Perfecto para tu Fluidez
            </h2>
            <p className="text-slate-600 mt-2">
              No solo estudias. Practicas, recibes retroalimentación inmediata y avanzas con confianza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pilar 1: Professores */}
            <div className="rounded-2xl bg-slate-50 p-8 border border-slate-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mb-4 font-bold">
                👨‍🏫
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Clases en Vivo con Profesores</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Guía humana personalizada, corrección cultural y sesiones conversacionales adaptadas a tus metas laborales e internacionales.
              </p>
              <ul className="text-xs font-semibold text-slate-700 space-y-2">
                <li>✓ Clases 1:1 o en grupos reducidos</li>
                <li>✓ Seguimiento y apoyo constante</li>
                <li>✓ Enfoque en conversación fluida</li>
              </ul>
            </div>

            {/* Pilar 2: IA & Gamificação */}
            <div className="rounded-2xl bg-[#0B0E14] p-8 border border-slate-800 text-white shadow-xl hover:shadow-2xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mb-4 font-bold border border-cyan-500/30">
                🤖
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mentora Haas IA 24/7</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Plataforma gamificada con análisis de pronunciación, lecciones interactivas y ejercicios ilimitados a cualquier hora del día.
              </p>
              <ul className="text-xs font-semibold text-cyan-300 space-y-2">
                <li>✓ Arena de práctica con feedback inmediato</li>
                <li>✓ Métricas de precisión gramatical y fonética</li>
                <li>✓ Racha de estudio y puntos de experiencia (XP)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VÍDEO DEMOSTRACIÓN (CARD ESCURO HIGHLIGHT) */}
      <section id="plataforma" className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl bg-[#0B0E14] border border-slate-800 p-8 lg:p-12 shadow-2xl relative overflow-hidden">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Experiencia Inmersiva</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                Mira la Plataforma en Acción
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Descubre cómo la Mentora IA y la Arena Gamificada transforman tu rutina de estudio.
              </p>
            </div>

            {/* Container do Player de Vídeo */}
            <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-orange-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform">
                  ▶
                </div>
                <p className="text-sm font-semibold text-slate-300">Haz clic para reproducir el video de demostración</p>
                <p className="text-xs text-slate-500 mt-1">Duración: 1:30 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NUESTROS PROGRAMAS (CARDS COM SELOS DE NÍVEL) */}
      <section id="programas" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Nuestros Cursos</h2>
            <p className="text-slate-600 mt-2">Programas estructurados desde nivel básico (A1) hasta avanzado (C1).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { lang: 'Inglés', desc: 'Clases prácticas, método probado y preparación para negocios/exámenes.', badge: 'A1 - C1' },
              { lang: 'Español', desc: 'Seguimiento constante, certificación y desarrollo de fluidez conversacional.', badge: 'A1 - C1' },
              { lang: 'Português', desc: 'Formación estructurada con enfoque en Brasil y entorno cotidiano/corporativo.', badge: 'A1 - C1' },
            ].map((course, idx) => (
              <div key={idx} className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{course.lang}</h3>
                  <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold text-cyan-400">
                    {course.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{course.desc}</p>
                <a
                  href="/portal-aluno"
                  className="inline-block w-full text-center py-2.5 rounded-xl border border-orange-600 text-orange-600 font-bold text-sm hover:bg-orange-600 hover:text-white transition-all"
                >
                  Ver Plan de Estudio →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BANNER DE CONVERSÃO 7 DÍAS GRATIS (SUBSTITUI PREÇOS) */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-amber-600 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">
            Comienza tu Prueba de 7 Días Totalmente Gratis
          </h2>
          <p className="text-base text-orange-100 max-w-2xl mx-auto">
            Accede a la Mentora IA, realiza el test de nivelación y explora las herramientas de la plataforma sin compromiso.
          </p>
          <div>
            <a
              href="/portal-aluno"
              className="inline-block rounded-2xl bg-slate-950 px-10 py-4 text-lg font-bold text-white shadow-2xl hover:bg-slate-900 transition-all"
            >
              🚀 Registrarme y Probar Gratis Ahora
            </a>
          </div>
        </div>
      </section>

      {/* 7. RODAPÉ INSTITUCIONAL */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-orange-600 font-black text-white text-xs">
              H
            </div>
            <span className="font-bold text-white">HAAS Escuela de Idiomas</span>
          </div>
          <p>© {new Date().getFullYear()} HAAS Escuela. Todos los derechos reservados.</p>
          <a href="/portal-aluno" className="hover:text-white transition-colors">Aviso de Privacidad</a>
        </div>
      </footer>

      {/* MODAL DE DIAGNÓSTICO EXPRESS */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />
    </div>
  );
}
