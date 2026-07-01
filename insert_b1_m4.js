const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID real alocado para o quarto módulo do nível B1
  const targetModuleId = "8371629d-f189-4b67-bfbd-a30fa85053eb"; 

  try {
    // 1. Limpar lições antigas vinculadas a este módulo para garantir carga limpa
    console.log("🗑  Limpando lições antigas do Módulo 4 (B1) na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE module_id = '${targetModuleId}';`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades profissionais e conectores (Semana 12 / Carga B1)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 4 (B1)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 12, 1, 'Unidade 4.1: Minha Rotina Profissional — Tarefas, Prazos e Verbos do Trabalho'),
    ('${targetModuleId}', 12, 2, 'Unidade 4.2: O Desafio do ''Embora'' — Expressando Concessão e Subjuntivo'),
    ('${targetModuleId}', 12, 3, 'Unidade 4.3: Causas e Finalidades — Dominando os Conectores ''Já que'' e ''Para que'''),
    ('${targetModuleId}', 12, 4, 'Unidade 4.4: Contraste e Conclusão — Argumentação Formal com ''Contudo'' e ''Portanto'''),
    ('${targetModuleId}', 12, 5, 'Unidade 4.5: Redação Executiva — Coesão Textual e e-mails Corporativos');
    `;

    await client.query(sql);
    console.log("✅ Módulo 4 do Nível B1 sincronizado e inserido com sucesso!");
    console.log("🏆 CRONOGRAMA COMPLETO (A1, A2, B1) SALVO COM SUCESSO NO SUPABASE!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
