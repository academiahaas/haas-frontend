const { Client } = require('pg');
const { execSync } = require('child_process');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";
const TABELA_EXERCICIOS = 'tabela_quizzes'; // Altere para o nome real da tabela se não for este

const client = new Client({ connectionString });

async function processarVozGeral() {
    console.log("🚀 Conectando direto ao banco Postgres da Haas Academy...");
    await client.connect();

    try {
        // Busca os dados sem frescura de SDK ou Realtime
        const res = await client.query(`SELECT id, texto FROM ${TABELA_EXERCICIOS}`);
        const exercicios = res.rows;

        if (exercicios.length === 0) {
            console.log("⚠️ Nenhum exercício encontrado.");
            return;
        }

        console.log(`📋 Processando ${exercicios.length} registros em lote de A a Z...`);

        for (let ex of exercicios) {
            const idExercicio = ex.id;
            const textoExercicio = ex.texto;

            if (!textoExercicio) continue;

            const nomeArquivo = `exercicio_${idExercicio}.mp3`;
            console.log(`\n[+] Gerando voz para o ID ${idExercicio}...`);

            try {
                // Escapa aspas simples para não quebrar a string no comando CLI do Python
                const textoTratado = textoExercicio.replace(/'/g, "'\\''");
                
                // Executa o motor em Python que já salvamos e validamos
                execSync(`python3 -c "from motor_voz import gerar_voz_exercicio; gerar_voz_exercicio('${textoTratado}', '${nomeArquivo}')"`);

                const urlAudioFinal = `http://109.123.246.96:8080/${nomeArquivo}`;

                // Update direto via query SQL nativa
                await client.query(
                    `UPDATE ${TABELA_EXERCICIOS} SET audio_url = $1 WHERE id = $2`,
                    [urlAudioFinal, idExercicio]
                );

                console.log(`✓ ID ${idExercicio} atualizado no banco.`);

            } catch (cmdError) {
                console.error(`❌ Falha no processamento do ID ${idExercicio}:`, cmdError.message);
            }
        }

    } catch (err) {
        console.error("❌ Erro crítico na transação do banco:", err.message);
    } finally {
        await client.end();
        console.log("\n==================================================");
        console.log("✨ SUCESSO DE A A Z! BANCO POSTGRES ATUALIZADO.");
        console.log("==================================================");
    }
}

processarVozGeral();
