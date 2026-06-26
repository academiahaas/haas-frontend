const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🧹 [HAAS MOTOR] Ajustando e limpando dados da Unidade 2...");
  
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    // 1. Busca a lição correspondente (Semana 2, Lição 1)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 2 AND lesson_number = 1 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 2 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa registros anteriores para garantir que a estrutura oculta seja aplicada do zero
    await client.query(`DELETE FROM questions WHERE lesson_id = $1;`, [licaoId]);
    console.log("✅ Mesa limpa! Injetando estrutura focada no Presente Prático (Sem travas de A2).");

    let totalQuestoes = 45; 
    const questoesGeradas = [];
    
    for(let i = 1; i <= totalQuestoes; i++) {
      let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
      let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
      
      let dataObj = {};
      let enunciado = "";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Reconhecimento da estrutura do verbo e som nasal inicial (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que complete correctamente la presentación formal.";
        if(i % 2 === 0) {
          dataObj = { target_word: "ME CHAMO", options: ["me chamo", "se chamo", "me llamo"] };
          respostaCorreta = "me chamo";
          exp = "Estructura oculta: En portugués usamos el pronombre antes del verbo en el presente cotidiano: 'Eu me chamo'. Evita la interferencia del español 'llamo'.";
        } else {
          dataObj = { target_word: "SE CHAMA", options: ["se chama", "me chama", "te chamas"] };
          respostaCorreta = "se chama";
          exp = "Para el tratamiento formal o directo de 'Você', usamos 'se chama' (Presente del Indicativo).";
        }
      } 
      // NÍVEL MÉDIO: Aplicação do Verbo + Ditado de Conexão Nasal (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la estructura del verbo.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Como você se chama?", missing_word: "chama" };
          respostaCorreta = "chama";
          exp = "La pregunta más importante de la interacción inicial. Conjugación del verbo en presente para la segunda persona (você).";
        } else {
          dataObj = { sentence: "Eu me chamo Gabriel e sou engenheiro.", missing_word: "chamo" };
          respostaCorreta = "chamo";
          exp = "Fórmula fija de presentación personal. El alumno escribe la primera persona del presente de forma intuitiva.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Conversação Executiva Híbrido (Tipo 10)
      else {
        enunciado = "Escucha la frase corporativa y practica tu pronunciación en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Olá, eu me chamo Antônio e sou o novo diretor." };
          respostaCorreta = "Olá, eu me chamo Antônio e sou o novo diretor.";
          exp = "Excelente para el nivel inicial: une la estructura verbal 'me chamo' con el fuerte sonido nasal del nombre 'Antônio'.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Como você se chama? Muito prazer em conhecer." };
          respostaCorreta = "Como você se chama? Muito prazer em conhecer.";
          exp = "Interacción ejecutiva pulida. Foco en la entonación de la pregunta y la fluidez del verbo en presente.";
        } else {
          dataObj = { speech_text: "Ela se chama Amanda e trabalha na produção." };
          respostaCorreta = "Ela se chama Amanda e trabalha na produção.";
          exp = "Tercera persona del presente indicativo combinada con el diptongo nasal final de 'produção'.";
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

    console.log(`📥 Gravando lote calibrado de ${questoesGeradas.length} questões pedagógicas...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [PERFEITO] Unidade 2 atualizada com o Verbo Chamar-se (Presente) e Sons Nasais, sem vazamento de A2!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 2:", err.message);
  } finally {
    await client.end();
  }
}

run();
