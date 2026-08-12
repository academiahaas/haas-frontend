// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, Receipt, Plus, Trash2, X, TrendingUp, TrendingDown } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MESES_NOMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function GastosTab() {
  const [gastos, setGastos] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
  });

  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('fixo');
  const [novoValor, setNovoValor] = useState('');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { data: gastosData } = await supabase.from('gastos').select('*').order('mes_referencia', { ascending: false });
      setGastos(gastosData || []);
      const { data: pagamentosData } = await supabase.from('payments').select('amount, completed_at, status').eq('status', 'completed');
      setPagamentos(pagamentosData || []);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCriarGasto = async () => {
    if (!novaDescricao.trim() || !novoValor) {
      alert('Preencha a descrição e o valor.');
      return;
    }
    try {
      const { error } = await supabase.from('gastos').insert([{
        descricao: novaDescricao.trim(),
        categoria: novaCategoria,
        valor: Number(novoValor),
        mes_referencia: mesSelecionado,
      }]);
      if (error) throw error;
      setNovaDescricao('');
      setNovoValor('');
      setModalAberto(false);
      carregarDados();
    } catch (err) {
      alert('Erro ao criar gasto: ' + err.message);
    }
  };

  const handleExcluirGasto = async (id) => {
    const seguro = confirm('Deseja realmente excluir este gasto?');
    if (!seguro) return;
    try {
      const { error } = await supabase.from('gastos').delete().eq('id', id);
      if (error) throw error;
      carregarDados();
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const gastosDoMes = gastos.filter((g) => g.mes_referencia === mesSelecionado);
  const totalGastosMes = gastosDoMes.reduce((soma, g) => soma + Number(g.valor), 0);
  const totalFixoMes = gastosDoMes.filter((g) => g.categoria === 'fixo').reduce((s, g) => s + Number(g.valor), 0);
  const totalVariavelMes = gastosDoMes.filter((g) => g.categoria === 'variavel').reduce((s, g) => s + Number(g.valor), 0);

  const receitaDoMes = pagamentos.filter((p) => {
    if (!p.completed_at) return false;
    const dataP = new Date(p.completed_at);
    const [anoRef, mesRef] = mesSelecionado.split('-');
    return dataP.getFullYear() === Number(anoRef) && (dataP.getMonth() + 1) === Number(mesRef);
  }).reduce((soma, p) => soma + Number(p.amount || 0), 0);

  const lucroMes = receitaDoMes - totalGastosMes;

  // Histórico dos últimos 6 meses com dado
  const mesesComDado = [...new Set(gastos.map((g) => g.mes_referencia))].sort().reverse().slice(0, 6);

  const formatarMes = (dataStr) => {
    const [ano, mes] = dataStr.split('-');
    return `${MESES_NOMES[Number(mes) - 1]} ${ano}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><Receipt size={18} className="text-cyan-400" /> Gastos & Balance</h2>
        <div className="flex gap-2 items-center">
          <input type="month" value={mesSelecionado.substring(0, 7)} onChange={(e) => setMesSelecionado(e.target.value + '-01')} className="bg-[#0a1424] border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          <button onClick={carregarDados} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
          <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">
            <Plus size={14} /> Nuevo Gasto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1"><TrendingUp size={10} /> Ingresos</p>
          <p className="text-lg font-black text-emerald-300">$ {receitaDoMes.toLocaleString('es-CO')}</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1"><TrendingDown size={10} /> Gastos</p>
          <p className="text-lg font-black text-rose-300">$ {totalGastosMes.toLocaleString('es-CO')}</p>
          <p className="text-[9px] text-rose-400/70">Fijo: ${totalFixoMes.toLocaleString('es-CO')} | Variable: ${totalVariavelMes.toLocaleString('es-CO')}</p>
        </div>
        <div className={`rounded-xl p-3 border ${lucroMes >= 0 ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <p className={`text-[10px] font-bold uppercase ${lucroMes >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>Balance</p>
          <p className={`text-lg font-black ${lucroMes >= 0 ? 'text-cyan-300' : 'text-amber-300'}`}>$ {lucroMes.toLocaleString('es-CO')}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Mes</p>
          <p className="text-sm font-black text-white">{formatarMes(mesSelecionado)}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : gastosDoMes.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum gasto cadastrado neste mês.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 uppercase text-[10px] border-b border-white/10">
                <th className="py-2 pr-4">Descripción</th>
                <th className="py-2 pr-4">Categoría</th>
                <th className="py-2 pr-4">Valor</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {gastosDoMes.map((g) => (
                <tr key={g.id} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-slate-200">{g.descricao}</td>
                  <td className="py-2 pr-4"><span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${g.categoria === 'fixo' ? 'bg-slate-500/10 text-slate-300' : 'bg-violet-500/10 text-violet-300'}`}>{g.categoria}</span></td>
                  <td className="py-2 pr-4 font-bold text-white">$ {Number(g.valor).toLocaleString('es-CO')}</td>
                  <td className="py-2 pr-4"><button onClick={() => handleExcluirGasto(g.id)} className="text-rose-400/70 hover:text-rose-400"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mesesComDado.length > 1 && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Histórico (últimos meses con datos)</p>
          <div className="flex flex-col gap-1.5">
            {mesesComDado.map((mes) => {
              const totalMes = gastos.filter((g) => g.mes_referencia === mes).reduce((s, g) => s + Number(g.valor), 0);
              return (
                <div key={mes} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-xs">
                  <span className="text-slate-300">{formatarMes(mes)}</span>
                  <span className="font-bold text-rose-300">$ {totalMes.toLocaleString('es-CO')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-[#0a1424] border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white">Nuevo Gasto</h3>
              <button onClick={() => setModalAberto(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <input value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} placeholder="Descripción (ej: Alquiler oficina)" className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <select value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="fixo">Fijo</option>
              <option value="variavel">Variable</option>
            </select>
            <input value={novoValor} onChange={(e) => setNovoValor(e.target.value)} type="number" placeholder="Valor" className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <button onClick={handleCriarGasto} className="mt-2 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">Guardar Gasto</button>
          </div>
        </div>
      )}
    </div>
  );
}
