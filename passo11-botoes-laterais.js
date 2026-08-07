const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Substituir os botões com a grafia exata encontrada no arquivo
code = code.replace(">Evaluation Form</button>", ">{t.evalBtn}</button>");
code = code.replace(">Calendar</button>", ">{t.calBtn}</button>");

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Botões laterais conectados com sucesso ao motor de tradução!');
