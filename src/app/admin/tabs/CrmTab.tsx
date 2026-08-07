// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Mail, FileText, Trash2, Send } from 'lucide-react';

export function CrmTab() {
  const [modelosEmail, setModelosEmail] = useState([
    { id: 1, titulo: '📬 Bienvenida a Ruta Premium IA', corpo: 'Hola {{nome}}, bienvenido a Haas Idiomas. Tu curso personalizado ya está disponible en tu portal estudiantil.', automatizado: true }
  ]);
  const [novoTemplate, setNovoTemplate] = useState({ titulo: '', corpo: '', automatizado: false });

  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!novoTemplate.titulo || !novoTemplate.corpo) return;
    setModelosEmail([...modelosEmail, { id: Date.now(), ...novoTemplate }]);
    setNovoTemplate({ titulo: '', corpo: '', automatizado: false });
  };

  const handleDispararEmail = (nome, titulo) => {
    alert(`[CRM HAAS] Correo masivo de prueba basado en la plantilla "${titulo}" enviado con éxito.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-[fadeIn_0.2s_ease-out]">
      
      {/* FORMULARIO DE NUEVA PLANTILLA */}
      <div className="md:col-span-1 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Mail size={16} className="text-indigo-600"/> Nueva Plantilla CRM
        </h3>
        <form onSubmit={handleAddTemplate} className="space-y-3 text-xs font-medium flex flex-col">
          <input type="text" placeholder="Asunto del correo..." value={novoTemplate.titulo} onChange={e => setNovoTemplate({...novoTemplate, titulo: e.target.value})} className="px-3 py-2 bg-slate-50 border rounded-lg outline-none"/>
          <textarea rows={4} placeholder="Cuerpo del mensaje (puedes usar {{nome}})..." value={novoTemplate.corpo} onChange={e => setNovoTemplate({...novoTemplate, corpo: e.target.value})} className="px-3 py-2 bg-slate-50 border rounded-lg outline-none font-sans leading-relaxed resize-none"/>
          <label className="flex items-center gap-2 font-bold text-slate-600 mt-1 cursor-pointer select-none">
            <input type="checkbox" checked={novoTemplate.automatizado} onChange={e => setNovoTemplate({...novoTemplate, automatizado: e.target.checked})} className="rounded text-indigo-600"/>
            <span>Automatizar en Matrícula</span>
          </label>
          <button type="submit" className="w-full py-2 bg-slate-900 text-white font-black uppercase rounded-lg hover:bg-slate-800 transition-all cursor-pointer">Crear Plantilla</button>
        </form>
      </div>

      {/* DETALLE DE PLANTILLAS Y DISPARADORES */}
      <div className="md:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Historial de Plantillas de Correo</h3>
        <div className="space-y-3">
          {modelosEmail.map(t => (
            <div key={t.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-400"/> {t.titulo}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase border ${t.automatizado ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                    {t.automatizado ? 'Auto' : 'Manual'}
                  </span>
                  <button type="button" onClick={() => setModelosEmail(modelosEmail.filter(x => x.id !== t.id))} className="text-slate-300 hover:text-red-500 cursor-pointer">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
              <p className="text-slate-600 font-mono text-[11px] bg-white p-2.5 rounded-lg border leading-relaxed">{t.corpo}</p>
              <div className="flex items-center justify-end pt-1">
                <button type="button" onClick={() => handleDispararEmail('Grupo', t.titulo)} className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg font-black transition-all flex items-center gap-1 cursor-pointer text-[10px] uppercase tracking-wider">
                  <Send size={10}/> Disparar Envío Masivo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
