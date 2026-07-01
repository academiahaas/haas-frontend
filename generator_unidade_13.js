const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const connectionString = "postgres://postgres:aZx1jscjMZFvc6YP@db.jdppxfokfhqjudwfwckd.supabase.co:5432/postgres";

async function run() {
  console.log("🚀 [HAAS MOTOR] Corrigindo e gerando a Unidade 1.3: De Onde Você É? O Labirinto do R e do J...");
  
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const res = await client.query(`SELECT id FROM lessons WHERE week_number = 1 AND lesson_number = 3 LIMIT 1;`);
    
    if (res.rows.length === 0) {
      console.log("❌ Unidade 1.3 não encontrada na tabela 'lessons'.");
      return;
    }

    const licaoId = res.rows[0].id;
    
    // Limpa o erro anterior antes de injetar o conteúdo correto
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

      if(tipo === 3) {
        enunciado = "Selecciona la opción que represente la grafía correcta de la palabra.";
        if(i % 3 === 0) {
          dataObj = { target_word: "JANEIRA", options: ["Janeira", "Shaneira", "Haneira"] };
          respostaCorreta = "Janeira";
          exp = "La 'J' en portugués tiene un sonido suave y vibrante (como la 'Y' suave de 'ya' o el sonido de la 'J' en francés). Jamás suena raspada como la 'J' del español.";
        } else if(i % 3 === 1) {
          dataObj = { target_word: "RIO", options: ["Rio", "Jio", "Río"] };
          respostaCorreta = "Rio";
          exp = "La 'R' al inicio de una palabra en portugués se raspa en la garganta, sonando exactamente como la 'J' del español.";
        } else {
          dataObj = { target_word: "SOU", options: ["sou", "soy", "sô"] };
          respostaCorreta = "sou";
          exp = "Estructura oculta del Verbo Ser: Primera persona del presente del indicativo 'Eu sou'.";
        }
      } 
      else if(tipo === 4) {
        enunciado = "Escucha atentamente el dictado y completa la palabra que falta.";
        if(i % 2 === 0) {
          dataObj = { sentence: "De onde você é?", missing_word: "é" };
          respostaCorreta = "é";
          exp = "Estructura oculta del Verbo Ser: Segunda persona (Você é). Pregunta estándar de procedencia.";
        } else {
          dataObj = { sentence: "Nós somos de Bogotá.", missing_word: "somos" };
          respostaCorreta = "somos";
          exp = "Conjugación del Verbo Ser para la primera persona del plural (Nós somos) en presente.";
        }
      } 
      else {
        enunciado = "Escucha la frase de negocios y practica tu pronunciación en el laboratorio.";
        if(i % 3 === 0) {
          dataObj = { speech_text: "O gerente Jorge trabalha no Rio de Janeiro." };
          respostaCorreta = "O gerente Jorge trabalha no Rio de Janeiro.";
          exp = "Práctica avanzada del contraste: 'Rio' se raspa en la garganta, mientras que 'Jorge' y 'Janeiro' usan el sonido suave, vibrante y continuo de la 'J' portuguesa.";
        } else if(i % 3 === 1) {
          dataObj = { speech_text: "Eu sou engenheiro e trabalho com o senhor Jorge." };
          respostaCorreta = "Eu sou engenheiro e trabalho com o senhor Jorge.";
          exp = "Frase formal y profesional. Foco en el uso del verbo ser en presente y la pronunciación limpia de 'Jorge'.";
        } else {
          dataObj = { speech_text: "De onde vocês são? Nós somos da Colômbia." };
          respostaCorreta = "De onde vocês são? Nós somos da Colômbia.";
          exp = "Interacción real ejecutiva. Práctica de la concordancia formal y fluidez nativa.";
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

    console.log(`📥 Gravando lote CORRIGIDO de ${questoesGeradas.length} questões na Unidade 1.3...`);
    
    for (let q of questoesGeradas) {
      await client.query(
        `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [q.lesson_id, q.difficulty, q.question_type, q.enunciado, JSON.stringify(q.conteudo_pergunta), q.resposta_correta, q.explanation]
      );
    }

    console.log("✨ [PERFEITO] Unidade 1.3 revisada, corrigida e injetada com precisão absoluta!");

  } catch (err) {
    console.error("❌ Erro ao processar Unidade 1.3:", err.message);
  } finally {
    await client.end();
  }
}

run();
