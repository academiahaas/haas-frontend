// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { Sparkles, Wand2, CheckCircle2, XCircle, RefreshCw, Layers, ListOrdered, PenTool } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function GeradorExerciciosTab() {
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [niveis, setNiveis] = useState([]);
  const [nivelId, setNivelId] = useState('');
  const [modulos, setModulos] = useState([]);
  const [moduloId, setModuloId] = useState('');
  const [unidades, setUnidades] = useState([]);
  const [unidadeId, setUnidadeId] = useState('');

  const [idiomaAlvo, setIdiomaAlvo] = useState('português');
  const [idiomaNativo, setIdiomaNativo] = useState('español');
  const [quantidade, setQuantidade] = useState('3');

  const [gerando, setGerando] = useState(false);
  const [rascunhos, setRascunhos] = useState([]);
  const [loadingRascunhos, setLoadingRascunhos] = useState(true);

  useEffect(() => {
    supabase.from('courses').select('id, title').then(({ data }) => setCursos(data || []));
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

  const carregarRascunhos = async () => {
    setLoadingRascunhos(true);
    const { data } = await supabase.from('exercises_rascunho').select('*').eq('status', 'pendente').order('created_at', { ascending: false });
    setRascunhos(data || []);
    setLoadingRascunhos(false);
  };

  const handleGerar = async () => {
    if (!unidadeId) {
      alert('Selecciona Curso → Nivel → Módulo → Unidad antes de generar.');
      return;
    }
    setGerando(true);
    try {
      const resp = await fetch('/api/ai/gerar-exercicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: unidadeId, idiomaAlvo, idiomaNativo, quantidade: Number(quantidade) }),
      });
      const data = await resp.json();
      if (data.erro) {
        alert('Error: ' + data.erro);
      } else {
        alert(`${data.exercicios?.length || 0} ejercicio(s) generado(s) como rascunho.`);
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
    } catch (err) {
      alert('Error al aprobar: ' + err.message);
    }
  };

  const handleRejeitar = async (id) => {
    await supabase.from('exercises_rascunho').update({ status: 'rejeitado' }).eq('id', id);
    carregarRascunhos();
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-white flex items-center gap-2"><Sparkles size={18} className="text-cyan-400" /> Gerador de Ejercicios IA</h2>

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-[11px] text-cyan-300">
        ✅ Los ejercicios generados quedan como <strong>rascunho</strong> — solo entran al sistema real después de tu aprobación manual.
      </div>

      <div className="bg-[#0a1424] border border-white/10 rounded-xl p-5 flex flex-col gap-3">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Idioma que aprende</span>
            <input value={idiomaAlvo} onChange={(e) => setIdiomaAlvo(e.target.value)} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Idioma nativo</span>
            <input value={idiomaNativo} onChange={(e) => setIdiomaNativo(e.target.value)} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Cantidad</span>
            <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} min="1" max="10" className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
          </div>
        </div>

        <button onClick={handleGerar} disabled={gerando || !unidadeId} className="mt-2 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">
          <Wand2 size={14} /> {gerando ? 'Generando...' : 'Generar Ejercicios (Múltipla Escolha)'}
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
                  <span className="px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded font-bold">Múltipla Escolha</span>
                </div>
                <p className="text-sm font-bold text-white">{r.reading_text}</p>
                <p className="text-xs text-emerald-400">✓ {r.correct_answer}</p>
                <div className="flex flex-wrap gap-1">
                  {(r.alternative_options || []).map((op, i) => (
                    <span key={i} className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{op}</span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic">{r.correct_feedback}</p>
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
  );
}
