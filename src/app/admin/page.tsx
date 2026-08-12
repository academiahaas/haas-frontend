// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { FileText, Sparkles, Building2, Wallet, Users, GraduationCap, Receipt } from 'lucide-react';
import { CatalogoTab } from './tabs/CatalogoTab';
import { CreadorTab } from './tabs/CreadorTab';
import { EmpresasTab } from './tabs/EmpresasTab';
import { FinanzasTab } from './tabs/FinanzasTab';
import { AlunosTab } from './tabs/AlunosTab';
import { ProfesoresTab } from './tabs/ProfesoresTab';
import { GastosTab } from './tabs/GastosTab';

const ABAS = [
  { id: 'finanzas', label: 'Finanzas', icon: Wallet, componente: FinanzasTab },
  { id: 'gastos', label: 'Gastos', icon: Receipt, componente: GastosTab },
  { id: 'empresas', label: 'Empresas', icon: Building2, componente: EmpresasTab },
  { id: 'catalogo', label: 'Catálogo', icon: FileText, componente: CatalogoTab },
  { id: 'creador', label: 'Creador IA', icon: Sparkles, componente: CreadorTab },
  { id: 'alunos', label: 'Alumnos', icon: Users, componente: AlunosTab },
  { id: 'profesores', label: 'Profesores', icon: GraduationCap, componente: ProfesoresTab },
];

export default function AdminDashboard() {
  const [tabActiva, setTabActiva] = useState('finanzas');
  const abaAtual = ABAS.find((a) => a.id === tabActiva);
  const ComponenteAtivo = abaAtual?.componente;

  return (
    <div className="h-screen bg-[#030914] text-white/90 font-sans antialiased flex flex-col overflow-hidden">

      <header className="bg-[#080C16]/90 border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)]">H</div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight leading-none uppercase">Haas Hub</h1>
            <span className="text-[10px] text-cyan-400 font-extrabold tracking-wider uppercase block mt-1">Painel de Administração</span>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Sistema Ativo</span>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 min-h-0 flex flex-col">

        <div className="relative border-b border-white/10 shrink-0 sticky top-0 bg-[#030914] z-30 pt-1">
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-px">
            {ABAS.map((aba) => {
              const Icon = aba.icon;
              const ativa = tabActiva === aba.id;
              return (
                <button
                  key={aba.id}
                  type="button"
                  disabled={aba.emBreve}
                  onClick={() => !aba.emBreve && setTabActiva(aba.id)}
                  className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                    aba.emBreve
                      ? 'border-transparent text-slate-600 cursor-not-allowed'
                      : ativa
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5 rounded-t-xl cursor-pointer'
                      : 'border-transparent text-slate-400 hover:text-white cursor-pointer'
                  }`}
                >
                  <Icon size={14} /> {aba.label}
                  {aba.emBreve && <span className="text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded ml-1">Em breve</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="bg-[#080C16]/60 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
            {ComponenteAtivo ? <ComponenteAtivo /> : <p className="text-slate-400 text-sm">Em construção.</p>}
          </div>
        </div>

      </main>

    </div>
  );
}
