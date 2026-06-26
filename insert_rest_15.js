const http = require('https');

const licaoId = 14; // Alinhado sequencialmente à árvore A2 no banco
const questoes = [];

for(let i = 1; i <= 45; i++) {
  let dif = i <= 15 ? "facil" : (i <= 30 ? "medio" : "dificil");
  let tipo = i <= 15 ? 3 : (i <= 30 ? 4 : 10); 
  let dataObj = {};
  let enunciado = "Selecciona la opción que estructure correctamente el relato integrado en pasado.";
  let respostaCorreta = "";
  let exp = "";

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
  } else if(tipo === 4) {
    enunciado = "Escucha atentamente el reporte de experiencias concluidas y completa la palavra que falta.";
    if(i % 2 === 0) {
      dataObj = { sentence: "Ontem eu fui ao banco e resolvi um problema com o analista.", missing_word: "fui" };
      respostaCorreta = "fui";
      exp = "Uso de verbo irregular de movimiento combinando procedencia y profesiones corporativas de género común.";
    } else {
      dataObj = { sentence: "Nós comemos no restaurante e depois conversamos com a diretora.", missing_word: "conversamos" };
      respostaCorreta = "conversamos";
      exp = "Secuencia de ações em passado plural. Combina um verbo em '-ER' e um verbo em '-AR'.";
    }
  } else {
    enunciado = "Escucha el relato integrado de nivel A2 y practica tu fluidez y pronunciación en el laboratorio.";
    if(i % 3 === 0) {
      dataObj = { speech_text: "Ontem eu fui ao escritório de manhã, falei com a gerente e terminei o relatório." };
      respostaCorreta = "Ontem eu fui ao escritório de manhã, falei com a gerente e terminei o relatório.";
      exp = "Xerife de nível: Amarra marcadores, verbos irregulares ('fui'), regulares ('falei', 'terminei') e títulos profissionais.";
    } else if(i % 3 === 1) {
      dataObj = { speech_text: "Nós tivemos uma reunião longa com os analistas e decidimos o novo plano." };
      respostaCorreta = "Nós tivemos uma reunião longa com os analistas e decidimos o novo plano.";
      exp = "Frase executiva complexa. Exige dicção perfeita em 'tivemos' (verbo irregular) y 'decidimos' (verbo regular en -IR).";
    } else {
      dataObj = { speech_text: "Você assistiu à apresentação que a nova diretora fez na semana passada?" };
      respostaCorreta = "Você assistiu à apresentação que a nova diretora fez na semana passada?";
      exp = "Estructura interrogativa de alto nivel que mezcla crasis, pasado de verbo en -IR, verbo irregular 'fazer' e indicador temporal.";
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
  rejectUnauthorized: false,
  timeout: 10000
};

console.log("🚀 [HAAS REST MOTOR A2] Injetando carga na Unidade 1.5 via Túnel HTTPS...");

const req = http.request(options, (res) => {
  console.log(`📡 Resposta da API: ${res.statusCode}`);
  res.on('end', () => {
    if(res.statusCode >= 200 && res.statusCode < 300) {
      console.log("✨ [SUCESSO TOTAL] Módulo 1 do A2 selado com sucesso absoluto!");
    }
  });
});

req.on('error', (e) => { console.error("❌ Erro de rede na porta 443:", e.message); });
req.write(postData);
req.end();
