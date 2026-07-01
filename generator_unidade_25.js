const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 2.5: Onde Estão as Coisas? Localização Espacial...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 2, Unidade 5)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 2 AND lesson_number = 5 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 2.5 não encontrada na tabela 'lessons'.");
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

      // NÍVEL FÁCIL: Contrações básicas e preposições de lugar (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que complete correctamente la localización espacial.";
        if(i % 3 === 0) {
          dataObj = { target_word: "NO QUARTO", options: ["no quarto", "en o quarto", "em o quarto"] };
          respostaCorreta = "no quarto";
          exp = "Fixação fonética oculta: En portugués, la preposición 'em' se contrae con el artículo 'o' formando obligatoriamente 'no'. Jamás uses 'en o'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "NA SALA", options: ["na sala", "en la sala", "em a sala"] };
          respostaCorreta = "na sala";
          exp = "La preposición 'em' se contrae con el artículo femenino 'a' formando 'na'. El aire de 'em' se funde en una pronunciación natural.";
        } else {
          dataObj = { target_word: "DENTRO DE", options: ["dentro de", "dentro do", "dentro da"] };
          respostaCorreta = "dentro de";
          exp = "Estructura de ubicación espacial. 'Dentro de' se usa para indicar interioridad antes de un término neutro o general.";
        }
      } 
      // NÍVEL MÉDIO: Verbo Estar + Localização Prática (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la palabra de ubicación que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Os relatórios estão em cima da mesa.", missing_word: "estão" };
          respostaCorreta = "estão";
          exp = "Uso del Verbo Estar para localización en plural. Cuidado con el diptongo nasal fuerte de '-ÃO'.";
        } else {
          dataObj = { sentence: "A chave do escritório está na minha gaveta.", missing_word: "na" };
          respostaCorreta = "na";
          exp = "Contracción obligatoria 'em + a = na' integrada en una frase corporativa formal. Evita decir 'en la'.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Ambientes Corporativos/Sociais (Tipo 10)
      else {
        enunciado = "Escucha la frase de localización espacial y practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Onde estão os documentos? Estão dentro daquela gaveta." };
          respostaCorreta = "Onde estão os documentos? Estão dentro daquela gaveta.";
          exp = "Desafío avanzado de interacción. Une la pregunta-chave, el uso del verbo estar en plural y la contracción de lugar.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "O seu computador novo está no meio da sala de reuniões." };
          respostaCorreta = "O seu computador novo está no meio da sala de reuniões.";
          exp = "Frase corporativa excelente. Práctica de la contracción 'no' y el uso del posesivo de segunda persona 'seu'.";
        } else {
          dataObj = { speech_text: "Minha carteira está no carro e as chaves na cozinha." };
          respostaCorreta = "Minha carteira está no carro e as chaves na cozinha.";
          exp = "Contraste perfecto de contrações: 'no carro' (masculino) y 'na cozinha' (femenino, con fonética de chieiro 'chi').";
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

    console.log(`📥 Gravando lote final de ${questoesGeradas.length} conteúdos para a Unidade 2.5...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [MÓDULO 2 CONCLUÍDO] Unidade 2.5 fechada com chave de ouro e gravada na tabela nativa!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 2.5:", err.message);
  } finally {
    await client.end();
  }
}

run();
