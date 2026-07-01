const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real alocado para o segundo módulo do nível B1
  const targetModuleId = "d6a07db6-6d79-43a7-91ef-9dee31b597d5"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para garantir carga limpa
    console.log("🗑️  Limpando lições antigas do Módulo 2 (B1) na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades de Subjuntivo (Semana 10 / Carga B1)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 2 (B1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 10, 1, 'Unidade 2.1: Minha Torcida — Expressando Desejos e Emoções com Verbos em -AR'),
    ('${targetModuleId}', 10, 2, 'Unidade 2.2: Eu Quero Assim — Desejos Diretos, Ordens Leves e Verbos em -ER/-IR'),
    ('${targetModuleId}', 10, 3, 'Unidade 2.3: Os Irregulares do ''Talvez'' — Os Gigantes da Incerteza (Faça, Seja, Vá, Tenha)'),
    ('${targetModuleId}', 10, 4, 'Unidade 2.4: É Possível ou É Certo? — O Contraste entre Certeza (Indicativo) e Hipótese'),
    ('${targetModuleId}', 10, 5, 'Unidade 2.5: Concordo ou Discordo? — Debatendo e Suavizando Opiniões com Subjuntivo');
    `;

    await client.query(sql);
    console.log("✅ Módulo 2 do Nível B1 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
