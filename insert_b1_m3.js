const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real alocado para o terceiro módulo do nível B1
  const targetModuleId = "57b09fd3-e8d7-4893-82fc-b0a995b2e7ec"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para garantir carga limpa
    console.log("🗑️  Limpando lições antigas do Módulo 3 (B1) na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades de Condicional e Hipóteses (Semana 11 / Carga B1)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 3 (B1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 11, 1, 'Unidade 3.1: Gentileza Gera Gentileza — Pedidos Educados e Condicional de Cortesia'),
    ('${targetModuleId}', 11, 2, 'Unidade 3.2: E se os Planos Mudassem? — O Mundo das Condições e Imprevistos'),
    ('${targetModuleId}', 11, 3, 'Unidade 3.3: Se Eu Pudesse... — O Imperfeito do Subjuntivo e as Formas em -SSE'),
    ('${targetModuleId}', 11, 4, 'Unidade 3.4: A Combinação Perfeita — Estruturando Frases Hipotéticas (Se eu tivesse, eu faria)'),
    ('${targetModuleId}', 11, 5, 'Unidade 3.5: Arrependimentos e Julgamentos Polidos — Consolidação Narrativa e Hipóteses');
    `;

    await client.query(sql);
    console.log("✅ Módulo 3 do Nível B1 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
