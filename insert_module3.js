const { Client } = require('pg');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function cadastrarModulo3() {
    console.log("🚀 Iniciando cadastro do Módulo 3 e suas 15 lições no Supabase...");
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    try {
        // Inserção calibrada do Módulo 3
        const insertModulo = await client.query(
            `INSERT INTO modules (title, level_code, module_number) 
             VALUES ($1, $2, $3) 
             RETURNING id`,
            [
                "Sobrevivência Urbana, Alimentação e Preferências",
                "A1",
                3
            ]
        );
        
        const uuidModulo3 = insertModulo.rows[0].id;
        console.log(`✅ Módulo 3 criado com o UUID: ${uuidModulo3}`);

        // Matriz das lições oficiais (Lições 31 a 45)
        const licoesM3 = [
            { title: "Vocabulário de Lugares Comuns da Cidade", week: 7, num: 31 },
            { title: "Meios de Transporte Coletivos e Individuais no Dia a Dia", week: 7, num: 32 },
            { title: "O Verbo Ir no Presente do Indicativo para Movimento", week: 7, num: 33 },
            { title: "Como Descrever Rotas e Deslocamentos Simples", week: 7, num: 34 },
            { title: "Pequenas Frases com a Estrutura: Verbo Ir + Preposição", week: 7, num: 35 },
            
            { title: "Uso Prático da Preposição Essencial EM (Localização)", week: 8, num: 36 },
            { title: "Uso Prático da Preposição Essencial DE (Origem e Posse)", week: 8, num: 37 },
            { title: "As Contrações de Localização: No, Na, Nos, Nas", week: 8, num: 38 },
            { title: "As Contrações de Origem e Posse: Do, Da, Dos, Das", week: 8, num: 39 },
            { title: "Combinação de Localização e Conteúdo em Frases Reais", week: 8, num: 40 },
            
            { title: "Identificação e Nomeação de Alimentos em Português", week: 9, num: 41 },
            { title: "Identificação e Nomeação de Bebidas no Cotidiano", week: 9, num: 42 },
            { title: "Simulação e Diálogos em Situações de Restaurante", week: 9, num: 43 },
            { title: "A Estrutura de Preferência Afirmativa: 'Eu gosto de...'", week: 9, num: 44 },
            { title: "A Estrutura de Preferência Negativa: 'Eu não gosto de...'", week: 9, num: 45 }
        ];

        // Insere as 15 lições vinculadas ao Módulo 3
        for (const l of licoesM3) {
            await client.query(
                "INSERT INTO lessons (title, module_id, lesson_number, week_number) VALUES ($1, $2, $3, $4)",
                [l.title, uuidModulo3, l.num, l.week]
            );
            console.log(`   👉 Lição ${l.num} (Semana ${l.week}) cadastrada: "${l.title}"`);
        }

        console.log("\n🏆 MÓDULO 3 INTEGRALMENTE CONSTRUÍDO E SALVO NO SEU BANCO DE DADOS!");

    } catch (err) {
        console.error("❌ Erro ao cadastrar o Módulo 3:", err.message);
    } finally {
        await client.end();
    }
}

cadastrarModulo3();
