const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID do módulo alocado para a progressão de polimento (C1)
  const targetModuleId = "1c452297-4b84-4e69-ab16-89408366ff38"; 

  try {
    // Como estamos gerenciando semanas incrementais (Semana 18), limpamos apenas os registros da semana 18
    console.log("🗑️  Limpando lições antigas da Semana 18 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE week_number = 18;`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades de crase e regência (Semana 18 / Carga C1 - 4h por lição)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 2 (C1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 18, 1, 'Unidade 2.1: A Fusão Obrigatória — O Acento Grave e o Casamento do ''A'' + ''A'''),
    ('${targetModuleId}', 18, 2, 'Unidade 2.2: Zona Proibida — Casos Vetados, Palavras Repetidas e Erros Clássicos'),
    ('${targetModuleId}', 18, 3, 'Unidade 2.3: O Terreno Neutro — Casos Facultativos, Nomes Próprios e Possessivos'),
    ('${targetModuleId}', 18, 4, 'Unidade 2.4: Mude a Preposição, Mude o Sentido — Regência Verbal I (Assistir, Visar, Aspirar)'),
    ('${targetModuleId}', 18, 5, 'Unidade 2.5: O Fechamento da Regência — Regência Nominal, Verbal II e Cruzamento com Crase');
    `;

    await client.query(sql);
    console.log("✅ Módulo 2 do Nível C1 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
