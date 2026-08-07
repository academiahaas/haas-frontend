'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Layers, ChevronRight, CheckCircle2, Clock, BookOpen, Award } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function PortalAlumnoCursos() {
  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState<any>(null);
  const [semanas, setSemanas] = useState<string[]>([]);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(0);

  useEffect(() => {
    async function cargarCursoAlumno() {
      try {
        const { data, error } = await supabase
          .from('cursos')
          .select('*')
          .eq('id_estudiante', '1')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const cursoData = data[0];
          setCurso(cursoData);

          if (cursoData.estructura_json) {
            const bloques = cursoData.estructura_json
              .split(/🔹\s*SEMANA\s*\d+:/i)
              .map((b: string) => b.trim())
              .filter((b: string) => b.length > 0);
            
            setSemanas(bloques);
          }
        }
      } catch (e) {
        console.error("Error cargando el curso real:", e);
      } finally {
        setLoading(false);
      }
    }
    cargarCursoAlumno();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-2">
        <Brain size={32} className="animate-pulse text-indigo-400" />
        Sincronizando con Haas Neuro-System...
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-xs p-6 text-center">
        <Brain size={32} className="text-slate-700 mb-2" />
        No se encontró ninguna ruta activa asignada.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2.5 py-1 rounded-md mb-2 inline-block">
              Ruta de Aprendizaje Activa
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
              {curso.titulo}
            </h1>
          </div>
          <div className="flex gap-3 text-xs font-mono font-bold">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-2">
              <Clock size={14} className="text-indigo-400" /> {curso.duracion_semanas} Semanas
            </div>
            <div className="bg-emerald-950/30 border border-emerald-900/50 px-4 py-2.5 rounded-xl text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={14} /> Estado: Activo
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl max-h-[70vh] overflow-y-auto space-y-2">
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2 mb-3 flex items-center gap-1.5">
              <Layers size={12}/> Cronograma de Inmersión
            </div>
            {semanas.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSemanaSeleccionada(index)}
                className={`w-full text-left p-3.5 rounded-xl font-bold text-xs transition-all flex justify-between items-center group border ${
                  semanaSeleccionada === index
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-900 border-slate-800/60 text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-black border ${
                    semanaSeleccionada === index ? 'bg-indigo-700 border-indigo-400' : 'bg-slate-950 border-slate-800'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  Semana {index + 1}
                </span>
                <ChevronRight size={14} className={`transition-transform ${semanaSeleccionada === index ? 'translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'}`} />
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6 min-h-[50vh]">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-1">
                <BookOpen size={14}/> Unidad de Estudio Desplegada
              </h3>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Anatomía y Objetivos de la Semana {semanaSeleccionada + 1}
              </h2>
            </div>

            {semanas[semanaSeleccionada] ? (
              <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-w-xl">
                {semanas[semanaSeleccionada]}
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-5 font-mono text-xs text-slate-400 italic">
                {curso.estructura_json}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button type="button" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer">
                <Award size={14}/> Iniciar Laboratorio de Práctica
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}