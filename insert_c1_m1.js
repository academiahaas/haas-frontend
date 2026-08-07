const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID do módulo alocado para o início da trilha avançada de polimento (C1)
  const targetModuleId = "6bca1a5d-dd9a-40fb-8009-cf1a26bb46e6"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para garantir carga limpa
    console.log("🗑️  Limpando lições antigas do Módulo 1 (C1) na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades densas (Semana 17 / Carga C1 - 4h por lição)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 1 (C1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 17, 1, 'Unidade 1.1: O Ímã Gramatical — Regras de Atração e Próclise Obrigatória'),
    ('${targetModuleId}', 17, 2, 'Unidade 1.2: A Elegância da Abertura — Ênclise Culta e Proibições Iniciais'),
    ('${targetModuleId}', 17, 3, 'Unidade 1.3: O Ritmo Clássico — Mesóclise em Textos Formais e Jurídicos'),
    ('${targetModuleId}', 17, 4, 'Unidade 1.4: O Malabarismo Sintático — Colocação Pronominal em Locuções Verbais'),
    ('${targetModuleId}', 17, 5, 'Unidade 1.5: O Desafio da Eufonia — Consolidação Pronominal e Estilo');
    `;

    await client.query(sql);
    console.log("✅ Módulo 1 do Nível C1 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
