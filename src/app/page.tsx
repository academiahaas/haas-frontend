'use client';

import React, { useState } from 'react';
import DiagnosticModal from './components/DiagnosticModal';

export default function LandingPage() {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* 1. HEADER INSTITUCIONAL CLEAN */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#07090E]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          <a href="#" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 font-black text-white text-xl shadow-lg shadow-purple-600/30">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
              HAAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Language</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a href="#video" className="hover:text-purple-400 transition-colors">Plataforma</a>
            <a href="#metodo" className="hover:text-purple-400 transition-colors">Metodología</a>
            <a href="#programas" className="hover:text-purple-400 transition-colors">Idiomas</a>
            <a href="#sobre" className="hover:text-purple-400 transition-colors">Sobre Nosotros</a>
            <a href="#testimonios" className="hover:text-purple-400 transition-colors">Testimonios</a>
            <a href="#contacto" className="hover:text-purple-400 transition-colors">Contacto</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="/portal-aluno"
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Acceso Estudiantes
            </a>
            <a
              href="/portal-aluno"
              className="rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all uppercase tracking-wider"
            >
              7 Días Gratis
            </a>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#0B0E17] px-6 py-6 space-y-4">
            <a href="#video" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-purple-400">Plataforma</a>
            <a href="#metodo" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-purple-400">Metodología</a>
            <a href="#programas" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-purple-400">Idiomas</a>
            <a href="#sobre" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-purple-400">Sobre Nosotros</a>
            <a href="#testimonios" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-purple-400">Testimonios</a>
            <a href="#contacto" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-slate-300 hover:text-purple-400">Contacto</a>
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              <a href="/portal-aluno" className="text-center py-2.5 rounded-xl border border-slate-700 text-sm font-bold text-slate-200">Acceso Estudiantes</a>
              <a href="/portal-aluno" className="text-center py-2.5 rounded-xl bg-purple-600 text-sm font-bold text-white">7 Días Gratis</a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-purple-600/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-950/60 border border-purple-500/30 px-4 py-1.5 text-xs font-mono font-semibold text-purple-300">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                <span>Ecosistema de Idiomas EdTech</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                Aprende <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">inglés, español y portugués</span> con IA y Profesores en Vivo
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                En <strong className="text-white">HAAS Language</strong> combinamos la precisión de nuestra Mentora IA 24/7 con la guía humana de profesores certificados.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href="/portal-aluno"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-purple-600/30 hover:opacity-95 transition-all tracking-wide uppercase"
                >
                  Probar 7 Días Gratis
                </a>

                <button
                  onClick={() => setIsDiagnosticOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900/90 px-6 py-4 text-sm font-bold text-purple-300 border border-purple-500/30 hover:border-purple-400 transition-all shadow-md shadow-purple-950/50"
                >
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Diagnóstico Express IA (2 min)
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-slate-400 font-mono">
                <span>✓ Acceso Inmediato</span>
                <span>✓ Mentora IA 24/7</span>
                <span>✓ Feedback en Vivo</span>
              </div>
            </div>

            {/* Dashboard Mockup Reestilizado (Sem nome pessoal) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-[#0C0F1A] border border-purple-500/20 p-5 shadow-2xl shadow-purple-950/40">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  </div>
                  <span className="text-[11px] font-mono text-purple-400">campus.academiahaas.com</span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-purple-400 uppercase font-mono tracking-wider">Módulo Activo</p>
                      <p className="text-sm font-bold text-white">B1 • Fluency & Business</p>
                    </div>
                    <span className="rounded-lg bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">
                      Racha: 5 Días 🔥
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-900/80 p-4 border border-purple-500/30">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/40">
                        IA
                      </div>
                      <div>
                        <p className="text-xs font-bold text-purple-300">Mentora Haas IA</p>
                        <p className="text-xs text-slate-300 mt-1">
                          "Good morning! Ready to level up your speaking skills today?"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. VÍDEO DA PLATAFORMA */}
      <section id="video" className="py-20 bg-[#0B0E17] border-y border-purple-900/20 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/40">
              Inmersión Tecnológica
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Conoce Nuestra Plataforma en Acción
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Mira cómo la inteligencia artificial y la gamificación aceleran el aprendizaje de nuestros alumnos.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto rounded-3xl bg-[#080B13] border border-purple-500/30 p-2 shadow-2xl shadow-purple-950/60 overflow-hidden">
            <div className="relative aspect-video rounded-2xl bg-slate-950 flex flex-col items-center justify-center border border-slate-800/80 overflow-hidden group">
              
              {!isVideoPlaying ? (
                <div className="text-center p-8 relative z-10 space-y-4">
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-2xl shadow-purple-600/50 hover:scale-110 transition-all mx-auto border border-purple-400/40"
                    aria-label="Reproducir Video"
                  >
                    <svg className="w-8 h-8 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <div>
                    <p className="text-base font-bold text-white">Haz clic para reproducir la demostración</p>
                    <p className="text-xs font-mono text-purple-400 mt-1">Tour Guiado • 1:30 min</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-300 p-8">
                  <iframe
                    className="w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Demostración HAAS Language"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOBRE NOSOTROS */}
      <section id="sobre" className="py-20 bg-[#07090E]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">Nuestra Propuesta</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Sobre HAAS Language
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                En <strong>HAAS Language</strong> unimos la calidez docente con la velocidad de la inteligencia artificial. Nuestra meta es romper con las clases pasivas tradicionales y ofrecer práctica continua adaptada al ritmo de cada alumno.
              </p>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Cada módulo incluye métricas de desempeño detalladas para que midas tu precisión gramatical, fluidez y fonética en tiempo real.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-3xl font-black text-purple-400 mb-1">100%</div>
                  <div className="text-xs text-slate-400 font-semibold">Online Global</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-3xl font-black text-indigo-400 mb-1">24/7</div>
                  <div className="text-xs text-slate-400 font-semibold">Mentora IA</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-3xl font-black text-indigo-400 mb-1">A1-C1</div>
                  <div className="text-xs text-slate-400 font-semibold">Niveles CEFR</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-3xl font-black text-purple-400 mb-1">+1 Año</div>
                  <div className="text-xs text-slate-400 font-semibold">Plataforma Activa</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. METODOLOGÍA */}
      <section id="metodo" className="py-20 bg-[#0B0E17]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">
              Dos Pilares Tecnológicos
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Combina mentoría humana en vivo con práctica automatizada en la plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-slate-900/70 p-8 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Profesores Certificados</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Clases 1:1 o en grupos reducidos con foco conversacional e integración de cultura del idioma.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 p-8 border border-purple-500/30">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Mentora Haas IA 24/7</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Arena de práctica interactiva con retroalimentación inmediata, racha de estudio y puntos de experiencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROGRAMAS */}
      <section id="programas" className="py-20 bg-[#07090E]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Nuestros Cursos</h2>
            <p className="text-slate-400 text-sm mt-2">Formación desde nivel A1 hasta C1.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Inglés', desc: 'Inglés general, de negocios (Business) y preparación para exámenes internacionales.', badge: 'A1 - C1' },
              { title: 'Español', desc: 'Español conversacional, cultura hispana y gramática práctica para profesionales.', badge: 'A1 - C1' },
              { title: 'Português', desc: 'Portugués brasileño y europeo para viajes, trabajo e integración cultural.', badge: 'A1 - C1' },
            ].map((prog, i) => (
              <div key={i} className="rounded-2xl bg-slate-900/80 p-6 border border-slate-800 hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{prog.title}</h3>
                  <span className="rounded-md bg-purple-600/20 px-2.5 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">
                    {prog.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{prog.desc}</p>
                <a
                  href="/portal-aluno"
                  className="inline-block w-full text-center py-2.5 rounded-xl border border-purple-500/50 text-purple-300 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all"
                >
                  Ver Plan de Estudio →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIOS */}
      <section id="testimonios" className="py-20 bg-[#0B0E17]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Historias de Éxito</h2>
            <p className="text-slate-400 text-sm mt-2">Lo que dicen nuestros alumnos sobre HAAS Language.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'María González',
                role: 'Estudiante de Inglés',
                comment: 'En 6 meses pasé de nivel básico a mantener conversaciones fluidas. La práctica nocturna con la IA marca la diferencia.',
                init: 'MG'
              },
              {
                name: 'Carlos Mendoza',
                role: 'Profesional / Business English',
                comment: 'Las sesiones enfocadas en reuniones me permitieron liderar proyectos internacionales con confianza.',
                init: 'CM'
              },
              {
                name: 'Ana Silva',
                role: 'Estudiante de Portugués',
                comment: 'Aprender con flexibilidad me permitió preparar mi viaje a Brasil sin descuidar mi trabajo.',
                init: 'AS'
              },
            ].map((t, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-900/80 p-6 border border-slate-800 space-y-4">
                <div className="flex items-center gap-1 text-purple-400 text-xs">
                  ★ ★ ★ ★ ★
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{t.comment}"
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center text-xs">
                    {t.init}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CONTACTO */}
      <section id="contacto" className="py-20 bg-[#07090E] border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Contacto Directo</h2>
            <p className="text-slate-400 text-sm mt-2">Resolvemos tus dudas sobre programas y admisiones.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  ✉
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Correo Electrónico</p>
                  <p className="text-xs font-bold text-white">info@academiahaas.com</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  📞
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Teléfono / WhatsApp</p>
                  <p className="text-xs font-bold text-white">+57 323 9421071</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={(e) => e.preventDefault()} className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white mb-2">Envíanos un Mensaje</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Mensaje..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 hover:opacity-95 transition-all text-xs tracking-wider uppercase"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER COMPLETO E ESTRUTURADO (4 COLUNAS) */}
      <footer className="bg-[#04060A] text-slate-400 py-16 border-t border-slate-800/80 text-xs">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 font-black text-white text-sm">
                H
              </div>
              <span className="font-bold text-white text-base">HAAS Language</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Educación de idiomas de alto nivel combinando profesores calificados con tecnología de inteligencia artificial.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Navegación</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Inicio</a></li>
              <li><a href="#video" className="hover:text-purple-400 transition-colors">Plataforma IA</a></li>
              <li><a href="#metodo" className="hover:text-purple-400 transition-colors">Metodología</a></li>
              <li><a href="#programas" className="hover:text-purple-400 transition-colors">Idiomas</a></li>
              <li><a href="#sobre" className="hover:text-purple-400 transition-colors">Sobre Nosotros</a></li>
              <li><a href="#contacto" className="hover:text-purple-400 transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Cursos & Diagnóstico</h4>
            <ul className="space-y-2">
              <li><a href="#programas" className="hover:text-purple-400 transition-colors">Inglés General & Business</a></li>
              <li><a href="#programas" className="hover:text-purple-400 transition-colors">Español Conversacional</a></li>
              <li><a href="#programas" className="hover:text-purple-400 transition-colors">Português Brasil & Europa</a></li>
              <li><button onClick={() => setIsDiagnosticOpen(true)} className="hover:text-purple-400 transition-colors text-left">Diagnóstico Express IA</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Contacto Directo</h4>
            <p className="text-slate-300 mb-1">info@academiahaas.com</p>
            <p className="text-slate-300 mb-1">+57 323 9421071</p>
            <p className="text-slate-500 mt-3 font-mono">Atención online 24/7</p>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-6 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <p>© {new Date().getFullYear()} HAAS Language. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="/portal-aluno" className="hover:text-white transition-colors">Términos de Servicio</a>
            <a href="/portal-aluno" className="hover:text-white transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </footer>

      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />
    </div>
  );
}
