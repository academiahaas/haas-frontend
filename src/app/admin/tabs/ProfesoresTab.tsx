// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, GraduationCap, Plus, Trash2, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function ProfesoresTab() {
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoValor, setNovoValor] = useState('');

  const carregarProfessores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('teachers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProfessores(data || []);
    } catch (err) {
      console.error('Erro ao carregar professores:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarProfessores();
  }, []);

  const handleCriarProfessor = async () => {
    if (!novoNome.trim() || !novoEmail.trim()) {
      alert('Preencha nome e e-mail.');
      return;
    }
    try {
      const { error } = await supabase.from('teachers').insert([{
        name: novoNome.trim(),
        email: novoEmail.trim().toLowerCase(),
        monthly_rate: novoValor ? Number(novoValor) : null,
      }]);
      if (error) throw error;
      setNovoNome('');
      setNovoEmail('');
      setNovoValor('');
      setModalAberto(false);
      carregarProfessores();
    } catch (err) {
      alert('Erro ao criar professor: ' + err.message);
    }
  };

  const handleExcluir = async (id, nome) => {
    const seguro = confirm(`Deseja realmente excluir o professor "${nome}"?`);
    if (!seguro) return;
    try {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) throw error;
      carregarProfessores();
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><GraduationCap size={18} className="text-cyan-400" /> Profesores</h2>
        <div className="flex gap-2">
          <button onClick={carregarProfessores} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
          <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">
            <Plus size={14} /> Novo Professor
          </button>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300">
        ⚠️ Estrutura pronta para automação futura de pagamentos e métricas por IA. Contagem de horas ainda não está ativa.
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : professores.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum professor cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {professores.map((p) => (
            <div key={p.id} className="bg-[#0a1424] border border-white/10 rounded-xl p-4 flex items-start justify-between">
              <div>
                <h3 className="font-black text-white text-sm">{p.name}</h3>
                <p className="text-xs text-slate-400">{p.email}</p>
                {p.monthly_rate && <p className="text-xs text-cyan-400 font-bold mt-1">$ {Number(p.monthly_rate).toLocaleString('es-CO')} / mes</p>}
                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${p.payment_status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>{p.payment_status}</span>
              </div>
              <button onClick={() => handleExcluir(p.id, p.name)} className="text-rose-400/70 hover:text-rose-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-[#0a1424] border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white">Novo Professor</h3>
              <button onClick={() => setModalAberto(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome do professor" className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <input value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} placeholder="E-mail" className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <input value={novoValor} onChange={(e) => setNovoValor(e.target.value)} type="number" placeholder="Valor mensal combinado (opcional)" className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <button onClick={handleCriarProfessor} className="mt-2 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">Cadastrar Professor</button>
          </div>
        </div>
      )}
    </div>
  );
}
