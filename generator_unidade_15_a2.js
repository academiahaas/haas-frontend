const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfwqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR - A2] Iniciando geração da Unidade 1.5: Consolidação de Experiências Concluídas...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Mapeamento interno: Módulo 1 do A2, Lição 5 = week_number 5, lesson_number 5
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 5 AND lesson_number = 5 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 1.5 do A2 não encontrada na tabela 'lessons'.");
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
      let enunciado = "Selecciona la opción que estructure correctamente el relato integrado en pasado.";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Integração de passado e profissões/locais (Tipo 3)
      if(tipo === 3) {
        if(i % 3 === 0) {
          dataObj = { target_word: "FALEI COM A GERENTE", options: ["falei com a gerente", "falei com a gerenta", "hablei con la gerente"] };
          respostaCorreta = "falei com a gerente";
          exp = "Consolidación total: une el pasado regular en '-AR' ('falei') con la profesión corporativa invariable femenina ('a gerente').";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "ONTEM EU FUI", options: ["Ontem eu fui", "Ayer eu fui", "Ontem eu fuia"] };
          respostaCorreta = "Ontem eu fui";
          exp = "Marcador temporal de pasado combinado con el verbo irregular 'Ir'. Estructura base de relatos fluidos.";
        } else {
          dataObj = { target_word: "ELES NÃO FIZERAM", options: ["eles não fizeram", "eles no hicieron", "eles não fisseram"] };
          respostaCorreta = "eles não fizeram";
          exp = "Estructura negativa en tercera persona plural del verbo irregular Fazer. Evite errores ortográficos.";
        }
      } 
      // NÍVEL MÉDIO: Ordenação e Ditados de Rotina Passada (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el reporte de experiencias concluidas y completa la palabra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Ontem eu fui ao banco e resolvi um problema com o analista.", missing_word: "fui" };
          respostaCorreta = "fui";
          exp = "Uso de verbo irregular de movimiento combinando procedencia y profesiones corporativas de género común.";
        } else {
          dataObj = { sentence: "Nós comemos no restaurante e depois conversamos com a diretora.", missing_word: "conversamos" };
          respostaCorreta = "conversamos";
          exp = "Secuencia de acciones en pasado plural. Combina un verbo en '-ER' y un verbo en '-AR'.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Fluência e Narrativas Longas (Tipo 10)
      else {
        enunciado = "Escucha el relato integrado de nivel A2 y practica tu fluidez y pronunciación en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Ontem eu fui ao escritório de manhã, falei com a gerente e terminei o relatório." };
          respostaCorreta = "Ontem eu fui ao escritório de manhã, falei com a gerente e terminei o relatório.";
          exp = "Xerife de nível: Amarra marcadores, verbos irregulares ('fui'), regulares ('falei', 'terminei') e títulos profissionais.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Nós tivemos uma reunião longa com os analistas e decidimos o novo plano." };
          respostaCorreta = "Nós tivemos uma reunião longa com os analistas e decidimos o novo plano.";
          exp = "Frase ejecutiva compleja. Exige dicción perfecta en 'tivemos' (verbo irregular) y 'decidimos' (verbo regular en -IR).";
        } else {
          dataObj = { speech_text: "Você assistiu à apresentação que a nova diretora fez na semana passada?" };
          respostaCorreta = "Você assistiu à apresentação que a nova diretora fez na semana passada?";
          exp = "Estructura interrogativa de alto nivel que mezcla crasis, pasado de verbo en -IR, verbo irregular 'fazer' e indicador temporal.";
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

    console.log(`📥 Gravando lote final de ${questoesGeradas.length} conteúdos para a Unidade 1.5 do A2...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [MÓDULO 1 FINALIZADO COM SUCESSO] Unidade 1.5 completamente integrada! Passado sem pressa concluído.");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 1.5 do A2:", err.message);
  } finally {
    await client.end();
  }
}

run();
