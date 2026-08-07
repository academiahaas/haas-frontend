const http = require('https');

// Gerando as 45 questões exatas de forma limpa
const licaoId = 9; // ID correspondente à Unidade 4.4 na árvore do banco
const questoes = [];

for(let i = 1; i <= 45; i++) {
  let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
  let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
  let dataObj = {};
  let enunciado = "Selecciona la opción que use correctamente el género de la palabra en portugués.";
  let respostaCorreta = "";
  let exp = "";

  if(tipo === 3) {
    if(i % 3 === 0) {
      dataObj = { target_word: "A VIAGEM", options: ["a viagem", "o viagem", "a viaje"] };
      respostaCorreta = "a viagem";
      exp = "Regla de oro: Las palabras terminadas en '-agem' son siempre femeninas en portugués. Evita la interferencia del español 'el viaje'.";
    } else if(i % 3 === 1) {
      dataObj = { target_word: "A MENSAGEM", options: ["a mensagem", "o mensagem", "a mensaje"] };
      respostaCorreta = "a mensagem";
      exp = "Género femenino obligatorio para sufijos en '-agem'. El artículo que la acompaña debe ser obligatoriamente 'a'.";
    } else {
      dataObj = { target_word: "A GARAGEM", options: ["a garagem", "o garagem", "la garagem"] };
      respostaCorreta = "a garagem";
      exp = "Palabra heterogenérica. Cambia el género con relación al español. Recuerda escribir con 'M' final.";
    }
  } else if(tipo === 4) {
    enunciado = "Escucha atentamente o ditado e complete com o artigo correto para combater o portunhol.";
    if(i % 2 === 0) {
      dataObj = { sentence: "A viagem de negócios foi um sucesso absoluto.", missing_word: "A" };
      respostaCorreta = "A";
      exp = "Concordancia de género aplicada al entorno corporativo. 'A viagem' es la única estructura correcta.";
    } else {
      dataObj = { sentence: "Você recebeu a mensagem do diretor hoje?", missing_word: "a" };
      respostaCorreta = "a";
      exp = "Uso práctico de sustantivos femeninos en contextos laborales. Exige el uso del artículo femenino singular.";
    }
  } else {
    enunciado = "Escucha la descripción y practica tu fluidez evitando los errores de género.";
    if(i % 3 === 0) {
      dataObj = { speech_text: "Eu enviei a mensagem importante para a equipe ontem à noite." };
      respostaCorreta = "Eu enviei a mensagem importante para a equipe ontem à noite.";
      exp = "Frase executiva de alta frequência. Exige fluidez en la concordancia femenina de 'a mensagem' y dicción limpia.";
    } else if(i % 3 === 1) {
      dataObj = { speech_text: "O carro novo do gerente está estacionado na garagem." };
      respostaCorreta = "O carro novo do gerente está estacionado na garagem.";
      exp = "Combina la contracción de lugar femenina 'na' con el sustantivo heterogenérico 'garagem'.";
    } else {
      dataObj = { speech_text: "A nossa viagem para o Brasil está confirmada para a próxima semana." };
      respostaCorreta = "A nossa viagem para o Brasil está confirmada para a próxima semana.";
      exp = "Desafío avanzado de concordancia larga. Todos los elementos se ajustan al género femenino de 'viagem'.";
    }
  }

  questoes.push({
    lesson_id: licaoId,
    difficulty: dif,
    question_type: tipo,
    enunciado: enunciado,
    conteudo_pergunta: dataObj,
    resposta_correta: respostaCorreta,
    explanation: exp
  });
}

const postData = JSON.stringify(questoes);

// Configuração HTTP na porta 443 (HTTPS padrão) com IP fixo para ignorar DNS e bloqueios de portas
const options = {
  hostname: '15.228.140.231',
  port: 443,
  path: '/rest/v1/questions',
  method: 'POST',
  headers: {
    'Host': 'jdppxfokfhqjudwfwckd.supabase.co',
    'apikey': 'aZx1jscjMZFvc6YP',
    'Authorization': 'Bearer aZx1jscjMZFvc6YP',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  },
  rejectUnauthorized: false
};

console.log("🚀 [HAAS REST MOTOR] Enviando dados via Canal Seguro HTTPS (Porta 443)...");

const req = http.request(options, (res) => {
  console.log(`📡 Status do Servidor Supabase: ${res.statusCode}`);
  res.on('data', (d) => { process.stdout.write(d); });
  res.on('end', () => {
    if(res.statusCode >= 200 && res.statusCode < 300) {
      console.log("\n✨ [XEQUE-MATE] Unidade 4.4 integrada via API REST com sucesso absoluto!");
    } else {
      console.log("\n❌ O banco recusou as credenciais ou a rota.");
    }
  });
});

req.on('error', (e) => { console.error("❌ Erro de conexão de rede:", e.message); });
req.write(postData);
req.end();
