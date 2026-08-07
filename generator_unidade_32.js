const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 3.2: Expressando Gostos e Preferências...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 3, Unidade 2)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 3 AND lesson_number = 2 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 3.2 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa registros anteriores para garantir lote puro de 45 questões
    await client.query(`DELETE FROM questions WHERE lesson_id = $1;`, [licaoId]);

    let totalQuestoes = 45; 
    const questoesGeradas = [];
    
    for(let i = 1; i <= totalQuestoes; i++) {
      let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
      let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
      
      let dataObj = {};
      let enunciado = "";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Estrutura base de Gosto + Preposição (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que complete correctamente la estructura de preferencia.";
        if(i % 3 === 0) {
          dataObj = { target_word: "GOSTO DE", options: ["gosto de", "gosto", "gosto do"] };
          respostaCorreta = "gosto de";
          exp = "Objetivo maestro: El verbo 'gostar' exige obligatoriamente la preposición 'de' antes de verbos o sustantivos generales. Evita omitirla como en el español.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "NÃO GOSTO DE", options: ["não gosto de", "no gosto de", "gosto não de"] };
          respostaCorreta = "não gosto de";
          exp = "Estructura negativa. La negación 'não' se coloca antes del verbo, manteniendo la preposición 'de' intacta.";
        } else {
          dataObj = { target_word: "CAFÉ", options: ["café", "cafe", "tinto"] };
          respostaCorreta = "café";
          exp = "Vocabulario de bebidas. Recuerda marcar el acento abierto en la 'É' para una pronunciación natural.";
        }
      } 
      // NÍVEL MÉDIO: Fixação Gramatical Antitravamento (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la preposición obligatoria.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Eu gosto de comer peixe no almoço.", missing_word: "de" };
          respostaCorreta = "de";
          exp = "Blindaje cognitivo: 'gosto de comer'. La omisión de la preposición delata el portunhol inmediatamente.";
        } else {
          dataObj = { sentence: "Você gosta de tomar suco de laranja?", missing_word: "gosta" };
          respostaCorreta = "gosta";
          exp = "Interacción y pregunta directa sobre gustos en segunda persona (você).";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Preferências Fluídas (Tipo 10)
      else {
        enunciado = "Escucha la declaración de gustos corporativos/sociales y practica en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu gosto de tomar café puro de manhã." };
          respostaCorreta = "Eu gosto de tomar café puro de manhã.";
          exp = "Frase clave de alta frecuencia. Exige conectar 'gosto de' de forma corrida y marcar la nasalización de 'manhã'.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Nós gostamos de almoçar no restaurante do hotel." };
          respostaCorreta = "Nós gostamos de almoçar no restaurante do hotel.";
          exp = "Estructura en primera persona del plural ('Nós gostamos de'). Práctica de la concordancia de equipo en viajes corporativos.";
        } else {
          dataObj = { speech_text: "Eu não gosto de comer carne vermelha no jantar." };
          respostaCorreta = "Eu não gosto de comer carne vermelha no jantar.";
          exp = "Frase completa descriptiva. Foco en la negación, la preposición 'de' y la pronunciación limpia de 'vermelha'.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 3.2...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [CONCLUÍDO COM MAESTRIA] Unidade 3.2 integrada perfeitamente no Supabase!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 3.2:", err.message);
  } finally {
    await client.end();
  }
}

run();
