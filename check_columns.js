const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    console.log("🔍 Inspecionando colunas reais da tabela 'lessons'...");
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'lessons';
    `);
    
    if(res.rows.length === 0) {
      console.log("⚠️ A tabela 'lessons' não foi encontrada ou está vazia!");
    } else {
      console.table(res.rows);
    }
  } catch (err) {
    console.error('❌ Erro ao inspecionar:', err.message);
  } finally {
    await client.end();
  }
}
run();
