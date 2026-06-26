const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 4.1: Meu Dia a Dia — Verbos Regulares...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 4, Unidade 1)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 4 AND lesson_number = 1 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 4.1 não encontrada na tabela 'lessons'. Verifique o seed base.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa registros anteriores para garantir lote limpo de 45 questões
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

      // NÍVEL FÁCIL: Conjugação regular e expressões de tempo (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que conjugue correctamente el verbo regular en presente.";
        if(i % 3 === 0) {
          dataObj = { target_word: "EU TRABALHO", options: ["Eu trabalho", "Eu trabaja", "Eu trabalhoh"] };
          respostaCorreta = "Eu trabalho";
          exp = "Verbos de terminación '-ar' (Trabalhar). En primera persona del presente, termina con una 'O' limpia. Evite mezclar con el español.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "DE NOITE", options: ["de noite", "en la noche", "por la noite"] };
          respostaCorreta = "de noite";
          exp = "Expresión de tiempo nativa. En portugués de Brasil se usa de forma general 'de manhã', 'de tarde' y 'de noite' (pronunciado 'noichi').";
        } else {
          dataObj = { target_word: "NÓS ESTUDAMOS", options: ["Nós estudamos", "Nosotros estudamos", "Nós estudamosh"] };
          respostaCorreta = "Nós estudamos";
          exp = "Primera persona del plural regular. Mantiene la desinencia propia '-amos' sin alterar la raíz.";
        }
      } 
      // NÍVEL MÉDIO: Estruturação de Frases e Ações de Rotina (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado de la rutina y completa la palabra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Eu sempre acordo cedo de manhã para trabalhar.", missing_word: "acordo" };
          respostaCorreta = "acordo";
          exp = "Verbo regular 'Acordar'. Expresa acción inicial del día a día de forma natural.";
        } else {
          dataObj = { sentence: "Eles comem no restaurante da empresa à tarde.", missing_word: "comem" };
          respostaCorreta = "comem";
          exp = "Conjugación en tercera persona plural para verbos terminados en '-er' (Comer). La terminación '-em' produce un diptongo nasal.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Narrativas de Rotina (Tipo 10)
      else {
        enunciado = "Escucha el relato de la rutina y practica tu entonación en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu trabalho no escritório de manhã e estudo português de noite." };
          respostaCorreta = "Eu trabalho no escritório de manhã e estudo português de noite.";
          exp = "Frase de alta fluidez. Integra múltiples expresiones de tiempo, conjugaciones regulares y la combinación del chieiro.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Nós escrevemos os relatórios diários antes do almoço." };
          respostaCorreta = "Nós escrevemos os relatórios diários antes do almoço.";
          exp = "Práctica corporativa con verbo de segunda conjugación ('escrever'). Foco en la dicción limpia de las vocales.";
        } else {
          dataObj = { speech_text: "Eles não dividem o espaço de trabalho com a outra equipe." };
          respostaCorreta = "Eles não dividem o espaço de trabalho com a outra equipe.";
          exp = "Estructura negativa compuesta con un verbo de tercera conjugación ('dividir'). Excelente para el oído y la musculatura facial.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 4.1...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [CONSTRUÇÃO INICIADA] Unidade 4.1 integrada com sucesso total!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 4.1:", err.message);
  } finally {
    await client.end();
  }
}

run();
