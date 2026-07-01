const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID alocado para o quarto módulo do nível A1
  const targetModuleId = "8371629d-f189-4b67-bfbd-a30fa85053eb"; 

  try {
    console.log("🗑️  Limpando lições da Semana 4 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}' AND week_number = 4;`);
    console.log("✅ Espaço limpo!");

    console.log("🚀 Injetando as 5 Unidades Oficiais do Módulo 4 (A1)...");
    
    const sql = `
    INSERT INTO lessons (module_id, week_number, lesson_number, title) VALUES 
    ('${targetModuleId}', 4, 1, 'Unidade 4.1: Meu Dia a Dia — Verbos Regulares no Presente (-AR, -ER, -IR)'),
    ('${targetModuleId}', 4, 2, 'Unidade 4.2: Cuidado Pessoal — Hábitos e o Uso Prático de Verbos Pronominais'),
    ('${targetModuleId}', 4, 3, 'Unidade 4.3: O que Eu Faço no Lazer? — Verbos Irregulares de Ação (Fazer, Poder, Querer)'),
    ('${targetModuleId}', 4, 4, 'Unidade 4.4: O Gênero das Coisas — Regras Gerais e as Palavras em -AGEM (A Viagem)'),
    ('${targetModuleId}', 4, 5, 'Unidade 4.5: Blindagem de Exceções — O Grande Desafio (O Problema, O Dia, A Mão)');
    `;

    await client.query(sql);
    console.log("✅ Módulo 4 atualizado com sucesso no Supabase!");
    console.log("🏆 MATRIZ COMPLETA DO NÍVEL A1 (900 QUESTÕES EM POTENCIAL) ASSENTADA COM SUCESSO!");

  } catch (err) {
    console.error('❌ Erro durante a atualização:', err.message);
  } finally {
    await client.end();
  }
}
run();
