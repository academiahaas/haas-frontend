// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { Trash2, Plus, RefreshCw, Building2, Users, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PLANOS_CORPORATIVOS = ['Corporate Basic', 'Corporate VIP Pro', 'Corporate Group'];

export function EmpresasTab() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalColaboradoresAberto, setModalColaboradoresAberto] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [todosAlunos, setTodosAlunos] = useState([]);
  const [buscaAluno, setBuscaAluno] = useState('');

  const [novoNome, setNovoNome] = useState('');
  const [novoEmailChefe, setNovoEmailChefe] = useState('');
  const [novoPlano, setNovoPlano] = useState(PLANOS_CORPORATIVOS[0]);

  const carregarEmpresas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('corporate_accounts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setEmpresas(data || []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const handleCriarEmpresa = async () => {
    if (!novoNome.trim() || !novoEmailChefe.trim()) {
      alert('Preencha o nome da empresa e o e-mail do responsável.');
      return;
    }
    try {
      const { error } = await supabase.from('corporate_accounts').insert([{
        company_name: novoNome.trim(),
        boss_email: novoEmailChefe.trim().toLowerCase(),
        plan_category: novoPlano,
      }]);
      if (error) throw error;
      setNovoNome('');
      setNovoEmailChefe('');
      setNovoPlano(PLANOS_CORPORATIVOS[0]);
      setModalAberto(false);
      carregarEmpresas();
    } catch (err) {
      alert('Erro ao criar empresa: ' + err.message);
    }
  };

  const handleExcluirEmpresa = async (id, nome) => {
    const seguro = confirm(`Deseja realmente excluir a empresa "${nome}"? Os alunos vinculados não serão excluídos, apenas desvinculados.`);
    if (!seguro) return;
    try {
      await supabase.from('users').update({ corporate_account_id: null }).eq('corporate_account_id', id);
      const { error } = await supabase.from('corporate_accounts').delete().eq('id', id);
      if (error) throw error;
      carregarEmpresas();
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const abrirColaboradores = async (empresa) => {
    setModalColaboradoresAberto(empresa);
    setBuscaAluno('');
    try {
      const { data: vinculados } = await supabase.from('users').select('id, name, email').eq('corporate_account_id', empresa.id);
      setColaboradores(vinculados || []);
      const { data: todos } = await supabase.from('users').select('id, name, email, corporate_account_id').order('name');
      setTodosAlunos(todos || []);
    } catch (err) {
      console.error('Erro ao carregar colaboradores:', err);
    }
  };

  const handleVincularAluno = async (alunoId) => {
    try {
      await supabase.from('users').update({ corporate_account_id: modalColaboradoresAberto.id }).eq('id', alunoId);
      abrirColaboradores(modalColaboradoresAberto);
    } catch (err) {
      alert('Erro ao vincular aluno: ' + err.message);
    }
  };

  const handleDesvincularAluno = async (alunoId) => {
    try {
      await supabase.from('users').update({ corporate_account_id: null }).eq('id', alunoId);
      abrirColaboradores(modalColaboradoresAberto);
    } catch (err) {
      alert('Erro ao desvincular aluno: ' + err.message);
    }
  };

  const alunosDisponiveisFiltrados = todosAlunos.filter(a =>
    !a.corporate_account_id &&
    (a.name?.toLowerCase().includes(buscaAluno.toLowerCase()) || a.email?.toLowerCase().includes(buscaAluno.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><Building2 size={18} className="text-cyan-400" /> Empresas Corporativas</h2>
        <div className="flex gap-2">
          <button onClick={carregarEmpresas} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
          <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">
            <Plus size={14} /> Nova Empresa
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : empresas.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhuma empresa cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {empresas.map((empresa) => (
            <div key={empresa.id} className="bg-[#0a1424] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-white text-sm">{empresa.company_name}</h3>
                  <p className="text-xs text-slate-400">{empresa.boss_email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded uppercase">{empresa.plan_category}</span>
                </div>
                <button onClick={() => handleExcluirEmpresa(empresa.id, empresa.company_name)} className="text-rose-400/70 hover:text-rose-400">
                  <Trash2 size={16} />
                </button>
              </div>
              <button onClick={() => abrirColaboradores(empresa)} className="mt-2 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-lg border border-white/10">
                <Users size={14} /> Gerenciar Colaboradores
              </button>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-[#0a1424] border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white">Nova Empresa</h3>
              <button onClick={() => setModalAberto(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome da empresa" className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <input value={novoEmailChefe} onChange={(e) => setNovoEmailChefe(e.target.value)} placeholder="E-mail do responsável" className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <select value={novoPlano} onChange={(e) => setNovoPlano(e.target.value)} className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              {PLANOS_CORPORATIVOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button onClick={handleCriarEmpresa} className="mt-2 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">Criar Empresa</button>
          </div>
        </div>
      )}

      {modalColaboradoresAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalColaboradoresAberto(null)}>
          <div className="bg-[#0a1424] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white">Colaboradores — {modalColaboradoresAberto.company_name}</h3>
              <button onClick={() => setModalColaboradoresAberto(null)}><X size={18} className="text-slate-400" /></button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Vinculados ({colaboradores.length})</p>
              {colaboradores.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhum colaborador vinculado ainda.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {colaboradores.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-200">{c.name || c.email}</span>
                      <button onClick={() => handleDesvincularAluno(c.id)} className="text-[10px] text-rose-400 font-bold uppercase">Remover</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2 mt-2">Adicionar Aluno</p>
              <input value={buscaAluno} onChange={(e) => setBuscaAluno(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 mb-2" />
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {alunosDisponiveisFiltrados.slice(0, 20).map((a) => (
                  <div key={a.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-xs text-slate-200">{a.name || a.email}</span>
                    <button onClick={() => handleVincularAluno(a.id)} className="text-[10px] text-cyan-400 font-bold uppercase">Adicionar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
