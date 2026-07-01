const fs = require('fs');

// Como o banco está instável, vamos fixar o ID da lição baseado na sequência lógica
const licaoId = 15; 

let sqlOutput = `-- Carga de Dados - Unidade 2.2 (A2)\n`;
sqlOutput += `DELETE FROM questions WHERE lesson_id = ${licaoId};\n\n`;

for(let i = 1; i <= 45; i++) {
  let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
  let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
  let dataObj = {};
  let enunciado = "Selecciona la opción que use correctamente o gerúndio no contexto de tecnologia.";
  let respostaCorreta = "";
  let exp = "";

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
  } else if(tipo === 4) {
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
  } else {
    enunciado = "Escucha la sequência de ações digitais cotidianas e pratica tu fluidez no laboratório.";
    if(i % 3 === 0) {
      dataObj = { speech_text: "Estou mandando um áudio agora porque estou sem wi-fi no escritório." };
      respostaCorreta = "Estou mandando um áudio agora porque estou sem wi-fi no escritório.";
      exp = "Frase de alta conectividade del dia a dia. Une o gerúndio com conectores de causa práticos.";
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

  const enunciadoEscaped = enunciado.replace(/'/g, "''");
  const conteudoEscaped = JSON.stringify(dataObj).replace(/'/g, "''");
  const respostaEscaped = respostaCorreta.replace(/'/g, "''");
  const expEscaped = exp.replace(/'/g, "''");

  sqlOutput += `INSERT INTO questions (lesson_id, difficulty, question_type, enunciado, conteudo_pergunta, resposta_correta, explanation) VALUES (${licaoId}, '${dif}', ${tipo}, '${enunciadoEscaped}', '${conteudoEscaped}', '${respostaEscaped}', '${expEscaped}');\n`;
}

fs.writeFileSync('carga_unidade_22.sql', sqlOutput);
console.log("✨ [SUCESSO LOCAL] Arquivo 'carga_unidade_22.sql' gerado com sucesso!");
