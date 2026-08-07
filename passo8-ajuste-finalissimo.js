const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Ajustar o Badge com espaços literais ao redor dos dois pontos (image_1fd379.png / image_1fc879.png)
code = code.replace("BADGE : EXPLORER", "BADGE: {idioma === 'PT' ? 'EXPLORADOR' : idioma === 'ES' ? 'EXPLORADOR' : 'EXPLORER'}");
code = code.replace("BADGE :  EXPLORER", "BADGE: {idioma === 'PT' ? 'EXPLORADOR' : idioma === 'ES' ? 'EXPLORADOR' : 'EXPLORER'}");

// 2. Ajustar os botões do painel lateral (image_1fcb98.png / image_203153.png)
code = code.replace("EVALUATION FORM", "{t.evalBtn}");
code = code.replace("CALENDAR", "{t.calBtn}");

// 3. Ajustar as tags de métricas fixas abaixo do radar (image_1fcb5d.png / image_1fd397.png)
code = code.replace("LIST. +15%", "{t.insights[0]}");
code = code.replace("WRIT. +20%", "{t.insights[1]}");
code = code.replace("SPEAK PRACTICE", "{t.insights[2]}");

// 4. Garantir que a string parcial do progresso seja capturada de forma dinâmica (image_1fc897.png)
code = code.replace("PROGRESS MASTERY: 65%", "{t.mastery}");
code = code.replace("PROGRESSO MASTERY: 65%", "{t.mastery}");

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Tudo mapeado com precisão cirúrgica de pixels!');
