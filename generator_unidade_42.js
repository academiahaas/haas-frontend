const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR - RECUPERAÇÃO] Forçando geração da Unidade 4.2: Cuidado Pessoal...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca a lição correspondente no banco (Módulo 4, Unidade 2)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 4 AND lesson_number = 2 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 4.2 não encontrada na tabela 'lessons'.");
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

      if(tipo === 3) {
        enunciado = "Selecciona la opción que use correctamente el verbo pronominal al estilo brasileño.";
        if(i % 3 === 0) {
          dataObj = { target_word: "EU ME LEVANTO", options: ["Eu me levanto", "Eu levanto-me", "Eu me levanto-me"] };
          respostaCorreta = "Eu me levanto";
          exp = "Posición natural en Brasil: Colocar el pronombre reflexivo antes del verbo (próclisis) es la norma hablada y corporativa más común y fluida.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "ELE SE VESTE", options: ["Ele se veste", "Ele se vesti", "Ele veste-se"] };
          respostaCorreta = "Ele se veste";
          exp = "Verbo pronominal 'Vestir-se'. Recuerde la reducción fonética de la 'E' final a 'I' en el habla, pero mantenga la escritura correcta.";
        } else {
          dataObj = { target_word: "MEU PAI SE BARBEIA", options: ["Meu pai se barbeia", "Meu pai barbeia-se", "Meu pai se barbea"] };
          respostaCorreta = "Meu pai se barbeia";
          exp = "Vocabulario de cuidado personal. El verbo 'barbear-se' en presente mantiene el diptongo 'ei' en la conjugación ('barbeia').";
        }
      } 
      else if(tipo === 4) {
        enunciado = "Escucha atentamente o ditado e complete com o pronome ou verbo reflexivo correto.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Eu sempre me banho antes de ir para o escritório.", missing_word: "me" };
          respostaCorreta = "me";
          exp = "Uso fluido de la rutina matutina. El pronombre 'me' acompaña la acción reflexiva antes del verbo.";
        } else {
          dataObj = { sentence: "Nós nos arrumamos rapidamente de manhã.", missing_word: "nos" };
          respostaCorreta = "nos";
          exp = "Duplicación obligatoria para la primera persona del plural: 'Nós nos arrumamos'.";
        }
      } 
      else {
        enunciado = "Escucha el reporte de cuidado diario y practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu me levanto às seis horas e me preparo para o trabalho." };
          respostaCorreta = "Eu me levanto às seis horas e me preparo para o trabalho.";
          exp = "Frase nativa impecable. Integra dos verbos pronominales coordinados con fluidez y entonación limpia.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Ele se veste com roupas formais para as reuniões importantes." };
          respostaCorreta = "Ele se veste com roupas formais para as reuniões importantes.";
          exp = "Contexto ejecutivo formal. Exige una pronunciación limpia en los sonidos de la 'S' y el pronombre preverbal.";
        } else {
          dataObj = { speech_text: "Nós nos encontramos na recepção do hotel antes do evento." };
          respostaCorreta = "Nós nos encontramos na recepção do hotel antes do evento.";
          exp = "Acción recíproca/pronominal avanzada. Combina el doble pronombre ('nós nos') con vocabulario de localização urbana.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 4.2...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [CONCLUÍDO] Unidade 4.2 recuperada e integrada com sucesso!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 4.2:", err.message);
  } finally {
    await client.end();
  }
}

run();
