const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR - A2] Iniciando geração da Unidade 1.1: Verbos Regulares em -AR no Passado...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Mapeamento interno: Módulo 1 do A2 = week_number 5, lesson_number 1
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 5 AND lesson_number = 1 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 1.1 do A2 não encontrada na tabela 'lessons'. Certifique-se de fazer o seed do A2.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa lote anterior
    await client.query(`DELETE FROM questions WHERE lesson_id = $1;`, [licaoId]);

    let totalQuestoes = 45; 
    const questoesGeradas = [];
    
    for(let i = 1; i <= totalQuestoes; i++) {
      let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
      let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
      
      let dataObj = {};
      let enunciado = "Selecciona la opción que use correctamente el pasado (Pretérito Perfeito) en portugués.";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Blindagem da Primeira Pessoa e Terminações em -AR (Tipo 3)
      if(tipo === 3) {
        if(i % 3 === 0) {
          dataObj = { target_word: "EU FALEI", options: ["eu falei", "eu hablei", "eu faled"] };
          respostaCorreta = "eu falei";
          exp = "Blindaje de Portunhol: La primera persona del pasado para verbos en '-AR' termina en '-EI' ('eu falei'). Evita la mezcla con 'yo hablé'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "ELE TRABALHOU", options: ["ele trabalhou", "ele trabajó", "ele trabalho"] };
          respostaCorreta = "ele trabalhou";
          exp = "Tercera persona del singular: Termina en '-OU' ('trabalhou'). Cuidado para no usar la acentuación del español 'trabajó'.";
        } else {
          dataObj = { target_word: "EU COMPREI", options: ["eu comprei", "eu compré", "eu comprai"] };
          respostaCorreta = "eu comprei";
          exp = "Verbo regular comprar. La terminación '-EI' debe sonar limpia y con el diptongo bien marcado.";
        }
      } 
      // NÍVEL MÉDIO: Marcadores Temporais de Passado e Diálogos (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado sobre el día de ayer y completa el verbo regular en pasado.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Ontem eu estudei português por duas horas.", missing_word: "estudei" };
          respostaCorreta = "estudei";
          exp = "Uso del marcador temporal 'Ontem' (Ayer) obligando el uso del Pretérito Perfeito Regular.";
        } else {
          dataObj = { sentence: "Você trabalhou no último fim de semana?", missing_word: "trabalhou" };
          respostaCorreta = "trabalhou";
          exp = "Pregunta directa sobre hechos concluidos en el pasado usando la tercera persona (você).";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Relatos Concluídos (Tipo 10)
      else {
        enunciado = "Escucha el relato en pasado y practica tu fluidez y dicción en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Ontem eu conversei com o diretor e ele aprovou o orçamento." };
          respostaCorreta = "Ontem eu conversei com o diretor e ele aprovou o orçamento.";
          exp = "Frase ejecutiva perfecta para el A2. Combina la primera persona ('conversei') y la tercera persona ('aprovou') de verbos en '-AR'.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Nós trabalhamos muito no projeto durante a semana passada." };
          respostaCorreta = "Nós trabalhamos muito no projeto durante a semana passada.";
          exp = "Práctica de la primera persona del plural ('Nós trabalhamos'). Note que la grafía es idéntica al presente, pero el contexto del marcador define el pasado.";
        } else {
          dataObj = { speech_text: "Eu comprei as passagens aéreas ontem de manhã para a viagem." };
          respostaCorreta = "Eu comprei as passagens aéreas ontem de manhã para a viagem.";
          exp = "Desafío de alta fidelidad: une el pasado regular ('comprei'), el marcador temporal ('ontem de manhã') y el sustantivo heterogenérico 'a viagem'.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 1.1 do A2...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [A2 INICIADO] Unidade 1.1 totalmente integrada e salva com sucesso no ecossistema!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 1.1 do A2:", err.message);
  } finally {
    await client.end();
  }
}

run();
