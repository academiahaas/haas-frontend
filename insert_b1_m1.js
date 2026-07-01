const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real alocado para o início do nível B1
  const targetModuleId = "c1e509ab-4be8-49ee-b62f-a4678af3c60a"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para garantir carga limpa
    console.log("🗑️  Limpando lições antigas do Módulo 1 (B1) na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades ampliadas (Semana 9 / Carga B1)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 1 (B1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 9, 1, 'Unidade 1.1: Na Minha Infância — Brinquedos, Brincadeiras e Verbos em -AR'),
    ('${targetModuleId}', 9, 2, 'Unidade 1.2: Como eram as coisas antigamente? — Mudanças na Sociedade e Verbos em -ER/-IR'),
    ('${targetModuleId}', 9, 3, 'Unidade 1.3: Os Quatro Gigantes Irregulares da Nostalgia (Ser, Ter, Vir e Pôr)'),
    ('${targetModuleId}', 9, 4, 'Unidade 1.4: O Passado antes do Passado — Pretérito Mais-que-Perfeito Composto'),
    ('${targetModuleId}', 9, 5, 'Unidade 1.5: Contadores de Histórias — Consolidação Narrativa e Linha do Tempo');
    `;

    await client.query(sql);
    console.log("✅ Módulo 1 do Nível B1 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
