const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID alocado para o terceiro módulo do nível A1
  const targetModuleId = "57b09fd3-e8d7-4893-82fc-b0a995b2e7ec"; 

  try {
    console.log("🗑️  Limpando lições da Semana 3 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}' AND week_number = 3;`);
    console.log("✅ Espaço limpo!");

    console.log("🚀 Injetando as 5 Unidades Oficiais do Módulo 3 (A1)...");
    
    const sql = `
    INSERT INTO lessons (module_id, week_number, lesson_number, title) VALUES 
    ('${targetModuleId}', 3, 1, 'Unidade 3.1: No Restaurante — Alimentos, Bebidas e o Som do ÃO'),
    ('${targetModuleId}', 3, 2, 'Unidade 3.2: Expressando Gostos e Preferências — Blindagem da Preposição ''DE'''),
    ('${targetModuleId}', 3, 3, 'Unidade 3.3: Lugares da Cidade e Meios de Transporte — Verbo Ir e Deslocamentos'),
    ('${targetModuleId}', 3, 4, 'Unidade 3.4: O Labirinto das Contrações de Lugar — Verbo Estar + No, Na, Nos, Nas'),
    ('${targetModuleId}', 3, 5, 'Unidade 3.5: De Onde Venho e Para Onde Vou — Movimento e Contrações Originárias (Do, Da)');
    `;

    await client.query(sql);
    console.log("✅ Módulo 3 atualizado com sucesso no Supabase!");

  } catch (err) {
    console.error('❌ Erro durante a atualização:', err.message);
  } finally {
    await client.end();
  }
}
run();
