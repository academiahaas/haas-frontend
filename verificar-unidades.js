// Verifica quantas unidades cada módulo tem, por curso — via REST direta (sem realtime).
import 'dotenv/config';

const BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

async function sb(path) {
  const res = await fetch(`${BASE}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function sbCount(path) {
  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    headers: { ...headers, Prefer: 'count=exact' },
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  const range = res.headers.get('content-range'); // ex: "0-9/113"
  return range ? parseInt(range.split('/')[1], 10) : (await res.json()).length;
}

async function verificarCurso(courseId) {
  console.log(`\n${'='.repeat(70)}`);
  const cursos = await sb(`courses?id=eq.${courseId}&select=*`);
  const course = cursos[0];
  console.log(`Curso: ${course?.name || course?.title || '(desconhecido)'} (${courseId})`);
  console.log('='.repeat(70));

  const levels = await sb(`levels?course_id=eq.${courseId}&select=id,level_tag,level_name`);
  if (!levels?.length) { console.warn('  ⚠️  Nenhum nível encontrado.'); return; }

  let totalUnidades = 0;
  const vazios = [];
  const suspeitos = [];

  for (const level of levels) {
    const modules = await sb(
      `modules_content?level_id=eq.${level.id}&select=id,module_number,module_title&order=module_number`
    );

    for (const mod of modules || []) {
      const n = await sbCount(`units?module_content_id=eq.${mod.id}&select=id`);
      totalUnidades += n;
      const label = `Nível ${level.level_tag} / Mód.${mod.module_number} - ${mod.module_title}`;

      if (n === 0) { vazios.push(label); console.log(`  ❌ ${label}: 0 unidades`); }
      else if (n < 3) { suspeitos.push(`${label} (${n})`); console.log(`  ⚠️  ${label}: ${n} unidades`); }
      else console.log(`  ✅ ${label}: ${n} unidades`);
    }
  }

  console.log(`\n  Total: ${totalUnidades} unidades.`);
  if (vazios.length) {
    console.log(`  MÓDULOS SEM UNIDADES (${vazios.length}):`);
    vazios.forEach(m => console.log(`    - ${m}`));
  }
  if (suspeitos.length) {
    console.log(`  Módulos com poucas unidades (${suspeitos.length}):`);
    suspeitos.forEach(m => console.log(`    - ${m}`));
  }
  if (!vazios.length && !suspeitos.length) console.log('  Tudo certo. ✅');
}

async function main() {
  const ids = process.argv.slice(2);
  if (!ids.length) { console.error('Uso: node verificar-unidades.js <courseId> [...]'); process.exit(1); }
  for (const id of ids) await verificarCurso(id);
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
