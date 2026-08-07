const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  const targetModuleId = "8371629d-f189-4b67-bfbd-a30fa85053eb"; 

  try {
    // 1. Limpar lições antigas das semanas 15 e 16
    console.log("🗑️  Limpando lições antigas das Semanas 15 e 16 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE week_number IN (15, 16);`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir Bloco do Módulo 3 (Semana 15) e Módulo 4 (Semana 16)
    console.log("🚀 Subindo as Unidades estruturais dos Módulos 3 e 4 (B2)...");
    
    const sql = `
    INSERT INTO lessons (module_id, week_number, lesson_number, title) VALUES 
    ('${targetModuleId}', 15, 1, 'Unidade 3.1: ''Ele me disse que...'' — Discurso Indireto no Presente'),
    ('${targetModuleId}', 15, 2, 'Unidade 3.2: Relatando o Passado — Tempos Verbais em Cascata'),
    ('${targetModuleId}', 15, 3, 'Unidade 3.3: O Foco na Ação — Voz Passiva Analítica e Particípio'),
    ('${targetModuleId}', 15, 4, 'Unidade 3.4: O Registro Formal — Voz Passiva Sintética com Pronome SE'),
    ('${targetModuleId}', 15, 5, 'Unidade 3.5: Gêneros Textuais — Crônicas, Notícias e Discurso Livre'),
    
    ('${targetModuleId}', 16, 1, 'Unidade 4.1: Sociedade e Comportamento — Locuções de Alta Performance'),
    ('${targetModuleId}', 16, 2, 'Unidade 4.2: Avanço e Ciência — Vocabulário Técnico e Argumentação Crítica'),
    ('${targetModuleId}', 16, 3, 'Unidade 4.3: Fluidez Estendida — Gerenciamento de Orações Complexas'),
    ('${targetModuleId}', 16, 4, 'Unidade 4.4: Interpretação de Textos Longos — Ensaios e Artigos Nativos'),
    ('${targetModuleId}', 16, 5, 'Unidade 4.5: Consolidação Final Avançada — O Domínio Pleno do Nível B2');
    `;

    await client.query(sql);
    console.log("✅ Módulos 3 e 4 do Nível B2 sincronizados e inseridos com sucesso!");
    console.log("🏆 JORNADA COMPLETA DE LIÇÕES CONCLUÍDA NA BASE DE DADOS!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
