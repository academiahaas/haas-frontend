const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 1.5: Despedidas Corporativas/Sociais e as Nasais...");
  
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    // Busca a lição correspondente (Semana 1, Lição 5)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 1 AND lesson_number = 5 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 1.5 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    let totalQuestoes = 45; 
    const questoesGeradas = [];
    
    for(let i = 1; i <= totalQuestoes; i++) {
      let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
      let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
      
      let dataObj = {};
      let enunciado = "";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Vocabulário de Despedida e Contraste Fônico do -EM (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que represente la pronunciación correcta de la palabra destacada.";
        if(i % 3 === 0) {
          dataObj = { target_word: "VIAGEM", options: ["ViageiM", "Viagem", "Viahen"] };
          respostaCorreta = "Viagem";
          exp = "La terminación '-EM' forma un diptongo nasal cerrado que suena parecido a 'eiM'. El aire sale por la boca y la nariz al mismo tiempo al cerrar la sílaba.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "GARAGEM", options: ["GarageiM", "Garagem", "Garahen"] };
          respostaCorreta = "Garagem";
          exp = "Evite el sonido de la 'J' raspada del español. La 'G' antes de 'E' o 'I' tiene un sonido suave y continuo, sumado al diptongo nasal final.";
        } else {
          dataObj = { target_word: "AMANHÃ", options: ["Amanhã", "Amanã", "Amanha"] };
          respostaCorreta = "Amanhã";
          exp = "Estrategia de despedida formal ('Até amanhã'). La tilde de la 'Ã' indica una fuerte nasalización central.";
        }
      } 
      // NÍVEL MÉDIO: Pequenos Diálogos de Fechamento com Gramática Oculta (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado corporativo y completa la palabra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Tenha uma boa viagem de volta.", missing_word: "viagem" };
          respostaCorreta = "viagem";
          exp = "Fórmula clásica de cortesía ejecutiva al despedir a un cliente o socio. Foco en la escritura correcta del diptongo nasal.";
        } else {
          dataObj = { sentence: "Até logo, o senhor é muito gentil.", missing_word: "logo" };
          respostaCorreta = "logo";
          exp = "Revisión oculta del Verbo Ser ('o senhor é') integrada en una despedida formal y respetuosa.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Encerramento (Tipo 10)
      else {
        enunciado = "Escucha el diálogo de cierre y practica tu fluidez en el laboratorio fónico.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Muito obrigado por tudo. Tenha uma excelente viagem!" };
          respostaCorreta = "Muito obrigado por tudo. Tenha uma excelente viagem!";
          exp = "Frase corporativa de alto impacto. Une el agradecimiento, la reducción de las vocales finales y el sonido nasal cerrado de 'viagem'.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Eu sou o gerente desta unidade. Até amanhã!" };
          respostaCorreta = "Eu sou o gerente desta unidade. Até amanhã!";
          exp = "Consolidación de las estructuras ocultas del módulo: Verbo Ser ('Eu sou') engranado con una despedida natural.";
        } else {
          dataObj = { speech_text: "Ela se chama Patrícia e vai fazer uma boa viagem." };
          respostaCorreta = "Ela se chama Patrícia e vai fazer uma boa viagem.";
          exp = "Revisão integrada: Verbo Chamar-se ('se chama'), som de chieiro em 'Patrícia' (chi) e o fechamento nasal corporativo.";
        }
      }

      questoesGeradas.push({
        lesson_id: licaoId,
        difficulty: dif,
        question_type: tipo,
        enunciado: enunciado,
        conteudo_pergunta: dataObj,
        resposta_correta: respostaCorreta,
        explanation: exp
      });
    }

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos estruturados para a Unidade 1.5...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [ETAPA CONCLUÍDA] Unidade 1.5 perfeitamente integrada no ecossistema Haas!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 1.5:", err.message);
  } finally {
    await client.end();
  }
}

run();
