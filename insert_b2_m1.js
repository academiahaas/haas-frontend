const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID do módulo alocado para o início da trilha avançada (B2)
  const targetModuleId = "8371629d-f189-4b67-bfbd-a30fa85053eb"; 

  try {
    // Como estamos gerenciando semanas incrementais (Semana 13), limpamos apenas os registros da semana 13
    console.log("🗑️  Limpando lições antigas da Semana 13 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE week_number = 13;`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades de imersão cultural (Semana 13 / Carga B2)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 1 (B2)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 13, 1, 'Unidade 1.1: O Brasil que Fala Diferente — Sotaques, Ritmos e Variação Regional'),
    ('${targetModuleId}', 13, 2, 'Unidade 1.2: O Papo das Ruas — Gírias Essenciais do Cotidiano e Registros de Fala'),
    ('${targetModuleId}', 13, 3, 'Unidade 1.3: O Segredo das Expressões Idiomáticas — Decodificando Metáforas Populares'),
    ('${targetModuleId}', 13, 4, 'Unidade 1.4: Ironia, Humor e as Entrelinhas — Interpretação Pragmática do Tom'),
    ('${targetModuleId}', 13, 5, 'Unidade 1.5: Cortesia Popular e Diminutivos Afetivos — Conexão e Malandragem do Bem');
    `;

    await client.query(sql);
    console.log("✅ Módulo 1 do Nível B2 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
