const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 4.3: O que Eu Faço no Lazer? Verbos Irregulares...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 4, Unidade 3)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 4 AND lesson_number = 3 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 4.3 não encontrada na tabela 'lessons'.");
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

      // NÍVEL FÁCIL: Verbos Irregulares de Desejo e Ação (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que conjugue correctamente el verbo irregular.";
        if(i % 3 === 0) {
          dataObj = { target_word: "EU FAÇO", options: ["Eu faço", "Eu fasso", "Eu haco"] };
          respostaCorreta = "Eu faço";
          exp = "Irregularidad crítica: El verbo 'Fazer' cambia la raíz en primera persona a 'faço' (con som de S limpia). Evita el error ortográfico 'fasso'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "EU QUERO", options: ["Eu quero", "Eu kero", "Eu qüero"] };
          respostaCorreta = "Eu quero";
          exp = "Verbo Querer. La combinación 'qu-' mantiene el sonido seco antes de 'e'. Evite la grafía informal.";
        } else {
          dataObj = { target_word: "VOCÊ PODE", options: ["Você pode", "Você puede", "Você podi"] };
          respostaCorreta = "Você pode";
          exp = "Verbo Poder en segunda persona (você). Rompe el diptongo del español 'puede'; en portugués se mantiene la vocal 'o' cerrada.";
        }
      } 
      // NÍVEL MÉDIO: Perguntas e Respostas sobre Tempo Livre (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente o ditado e complete a palavra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "O que você quer fazer neste fim de semana?", missing_word: "quer" };
          respostaCorreta = "quer";
          exp = "Estructura interactiva de ocio. Combina el verbo irregular de deseo 'querer' con la acción 'fazer'.";
        } else {
          dataObj = { sentence: "Eu não posso trabalhar no sábado de manhã.", missing_word: "posso" };
          respostaCorreta = "posso";
          exp = "Conjugación irregular de primera persona del verbo Poder ('posso') integrada en una frase de límites de tiempo.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Hobbies e Passatempos (Tipo 10)
      else {
        enunciado = "Escucha la declaración de ocio y practica tu fluidez y dicción en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu faço caminhada na praia quando posso descansar." };
          respostaCorreta = "Eu faço caminhada na praia quando posso descansar.";
          exp = "Frase fluida de estilo de vida. Une 'faço' e 'posso' en un contexto de pasatiempo real al aire libre.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Você quer jogar futebol com a equipe no domingo?" };
          respostaCorreta = "Você quer jogar futebol com a equipe no domingo?";
          exp = "Interacción social relajada. Foco en la entonación interrogativa y en el sonido limpio de 'futebol'.";
        } else {
          dataObj = { speech_text: "Nós queremos fazer uma viagem curta no próximo feriado." };
          respostaCorreta = "Nós queremos fazer uma viagem curta no próximo feriado.";
          exp = "Uso de 'queremos' y el infinitivo regular 'fazer' en una proyección de planes corporativos o familiares.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 4.3...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [SUCESSO COMPLETO] Unidade 4.3 integrada perfeitamente com os verbos de lazer!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 4.3:", err.message);
  } finally {
    await client.end();
  }
}

run();
