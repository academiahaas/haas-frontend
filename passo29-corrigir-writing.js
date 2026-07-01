const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/components/ArenaQuiz.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Substituir o termo incorreto pelo padrão aceito pelo TypeScript/React
code = code.replace("writerMode: 'vertical-lr'", "writingMode: 'vertical-lr'");

fs.writeFileSync(filePath, code, 'utf8');
console.log('🧼 Sintaxe de CSS corrigida para writingMode!');
