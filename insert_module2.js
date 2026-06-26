const { Client } = require('pg');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

// URL Corrigida com 'fhq' para bater direto com o seu Supabase real
const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function cadastrarModulo2() {
    console.log("🚀 Iniciando cadastro do Módulo 2 e suas 15 lições no Supabase...");
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    try {
        const insertModulo = await client.query(
            `INSERT INTO modules (title, level_code, module_number) 
             VALUES ($1, $2, $3) 
             RETURNING id`,
            [
                "O Espaço, a Posse e a Relação Familiar",
                "A1",
                2
            ]
        );
        
        const uuidModulo2 = insertModulo.rows[0].id;
        console.log(`✅ Módulo 2 criado com o UUID: ${uuidModulo2}`);

        const licoesM2 = [
            { title: "Vocabulário de Membros da Família de Alta Frequência", week: 4, num: 16 },
            { title: "Relações Pessoais e Graus de Parentesco no Cotidiano", week: 4, num: 17 },
            { title: "O Verbo Ter para Expressar Posse e Idade", week: 4, num: 18 },
            { title: "Introdução aos Pronomes Possessivos Simples (Meu e Minha)", week: 4, num: 19 },
            { title: "Uso dos Pronomes Possessivos Expandidos (Seu e Sua)", week: 4, num: 20 },
            
            { title: "Vocabulário das Partes da Casa: Sala e Cozinha", week: 5, num: 21 },
            { title: "Vocabulário das Partes da Casa: Quarto, Banheiro e Jardim", week: 5, num: 22 },
            { title: "Como Descrever a Própria Moradia e Características", week: 5, num: 23 },
            { title: "O Verbo Estar para Localização no Espaço", week: 5, num: 24 },
            { title: "Perguntas Estruturais de Localização: 'Onde está?'", week: 5, num: 25 },
            
            { title: "Objetos Comuns da Sala de Estar e Itens Pessoais", week: 6, num: 26 },
            { title: "Identificação e Nomeação das Cores no Dia a Dia", week: 6, num: 27 },
            { title: "Domínio dos Números Cardinais de 1 a 50", week: 6, num: 28 },
            { title: "Domínio dos Números Cardinais de 51 a 100", week: 6, num: 29 },
            { title: "Descrição de Roupas e Objetos com Cor e Quantidade", week: 6, num: 30 }
        ];

        for (const l of licoesM2) {
            await client.query(
                "INSERT INTO lessons (title, module_id, lesson_number, week_number) VALUES ($1, $2, $3, $4)",
                [l.title, uuidModulo2, l.num, l.week]
            );
            console.log(`   👉 Lição ${l.num} (Semana ${l.week}) cadastrada: "${l.title}"`);
        }

        console.log("\n🏆 MÓDULO 2 INTEGRALMENTE CONSTRUÍDO E SALVO NO SEU BANCO DE DADOS!");

    } catch (err) {
        console.error("❌ Erro ao cadastrar o Módulo 2:", err.message);
    } finally {
        await client.end();
    }
}

cadastrarModulo2();
