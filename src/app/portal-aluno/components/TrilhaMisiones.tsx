// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Headphones, BookOpen, PenTool, SpellCheck, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function TrilhaMisiones({ supabase }) {
  const [misiones, setMisiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function puxarTrilhaIa() {
      try {
        // Buscamos el curso activo en Supabase diseñado por el cerebro central de la IA
        const { data, error } = await supabase
          .from('cursos')
          .select('*')
          .limit(1)
          .single();

        if (data) {
          // Mapeamos las misiones dinámicas con los botones de la suite Haas Arcade
          setMisiones([
            { id: 'audio', nome: 'Inmersión Auditiva IA', icon: Headphones, route: '/lesson-audio', color: 'border-blue-500 text-blue-500 hover:bg-blue-50/20', xp: '150 PTS' },
            { id: 'reading', nome: 'Comprensión de Lectura', icon: BookOpen, route: '/lesson-reading', color: 'border-emerald-500 text-emerald-500 hover:bg-emerald-50/20', xp: '120 PTS' },
            { id: 'spelling', nome: 'Laboratorio de Ortografía', icon: SpellCheck, route: '/lesson-spelling', color: 'border-purple-500 text-purple-500 hover:bg-purple-50/20', xp: '100 PTS' },
            { id: 'writing', nome: 'Desafío de Escritura Pro', icon: PenTool, route: '/lesson-writing', color: 'border-amber-500 text-amber-500 hover:bg-amber-50/20', xp: '200 PTS' }
          ]);
        }
      } catch (err) {
        console.error("Erro ao sincronizar trilha com o cérebro IA:", err);
      }
      setLoading(false);
    }
    puxarTrilhaIa();
  }, [supabase]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 animate-pulse">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="h-16 bg-slate-800/60 rounded-xl border border-slate-700"></div>
        ))}
      </div>
    );
  }

  if (misiones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Sparkles size={24} className="text-slate-600 mb-2 animate-bounce" />
        <p className="text-xs font-bold font-mono">No hay misiones cargadas en Supabase para este perfil.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 animate-[fadeIn_0.2s_ease-out]">
      {misiones.map(m => {
        const IconComponent = m.icon;
        return (
          <Link 
            key={m.id} 
            href={m.route}
            className={`flex items-center justify-between p-4 bg-slate-900/60 border-2 rounded-2xl transition-all shadow-sm hover:scale-[1.02] cursor-pointer ${m.color}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 rounded-xl">
                <IconComponent size={18} />
              </div>
              <div className="text-left">
                <span className="font-black text-xs text-white block tracking-wide">{m.nome}</span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">Misión de Competencia</span>
              </div>
            </div>
            <span className="bg-slate-800 text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-inner">
              <Star size={11} className="text-amber-400 fill-amber-400" /> {m.xp}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
