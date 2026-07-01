const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real mapeado para o fechamento do bloco A2
  const targetModuleId = "adbcc124-7562-4708-9a3f-869e79e01535"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para evitar duplicidade
    console.log("🗑️  Limpando lições antigas do Módulo 4 (A2) na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura correta com os títulos das 5 unidades (Semana 8)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 4 (A2)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 8, 1, 'Unidade 4.1: O que você vai fazer amanhã? — O Futuro Próximo'),
    ('${targetModuleId}', 8, 2, 'Unidade 4.2: Meu Próximo Fim de Semana — Lazer e Marcadores de Tempo'),
    ('${targetModuleId}', 8, 3, 'Unidade 4.3: As Férias dos Sonhos — Viagens, Movimento e Feriados'),
    ('${targetModuleId}', 8, 4, 'Unidade 4.4: Meus Projetos de Vida — O Futuro do Presente Simples'),
    ('${targetModuleId}', 8, 5, 'Unidade 4.5: O Mapa dos Meus Sonhos — Consolidação Final do Futuro');
    `;

    await client.query(sql);
    console.log("✅ Módulo 4 do Nível A2 sincronizado e inserido com sucesso!");
    console.log("🏆 NÍVEL A2 CONCLUÍDO E PRONTO NO BANCO DE DADOS!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
