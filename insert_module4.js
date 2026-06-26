const { Client } = require('pg');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function cadastrarModulo4() {
    console.log("🚀 Iniciando cadastro do Módulo 4 e suas 15 lições no Supabase...");
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    try {
        // Inserção calibrada do Módulo 4
        const insertModulo = await client.query(
            `INSERT INTO modules (title, level_code, module_number) 
             VALUES ($1, $2, $3) 
             RETURNING id`,
            [
                "Rotina, Gênero e Ação no Presente",
                "A1",
                4
            ]
        );
        
        const uuidModulo4 = insertModulo.rows[0].id;
        console.log(`✅ Módulo 4 criado com o UUID: ${uuidModulo4}`);

        // Matriz das lições oficiais (Lições 46 a 60)
        const licoesM4 = [
            { title: "Vocabulário de Ações Cotidianas e Expressões de Tempo", week: 10, num: 46 },
            { title: "Uso de Verbos Pronominais e Reflexivos de Cuidado Pessoal", week: 10, num: 47 },
            { title: "Hábitos Diários de Saúde, Higiene e Bem-Estar", week: 10, num: 48 },
            { title: "Vocabulário de Hobbies, Esportes e Lazer no Fim de Semana", week: 10, num: 49 },
            { title: "Descrição Completa de uma Rotina com Horários", week: 10, num: 50 },
            
            { title: "Conjugação de Verbos Regulares Terminados em -AR no Presente", week: 11, num: 51 },
            { title: "Conjugação de Verbos Regulares Terminados em -ER no Presente", week: 11, num: 52 },
            { title: "Conjugação de Verbos Regulares Terminados em -IR no Presente", week: 11, num: 53 },
            { title: "Verbos Irregulares de Alta Frequência: Fazer e Querer", week: 11, num: 54 },
            { title: "Verbo Irregular de Potencial e Permissão: Poder", week: 11, num: 55 },
            
            { title: "Regras Gerais da Formação de Gênero (Masculino e Feminino)", week: 12, num: 56 },
            { title: "Exceções de Gênero: Palavras Masculinas Terminadas em A", week: 12, num: 57 },
            { title: "O Pesadelo das Exceções: O Gênero Real de 'O Problema'", week: 12, num: 58 },
            { title: "Exceções de Gênero: Palavras Femininas Terminadas em O", week: 12, num: 59 },
            { title: "O Comportamento das Palavras Terminadas em AGEM", week: 12, num: 60 }
        ];

        // Insere as 15 lições vinculadas ao Módulo 4
        for (const l of licoesM4) {
            await client.query(
                "INSERT INTO lessons (title, module_id, lesson_number, week_number) VALUES ($1, $2, $3, $4)",
                [l.title, uuidModulo4, l.num, l.week]
            );
            console.log(`   👉 Lição ${l.num} (Semana ${l.week}) cadastrada: "${l.title}"`);
        }

        console.log("\n🏆 MÓDULO 4 CONSTRUÍDO COM SUCESSO! FUNDAÇÃO DO NÍVEL A1 ESTÁ 100% CONCLUÍDA!");

    } catch (err) {
        console.error("❌ Erro ao cadastrar o Módulo 4:", err.message);
    } finally {
        await client.end();
    }
}

cadastrarModulo4();
