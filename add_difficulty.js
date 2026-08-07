const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    console.log("🚀 Adicionando a coluna de Dificuldade Inteligente na tabela 'questions'...");
    
    // Altera a tabela para incluir a coluna de nível de dificuldade
    await client.query(`
      ALTER TABLE questions 
      ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'medium';
    `);
    
    console.log("✅ Coluna 'difficulty_level' criada com sucesso! O esqueleto agora é adaptativo!");
  } catch (err) {
    console.error('❌ Erro ao atualizar banco:', err.message);
  } finally {
    await client.end();
  }
}
run();
