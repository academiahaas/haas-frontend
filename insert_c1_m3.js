const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID do módulo alocado para o polimento estético (C1)
  const targetModuleId = "adbcc124-7562-4708-9a3f-869e79e01535"; 

  try {
    // Como estamos gerenciando semanas incrementais (Semana 19), limpamos apenas os registros da semana 19
    console.log("🗑️  Limpando lições antigas da Semana 19 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE week_number = 19;`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades estéticas (Semana 19 / Carga C1 - 4h por lição)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 3 (C1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 19, 1, 'Unidade 3.1: A Arte da Crônica Urbana — Veríssimo, Humor Cotidiano e Quebra de Expectativa'),
    ('${targetModuleId}', 19, 2, 'Unidade 3.2: Lirismo e Nostalgia — Rubem Braga, Martha Medeiros e Prosa Confessional'),
    ('${targetModuleId}', 19, 3, 'Unidade 3.3: O Segredo das Entrelinhas — Duplo Sentido, Ambiguidade e Subtextualidade'),
    ('${targetModuleId}', 19, 4, 'Unidade 3.4: Arqueologia Linguística — Registros Históricos, Sintaxe Tradicional e Arcaísmos'),
    ('${targetModuleId}', 19, 5, 'Unidade 3.5: Hipermodernidade — Da Literatura aos Memes, Redes Sociais e Hibridismo Digital');
    `;

    await client.query(sql);
    console.log("✅ Módulo 3 do Nível C1 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
