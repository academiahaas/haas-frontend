const { GoogleGenAI, Type } = require('@google/genai');
const { Client } = require('pg');

// 1. Inicializa a IA do Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 2. String de conexão direta que funcionou
const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

// Schema de validação do JSON que o Gemini VAI seguir estritamente
const questionSchema = {
    type: Type.ARRAY,
    description: "Lista de exatamente 10 questões gamificadas para hispanofalantes.",
    items: {
        type: Type.OBJECT,
        properties: {
            tipo_questao: { 
                type: Type.STRING, 
                enum: ["traducao", "multipla_escolha", "audio_ditado", "completar_lacuna"]
            },
            enunciado: { type: Type.STRING },
            conteudo_pergunta: { type: Type.STRING },
            resposta_correta: { type: Type.STRING },
            opcoes_falsas: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3 opções incorretas baseadas em vícios de portunhol. Vazio se for tradução pura."
            },
            dica_ia: { type: Type.STRING }
        },
        required: ["tipo_questao", "enunciado", "conteudo_pergunta", "resposta_correta", "opcoes_falsas", "dica_ia"]
    }
};

async function gerarQuestoesEmLote() {
    console.log("🚀 Iniciando motor de geração de conteúdo com o Gemini...");
    
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    try {
        // Busca todas as lições inseridas
        const resLicoes = await client.query("SELECT id, title FROM lessons");
        const licoes = resLicoes.rows;
        
        console.log(`📚 Encontradas ${licoes.length} lições no banco. Processando uma por uma...`);

        for (const licao of licoes) {
            // Verifica se a lição já tem perguntas salvas
            const resCheck = await client.query("SELECT COUNT(*) FROM questions WHERE lesson_id = $1", [licao.id]);
            const count = parseInt(resCheck.rows[0].count);

            if (count > 0) {
                console.log(`skip -> Lição "${licao.title}" já possui questões.`);
                continue;
            }

            console.log(`🤖 IA gerando 10 questões para: "${licao.title}"`);

            const prompt = `Você é um professor nativo de português brasileiro especializado em linguística comparada e gamificação para adultos hispanofalantes.
            Gere exatamente 10 questões de fixação gamificadas para a lição intitulada: "${licao.title}".
            Ataque erros clássicos de portunhol e misture os tipos de perguntas (tradução, múltipla escolha com distratores inteligentes, áudio/ditado e preenchimento de lacunas).
            Adicione uma dica de IA curta e explicativa no campo "dica_ia" desmistificando o erro linguístico comum de portunhol.`;

            // Chamada oficial da SDK do Gemini estruturando a resposta em JSON válido
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: questionSchema,
                },
            });

            const questoes = JSON.parse(response.text);

            // Insere as 10 perguntas geradas no banco de uma vez só
            for (const q of questoes) {
                await client.query(
                    `INSERT INTO questions (lesson_id, tipo_questao, enunciado, conteudo_pergunta, resposta_correta, opcoes_falsas, dica_ia) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [licao.id, q.tipo_questao, q.enunciado, q.conteudo_pergunta, q.resposta_correta, q.opcoes_falsas, q.dica_ia]
                );
            }
            console.log(`✅ Salvas 10 questões para: "${licao.title}"`);
        }

        console.log("🏁 Processo de seed de questões finalizado com sucesso!");

    } catch (error) {
        console.error("❌ Erro no processamento:", error.message);
    } finally {
        await client.end();
    }
}

gerarQuestoesEmLote();
