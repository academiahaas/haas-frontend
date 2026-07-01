const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Limpar a linha 150 do Badge aplicando a variável pura
code = code.replace("<span>{t.badge || 'BADGE: EXPLORER'}</span>", "<span>{t.badge}</span>");

// 2. Limpar a linha 156 do Mastery removendo as aspas incorretas
code = code.replace("<span>{t.mastery || '{t.mastery}'}</span>", "<span>{t.mastery}</span>");

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Raiz do problema corrigida com sucesso nas linhas exatas!');
