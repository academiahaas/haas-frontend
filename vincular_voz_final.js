const { Client } = require('pg');
const { execSync } = require('child_process');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";
const client = new Client({ connectionString });

async function executarIntegracao() {
    console.log("🚀 Conectando ao banco da Haas Academy...");
    await client.connect();

    try {
        // 1. Garante que a coluna audio_url existe na tabela_quizzes
        console.log("🔧 Verificando/Criando coluna 'audio_url'...");
        await client.query(`ALTER TABLE tabela_quizzes ADD COLUMN IF NOT EXISTS audio_url TEXT;`);

        // 2. Busca todas as perguntas reais
        const res = await client.query(`SELECT id, enunciado FROM tabela_quizzes ORDER BY id ASC;`);
        const exercicios = res.rows;

        if (exercicios.length === 0) {
            console.log("⚠️ Nenhum exercício encontrado para processar.");
            return;
        }

        console.log(`📋 Encontrados ${exercicios.length} exercícios. Gerando áudios em lote...`);

        for (let ex of exercicios) {
            const idExercicio = ex.id;
            const textoEnunciado = ex.enunciado;

            if (!textoEnunciado) continue;

            const nomeArquivo = `exercicio_${idExercicio}.mp3`;
            console.log(`\n[+] Processando ID ${idExercicio}...`);

            try {
                // Trata aspas simples para o CLI do Python
                const textoTratado = textoEnunciado.replace(/'/g, "'\\''");
                
                // Executa o gerador ElevenLabs em Python
                execSync(`python3 -c "from motor_voz import gerar_voz_exercicio; gerar_voz_exercicio('${textoTratado}', '${nomeArquivo}')"`);

                const urlAudioFinal = `http://109.123.246.96:8080/${nomeArquivo}`;

                // 3. Grava o link permanente no Supabase
                await client.query(
                    `UPDATE tabela_quizzes SET audio_url = $1 WHERE id = $2`,
                    [urlAudioFinal, idExercicio]
                );

                console.log(`   ✓ Banco atualizado para o ID ${idExercicio}.`);

            } catch (cmdError) {
                console.error(`   ❌ Falha ao processar o ID ${idExercicio}`);
            }
        }

    } catch (err) {
        console.error("❌ Erro crítico na execução:", err.message);
    } finally {
        await client.end();
        console.log("\n==================================================");
        console.log("✨ SUCESSO ABSOLUTO! TODOS OS EXERCÍCIOS ESTÃO COM VOZ.");
        console.log("==================================================");
    }
}

executarIntegracao();
