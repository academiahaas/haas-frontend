const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    console.log("🔍 Buscando IDs e títulos na tabela 'modules'...");
    const res = await client.query("SELECT id, title FROM modules;");
    if (res.rows.length === 0) {
      console.log("⚠️ Nenhum módulo encontrado na tabela 'modules'.");
    } else {
      console.table(res.rows);
    }
  } catch (err) {
    console.error('❌ Erro ao listar módulos:', err.message);
  } finally {
    await client.end();
  }
}
run();
