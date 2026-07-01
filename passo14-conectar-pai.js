const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Encontrar onde o BotaoAula é chamado e injetar a prop do idioma do portal
code = code.replace(
  "<BotaoAula dataAulaIso={dataAula} linkMeet={linkMeet} />",
  "<BotaoAula dataAulaIso={dataAula} linkMeet={linkMeet} idiomaAtivo={idioma} />"
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🔗 Conexão de idioma entre página principal e BotaoAula realizada!');
