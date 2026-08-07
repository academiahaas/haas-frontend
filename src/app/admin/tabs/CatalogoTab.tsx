// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, Star, RefreshCw } from 'lucide-react';
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
      // Forzamos una lectura limpia y total sin filtros cruzados
      const { data, error } = await supabase
        .from('cursos')
        .select('*');
        
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
    const seguro = confirm(`⚠️ AVISO DE CONTROL CRÍTICO ⚠️\n\n¿Estás segura de eliminar permanentemente:\n"${titulo}"?\n\nEsta acción borrará el registro de Supabase al instante.`);
    if (!seguro) return;

    try {
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert("✅ Registro eliminado con éxito.");
      puxarCatalogoReal();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  if (loading) return <div className="p-6 text-xs font-mono text-slate-400 animate-pulse">Sincronizando registros con Supabase...</div>;

  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden text-xs text-slate-700 font-bold">
      <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
        <h3 className="text-slate-900 font-black uppercase tracking-wider">📋 Catálogo & Métricas Activas</h3>
        <button type="button" onClick={puxarCatalogoReal} className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer" title="Forzar Recarga">
          <RefreshCw size={14} />
        </button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 text-[10px] text-slate-400 uppercase border-b font-black">
            <th className="p-4">Programa / Idioma Inyectado</th>
            <th className="p-4">Estudiante / ID</th>
            <th className="p-4">Semanas</th>
            <th className="p-4">Calificación</th>
            <th className="p-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {cursos.length === 0 ? (
            <tr><td colSpan="5" className="p-4 text-center text-slate-400 font-mono">No se detectaron filas en la tabla 'cursos'.</td></tr>
          ) : (
            cursos.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4 font-black text-slate-900">{c.titulo || 'Sin Título'}</td>
                <td className="p-4 text-indigo-600 font-bold">{c.id_estudiante || 'Sin ID'}</td>
                <td className="p-4 font-mono text-slate-500">{c.duracion_semanas || 24} w</td>
                <td className="p-4">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Star size={12} className="text-slate-300" /> <em>Sin calificar</em>
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button type="button" onClick={() => handleEliminarCurso(c.id, c.titulo)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
