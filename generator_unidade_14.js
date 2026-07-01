const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 1.4: Educação e a Sobrevivência do Soprado...");
  
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    // Busca a lição correspondente (Semana 1, Lição 4)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 1 AND lesson_number = 4 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 1.4 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    let totalQuestoes = 45; 
    const questoesGeradas = [];
    
    for(let i = 1; i <= totalQuestoes; i++) {
      let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
      let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
      
      let dataObj = {};
      let enunciado = "";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Fórmulas de cortesia e contraste de grafia/som (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que represente la pronunciación o grafía correcta de la palabra.";
        if(i % 3 === 0) {
          dataObj = { target_word: "LICENÇA", options: ["Licença", "Licensa", "Licencha"] };
          respostaCorreta = "Licença";
          exp = "La 'Ç' (cedilla) tiene un sonido de 'S' limpia y suave. Nunca suena como la 'Z' ibérica ni como 'CH'. Se escribe 'com licença'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "CHAVE", options: ["Chave", "Shave", "Llave"] };
          respostaCorreta = "Chave";
          exp = "El sonido de la 'CH' en portugués es soplado y continuo (como la 'sh' en inglés o el sonido de pedir silencio 'shh'). Evita el sonido fuerte de la 'CH' del español.";
        } else {
          dataObj = { target_word: "OBRIGADO", options: ["Obrigado", "Obrigadu", "Obrigadoh"] };
          respostaCorreta = "Obrigado";
          exp = "Fórmula esencial de cortesía. Recuerda la reducción de la 'O' final a 'U' al hablar, manteniendo la grafía formal.";
        }
      } 
      // NÍVEL MÉDIO: Frases de interação social e pedidos de ajuda (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la palabra de cortesía que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Por favor, você pode repetir?", missing_word: "favor" };
          respostaCorreta = "favor";
          exp = "Estructura fija para pedir ayuda cuando no se entiende algo. Práctica de educación ejecutiva formal.";
        } else {
          dataObj = { sentence: "Com licença, o senhor trabalha aqui?", missing_word: "licença" };
          respostaCorreta = "licença";
          exp = "Uso de la cortesía formal combinada con el tratamiento de respeto 'o senhor'. Foco en la 'Ç'.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Sobrevivência Avançada (Tipo 10)
      else {
        enunciado = "Escucha la frase de cortesía e interactúa en el laboratorio de pronunciación.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Desculpe, eu não entendi. Pode falar mais devagar?" };
          respostaCorreta = "Desculpe, eu não entendi. Pode falar mais devagar?";
          exp = "Frase de supervivencia crucial. El alumno aprende a salir elegantemente de un bloqueo comunicativo combinando sonidos limpios.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Muito obrigada pela sua atenção e ajuda." };
          respostaCorreta = "Muito obrigada pela sua atenção e ajuda.";
          exp = "Foco en la concordancia femenina ('obrigada') y en el fuerte sonido nasal del sufijo '-ção' en 'atenção'.";
        } else {
          dataObj = { speech_text: "Com licença, onde fica a praça central?" };
          respostaCorreta = "Com licença, onde fica a praça central?";
          exp = "Práctica del sonido de la 'Ç' doble en una interacción real de viaje u orientación urbana: 'licença' y 'praça'.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos da Unidade 1.4 na estrutura nativa...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [MISSAO CUMPRIDA] Unidade 1.4 injetada com maestria pedagógica total!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 1.4:", err.message);
  } finally {
    await client.end();
  }
}

run();
