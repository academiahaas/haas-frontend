const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 3.5: De Onde Venho e Para Onde Vou (Do, Da + Verbo Ir)...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 3, Unidade 5)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 3 AND lesson_number = 5 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 3.5 não encontrada na tabela 'lessons'.");
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

      // NÍVEL FÁCIL: Contrações de origem e movimento básico (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que represente el uso correcto de las contracciones de origen o destino.";
        if(i % 3 === 0) {
          dataObj = { target_word: "DO ESCRITÓRIO", options: ["do escritório", "de el escritório", "de escritório"] };
          respostaCorreta = "do escritório";
          exp = "Contracción obligatoria de origen (Preposición DE + artículo O = DO). Evita la separación literal del español 'de el'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "AO BANCO", options: ["ao banco", "a o banco", "al banco"] };
          respostaCorreta = "ao banco";
          exp = "Movimiento y destino: El verbo 'ir' exige la preposición 'a', que se une al artículo 'o' formando 'ao'. Rompe la interferencia del español 'al'.";
        } else {
          dataObj = { target_word: "VENHO DA", options: ["venho da", "vengo de la", "venho de a"] };
          respostaCorreta = "venho da";
          exp = "Uso correcto del verbo vir conjugado en primera persona junto a la contracción femenina de origen 'da'.";
        }
      } 
      // NÍVEL MÉDIO: Estruturas Dinâmicas de Origem e Destino (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la contracción o verbo que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Eu venho da reunião de vendas agora mesmo.", missing_word: "da" };
          respostaCorreta = "da";
          exp = "Indica procedencia u origen femenino ('da reunião'). Excelente para conversaciones de pasillo corporativas.";
        } else {
          dataObj = { sentence: "Você vai ao hotel de táxi ou de metrô?", missing_word: "ao" };
          respostaCorreta = "ao";
          exp = "Regencia correcta de movimiento: 'vai ao hotel'. Combina la preposición de destino con medios de transporte.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Rotas Executivas Completas (Tipo 10)
      else {
        enunciado = "Escucha el reporte de movimiento y practica tu fluidez y entonación en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu saio do escritório às cinco e vou direto ao banco." };
          respostaCorreta = "Eu saio do escritório às cinco e vou direto ao banco.";
          exp = "Frase de alto rendimiento. Mapea el origen masculino ('do'), la hora y el destino correcto ('ao banco') de manera fluida.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Nós vínhamos da fábrica quando recebemos a sua mensagem." };
          respostaCorreta = "Nós vínhamos da fábrica quando recebemos a sua mensagem.";
          exp = "Uso de origen en contextos profesionales. Práctica de la nasalización y contracción femenina 'da'.";
        } else {
          dataObj = { speech_text: "Eles vão às agências do centro para verificar os estoques." };
          respostaCorreta = "Eles vão às agências do centro para verificar os estoques.";
          exp = "Desafío avanzado: contiene la contracción plural de destino con crasis ('às agências') y la contracción de pertenencia ('do centro').";
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

    console.log(`📥 Gravando lote final de ${questoesGeradas.length} conteúdos para a Unidade 3.5...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [MÓDULO 3 CONCLUÍDO] Unidade 3.5 gravada! Ecossistema de trânsito e sobrevivência totalmente operacional.");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 3.5:", err.message);
  } finally {
    await client.end();
  }
}

run();
