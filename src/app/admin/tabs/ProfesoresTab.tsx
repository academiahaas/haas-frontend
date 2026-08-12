// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, GraduationCap, Plus, Trash2, X, CheckCircle2, DollarSign } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function ProfesoresTab() {
  const [professores, setProfessores] = useState([]);
  const [aulasConfirmadas, setAulasConfirmadas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoValor, setNovoValor] = useState('30000');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { data: profs } = await supabase.from('teachers').select('*').order('created_at', { ascending: false });
      setProfessores(profs || []);

      const { data: aulas } = await supabase.from('aulas_disponiveis').select('id, teacher_id, data_hora_inicio').eq('confirmada_via_meet', true).not('teacher_id', 'is', null);
      setAulasConfirmadas(aulas || []);

      const { data: pags } = await supabase.from('teacher_payments').select('*').order('paid_at', { ascending: false });
      setPagamentos(pags || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarDados();
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
        rate_per_class: novoValor ? Number(novoValor) : 30000,
        payment_status: 'ativo',
      }]);
      if (error) throw error;
      setNovoNome('');
      setNovoEmail('');
      setNovoValor('30000');
      setModalAberto(false);
      carregarDados();
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
      carregarDados();
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  // Calcula quantas aulas confirmadas o professor deu DESDE o último pagamento
  const calcularPendente = (professorId, ratePerClass) => {
    const ultimoPagamento = pagamentos.filter((p) => p.teacher_id === professorId).sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at))[0];
    const dataCorte = ultimoPagamento ? new Date(ultimoPagamento.paid_at) : new Date('2020-01-01');

    const aulasNaoPagas = aulasConfirmadas.filter((a) => a.teacher_id === professorId && new Date(a.data_hora_inicio) > dataCorte);
    return { quantidade: aulasNaoPagas.length, valor: aulasNaoPagas.length * Number(ratePerClass || 0) };
  };

  const handleMarcarComoPago = async (professor) => {
    const { quantidade, valor } = calcularPendente(professor.id, professor.rate_per_class);
    if (quantidade === 0) {
      alert('Nenhuma aula pendente de pagamento para este profesor.');
      return;
    }
    const seguro = confirm(`Confirmar pago de $ ${valor.toLocaleString('es-CO')} (${quantidade} clases) para ${professor.name}?`);
    if (!seguro) return;
    try {
      const { error } = await supabase.from('teacher_payments').insert([{
        teacher_id: professor.id,
        amount: valor,
        periodo_inicio: new Date('2020-01-01').toISOString(),
        periodo_fim: new Date().toISOString(),
      }]);
      if (error) throw error;

      // Registra também na aba de Gastos, para entrar no balance mensal
      const hoje = new Date();
      const mesReferencia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
      await supabase.from('gastos').insert([{
        descricao: `Pago profesor: ${professor.name} (${quantidade} clases)`,
        categoria: 'variavel',
        valor: valor,
        mes_referencia: mesReferencia,
      }]);

      carregarDados();
    } catch (err) {
      alert('Erro ao registrar pagamento: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><GraduationCap size={18} className="text-cyan-400" /> Profesores</h2>
        <div className="flex gap-2">
          <button onClick={carregarDados} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
          <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">
            <Plus size={14} /> Novo Professor
          </button>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-[11px] text-cyan-300">
        ✅ Las clases se confirman automáticamente vía Google Meet (asistencia real verificada) antes de contar para el pago.
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : professores.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum professor cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {professores.map((p) => {
            const { quantidade, valor } = calcularPendente(p.id, p.rate_per_class);
            return (
              <div key={p.id} className="bg-[#0a1424] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-white text-sm">{p.name}</h3>
                    <p className="text-xs text-slate-400">{p.email}</p>
                    <p className="text-xs text-cyan-400 font-bold mt-1">$ {Number(p.rate_per_class || 0).toLocaleString('es-CO')} / clase</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${p.payment_status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>{p.payment_status}</span>
                  </div>
                  <button onClick={() => handleExcluir(p.id, p.name)} className="text-rose-400/70 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-amber-400 uppercase font-bold">Pendiente ({quantidade} clases)</p>
                    <p className="text-sm font-black text-amber-300">$ {valor.toLocaleString('es-CO')}</p>
                  </div>
                  <button onClick={() => handleMarcarComoPago(p)} disabled={quantidade === 0} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed">
                    <CheckCircle2 size={12} /> Marcar Pagado
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Clases Totales</p>
                    <p className="text-sm font-black text-slate-300">{aulasConfirmadas.filter((a) => a.teacher_id === p.id).length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Avaliação IA</p>
                    <p className="text-sm font-black text-slate-500">—</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Reclamações</p>
                    <p className="text-sm font-black text-slate-500">—</p>
                  </div>
                </div>
              </div>
            );
          })}
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
            <input value={novoValor} onChange={(e) => setNovoValor(e.target.value)} type="number" placeholder="Valor por clase (COP)" className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <button onClick={handleCriarProfessor} className="mt-2 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">Cadastrar Professor</button>
          </div>
        </div>
      )}
    </div>
  );
}
