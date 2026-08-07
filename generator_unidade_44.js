const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfwqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 4.4: O Gênero das Coisas — Regras Gerais...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 4, Unidade 4)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 4 AND lesson_number = 4 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 4.4 não encontrada na tabela 'lessons'.");
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

      // NÍVEL FÁCIL: Substantivos Heterogenéricos em -AGEM (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que use correctamente el género de la palabra en portugués.";
        if(i % 3 === 0) {
          dataObj = { target_word: "A VIAGEM", options: ["a viagem", "o viagem", "a viaje"] };
          respostaCorreta = "a viagem";
          exp = "Regla de oro: Las palabras terminadas en '-agem' son siempre femeninas en portugués. Evita la interferencia fatal del español 'el viaje'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "A MENSAGEM", options: ["a mensagem", "o mensagem", "a mensaje"] };
          respostaCorreta = "a mensagem";
          exp = "Género femenino obligatorio para sufijos en '-agem'. El artículo que la acompaña debe ser obligatoriamente 'a'.";
        } else {
          dataObj = { target_word: "A GARAGEM", options: ["a garagem", "o garagem", "la garagem"] };
          respostaCorreta = "a garagem";
          exp = "Palabra heterogenérica. Cambia el género con relación al español. Recuerda escribir con 'M' final.";
        }
      } 
      // NÍVEL MÉDIO: Aplicação e Concordância de Gênero (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente o ditado e complete com o artigo correto para combater o portunhol.";
        if(i % 2 === 0) {
          dataObj = { sentence: "A viagem de negócios foi um sucesso absoluto.", missing_word: "A" };
          respostaCorreta = "A";
          exp = "Concordancia de género aplicada al entorno corporativo. 'A viagem' es la única estructura correcta.";
        } else {
          dataObj = { sentence: "Você recebeu a mensagem do diretor hoje?", missing_word: "a" };
          respostaCorreta = "a";
          exp = "Uso práctico de sustantivos femeninos en contextos laborales. Exige el uso del artículo femenino singular.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Estruturas Completas (Tipo 10)
      else {
        enunciado = "Escucha la descripción y practica tu fluidez evitando los errores de género.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu enviei a mensagem importante para a equipe ontem à noite." };
          respostaCorreta = "Eu enviei a mensagem importante para a equipe ontem à noite.";
          exp = "Frase ejecutiva de alta frecuencia. Exige fluidez en la concordancia femenina de 'a mensagem' y dicción limpia.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "O carro novo do gerente está estacionado na garagem." };
          respostaCorreta = "O carro novo do gerente está estacionado na garagem.";
          exp = "Combina la contracción de lugar femenina 'na' con el sustantivo heterogenérico 'garagem'.";
        } else {
          dataObj = { speech_text: "A nossa viagem para o Brasil está confirmada para a próxima semana." };
          respostaCorreta = "A nossa viagem para o Brasil está confirmada para a próxima semana.";
          exp = "Desafío avanzado de concordancia larga. Todos los elementos satélites se ajustan al género femenino de 'viagem'.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 4.4...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [ALTO ALINHAMENTO] Unidade 4.4 carimbada e pronta para travar o portunhol!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 4.4:", err.message);
  } finally {
    await client.end();
  }
}

run();
