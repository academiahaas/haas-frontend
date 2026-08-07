// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { FolderPlus, Check, X, Edit3, Search, Trash2, Plus, UserPlus } from 'lucide-react';

export function AlunosTab({ supabase }) {
  const [cursosCatalogo, setCursosCatalogo] = useState([]);
  const [grupos, setGrupos] = useState([{ id: 1, nome: 'Amazon Devs Premium' }, { id: 2, nome: 'Ecopetrol M&A Leaders' }]);
  const [novoGrupo, setNovoGrupo] = useState('');
  const [buscaAluno, setBuscaAluno] = useState('');
  const [alunos, setAlunos] = useState([
    { id: 1, nome: 'Alvo Teste', empresa: 'Amazon Colombia', grupo: 'Amazon Devs Premium', email: 'alvo@amazon.com', cursoVinculadoId: '' }
  ]);

  // 🚪 ESTADOS PARA EL CONTROL DEL POP-UP (MODAL)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formAluno, setFormAluno] = useState({ id: null, nome: '', empresa: '', grupo: '', email: '', cursoVinculadoId: '' });

  useEffect(() => {
    async function carregarCursos() {
      const { data } = await supabase.from('cursos').select('*').order('created_at', { ascending: false });
      if (data) setCursosCatalogo(data);
    }
    carregarCursos();
  }, [supabase]);

  const handleSalvarAluno = (e) => {
    e.preventDefault();
    if (!formAluno.nome || !formAluno.email) return;
    if (formAluno.id) setAlunos(alunos.map(a => a.id === formAluno.id ? { ...formAluno } : a));
    else setAlunos([...alunos, { ...formAluno, id: Date.now() }]);
    
    // Cerrar pop-up y resetear
    setFormAluno({ id: null, nome: '', empresa: '', grupo: '', email: '', cursoVinculadoId: '' });
    setIsModalOpen(false);
  };

  const handleAbrirEditar = (aluno) => {
    setFormAluno({ ...aluno });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      
      {/* SECCIÓN GRUPOS (Limpia y fija) */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <FolderPlus size={16} className="text-indigo-600"/> Estructurar Grupos Corporativos
          </h3>
          <div className="flex gap-2 max-w-sm">
            <input type="text" placeholder="Nombre del nuevo grupo..." value={novoGrupo} onChange={e => setNovoGrupo(e.target.value)} className="flex-1 px-3 py-1 bg-slate-50 border rounded-lg text-xs outline-none"/>
            <button type="button" onClick={() => { if(novoGrupo) { setGrupos([...grupos, { id: Date.now(), nome: novoGrupo }]); setNovoGrupo(''); } }} className="px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-slate-800 cursor-pointer">Crear</button>
          </div>
        </div>

        {/* 🔘 BOTÓN DE ACCIÓN QUE ABRE EL POP-UP */}
        <button 
          type="button" 
          onClick={() => { setFormAluno({ id: null, nome: '', empresa: '', grupo: '', email: '', cursoVinculadoId: '' }); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          <UserPlus size={14}/> Matricular Alumno B2B
        </button>
      </div>

      {/* 📋 LISTA DE ALUMNOS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Lista de Alumnos Registrados</h3>
          <div className="relative"><Search className="absolute left-3 top-2 text-slate-400" size={12}/><input type="text" placeholder="Buscar alumno..." value={buscaAluno} onChange={e => setBuscaAluno(e.target.value)} className="pl-8 pr-4 py-1 bg-slate-100 rounded-lg text-xs outline-none w-48"/></div>
        </div>
        <table className="w-full text-left border-collapse text-xs font-medium">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-black uppercase border-b"><th className="p-4">Estudiante</th><th className="p-4">Empresa</th><th className="p-4">Curso Vinculado en Supabase</th><th className="p-4 text-center">Acciones</th></tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {alunos.filter(a => a.nome.toLowerCase().includes(buscaAluno.toLowerCase())).map(a => (
              <tr key={a.id} className="hover:bg-slate-50/60">
                <td className="p-4 font-black text-slate-900">{a.nome}</td>
                <td className="p-4 font-bold text-slate-400">{a.empresa}</td>
                <td className="p-4 text-indigo-600 font-bold">
                  {cursosCatalogo.find(c => String(c.id) === String(a.cursoVinculadoId)) ? (
                    <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-lg font-black block text-center">
                      🎓 {cursosCatalogo.find(c => String(c.id) === String(a.cursoVinculadoId))?.titulo}
                    </span>
                  ) : (
                    <span className="text-slate-400">{a.grupo || 'Individual'}</span>
                  )}
                </td>
                <td className="p-4"><div className="flex items-center justify-center gap-2">
                  <button type="button" onClick={() => handleAbrirEditar(a)} className="p-1.5 bg-slate-100 text-slate-600 rounded border hover:bg-amber-50 cursor-pointer"><Edit3 size={13}/></button>
                  <button type="button" onClick={() => setAlunos(alunos.filter(x => x.id !== a.id))} className="p-1.5 bg-slate-100 text-slate-300 rounded border hover:bg-red-50 cursor-pointer"><Trash2 size={13}/></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🎭 POP-UP FLOTANTE (MODAL INTERACTIVO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-2xl shadow-xl border w-full max-w-lg p-6 space-y-4 relative mx-4 animate-[scaleUp_0.15s_ease-out]">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18}/></button>
            
            <div className="border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{formAluno.id ? '📝 Editar Ficha del Estudiante' : '👤 Matricular Alumno Corporativo'}</h3>
              <p className="text-[11px] text-slate-400 font-medium">Asigna datos de empresa y conecta flujos de inteligencia artificial de Supabase.</p>
            </div>

            <form onSubmit={handleSalvarAluno} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Nombre Completo</span><input type="text" value={formAluno.nome} onChange={e => setFormAluno({...formAluno, nome: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none" required/></div>
              <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Empresa Partner</span><input type="text" value={formAluno.empresa} onChange={e => setFormAluno({...formAluno, empresa: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none"/></div>
              <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Grupo Asociado</span><select value={formAluno.grupo} onChange={e => setFormAluno({...formAluno, grupo: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none font-bold"><option value="">Ninguno / Individual</option>{grupos.map(g => <option key={g.id} value={g.nome}>{g.nome}</option>)}</select></div>
              <div className="space-y-1"><span className="text-[10px] text-indigo-600 font-black uppercase">Flujo del Curso (Supabase)</span><select value={formAluno.cursoVinculadoId} onChange={e => setFormAluno({...formAluno, cursoVinculadoId: e.target.value})} className="w-full px-3 py-2 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl outline-none font-black cursor-pointer shadow-sm"><option value="">No vincular curso aún...</option>{cursosCatalogo.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}</select></div>
              <div className="space-y-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Correo Corporativo</span><input type="email" value={formAluno.email} onChange={e => setFormAluno({...formAluno, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none" required/></div>
              
              <div className="flex gap-2 pt-3 border-t justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase rounded-xl transition-all cursor-pointer shadow-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
