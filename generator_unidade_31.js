const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 3.1: No Restaurante — Alimentos e Bebidas...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 3, Unidade 1)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 3 AND lesson_number = 1 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 3.1 no encontrada en la tabla 'lessons'. Asegúrate de que exista en el seed.");
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

      // NÍVEL FÁCIL: Vocabulário de alimentos e Fixação Fonética do ÃO (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que complete correctamente el plato o alimento.";
        if(i % 3 === 0) {
          dataObj = { target_word: "FEIJÃO", options: ["feijão", "feijao", "feiján"] };
          respostaCorreta = "feijão";
          exp = "Fuerte sonido nasal del diptongo '-ÃO'. Es un elemento base de la comida brasileña ('arroz com feijão').";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "UM PÃO", options: ["um pão", "un pan", "um pao"] };
          respostaCorreta = "um pão";
          exp = "Combinación de artículo indefinido masculino ('um') terminado en 'M' y el diptongo nasal central '-ÃO'.";
        } else {
          dataObj = { target_word: "MACARRÃO", options: ["macarrão", "macarrao", "fideo"] };
          respostaCorreta = "macarrão";
          exp = "Doble desafío fónico: la 'RR' se raspa fuertemente en la garganta (sonido 'J' del español) y termina con la nasalización de '-ÃO'.";
        }
      } 
      // NÍVEL MÉDIO: Artigos e Diálogos de Sobrevivência no Restaurante (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado en el restaurante y completa la palabra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Por favor, eu quero uma água sem gás.", missing_word: "uma" };
          respostaCorreta = "uma";
          exp = "Uso de artículo indefinido femenino ('uma'). Frase esencial de supervivencia al pedir bebidas.";
        } else {
          dataObj = { sentence: "Garçom, pode trazer a conta, por favor?", missing_word: "conta" };
          respostaCorreta = "conta";
          exp = "Interacción real en el restaurante. Expresión educada y pulida para solicitar el cierre del servicio.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Pedidos Completos (Tipo 10)
      else {
        enunciado = "Escucha la interacción en el restaurante y practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu quero um prato de arroz com feijão e carne." };
          respostaCorreta = "Eu quero um prato de arroz com feijão e carne.";
          exp = "Frase de alta demanda para el restaurante. Exige una pronunciación limpia en los artículos y la fuerza nasal de 'feijão'.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Com licença, você pode me trazer o cardápio?" };
          respostaCorreta = "Com licença, você pode me trazer o cardápio?";
          exp = "Interacción ejecutiva y social muy educada. Práctica de la cortesía combinada con el vocabulario del lugar.";
        } else {
          dataObj = { speech_text: "Eu vou comer um macarrão gostoso e tomar um suco." };
          respostaCorreta = "Eu vou comer um macarrão gostoso e tomar um suco.";
          exp = "Frase fluida que une el laberinto de la 'RR', el sonido nasal del '-ÃO' y la reducción de la 'O' final en 'suco' (sucuh).";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 3.1...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [SUCESSO COMPLETO] Unidade 3.1 configurada e salva com perfeição!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 3.1:", err.message);
  } finally {
    await client.end();
  }
}

run();
