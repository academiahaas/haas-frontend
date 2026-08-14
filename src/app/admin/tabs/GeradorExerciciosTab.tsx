// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { Sparkles, Wand2, CheckCircle2, XCircle, RefreshCw, Lock, Info } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TIPOS_ATIVOS = [1, 2, 3, 4, 9, 10, 13, 11, 5, 7, 12, 8, 6];

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
  const [tipoSelecionado, setTipoSelecionado] = useState(1);

  const [idiomaAlvo, setIdiomaAlvo] = useState('português');
  const [idiomaNativo, setIdiomaNativo] = useState('español');

  const [horasUnidade, setHorasUnidade] = useState(null);
  const [metaCalculada, setMetaCalculada] = useState(null);
  const [mostrarCreadorCursos, setMostrarCreadorCursos] = useState(false);
  const [idiomaNativoCurso, setIdiomaNativoCurso] = useState('espanhol');
  const [idiomaAlvoCurso, setIdiomaAlvoCurso] = useState('portugues');
  const [tipoCursoCurso, setTipoCursoCurso] = useState('standard');
  const [publicoCurso, setPublicoCurso] = useState('adultos');
  const [etapaWizard, setEtapaWizard] = useState('lista-cursos');
  const [cursosExistentes, setCursosExistentes] = useState(null);
  const [loadingWizard, setLoadingWizard] = useState(false);
  const [erroWizard, setErroWizard] = useState('');
  const [feedbackAtual, setFeedbackAtual] = useState('');

  const [cursoGerado, setCursoGerado] = useState(null);
  const [cursoAprovado, setCursoAprovado] = useState(null);

  const [niveisGerados, setNiveisGerados] = useState(null);
  const [niveisAprovados, setNiveisAprovados] = useState(null);
  const [nivelIndexAtual, setNivelIndexAtual] = useState(0);
  const [nivelObjetivoGerado, setNivelObjetivoGerado] = useState(null);

  const [modulosGerados, setModulosGerados] = useState(null);
  const [modulosAprovadosDoNivel, setModulosAprovadosDoNivel] = useState(null);
  const [modulosJaCriados, setModulosJaCriados] = useState([]);
  const [moduloIndexAtual, setModuloIndexAtual] = useState(0);
  const [moduloObjetivoGerado, setModuloObjetivoGerado] = useState(null);

  const [unidadesGeradas, setUnidadesGeradas] = useState(null);
  const [unidadesAprovadasDoModulo, setUnidadesAprovadasDoModulo] = useState(null);
  const [unidadesJaCriadas, setUnidadesJaCriadas] = useState([]);
  const [unidadeIndexAtual, setUnidadeIndexAtual] = useState(0);
  const [unidadeObjetivoGerado, setUnidadeObjetivoGerado] = useState(null);

  const handleListarCursos = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const res = await fetch('/api/admin/curso-wizard/listar-cursos');
      const dados = await res.json();
      setCursosExistentes(dados.cursos || []);
    } catch (e) {
      setErroWizard('Error al listar cursos');
    } finally {
      setLoadingWizard(false);
    }
  };

  const determinarPontoRetomada = (niveis) => {
    for (let i = 0; i < niveis.length; i++) {
      if (!niveis[i].pedagogical_focus) {
        return { etapa: 'niveis-objetivos', nivelIndex: i };
      }
    }
    for (let i = 0; i < niveis.length; i++) {
      const nivel = niveis[i];
      if (!nivel.modulos || nivel.modulos.length === 0) {
        return { etapa: 'modulos-nomes', nivelIndex: i };
      }
      for (let j = 0; j < nivel.modulos.length; j++) {
        if (!nivel.modulos[j].pedagogical_objective) {
          return { etapa: 'modulos-objetivos', nivelIndex: i, moduloIndex: j };
        }
      }
      for (let j = 0; j < nivel.modulos.length; j++) {
        const modulo = nivel.modulos[j];
        if (!modulo.unidades || modulo.unidades.length === 0) {
          return { etapa: 'unidades-nomes', nivelIndex: i, moduloIndex: j };
        }
        for (let k = 0; k < modulo.unidades.length; k++) {
          if (!modulo.unidades[k].pedagogical_objective) {
            return { etapa: 'unidades-objetivos', nivelIndex: i, moduloIndex: j, unidadeIndex: k };
          }
        }
      }
    }
    return { etapa: 'completo' };
  };

  const handleContinuarCurso = async (course_id) => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const res = await fetch('/api/admin/curso-wizard/estado-curso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id })
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.detalhe || dados.error);

      const { curso, niveis } = dados;
      setCursoAprovado(curso);
      setNiveisAprovados(niveis);

      const ponto = determinarPontoRetomada(niveis);

      const todosModulos = niveis.flatMap((n) => n.modulos || []);
      setModulosJaCriados(todosModulos);
      const todasUnidades = todosModulos.flatMap((m) => m.unidades || []);
      setUnidadesJaCriadas(todasUnidades);

      if (ponto.etapa === 'niveis-objetivos') {
        setNivelIndexAtual(ponto.nivelIndex);
      } else if (ponto.etapa === 'modulos-nomes' || ponto.etapa === 'modulos-objetivos') {
        setNivelIndexAtual(ponto.nivelIndex);
        if (ponto.etapa === 'modulos-objetivos') {
          setModulosAprovadosDoNivel(niveis[ponto.nivelIndex].modulos);
          setModuloIndexAtual(ponto.moduloIndex);
        }
      } else if (ponto.etapa === 'unidades-nomes' || ponto.etapa === 'unidades-objetivos') {
        setNivelIndexAtual(ponto.nivelIndex);
        setModulosAprovadosDoNivel(niveis[ponto.nivelIndex].modulos);
        setModuloIndexAtual(ponto.moduloIndex);
        if (ponto.etapa === 'unidades-objetivos') {
          setUnidadesAprovadasDoModulo(niveis[ponto.nivelIndex].modulos[ponto.moduloIndex].unidades);
          setUnidadeIndexAtual(ponto.unidadeIndex);
        }
      }

      setEtapaWizard(ponto.etapa);
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const chamarApi = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.detalhe || dados.error || 'Erro');
    return dados;
  };

  const handleGerarCurso = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const dados = await chamarApi('/api/admin/curso-wizard/nome', {
        idioma_nativo: idiomaNativoCurso,
        idioma_alvo: idiomaAlvoCurso,
        tipo_curso: tipoCursoCurso,
        publico: publicoCurso,
        feedback: feedbackAtual
      });
      setCursoGerado(dados.dados);
      setFeedbackAtual('');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleAprovarCurso = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const dados = await chamarApi('/api/admin/curso-wizard/salvar-curso', {
        title: cursoGerado.title,
        objective_autonomy: cursoGerado.objective_autonomy,
        operational_objective: cursoGerado.operational_objective
      });
      setCursoAprovado({ id: dados.course_id, ...cursoGerado });
      setEtapaWizard('niveis-nomes');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleGerarNiveisNomes = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const dados = await chamarApi('/api/admin/curso-wizard/niveis', {
        titulo_curso: cursoAprovado.title,
        idioma_nativo: idiomaNativoCurso,
        idioma_alvo: idiomaAlvoCurso,
        feedback: feedbackAtual
      });
      setNiveisGerados(dados.dados.niveis);
      setFeedbackAtual('');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleAprovarNiveisNomes = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const dados = await chamarApi('/api/admin/curso-wizard/salvar-niveis', {
        course_id: cursoAprovado.id,
        niveis: niveisGerados
      });
      const aprovados = niveisGerados.map((n, i) => ({ ...n, id: dados.niveis[i].id }));
      setNiveisAprovados(aprovados);
      setNivelIndexAtual(0);
      setEtapaWizard('niveis-objetivos');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleGerarObjetivoNivel = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const nivel = niveisAprovados[nivelIndexAtual];
      const dados = await chamarApi('/api/admin/curso-wizard/objetivo-nivel', {
        titulo_curso: cursoAprovado.title,
        level_tag: nivel.level_tag,
        level_name: nivel.level_name,
        total_hours: nivel.total_hours,
        feedback: feedbackAtual
      });
      setNivelObjetivoGerado(dados.dados.pedagogical_focus);
      setFeedbackAtual('');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleAprovarObjetivoNivel = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const nivel = niveisAprovados[nivelIndexAtual];
      await chamarApi('/api/admin/curso-wizard/atualizar-objetivo-nivel', {
        level_id: nivel.id,
        pedagogical_focus: nivelObjetivoGerado
      });
      const atualizados = [...niveisAprovados];
      atualizados[nivelIndexAtual] = { ...nivel, pedagogical_focus: nivelObjetivoGerado };
      setNiveisAprovados(atualizados);
      setNivelObjetivoGerado(null);

      if (nivelIndexAtual < niveisAprovados.length - 1) {
        setNivelIndexAtual((i) => i + 1);
      } else {
        setNivelIndexAtual(0);
        setEtapaWizard('modulos-nomes');
      }
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleGerarModulosNomes = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const nivel = niveisAprovados[nivelIndexAtual];
      const dados = await chamarApi('/api/admin/curso-wizard/modulos', {
        titulo_curso: cursoAprovado.title,
        level_tag: nivel.level_tag,
        level_name: nivel.level_name,
        pedagogical_focus: nivel.pedagogical_focus,
        total_hours: nivel.total_hours,
        modulos_ja_criados: modulosJaCriados,
        feedback: feedbackAtual
      });
      setModulosGerados(dados.dados.modulos);
      setFeedbackAtual('');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleAprovarModulosNomes = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const nivel = niveisAprovados[nivelIndexAtual];
      const dados = await chamarApi('/api/admin/curso-wizard/salvar-modulos', {
        level_id: nivel.id,
        level_tag: nivel.level_tag,
        modulos: modulosGerados
      });
      const aprovados = modulosGerados.map((m, i) => ({ ...m, id: dados.modulos[i].id }));
      setModulosAprovadosDoNivel(aprovados);
      setModuloIndexAtual(0);
      setEtapaWizard('modulos-objetivos');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleGerarObjetivoModulo = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const nivel = niveisAprovados[nivelIndexAtual];
      const modulo = modulosAprovadosDoNivel[moduloIndexAtual];
      const dados = await chamarApi('/api/admin/curso-wizard/objetivo-modulo', {
        titulo_curso: cursoAprovado.title,
        level_tag: nivel.level_tag,
        level_focus: nivel.pedagogical_focus,
        module_title: modulo.module_title,
        estimated_hours: modulo.estimated_hours,
        feedback: feedbackAtual
      });
      setModuloObjetivoGerado(dados.dados);
      setFeedbackAtual('');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleAprovarObjetivoModulo = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const modulo = modulosAprovadosDoNivel[moduloIndexAtual];
      await chamarApi('/api/admin/curso-wizard/atualizar-objetivo-modulo', {
        module_id: modulo.id,
        pedagogical_objective: moduloObjetivoGerado.pedagogical_objective,
        thematic_content: moduloObjetivoGerado.thematic_content
      });
      const atualizados = [...modulosAprovadosDoNivel];
      atualizados[moduloIndexAtual] = { ...modulo, ...moduloObjetivoGerado };
      setModulosAprovadosDoNivel(atualizados);
      setModulosJaCriados((prev) => [...prev, atualizados[moduloIndexAtual]]);
      setModuloObjetivoGerado(null);

      if (moduloIndexAtual < modulosAprovadosDoNivel.length - 1) {
        setModuloIndexAtual((i) => i + 1);
      } else {
        setModuloIndexAtual(0);
        setEtapaWizard('unidades-nomes');
      }
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleGerarUnidadesNomes = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const nivel = niveisAprovados[nivelIndexAtual];
      const modulo = modulosAprovadosDoNivel[moduloIndexAtual];
      const dados = await chamarApi('/api/admin/curso-wizard/unidades', {
        titulo_curso: cursoAprovado.title,
        level_tag: nivel.level_tag,
        module_title: modulo.module_title,
        thematic_content: modulo.thematic_content,
        estimated_hours: modulo.estimated_hours,
        unidades_ja_criadas: unidadesJaCriadas,
        feedback: feedbackAtual
      });
      setUnidadesGeradas(dados.dados.unidades);
      setFeedbackAtual('');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleAprovarUnidadesNomes = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const modulo = modulosAprovadosDoNivel[moduloIndexAtual];
      const nivel = niveisAprovados[nivelIndexAtual];
      const dados = await chamarApi('/api/admin/curso-wizard/salvar-unidades', {
        module_content_id: modulo.id,
        module_number: modulo.module_number,
        level: nivel.level_tag,
        unidades: unidadesGeradas
      });
      const aprovadas = unidadesGeradas.map((u, i) => ({ ...u, id: dados.unidades[i].id }));
      setUnidadesAprovadasDoModulo(aprovadas);
      setUnidadeIndexAtual(0);
      setEtapaWizard('unidades-objetivos');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleGerarObjetivoUnidade = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const nivel = niveisAprovados[nivelIndexAtual];
      const modulo = modulosAprovadosDoNivel[moduloIndexAtual];
      const unidade = unidadesAprovadasDoModulo[unidadeIndexAtual];
      const dados = await chamarApi('/api/admin/curso-wizard/objetivo-unidade', {
        titulo_curso: cursoAprovado.title,
        level_tag: nivel.level_tag,
        module_title: modulo.module_title,
        module_focus: modulo.pedagogical_objective,
        unit_title: unidade.unit_title,
        estimated_hours: unidade.estimated_hours,
        feedback: feedbackAtual
      });
      setUnidadeObjetivoGerado(dados.dados);
      setFeedbackAtual('');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const handleAprovarObjetivoUnidade = async () => {
    setLoadingWizard(true);
    setErroWizard('');
    try {
      const unidade = unidadesAprovadasDoModulo[unidadeIndexAtual];
      await chamarApi('/api/admin/curso-wizard/atualizar-objetivo-unidade', {
        unit_id: unidade.id,
        pedagogical_objective: unidadeObjetivoGerado.pedagogical_objective,
        situational_content: unidadeObjetivoGerado.situational_content,
        hidden_grammatical_structure: unidadeObjetivoGerado.hidden_grammatical_structure
      });
      const atualizadas = [...unidadesAprovadasDoModulo];
      atualizadas[unidadeIndexAtual] = { ...unidade, ...unidadeObjetivoGerado };
      setUnidadesAprovadasDoModulo(atualizadas);
      setUnidadesJaCriadas((prev) => [...prev, atualizadas[unidadeIndexAtual]]);
      setUnidadeObjetivoGerado(null);

      if (unidadeIndexAtual < unidadesAprovadasDoModulo.length - 1) {
        setUnidadeIndexAtual((i) => i + 1);
        return;
      }

      setUnidadesGeradas(null);
      setUnidadesAprovadasDoModulo(null);
      setUnidadeIndexAtual(0);

      if (moduloIndexAtual < modulosAprovadosDoNivel.length - 1) {
        setModuloIndexAtual((i) => i + 1);
        setEtapaWizard('unidades-nomes');
        return;
      }

      if (nivelIndexAtual < niveisAprovados.length - 1) {
        setNivelIndexAtual((i) => i + 1);
        setModulosGerados(null);
        setModulosAprovadosDoNivel(null);
        setModuloIndexAtual(0);
        setEtapaWizard('modulos-nomes');
        return;
      }

      setEtapaWizard('completo');
    } catch (e) {
      setErroWizard(e.message);
    } finally {
      setLoadingWizard(false);
    }
  };

  const [contagemAtual, setContagemAtual] = useState(0);

  const [gerando, setGerando] = useState(false);
  const [rascunhos, setRascunhos] = useState([]);
  const [loadingRascunhos, setLoadingRascunhos] = useState(true);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'ok'|'erro', texto: '' }
  const [confirmandoAprovarTodos, setConfirmandoAprovarTodos] = useState(false);

  const avisar = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 4000);
  };

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
    if (!unidadeId || faltam <= 0) return;
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
          activityType: tipoSelecionado,
        }),
      });
      const data = await resp.json();
      if (data.erro) {
        avisar('erro', data.erro);
      } else {
        carregarRascunhos();
      }
    } catch (err) {
      avisar('erro', 'Error de red: ' + err.message);
    }
    setGerando(false);
  };

  const handleAprovar = async (rascunho) => {
    try {
      const novoId = crypto.randomUUID();
      let audioUrl = null;
      const TIPOS_COM_AUDIO = [4, 9, 10, 13, 11, 7];
      if (TIPOS_COM_AUDIO.includes(rascunho.activity_type)) {
        try {
          const textoParaAudio = rascunho.audio_transcript || rascunho.texto_audio || rascunho.reading_text || '';
          const vozEscolhida = rascunho.activity_type === 9 ? 'nova' : 'fable';
          const respAudio = await fetch('/api/ai/gerar-audio-exercicio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: textoParaAudio, exerciseId: novoId, voz: vozEscolhida }),
          });
          const dataAudio = await respAudio.json();
          if (dataAudio.audio_url) audioUrl = dataAudio.audio_url;
        } catch (errAudio) {
          console.error('Falha ao gerar áudio, seguindo sem áudio:', errAudio);
        }
      }

      const { error: erroInsert } = await supabase.from('exercises').insert([{
        id: novoId,
        created_at: new Date().toISOString(),
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
        activity_name: rascunho.activity_name,
        course_id: rascunho.course_id,
        level_id: rascunho.level_id,
        module_id: rascunho.module_id,
        skill_code: rascunho.skill_code,
        audio_url: audioUrl,
        texto_audio: rascunho.texto_audio,
        audio_transcript: rascunho.audio_transcript,
      }]);
      if (erroInsert) throw erroInsert;

      await supabase.from('exercises_rascunho').update({ status: 'aprovado' }).eq('id', rascunho.id);
      setRascunhos((prev) => prev.filter((r) => r.id !== rascunho.id));
      setContagemAtual((c) => c + 1);
    } catch (err) {
      avisar('erro', 'Error al aprobar: ' + err.message);
    }
  };

  const handleAprovarTodos = async () => {
    setConfirmandoAprovarTodos(false);
    const lista = [...rascunhos];
    for (const r of lista) {
      await handleAprovar(r);
    }
    avisar('ok', `${lista.length} ejercicio(s) aprobado(s).`);
  };

  const handleRejeitar = async (id) => {
    await supabase.from('exercises_rascunho').update({ status: 'rejeitado' }).eq('id', id);
    setRascunhos((prev) => prev.filter((r) => r.id !== id));
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
    <div className="flex flex-col gap-4 h-full min-h-0 relative">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-lg font-black text-white flex items-center gap-2"><Sparkles size={18} className="text-cyan-400" /> Gerador de Ejercicios IA</h2>
        <button onClick={() => { const abrir = !mostrarCreadorCursos; setMostrarCreadorCursos(abrir); if (abrir && !cursosExistentes) handleListarCursos(); }} className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 px-3 py-1.5 rounded-lg font-bold transition-all">
          {mostrarCreadorCursos ? 'Ocultar' : 'Cursos'}
        </button>
      </div>

      {mostrarCreadorCursos && (
        <div className="shrink-0 bg-white/[0.02] border border-purple-500/20 rounded-xl p-4 space-y-3 max-h-[60vh] overflow-y-auto">

          {erroWizard && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-2 rounded-lg">{erroWizard}</div>
          )}

          {etapaWizard === 'lista-cursos' && (
            <div className="space-y-2">
              {loadingWizard && <p className="text-xs text-slate-500">Cargando cursos...</p>}
              {cursosExistentes && cursosExistentes.length === 0 && (
                <p className="text-xs text-slate-500">No hay cursos creados todavia.</p>
              )}
              {(cursosExistentes || []).map((c) => (
                <div key={c.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-200">{c.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {c.totalNiveis} niveles ({c.niveisComObjetivo} con objetivo) - {c.modulosComObjetivo}/{c.modulosContagem} modulos - {c.unidadesComObjetivo}/{c.unidadesContagem} unidades
                    </p>
                  </div>
                  {c.completo ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Completo</span>
                  ) : (
                    <button onClick={() => handleContinuarCurso(c.id)} disabled={loadingWizard} className="text-xs bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-black uppercase px-3 py-1.5 rounded-lg">
                      Continuar
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setEtapaWizard('config')} className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-lg border border-white/10">
                + Crear Curso Nuevo
              </button>
            </div>
          )}

          {etapaWizard === 'config' && !cursoGerado && (
            <>
              <p className="text-xs text-slate-400">Paso 1: configuracion inicial</p>
              <div className="grid grid-cols-2 gap-2">
                <select value={idiomaNativoCurso} onChange={(e) => setIdiomaNativoCurso(e.target.value)} className="px-3 py-2 bg-[#0a1424] border border-white/10 rounded-lg outline-none text-xs text-slate-200">
                  <option className="bg-[#0a1424]" value="espanhol">Nativo: Espanhol</option>
                  <option className="bg-[#0a1424]" value="ingles">Nativo: Ingles</option>
                  <option className="bg-[#0a1424]" value="portugues">Nativo: Portugues</option>
                </select>
                <select value={idiomaAlvoCurso} onChange={(e) => setIdiomaAlvoCurso(e.target.value)} className="px-3 py-2 bg-[#0a1424] border border-white/10 rounded-lg outline-none text-xs text-slate-200">
                  <option className="bg-[#0a1424]" value="portugues">Alvo: Portugues</option>
                  <option className="bg-[#0a1424]" value="ingles">Alvo: Ingles</option>
                  <option className="bg-[#0a1424]" value="espanhol">Alvo: Espanhol</option>
                  <option className="bg-[#0a1424]" value="frances">Alvo: Frances</option>
                </select>
                <select value={tipoCursoCurso} onChange={(e) => setTipoCursoCurso(e.target.value)} className="px-3 py-2 bg-[#0a1424] border border-white/10 rounded-lg outline-none text-xs text-slate-200">
                  <option className="bg-[#0a1424]" value="standard">Tipo: Standard</option>
                  <option className="bg-[#0a1424]" value="estudio">Tipo: Estudio</option>
                  <option className="bg-[#0a1424]" value="viaje">Tipo: Viaje</option>
                  <option className="bg-[#0a1424]" value="trabajo">Tipo: Trabajo/Negocios</option>
                </select>
                <select value={publicoCurso} onChange={(e) => setPublicoCurso(e.target.value)} className="px-3 py-2 bg-[#0a1424] border border-white/10 rounded-lg outline-none text-xs text-slate-200">
                  <option className="bg-[#0a1424]" value="adultos">Publico: Adultos</option>
                  <option className="bg-[#0a1424]" value="jovenes">Publico: Jovenes</option>
                  <option className="bg-[#0a1424]" value="ninos">Publico: Ninos</option>
                </select>
              </div>
              <button onClick={handleGerarCurso} disabled={loadingWizard} className="w-full py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-black uppercase text-xs rounded-lg transition-all">
                {loadingWizard ? 'Generando...' : 'Generar Nombre del Curso'}
              </button>
            </>
          )}

          {cursoGerado && !cursoAprovado && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg space-y-2">
              <input value={cursoGerado.title} onChange={(e) => setCursoGerado({ ...cursoGerado, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm font-bold text-purple-300" />
              <textarea rows={2} value={cursoGerado.objective_autonomy} onChange={(e) => setCursoGerado({ ...cursoGerado, objective_autonomy: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300" />
              <textarea rows={2} value={cursoGerado.operational_objective} onChange={(e) => setCursoGerado({ ...cursoGerado, operational_objective: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300" />
              <input value={feedbackAtual} onChange={(e) => setFeedbackAtual(e.target.value)} placeholder="Pedir ajuste a la IA (opcional)..." className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600" />
              <div className="flex gap-2">
                <button onClick={handleGerarCurso} disabled={loadingWizard} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-lg">Regenerar</button>
                <button onClick={handleAprovarCurso} disabled={loadingWizard} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs rounded-lg">Aprobar</button>
              </div>
            </div>
          )}

          {etapaWizard === 'niveis-nomes' && !niveisGerados && (
            <button onClick={handleGerarNiveisNomes} disabled={loadingWizard} className="w-full py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-black uppercase text-xs rounded-lg transition-all">
              {loadingWizard ? 'Generando...' : `Generar Nombres de Niveles de "${cursoAprovado?.title}"`}
            </button>
          )}

          {niveisGerados && !niveisAprovados && (
            <div className="space-y-2">
              {niveisGerados.map((n, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-2 rounded-lg space-y-1">
                  <div className="flex gap-2">
                    <input value={n.level_tag} readOnly className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-black text-slate-400" />
                    <input value={n.level_name} onChange={(e) => { const arr = [...niveisGerados]; arr[i] = { ...n, level_name: e.target.value }; setNiveisGerados(arr); }} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-slate-200" />
                    <input value={n.total_hours} readOnly className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-slate-500" />
                  </div>
                </div>
              ))}
              <input value={feedbackAtual} onChange={(e) => setFeedbackAtual(e.target.value)} placeholder="Pedir ajuste a la IA (opcional)..." className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600" />
              <div className="flex gap-2">
                <button onClick={handleGerarNiveisNomes} disabled={loadingWizard} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-lg">Regenerar</button>
                <button onClick={handleAprovarNiveisNomes} disabled={loadingWizard} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs rounded-lg">Aprobar Niveles</button>
              </div>
            </div>
          )}

          {etapaWizard === 'niveis-objetivos' && niveisAprovados && !nivelObjetivoGerado && (
            <button onClick={handleGerarObjetivoNivel} disabled={loadingWizard} className="w-full py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-black uppercase text-xs rounded-lg transition-all">
              {loadingWizard ? 'Generando...' : `Generar Objetivo de ${niveisAprovados[nivelIndexAtual]?.level_tag} (${nivelIndexAtual + 1}/${niveisAprovados.length})`}
            </button>
          )}

          {nivelObjetivoGerado && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg space-y-2">
              <p className="text-[10px] text-purple-400 font-bold uppercase">{niveisAprovados[nivelIndexAtual]?.level_tag}</p>
              <textarea rows={3} value={nivelObjetivoGerado} onChange={(e) => setNivelObjetivoGerado(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300" />
              <input value={feedbackAtual} onChange={(e) => setFeedbackAtual(e.target.value)} placeholder="Pedir ajuste a la IA (opcional)..." className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600" />
              <div className="flex gap-2">
                <button onClick={handleGerarObjetivoNivel} disabled={loadingWizard} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-lg">Regenerar</button>
                <button onClick={handleAprovarObjetivoNivel} disabled={loadingWizard} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs rounded-lg">Aprobar</button>
              </div>
            </div>
          )}

          {etapaWizard === 'modulos-nomes' && !modulosGerados && (
            <button onClick={handleGerarModulosNomes} disabled={loadingWizard} className="w-full py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-black uppercase text-xs rounded-lg transition-all">
              {loadingWizard ? 'Generando...' : `Generar Modulos de ${niveisAprovados?.[nivelIndexAtual]?.level_tag}`}
            </button>
          )}

          {modulosGerados && !modulosAprovadosDoNivel && (
            <div className="space-y-2">
              {modulosGerados.map((m, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                  <input value={m.module_title} onChange={(e) => { const arr = [...modulosGerados]; arr[i] = { ...m, module_title: e.target.value }; setModulosGerados(arr); }} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-black text-slate-200" />
                </div>
              ))}
              <input value={feedbackAtual} onChange={(e) => setFeedbackAtual(e.target.value)} placeholder="Pedir ajuste a la IA (opcional)..." className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600" />
              <div className="flex gap-2">
                <button onClick={handleGerarModulosNomes} disabled={loadingWizard} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-lg">Regenerar</button>
                <button onClick={handleAprovarModulosNomes} disabled={loadingWizard} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs rounded-lg">Aprobar Modulos</button>
              </div>
            </div>
          )}

          {etapaWizard === 'modulos-objetivos' && modulosAprovadosDoNivel && !moduloObjetivoGerado && (
            <button onClick={handleGerarObjetivoModulo} disabled={loadingWizard} className="w-full py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-black uppercase text-xs rounded-lg transition-all">
              {loadingWizard ? 'Generando...' : `Generar Objetivo de "${modulosAprovadosDoNivel[moduloIndexAtual]?.module_title}" (${moduloIndexAtual + 1}/${modulosAprovadosDoNivel.length})`}
            </button>
          )}

          {moduloObjetivoGerado && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg space-y-2">
              <textarea rows={2} value={moduloObjetivoGerado.pedagogical_objective} onChange={(e) => setModuloObjetivoGerado({ ...moduloObjetivoGerado, pedagogical_objective: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300" />
              <textarea rows={2} value={moduloObjetivoGerado.thematic_content} onChange={(e) => setModuloObjetivoGerado({ ...moduloObjetivoGerado, thematic_content: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300" />
              <input value={feedbackAtual} onChange={(e) => setFeedbackAtual(e.target.value)} placeholder="Pedir ajuste a la IA (opcional)..." className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600" />
              <div className="flex gap-2">
                <button onClick={handleGerarObjetivoModulo} disabled={loadingWizard} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-lg">Regenerar</button>
                <button onClick={handleAprovarObjetivoModulo} disabled={loadingWizard} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs rounded-lg">Aprobar</button>
              </div>
            </div>
          )}

          {etapaWizard === 'unidades-nomes' && !unidadesGeradas && (
            <button onClick={handleGerarUnidadesNomes} disabled={loadingWizard} className="w-full py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-black uppercase text-xs rounded-lg transition-all">
              {loadingWizard ? 'Generando...' : `Generar Unidades de "${modulosAprovadosDoNivel?.[moduloIndexAtual]?.module_title}"`}
            </button>
          )}

          {unidadesGeradas && !unidadesAprovadasDoModulo && (
            <div className="space-y-2">
              {unidadesGeradas.map((u, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                  <input value={u.unit_title} onChange={(e) => { const arr = [...unidadesGeradas]; arr[i] = { ...u, unit_title: e.target.value }; setUnidadesGeradas(arr); }} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-black text-slate-200" />
                </div>
              ))}
              <input value={feedbackAtual} onChange={(e) => setFeedbackAtual(e.target.value)} placeholder="Pedir ajuste a la IA (opcional)..." className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600" />
              <div className="flex gap-2">
                <button onClick={handleGerarUnidadesNomes} disabled={loadingWizard} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-lg">Regenerar</button>
                <button onClick={handleAprovarUnidadesNomes} disabled={loadingWizard} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs rounded-lg">Aprobar Unidades</button>
              </div>
            </div>
          )}

          {etapaWizard === 'unidades-objetivos' && unidadesAprovadasDoModulo && !unidadeObjetivoGerado && (
            <button onClick={handleGerarObjetivoUnidade} disabled={loadingWizard} className="w-full py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-black uppercase text-xs rounded-lg transition-all">
              {loadingWizard ? 'Generando...' : `Generar Objetivo de "${unidadesAprovadasDoModulo[unidadeIndexAtual]?.unit_title}" (${unidadeIndexAtual + 1}/${unidadesAprovadasDoModulo.length})`}
            </button>
          )}

          {unidadeObjetivoGerado && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg space-y-2">
              <textarea rows={2} value={unidadeObjetivoGerado.pedagogical_objective} onChange={(e) => setUnidadeObjetivoGerado({ ...unidadeObjetivoGerado, pedagogical_objective: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300" />
              <textarea rows={2} value={unidadeObjetivoGerado.situational_content} onChange={(e) => setUnidadeObjetivoGerado({ ...unidadeObjetivoGerado, situational_content: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300" />
              <input value={unidadeObjetivoGerado.hidden_grammatical_structure} onChange={(e) => setUnidadeObjetivoGerado({ ...unidadeObjetivoGerado, hidden_grammatical_structure: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300" />
              <input value={feedbackAtual} onChange={(e) => setFeedbackAtual(e.target.value)} placeholder="Pedir ajuste a la IA (opcional)..." className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600" />
              <div className="flex gap-2">
                <button onClick={handleGerarObjetivoUnidade} disabled={loadingWizard} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-lg">Regenerar</button>
                <button onClick={handleAprovarObjetivoUnidade} disabled={loadingWizard} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs rounded-lg">Aprobar</button>
              </div>
            </div>
          )}

          {etapaWizard === 'completo' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg text-center">
              <p className="text-sm font-black text-emerald-300">Curso completo creado con exito!</p>
              <p className="text-xs text-slate-400 mt-1">Ya puedes usarlo en el generador de ejercicios de arriba.</p>
            </div>
          )}

        </div>
      )}
      {mensagem && (
        <div className={`shrink-0 rounded-lg px-3 py-2 text-[11px] border flex items-center gap-2 ${mensagem.tipo === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
          <Info size={12} /> {mensagem.texto}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-4 pr-1">

        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-[11px] text-cyan-300 shrink-0">
          ✅ Los ejercicios generados quedan como <strong>rascunho</strong> — solo entran al sistema real después de tu aprobación manual.
        </div>

        <div className="bg-[#0a1424] border border-white/10 rounded-xl p-5 flex flex-col gap-3 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase mb-1 block">Tipo de Ejercicio</span>
            <select value={tipoSelecionado} onChange={(e) => setTipoSelecionado(Number(e.target.value))} className="w-full bg-[#030914] border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
              {tiposReferencia.map((t) => (
                <option key={t.activity_type} value={t.activity_type} disabled={!TIPOS_ATIVOS.includes(t.activity_type)}>
                  {t.activity_name} — {t.tier}{!TIPOS_ATIVOS.includes(t.activity_type) ? ' (Em breve)' : ''}
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
            <div className="flex gap-2 items-center">
              {rascunhos.length > 0 && !confirmandoAprovarTodos && (
                <button onClick={() => setConfirmandoAprovarTodos(true)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20">
                  <CheckCircle2 size={12} /> Aprobar Todos
                </button>
              )}
              {confirmandoAprovarTodos && (
                <div className="flex items-center gap-1.5 bg-[#0a1424] border border-white/10 rounded-lg px-2 py-1">
                  <span className="text-[10px] text-slate-300">¿Aprobar {rascunhos.length}?</span>
                  <button onClick={handleAprovarTodos} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase rounded">Sí</button>
                  <button onClick={() => setConfirmandoAprovarTodos(false)} className="px-2 py-1 bg-white/5 text-slate-400 text-[9px] font-black uppercase rounded">No</button>
                </div>
              )}
              <button onClick={carregarRascunhos} className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"><RefreshCw size={12} /></button>
            </div>
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
                  {r.audio_transcript && (
                    <textarea
                      value={r.audio_transcript}
                      onChange={(e) => handleEditarCampo(r.id, 'audio_transcript', e.target.value)}
                      onBlur={() => handleSalvarEdicao(r)}
                      className="text-sm font-bold text-purple-300 bg-purple-950/20 border border-purple-500/30 rounded-lg px-2 py-1.5 resize-none"
                      rows={2}
                      placeholder="Áudio (o que será falado)"
                    />
                  )}
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
