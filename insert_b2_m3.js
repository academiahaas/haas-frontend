const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfwqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID do módulo alocado para a progressão avançada (B2)
  const targetModuleId = "8371629d-f189-4b67-bfbd-a30fa85053eb"; 

  try {
    // Garantindo o isolamento limpando apenas os dados da Semana 15
    console.log("🗑️  Limpando lições antigas da Semana 15 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE week_number = 15;`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades de discurso e voz passiva (Semana 15 / Carga B2)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 3 (B2)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 15, 1, 'Unidade 3.1: ''Ele me disse que...'' — O Discurso Indireto no Presente'),
    ('${targetModuleId}', 15, 2, 'Unidade 3.2: Relatando o Passado — Tempos Verbais em Cascata no Discurso Indireto'),
    ('${targetModuleId}', 15, 3, 'Unidade 3.3: O Foco na Ação — Voz Passiva Analítica e Concordância de Particípio'),
    ('${targetModuleId}', 15, 4, 'Unidade 3.4: O Registro Formal — Voz Passiva Sintética com Pronome SE'),
    ('${targetModuleId}', 15, 5, 'Unidade 3.5: Gêneros Textuais — Crônicas, Notícias e Discurso Indireto Livre');
    `;

    await client.query(sql);
    console.log("✅ Módulo 3 do Nível B2 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
