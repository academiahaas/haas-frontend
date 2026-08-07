const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR - A2] Iniciando geração da Unidade 1.3: Passados Irregulares (Ir, Ser, Ter, Fazer)...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Mapeamento interno: Módulo 1 do A2, Lição 3 = week_number 5, lesson_number 3
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 5 AND lesson_number = 3 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 1.3 do A2 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa lote anterior para garantir integridade pura de 45 questões
    await client.query(`DELETE FROM questions WHERE lesson_id = $1;`, [licaoId]);

    let totalQuestoes = 45; 
    const questoesGeradas = [];
    
    for(let i = 1; i <= totalQuestoes; i++) {
      let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
      let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
      
      let dataObj = {};
      let enunciado = "Selecciona la opción que use correctamente el verbo irregular en pasado.";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Pontes cognitivas e quebra de portunhol bruto (Tipo 3)
      if(tipo === 3) {
        if(i % 3 === 0) {
          dataObj = { target_word: "EU FUI", options: ["eu fui", "eu voy", "eu fuia"] };
          respostaCorreta = "eu fui";
          exp = "Ponte cognitiva ideal: En portugués, al igual que en español, el pasado de 'Ir' y 'Ser' es exactamente idéntico ('Eu fui ao banco' / 'Eu fui um bom gerente').";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "EU TIVE", options: ["eu tive", "eu tivei", "eu tube"] };
          respostaCorreta = "eu tive";
          exp = "Quebra de portunhol: El pasado del verbo 'Ter' cambia la raíz radicalmente a 'tive'. Jamás uses 'tivei' ni arrastres la 'b' del español.";
        } else {
          dataObj = { target_word: "EU FIZ", options: ["eu fiz", "eu fize", "eu hice"] };
          respostaCorreta = "eu fiz";
          exp = "Verbo Fazer en primera persona del pasado. El cambio a 'fiz' (con sonido de Z/S suave al final) debe automatizarse desde el principio.";
        }
      } 
      // NÍVEL MÉDIO: Relatos de um Dia Corrido no Passado (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado del día corrido y completa el verbo irregular faltante.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Ontem eu tive que resolver muitos problemas na agência.", missing_word: "tive" };
          respostaCorreta = "tive";
          exp = "Uso de la locución obligatória 'ter que + infinitivo' en pasado en un contexto corporativo real.";
        } else {
          dataObj = { sentence: "Ele fez o relatório financeiro na semana passada.", missing_word: "fez" };
          respostaCorreta = "fez";
          exp = "Tercera persona del pasado del verbo Fazer ('ele fez'). Evita la confusión ortográfica o fonética.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Narrativas Complexas (Tipo 10)
      else {
        enunciado = "Escucha la secuencia ejecutiva en pasado e practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Eu fui ao escritório de manhã, fiz a reunião e tive resultados ótimos." };
          respostaCorreta = "Eu fui ao escritório de manhã, fiz a reunião e tive resultados ótimos.";
          exp = "Desafío total de fluidez. Une tres irregularidades críticas de primera persona ('fui', 'fiz', 'tive') en una sola línea temporal.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Eles foram muito gentis quando nós tivemos aquela dúvida sobre o contrato." };
          respostaCorreta = "Eles foram muito gentis quando nós tivemos aquela dúvida sobre o contrato.";
          exp = "Contraste avanzado: 'Eles foram' (Verbo Ser) y 'Nós tivemos' (Verbo Ter) aplicados a interacciones de negocios formales.";
        } else {
          dataObj = { speech_text: "Quem fez este planejamento estratégico? Ele foi o melhor do ano!" };
          respostaCorreta = "Quem fez este planejamento estratégico? Ele foi o melhor do ano!";
          exp = "Interacción corporativa refinada. Practica la interrogación con 'Quem fez' y el uso de 'foi' como adjetivación de éxito.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 1.3 do A2...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [LABIRINTO DOMINADO] Unidade 1.3 completamente carimbada e operacional!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 1.3 do A2:", err.message);
  } finally {
    await client.end();
  }
}

run();
