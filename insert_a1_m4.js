const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real do Módulo 4 extraído do seu banco
  const targetModuleId = "1c452297-4b84-4e69-ab16-89408366ff38"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para evitar duplicidade
    console.log("🗑️  Limpando lições antigas do Módulo 4 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura correta com os títulos das 5 unidades (Semana 4)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 4 (A1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 4, 1, 'Unidade 4.1: Meu Dia a Dia — Vocabulário de Rotina Diária, Expressões de Tempo e Hobbies'),
    ('${targetModuleId}', 4, 2, 'Unidade 4.2: Masculino ou Feminino? — Regras Gerais de Gênero e Artigos'),
    ('${targetModuleId}', 4, 3, 'Unidade 4.3: Armadilhas de Gênero — Exceções Críticas (O Problema, A Mão, O Mapa)'),
    ('${targetModuleId}', 4, 4, 'Unidade 4.4: Ações no Presente — Conjugação de Verbos Regulares em -AR, -ER e -IR'),
    ('${targetModuleId}', 4, 5, 'Unidade 4.5: Do Despertador ao Descanso — Verbos Reflexivos de Cuidado e os Irregulares Fazer, Poder e Querer');
    `;

    await client.query(sql);
    console.log("✅ Módulo 4 (A1) sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
