const { Client } = require('pg');

// Voltando para a URL clássica que funcionou em todas as unidades anteriores
const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR - ROTA TRADICIONAL] Forçando gravação da Unidade 2.2...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca a lição correspondente (Semana 2, Lição 2)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 2 AND lesson_number = 2 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 2.2 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa registros anteriores
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

      if(tipo === 3) {
        enunciado = "Selecciona la opción que complete correctamente la descripción de la vivienda.";
        if(i % 3 === 0) {
          dataObj = { target_word: "MINHA COZINHA", options: ["minha cozinha", "mi cozinha", "minha cocina"] };
          respostaCorreta = "minha cozinha";
          exp = "Estructura de posesivo femenino: Usamos 'minha' antes del sustantivo. Evite la interferencia del español 'mi'. El grupo 'NH' suena como la 'ñ'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "BANHEIRO", options: ["banheiro", "bañero", "banheiroh"] };
          respostaCorreta = "banheiro";
          exp = "Vocabulario esencial. Recuerde la reducción de la 'O' final a 'U' al hablar y el correcto sonido nasal del grupo 'NH'.";
        } else {
          dataObj = { target_word: "MEU QUARTO", options: ["meu quarto", "mi quarto", "mêu quarto"] };
          respostaCorreta = "meu quarto";
          exp = "Estructura de posesivo masculino: Usamos 'meu'. La palabra 'quarto' se escribe con 'Q' y mantiene un sonido limpio.";
        }
      } 
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la estructura de localización.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Onde está o banheiro principal?", missing_word: "Onde" };
          respostaCorreta = "Onde";
          exp = "Entrenamiento intensivo de la estructura clave 'Onde está...'. Recuerde que 'Onde' reduce fónicamente la 'e' final en 'Ondi'.";
        } else {
          dataObj = { sentence: "Minha casa tem um jardim muito grande.", missing_word: "jardim" };
          respostaCorreta = "jardim";
          exp = "Vocabulario de la morada. Foco en la terminación nasal de 'jardim' y la pronunciación suave de la 'J' portuguesa.";
        }
      } 
      else {
        enunciado = "Escucha la descripción de la vivienda y practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu prefiro morar em um apartamento pequeno." };
          respostaCorreta = "Eu prefiro morar em um apartamento pequeno.";
          exp = "Frase descriptiva fluida y natural. Práctica del vocabulario inmobiliario de forma elegante.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Onde está a chave da minha sala de estar?" };
          respostaCorreta = "Onde está a chave da minha sala de estar?";
          exp = "Excelente combinación: une la estructura de localización, el sonido soplado de 'chave' (sh) y el posesivo 'minha'.";
        } else {
          dataObj = { speech_text: "Minha cozinha é grande e muito moderna." };
          respostaCorreta = "Minha cozinha é grande e muito moderna.";
          exp = "Práctica de la descripción formal de los espacios con entonación limpia en los adjetivos.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 2.2...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [CONCLUÍDO] Unidade 2.2 salva e integrada com sucesso!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 2.2:", err.message);
  } finally {
    await client.end();
  }
}

run();
