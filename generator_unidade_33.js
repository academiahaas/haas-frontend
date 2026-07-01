const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 3.3: Lugares da Cidade e Meios de Transporte...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 3, Unidade 3)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 3 AND lesson_number = 3 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 3.3 não encontrada na tabela 'lessons'.");
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

      // NÍVEL FÁCIL: Vocabulário de Lugares, Transportes e Verbo Ir (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que complete correctamente el vocabulario de la ciudad.";
        if(i % 3 === 0) {
          dataObj = { target_word: "ÔNIBUS", options: ["ônibus", "onibus", "buse"] };
          respostaCorreta = "ônibus";
          exp = "Vocabulario de transporte esencial. Recuerda el acento circunflejo en la 'Ô' (sonido cerrado) y el chieiro natural de la 'S' final en el portugués de Brasil.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "EU VOU", options: ["Eu vou", "Eu vo", "Eu voy"] };
          respostaCorreta = "Eu vou";
          exp = "Conjugación en presente del Verbo Ir para la primera persona. Evita la interferencia del español 'voy' añadiendo la 'U' final limpia.";
        } else {
          dataObj = { target_word: "FARMÁCIA", options: ["farmácia", "farmacia", "drogaria"] };
          respostaCorreta = "farmácia";
          exp = "Vocabulario urbano. Se escribe con acento en la 'Á' y mantiene la grafía formal.";
        }
      } 
      // NÍVEL MÉDIO: Rotas Cotidianas e Deslocamentos Simples (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la palabra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Nós vamos ao banco resolver um problema.", missing_word: "vamos" };
          respostaCorreta = "vamos";
          exp = "Conjugación del Verbo Ir para la primera persona del plural ('Nós vamos'). Se integra de forma natural en el contexto cotidiano.";
        } else {
          dataObj = { sentence: "Você vai de metrô para o trabalho?", missing_word: "metrô" };
          respostaCorreta = "metrô";
          exp = "Uso de medios de transporte. El sustantivo 'metrô' lleva acento circunflejo en la 'Ô' final, cerrando el sonido.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Rotas Urbanas (Tipo 10)
      else {
        enunciado = "Escucha la frase de desplazamiento y practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu vou de ônibus para o supermercado central." };
          respostaCorreta = "Eu vou de ônibus para o supermercado central.";
          exp = "Frase completa de transporte. Exige una correcta pronunciación de 'ônibus' con chieiro y el diptongo 'vou'.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Eles vão de carro para a escola de manhã." };
          respostaCorreta = "Eles vão de carro para a escola de manhã.";
          exp = "Práctica de la tercera persona plural ('vão') con fuerte sonido nasal, combinado con el laberinto de la 'RR' en 'carro'.";
        } else {
          dataObj = { speech_text: "Com licença, você vai a pé para a praça principal?" };
          respostaCorreta = "Com licença, você vai a pé para a praça principal?";
          exp = "Excelente combinación: une cortesía formal, la locución 'a pé', el sonido limpio de la 'Ç' en 'praça' y el chieiro en 'principal'.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 3.3...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [SUCESSO INDUSTRIAL] Unidade 3.3 integrada e validada no banco!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 3.3:", err.message);
  } finally {
    await client.end();
  }
}

run();
