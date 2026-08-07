const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // ID do módulo alocado para a progressão avançada (B2)
  const targetModuleId = "8371629d-f189-4b67-bfbd-a30fa85053eb"; 

  try {
    // Garantindo a integridade limpando apenas os dados velhos da Semana 14
    console.log("🗑️  Limpando lições antigas da Semana 14 na tabela 'lessons'...");
    await client.query(`DELETE FROM lessons WHERE week_number = 14;`);
    console.log("✅ Conteúdo antigo removido!");

    // 2. Inserir a estrutura das 5 unidades de argumentação avançada (Semana 14 / Carga B2)
    console.log("🚀 Subindo as 5 Unidades estruturais do Módulo 2 (B2)...");
    
    const sql = `
    INSERT INTO lessons (
        module_id,
        week_number,
        lesson_number,
        title
    ) VALUES 
    ('${targetModuleId}', 14, 1, 'Unidade 2.1: Na Mira da Mídia — Notícias, Atualidades e Expressões Abstratas de Opinião'),
    ('${targetModuleId}', 14, 2, 'Unidade 2.2: O Jogo do Contraste Avançado — Dominando Conectores além do ''Mas'''),
    ('${targetModuleId}', 14, 3, 'Unidade 2.3: Cedendo Terreno com Elegância — Concessão Avançada com Modo Subjuntivo'),
    ('${targetModuleId}', 14, 4, 'Unidade 2.4: Ética e Cidadania — Conectores de Conclusão e Amarração Lógica'),
    ('${targetModuleId}', 14, 5, 'Unidade 2.5: A Arena do Debate — Defesa de Pontos de Vista e Coesão Argumentativa');
    `;

    await client.query(sql);
    console.log("✅ Módulo 2 do Nível B2 sincronizado e inserido com sucesso!");

  } catch (err) {
    console.error('❌ Erro durante a inserção:', err.message);
  } finally {
    await client.end();
  }
}
run();
