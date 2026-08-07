const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR - A2] Iniciando geração da Unidade 1.4: Profissões e Gênero...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Mapeamento interno: Módulo 1 do A2, Lição 4 = week_number 5, lesson_number 4
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 5 AND lesson_number = 4 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 1.4 do A2 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa lote anterior para garantir lote puro de 45 questões
    await client.query(`DELETE FROM questions WHERE lesson_id = $1;`, [licaoId]);

    let totalQuestoes = 45; 
    const questoesGeradas = [];
    
    for(let i = 1; i <= totalQuestoes; i++) {
      let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
      let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
      
      let dataObj = {};
      let enunciado = "Selecciona la opción que aplique correctamente el género a la profesión en portugués.";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Profissões de Gênero Uniforme / Comum de Dois (Tipo 3)
      if(tipo === 3) {
        if(i % 3 === 0) {
          dataObj = { target_word: "A DENTISTA", options: ["a dentista", "a dentisto", "la dentista"] };
          respostaCorreta = "a dentista";
          exp = "Ponto Crítico: Las palabras terminadas en '-ista' son comunes de dos géneros. Cambia únicamente el artículo ('a dentista'). Jamás inventes palabras como 'dentisto'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "A GERENTE", options: ["a gerente", "a gerenta", "la gerente"] };
          respostaCorreta = "a gerente";
          exp = "Uso corporativo: 'Gerente' es invariable en su terminación. El género femenino se marca estrictamente con el artículo 'a' ('a gerente').";
        } else {
          dataObj = { target_word: "O ARTISTA", options: ["o artista", "o artisto", "el artista"] };
          respostaCorreta = "o artista";
          exp = "Palabra invariable para masculino y femenino. El artículo masculino 'o' define al sujeto sin alterar el sustantivo.";
        }
      } 
      // NÍVEL MÉDIO: Identificação e Descrição de Ocupações (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado corporativo y completa la profesión o artículo faltante.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Ela é a nova diretora de marketing da nossa empresa.", missing_word: "diretora" };
          respostaCorreta = "diretora";
          exp = "Flexión regular de profesiones terminadas en '-or'. Pasa al femenino cambiando o agregando '-a' ('diretora').";
        } else {
          dataObj = { sentence: "O gari limpou a rua logo cedo de manhã.", missing_word: "O" };
          respostaCorreta = "O";
          exp = "Ocupación de género uniforme ('gari'). El artículo masculino determina que se trata de un hombre.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Identidade Profissional (Tipo 10)
      else {
        enunciado = "Escucha la descripción profesional de la familia y practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "A minha irmã é médica e o meu primo trabalha como analista de sistemas." };
          respostaCorreta = "A minha irmã é médica e o meu primo trabalha como analista de sistemas.";
          exp = "Frase fluida que combina profesiones variables ('médica') con sustantivos de género uniforme de alta demanda tecnológica ('analista').";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Ela foi uma engenheira brilhante e ele se destacou como gerente de projetos." };
          respostaCorreta = "Ela foi uma engenheira brilhante e ele se destacou como gerente de projetos.";
          exp = "Nivelación avanzada: mezcla pasados irregulares, concordancia de género formal y títulos ejecutivos impecables.";
        } else {
          dataObj = { speech_text: "Quem é a artista responsável pelo novo design da embalagem?" };
          respostaCorreta = "Quem é a artista responsável pelo novo design da embalagem?";
          exp = "Interacción refinada. Obliga al uso correcto del artículo femenino 'a' antes del sustantivo invariable 'artista'.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 1.4 do A2...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [PROFISSÕES ALINHADAS] Unidade 1.4 integrada e blindada contra desvios de gênero!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 1.4 do A2:", err.message);
  } finally {
    await client.end();
  }
}

run();
