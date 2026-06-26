const { Client } = require('pg');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function atualizarTabelaLicoes() {
    console.log("Connecting to Supabase to reset and populate Módulo 1...");
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    try {
        // 1. Limpa as lições antigas com segurança
        await client.query("TRUNCATE TABLE lessons RESTART IDENTITY CASCADE");
        console.log("🧹 Tabela de lições resetada com sucesso!");

        // 2. Busca o UUID real do primeiro módulo
        const resModulo = await client.query("SELECT id FROM modules ORDER BY id ASC LIMIT 1");
        
        if (resModulo.rows.length === 0) {
            throw new Error("Nenhum módulo encontrado na tabela 'modules'.");
        }
        
        const uuidModulo1 = resModulo.rows[0].id;
        console.log(`📦 UUID do Módulo 1 encontrado: ${uuidModulo1}`);

        // 3. Matriz oficial das 15 lições do Módulo 1 (A1) com as semanas amarradas
        const licoesA1 = [
            // SEMANA 1
            { title: "A Articulação dos Dígrafos LH e NH", week: 1 },
            { title: "As Variações Fonéticas da Letra X", week: 1 },
            { title: "A Pronúncia do Z e Sons Sibilantes", week: 1 },
            { title: "Sons Nasais: Dominando as Terminações ÃO e ÕE", week: 1 },
            { title: "Saudações Formais e Informais no Cotidiano", week: 1 },
            
            // SEMANA 2
            { title: "Apresentação Pessoal e Troca de Informações Básicas", week: 2 },
            { title: "Estratégias Naturais para Despedidas", week: 2 },
            { title: "Fórmulas de Cortesia e Interação Social", week: 2 },
            { title: "Uso do Verbo Chamar-se em Contexto", week: 2 },
            { title: "O Verbo Ser: Nacionalidade e Origem", week: 2 },
            
            // SEMANA 3
            { title: "O Verbo Estar: Estados Temporários e Localização", week: 3 },
            { title: "O Gênero dos Substantivos: Regras e Identificação", week: 3 },
            { title: "Divergências de Gênero: Substantivos Heterogenéricos", week: 3 },
            { title: "Exceções Essenciais: Palavras Masculinas Terminadas em A", week: 3 },
            { title: "Palavras Terminadas em AGEM e seu Comportamento", week: 3 }
        ];

        // 4. Insere vinculando ao UUID e à semana correta
        for (let i = 0; i < licoesA1.length; i++) {
            const l = licoesA1[i];
            await client.query(
                "INSERT INTO lessons (title, module_id, lesson_number, week_number) VALUES ($1, $2, $3, $4)",
                [l.title, uuidModulo1, (i + 1), l.week]
            );
            console.log(`✅ Lição ${i + 1} (Semana {l.week}) cadastrada: "${l.title}"`);
        }

        console.log("\n🚀 MATRIZ DE LIÇÕES DO MÓDULO 1 TOTALMENTE ATUALIZADA E PRONTA NO BANCO!");

    } catch (err) {
        console.error("❌ Erro ao atualizar as lições:", err.message);
    } finally {
        await client.end();
    }
}

atualizarTabelaLicoes();
