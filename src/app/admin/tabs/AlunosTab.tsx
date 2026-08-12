// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, Users, Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function AlunosTab() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const carregarAlunos = async () => {
    setLoading(true);
    try {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, name, email, current_level, total_xp')
        .order('name');
      if (error) throw error;

      const { data: subsData } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan_category, expiration_date');

      const mapaSubs = {};
      (subsData || []).forEach((s) => { mapaSubs[s.user_id] = s; });

      const combinados = (usersData || []).map((u) => ({
        ...u,
        plan_category: mapaSubs[u.id]?.plan_category || '-',
        expiration_date: mapaSubs[u.id]?.expiration_date || null,
      }));

      setAlunos(combinados);
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarAlunos();
  }, []);

  const alunosFiltrados = alunos.filter((a) =>
    !busca || a.name?.toLowerCase().includes(busca.toLowerCase()) || a.email?.toLowerCase().includes(busca.toLowerCase())
  );

  const formatarData = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const vencido = (iso) => {
    if (!iso) return false;
    return new Date(iso) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><Users size={18} className="text-cyan-400" /> Alumnos</h2>
        <button onClick={carregarAlunos} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nombre o e-mail..." className="w-full bg-[#0a1424] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500" />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : alunosFiltrados.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum aluno encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 uppercase text-[10px] border-b border-white/10">
                <th className="py-2 pr-4">Nome</th>
                <th className="py-2 pr-4">E-mail</th>
                <th className="py-2 pr-4">Nível</th>
                <th className="py-2 pr-4">XP Total</th>
                <th className="py-2 pr-4">Plano</th>
                <th className="py-2 pr-4">Vencimento</th>
              </tr>
            </thead>
            <tbody>
              {alunosFiltrados.slice(0, 100).map((a) => (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-slate-200 font-bold">{a.name || '-'}</td>
                  <td className="py-2 pr-4 text-slate-400">{a.email}</td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded uppercase">{a.current_level || '-'}</span></td>
                  <td className="py-2 pr-4 text-slate-300">{a.total_xp ?? 0}</td>
                  <td className="py-2 pr-4 text-slate-300">{a.plan_category}</td>
                  <td className={`py-2 pr-4 font-bold ${vencido(a.expiration_date) ? 'text-rose-400' : 'text-emerald-400'}`}>{formatarData(a.expiration_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {alunosFiltrados.length > 100 && <p className="text-[10px] text-slate-500 mt-2">Mostrando os primeiros 100 de {alunosFiltrados.length} resultados. Refine a busca.</p>}
        </div>
      )}
    </div>
  );
}
