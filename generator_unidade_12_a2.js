const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR - A2] Iniciando geração da Unidade 1.2: Verbos Regulares em -ER e -IR no Passado...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Mapeamento interno: Módulo 1 do A2, Lição 2 = week_number 5, lesson_number 2
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 5 AND lesson_number = 2 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 1.2 do A2 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa lote anterior para garantir integridade pura
    await client.query(`DELETE FROM questions WHERE lesson_id = $1;`, [licaoId]);

    let totalQuestoes = 45; 
    const questoesGeradas = [];
    
    for(let i = 1; i <= totalQuestoes; i++) {
      let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
      let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
      
      let dataObj = {};
      let enunciado = "Selecciona la opción que use correctamente el pasado (Pretérito Perfeito) de los verbos en -ER o -IR.";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Terminações críticas de Passado em -ER e -IR (Tipo 3)
      if(tipo === 3) {
        if(i % 3 === 0) {
          dataObj = { target_word: "ELE COMEU", options: ["ele comeu", "ele comió", "ele comeo"] };
          respostaCorreta = "ele comeu";
          exp = "Terminación regular de tercera persona para verbos en '-ER' ('ele comeu'). Rompe por completo la interferencia de 'comió'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "EU ASSISTI", options: ["eu assisti", "eu asistió", "eu assististe"] };
          respostaCorreta = "eu assisti";
          exp = "Primera persona del pasado para verbos en '-IR' ('eu assisti'). Recuerda la grafía con doble 'S' y sonido limpio.";
        } else {
          dataObj = { target_word: "ELES VENDERAM", options: ["eles venderam", "eles venderon", "eles vendieron"] };
          respostaCorreta = "eles venderam";
          exp = "Tercera persona del plural: Termina en '-AM' nasalizado. Evita la deformación del español 'vendieron'.";
        }
      } 
      // NÍVEL MÉDIO: Relatos de Consumo e Eventos Concluídos (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el relato en pasado y completa el verbo regular que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "No sábado, nós comemos uma feijoada excelente.", missing_word: "comemos" };
          respostaCorreta = "comemos";
          exp = "Práctica del pasado de la primera persona plural ('Nós comemos'). Rompe la confusión ortográfica con el español.";
        } else {
          dataObj = { sentence: "Ela bebeu apenas água mineral durante o jantar.", missing_word: "bebeu" };
          respostaCorreta = "bebeu";
          exp = "Uso de la tercera persona del singular para un verbo terminado en '-ER' en pasado ('bebeu').";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Experiências Reais (Tipo 10)
      else {
        enunciado = "Escucha la secuencia de eventos concluidos y practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Ontem nós assistimos à apresentação de métricas e vendemos o projeto." };
          respostaCorreta = "Ontem nós assistimos à apresentação de métricas e vendemos o projeto.";
          exp = "Frase ejecutiva de alta gama. Combina el pasado de un verbo en '-IR' ('assistimos') con uno en '-ER' ('vendemos').";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Eu abri a mensagem do cliente e respondi todas as dúvidas." };
          respostaCorreta = "Eu abri a mensagem do cliente e respondi todas as dúvidas.";
          exp = "Acciones secuenciales ejecutadas en primera persona. Excelente para fijar los sonidos de 'abri' y 'respondi'.";
        } else {
          dataObj = { speech_text: "Eles partiram para o escritório de São Paulo na semana passada." };
          respostaCorreta = "Eles partiram para o escritório de São Paulo na semana passada.";
          exp = "Desafío avanzado: integra la tercera persona del plural ('partiram') con indicadores temporales y vocabulario corporativo.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 1.2 do A2...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [SUCESSO COLETADO] Unidade 1.2 totalmente integrada e lacrada na base!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 1.2 do A2:", err.message);
  } finally {
    await client.end();
  }
}

run();
