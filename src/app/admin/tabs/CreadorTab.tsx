// @ts-nocheck
'use client';
import React, { useState } from 'react';
import { Sparkles, Wand2, UserCheck, Languages, CalendarDays, Clock, Users2, ShieldAlert } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function CreadorTab() {
  const [promptInput, setPromptInput] = useState('');
  const [targetEstudante, setTargetEstudante] = useState('');
  const [idiomaCurso, setIdiomaCurso] = useState('Inglés');
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
    { valor: 'Alvo Teste', label: 'Alvo Teste (Alumno)' },
    { valor: 'Amazon Devs Premium', label: 'Amazon Devs Premium (Grupo)' },
    { valor: 'Ecopetrol M&A Leaders', label: 'Ecopetrol M&A Leaders (Grupo)' },
  ];

  const inputClass = "w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500";
  const labelClass = "text-[10px] text-slate-400 font-black uppercase flex items-center gap-1 mb-1";

  const handleGenerarCurso = async (e) => {
    e.preventDefault();
    if (!promptInput || !targetEstudante) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setCursoGenerado({
      titulo: `Curso de ${idiomaCurso}: ${promptInput} (Nivel ${nivel})`,
      destinatario: targetEstudante,
      mesesSeleccionados: Number(meses),
    });
    setLoading(false);
  };

  const guardarEnSupabase = async () => {
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
          config: { ritmo, modalidade, publico },
        },
      };
      const { error } = await supabase.from('cursos').insert([payload]);
      if (error) {
        alert(`Error al guardar: ${error.message}`);
      } else {
        alert('Curso guardado con éxito.');
        setCursoGenerado(null);
        setPromptInput('');
      }
    } catch (err) {
      alert('Error de red: ' + err.message);
    }
    setSaveLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-white flex items-center gap-2"><Sparkles size={18} className="text-cyan-400" /> Creador IA</h2>

      <form onSubmit={handleGenerarCurso} className="bg-[#0a1424] border border-white/10 rounded-xl p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <span className={labelClass}><UserCheck size={12} /> Alumno</span>
            <select value={targetEstudante} onChange={(e) => setTargetEstudante(e.target.value)} className={inputClass} required>
              <option value="">Elegir alumno...</option>
              {opcionesDestinatarios.map((opc) => <option key={opc.valor} value={opc.valor}>{opc.label}</option>)}
            </select>
          </div>
          <div>
            <span className={labelClass}><Languages size={12} /> Idioma del Curso</span>
            <select value={idiomaCurso} onChange={(e) => setIdiomaCurso(e.target.value)} className={inputClass}>
              {opcionesIdiomas.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
          <div>
            <span className={labelClass}>Enfoque de la IA</span>
            <input type="text" value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="Ej: Negocios Tecnológicos, Viajes" className={inputClass} required />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <span className={labelClass}><CalendarDays size={12} /> Duración</span>
            <select value={meses} onChange={(e) => setMeses(e.target.value)} className={inputClass}>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((m) => <option key={m} value={m}>{m} {m === 1 ? 'Mes' : 'Meses'}</option>)}
            </select>
          </div>
          <div>
            <span className={labelClass}><Clock size={12} /> Intensidad</span>
            <select value={ritmo} onChange={(e) => setRitmo(e.target.value)} className={inputClass}>
              <option value="regular">Regular</option>
              <option value="intensivo">Intensivo</option>
            </select>
          </div>
          <div>
            <span className={labelClass}><Users2 size={12} /> Modalidad</span>
            <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className={inputClass}>
              <option value="particular">Particular</option>
              <option value="grupo">Grupo</option>
            </select>
          </div>
          <div>
            <span className={labelClass}><ShieldAlert size={12} /> Perfil</span>
            <select value={publico} onChange={(e) => setPublico(e.target.value)} className={inputClass}>
              <option value="adulto">Adulto</option>
              <option value="corporativo">Corporativo</option>
              <option value="turismo">Turismo</option>
            </select>
          </div>
          <div>
            <span className={labelClass}>Nivel Objetivo</span>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={inputClass}>
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <button type="submit" className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">
            <Wand2 size={14} /> {loading ? 'Diseñando...' : 'Diseñar Plan con IA'}
          </button>
        </div>
      </form>

      {cursoGenerado && (
        <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-white">{cursoGenerado.titulo}</p>
            <p className="text-[11px] text-cyan-400">Para: {cursoGenerado.destinatario}</p>
          </div>
          <button onClick={guardarEnSupabase} disabled={saveLoading} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20">
            {saveLoading ? 'Guardando...' : 'Guardar en Portal'}
          </button>
        </div>
      )}
    </div>
  );
}
