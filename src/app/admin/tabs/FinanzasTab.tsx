// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, Wallet, CheckCircle2, Clock, Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function FinanzasTab() {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');

  const carregarPagamentos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      setPagamentos(data || []);
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarPagamentos();
  }, []);

  const pagamentosFiltrados = pagamentos.filter(p => {
    const passaFiltroStatus = filtro === 'todos' || p.status === filtro;
    const passaBusca = !busca || p.user_email?.toLowerCase().includes(busca.toLowerCase()) || p.plan_category?.toLowerCase().includes(busca.toLowerCase());
    return passaFiltroStatus && passaBusca;
  });

  const totalConfirmado = pagamentos.filter(p => p.status === 'completed').reduce((soma, p) => soma + Number(p.amount || 0), 0);
  const totalPendente = pagamentos.filter(p => p.status === 'pending').reduce((soma, p) => soma + Number(p.amount || 0), 0);
  const qtdConfirmados = pagamentos.filter(p => p.status === 'completed').length;
  const qtdPendentes = pagamentos.filter(p => p.status === 'pending').length;

  const formatarData = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><Wallet size={18} className="text-cyan-400" /> Finanzas</h2>
        <button onClick={carregarPagamentos} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-emerald-400 uppercase">Confirmado</p>
          <p className="text-lg font-black text-emerald-300">$ {totalConfirmado.toLocaleString('es-CO')}</p>
          <p className="text-[10px] text-emerald-500/80">{qtdConfirmados} pagamentos</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-amber-400 uppercase">Pendente</p>
          <p className="text-lg font-black text-amber-300">$ {totalPendente.toLocaleString('es-CO')}</p>
          <p className="text-[10px] text-amber-500/80">{qtdPendentes} pagamentos</p>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por e-mail ou plano..." className="w-full bg-[#0a1424] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500" />
        </div>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="bg-[#0a1424] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="todos">Todos</option>
          <option value="completed">Confirmados</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : pagamentosFiltrados.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum pagamento encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 uppercase text-[10px] border-b border-white/10">
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">E-mail</th>
                <th className="py-2 pr-4">Plano</th>
                <th className="py-2 pr-4">Valor</th>
                <th className="py-2 pr-4">Criado</th>
                <th className="py-2 pr-4">Confirmado</th>
              </tr>
            </thead>
            <tbody>
              {pagamentosFiltrados.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="py-2 pr-4">
                    {p.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 size={12} /> Confirmado</span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 font-bold"><Clock size={12} /> Pendente</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-slate-300">{p.user_email}</td>
                  <td className="py-2 pr-4 text-slate-300">{p.plan_category}</td>
                  <td className="py-2 pr-4 font-bold text-white">$ {Number(p.amount).toLocaleString('es-CO')}</td>
                  <td className="py-2 pr-4 text-slate-500">{formatarData(p.created_at)}</td>
                  <td className="py-2 pr-4 text-slate-500">{formatarData(p.completed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
