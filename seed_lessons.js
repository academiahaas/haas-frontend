const { Client } = require('pg');

async function run() {
  // Conexão DIRETA ao banco (sem passar pelo pooler travado)
  const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando na porta DIRETA do banco (Bypassing Pooler)...');
    await client.connect();
    
    const moduleId = "d6a07db6-6d79-43a7-91ef-9dee31b597d5";
    console.log(`🚀 Conectado! Inserindo as 15 lições no módulo: ${moduleId}`);

    const query = `
      INSERT INTO lessons (module_id, week_number, lesson_number, title) VALUES
      ($1, 1, 1, 'A Pronúncia do Z e Sons Sibilantes'),
      ($1, 1, 2, 'As Variações Fonéticas da Letra X'),
      ($1, 1, 3, 'A Articulação dos Dígrafos LH e NH'),
      ($1, 1, 4, 'Sons Nasais: Dominando as Terminações ÃO e ÕE'),
      ($1, 1, 5, 'Saudações Formais e Informais no Cotidiano'),
      ($1, 1, 6, 'Fórmulas de Cortesia e Interação Social'),
      ($1, 1, 7, 'Estratégias Naturais para Despedidas'),
      ($1, 2, 8, 'Apresentação Pessoal e Troca de Informações'),
      ($1, 2, 9, 'O Verbo Ser: Nacionalidade e Origem'),
      ($1, 2, 10, 'O Verbo Estar: Estados Temporários e Localização'),
      ($1, 2, 11, 'Uso do Verbo Chamar-se em Contexto'),
      ($1, 2, 12, 'O Gênero dos Substantivos: Regras e Identificação'),
      ($1, 2, 13, 'Divergências de Gênero: Substantivos Heterogenéricos'),
      ($1, 2, 14, 'Palavras Terminadas em AGEM e seu Comportamento'),
      ($1, 2, 15, 'Exceções Essenciais: Palavras Masculinas Terminadas em A')
    `;

    await client.query(query, [moduleId]);
    console.log('✅ SUCESSO ABSOLUTO! Suas 15 lições estão salvas no banco de dados!');

  } catch (err) {
    console.error('❌ Erro durante o insert:', err.message);
  } finally {
    await client.end();
  }
}

run();
