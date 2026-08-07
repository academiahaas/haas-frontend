const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real do Módulo 2 extraído do seu banco
  const targetModuleId = "6bca1a5d-dd9a-40fb-8009-cf1a26bb46e6"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo específico para evitar duplicidade
    console.log("🗑️  Limpando lições antigas do Módulo 2 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura correta com os títulos das 5 unidades (Semana 2)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 2 (A1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 2, 1, 'Unidade 2.1: Minha Família — Vocabulário de Relações e Idade com Verbo Ter'),
    ('${targetModuleId}', 2, 2, 'Unidade 2.2: Meu Canto — Partes da Casa e Descrição de Moradia'),
    ('${targetModuleId}', 2, 3, 'Unidade 2.3: Meus Objetos e Roupas — Cores, Quantidades e Números até 100'),
    ('${targetModuleId}', 2, 4, 'Unidade 2.4: De quem é? — Estruturas de Posse e Pronomes Possessivos'),
    ('${targetModuleId}', 2, 5, 'Unidade 2.5: Onde está? — Verbo Estar para Localização e Estados Temporários');
    `;

    await client.query(sql);
    console.log("✅ Módulo 2 (A1) sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
