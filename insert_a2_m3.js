const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real do Módulo 3 (A2) extraído do seu banco
  const targetModuleId = "8371629d-f189-4b67-bfbd-a30fa85053eb"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para evitar duplicidade
    console.log("🗑️  Limpando lições antigas do Módulo 3 (A2) na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura correta com os títulos das 5 unidades (Semana 7)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 3 (A2)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 7, 1, 'Unidade 3.1: Meu Corpo — Partes do Corpo Humano'),
    ('${targetModuleId}', 7, 2, 'Unidade 3.2: O que você tem? — Sintomas e Estados Físicos'),
    ('${targetModuleId}', 7, 3, 'Unidade 3.3: Como você se sente? — Sentimentos e Emoções'),
    ('${targetModuleId}', 7, 4, 'Unidade 3.4: Na Farmácia — Compras e Medicamentos Básicos'),
    ('${targetModuleId}', 7, 5, 'Unidade 3.5: No Consultório — Conversando com o Médico e Atendimento');
    `;

    await client.query(sql);
    console.log("✅ Módulo 3 do Nível A2 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
