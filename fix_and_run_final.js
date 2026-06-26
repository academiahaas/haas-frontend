const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    console.log("🔧 Alinhando colunas estruturais faltantes na tabela 'questions'...");
    
    // Força a criação de todas as colunas que o gerador precisa para não quebrar por nada
    await client.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS type INTEGER;`);
    await client.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS lesson_id UUID;`);
    await client.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS data JSONB;`);
    
    console.log("✅ Todas as colunas necessárias estão criadas e alinhadas!");
    console.log("🔄 Executando o gerador principal...");

  } catch (err) {
    console.error("❌ Erro no ajuste:", err.message);
  } finally {
    await client.end();
  }
}
run();
