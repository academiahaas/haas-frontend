const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  const targetModuleId = "8371629d-f189-4b67-bfbd-a30fa85053eb"; 

  try {
    // 1. Limpar apenas a Semana 16 para colocar o desdobramento real
    console.log("🗑️  Limpando títulos genéricos da Semana 16 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE week_number = 16;`);
    console.log("✅ Espaço limpo!");

    // 2. Inserir o Módulo 4 real e detalhado
    console.log("🚀 Injetando as 5 Unidades oficiais do Módulo 4 (B2)...");
    
    const sql = `
    INSERT INTO lessons (module_id, week_number, lesson_number, title) VALUES 
    ('${targetModuleId}', 16, 1, 'Unidade 4.1: O Ritmo da Ação — Início, Conclusão Imediata e o Fim do ''Recién'''),
    ('${targetModuleId}', 16, 2, 'Unidade 4.2: Resistência e Hábito — Locuções de Continuidade e Ruptura de Processos'),
    ('${targetModuleId}', 16, 3, 'Unidade 4.3: O Planeta em Pauta — Sustentabilidade, Ciência e Sinônimos Avançados'),
    ('${targetModuleId}', 16, 4, 'Unidade 4.4: Comportamento Humano — Mudanças Sociais e Estilos de Vida Digitais'),
    ('${targetModuleId}', 16, 5, 'Unidade 4.5: O Selo da Autonomia B2 — Consolidação e Leitura de Artigos Científicos');
    `;

    await client.query(sql);
    console.log("✅ Módulo 4 (B2) atualizado com a estrutura real com sucesso!");
    console.log("🏆 AGORA SIM: NÍVEL B2 COMPLETAMENTE BLINDADO!");

  } catch (err) {
    console.error('❌ Erro durante a atualização:', err.message);
  } finally {
    await client.end();
  }
}
run();
