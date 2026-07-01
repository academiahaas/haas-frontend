const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 1.2: Identidade e os Sons do Chieiro...");
  
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    // Busca a lição usando o número da semana e lição para garantir o vínculo certo no ID
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 1 AND lesson_number = 2 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 1.2 não encontrada no banco. Verifique se o seed_lessons foi rodado.");
      return;
    }

    const licaoId = res.rows[0].id;
    let totalQuestoes = 45; // 2 Horas mapeadas em 45 perguntas obrigatórias

    console.log(`📝 Injetando ${totalQuestoes} questões focadas em Chieiro (TI/TE -> "chi" e DI/DE -> "dji") + Apresentação Pessoal...`);

    const questoesGeradas = [];
    
    for(let i = 1; i <= totalQuestoes; i++) {
      let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
      let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
      
      let dataObj = {};
      let enunciado = "";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Vocabulário e Identidade Básica (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que represente la pronunciación correcta de la palabra.";
        if(i % 3 === 0) {
          dataObj = { target_word: "NOITE", options: ["Noite", "Noichi", "Noiteh"] };
          respostaCorreta = "Noite";
          exp = "En portugués, la combinación 'TE' al final de las palabras se reduce fónicamente a 'chi'. Decimos 'noichi'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "DIA", options: ["Dia", "Djia", "Día"] };
          respostaCorreta = "Dia";
          exp = "La 'DI' al inicio o interior de palabras suena como 'dji' en la mayor parte de Brasil. Decimos 'djia' y no oclूसiva dura.";
        } else {
          dataObj = { target_word: "GENTE", options: ["Gente", "Genchi", "Genteh"] };
          respostaCorreta = "Gente";
          exp = "La palabra 'gente' sufre el chieiro en la 'TE' final, transformándose en 'genchi'. Evita pronunciar la 'e' de forma marcada.";
        }
      } 
      // NÍVEL MÉDIO: Apresentação Pessoal + Pequenas Frases (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la palabra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Qual é o seu nome?", missing_word: "nome" };
          respostaCorreta = "nome";
          exp = "Estructura básica de presentación. Recuerda que la 'ME' final reduce a 'mi' ('nomi'), pero la grafía correcta es con 'E'.";
        } else {
          dataObj = { sentence: "Como se chama a sua cidade?", missing_word: "cidade" };
          respostaCorreta = "cidade";
          exp = "Doble desafío: la 'DE' final suena 'dji' ('cidadji'). El dictado entrena el oído para escribir correctamente la 'e' final.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia em Computador/Mobile (Tipo 10)
      else {
        enunciado = "Escucha la frase y practica tu pronunciación en el laboratorio fónico.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Boa noite! Meu nome é Gabriel." };
          respostaCorreta = "Boa noite! Meu nome é Gabriel.";
          exp = "Frase fluida. Exige la pronunciación de 'noichi' y la 'L' con sonido de 'U' al final de 'Gabriel'. Perfecto para el micrófono.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Gostaria de conhecer as cidades grandes." };
          respostaCorreta = "Gostaria de conhecer as cidades grandes.";
          exp = "Práctica del plural con chieiro: 'cidades' suena 'cidadjis' y 'grandes' suena 'grandjis'. Un dolor clásico del hispanohablante.";
        } else {
          dataObj = { speech_text: "Hoje é um lindo dia para estudar." };
          respostaCorreta = "Hoje é um lindo dia para estudar.";
          exp = "Foco en 'Hoje' ('hoji') y 'dia' ('djia'). El alumno debe ligar los sonidos de forma natural en el dispositivo.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos pedagógicos na tabela 'questions'...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [SUCESSO REPRODUZIDO] Unidade 1.2 populada com 45 questões nativas puras!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 1.2:", err.message);
  } finally {
    await client.end();
  }
}

run();
