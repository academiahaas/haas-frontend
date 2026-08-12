// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { Trash2, RefreshCw, FileText } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function CatalogoTab() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const puxarCatalogoReal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('cursos').select('*');
      if (error) throw error;
      if (data) setCursos(data);
    } catch (err) {
      console.error("Erro ao carregar catálogo:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    puxarCatalogoReal();
  }, []);

  const handleEliminarCurso = async (id, titulo) => {
    const seguro = confirm(`¿Estás segura de eliminar permanentemente "${titulo}"?`);
    if (!seguro) return;
    try {
      const { error } = await supabase.from('cursos').delete().eq('id', id);
      if (error) throw error;
      puxarCatalogoReal();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const COLS = "grid-cols-[1.5fr_1fr_100px_1fr_80px]";

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><FileText size={18} className="text-cyan-400" /> Catálogo</h2>
        <button onClick={puxarCatalogoReal} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : cursos.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum curso cadastrado ainda.</p>
      ) : (
        <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden min-h-0 flex-1">
          <div className={`grid ${COLS} gap-2 px-3 py-2 bg-[#080C16] border-b border-white/10 text-[10px] font-bold text-slate-500 uppercase shrink-0`}>
            <span>Programa</span>
            <span>Estudiante</span>
            <span>Semanas</span>
            <span>Calificación</span>
            <span className="text-center">Acciones</span>
          </div>
          <div className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {cursos.map((c) => (
              <div key={c.id} className={`grid ${COLS} gap-2 px-3 py-2 border-b border-white/5 text-xs items-center`}>
                <span className="font-bold text-white truncate">{c.titulo || 'Sin Título'}</span>
                <span className="text-cyan-400 truncate">{c.id_estudiante || 'Sin ID'}</span>
                <span className="text-slate-400">{c.duracion_semanas || 24}w</span>
                <span className="text-slate-500 italic">Sin calificar</span>
                <span className="text-center">
                  <button onClick={() => handleEliminarCurso(c.id, c.titulo)} className="text-rose-400/70 hover:text-rose-400">
                    <Trash2 size={14} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
