// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { Sparkles, Wand2, CheckCircle2, XCircle, RefreshCw, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TIPO_ATIVO = 1; // Só Múltipla Escolha implementada por enquanto

export function GeradorExerciciosTab() {
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [niveis, setNiveis] = useState([]);
  const [nivelId, setNivelId] = useState('');
  const [modulos, setModulos] = useState([]);
  const [moduloId, setModuloId] = useState('');
  const [unidades, setUnidades] = useState([]);
  const [unidadeId, setUnidadeId] = useState('');

  const [tiposReferencia, setTiposReferencia] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState(TIPO_ATIVO);

  const [idiomaAlvo, setIdiomaAlvo] = useState('português');
  const [idiomaNativo, setIdiomaNativo] = useState('español');

  const [horasUnidade, setHorasUnidade] = useState(null);
  const [metaCalculada, setMetaCalculada] = useState(null);
  const [contagemAtual, setContagemAtual] = useState(0);

  const [gerando, setGerando] = useState(false);
  const [rascunhos, setRascunhos] = useState([]);
  const [loadingRascunhos, setLoadingRascunhos] = useState(true);

  useEffect(() => {
    supabase.from('courses').select('id, title').then(({ data }) => setCursos(data || []));
    supabase.from('exercise_type_reference').select('*').order('tier').order('activity_type').then(({ data }) => setTiposReferencia(data || []));
    carregarRascunhos();
  }, []);

  useEffect(() => {
    setNivelId(''); setModuloId(''); setUnidadeId('');
    setModulos([]); setUnidades([]);
    if (!cursoId) { setNiveis([]); return; }
    supabase.from('levels').select('id, level_tag, level_name').eq('course_id', cursoId).order('level_tag').then(({ data }) => setNiveis(data || []));
  }, [cursoId]);

  useEffect(() => {
    setModuloId(''); setUnidadeId('');
    setUnidades([]);
    if (!nivelId) { setModulos([]); return; }
    supabase.from('modules_content').select('id, module_number, module_title').eq('level_id', nivelId).order('module_number').then(({ data }) => setModulos(data || []));
  }, [nivelId]);

  useEffect(() => {
    setUnidadeId('');
    if (!moduloId) { setUnidades([]); return; }
    supabase.from('units').select('id, unit_number, unit_title').eq('module_content_id', moduloId).order('unit_number').then(({ data }) => setUnidades(data || []));
  }, [moduloId]);

  useEffect(() => {
    if (!unidadeId || !tipoSelecionado) { setHorasUnidade(null); setMetaCalculada(null); return; }

    const unidadeSelecionada = unidades.find((u) => u.id === unidadeId);

    supabase.from('units').select('estimated_hours').eq('id', unidadeId).maybeSingle().then(({ data }) => {
      setHorasUnidade(data?.estimated_hours || null);
    });

    supabase.rpc('calcular_meta_tipo_exercicio', { p_unit_id: unidadeId, p_activity_type: tipoSelecionado }).then(({ data }) => {
      setMetaCalculada(data ?? 0);
    });

    if (unidadeSelecionada) {
      const nivelSelecionado = niveis.find((n) => n.id === nivelId);
      supabase.from('exercises')
        .select('id', { count: 'exact', head: true })
        .eq('unit', unidadeSelecionada.unit_number)
        .eq('activity_type', tipoSelecionado)
        .eq('level', nivelSelecionado?.level_tag || '')
        .eq('is_modelo_referencia', false)
        .then(({ count }) => {
          setContagemAtual(count || 0);
        });
    }
  }, [unidadeId, tipoSelecionado, unidades]);

  const carregarRascunhos = async () => {
    setLoadingRascunhos(true);
    const { data } = await supabase.from('exercises_rascunho').select('*').eq('status', 'pendente').order('created_at', { ascending: false });
    setRascunhos(data || []);
    setLoadingRascunhos(false);
  };

  const tipoInfo = tiposReferencia.find((t) => t.activity_type === tipoSelecionado);
  const faltam = metaCalculada !== null ? Math.max(0, metaCalculada - contagemAtual) : 0;

  const handleGerar = async () => {
    if (!unidadeId) {
      alert('Selecciona Curso → Nivel → Módulo → Unidad antes de generar.');
      return;
    }
    if (faltam <= 0) {
      alert('Ya se alcanzó la meta de ejercicios para este tipo en esta unidad.');
      return;
    }
    setGerando(true);
    try {
      const resp = await fetch('/api/ai/gerar-exercicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: unidadeId,
          idiomaAlvo,
          idiomaNativo,
          metaEasy: tipoInfo?.tier === 'easy' ? faltam : 0,
          metaMedium: tipoInfo?.tier === 'medium' ? faltam : 0,
          metaHard: tipoInfo?.tier === 'hard' ? faltam : 0,
        }),
      });
      const data = await resp.json();
      if (data.erro) {
        alert('Error: ' + data.erro);
      } else {
        carregarRascunhos();
      }
    } catch (err) {
      alert('Error de red: ' + err.message);
    }
    setGerando(false);
  };

  const handleAprovar = async (rascunho) => {
    try {
      const { error: erroInsert } = await supabase.from('exercises').insert([{
        activity_type: rascunho.activity_type,
        difficulty_level: rascunho.difficulty_level,
        level: rascunho.level_tag,
        module: rascunho.module,
        unit: rascunho.unit_number,
        reading_text: rascunho.reading_text,
        correct_answer: rascunho.correct_answer,
        alternative_options: JSON.stringify(rascunho.alternative_options),
        correct_feedback: rascunho.correct_feedback,
        incorrect_feedback: rascunho.incorrect_feedback,
        correct_incentive: rascunho.correct_incentive,
        incorrect_incentive: rascunho.incorrect_incentive,
        unit_id: rascunho.unit_id,
        activity_name: 'MÚLTIPLA ESCOLHA',
      }]);
      if (erroInsert) throw erroInsert;

      await supabase.from('exercises_rascunho').update({ status: 'aprovado' }).eq('id', rascunho.id);
      carregarRascunhos();
      if (unidadeId) setContagemAtual((c) => c + 1);
    } catch (err) {
      alert('Error al aprobar: ' + err.message);
    }
  };

  const handleRejeitar = async (id) => {
    await supabase.from('exercises_rascunho').update({ status: 'rejeitado' }).eq('id', id);
    carregarRascunhos();
  };

  const handleEditarCampo = (id, campo, valor) => {
    setRascunhos((prev) => prev.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)));
  };

  const handleSalvarEdicao = async (rascunho) => {
    await supabase.from('exercises_rascunho').update({
      reading_text: rascunho.reading_text,
      correct_answer: rascunho.correct_answer,
      correct_feedback: rascunho.correct_feedback,
      incorrect_feedback: rascunho.incorrect_feedback,
      correct_incentive: rascunho.correct_incentive,
      incorrect_incentive: rascunho.incorrect_incentive,
    }).eq('id', rascunho.id);
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <h2 className="text-lg font-black text-white flex items-center gap-2 shrink-0"><Sparkles size={18} className="text-cyan-400" /> Gerador de Ejercicios IA</h2>

      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-4 pr-1">

        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-[11px] text-cyan-300 shrink-0">
          ✅ Los ejercicios generados quedan como <strong>rascunho</strong> — solo entran al sistema real después de tu aprobación manual.
        </div>

        <div className="bg-[#0a1424] border border-white/10 rounded-xl p-5 flex flex-col gap-3 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Tipo de Ejercicio</span>
            <select value={tipoSelecionado} onChange={(e) => setTipoSelecionado(Number(e.target.value))} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
              {tiposReferencia.map((t) => (
                <option key={t.activity_type} value={t.activity_type} disabled={t.activity_type !== TIPO_ATIVO}>
                  {t.activity_name} — {t.tier}{t.activity_type !== TIPO_ATIVO ? ' (Em breve)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Curso</span>
              <select value={cursoId} onChange={(e) => setCursoId(e.target.value)} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                <option value="">Elegir curso...</option>
                {cursos.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Nivel</span>
              <select value={nivelId} onChange={(e) => setNivelId(e.target.value)} disabled={!cursoId} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white disabled:opacity-40">
                <option value="">Elegir nivel...</option>
                {niveis.map((n) => <option key={n.id} value={n.id}>{n.level_tag} — {n.level_name}</option>)}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Módulo</span>
              <select value={moduloId} onChange={(e) => setModuloId(e.target.value)} disabled={!nivelId} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white disabled:opacity-40">
                <option value="">Elegir módulo...</option>
                {modulos.map((m) => <option key={m.id} value={m.id}>Mód. {m.module_number}: {m.module_title}</option>)}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Unidad</span>
              <select value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} disabled={!moduloId} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white disabled:opacity-40">
                <option value="">Elegir unidad...</option>
                {unidades.map((u) => <option key={u.id} value={u.id}>Un. {u.unit_number}: {u.unit_title}</option>)}
              </select>
            </div>
          </div>

          {unidadeId && metaCalculada !== null && (
            <div className={`rounded-lg p-3 text-[11px] border ${faltam === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-violet-500/10 border-violet-500/20'}`}>
              <p className={`font-bold uppercase ${faltam === 0 ? 'text-emerald-300' : 'text-violet-300'}`}>
                {tipoInfo?.activity_name} · Nível fixo: {tipoInfo?.tier} · Unidad: {horasUnidade}h
              </p>
              <p className={faltam === 0 ? 'text-emerald-200' : 'text-violet-200'}>
                Meta: {metaCalculada} · Ya existen: {contagemAtual} · {faltam === 0 ? '✅ Completo' : `Faltan: ${faltam}`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Idioma que aprende</span>
              <input value={idiomaAlvo} onChange={(e) => setIdiomaAlvo(e.target.value)} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Idioma nativo</span>
              <input value={idiomaNativo} onChange={(e) => setIdiomaNativo(e.target.value)} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
            </div>
          </div>

          <button onClick={handleGerar} disabled={gerando || !unidadeId || faltam <= 0} className="mt-2 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">
            {faltam === 0 && unidadeId ? <><Lock size={14} /> Meta Completa</> : <><Wand2 size={14} /> {gerando ? 'Generando...' : `Generar ${faltam || ''} Ejercicios`}</>}
          </button>
        </div>

        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Rascunhos Pendientes de Revisión ({rascunhos.length})</p>
            <button onClick={carregarRascunhos} className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={12} /></button>
          </div>

          {loadingRascunhos ? (
            <p className="text-xs text-slate-400">Cargando...</p>
          ) : rascunhos.length === 0 ? (
            <p className="text-xs text-slate-500">Ningún rascunho pendiente.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {rascunhos.map((r) => (
                <div key={r.id} className="bg-[#0a1424] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[9px] text-slate-500">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded font-bold">{r.level_tag}</span>
                    <span>Unidad {r.unit_number}</span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded font-bold uppercase">{r.difficulty_level}</span>
                  </div>
                  <textarea
                    value={r.reading_text}
                    onChange={(e) => handleEditarCampo(r.id, 'reading_text', e.target.value)}
                    onBlur={() => handleSalvarEdicao(r)}
                    className="text-sm font-bold text-white bg-transparent border border-white/10 rounded-lg px-2 py-1.5 resize-none"
                    rows={2}
                  />
                  <input
                    value={r.correct_answer}
                    onChange={(e) => handleEditarCampo(r.id, 'correct_answer', e.target.value)}
                    onBlur={() => handleSalvarEdicao(r)}
                    className="text-xs text-emerald-400 bg-transparent border border-white/10 rounded-lg px-2 py-1"
                  />
                  <div className="flex flex-wrap gap-1">
                    {(r.alternative_options || []).map((op, i) => (
                      <span key={i} className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{op}</span>
                    ))}
                  </div>
                  <textarea
                    value={r.correct_feedback}
                    onChange={(e) => handleEditarCampo(r.id, 'correct_feedback', e.target.value)}
                    onBlur={() => handleSalvarEdicao(r)}
                    className="text-[10px] text-slate-400 italic bg-transparent border border-white/10 rounded-lg px-2 py-1 resize-none"
                    rows={2}
                    placeholder="Feedback correcto"
                  />
                  <textarea
                    value={r.incorrect_feedback}
                    onChange={(e) => handleEditarCampo(r.id, 'incorrect_feedback', e.target.value)}
                    onBlur={() => handleSalvarEdicao(r)}
                    className="text-[10px] text-slate-400 italic bg-transparent border border-white/10 rounded-lg px-2 py-1 resize-none"
                    rows={2}
                    placeholder="Feedback incorrecto"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={r.correct_incentive}
                      onChange={(e) => handleEditarCampo(r.id, 'correct_incentive', e.target.value)}
                      onBlur={() => handleSalvarEdicao(r)}
                      className="text-[10px] text-emerald-300 bg-transparent border border-white/10 rounded-lg px-2 py-1"
                      placeholder="Incentivo (acierto)"
                    />
                    <input
                      value={r.incorrect_incentive}
                      onChange={(e) => handleEditarCampo(r.id, 'incorrect_incentive', e.target.value)}
                      onBlur={() => handleSalvarEdicao(r)}
                      className="text-[10px] text-amber-300 bg-transparent border border-white/10 rounded-lg px-2 py-1"
                      placeholder="Incentivo (error)"
                    />
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button onClick={() => handleAprovar(r)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20">
                      <CheckCircle2 size={12} /> Aprobar
                    </button>
                    <button onClick={() => handleRejeitar(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase rounded-lg border border-rose-500/20">
                      <XCircle size={12} /> Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
