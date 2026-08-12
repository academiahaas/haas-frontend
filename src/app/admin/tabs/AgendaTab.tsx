// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, CalendarClock, Plus, XCircle, CheckCircle2, X, Wand2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function AgendaTab() {
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  });
  const [idiomaFiltro, setIdiomaFiltro] = useState('ingles');
  const [novoIdioma, setNovoIdioma] = useState('ingles');
  const [horarios, setHorarios] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  const [novaHora, setNovaHora] = useState('09:00');
  const [novoTipo, setNovoTipo] = useState('PARTICULAR');
  const [novasVagas, setNovasVagas] = useState('1');
  const [novoProfessorId, setNovoProfessorId] = useState('');

  const carregarProfessores = async () => {
    try {
      const { data } = await supabase.from('teachers').select('id, name').eq('payment_status', 'ativo');
      setProfessores(data || []);
    } catch (err) {
      console.error('Erro ao carregar professores:', err);
    }
  };

  const carregarHorarios = async () => {
    setLoading(true);
    try {
      const inicioDiaBogota = new Date(`${dataSelecionada}T00:00:00-05:00`);
      const fimDiaBogota = new Date(`${dataSelecionada}T23:59:59-05:00`);

      const { data, error } = await supabase
        .from('aulas_disponiveis')
        .select('*, teachers(name)')
        .eq('idioma', idiomaFiltro)
        .gte('data_hora_inicio', inicioDiaBogota.toISOString())
        .lte('data_hora_inicio', fimDiaBogota.toISOString())
        .order('data_hora_inicio');

      if (error) throw error;
      setHorarios(data || []);
    } catch (err) {
      console.error('Erro ao carregar horários:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarProfessores();
  }, []);

  useEffect(() => {
    carregarHorarios();
  }, [dataSelecionada, idiomaFiltro]);

  const formatarHoraBogota = (iso) => {
    return new Date(iso).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleCancelarHorario = async (id) => {
    try {
      const { error } = await supabase.from('aulas_disponiveis').update({ status: 'CANCELADO' }).eq('id', id);
      if (error) throw error;
      carregarHorarios();
    } catch (err) {
      alert('Erro ao cancelar: ' + err.message);
    }
  };

  const handleReabrirHorario = async (id) => {
    try {
      const { error } = await supabase.from('aulas_disponiveis').update({ status: 'DISPONIVEL' }).eq('id', id);
      if (error) throw error;
      carregarHorarios();
    } catch (err) {
      alert('Erro ao reabrir: ' + err.message);
    }
  };

  const handleFecharDiaInteiro = async () => {
    const seguro = confirm(`Deseja realmente fechar TODOS os horários do dia ${dataSelecionada}?`);
    if (!seguro) return;
    try {
      const ids = horarios.filter((h) => h.status === 'DISPONIVEL').map((h) => h.id);
      if (ids.length === 0) return;
      const { error } = await supabase.from('aulas_disponiveis').update({ status: 'CANCELADO' }).in('id', ids);
      if (error) throw error;
      carregarHorarios();
    } catch (err) {
      alert('Erro ao fechar o dia: ' + err.message);
    }
  };

  // Escolhe automaticamente o professor com menos horários no dia selecionado
  const escolherProfessorAutomatico = () => {
    if (professores.length === 0) return '';
    const contagem = {};
    professores.forEach((p) => { contagem[p.id] = 0; });
    horarios.forEach((h) => { if (h.teacher_id && contagem[h.teacher_id] !== undefined) contagem[h.teacher_id]++; });
    const ordenado = [...professores].sort((a, b) => contagem[a.id] - contagem[b.id]);
    return ordenado[0]?.id || '';
  };

  const handleAbrirModal = () => {
    setNovoProfessorId(escolherProfessorAutomatico());
    setModalAberto(true);
  };

  const handleCriarHorario = async () => {
    try {
      const inicioBogota = new Date(`${dataSelecionada}T${novaHora}:00-05:00`);
      const fimBogota = new Date(inicioBogota.getTime() + 60 * 60 * 1000);

      const { error } = await supabase.from('aulas_disponiveis').insert([{
        data_hora_inicio: inicioBogota.toISOString(),
        data_hora_fim: fimBogota.toISOString(),
        tipo_aula: novoTipo,
        vagas_maximas: Number(novasVagas),
        vagas_ocupadas: 0,
        status: 'DISPONIVEL',
        idioma: novoIdioma,
        teacher_id: novoProfessorId || null,
      }]);

      if (error) throw error;
      setModalAberto(false);
      carregarHorarios();
    } catch (err) {
      alert('Erro ao criar horário: ' + err.message);
    }
  };

  const handleTrocarProfessor = async (horarioId, professorId) => {
    try {
      const { error } = await supabase.from('aulas_disponiveis').update({ teacher_id: professorId || null }).eq('id', horarioId);
      if (error) throw error;
      carregarHorarios();
    } catch (err) {
      alert('Erro ao trocar professor: ' + err.message);
    }
  };

  const corStatus = (status) => {
    if (status === 'DISPONIVEL') return 'text-emerald-400 bg-emerald-500/10';
    if (status === 'LOTADO') return 'text-amber-400 bg-amber-500/10';
    return 'text-rose-400 bg-rose-500/10';
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><CalendarClock size={18} className="text-cyan-400" /> Agenda</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <select value={idiomaFiltro} onChange={(e) => setIdiomaFiltro(e.target.value)} className="bg-[#0a1424] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
            <option value="ingles">Inglés</option>
            <option value="portugues">Portugués</option>
            <option value="espanol">Español</option>
            <option value="frances">Francés</option>
          </select>
          <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} className="bg-[#0a1424] border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          <button onClick={carregarHorarios} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
          <button onClick={handleAbrirModal} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">
            <Plus size={14} /> Abrir Horario
          </button>
          <button onClick={handleFecharDiaInteiro} className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-wider rounded-lg border border-rose-500/20">
            <XCircle size={14} /> Cerrar Día
          </button>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 shrink-0">Todos los horarios se muestran en zona horaria de Colombia (Bogotá). {professores.length === 0 && '⚠️ No hay profesores activos — asignación manual únicamente.'}</p>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : horarios.length === 0 ? (
        <p className="text-sm text-slate-400">Ningún horario para este día. Usa "Abrir Horario" para crear uno.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {horarios.map((h) => (
            <div key={h.id} className="bg-[#0a1424] border border-white/10 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">{formatarHoraBogota(h.data_hora_inicio)}</p>
                  <p className="text-[10px] text-slate-400">{h.tipo_aula} · {h.vagas_ocupadas}/{h.vagas_maximas} vagas</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded uppercase ${corStatus(h.status)}`}>{h.status}</span>
                </div>
                {h.status === 'CANCELADO' ? (
                  <button onClick={() => handleReabrirHorario(h.id)} className="text-emerald-400/70 hover:text-emerald-400" title="Reabrir">
                    <CheckCircle2 size={18} />
                  </button>
                ) : (
                  <button onClick={() => handleCancelarHorario(h.id)} className="text-rose-400/70 hover:text-rose-400" title="Cerrar">
                    <XCircle size={18} />
                  </button>
                )}
              </div>
              <select value={h.teacher_id || ''} onChange={(e) => handleTrocarProfessor(h.id, e.target.value)} className="bg-[#030914] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white">
                <option value="">Sin profesor asignado</option>
                {professores.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-[#0a1424] border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white">Abrir Nuevo Horario</h3>
              <button onClick={() => setModalAberto(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <p className="text-[10px] text-slate-500">Fecha: {dataSelecionada} (hora de Bogotá)</p>
            <input type="time" value={novaHora} onChange={(e) => setNovaHora(e.target.value)} className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <select value={novoTipo} onChange={(e) => { setNovoTipo(e.target.value); setNovasVagas(e.target.value === 'GRUPO' ? '8' : '1'); }} className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="PARTICULAR">Particular</option>
              <option value="GRUPO">Grupo</option>
            </select>
            <select value={novoIdioma} onChange={(e) => setNovoIdioma(e.target.value)} className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="ingles">Inglés</option>
              <option value="portugues">Portugués</option>
              <option value="espanol">Español</option>
              <option value="frances">Francés</option>
            </select>
            <input type="number" value={novasVagas} onChange={(e) => setNovasVagas(e.target.value)} placeholder="Vagas máximas" className="bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Profesor</span>
                <button type="button" onClick={() => setNovoProfessorId(escolherProfessorAutomatico())} className="text-[10px] text-cyan-400 font-bold flex items-center gap-1"><Wand2 size={10} /> Auto-asignar</button>
              </div>
              <select value={novoProfessorId} onChange={(e) => setNovoProfessorId(e.target.value)} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Sin profesor asignado</option>
                {professores.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button onClick={handleCriarHorario} className="mt-2 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg">Crear Horario</button>
          </div>
        </div>
      )}
    </div>
  );
}
