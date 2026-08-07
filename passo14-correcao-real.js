const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Substituir a linha exata que o grep encontrou (linha 244)
code = code.replace(
  '<BotaoAula dataAulaIso="" linkMeet="" />',
  '<BotaoAula dataAulaIso="" linkMeet="" idiomaAtivo={idioma} />'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🔗 Conexão reativa injetada com sucesso na linha 244!');
