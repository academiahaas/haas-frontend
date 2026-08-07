const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 2.4: Cores, Roupas e Quantidades até 100...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Busca ou valida a lição correspondente no banco (Módulo 2, Unidade 4)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 2 AND lesson_number = 4 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 2.4 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa registros anteriores para garantir lote puro
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

      // NÍVEL FÁCIL: Vocabulário de Roupas e Concordância de Cores (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que complete correctamente la concordancia de género.";
        if(i % 3 === 0) {
          dataObj = { target_word: "CAMISA BRANCA", options: ["camisa branca", "camisa branco", "camisa blanca"] };
          respostaCorreta = "camisa branca";
          exp = "Concordancia obligatoria de género: El adjetivo de color debe concordar con el sustantivo femenino ('camisa branca'). Cuidado con la interferencia del español 'blanca'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "CALÇAS PRETAS", options: ["calças pretas", "calças negros", "calças pretos"] };
          respostaCorreta = "calças pretas";
          exp = "Práctica del plural y el color 'preto/preta' (negro/negra). La palabra 'calças' lleva la 'Ç' con sonido de 'S' limpia.";
        } else {
          dataObj = { target_word: "CINQUENTA", options: ["cinquenta", "cincuenta", "cincoenta"] };
          respostaCorreta = "cinquenta";
          exp = "Expansión numérica: El número 50 en portugués se escribe con 'Q' en la sílaba central ('cinquenta') y tiene un sonido nasal.";
        }
      } 
      // NÍVEL MÉDIO: Quantidades e Descrição de Vestimenta (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la cantidad o prenda que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Temos trinta casacos pretos no estoque.", missing_word: "trinta" };
          respostaCorreta = "trinta";
          exp = "Uso de números avanzados para el entorno comercial. El número 'trinta' (30) mantiene la vocal nasal limpia.";
        } else {
          dataObj = { sentence: "Ele está vestindo uma camisa azul hoje.", missing_word: "vestindo" };
          respostaCorreta = "vestindo";
          exp = "Estructura situacional para describir lo que alguien lleva puesto: 'está vestindo'.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Descrições Longas (Tipo 10)
      else {
        enunciado = "Escucha la descripción formal de vestimenta y practica tu fluidez en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "O diretor usa um terno cinza e uma gravata vermelha." };
          respostaCorreta = "O diretor usa um terno cinza e uma gravata vermelha.";
          exp = "Vocabulario corporativo de alta calidad. Practica el sonido de la 'V' en 'vermelha' (roja) y la 'LH' palatal.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Temos setenta caixas de roupas prontas para o envio." };
          respostaCorreta = "Temos setenta caixas de roupas prontas para o envio.";
          exp = "Frase comercial de alta demanda. Integra el número 'setenta' (70) con la reducción de vocales en 'roupas'.";
        } else {
          dataObj = { speech_text: "Ela comprou quarenta camisas brancas para a equipe." };
          respostaCorreta = "Ela comprou quarenta camisas brancas para a equipe.";
          exp = "Excelente combinación de número avanzado ('quarenta' - 40), sustantivo y la concordancia de color en plural femenino.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 2.4...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [CONCLUÍDO COM SUCESSO] Unidade 2.4 carimbada no sistema!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 2.4:", err.message);
  } finally {
    await client.end();
  }
}

run();
