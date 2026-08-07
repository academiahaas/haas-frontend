const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Corrigir frase em Caixa Alta do Streak (image_202576.png)
code = code.replace("DON'T LOSE YOUR HABITS TODAY!", "{t.streakSub}");

// 2. Corrigir Badge com espaçamento duplo literal (image_1fd3dd.png)
code = code.replace("BADGE :  EXPLORER", "BADGE: {idioma === 'PT' ? 'EXPLORADOR' : idioma === 'ES' ? 'EXPLORADOR' : 'EXPLORER'}");

// 3. Corrigir Insights do Radar em Caixa Alta (image_1fd397.png)
code = code.replace("LIST. +15%", "{t.insights[0]}");
code = code.replace("WRIT. +20%", "{t.insights[1]}");
code = code.replace("SPEAK PRACTICE", "{t.insights[2]}");

// 4. Mapear o Baú dinamicamente para os estados do React (image_1fd35d.png)
// Substitui os placeholders fixos que renderizavam os erros em inglês
code = code.replace(
  "<span>{erro1} ({peso1})</span>",
  "<span>{idioma === 'PT' ? (erro1 === 'Prepositions' ? 'Preposições' : erro1) : idioma === 'ES' ? (erro1 === 'Prepositions' ? 'Preposiciones' : erro1) : erro1} ({idioma === 'PT' ? (peso1 === 'High' ? 'Alto' : peso1) : idioma === 'ES' ? (peso1 === 'High' ? 'Alto' : peso1) : peso1})</span>"
);

code = code.replace(
  "<span>{erro2} ({peso2})</span>",
  "<span>{erro2} ({idioma === 'PT' ? (peso2 === 'Medium' ? 'Médio' : peso2) : idioma === 'ES' ? (peso2 === 'Medium' ? 'Medio' : peso2) : peso2})</span>"
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Passo 7 concluído! Detalhes finos alinhados com as imagens.');
