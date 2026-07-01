const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Substituições cirúrgicas dos textos fixos da interface
code = code.replace("Hi, 👋 {aluno1}", "{t.welcome}, 👋 {aluno1}");
code = code.replace("LANGUAGE JOURNEY", "{t.journey}");
code = code.replace("Communicator 🌎", "{t.level} 🌎");
code = code.replace("MISSÃO DE TRILHA", "{t.missionTag}");
code = code.replace("TRAIN NOW / RE-ACTIVATE AGORA 🕹️", "{t.trainBtn}");
code = code.replace("RETENTION STREAK", "{t.streak}");
code = code.replace("DON'T LOSE YOUR HABITS TODAY!", "{t.streakSub}");
code = code.replace("RANKING POSITION", "{t.ranking}");
code = code.replace("NEXT REWARD BOX", "{t.nextReward}");
code = code.replace("RADAR PROFICIENCY CHART", "{t.radarTitle}");
code = code.replace("LEADERBOARD TOP 10", "{t.leaderboard}");
code = code.replace("EVALUATION FORM", "{t.evalBtn}");
code = code.replace("CALENDAR", "{t.calBtn}");
code = code.replace("RECURRING ERRORS CHEST", "{t.chestTitle}");
code = code.replace("CLEAR CHEST", "{t.clearBtn}");

// Mapeamento dos itens do Gráfico de Radar
code = code.replace("competenca: 'Fala'", "competenca: idioma === 'PT' ? 'Fala' : idioma === 'ES' ? 'Habla' : 'Speaking'");
code = code.replace("competenca: 'Escuta'", "competenca: idioma === 'PT' ? 'Escuta' : idioma === 'ES' ? 'Escucha' : 'Listening'");
code = code.replace("competenca: 'Gramática'", "competenca: idioma === 'PT' ? 'Gramática' : idioma === 'ES' ? 'Gramática' : 'Grammar'");
code = code.replace("competenca: 'Escrita'", "competenca: idioma === 'PT' ? 'Escrita' : idioma === 'ES' ? 'Escritura' : 'Writing'");
code = code.replace("competenca: 'Leitura'", "competenca: idioma === 'PT' ? 'Leitura' : idioma === 'ES' ? 'Lectura' : 'Reading'");

// Mapeamento dos Insights do Radar abaixo do gráfico
code = code.replace("List. +15%", "{t.insights[0]}");
code = code.replace("Writ. +20%", "{t.insights[1]}");
code = code.replace("Speak Practice", "{t.insights[2]}");

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Passo 4 aplicado: Interface totalmente conectada ao motor de idiomas!');
