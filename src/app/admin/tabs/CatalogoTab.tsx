// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, FileText, ChevronRight, ChevronDown, BookOpen, Layers, ListOrdered, PenTool, Video, Dumbbell, BookText } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const nomeAtividade = (tipo) => {
  const mapa = {
    1: 'Gramática', 2: 'Vocabulário', 3: 'Blitz', 4: 'Escrita', 6: 'Leitura', 7: 'Escuta',
    8: 'Leitura', 9: 'Fala', 10: 'Fala', 11: 'Escrita', 12: 'Escrita', 13: 'Escuta',
  };
  return mapa[tipo] || `Tipo ${tipo}`;
};

function SubGaveta({ titulo, icone: Icone, cor, itens, loading, renderItem, contagem }) {
  const [aberta, setAberta] = useState(false);
  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <button onClick={() => setAberta((v) => !v)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0a1424]/30 hover:bg-[#0a1424]/60 transition-all">
        <span className={`flex items-center gap-2 text-[9px] font-bold ${cor}`}><Icone size={11} /> {titulo} ({contagem})</span>
        {aberta ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </button>
      {aberta && (
        <div className="px-3 py-1.5">
          {loading ? (
            <p className="text-[9px] text-slate-500">Cargando...</p>
          ) : itens.length === 0 ? (
            <p className="text-[9px] text-slate-500">Ningún registro.</p>
          ) : (
            <div className="flex flex-col gap-1">{itens.map(renderItem)}</div>
          )}
        </div>
      )}
    </div>
  );
}

export function CatalogoTab() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursoAberto, setCursoAberto] = useState(null);
  const [niveis, setNiveis] = useState({});
  const [nivelAberto, setNivelAberto] = useState(null);
  const [modulos, setModulos] = useState({});
  const [moduloAberto, setModuloAberto] = useState(null);
  const [unidades, setUnidades] = useState({});
  const [unidadeAberta, setUnidadeAberta] = useState(null);
  const [exercicios, setExercicios] = useState({});
  const [videos, setVideos] = useState({});
  const [leituras, setLeituras] = useState({});

  const carregarCursos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('courses').select('id, title, estimated_hours');
      if (error) throw error;
      setCursos(data || []);
    } catch (err) {
      console.error('Erro ao carregar cursos:', err);
    }
    setLoading(false);
  };

  useEffect(() => { carregarCursos(); }, []);

  const toggleCurso = async (cursoId) => {
    if (cursoAberto === cursoId) { setCursoAberto(null); return; }
    setCursoAberto(cursoId);
    if (!niveis[cursoId]) {
      const { data } = await supabase.from('levels').select('id, level_tag, level_name, required_xp, total_hours').eq('course_id', cursoId).order('level_tag');
      setNiveis((prev) => ({ ...prev, [cursoId]: data || [] }));
    }
  };

  const toggleNivel = async (nivelId) => {
    if (nivelAberto === nivelId) { setNivelAberto(null); return; }
    setNivelAberto(nivelId);
    if (!modulos[nivelId]) {
      const { data } = await supabase.from('modules_content').select('id, module_number, module_title, required_xp').eq('level_id', nivelId).order('module_number');
      setModulos((prev) => ({ ...prev, [nivelId]: data || [] }));
    }
  };

  const toggleModulo = async (moduloId) => {
    if (moduloAberto === moduloId) { setModuloAberto(null); return; }
    setModuloAberto(moduloId);
    if (!unidades[moduloId]) {
      const { data } = await supabase.from('units').select('id, unit_number, unit_title, required_xp').eq('module_content_id', moduloId).order('unit_number');
      setUnidades((prev) => ({ ...prev, [moduloId]: data || [] }));
    }
  };

  const toggleUnidade = async (unidadeId, unitNumber, levelTag) => {
    if (unidadeAberta === unidadeId) { setUnidadeAberta(null); return; }
    setUnidadeAberta(unidadeId);
    if (!exercicios[unidadeId]) {
      const { data, count } = await supabase.from('exercises').select('id, activity_type, difficulty_level', { count: 'exact' }).eq('unit', unitNumber).eq('level', levelTag).limit(50);
      setExercicios((prev) => ({ ...prev, [unidadeId]: { lista: data || [], total: count || 0 } }));
    }
    if (!videos[unidadeId]) {
      const { data, error } = await supabase.from('video_lessons').select('id, topic, video_url, skill_code').eq('unit_id', unidadeId);
      if (error) console.error('Erro ao buscar vídeos:', error);
      setVideos((prev) => ({ ...prev, [unidadeId]: data || [] }));
    }
    if (!leituras[unidadeId]) {
      const { data, error } = await supabase.from('reading_lesson').select('id, title').eq('unit_id', unidadeId);
      if (error) console.error('Erro ao buscar leituras:', error);
      setLeituras((prev) => ({ ...prev, [unidadeId]: data || [] }));
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><FileText size={18} className="text-cyan-400" /> Catálogo</h2>
        <button onClick={carregarCursos} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 shrink-0">Carregando...</p>
      ) : cursos.length === 0 ? (
        <p className="text-sm text-slate-400 shrink-0">Nenhum curso cadastrado.</p>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-2 pr-1">
          {cursos.map((curso) => (
            <div key={curso.id} className="border border-white/10 rounded-xl overflow-hidden shrink-0">
              <button onClick={() => toggleCurso(curso.id)} className="w-full flex items-center justify-between px-4 py-3 bg-[#0a1424] hover:bg-[#0d1830] transition-all">
                <span className="flex items-center gap-2 text-sm font-black text-white"><BookOpen size={14} className="text-cyan-400" /> {curso.title}</span>
                <span className="flex items-center gap-2 text-[10px] text-slate-400">
                  {curso.estimated_hours}h {cursoAberto === curso.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>

              {cursoAberto === curso.id && (
                <div className="px-4 py-2 bg-[#030914] flex flex-col gap-1.5">
                  {(niveis[curso.id] || []).length === 0 ? (
                    <p className="text-[11px] text-slate-500 py-2">Ningún nivel cadastrado.</p>
                  ) : (
                    (niveis[curso.id] || []).map((nivel) => (
                      <div key={nivel.id} className="border border-white/5 rounded-lg overflow-hidden">
                        <button onClick={() => toggleNivel(nivel.id)} className="w-full flex items-center justify-between px-3 py-2 bg-[#0a1424]/50 hover:bg-[#0a1424] transition-all">
                          <span className="flex items-center gap-2 text-[11px] font-bold text-cyan-300"><Layers size={12} /> {nivel.level_tag} — {nivel.level_name}</span>
                          <span className="flex items-center gap-2 text-[9px] text-slate-500">
                            {nivel.required_xp} XP {nivelAberto === nivel.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </span>
                        </button>

                        {nivelAberto === nivel.id && (
                          <div className="px-3 py-2 flex flex-col gap-1.5">
                            {(modulos[nivel.id] || []).length === 0 ? (
                              <p className="text-[10px] text-slate-500 py-1">Ningún módulo cadastrado.</p>
                            ) : (
                              (modulos[nivel.id] || []).map((mod) => (
                                <div key={mod.id} className="border border-white/5 rounded-lg overflow-hidden">
                                  <button onClick={() => toggleModulo(mod.id)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0a1424]/30 hover:bg-[#0a1424]/60 transition-all">
                                    <span className="flex items-center gap-2 text-[10px] font-bold text-violet-300"><ListOrdered size={11} /> Módulo {mod.module_number}: {mod.module_title}</span>
                                    <span className="flex items-center gap-2 text-[9px] text-slate-500">
                                      {mod.required_xp} XP {moduloAberto === mod.id ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                    </span>
                                  </button>

                                  {moduloAberto === mod.id && (
                                    <div className="px-3 py-1.5 flex flex-col gap-1">
                                      {(unidades[mod.id] || []).length === 0 ? (
                                        <p className="text-[9px] text-slate-500 py-1">Ninguna unidad cadastrada.</p>
                                      ) : (
                                        (unidades[mod.id] || []).map((un) => (
                                          <div key={un.id} className="border border-white/5 rounded-lg overflow-hidden">
                                            <button onClick={() => toggleUnidade(un.id, un.unit_number, nivel.level_tag)} className="w-full flex items-center justify-between px-3 py-1 bg-transparent hover:bg-[#0a1424]/40 transition-all">
                                              <span className="flex items-center gap-2 text-[9px] font-bold text-emerald-300"><PenTool size={10} /> Unidad {un.unit_number}: {un.unit_title}</span>
                                              <span className="flex items-center gap-2 text-[8px] text-slate-500">
                                                {unidadeAberta === un.id ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                              </span>
                                            </button>
                                            {unidadeAberta === un.id && (
                                              <div className="px-3 py-2 flex flex-col gap-1.5 bg-black/20">
                                                <SubGaveta
                                                  titulo="Ejercicios"
                                                  icone={Dumbbell}
                                                  cor="text-cyan-300"
                                                  loading={!exercicios[un.id]}
                                                  itens={exercicios[un.id]?.lista || []}
                                                  contagem={exercicios[un.id]?.total ?? '...'}
                                                  renderItem={(ex) => (
                                                    <span key={ex.id} className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-300 text-[8px] font-bold rounded inline-block w-fit">
                                                      {nomeAtividade(ex.activity_type)} · Nv.{ex.difficulty_level ?? '-'}
                                                    </span>
                                                  )}
                                                />
                                                <SubGaveta
                                                  titulo="Videos"
                                                  icone={Video}
                                                  cor="text-violet-300"
                                                  loading={!videos[un.id]}
                                                  itens={videos[un.id] || []}
                                                  contagem={(videos[un.id] || []).length}
                                                  renderItem={(v) => (
                                                    <a key={v.id} href={v.video_url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-violet-300 hover:text-violet-200 underline truncate">
                                                      {v.topic || v.skill_code || 'Video'}
                                                    </a>
                                                  )}
                                                />
                                                <SubGaveta
                                                  titulo="Contenido Escrito"
                                                  icone={BookText}
                                                  cor="text-amber-300"
                                                  loading={!leituras[un.id]}
                                                  itens={leituras[un.id] || []}
                                                  contagem={(leituras[un.id] || []).length}
                                                  renderItem={(l) => (
                                                    <span key={l.id} className="text-[9px] text-amber-300">{l.title || 'Lectura'}</span>
                                                  )}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
