// @ts-nocheck
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function CreadorCursos() {
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerarCurso = (e) => {
    e.preventDefault();
    alert('Simulando generación de curso con IA...');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-8 font-sans antialiased">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin" className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 mb-4 hover:underline">
          <ArrowLeft size={14}/> Volver al Panel de Operaciones
        </Link>
        <div className="bg-white border p-6 rounded-2xl shadow-sm space-y-4">
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600"/> Fábrica de Cursos Inteligente
          </h1>
          <form onSubmit={handleGenerarCurso} className="space-y-3">
            <textarea 
              rows={4} 
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              placeholder="Ej: Curso de Portugués de Negocios enfocado en M&A para 24 semanas..." 
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none text-xs"
            />
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-black uppercase text-xs rounded-xl hover:bg-indigo-500">
              Generar Estructura con IA
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
