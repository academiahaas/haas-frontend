const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  const targetModuleId = "6bca1a5d-dd9a-40fb-8009-cf1a26bb46e6"; 

  try {
    console.log("🗑️  Limpando lições da Semana 2 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}' AND week_number = 2;`);
    console.log("✅ Espaço limpo!");

    console.log("🚀 Injetando as 5 Unidades Oficiais do Módulo 2 (A1)...");
    
    const sql = `
    INSERT INTO lessons (module_id, week_number, lesson_number, title) VALUES 
    ('${targetModuleId}', 2, 1, 'Unidade 2.1: Minha Família e a Idade — Verbo Ter, Pronúncia do NH e Números até 20'),
    ('${targetModuleId}', 2, 2, 'Unidade 2.2: Minha Casa, Meu Refúgio — Cômodos, Possessivos Simples e ''Onde está?'''),
    ('${targetModuleId}', 2, 3, 'Unidade 2.3: De Quem é Isto? — Objetos Pessoais e a Armadilha do Seu/Sua'),
    ('${targetModuleId}', 2, 4, 'Unidade 2.4: Cores, Roupas e Quantidades — Concordância e Números até 100'),
    ('${targetModuleId}', 2, 5, 'Unidade 2.5: Onde Estão as Coisas? — Verbo Estar, Preposições de Lugar e o Som do EM');
    `;

    await client.query(sql);
    console.log("✅ Módulo 2 atualizado com sucesso no Supabase com mapeamento analítico!");

  } catch (err) {
    console.error('❌ Erro durante a atualização:', err.message);
  } finally {
    await client.end();
  }
}
run();
