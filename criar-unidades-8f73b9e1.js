import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = 'http://localhost:3005';
const COURSE_ID = '8f73b9e1-2c4d-4a1b-9f8e-d7a6c5b4e3f2';
const TITULO = 'Inglés para el Trabajo';

const sbHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function sb(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function sbInsert(path, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: { ...sbHeaders, Prefer: 'return=representation' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`insert ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

function extrairJSON(texto) {
  let limpo = texto.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
  try { return JSON.parse(limpo); }
  catch (e) {
    const i = limpo.indexOf('{'), f = limpo.lastIndexOf('}');
    if (i >= 0 && f > i) return JSON.parse(limpo.slice(i, f + 1));
    throw e;
  }
}

async function post(path, body, tentativa = 1) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    let json;
    try { json = JSON.parse(raw); } catch { json = { error: 'JSON invalido', detalhe: raw.slice(0, 200) }; }
    if (!res.ok || json.error) throw new Error(JSON.stringify(json).slice(0, 200));
    return json;
  } catch (e) {
    if (tentativa < 3) {
      console.log(`  Retry (${e.message.slice(0, 80)})`);
      return post(path, body, tentativa + 1);
    }
    throw e;
  }
}

async function main() {
  const levels = await sb(`levels?course_id=eq.${COURSE_ID}&select=id,level_tag,pedagogical_focus&order=level_tag`);
  const falhas = [];
  let totalUnidades = 0;

  for (const level of levels) {
    const modules = await sb(
      `modules_content?level_id=eq.${level.id}&select=id,module_number,module_title,thematic_content,pedagogical_objective&order=module_number`
    );

    let unidadesJaCriadasNivel = [];

    for (const mod of modules) {
      console.log(`\n=== Nível ${level.level_tag} / Mód.${mod.module_number} - ${mod.module_title} ===`);
      const jaExistentes = await sb(`units?module_content_id=eq.${mod.id}&select=id`);
      if (jaExistentes.length > 0) {
        console.log(`  Já tem ${jaExistentes.length} unidade(s), pulando.`);
        continue;
      }
      console.log('Gerando títulos de unidade...');

      let geraUnidades;
      try {
        geraUnidades = await post('/api/admin/curso-wizard/unidades', {
          titulo_curso: TITULO,
          level_tag: level.level_tag,
          module_title: mod.module_title,
          thematic_content: mod.thematic_content,
          estimated_hours: mod.estimated_hours || 20,
          unidades_ja_criadas: unidadesJaCriadasNivel,
        });
      } catch (e) {
        console.error(`  FALHOU ao gerar títulos: ${e.message}`);
        falhas.push(`${level.level_tag}/Mód.${mod.module_number} (títulos)`);
        continue;
      }

      const unidadesBrutas = geraUnidades.dados.unidades;
      console.log(`  IA decidiu criar ${unidadesBrutas.length} unidade(s).`);

      const linhasParaInserir = [];

      for (const u of unidadesBrutas) {
        try {
          console.log(`    Gerando conteúdo pedagógico: ${u.unit_title}`);
          const obj = await post('/api/admin/curso-wizard/objetivo-unidade', {
            titulo_curso: TITULO,
            level_tag: level.level_tag,
            module_title: mod.module_title,
            module_focus: mod.pedagogical_objective,
            unit_title: u.unit_title,
            estimated_hours: Math.max(1, Math.round(u.estimated_hours)),
            feedback: 'El success_code debe tener maximo 10 caracteres, en MAYUSCULAS, y SI puede contener espacios cuando el tema lo amerite (ej: VOZ FORMAL), siempre que sea coherente con el tema de la unidad.',
          });
          const d = obj.dados;
          linhasParaInserir.push({
            module_content_id: mod.id,
            module_id: mod.id,
            module_number: mod.module_number,
            level: level.level_tag,
            unit_number: String(u.unit_number),
            unit_title: u.unit_title,
            estimated_hours: Math.max(1, Math.round(u.estimated_hours)),
            pedagogical_objective: d.pedagogical_objective,
            situational_content: d.situational_content,
            hidden_grammatical_structure: d.hidden_grammatical_structure,
            practical_phonetic_focus: d.practical_phonetic_focus,
            skill_label: d.skill_label,
            success_code: d.success_code,
          });
        } catch (e) {
          console.error(`    FALHOU: ${u.unit_title} :: ${e.message}`);
          falhas.push(`${level.level_tag}/Mód.${mod.module_number} - ${u.unit_title}`);
        }
      }

      if (linhasParaInserir.length > 0) {
        await sbInsert('units', linhasParaInserir);
        totalUnidades += linhasParaInserir.length;
        console.log(`  Módulo concluído: ${linhasParaInserir.length} unidade(s) salvas.`);
        unidadesJaCriadasNivel = unidadesJaCriadasNivel.concat(
          linhasParaInserir.map(l => ({ unit_title: l.unit_title }))
        );
      }
    }
  }

  console.log(`\n=== FIM: ${totalUnidades} unidades criadas no total ===`);
  if (falhas.length) {
    console.log(`Falhas (${falhas.length}):`);
    falhas.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch((e) => { console.error('ERRO FATAL:', e.message); process.exit(1); });
