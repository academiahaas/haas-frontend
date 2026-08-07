const { Client } = require('pg');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 2.2: Celular, Aplicativos e Tecnologia (Gerúndio)...");
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Mapeamento interno: Módulo 2 do A2, Lição 2 = week_number 6, lesson_number 2
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 6 AND lesson_number = 2 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 2.2 do A2 não encontrada na tabela 'lessons'.");
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
      let enunciado = "Selecciona la opción que use correctamente o gerúndio no contexto de tecnologia.";
      let respostaCorreta = "";
      let exp = "";

      // NÍVEL FÁCIL: Vocabulário Digital e Ações Simples na Tela (Tipo 3)
      if(tipo === 3) {
        if(i % 3 === 0) {
          dataObj = { target_word: "BAIXANDO", options: ["baixando", "baxando", "bajando"] };
          respostaCorreta = "baixando";
          exp = "Ponte fônica perfeita: O gerúndio de 'baixar' é 'baixando'. Cuidado com o espanhol 'bajando'.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "ESTOU MANDANDO", options: ["estou mandando", "estou enviando", "estoy mandando"] };
          respostaCorreta = "estou mandando";
          exp = "Linguagem cotidiana: 'Estou mandando um áudio' é a forma mais natural e usada por todas as idades no Brasil.";
        } else {
          dataObj = { target_word: "CARREGANDO", options: ["carregando", "carregando a bateria", "cargando"] };
          respostaCorreta = "carregando";
          exp = "Evite portunhol: O verbo em português é 'carregar', portanto o gerúndio correto é 'carregando'.";
        }
      } 
      // NÍVEL MÉDIO: Uso Prático no Cotidiano (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente a ação digital e complete com o verbo correto no gerúndio.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Espere um momento, o celular está baixando a atualização.", missing_word: "baixando" };
          respostaCorreta = "baixando";
          exp = "Uso clássico do gerúndio para ações contínuas que acontecem na tela do celular em tempo real.";
        } else {
          dataObj = { sentence: "Eu já estou ligando o wi-fi para não gastar os dados.", missing_word: "ligando" };
          respostaCorreta = "ligando";
          exp = "Vocabulário prático e útil: 'ligando o wi-fi'. Essencial tanto para o jovem quanto para o idoso.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia e Fluência Tecnológica (Tipo 10)
      else {
        enunciado = "Escucha la secuencia de ações digitais cotidianas e pratica tu fluidez no laboratório.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Estou mandando um áudio agora porque estou sem wi-fi no escritório." };
          respostaCorreta = "Estou mandando um áudio agora porque estou sem wi-fi no escritório.";
          exp = "Frase de alta conectividade do dia a dia. Une o gerúndio com conectores de causa práticos.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "O aplicativo está salvando as fotos enquanto o aparelho está carregando." };
          respostaCorreta = "O aplicativo está salvando as fotos enquanto o aparelho está carregando.";
          exp = "Desafio duplo de gerúndio ('salvando', 'carregando') conectado pela estrutura simultânea 'enquanto'.";
        } else {
          dataObj = { speech_text: "Você está enviando a mensagem pelo grupo ou no privado?" };
          respostaCorreta = "Você está enviando a mensagem pelo grupo ou no privado?";
          exp = "Estrutura interrogativa natural com gerúndio, focando em vocabulário de redes sociais corporativas e pessoais.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} conteúdos para a Unidade 2.2 do A2...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [TECNOLOGIA CONECTADA] Unidade 2.2 totalmente integrada e salva via Node!");

  } catch (err) {
    console.error("❌ Erro fatal na Unidade 2.2:", err.message);
  } finally {
    await client.end();
  }
}

run();
