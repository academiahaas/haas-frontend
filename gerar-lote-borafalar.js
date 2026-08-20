const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COURSE_ID = '0e5255f6-93d9-4313-b6a3-26024a3a53bb'; // BoraFalar
const INTERVALO_ENTRE_UNITS_MS = 8000; // pausa entre units, evita rate limit
const LOG_PATH = path.join(__dirname, 'log-lote-borafalar.json');

if (!SUPABASE_KEY) {
  console.error('Falta SUPABASE_SERVICE_ROLE_KEY no ambiente.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 0 }, transport: WebSocket } });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function rodarUnit(unitId) {
  return new Promise((resolve) => {
    const proc = spawn('node', ['automatizar-unidade.js', unitId], {
      cwd: __dirname,
      env: process.env,
    });
    let saida = '';
    proc.stdout.on('data', (d) => { saida += d.toString(); process.stdout.write(d); });
    proc.stderr.on('data', (d) => { saida += d.toString(); process.stderr.write(d); });
    proc.on('close', (code) => {
      resolve({ sucesso: code === 0, saida: saida.slice(-2000) });
    });
  });
}

(async () => {
  const { data: units, error } = await supabase
    .from('units')
    .select('id, unit_number, unit_title, module_id, modules_content!inner(level_id, levels!inner(course_id))')
    .eq('modules_content.levels.course_id', COURSE_ID);

  if (error) {
    console.error('Erro ao buscar units:', error);
    process.exit(1);
  }

  console.log(`Total de units encontradas: ${units.length}\n`);

  let log = [];
  if (fs.existsSync(LOG_PATH)) {
    log = JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8'));
  }
  const jaProcessadas = new Set(log.filter(l => l.sucesso).map(l => l.unitId));

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (jaProcessadas.has(u.id)) {
      console.log(`[${i + 1}/${units.length}] ${u.unit_number} - já processada com sucesso antes, pulando.`);
      continue;
    }
    console.log(`\n[${i + 1}/${units.length}] === Unidade ${u.unit_number} - ${u.unit_title} (${u.id}) ===`);
    const resultado = await rodarUnit(u.id);
    log.push({ unitId: u.id, unitNumber: u.unit_number, sucesso: resultado.sucesso, saida: resultado.saida, timestamp: new Date().toISOString() });
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

    if (!resultado.sucesso) {
      console.error(`  >>> FALHOU na unidade ${u.unit_number}, seguindo pra próxima.`);
    }

    if (i < units.length - 1) {
      await esperar(INTERVALO_ENTRE_UNITS_MS);
    }
  }

  const falhas = log.filter(l => !l.sucesso);
  console.log(`\n=== FIM DO LOTE ===`);
  console.log(`Sucesso: ${log.filter(l => l.sucesso).length}  Falhas: ${falhas.length}`);
  if (falhas.length) {
    console.log('Units que falharam:', falhas.map(f => f.unitNumber).join(', '));
  }
})();
