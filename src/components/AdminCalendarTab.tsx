'use client';

import React, { useState } from 'react';
import { Clock, Check, ShieldAlert, RotateCcw } from 'lucide-react';

interface AdminCalendarTabProps {
  idioma?: 'ES' | 'EN' | 'PT';
}

export function AdminCalendarTab({ idioma = 'ES' }: AdminCalendarTabProps) {
  // Dicionário de tradução exclusivo da engrenagem da Agenda
  const traducoesAgenda: Record<string, any> = {
    ES: {
      titleMalla: "Malla de Horarios Disponibles",
      subMalla: "Clique sobre os blocos abaixo para ativar o desactivar los slots de la grade académica ejecutiva.",
      btnSlot: "+ Agregar Slot de Disponibilidad",
      titleRep: "Solicitudes Activas de Reposición de Clases",
      txtCambio: "Cambio táctico: de",
      txtPara: "para",
      statusAprobado: "Aprobado",
      promptMsg: "Injete o nuevo slot de horario (Ex: 10:00 - 12:00):"
    },
    EN: {
      titleMalla: "Available Schedules Grid",
      subMalla: "Click on the blocks below to activate or deactivate the executive academic schedule slots.",
      btnSlot: "+ Add Availability Slot",
      titleRep: "Active Class Replacement Requests",
      txtCambio: "Tactical change: from",
      txtPara: "to",
      statusAprobado: "Approved",
      promptMsg: "Inject the new schedule slot (Ex: 10:00 - 12:00):"
    },
    PT: {
      titleMalla: "Grade de Horários Disponíveis",
      subMalla: "Clique sobre os blocos abaixo para ativar ou desativar os slots da grade acadêmica executiva.",
      btnSlot: "+ Adicionar Slot de Disponibilidade",
      titleRep: "Solicitações Ativas de Reposição de Aulas",
      txtCambio: "Mudança tática: de",
      txtPara: "para",
      statusAprobado: "Aprovado",
      promptMsg: "Injete o novo slot de horário (Ex: 10:00 - 12:00):"
    }
  };

  const t = traducoesAgenda[idioma];

  const [slotsDisponiveis, setSlotsDisponiveis] = useState([
    { id: 1, horario: '07:00 - 09:00', ativo: true },
    { id: 2, horario: '12:00 - 14:00', ativo: true },
    { id: 3, horario: '17:00 - 19:00', ativo: false },
    { id: 4, horario: '19:00 - 21:00', ativo: false },
  ]);

  const [reposicoes, setReposicoes] = useState([
    { id: 1, aluno: 'Alvo Teste', professor: 'Prof. Johnathan Smith', horarioOriginal: 'Lun 08:00', novoHorario: 'Mie 17:00', estado: 'Pendiente' },
    { id: 2, aluno: 'Mateo Gomez', professor: 'Profa. Elena Rossi', horarioOriginal: 'Mar 10:00', novoHorario: 'Jue 14:00', estado: 'Aprobado' },
  ]);

  const handleAprovar = (id: number) => {
    setReposicoes(prev => prev.map(item => item.id === id ? { ...item, estado: 'Aprobado' } : item));
  };

  const handleRejeitar = (id: number) => {
    setReposicoes(prev => prev.filter(item => item.id !== id));
  };

  const handleCancelarAprovacao = (id: number) => {
    setReposicoes(prev => prev.map(item => item.id === id ? { ...item, estado: 'Pendiente' } : item));
  };

  const handleAlternarSlot = (id: number) => {
    setSlotsDisponiveis(prev => prev.map(slot => slot.id === id ? { ...slot, ativo: !slot.ativo } : slot));
  };

  const handleAdicionarSlot = () => {
    const novoHorarioPrompt = prompt(t.promptMsg);
    if (!novoHorarioPrompt) return;
    setSlotsDisponiveis(prev => [...prev, { id: Date.now(), horario: novoHorarioPrompt, ativo: true }]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Malla de Horarios */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock size={18} className="text-blue-600" />
          <h2 className="text-sm font-black text-slate-900 uppercase">{t.titleMalla}</h2>
        </div>
        <p className="text-xs text-slate-400 font-medium">{t.subMalla}</p>
        
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono font-bold">
          {slotsDisponiveis.map(slot => (
            <button 
              key={slot.id} 
              onClick={() => handleAlternarSlot(slot.id)}
              className={`p-2.5 border rounded-xl transition-all cursor-pointer ${slot.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'}`}
            >
              {slot.horario}
            </button>
          ))}
        </div>
        
        <button onClick={handleAdicionarSlot} className="w-full text-xs font-black uppercase py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl tracking-wider transition-all cursor-pointer">
          {t.btnSlot}
        </button>
      </div>

      {/* Central de Solicitações */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">{t.titleRep}</h3>
        </div>
        <div className="space-y-3 mt-4">
          {reposicoes.map(r => (
            <div key={r.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs transition-all">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">{r.aluno}</span>
                  <span className="text-slate-400">➔</span>
                  <span className="font-bold text-slate-500">{r.professor}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {t.txtCambio} <span className="font-bold text-slate-700">{r.horarioOriginal}</span> {t.txtPara} <span className="font-bold text-purple-600">{r.novoHorario}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {r.estado === 'Pendiente' ? (
                  <>
                    <button onClick={() => handleAprovar(r.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border cursor-pointer"><Check size={14}/></button>
                    <button onClick={() => handleRejeitar(r.id)} className="p-2 bg-red-50 text-red-600 rounded-lg border cursor-pointer"><ShieldAlert size={14}/></button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase border border-emerald-200 shadow-sm">
                      {t.statusAprobado}
                    </span>
                    <button onClick={() => handleCancelarAprovacao(r.id)} className="p-1 bg-slate-200 border rounded-lg text-slate-600 cursor-pointer"><RotateCcw size={12} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}