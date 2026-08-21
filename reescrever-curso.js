require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const fs = require('fs');

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_BASE = 'https://campus.academiahaas.com';
const COURSE_ID = process.argv[2];
const INTERVALO_MS = 4000;

if (!COURSE_ID) { console.error('Uso: node reescrever-curso.js <course_id>'); process.exit(1); }
if (!SUPABASE_KEY) { console.error('Falta SUPABASE_SERVICE_ROLE_KEY no ambiente.'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 0 }, transport: WebSocket } });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function chamarApi(rota, body) {
  const resp = await fetch(`${API_BASE}${rota}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (data.error) throw new Error(`${rota}: ${data.error} ${data.detalhe || ''}`);
  return data;
}

const LOG_PATH = `${__dirname}/log-reescrever-${COURSE_ID}.json`;
let log = fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8')) : [];
const moduloJaFeito = new Set(log.filter(l => l.sucesso).map(l => l.moduleId));
function salvarLog() { fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2)); }

(async () => {
  const { data: curso } = await supabase.from('courses').select('id, title').eq('id', COURSE_ID).maybeSingle();
  if (!curso) { console.error('Curso não encontrado.'); process.exit(1); }
  console.log(`Curso: ${curso.title} (${curso.id})`);

  const { data: niveis } = await supabase.from('levels').select('id, level_tag').eq('course_id', COURSE_ID).order('level_tag');
  console.log(`Níveis encontrados: ${niveis.length}`);

  for (const nivel of niveis) {
    const { data: modulos } = await supabase.from('modules_content')
      .select('id, module_title, module_number, thematic_content, estimated_hours, pedagogical_objective')
      .eq('level_id', nivel.id).order('module_number');

    for (const modulo of modulos) {
      if (moduloJaFeito.has(modulo.id)) {
        console.log(`[pulando] Módulo ${modulo.module_number} - ${modulo.module_title} já reescrito antes.`);
        continue;
      }
      console.log(`\n=== Nível ${nivel.level_tag} / Módulo ${modulo.module_number} - ${modulo.module_title} ===`);
      try {
        const { data: unidadesAntigas } = await supabase.from('units').select('id').eq('module_content_id', modulo.id);
        const idsAntigos = (unidadesAntigas || []).map(u => u.id);

        if (idsAntigos.length) {
          console.log(`  Apagando ${idsAntigos.length} unidade(s) antiga(s) e exercícios ligados a elas...`);
          await supabase.from('exercises').delete().in('unit_id', idsAntigos);
          await supabase.from('exercises_rascunho').delete().in('unit_id', idsAntigos);
          await supabase.from('units').delete().in('id', idsAntigos);
        }

        console.log('  Gerando novos títulos de unidade...');
        const geradas = await chamarApi('/api/admin/curso-wizard/unidades', {
          titulo_curso: curso.title,
          level_tag: nivel.level_tag,
          module_title: modulo.module_title,
          thematic_content: modulo.thematic_content,
          estimated_hours: modulo.estimated_hours,
          unidades_ja_criadas: [],
        });
        const novasUnidades = geradas.dados.unidades;
        console.log(`  IA decidiu criar ${novasUnidades.length} unidade(s).`);
        await esperar(INTERVALO_MS);

        const salvas = await chamarApi('/api/admin/curso-wizard/salvar-unidades', {
          module_content_id: modulo.id,
          module_number: modulo.module_number,
          level: nivel.level_tag,
          unidades: novasUnidades,
        });
        await esperar(INTERVALO_MS);

        for (let i = 0; i < salvas.unidades.length; i++) {
          const unidadeSalva = salvas.unidades[i];
          const unidadeOrigem = novasUnidades[i];
          console.log(`    Gerando conteúdo pedagógico: ${unidadeSalva.unit_title}`);
          const objetivo = await chamarApi('/api/admin/curso-wizard/objetivo-unidade', {
            titulo_curso: curso.title,
            level_tag: nivel.level_tag,
            module_title: modulo.module_title,
            module_focus: modulo.pedagogical_objective || modulo.thematic_content,
            unit_title: unidadeSalva.unit_title,
            estimated_hours: unidadeOrigem.estimated_hours,
          });
          await esperar(INTERVALO_MS);

          await chamarApi('/api/admin/curso-wizard/atualizar-objetivo-unidade', {
            unit_id: unidadeSalva.id,
            pedagogical_objective: objetivo.dados.pedagogical_objective,
            situational_content: objetivo.dados.situational_content,
            hidden_grammatical_structure: objetivo.dados.hidden_grammatical_structure,
            practical_phonetic_focus: objetivo.dados.practical_phonetic_focus,
            skill_label: objetivo.dados.skill_label,
            success_code: objetivo.dados.success_code,
          });
          await esperar(INTERVALO_MS);
        }

        log.push({ moduleId: modulo.id, moduleNumber: modulo.module_number, sucesso: true, timestamp: new Date().toISOString() });
        salvarLog();
        console.log(`  Módulo concluído: ${salvas.unidades.length} unidade(s) nova(s) completa(s).`);
      } catch (e) {
        console.error(`  FALHOU no módulo ${modulo.module_number}:`, e.message);
        log.push({ moduleId: modulo.id, moduleNumber: modulo.module_number, sucesso: false, erro: e.message, timestamp: new Date().toISOString() });
        salvarLog();
      }
    }
  }

  console.log('\n=== FIM ===');
})();
