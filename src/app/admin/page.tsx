// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { LayoutDashboard, FileText, Sparkles, Users, Wallet, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { CatalogoTab } from './tabs/CatalogoTab';
import { CreadorTab } from './tabs/CreadorTab';

export default function AdminDashboard() {
  const [tabActiva, setTabActiva] = useState('catalogo');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      
      {/* HEADER SUPERIOR GENERAL */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shadow-indigo-500/20">H</div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none uppercase">Haas Hub v5.5</h1>
            <span className="text-[10px] text-indigo-600 font-extrabold tracking-wider uppercase block mt-1">Control Central de Operations</span>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200/60 rounded-full px-4 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Arquitectura unificada de alta velocidad activa</span>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 min-h-0 flex flex-col">
        
        {/* BARRA DE NAVEGACIÓN DE PESTAÑAS (TABS) */}
        <div className="relative border-b border-slate-200 shrink-0">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-px">
            <button
              type="button"
              onClick={() => setTabActiva('catalogo')}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                tabActiva === 'catalogo'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText size={14} /> Catálogo
            </button>

            <button
              type="button"
              onClick={() => setTabActiva('creador')}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                tabActiva === 'creador'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sparkles size={14} /> Creador IA
            </button>

            {/* PESTAÑAS ADICIONALES DE LA INTERFAZ DE PRUEBA */}
            {['Alumnos', 'Finanzas', 'Profesores', 'Central CRM'].map(item => (
              <button
                key={item}
                type="button"
                disabled
                className="px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 border-transparent text-slate-300 cursor-not-allowed flex items-center gap-2 shrink-0"
              >
                {item === 'Alumnos' && <Users size={14} />}
                {item === 'Finanzas' && <Wallet size={14} />}
                <span>{item}</span>
              </button>
            ))}
          </div>

          {/* FLECHAS DE SCROLL DECORATIVAS PARA MÓVIL */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-slate-50 to-transparent w-6 h-full pointer-events-none flex items-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={16} className="text-slate-400" /></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-slate-50 to-transparent w-6 h-full pointer-events-none flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={16} className="text-slate-400" /></div>
        </div>

        {/* CONTENIDO DINÁMICO SEGÚN LA PESTAÑA ACTIVA */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {tabActiva === 'catalogo' && <CatalogoTab />}
          {tabActiva === 'creador' && <CreadorTab />}
        </div>

      </main>

    </div>
  );
}
