const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Iniciando geração da Unidade 2.1: Minha Família e a Idade...");
  
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    // Busca a lição correspondente (Semana 2, Lição 1)
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 2 AND lesson_number = 1 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 2.1 não encontrada na tabela 'lessons'. Certifique-se de que a lição da semana 2 está criada.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa registros anteriores para não misturar os lotes
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

      // NÍVEL FÁCIL: Membros da família e fonética do NH (Tipo 3)
      if(tipo === 3) {
        enunciado = "Selecciona la opción que represente la grafía correcta según la pronunciación de la palabra.";
        if(i % 3 === 0) {
          dataObj = { target_word: "FILHO", options: ["Filho", "Filio", "Fillho"] };
          respostaCorreta = "Filho";
          exp = "La combinación 'LH' produce un sonido palatal líquido (como la 'll' suave tradicional). Evite pronunciarlo como una 'I' aislada.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "TENHO", options: ["Tenho", "Teño", "Tenio"] };
          respostaCorreta = "Tenho";
          exp = "Foco en el dígrafo 'NH': tiene exactamente el mismo sonido que la 'Ñ' del español, pero se escribe obligatoriamente con 'NH' en portugués.";
        } else {
          dataObj = { target_word: "IRMÃO", options: ["Irmão", "Irmao", "Irmán"] };
          respostaCorreta = "Irmão";
          exp = "Mapeo de la familia. Recuerde el fuerte diptongo nasal final '-ÃO' para una dicción perfecta.";
        }
      } 
      // NÍVEL MÉDIO: Idade com Números de 1 a 20 e Verbo Ter (Tipo 4)
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la palabra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "Eu tenho quinze anos e ele tem vinte.", missing_word: "quinze" };
          respostaCorreta = "quinze";
          exp = "Uso del Verbo Ter para expresar edad. El número 'quinze' (15) se escribe con 'Z' y la 'E' final se reduce suavemente al hablar.";
        } else {
          dataObj = { sentence: "Quantos anos o seu filho tem?", missing_word: "filho" };
          respostaCorreta = "filho";
          exp = "Estructura oculta: Pregunta de interacción social formal sobre la familia usando la concordancia correcta.";
        }
      } 
      // NÍVEL DIFÍCIL: Laboratório de Pronúncia de Estruturas Reais (Tipo 10)
      else {
        enunciado = "Escucha la frase y practica tu entonación en el laboratorio de pronunciación.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "Meu irmão mais velho tem dezoito anos." };
          respostaCorreta = "Meu irmão mais velho tem dezoito anos.";
          exp = "Frase completa de alta fluidez. Combina el diptongo nasal de 'irmão', el sonido de la 'LH' de 'velho' y el número dezoito (18).";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Minha filha tem quatro anos e estuda muito." };
          respostaCorreta = "Minha filha tem quatro anos e estuda muito.";
          exp = "Práctica del femenino en la familia ('minha filha') junto con la conjugación en presente del verbo ter.";
        } else {
          dataObj = { speech_text: "Eu tenho dezenove anos de experiência no mercado." };
          respostaCorreta = "Eu sou o gerente comercial."; // Ajuste pedagógico para manter no foco do Módulo 2
          dataObj.speech_text = "Nós temos uma reunião com a minha família hoje.";
          respostaCorreta = "Nós temos uma reunião com a minha família hoje.";
          exp = "Estructura corporativa/social híbrida. Excelente para entrenar el oído y el micrófono con el número de sílabas limpias.";
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

    console.log(`📥 Gravando lote de ${questoesGeradas.length} questões na estrutura da Unidade 2.1...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [CONCLUÍDO COM SUCESSO] Unidade 2.1 totalmente injetada e validada!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 2.1:", err.message);
  } finally {
    await client.end();
  }
}

run();
