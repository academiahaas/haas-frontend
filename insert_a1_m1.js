const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real do Módulo 1 extraído do seu banco
  const targetModuleId = "d6a07db6-6d79-43a7-91ef-9dee31b597d5"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo específico para evitar duplicidade
    console.log("🗑️  Limpando lições antigas do Módulo 1 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura correta com os títulos das 5 unidades (Semana 1)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 1 (A1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 1, 1, 'Unidade 1.1: Sons Sibilantes e Palatais (TI/TE e DI/DE)'),
    ('${targetModuleId}', 1, 2, 'Unidade 1.2: O Som do Jota e do R no Começo de Frase'),
    ('${targetModuleId}', 1, 3, 'Unidade 1.3: Fricativas e Nasais (CH, Ç e Terminação EM)'),
    ('${targetModuleId}', 1, 4, 'Unidade 1.4: Vogais Fracas e Laterais (O final e L final)'),
    ('${targetModuleId}', 1, 5, 'Unidade 1.5: Identidade Prática — Verbos Ser e Chamar-se');
    `;

    await client.query(sql);
    console.log("✅ Módulo 1 (A1) sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
