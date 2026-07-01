const { Client } = require('pg');

// Usando a URL tradicional que funcionou perfeitamente
const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 2.3: De Quem é Isto? Objetos e a Posse Expandida...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 2, Unidade 3)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 2 AND lesson_number = 3 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 2.3 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa registros anteriores para garantir que a carga de 45 questões seja pura
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

      // NÍVEL FÁCIL: Identificação de Objetos Pessoais e Possessivos (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que complete correctamente la frase sobre pertenencias.";
        if(i % 3 === 0) {
          dataObj = { target_word: "A SUA CARTEIRA", options: ["a sua carteira", "su carteira", "a sua cartera"] };
          respostaCorreta = "a sua carteira";
          exp = "Estructura de posesivo expandido: 'sua' se refiere a lo que le pertenece a 'você' (ti/usted). La palabra 'carteira' lleva el diptongo 'ei'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "O SEU CELULAR", options: ["o seu celular", "su celular", "o seu celulahr"] };
          respostaCorreta = "o seu celular";
          exp = "Uso de 'seu' para posesión masculina de la segunda persona (você). Recuerda que la 'L' final de 'celular' se pronuncia de forma limpia.";
        } else {
          dataObj = { target_word: "DE QUEM", options: ["De quem", "De quién", "De quen"] };
          respostaCorreta = "De quem";
          exp = "Pregunta-chave essencial para indagar sobre la posesión. La terminación '-EM' es un diptongo nasal cerrado.";
        }
      } 
      // NÍVEL MÉDIO: Estruturação da Pergunta-Chave de Posse (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la palabra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "De quem é este livro sobre a mesa?", missing_word: "De quem" };
          respostaCorreta = "De quem";
          exp = "Entrenamiento de la estructura clave 'De quem é...?'. Práctica de la interacción formal en la oficina o sala.";
        } else {
          dataObj = { sentence: "Esta chave é sua ou é dele?", missing_word: "sua" };
          respostaCorreta = "sua";
          exp = "Blindaje cognitivo: aquí se contrasta 'sua' (de usted) con 'dele' (de él) para romper la interferencia del español.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Diálogos de Posse Corporativa (Tipo 10)
      else {
        enunciado = "Escucha la frase ejecutiva y practica tu pronunciación en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Com licença, este celular na mesa é seu?" };
          respostaCorreta = "Com licença, este celular na mesa é seu?";
          exp = "Frase formal perfecta para el ambiente de trabajo. Combina la cortesía ('com licença') con el uso correcto del posesivo de segunda persona ('seu').";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "De quem é esta carteira com os documentos?" };
          respostaCorreta = "De quem é esta carteira com os documentos?";
          exp = "Interacción real cotidiana. Exige entonación clara en la pregunta-chave y dicción limpia en las vocales de 'carteira'.";
        } else {
          dataObj = { speech_text: "A sua chave está aqui dentro da minha gaveta." };
          respostaCorreta = "A sua chave está aqui dentro da minha gaveta.";
          exp = "Contraste avanzado de posesivos en la misma oración: 'a sua' (de usted) frente a 'minha' (mía), usando el vocabulario de objetos.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 2.3...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [SUCESSO COLETADO] Unidade 2.3 totalmente integrada na base de dados Haas!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 2.3:", err.message);
  } finally {
    await client.end();
  }
}

run();
