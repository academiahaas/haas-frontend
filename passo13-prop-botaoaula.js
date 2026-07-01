const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/BotaoAula.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Modificar a assinatura da função para aceitar a prop 'idiomaAtivo' vinda do pai
code = code.replace(
  "export default function BotaoAula({ dataAulaIso = '', linkMeet = '' }) {",
  "export default function BotaoAula({ dataAulaIso = '', linkMeet = '', idiomaAtivo = '' }) {"
);

// 2. Interceptar a variável 'idioma' interna para usar a prop ativa se ela for fornecida
code = code.replace(
  "const t = textosIdiomas[idioma];",
  "const idiomaFinal = idiomaAtivo || idioma;\n  const t = textosIdiomas[idiomaFinal];"
);

// 3. Ajustar o formato da data exibida para também respeitar o idioma final injetado
code = code.replace(
  "return idioma === 'EN' ?",
  "return idiomaFinal === 'EN' ?"
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Componente BotaoAula preparado para receber o idioma dinamicamente!');
