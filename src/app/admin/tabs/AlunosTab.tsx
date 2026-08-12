// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, Users, Search, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
        .select('id, name, email, current_level, total_xp, score_fala, score_escuta, score_leitura, score_escrita, score_gramatica, last_study_date')
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

  const diasSemEstudar = (dataStr) => {
    if (!dataStr) return null;
    const ultimaData = new Date(dataStr);
    const hoje = new Date();
    return Math.floor((hoje - ultimaData) / (1000 * 60 * 60 * 24));
  };

  // Painel geral / agregado
  const totalAlunos = alunos.length;
  const alunosAtivos = alunos.filter((a) => {
    const dias = diasSemEstudar(a.last_study_date);
    return dias !== null && dias <= 7;
  }).length;
  const alunosParados = totalAlunos - alunosAtivos;

  const mediaGeral = (campo) => {
    const validos = alunos.filter((a) => a[campo] !== null && a[campo] !== undefined);
    if (validos.length === 0) return 0;
    return Math.round(validos.reduce((soma, a) => soma + Number(a[campo] || 0), 0) / validos.length);
  };

  const dadosFrequencia = [
    { name: 'Activos (≤3d)', value: alunos.filter((a) => { const d = diasSemEstudar(a.last_study_date); return d !== null && d <= 3; }).length, color: '#34d399' },
    { name: 'Moderado (4-7d)', value: alunos.filter((a) => { const d = diasSemEstudar(a.last_study_date); return d !== null && d > 3 && d <= 7; }).length, color: '#fbbf24' },
    { name: 'Parado (>7d)', value: alunos.filter((a) => { const d = diasSemEstudar(a.last_study_date); return d !== null && d > 7; }).length, color: '#fb7185' },
    { name: 'Sin datos', value: alunos.filter((a) => diasSemEstudar(a.last_study_date) === null).length, color: '#64748b' },
  ].filter((d) => d.value > 0);

  const dadosHabilidades = [
    { name: 'Fala', valor: mediaGeral('score_fala') },
    { name: 'Escuta', valor: mediaGeral('score_escuta') },
    { name: 'Leitura', valor: mediaGeral('score_leitura') },
    { name: 'Escrita', valor: mediaGeral('score_escrita') },
    { name: 'Gramática', valor: mediaGeral('score_gramatica') },
  ];

  const COLS = "grid-cols-[1.3fr_1.5fr_70px_70px_70px_70px_70px_70px_90px_100px]";

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><Users size={18} className="text-cyan-400" /> Alumnos</h2>
        <button onClick={carregarAlunos} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-cyan-400 uppercase">Total Alumnos</p>
          <p className="text-lg font-black text-cyan-300">{totalAlunos}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-emerald-400 uppercase">Activos (7d)</p>
          <p className="text-lg font-black text-emerald-300">{alunosAtivos}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1"><AlertTriangle size={10} /> Parados</p>
          <p className="text-lg font-black text-amber-300">{alunosParados}</p>
        </div>
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-violet-400 uppercase">Media General</p>
          <p className="text-lg font-black text-violet-300">
            {Math.round((mediaGeral('score_fala') + mediaGeral('score_escuta') + mediaGeral('score_leitura') + mediaGeral('score_escrita') + mediaGeral('score_gramatica')) / 5)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
        <div className="bg-[#0a1424] border border-white/10 rounded-xl p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Frecuencia de Estudio</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={dadosFrequencia} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={(entry) => entry.value}>
                {dadosFrequencia.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a1424', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#0a1424] border border-white/10 rounded-xl p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Desempeño por Habilidad (Media General %)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dadosHabilidades}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0a1424', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11 }} />
              <Bar dataKey="valor" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="relative shrink-0">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nombre o e-mail..." className="w-full bg-[#0a1424] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500" />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : alunosFiltrados.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum aluno encontrado.</p>
      ) : (
        <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden min-h-0 flex-1">
          <div className={`grid ${COLS} gap-2 px-3 py-2 bg-[#080C16] border-b border-white/10 text-[9px] font-bold text-slate-500 uppercase shrink-0`}>
            <span>Nome</span>
            <span>E-mail</span>
            <span>Nível</span>
            <span>Fala</span>
            <span>Escuta</span>
            <span>Leitura</span>
            <span>Escrita</span>
            <span>Gram.</span>
            <span>Atividade</span>
            <span>Vencimento</span>
          </div>
          <div className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {alunosFiltrados.slice(0, 100).map((a) => {
              const dias = diasSemEstudar(a.last_study_date);
              return (
                <div key={a.id} className={`grid ${COLS} gap-2 px-3 py-2 border-b border-white/5 text-xs items-center`}>
                  <span className="text-slate-200 font-bold truncate">{a.name || '-'}</span>
                  <span className="text-slate-400 truncate">{a.email}</span>
                  <span><span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded uppercase">{a.current_level || '-'}</span></span>
                  <span className="text-slate-300">{a.score_fala ?? '-'}%</span>
                  <span className="text-slate-300">{a.score_escuta ?? '-'}%</span>
                  <span className="text-slate-300">{a.score_leitura ?? '-'}%</span>
                  <span className="text-slate-300">{a.score_escrita ?? '-'}%</span>
                  <span className="text-slate-300">{a.score_gramatica ?? '-'}%</span>
                  <span className={`font-bold ${dias === null ? 'text-slate-500' : dias <= 3 ? 'text-emerald-400' : dias <= 7 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {dias === null ? '-' : dias === 0 ? 'Hoy' : `${dias}d`}
                  </span>
                  <span className={`font-bold ${vencido(a.expiration_date) ? 'text-rose-400' : 'text-emerald-400'}`}>{formatarData(a.expiration_date)}</span>
                </div>
              );
            })}
          </div>
          {alunosFiltrados.length > 100 && <p className="text-[10px] text-slate-500 p-2 shrink-0">Mostrando os primeiros 100 de {alunosFiltrados.length} resultados. Refine a busca.</p>}
        </div>
      )}
    </div>
  );
}
