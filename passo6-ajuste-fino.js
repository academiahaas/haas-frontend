const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Grande Botão de Treino Central (image_203577.png)
// Substituição exata considerando a string mista de fábrica
code = code.replace("TRAIN NOW / RE-ACTIVATE AGORA", "{t.trainBtnRaw || 'TREINAR AGORA / REATIVAR JÁ'}");

// 2. Card Vermelho de Streak (image_203552.png)
// Capturar a palavra DAYS dinâmica ou estática ao lado do número
code = code.replace("DAYS", "{idioma === 'PT' ? 'DIAS' : idioma === 'ES' ? 'DÍAS' : 'DAYS'}");
code = code.replace("RETENTION STREAK", "{idioma === 'PT' ? 'RACHA DE RETENÇÃO' : idioma === 'ES' ? 'RACHA DE RETENCIÓN' : 'RETENTION STREAK'}");

// 3. Título do Gráfico de Radar (image_203519.png)
// Substituição exata do texto cinza superior do Radar
code = code.replace("RADAR PROFICIENCY CHART", "{t.radarTitle}");

// 4. Botões Laranja do Painel Lateral (image_203153.png)
// Caso o script anterior não tenha aplicado por diferenças de espaços internos
code = code.replace("EVALUATION FORM", "{t.evalBtn}");
code = code.replace("CALENDAR", "{t.calBtn}");

// 5. Baú de Erros Recorrentes - Conteúdo Interno (image_203131.png)
// Tradução dinâmica das categorias gramaticais fixas no componente
code = code.replace("Prepositions (High)", "{idioma === 'PT' ? 'Preposições (Alto)' : idioma === 'ES' ? 'Preposiciones (Alto)' : 'Prepositions (High)'}");
code = code.replace("Phrasal Verbs (Medium)", "{idioma === 'PT' ? 'Phrasal Verbs (Médio)' : idioma === 'ES' ? 'Phrasal Verbs (Medio)' : 'Phrasal Verbs (Medium)'}");

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Passo 6 aplicado: Últimos detalhes visuais corrigidos com sucesso!');
