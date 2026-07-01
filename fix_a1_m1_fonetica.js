const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real do Módulo 1 (A1) no seu banco
  const targetModuleId = "d6a07db6-6d79-43a7-91ef-9dee31b597d5"; 

  try {
    // 1. Limpar registros antigos da Semana 1
    console.log("🗑️  Limpando lições genéricas da Semana 1 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}' AND week_number = 1;`);
    console.log("✅ Espaço limpo!");

    // 2. Inserir o Módulo 1 com a super carga fonética
    console.log("🚀 Injetando as 5 Unidades Fonéticas Oficiais do Módulo 1 (A1)...");
    
    const sql = `
    INSERT INTO lessons (module_id, week_number, lesson_number, title) VALUES 
    ('${targetModuleId}', 1, 1, 'Unidade 1.1: O Primeiro Impacto — Saudações e as Vogais Fracas (O->U, L->U)'),
    ('${targetModuleId}', 1, 2, 'Unidade 1.2: Identidade e Chieiro — Apresentação Pessoal e os Sons de TI, TE, DI, DE'),
    ('${targetModuleId}', 1, 3, 'Unidade 1.3: De Onde Você É? — Origem, Verbo Ser e o Labirinto do R e do J'),
    ('${targetModuleId}', 1, 4, 'Unidade 1.4: Educação e Sobrevivência — Fórmulas de Cortesia e o Som do CH e Ç'),
    ('${targetModuleId}', 1, 5, 'Unidade 1.5: Despedidas e Nasais — Estratégias de Saída e o Ditongo EM (EiM)');
    `;

    await client.query(sql);
    console.log("✅ Módulo 1 (A1) reestruturado e blindado com foco fonético no Supabase!");

  } catch (err) {
    console.error('❌ Erro durante a atualização:', err.message);
  } finally {
    await client.end();
  }
}
run();
