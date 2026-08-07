const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    console.log("🔧 Ajustando a estrutura da tabela 'questions' no Supabase...");
    
    // Altera a tabela existente para garantir que ela tenha as colunas necessárias para o mobile
    await client.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty TEXT;`);
    await client.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;`);
    
    console.log("✅ Colunas alinhadas com sucesso!");
    console.log("🔄 Chamando o motor principal para injetar o conteúdo...");

  } catch (err) {
    console.error("❌ Erro no ajuste:", err.message);
  } finally {
    await client.end();
  }
}
run();
