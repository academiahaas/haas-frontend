const https = require('https');
const fs = require('fs');

console.log("🚀 [HAAS MOTOR] Enviando a Unidade 2.2 através da porta de internet padrão...");

const sqlContent = fs.readFileSync('carga_unidade_22.sql', 'utf8');
const lines = sqlContent.split('\n');
const qs = [];

for (let l of lines) {
  if (l.includes('INSERT INTO')) {
    let match = l.match(/VALUES \((.+)\);/);
    if (match) {
      let parts = match[1].split(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/);
      let contentStr = parts[4].replace(/^'|'$/g, '').replace(/''/g, "'");
      qs.push({
        lesson_id: 15,
        difficulty: parts[1].replace(/'/g, ''),
        question_type: parseInt(parts[2]),
        enunciado: parts[3].replace(/^'|'$/g, '').replace(/''/g, "'"),
        conteudo_pergunta: JSON.parse(contentStr),
        resposta_correta: parts[5].replace(/^'|'$/g, '').replace(/''/g, "'"),
        explanation: parts[6].replace(/^'|'$/g, '').replace(/''/g, "'")
      });
    }
  }
}

const postData = JSON.stringify(qs);

const options = {
  hostname: 'jdppxfokfwqjudwfwckd.supabase.co',
  port: 443,
  path: '/rest/v1/questions',
  method: 'POST',
  headers: {
    'apikey': 'aZx1jscjMZFvc6YP',
    'Authorization': 'Bearer aZx1jscjMZFvc6YP',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  },
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    console.log("✨ [SUCESSO TOTAL] Unidade 2.2 salva com sucesso no banco!");
  } else {
    console.log("📡 Resposta do servidor: Código " + res.statusCode);
  }
});

req.on('error', (e) => {
  console.error("❌ Erro de conexão:", e.message);
});

req.write(postData);
req.end();
