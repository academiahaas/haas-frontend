const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const WebSocket = require('ws');

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_BASE = 'https://campus.academiahaas.com';
const UNIT_ID = process.argv[2];
const IDIOMA_ALVO = 'português';
const IDIOMA_NATIVO = 'español';
const TIPOS_ATIVOS = [1, 2, 3, 4, 9, 10, 13, 11, 5, 7, 12, 8, 6];
const TIPOS_COM_AUDIO = [4, 9, 10, 13, 11, 7];
const INTERVALO_MS = 5500;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 0 }, transport: WebSocket } });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!UNIT_ID) { console.error('Uso: node automatizar-unidade.js <unit_id>'); process.exit(1); }
  if (!SUPABASE_KEY) { console.error('Falta SUPABASE_SERVICE_ROLE_KEY no ambiente.'); process.exit(1); }

  const { data: unidade, error: erroUnidade } = await supabase
    .from('units').select('id, unit_number, module_content_id').eq('id', UNIT_ID).maybeSingle();
  if (erroUnidade || !unidade) { console.error('Unidade não encontrada.', erroUnidade); process.exit(1); }

  const { data: modulo } = await supabase
    .from('modules_content').select('level_id').eq('id', unidade.module_content_id).maybeSingle();
  const { data: nivel } = await supabase
    .from('levels').select('level_tag').eq('id', modulo?.level_id).maybeSingle();
  const levelTag = nivel?.level_tag || 'A1';

  const { data: tiposReferencia } = await supabase.from('exercise_type_reference').select('*');

  console.log(`Unidade ${unidade.unit_number} — nível ${levelTag}`);

  for (const tipo of TIPOS_ATIVOS) {
    const tipoInfo = tiposReferencia.find((t) => t.activity_type === tipo);
    const tier = tipoInfo?.tier || 'medium';

    const { data: meta } = await supabase.rpc('calcular_meta_tipo_exercicio', { p_unit_id: UNIT_ID, p_activity_type: tipo });
    const metaNum = meta || 0;

    const { count } = await supabase.from('exercises').select('id', { count: 'exact', head: true })
      .eq('unit_id', UNIT_ID).eq('activity_type', tipo).eq('level', levelTag).eq('is_modelo_referencia', false);

    let faltam = Math.max(0, metaNum - (count || 0));
    console.log(`Tipo ${tipo} (${tier}) — meta ${metaNum}, existentes ${count || 0}, faltam ${faltam}`);

    while (faltam > 0) {
      const lote = Math.min(20, faltam);
      const body = {
        unitId: UNIT_ID, idiomaAlvo: IDIOMA_ALVO, idiomaNativo: IDIOMA_NATIVO,
        metaEasy: tier === 'easy' ? lote : 0,
        metaMedium: tier === 'medium' ? lote : 0,
        metaHard: tier === 'hard' ? lote : 0,
        activityType: tipo,
      };
      console.log(`  Gerando lote de ${lote}...`);
      const resp = await fetch(`${API_BASE}/api/ai/gerar-exercicio`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (data.erro) {
        console.error(`  Erro: ${data.erro} — aguardando e tentando de novo...`);
        await esperar(INTERVALO_MS);
        continue;
      }
      console.log(`  Criados ${data.exercicios?.length || 0} rascunhos.`);
      faltam -= lote;
      await esperar(INTERVALO_MS);
    }
  }

  console.log('Geração concluída. Aprovando rascunhos pendentes...');

  const { data: rascunhos } = await supabase.from('exercises_rascunho').select('*').eq('unit_id', UNIT_ID).eq('status', 'pendente');

  let aprovados = 0;
  for (const r of rascunhos || []) {
    try {
      const novoId = crypto.randomUUID();
      let audioUrl = null;

      if (TIPOS_COM_AUDIO.includes(r.activity_type)) {
        const texto = r.audio_transcript || r.texto_audio || r.reading_text || '';
        const voz = r.activity_type === 9 ? 'nova' : 'fable';
        try {
          const respAudio = await fetch(`${API_BASE}/api/ai/gerar-audio-exercicio`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto, exerciseId: novoId, voz }),
          });
          const dataAudio = await respAudio.json();
          if (dataAudio.audio_url) audioUrl = dataAudio.audio_url;
        } catch (e) { console.error('  Falha no áudio, seguindo sem:', e.message); }
      }

      const { error: erroInsert } = await supabase.from('exercises').insert([{
        id: novoId, created_at: new Date().toISOString(), activity_type: r.activity_type,
        difficulty_level: r.difficulty_level, level: r.level_tag, module: r.module, unit: r.unit_number,
        reading_text: r.reading_text, correct_answer: r.correct_answer,
        alternative_options: JSON.stringify(r.alternative_options),
        correct_feedback: r.correct_feedback, incorrect_feedback: r.incorrect_feedback,
        correct_incentive: r.correct_incentive, incorrect_incentive: r.incorrect_incentive,
        unit_id: r.unit_id, activity_name: r.activity_name, course_id: r.course_id,
        level_id: r.level_id, module_id: r.module_id, skill_code: r.skill_code,
        audio_url: audioUrl, texto_audio: r.texto_audio, audio_transcript: r.audio_transcript,
      }]);
      if (erroInsert) throw erroInsert;

      await supabase.from('exercises_rascunho').update({ status: 'aprovado' }).eq('id', r.id);
      aprovados++;
    } catch (e) { console.error(`  Erro ao aprovar rascunho ${r.id}:`, e.message); }
  }

  console.log(`Concluído. ${aprovados} exercício(s) aprovado(s) na unidade ${unidade.unit_number}.`);
}

main();
