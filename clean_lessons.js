const { Client } = require('pg');
const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";
async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    console.log("🧹 Iniciando a limpeza de lições duplicadas (Versão Corrigida)...");
    // Usando ctid (marcador físico da linha) em vez de MIN(id)
    const deleteQuery = `
      DELETE FROM lessons 
      WHERE ctid NOT IN (
        SELECT MIN(ctid) 
        FROM lessons 
        GROUP BY title, module_id, week_number, lesson_number
      );
    `;
    const res = await client.query(deleteQuery);
    console.log(`✅ Fantasmas eliminados! Clones removidos do banco: ${res.rowCount}`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.end();
  }
}
run();
