const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real do Módulo 3 extraído do seu banco
  const targetModuleId = "830d8b69-dc20-4321-a55e-0490e71bb2fa"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para evitar duplicidade
    console.log("🗑️  Limpando lições antigas do Módulo 3 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura correta com os títulos das 5 unidades (Semana 3)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 3 (A1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 3, 1, 'Unidade 3.1: No Restaurante — Alimentos, Bebidas e Como Fazer Pedidos'),
    ('${targetModuleId}', 3, 2, 'Unidade 3.2: Andando pela Cidade — Lugares Comuns e Meios de Transporte'),
    ('${targetModuleId}', 3, 3, 'Unidade 3.3: Como Chegar? — Deslocamentos, Rotas Simples e o Verbo Ir'),
    ('${targetModuleId}', 3, 4, 'Unidade 3.4: O Que Você Gosta? — Preferências e a Blindagem do ''Gosto de'''),
    ('${targetModuleId}', 3, 5, 'Unidade 3.5: Dominando o Espaço — Preposições EM/DE e as Contrações (No/Na, Do/Da)');
    `;

    await client.query(sql);
    console.log("✅ Módulo 3 (A1) sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
