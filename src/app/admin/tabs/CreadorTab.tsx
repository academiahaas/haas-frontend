// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, CheckCircle2, CalendarDays, Users2, ShieldAlert, Clock, UserCheck, Languages } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function CreadorTab() {
  const [promptInput, setPromptInput] = useState('');
  const [targetEstudante, setTargetEstudante] = useState('');
  const [idiomaCurso, setIdiomaCurso] = useState('Inglés'); // 🌐 Nuevo Estado
  const [nivel, setNivel] = useState('B2');
  const [meses, setMeses] = useState('6');
  const [ritmo, setRitmo] = useState('regular');
  const [modalidade, setModalidade] = useState('particular');
  const [publico, setPublico] = useState('adulto');
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [cursoGenerado, setCursoGenerado] = useState(null);

  const opcionesIdiomas = ['Inglés', 'Portugués', 'Español', 'Italiano', 'Alemán'];

  const opcionesDestinatarios = [
    { valor: 'Alvo Teste', label: '👤 Alvo Teste (Alumno)' },
    { valor: 'Amazon Devs Premium', label: '👥 Amazon Devs Premium (Grupo)' },
    { valor: 'Ecopetrol M&A Leaders', label: '👥 Ecopetrol M&A Leaders (Grupo)' }
  ];

  const handleGenerarCursoDefinitive = async (e) => {
    e.preventDefault();
    if (!promptInput || !targetEstudante) return;
    setLoading(true);

    await new Promise(r => setTimeout(r, 400));

    // El título ahora incluye de forma elegante el idioma seleccionado por el administrador
    setCursoGenerado({
      titulo: `Curso de ${idiomaCurso}: ${promptInput} (Nivel ${nivel})`,
      destinatario: targetEstudante,
      mesesSeleccionados: Number(meses)
    });
    setLoading(false);
  };

  const guardarEnSupabaseReal = async () => {
    if (!cursoGenerado) return;
    setSaveLoading(true);

    try {
      const payload = {
        id_estudiante: cursoGenerado.destinatario,
        titulo: cursoGenerado.titulo,
        duracion_semanas: cursoGenerado.mesesSeleccionados * 4,
        estructura_json: {
          generadoPor: "Haas Cerebro IA",
          fechaInyeccion: new Date().toISOString(),
          idiomaTarget: idiomaCurso,
          config: { ritmo, modalidade, publico }
        }
      };

      const { error } = await supabase.from('cursos').insert([payload]);

      if (error) {
        alert(`❌ Error de Supabase:\nCódigo: ${error.code}\nMensaje: ${error.message}`);
      } else {
        alert(`✅ ¡INYECCIÓN COMPLETADA CON ÉXITO!\nEl plan de [${idiomaCurso}] se guardó correctamente.`);
        setCursoGenerado(null);
        setPromptInput('');
      }
    } catch (err) {
      alert("❌ Error de red: " + err.message);
    }
    setSaveLoading(false);
  };

  return (
    <div className="space-y-6 text-slate-700">
      <div className="bg-white border p-6 rounded-2xl shadow-sm space-y-5">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600"/> Panel de Control de Operaciones IA
          </h3>
        </div>

        <form onSubmit={handleGenerarCursoDefinitive} className="space-y-4 text-xs font-bold">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-indigo-600 font-black uppercase flex items-center gap-1"><UserCheck size={12}/> Alumno</span>
              <select value={targetEstudante} onChange={e => setTargetEstudante(e.target.value)} className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl outline-none font-black text-xs" required>
                <option value="">Elegir alumno...</option>
                {opcionesDestinatarios.map(opc => <option key={opc.valor} value={opc.valor}>{opc.label}</option>)}
              </select>
            </div>
            
            {/* 🌐 NUEVO SELECTOR DE IDIOMA TARGET */}
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-600 font-black uppercase flex items-center gap-1"><Languages size={12}/> Idioma del Curso</span>
              <select value={idiomaCurso} onChange={e => setIdiomaCurso(e.target.value)} className="w-full px-3 py-2 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-xl outline-none font-black text-xs">
                {opcionesIdiomas.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase">Enfoque de la IA</span>
              <input type="text" value={promptInput} onChange={e => setPromptInput(e.target.value)} placeholder="Ej: Negocios Tecnológicos, Viajes" className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none font-medium text-slate-800" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1"><CalendarDays size={12}/> Duración</span>
              <select value={meses} onChange={e => setMeses(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none text-xs">
                {[1,2,3,4,5,6,8,10,12].map(m => <option key={m} value={m}>{m} {m === 1 ? 'Mes' : 'Meses'}</option>)}
              </select>
            </div>
            <div className="space-y-1"><span className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1"><Clock size={12}/> Intensidad</span><select value={ritmo} onChange={e => setRitmo(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"><option value="regular">Regular</option><option value="intensivo">Intensivo</option></select></div>
            <div className="space-y-1"><span className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1"><Users2 size={12}/> Modalidad</span><select value={modalidade} onChange={e => setModalidade(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"><option value="particular">Particular</option><option value="grupo">Grupo</option></select></div>
            <div className="space-y-1"><span className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1"><ShieldAlert size={12}/> Perfil</span><select value={publico} onChange={e => setPublico(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"><option value="adulto">Adulto</option><option value="corporativo">Corporativo</option><option value="turismo">Turismo</option></select></div>
            <div className="space-y-1"><span className="text-[10px] text-indigo-600 font-black uppercase flex items-center gap-1">Nivel Objetivo</span><select value={nivel} onChange={e => setNivel(e.target.value)} className="w-full px-3 py-2 bg-indigo-50 border rounded-xl text-xs">{['A1','A2','B1','B2','C1','C2'].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer">
              <Wand2 size={14}/> Diseñar Plan con IA
            </button>
          </div>
        </form>
      </div>

      {cursoGenerado && (
        <div className="bg-white border rounded-2xl p-4 flex justify-between items-center animate-[scaleUp_0.1s_ease-out]">
          <div className="text-xs font-black text-slate-900">
            <span className="block text-sm">{cursoGenerado.titulo}</span>
            <span className="text-[11px] text-indigo-600">Para: {cursoGenerado.destinatario}</span>
          </div>
          <button type="button" onClick={guardarEnSupabaseReal} disabled={saveLoading} className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm cursor-pointer">
            {saveLoading ? 'Indexando...' : 'Guardar e Inyectar en Portal'}
          </button>
        </div>
      )}
    </div>
  );
}
