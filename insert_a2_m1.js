const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real do Módulo 1 (A2) extraído do seu banco para Linha do Tempo e Histórias
  const targetModuleId = "f7403907-bf11-4991-9334-0829d1ff7ee6"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para evitar duplicidade
    console.log("🗑️  Limpando lições antigas do Módulo 1 (A2) na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura correta com os títulos das 5 unidades (Semana 5 / Carga A2)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 1 (A2)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 5, 1, 'Unidade 1.1: O que você fez ontem? — Verbos Regulares em -AR'),
    ('${targetModuleId}', 5, 2, 'Unidade 1.2: O que aconteceu? — Verbos Regulares em -ER e -IR'),
    ('${targetModuleId}', 5, 3, 'Unidade 1.3: O Labirinto dos Passados Irregulares (Ir, Ser, Ter e Fazer)'),
    ('${targetModuleId}', 5, 4, 'Unidade 1.4: Quem sou eu no mercado? — Profissões e Gênero Uniforme'),
    ('${targetModuleId}', 5, 5, 'Unidade 1.5: Minhas Experiências Concluídas — Consolidação do Passado');
    `;

    await client.query(sql);
    console.log("✅ Módulo 1 do Nível A2 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
