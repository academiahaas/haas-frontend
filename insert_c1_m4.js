const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID do módulo alocado para o polimento final (C1)
  const targetModuleId = "c1e509ab-4be8-49ee-b62f-a4678af3c60a"; 

  try {
    // Como estamos gerenciando semanas incrementais (Semana 20), limpamos apenas os registros da semana 20
    console.log("🗑️  Limpando lições antigas da Semana 20 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE week_number = 20;`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades de polimento final (Semana 20 / Carga C1 - 4h por lição)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 4 (C1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 20, 1, 'Unidade 4.1: Anatomia do Editorial — Ensaios, Teses Implícitas e Interpretação de Alta Densidade'),
    ('${targetModuleId}', 20, 2, 'Unidade 4.2: Caça aos Microerros — Fônica, Metafonia e Ajuste de Ritmo Silábico'),
    ('${targetModuleId}', 20, 3, 'Unidade 4.3: O Desafio da Inversão — Concordância Nominal e Verbal em Estruturas Invertidas'),
    ('${targetModuleId}', 4.4, 4, 'Unidade 4.4: Coletivos e Partitivos — Expressões Partitivas e Nuances da Norma-Padrão'),
    ('${targetModuleId}', 20, 5, 'Unidade 4.5: A Obra-Prima — Alta Argumentação, Coesão e Produção Estilística');
    `;

    await client.query(sql);
    console.log("✅ Módulo 4 do Nível C1 sincronizado e inserido com sucesso!");
    console.log("🏆 MATRIZ PEDAGÓGICA INTEGRAL (A1, A2, B1, B2, C1) IMPLANTADA COM SUCESSO!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
