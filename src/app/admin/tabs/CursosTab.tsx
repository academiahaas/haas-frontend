// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Star, Hourglass, Edit3 } from 'lucide-react';

export function CursosTab({ supabase }) {
  const [cursosCatalogo, setCursosCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarCursosDoBanco() {
      try {
        const { data } = await supabase.from('cursos').select('*').order('created_at', { ascending: false });
        if (data) {
          setCursosCatalogo(data.map((c, index) => ({
            id: c.id,
            titulo: c.titulo,
            empresa: c.id_estudiante === '1' ? 'Amazon Colombia' : 'Corporativo Haas',
            alumnos: c.id_estudiante === 'g1' || c.id_estudiante === 'g2' ? 12 : 1,
            nota: (4.7 + (index * 0.1) > 5 ? 5.0 : 4.7 + (index * 0.1)).toFixed(1),
            tiempoMedia: '45 min/dia'
          })));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    carregarCursosDoBanco();
  }, [supabase]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
      <div className="p-4 border-b flex bg-slate-50/50">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-600"/> Catálogo & Métricas Activas
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-medium">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-black uppercase border-b">
              <th className="p-4">Programa Ejecutivo</th>
              <th className="p-4">Empresa / Partner</th>
              <th className="p-4 text-center">Estudiantes</th>
              <th className="p-4 text-center">Calificación</th>
              <th className="p-4 text-center">Ajustes</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {loading ? (
              // 🔄 OPTIMIZACIÓN: EFECTO SKELETON MIENTRAS SUPABASE RESPONDE
              [1, 2].map(n => (
                <tr key={n} className="animate-pulse">
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded-md w-3/4"></div></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded-md w-1/2"></div></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded-md w-8 mx-auto"></div></td>
                  <td className="p-4"><div className="h-6 bg-slate-200 rounded-lg w-12 mx-auto"></div></td>
                  <td className="p-4"><div className="h-6 bg-slate-200 rounded-lg w-16 mx-auto"></div></td>
                </tr>
              ))
            ) : (
              cursosCatalogo.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-all">
                  <td className="p-4 font-black text-slate-900 text-sm">{c.titulo}</td>
                  <td className="p-4 font-bold text-slate-400">{c.empresa}</td>
                  <td className="p-4 text-center font-bold text-indigo-600 font-mono">{c.alumnos}</td>
                  <td className="p-4 text-center">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg font-mono font-black flex items-center gap-1 justify-center w-14 mx-auto">
                      <Star size={11} className="fill-amber-500 text-amber-500"/> {c.nota}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button type="button" className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 font-bold rounded-lg border text-[11px]">Editar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
