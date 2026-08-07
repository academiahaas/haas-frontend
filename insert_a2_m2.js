const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real do Módulo 2 (A2) extraído do seu banco
  const targetModuleId = "57b09fd3-e8d7-4893-82fc-b0a995b2e7ec"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para evitar duplicidade
    console.log("🗑️  Limpando lições antigas do Módulo 2 (A2) na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura correta com os títulos das 5 unidades (Semana 6)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 2 (A2)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 6, 1, 'Unidade 2.1: O que você está fazendo agora? — A Base do Gerúndio'),
    ('${targetModuleId}', 6, 2, 'Unidade 2.2: Conectados — Celular, Aplicativos e Tecnologia no Cotidiano'),
    ('${targetModuleId}', 6, 3, 'Unidade 2.3: Nas Redes Sociais — Curtindo, Postando e Compartilhando'),
    ('${targetModuleId}', 6, 4, 'Unidade 2.4: Descrevendo o Cenário — Roupas, Pessoas e Ações em Tempo Real'),
    ('${targetModuleId}', 6, 5, 'Unidade 2.5: Conversas Digitais — Simulação de Chats e Diálogos em Tempo Real');
    `;

    await client.query(sql);
    console.log("✅ Módulo 2 do Nível A2 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
