const { GoogleGenAI, Type } = require('@google/genai');
const { Client } = require('pg');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

const strictSchema = {
    type: Type.OBJECT,
    properties: {
        exercicio_tipo_1: {
            type: Type.OBJECT,
            description: "Exercício de Análisis de Contexto. Focado em tomadas de decisão de engenharia.",
            properties: {
                enunciado: { type: Type.STRING, description: "Instrução fixa: 'ANÁLISIS DE CONTEXTO'" },
                conteudo_pergunta: { type: Type.STRING, description: "Cenário/Problema técnico. Máximo 80 caracteres." },
                resposta_correta: { type: Type.STRING, description: "Opção correta. Máximo 70 caracteres." },
                opcoes_falsas: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING }, 
                    description: "Exatamente 3 opções falsas baseadas em portunhol/erros. Máximo 70 caracteres cada." 
                },
                dica_ia: { type: Type.STRING, description: "Dica linguística curta. Máximo 100 caracteres." }
            },
            required: ["enunciado", "conteudo_pergunta", "resposta_correta", "opcoes_falsas", "dica_ia"]
        },
        exercicio_tipo_4: {
            type: Type.OBJECT,
            description: "Exercício de Dictado Práctico / Fijación Acústica.",
            properties: {
                enunciado: { type: Type.STRING, description: "Instrução fixa: 'DICTADO PRÁCTICO'" },
                conteudo_pergunta: { type: Type.STRING, description: "Frase técnica em português com uma lacuna usando ___. Máximo 80 caracteres." },
                resposta_correta: { type: Type.STRING, description: "A palavra exata que preenche a lacuna. Máximo 15 caracteres." },
                dica_ia: { type: Type.STRING, description: "Explicação fonética curta do som da palavra. Máximo 100 caracteres." }
            },
            required: ["enunciado", "conteudo_pergunta", "resposta_correta", "dica_ia"]
        }
    },
    required: ["exercicio_tipo_1", "exercicio_tipo_4"]
};

async function run() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    try {
        const resLicao = await client.query("SELECT id, title FROM lessons ORDER BY id ASC LIMIT 1");
        if (resLicao.rows.length === 0) return;
        const licao = resLicao.rows[0];

        console.log(`🤖 Gerando amostra controlada para a Lição: "${licao.title}"...`);

        const prompt = `Você é um professor de português para engenheiros de software hispanofalantes.
        Gere 2 exercícios específicos baseados no tema da lição: "${licao.title}".
        
        REGRAS CRÍTICAS DE CARACTERES:
        - No exercicio_tipo_1, o campo conteudo_pergunta NÃO PODE passar de 80 caracteres. Cada opção de resposta NÃO PODE passar de 70 caracteres.
        - No exercicio_tipo_4, a frase deve conter uma lacuna '___'. A resposta_correta deve ser apenas a palavra que falta (máximo 15 caracteres).
        Evite textos longos para não quebrar o layout mobile.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: strictSchema,
            },
        });

        const data = JSON.parse(response.text);
        
        const ex1 = data.exercicio_tipo_1;
        // Mudado de tipo_questao para question_type e passado opcoes_falsas como JSON stringificado para o campo jsonb
        await client.query(
            `INSERT INTO questions (lesson_id, question_type, enunciado, conteudo_pergunta, resposta_correta, opcoes_falsas, dica_ia) 
             VALUES ($1, '1', $2, $3, $4, $5, $6)`,
            [licao.id, ex1.enunciado, ex1.conteudo_pergunta, ex1.resposta_correta, JSON.stringify(ex1.opcoes_falsas), ex1.dica_ia]
        );
        console.log("✅ Exercício Tipo 1 (Análisis de Contexto) salvo com sucesso!");

        const ex4 = data.exercicio_tipo_4;
        await client.query(
            `INSERT INTO questions (lesson_id, question_type, enunciado, conteudo_pergunta, resposta_correta, opcoes_falsas, dica_ia) 
             VALUES ($1, '4', $2, $3, $4, $5, $6)`,
            [licao.id, ex4.enunciado, ex4.conteudo_pergunta, ex4.resposta_correta, JSON.stringify([]), ex4.dica_ia]
        );
        console.log("✅ Exercício Tipo 4 (Dictado Práctico) salvo com sucesso!");

        console.log("\n🎯 TESTE CONCLUÍDO! Verifique os tamanhos no seu banco.");

    } catch (err) {
        console.error("❌ Erro:", err.message);
    } finally {
        await client.end();
    }
}
run();
