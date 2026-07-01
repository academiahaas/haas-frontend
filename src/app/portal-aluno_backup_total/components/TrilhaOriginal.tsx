// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function TrilhaOriginal({ t, router }) {
  const [cursoReal, setCursoReal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function jalarCursoDesdeSupabase() {
      try {
        // Consultamos directamente el último registro inyectado para Alvo Teste
        const { data, error } = await supabase
          .from('cursos')
          .select('*')
          .eq('id_estudiante', 'Alvo Teste')
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          setCursoReal(data[0]);
        }
      } catch (e) {
        console.error("Erro directo de conexión con Supabase:", e);
      }
      setLoading(false);
    }
    jalarCursoDesdeSupabase();
  }, []);

  const manejarRedireccionReal = () => {
    if (!cursoReal) return router.push('/lesson-audio');
    const tituloBajo = cursoReal.titulo?.toLowerCase() || '';
    
    if (tituloBajo.includes('tripulantes') || tituloBajo.includes('turismo') || tituloBajo.includes('cabina')) {
      router.push('/lesson-paragraphs');
    } else {
      router.push('/lesson-audio');
    }
  };

  if (loading) {
    return (
      <div style={{ left: '20.50%', top: '14.50%', width: '39.50%', height: '60.00%' }} className="absolute bg-[#162630] border border-[#233744]/60 rounded-2xl p-5 flex flex-col justify-center items-center shadow-md">
        <div className="text-center p-8 text-xs font-mono text-slate-400 animate-pulse uppercase tracking-widest">
          🧠 Buscando curso real en Supabase...
        </div>
      </div>
    );
  }

  // Si el alumno no tiene cursos aún, mostramos el estado por defecto
  const textoDespliegue = cursoReal ? `${cursoReal.titulo} (${cursoReal.nivel})` : "Ruta Premium: Alvo Teste (B2)";

  return (
    <div style={{ left: '20.50%', top: '14.50%', width: '39.50%', height: '60.00%' }} className="absolute bg-[#162630] border border-[#233744]/60 rounded-2xl p-5 flex flex-col shadow-md overflow-y-auto gap-4 no-scrollbar">
      <h2 className="text-sm font-black text-white uppercase tracking-wider">{t.trilhaCompetencias}</h2>
      
      <div className="border border-[#233744]/60 rounded-xl p-3 bg-[#0D1921]/20 flex items-center gap-3">
        <div className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center text-amber-500 text-xs font-bold">✓</div>
        <div className="flex-1 min-w-[0px]"><span className="block text-[10px] text-slate-500 font-bold">{t.modulo} 1</span><p className="font-bold text-xs text-slate-300 truncate">Verb Tenses (CEFR B1)</p></div>
        <span className="text-[10px] text-slate-500 font-bold">{t.completo}</span>
      </div>

      <div className="border border-[#233744]/60 rounded-xl p-3 bg-[#0D1921]/20 flex items-center gap-3">
        <div className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center text-amber-500 text-xs font-bold">✓</div>
        <div className="flex-1 min-w-[0px]"><span className="block text-[10px] text-slate-500 font-bold">{t.modulo} 2</span><p className="font-bold text-xs text-slate-300 truncate">Prepositions (CEFR B2)</p></div>
        <span className="text-[10px] text-slate-500 font-bold">{t.completo}</span>
      </div>

      <div className="border-2 border-orange-500/80 rounded-xl p-4 bg-gradient-to-r from-[#2c1d11] to-[#1a1310] flex flex-col gap-2 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <span className="block text-[10px] text-orange-400 font-black uppercase">{t.modulo} 3</span>
            <h3 className="font-black text-xs text-white tracking-wide uppercase">{textoDespliegue}</h3>
          </div>
          <span className="text-[8px] bg-orange-500 text-black font-black px-1.5 py-0.5 rounded uppercase">RETRAIN</span>
        </div>
        <p className="text-[10px] text-orange-300/90 font-semibold leading-tight">⚠️ {t.dominioAtual}: 68% • {t.ultimoTreino}</p>
        <button type="button" onClick={manejarRedireccionReal} className="w-full bg-orange-500 text-black font-black text-[10px] py-2 rounded-lg uppercase tracking-wider hover:bg-orange-400 transition-colors mt-1 cursor-pointer">{t.treinarReativar}</button>
      </div>
    </div>
  );
}
