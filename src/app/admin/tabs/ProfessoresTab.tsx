// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { UserCheck, UserPlus, X, Check, Trash2 } from 'lucide-react';

export function ProfessorsTab() {
  const [professores, setProfessores] = useState([
    { id: 1, nome: 'Prof. Johnathan Smith', alocacao: 'Amazon Devs Premium', valorHora: 60000, horasTrabalhadas: 40, faltas: 0, obs: 'Excelente adherencia corporativa.' }
  ]);

  // 🚪 ESTADOS PARA EL CONTROL DEL POP-UP DE PROFESORES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formProf, setFormProf] = useState({ nome: '', alocacao: '', valorHora: '', horasTrabalhadas: '', obs: '' });

  const handleUpdateFalta = (id, acao) => {
    setProfessores(professores.map(p => p.id === id ? { ...p, faltas: acao === 'add' ? p.faltas + 1 : Math.max(0, p.faltas - 1) } : p));
  };

  const handleSalvarProf = (e) => {
    e.preventDefault();
    if (!formProf.nome) return;
    
    const novoProf = {
      id: Date.now(),
      nome: formProf.nome,
      alocacao: formProf.alocacao || 'Sin asignar',
      valorHora: Number(formProf.valorHora) || 50000,
      horasTrabalhadas: Number(formProf.horasTrabalhadas) || 0,
      faltas: 0,
      obs: formProf.obs || 'Ok'
    };

    setProfessores([...professores, novoProf]);
    setFormProf({ nome: '', alocacao: '', valorHora: '', horasTrabalhadas: '', obs: '' });
    setIsModalOpen(false);
  };

  const formatarCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      
      {/* CABECERA DE LA PESTAÑA CON EL BOTÓN PARA AÑADIR */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <UserCheck size={16} className="text-indigo-600"/> Fichas de Profesores Activos
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Control de asistencias, horas ejecutadas y cálculo de nómina en tiempo real.</p>
        </div>
        
        <button 
          type="button" 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus size={14}/> Registrar Profesor
        </button>
      </div>

      {/* LISTA DE PROFESORES */}
      <div className="space-y-4">
        {professores.map(p => (
          <div key={p.id} className="p-4 border bg-white rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-medium">
            <div className="space-y-1">
              <span className="font-black text-slate-900 text-sm block">{p.nome}</span>
              <p className="text-slate-500">Asignado a: <span className="text-indigo-600 font-bold">{p.alocacao}</span></p>
              <div className="flex gap-3 pt-1"><span className="text-slate-600">Valor Hora: <b>{formatarCOP(p.valorHora)}</b></span><span className="text-slate-600">Horas: <b>{p.horasTrabalhadas}h</b></span></div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-center bg-white border px-3 py-1.5 rounded-xl shadow-sm">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Faltas</span>
                <div className="flex items-center gap-2 mt-0.5 font-mono font-black"><button type="button" onClick={() => handleUpdateFalta(p.id, 'sub')} className="text-slate-400 px-1">-</button><span className="text-red-600">{p.faltas}</span><button type="button" onClick={() => handleUpdateFalta(p.id, 'add')} className="text-slate-400 px-1">+</button></div>
              </div>
              <div className="text-right bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                <span className="text-[9px] text-emerald-600 uppercase font-black block">Total a Pagar</span>
                <span className="font-mono font-black text-emerald-700 text-sm">{formatarCOP(p.valorHora * p.horasTrabalhadas - (p.faltas * p.valorHora * 1.5))}</span>
              </div>
              <button type="button" onClick={() => setProfessores(professores.filter(x => x.id !== p.id))} className="text-slate-300 hover:text-red-500 p-1 cursor-pointer"><Trash2 size={15}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* 🎭 POP-UP FLOTANTE PARA REGISTRAR PROFESOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-2xl shadow-xl border w-full max-w-md p-6 space-y-4 relative mx-4 animate-[scaleUp_0.15s_ease-out]">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18}/></button>
            
            <div className="border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">👤 Registrar Nuevo Profesor</h3>
              <p className="text-[11px] text-slate-400 font-medium">Ingresa las credenciales operacionales básicas para el cálculo automatizado.</p>
            </div>

            <form onSubmit={handleSalvarProf} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Nombre del Profesor</span><input type="text" value={formProf.nome} onChange={e => setFormProf({...formProf, nome: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none" required/></div>
              <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Grupo Corporativo Asignado</span><input type="text" value={formProf.alocacao} onChange={e => setFormProf({...formProf, alocacao: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none" placeholder="Ej: Amazon Devs Premium"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Valor por Hora (COP)</span><input type="number" value={formProf.valorHora} onChange={e => setFormProf({...formProf, valorHora: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none" placeholder="60000"/></div>
                <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Horas Ejecutadas</span><input type="number" value={formProf.horasTrabalhadas} onChange={e => setFormProf({...formProf, horasTrabalhadas: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none" placeholder="40"/></div>
              </div>
              <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Observaciones Iniciales</span><input type="text" value={formProf.obs} onChange={e => setFormProf({...formProf, obs: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none"/></div>
              
              <div className="flex gap-2 pt-3 border-t justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-black uppercase rounded-xl cursor-pointer shadow-sm">Guardar Profesor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
