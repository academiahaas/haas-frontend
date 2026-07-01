const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// 1. Instancia as credenciais extraídas do seu ambiente produtivo
const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const TABELA_EXERCICIOS = 'tabela_quizzes'; // Altere para 'questions' se as perguntas de A a Z estiverem lá

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function processarVozGeral() {
    console.log("🚀 Iniciando varredura de A a Z no Supabase...");
    
    // Busca id e o texto da pergunta (ajuste os nomes das colunas se necessário, ex: enunciado, pergunta)
    const { data: exercicios, error } = await supabase
        .from(TABELA_EXERCICIOS)
        .select('id, texto');

    if (error) {
        console.error("❌ Erro ao ler dados do Supabase:", error.message);
        return;
    }

    if (!exercicios || exercicios.length === 0) {
        console.log("⚠️ Nenhum exercício pendente ou encontrado.");
        return;
    }

    console.log(`📋 Encontrados ${exercicios.length} registros. Processando arquivos de áudio...`);

    for (let ex of exercicios) {
        const idExercicio = ex.id;
        const textoExercicio = ex.texto;
        
        if (!textoExercicio) continue;

        const nomeArquivo = `exercicio_${idExercicio}.mp3`;
        console.log(`\n[+] Gerando áudio para o ID ${idExercicio}...`);

        try {
            // Chama o motor de voz em Python que já salvamos e testamos no seu servidor
            // Passa o texto e o nome do arquivo dinamicamente via CLI
            execSync(`python3 -c "from motor_voz import gerar_voz_exercicio; gerar_voz_exercicio('''${textoExercicio.replace(/"/g, '\\"')}''', '${nomeArquivo}')"`);
            
            const urlAudioFinal = `http://109.123.246.96:8080/${nomeArquivo}`;

            // Atualiza a coluna de áudio correspondente no Supabase
            const { error: updateError } = await supabase
                .from(TABELA_EXERCICIOS)
                .update({ audio_url: urlAudioFinal }) // Ajuste se a coluna se chamar 'url_audio', 'audio', etc.
                .eq('id', idExercicio);

            if (updateError) {
                console.error(`⚠️ Erro ao atualizar o ID ${idExercicio} no banco:`, updateError.message);
            } else {
                console.log(`✓ ID ${idExercicio} atualizado com sucesso no Supabase!`);
            }

        } catch (cmdError) {
            console.error(`❌ Falha crítica no processamento do ID ${idExercicio}`);
        }
    }

    console.log("\n==================================================");
    console.log("✨ PROCESSO CONCLUÍDO! INTEGRADO NO SUPABASE COM A SUA VOZ.");
    console.log("==================================================");
}

processarVozGeral();
