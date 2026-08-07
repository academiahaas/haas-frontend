const { Client } = require('pg');
const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT l.id, l.title, m.title as module_title, l.week_number 
      FROM lessons l
      LEFT JOIN modules m ON l.module_id = m.id
      ORDER BY m.module_number ASC, l.week_number ASC, l.lesson_number ASC
    `);
    console.log("\n📋 --- LISTA DE LIÇÕES ENCONTRADAS NO BANCO ---");
    res.rows.forEach((row, index) => {
      console.log(`${index + 1}. [Módulo: ${row.module_title || 'Sem Módulo'}] (Semana ${row.week_number}) - "${row.title}"`);
    });
    console.log("---------------------------------------------\n");
  } catch (err) {
    console.error('Erro ao ler:', err.message);
  } finally {
    await client.end();
  }
}
run();
