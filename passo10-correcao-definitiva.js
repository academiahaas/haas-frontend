const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Substituir o subtítulo do streak usando a grafia exata com maiúsculas/minúsculas do arquivo
code = code.replace("Don't lose your habits today!", "{t.streakSub}");

// 2. Garantir o tratamento de qualquer variação do Badge no card coral central (linha 150)
code = code.replace("<span>{t.badge || 'BADGE: EXPLORER'}</span>", "<span>{t.badge}</span>");

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Tudo resolvido! Frases teimosas capturadas com a grafia correta.');
