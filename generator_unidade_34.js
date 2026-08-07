const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 3.4: O Labirinto das Contrações de Lugar (No, Na)...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 3, Unidade 4)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 3 AND lesson_number = 4 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 3.4 não encontrada na tabela 'lessons'.");
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

      // NÍVEL FÁCIL: Reconhecimento de contrações urbanas obrigatórias (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que elimine la interferencia del español en la ubicación.";
        if(i % 3 === 0) {
          dataObj = { target_word: "NO SUPERMERCADO", options: ["no supermercado", "en el supermercado", "em o supermercado"] };
          respostaCorreta = "no supermercado";
          exp = "Contracción obligatoria: 'em + o' se convierte en 'no'. Acaba por completo con el vicio de usar 'en el'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "NA FARMÁCIA", options: ["na farmácia", "en la farmácia", "em a farmácia"] };
          respostaCorreta = "na farmácia";
          exp = "Femenino singular: 'em + a' se contrae en 'na'. Recuerda la acentuación de la palabra 'farmácia'.";
        } else {
          dataObj = { target_word: "ESTOU NO", options: ["Estou no", "Estou en o", "Estoy en el"] };
          respostaCorreta = "Estou no";
          exp = "Combinación directa del verbo Estar en primera persona con la contracción masculina 'no'.";
        }
      } 
      // NÍVEL MÉDIO: Associação Estar + Localização Dinâmica (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la contracción espacial que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Ela está na praça central esperando o ônibus.", missing_word: "na" };
          respostaCorreta = "na";
          exp = "Uso de 'na' antes del sustantivo femenino 'praça'. Foco en la estructura de localización en tiempo real.";
        } else {
          dataObj = { sentence: "O gerente está no banco agora mesmo.", missing_word: "no" };
          respostaCorreta = "no";
          exp = "Contexto corporativo de supervivencia. 'No banco' fusiona la preposición de lugar con el artículo masculino de forma limpia.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Estados e Roteiros (Tipo 10)
      else {
        enunciado = "Escucha la frase de localización ejecutiva y practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu estou no escritório e o meu diretor está na agência." };
          respostaCorreta = "Eu estou no escritório e o meu diretor está na agência.";
          exp = "Desafío de alto nivel que alterna la contracción masculina 'no' y la femenina 'na' en un entorno de negocios formal.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Nós estamos nas salas de reunião do segundo andar." };
          respostaCorreta = "Nós estamos nas salas de reunião do segundo andar.";
          exp = "Práctica del plural femenino 'nas' combinado con la conjugación 'Nós estamos' y el fuerte sonido de la 'R' final.";
        } else {
          dataObj = { speech_text: "Com licença, você sabe se eles estão nos laboratórios?" };
          respostaCorreta = "Com licença, você sabe se eles estão nos laboratórios?";
          exp = "Uso del plural masculino 'nos'. Combina fórmulas de cortesía refinadas con la estructura oculta de la unidad.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 3.4...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [PERFEIÇÃO ESTRUTURAL] Unidade 3.4 injetada e blindada contra o portunhol!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 3.4:", err.message);
  } finally {
    await client.end();
  }
}

run();
