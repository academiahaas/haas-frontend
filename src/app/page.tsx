'use client';

import React, { useState, useEffect } from 'react';
import DiagnosticModal from './components/DiagnosticModal';

export default function LandingPage() {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedLanguageTab, setSelectedLanguageTab] = useState<'all' | 'ingles' | 'espanol' | 'portugues'>('all');

  const programs = [
    { id: 'ingles', title: 'Inglés General & Business', level: 'A1 - C1', desc: 'Dominio práctico con enfoque en reuniones internacionales, gramática aplicada y fluidez profesional.', tag: 'Popular' },
    { id: 'espanol', title: 'Español Conversacional', level: 'A1 - C1', desc: 'Formación estructurada para negocios y comunicación efectiva con la cultura hispana.', tag: 'Recomendado' },
    { id: 'portugues', title: 'Português Brasil & Europa', level: 'A1 - C1', desc: 'Enfoque comunicativo acelerado para viajes, oportunidades laborales e integración cultural.', tag: 'Intensivo' },
  ];

  const filteredPrograms = selectedLanguageTab === 'all' 
    ? programs 
    : programs.filter(p => p.id === selectedLanguageTab);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      
      {/* GLOW DE FUNDO GLOBAL */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-purple-900/20 via-indigo-800/10 to-cyan-500/10 blur-[160px] pointer-events-none rounded-full" />

      {/* 1. HEADER GLASSMORPHISM */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-[#030712]/80 backdrop-blur-2xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 font-black text-white text-xl shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              HAAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">Language</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            <a href="#video" className="hover:text-purple-400 transition-colors">Plataforma</a>
            <a href="#metodo" className="hover:text-purple-400 transition-colors">Metodología</a>
            <a href="#programas" className="hover:text-purple-400 transition-colors">Idiomas</a>
            <a href="#sobre" className="hover:text-purple-400 transition-colors">Nosotros</a>
            <a href="#testimonios" className="hover:text-purple-400 transition-colors">Testimonios</a>
            <a href="#contacto" className="hover:text-purple-400 transition-colors">Contacto</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="/login"
              className="text-xs font-mono font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Acceso Estudiantes
            </a>
            <a
              href="/diagnostico"
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-purple-600/20"
            >
              <div className="px-5 py-2.5 rounded-[11px] bg-[#030712] group-hover:bg-transparent transition-all duration-300">
                <span className="text-xs font-bold text-white uppercase tracking-wider">7 Días Gratis</span>
              </div>
            </a>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
            aria-label="Abrir Menú"
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

        {/* MENU MOBILE */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#080C16] px-6 py-6 space-y-4 animate-fadeIn">
            <a href="#video" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-mono text-slate-300 hover:text-purple-400">Plataforma</a>
            <a href="#metodo" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-mono text-slate-300 hover:text-purple-400">Metodología</a>
            <a href="#programas" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-mono text-slate-300 hover:text-purple-400">Idiomas</a>
            <a href="#sobre" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-mono text-slate-300 hover:text-purple-400">Sobre Nosotros</a>
            <a href="#testimonios" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-mono text-slate-300 hover:text-purple-400">Testimonios</a>
            <a href="#contacto" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-mono text-slate-300 hover:text-purple-400">Contacto</a>
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              <a href="/login" className="text-center py-2.5 rounded-xl border border-slate-700 text-xs font-mono font-bold text-slate-200">Acceso Estudiantes</a>
              <a href="/diagnostico" className="text-center py-2.5 rounded-xl bg-purple-600 text-xs font-mono font-bold text-white">7 Días Gratis</a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 border border-purple-500/30 px-4 py-1.5 text-xs font-mono font-medium text-purple-300 shadow-inner">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Next-Gen Language Learning Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Aprende <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">inglés, español y portugués</span> con IA y Profesores en Vivo
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl font-light">
                Entrena tu fluidez con la precisión de la <strong className="text-slate-200 font-semibold">Mentora IA 24/7</strong> y perfecciona tu comunicación real con <strong className="text-slate-200 font-semibold">profesores certificados</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <a
                  href="/diagnostico"
                  className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 px-8 py-4 text-xs font-mono font-bold text-white shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.02] transition-all uppercase tracking-wider"
                >
                  <span>Probar 7 Días Gratis</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>

                <a
                  href="/diagnostico"
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900/80 px-6 py-4 text-xs font-mono font-bold text-cyan-300 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-lg"
                >
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Diagnóstico Express IA (2 min)</span>
                </a>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1.5"><strong className="text-purple-400">✓</strong> Acceso Ilimitado</span>
                <span className="flex items-center gap-1.5"><strong className="text-purple-400">✓</strong> Mentora IA 24/7</span>
                <span className="flex items-center gap-1.5"><strong className="text-purple-400">✓</strong> Retroalimentación en Vivo</span>
              </div>
            </div>

            {/* INTERACTIVE DASHBOARD PREVIEW CARD */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-[#080C16] border border-purple-500/20 p-6 shadow-2xl shadow-purple-950/50 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 tracking-wider">academiahaas.com</span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest">Módulo Activo</p>
                      <p className="text-sm font-bold text-white">B1 • Fluency & Business</p>
                    </div>
                    <span className="rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 px-3 py-1.5 text-xs font-mono font-bold text-purple-300 border border-purple-500/30">
                      Racha: 5 Días 🔥
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-4 border border-cyan-500/30 relative overflow-hidden">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 border border-cyan-500/40">
                        IA
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-cyan-400">Mentora Haas IA</p>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          "Good morning! Ready to analyze your speaking precision and accent today?"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 text-center">
                      <p className="text-[10px] font-mono text-slate-500 uppercase">Precisión Gramatical</p>
                      <p className="text-sm font-bold text-emerald-400">88% Accuracy</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 text-center">
                      <p className="text-[10px] font-mono text-slate-500 uppercase">Arena Gamificada</p>
                      <p className="text-sm font-bold text-purple-400">24/7 Disponible</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TOUR GUIADO DA PLATAFORMA (VÍDEO SHOWCASE) */}
      <section id="video" className="py-20 bg-[#060912] border-y border-slate-800/80 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest bg-purple-950/60 px-3.5 py-1.5 rounded-full border border-purple-800/40">
              Inmersión Tecnológica
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Conoce la Plataforma por Dentro
            </h2>
            <p className="text-slate-400 text-sm font-light">
              Descubre cómo la Mentora IA, la Arena Gamificada y las clases en vivo se integran en una sola interfaz.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-slate-900 to-[#080C16] border border-purple-500/30 p-2.5 shadow-2xl shadow-purple-950/80">
            <div className="relative aspect-video rounded-2xl bg-slate-950 flex flex-col items-center justify-center border border-slate-800/80 overflow-hidden group">
              
              {!isVideoPlaying ? (
                <div className="text-center p-8 relative z-10 space-y-4">
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 hover:scale-110 transition-all mx-auto border border-white/20 group"
                    aria-label="Reproducir Tour"
                  >
                    <svg className="w-8 h-8 translate-x-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <div>
                    <p className="text-base font-bold text-white">Reproducir Tour de la Plataforma</p>
                    <p className="text-xs font-mono text-purple-400 mt-1">Tour Guiado • 1:30 min</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full">
                  <iframe
                    className="w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Demostración HAAS Language"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOBRE NOSOTROS */}
      <section id="sobre" className="py-20 bg-[#030712]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">Educación de Alto Nivel</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Sobre HAAS Language
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base font-light">
                En <strong className="text-white">HAAS Language</strong> combinamos la empatía de profesores expertos con herramientas avanzadas de inteligencia artificial para acelerar tu proceso de aprendizaje.
              </p>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base font-light">
                Avanza a tu propio ritmo con evaluaciones automatizadas por módulo, retroalimentación fonética inmediata y certificación progresiva basada en el Marco Común Europeo (CEFR).
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-purple-500/30 transition-colors">
                  <div className="text-3xl font-black text-purple-400 mb-1">100%</div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Clases Online Globales</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-purple-500/30 transition-colors">
                  <div className="text-3xl font-black text-cyan-400 mb-1">24/7</div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Mentora IA Disponibilidad</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-purple-500/30 transition-colors">
                  <div className="text-3xl font-black text-indigo-400 mb-1">A1 - C1</div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Niveles Certificados</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-purple-500/30 transition-colors">
                  <div className="text-3xl font-black text-emerald-400 mb-1">Real-Time</div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Métricas de Progreso</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. METODOLOGÍA: DOS PILARES */}
      <section id="metodo" className="py-20 bg-[#060912] border-y border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-white">
              Dos Pilares Tecnológicos
            </h2>
            <p className="text-slate-400 text-sm font-light">
              Sincroniza la interacción humana con la práctica automatizada ilimitada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl bg-slate-900/50 p-8 border border-slate-800/80 hover:border-purple-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Profesores Certificados</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 font-light">
                Clases personalizadas 1:1 o en grupos pequeños. Práctica conversacional real, corrección cultural y acompañamiento pedagógico en cada etapa.
              </p>
              <ul className="text-xs font-mono text-slate-300 space-y-2">
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Clases 1:1 o grupos reducidos</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Horarios flexibles adaptados a tu agenda</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Feedback docente al finalizar cada nivel</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-slate-900/50 p-8 border border-cyan-500/30 hover:border-cyan-500/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 border border-cyan-500/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mentora Haas IA 24/7</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 font-light">
                Arena de práctica interactiva con análisis de pronunciación, lecciones de gramática adaptativa y métricas de racha diaria.
              </p>
              <ul className="text-xs font-mono text-cyan-300 space-y-2">
                <li className="flex items-center gap-2"><span>✓</span> Acceso ilimitado 24 horas al día</li>
                <li className="flex items-center gap-2"><span>✓</span> Evaluación instantánea de voz y síntesis</li>
                <li className="flex items-center gap-2"><span>✓</span> Registro de rachas y puntos XP acumulables</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROGRAMAS DE IDIOMAS */}
      <section id="programas" className="py-20 bg-[#030712]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Nuestros Cursos</h2>
            <p className="text-slate-400 text-sm font-light">Filtra por idioma y conoce el contenido de nuestros programas.</p>
            
            {/* TAB FILTER */}
            <div className="flex justify-center gap-2 pt-4">
              {[
                { id: 'all', label: 'Todos los Idiomas' },
                { id: 'ingles', label: 'Inglés' },
                { id: 'espanol', label: 'Español' },
                { id: 'portugues', label: 'Português' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedLanguageTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                    selectedLanguageTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPrograms.map((prog) => (
              <div key={prog.id} className="rounded-3xl bg-slate-900/60 p-6 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{prog.title}</h3>
                    <span className="rounded-md bg-purple-600/20 px-2.5 py-1 text-[11px] font-mono font-bold text-purple-300 border border-purple-500/30">
                      {prog.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-light">{prog.desc}</p>
                </div>
                <a
                  href="/diagnostico"
                  className="inline-block w-full text-center py-3 rounded-xl border border-purple-500/40 text-purple-300 font-mono font-bold text-xs hover:bg-purple-600 hover:text-white transition-all"
                >
                  Ver Plan de Estudio →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIOS */}
      <section id="testimonios" className="py-20 bg-[#060912] border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Historias de Éxito</h2>
            <p className="text-slate-400 text-sm font-light">Testimonios de alumnos que alcanzaron la fluidez con HAAS Language.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'María González',
                role: 'Estudiante de Inglés B2',
                comment: 'En 6 meses pasé de nivel básico a mantener reuniones internacionales. La práctica nocturna con la IA me dio la seguridad que me faltaba.',
                init: 'MG'
              },
              {
                name: 'Carlos Mendoza',
                role: 'Profesional / Business English',
                comment: 'Las sesiones 1:1 con profesores enfocadas en mi área de trabajo fueron la clave para asumir mi nuevo rol corporativo.',
                init: 'CM'
              },
              {
                name: 'Ana Silva',
                role: 'Estudiante de Portugués',
                comment: 'Aprender con flexibilidad me permitió preparar mi viaje a Brasil sin interrumpir mi trabajo diario. Excelente método.',
                init: 'AS'
              },
            ].map((t, idx) => (
              <div key={idx} className="rounded-3xl bg-slate-900/50 p-6 border border-slate-800 space-y-4">
                <div className="flex items-center gap-1 text-purple-400 text-xs">
                  ★ ★ ★ ★ ★
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic font-light">
                  "{t.comment}"
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center text-xs">
                    {t.init}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] font-mono text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SEÇÃO DE CONTACTO COMPLETA */}
      <section id="contacto" className="py-20 bg-[#030712] border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Inicia Tu Proceso</h2>
            <p className="text-slate-400 text-sm font-light">Ponte en contacto con nuestro equipo de admisiones.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  ✉
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Correo Electrónico</p>
                  <p className="text-xs font-bold text-white">contact@academiahaas.com</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  📞
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Teléfono / WhatsApp</p>
                  <p className="text-xs font-bold text-white">+57 323 9421071</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  🌐
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Modalidad</p>
                  <p className="text-xs font-bold text-white">Formación 100% Online Global</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={(e) => e.preventDefault()} className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white mb-2">Envíanos un Mensaje</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo *"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Idioma de interés (Inglés, Español, Portugués)"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                />
                <textarea
                  rows={4}
                  placeholder="Escribe tu mensaje u objetivos..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white font-mono font-bold rounded-xl shadow-lg shadow-purple-600/20 hover:opacity-95 transition-all text-xs tracking-wider uppercase"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER STRUCTURADO DE 4 COLUNAS */}
      <footer className="bg-[#02040A] text-slate-500 py-16 border-t border-slate-800/80 text-xs font-mono">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 font-black text-white text-sm">
                H
              </div>
              <span className="font-bold text-white text-sm tracking-tight">HAAS Language</span>
            </div>
            <p className="text-slate-500 leading-relaxed font-sans text-xs">
              Educación de idiomas de alto nivel combinando profesores calificados con tecnología de inteligencia artificial.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Navegación</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Inicio</a></li>
              <li><a href="#video" className="hover:text-purple-400 transition-colors">Plataforma IA</a></li>
              <li><a href="#metodo" className="hover:text-purple-400 transition-colors">Metodología</a></li>
              <li><a href="#programas" className="hover:text-purple-400 transition-colors">Idiomas</a></li>
              <li><a href="#sobre" className="hover:text-purple-400 transition-colors">Sobre Nosotros</a></li>
              <li><a href="#contacto" className="hover:text-purple-400 transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Cursos & Diagnóstico</h4>
            <ul className="space-y-2.5">
              <li><a href="#programas" className="hover:text-purple-400 transition-colors">Inglés General & Business</a></li>
              <li><a href="#programas" className="hover:text-purple-400 transition-colors">Español Conversacional</a></li>
              <li><a href="#programas" className="hover:text-purple-400 transition-colors">Português Brasil & Europa</a></li>
              <li><button onClick={() => setIsDiagnosticOpen(true)} className="hover:text-purple-400 transition-colors text-left">Diagnóstico Express IA</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Contacto Directo</h4>
            <p className="text-slate-400 mb-1">contact@academiahaas.com</p>
            <p className="text-slate-400 mb-1">+57 323 9421071</p>
            <p className="text-slate-600 mt-3">Atención online 24/7</p>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-6 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} HAAS Language. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="/diagnostico" className="hover:text-white transition-colors">Términos de Servicio</a>
            <a href="/diagnostico" className="hover:text-white transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </footer>

      {/* MODAL DE DIAGNÓSTICO */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />
    </div>
  );
}
