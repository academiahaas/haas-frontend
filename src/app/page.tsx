'use client';

import React, { useState, useEffect } from 'react';
import DiagnosticModal from './components/DiagnosticModal';

export default function LandingPage() {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [detectedLang, setDetectedLang] = useState('ES');

  // Detecção automática de idioma baseada no navegador/país
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userLang = navigator.language || (navigator as any).userLanguage || 'es';
      if (userLang.startsWith('pt')) setDetectedLang('PT');
      else if (userLang.startsWith('en')) setDetectedLang('EN');
      else setDetectedLang('ES');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 1. HEADER INSTITUCIONAL RESPONSIVO */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 font-black text-white text-xl shadow-lg shadow-blue-500/20">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              HAAS <span className="text-cyan-400">Language</span>
            </span>
          </a>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#metodo" className="hover:text-cyan-400 transition-colors">Metodología</a>
            <a href="#programas" className="hover:text-cyan-400 transition-colors">Idiomas</a>
            <a href="#sobre" className="hover:text-cyan-400 transition-colors">Sobre Nosotros</a>
            <a href="#testimonios" className="hover:text-cyan-400 transition-colors">Testimonios</a>
            <a href="#contacto" className="hover:text-cyan-400 transition-colors">Contacto</a>
          </nav>

          {/* Ações Desktop + Detecção de Idioma */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-900 border border-slate-800 rounded-md">
              🌐 {detectedLang}
            </span>
            <a
              href="/portal-aluno"
              className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              Acceso Estudiantes
            </a>
            <a
              href="/portal-aluno"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              7 Días Gratis
            </a>
          </div>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
            aria-label="Abrir menu"
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

        {/* Menu Retrátil Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#0F172A] px-6 py-6 space-y-4 animate-fadeIn">
            <a
              href="#metodo"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 hover:text-cyan-400"
            >
              Metodología
            </a>
            <a
              href="#programas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 hover:text-cyan-400"
            >
              Idiomas
            </a>
            <a
              href="#sobre"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 hover:text-cyan-400"
            >
              Sobre Nosotros
            </a>
            <a
              href="#testimonios"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 hover:text-cyan-400"
            >
              Testimonios
            </a>
            <a
              href="#contacto"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 hover:text-cyan-400"
            >
              Contacto
            </a>
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              <a
                href="/portal-aluno"
                className="text-center py-2.5 rounded-xl border border-slate-700 text-sm font-bold text-slate-200"
              >
                Acceso Estudiantes
              </a>
              <a
                href="/portal-aluno"
                className="text-center py-2.5 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md"
              >
                7 Días Gratis
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-950/80 border border-blue-500/30 px-4 py-1.5 text-xs font-bold text-cyan-400">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Ecosistema de Idiomas EdTech</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Aprende <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">inglés, español y portugués</span> con IA y Profesores en Vivo
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                En <strong className="text-white">HAAS Language</strong> combinamos la mentoría de docentes humanos calificados con una plataforma de inteligencia artificial disponible 24/7 para garantizar progreso medible.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href="/portal-aluno"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-all"
                >
                  Probar 7 Días Gratis
                </a>

                <button
                  onClick={() => setIsDiagnosticOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-base font-bold text-cyan-400 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Diagnóstico Express (2 min)
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-slate-400">
                <span>✓ Sin tarjeta de crédito</span>
                <span>✓ Mentora IA 24/7</span>
                <span>✓ Clases personalizadas</span>
              </div>
            </div>

            {/* Dashboard Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-[#0F172A] border border-slate-800 p-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-700" />
                    <span className="h-3 w-3 rounded-full bg-slate-700" />
                    <span className="h-3 w-3 rounded-full bg-slate-700" />
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">campus.academiahaas.com</span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-900 p-4 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Bienvenido de vuelta,</p>
                      <p className="text-base font-bold text-white">Estudiante HAAS</p>
                    </div>
                    <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
                      Racha: 5 Días 🔥
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-900 p-4 border border-cyan-500/30">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                        IA
                      </div>
                      <div>
                        <p className="text-xs font-bold text-cyan-400">Mentora Haas IA</p>
                        <p className="text-xs text-slate-300 mt-1">
                          "Ready to practice your business vocabulary today?"
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

      {/* 3. SOBRE NOSOTROS */}
      <section id="sobre" className="py-20 bg-[#0F172A] border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Nuestra Historia & Misión</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Sobre HAAS Language
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                En <strong>HAAS Language</strong> formamos comunicadores globales con programas diseñados para obtener resultados reales. Nuestro modelo combina la calidez y estructura de profesores expertos con tecnología educativa de vanguardia.
              </p>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Cada curso está estructurado por módulos con evaluaciones integradas, lo que permite medir el progreso en tiempo real y obtener certificaciones progresivas.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-1">100%</div>
                  <div className="text-xs text-slate-400 font-semibold">Clases Online & Flexibles</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-3xl font-black text-blue-400 mb-1">24/7</div>
                  <div className="text-xs text-slate-400 font-semibold">Plataforma con IA</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-3xl font-black text-blue-400 mb-1">A1-C1</div>
                  <div className="text-xs text-slate-400 font-semibold">Marco Común Europeo</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-1">+1 Año</div>
                  <div className="text-xs text-slate-400 font-semibold">Transformando Estudiantes</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. METODOLOGÍA (PILARES) */}
      <section id="metodo" className="py-20 bg-[#0B0F19]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">
              Dos Pilares, Un Solo Objetivo: Tu Fluidez
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Aprende con profesores en vivo y refuerza sin límites en la plataforma interactiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pilar Humano */}
            <div className="rounded-2xl bg-slate-900/80 p-8 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Profesores Certificados</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Sesiones en vivo individuais o grupales enfocadas en conversación real, corrección de pronunciación y orientación cultural.
              </p>
              <ul className="text-xs font-semibold text-slate-300 space-y-2">
                <li>✓ Clases 1:1 o grupos reducidos</li>
                <li>✓ Horarios adaptados a tu rutina</li>
                <li>✓ Feedback directo al terminar cada módulo</li>
              </ul>
            </div>

            {/* Pilar IA */}
            <div className="rounded-2xl bg-slate-900/80 p-8 border border-cyan-500/30 hover:border-cyan-500/60 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mentora Haas IA 24/7</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Entrena tus habilidades de hablar, escuchar, leer y escribir con retroalimentación instantánea a cualquier hora.
              </p>
              <ul className="text-xs font-semibold text-cyan-300 space-y-2">
                <li>✓ Práctica de conversación ilimitada</li>
                <li>✓ Análisis de precisión gramatical</li>
                <li>✓ Seguimiento automatizado de racha y puntos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROGRAMAS / IDIOMAS */}
      <section id="programas" className="py-20 bg-[#0F172A]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Nuestros Programas de Idiomas</h2>
            <p className="text-slate-400 text-sm mt-2">Formación desde nivel A1 hasta C1 con enfoque comunicativo práctico.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Inglés', desc: 'Inglés general, de negocios (Business) y preparación para exámenes internacionales.', badge: 'A1 - C1' },
              { title: 'Español', desc: 'Español conversacional, cultura hispana y gramática práctica para profesionales.', badge: 'A1 - C1' },
              { title: 'Português', desc: 'Portugués brasileño y europeo para viajes, trabajo e integración cultural.', badge: 'A1 - C1' },
            ].map((prog, i) => (
              <div key={i} className="rounded-2xl bg-slate-900 p-6 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{prog.title}</h3>
                  <span className="rounded-md bg-blue-600/20 px-2.5 py-1 text-xs font-bold text-cyan-400 border border-blue-500/30">
                    {prog.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{prog.desc}</p>
                <a
                  href="/portal-aluno"
                  className="inline-block w-full text-center py-2.5 rounded-xl border border-blue-500 text-cyan-400 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all"
                >
                  Ver Detalles →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIOS */}
      <section id="testimonios" className="py-20 bg-[#0B0F19]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Lo que Dicen Nuestros Estudiantes</h2>
            <p className="text-slate-400 text-sm mt-2">Historias reales de personas que lograron sus metas lingüísticas con HAAS Language.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'María González',
                role: 'Estudiante de Inglés',
                comment: 'En 6 meses pasé de nivel básico a mantener conversaciones fluidas en inglés. Las clases son súper dinámicas y la plataforma con IA me ayuda a practicar por las noches.',
                init: 'MG'
              },
              {
                name: 'Carlos Mendoza',
                role: 'Profesional / Business English',
                comment: 'Necesitaba inglés para mi trabajo y las clases de Business fueron perfectas. Ahora puedo participar en reuniones internacionales con total confianza.',
                init: 'CM'
              },
              {
                name: 'Ana Silva',
                role: 'Estudiante de Portugués',
                comment: 'Aprender portugués siempre fue mi sueño. Con clases personalizadas y un profesor paciente, ahora puedo viajar a Brasil sin ningún problema.',
                init: 'AS'
              },
            ].map((t, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-900 p-6 border border-slate-800 space-y-4">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ★ ★ ★ ★ ★
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{t.comment}"
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 text-cyan-400 font-bold flex items-center justify-center text-xs">
                    {t.init}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CONTACTO */}
      <section id="contacto" className="py-20 bg-[#0F172A] border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Inicia tu Formación</h2>
            <p className="text-slate-400 text-sm mt-2">Solicita información sobre nuestros programas o contáctanos directamente.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Cards de Información de Contacto */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                  ✉
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Correo Electrónico</p>
                  <p className="text-sm font-bold text-white">info@academiahaas.com</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                  📞
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Teléfono / WhatsApp</p>
                  <p className="text-sm font-bold text-white">+57 323 9421071</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                  📍
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Modalidad</p>
                  <p className="text-sm font-bold text-white">Clases 100% Online Global</p>
                </div>
              </div>
            </div>

            {/* Formulário de Mensagem */}
            <div className="lg:col-span-7">
              <form onSubmit={(e) => e.preventDefault()} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Envíanos un Mensaje</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nombre completo *</label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email *</label>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
                    <input
                      type="text"
                      placeholder="+57 ..."
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Idioma de interés</label>
                    <input
                      type="text"
                      placeholder="Ej: Inglés, Español..."
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Mensaje *</label>
                  <textarea
                    rows={4}
                    placeholder="Cuéntanos sobre tus objetivos de aprendizaje..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:opacity-95 transition-all text-sm"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FOOTER COMPLETO COM LINKS RÁPIDOS */}
      <footer className="bg-[#080B12] text-slate-400 py-16 border-t border-slate-800 text-xs">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-black text-white text-sm">
                H
              </div>
              <span className="font-bold text-white text-base">HAAS Language</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Educación de idiomas de alto nivel combinando profesores calificados con tecnología de inteligencia artificial.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Inicio</a></li>
              <li><a href="#metodo" className="hover:text-cyan-400 transition-colors">Metodología</a></li>
              <li><a href="#programas" className="hover:text-cyan-400 transition-colors">Idiomas</a></li>
              <li><a href="#sobre" className="hover:text-cyan-400 transition-colors">Sobre Nosotros</a></li>
              <li><a href="#contacto" className="hover:text-cyan-400 transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Cursos</h4>
            <ul className="space-y-2">
              <li><a href="#programas" className="hover:text-cyan-400 transition-colors">Inglés General & Business</a></li>
              <li><a href="#programas" className="hover:text-cyan-400 transition-colors">Español Conversacional</a></li>
              <li><a href="#programas" className="hover:text-cyan-400 transition-colors">Português Brasil & Europa</a></li>
              <li><a href="/portal-aluno" className="hover:text-cyan-400 transition-colors">Diagnóstico con IA</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Contacto Directo</h4>
            <p className="text-slate-400 mb-1">info@academiahaas.com</p>
            <p className="text-slate-400 mb-1">+57 323 9421071</p>
            <p className="text-slate-500 mt-3">Atención al estudiante online 24/7</p>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-6 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} HAAS Language. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="/portal-aluno" className="hover:text-white transition-colors">Términos de Servicio</a>
            <a href="/portal-aluno" className="hover:text-white transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </footer>

      {/* MODAL DIAGNÓSTICO EXPRESS */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />
    </div>
  );
}
