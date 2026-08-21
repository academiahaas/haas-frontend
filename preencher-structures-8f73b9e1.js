import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function sb(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function sbPatch(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
}

function extrairJSON(texto) {
  // remove possiveis fences markdown ```json ... ```
  let limpo = texto.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(limpo);
  } catch (e) {
    // tenta pegar so o trecho entre a primeira { e a ultima }
    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (inicio >= 0 && fim > inicio) {
      return JSON.parse(limpo.slice(inicio, fim + 1));
    }
    throw e;
  }
}

async function chamarDeepseek(prompt) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const conteudo = data.choices[0].message.content;
  return extrairJSON(conteudo);
}

async function processarModulo(level, mod, tentativa = 1) {
  try {
    const prompt = `IMPORTANTE: responde TODO en espanol, sin mezclar con portugues ni otro idioma.

Nivel: ${level.level_tag}. Modulo: "${mod.module_title}".
Contenido tematico: "${mod.thematic_content || ''}"
Objetivo pedagogico: "${mod.pedagogical_objective || ''}"

Genera SOLO un objeto JSON con las estructuras gramaticales y verbos clave que se trabajan en este modulo. Evita usar comillas dobles dentro del texto del valor; usa comillas simples si necesitas citar una palabra.

Formato exacto:
{ "structures_and_verbs": "descripcion detallada en espanol, 2-4 frases" }`;

    const resultado = await chamarDeepseek(prompt);
    await sbPatch(`modules_content?id=eq.${mod.id}`, {
      structures_and_verbs: resultado.structures_and_verbs,
    });
    console.log(`  OK: ${level.level_tag} - ${mod.module_title}`);
    return true;
  } catch (e) {
    if (tentativa < 2) {
      console.log(`  Retry (${e.message.slice(0, 80)}): ${level.level_tag} - ${mod.module_title}`);
      return processarModulo(level, mod, tentativa + 1);
    }
    console.error(`  FALHOU: ${level.level_tag} - ${mod.module_title} :: ${e.message.slice(0, 150)}`);
    return false;
  }
}

async function main() {
  const COURSE_ID = '8f73b9e1-2c4d-4a1b-9f8e-d7a6c5b4e3f2';
  const levels = await sb(`levels?course_id=eq.${COURSE_ID}&select=id,level_tag&order=level_tag`);

  const falhas = [];

  for (const level of levels) {
    const modules = await sb(
      `modules_content?level_id=eq.${level.id}&select=id,module_title,thematic_content,pedagogical_objective&order=module_number`
    );

    for (const mod of modules) {
      const ok = await processarModulo(level, mod);
      if (!ok) falhas.push(`${level.level_tag} - ${mod.module_title}`);
    }
  }

  console.log('\n=== FIM ===');
  if (falhas.length) {
    console.log(`Módulos que falharam (${falhas.length}):`);
    falhas.forEach(f => console.log(`  - ${f}`));
  } else {
    console.log('Todos os módulos preenchidos com sucesso.');
  }
}

main().catch((e) => { console.error('ERRO FATAL:', e.message); process.exit(1); });
